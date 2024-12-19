import {
    generateText,
    IAgentRuntime,
    IBrowserService,
    ModelClass,
    parseJSONObjectFromText,
    Service,
    ServiceType,
    settings,
    stringToUuid,
    trimTokens,
} from "@ai16z/eliza";
import { PlaywrightBlocker } from "@cliqz/adblocker-playwright";
import CaptchaSolver from "capsolver-npm";
import { Browser, BrowserContext, chromium, errors, Page } from "playwright";

const MAX_RETRIES = 3;
const PAGE_TIMEOUT = 30000; // 30 seconds
const MAX_CONTENT_LENGTH = 100000;

async function generateSummary(
    runtime: IAgentRuntime,
    text: string
): Promise<{ title: string; description: string }> {
    text = trimTokens(text, MAX_CONTENT_LENGTH, "gpt-4o-mini");

    const prompt = `Please generate a concise summary for the following text:

  Text: """
  ${text}
  """

  Respond with a JSON object in the following format:
  \`\`\`json
  {
    "title": "Generated Title",
    "summary": "Generated summary and/or description of the text"
  }
  \`\`\``;

    const response = await generateText({
        runtime,
        context: prompt,
        modelClass: ModelClass.SMALL,
    });

    const parsedResponse = parseJSONObjectFromText(response);

    if (parsedResponse) {
        return {
            title: parsedResponse.title,
            description: parsedResponse.summary,
        };
    }

    return {
        title: "",
        description: "",
    };
}

type PageContent = {
    title: string;
    description: string;
    bodyContent: string;
};

export class BrowserService extends Service implements IBrowserService {
    private browser: Browser | undefined;
    private context: BrowserContext | undefined;
    private blocker: PlaywrightBlocker | undefined;
    private captchaSolver: CaptchaSolver;
    private cacheKey = "content/browser";
    private activePages: Set<Page> = new Set();

    static serviceType: ServiceType = ServiceType.BROWSER;

    constructor() {
        super();
        this.browser = undefined;
        this.context = undefined;
        this.blocker = undefined;
        this.captchaSolver = new CaptchaSolver(
            settings.CAPSOLVER_API_KEY || ""
        );
    }

    async initialize() {
        await this.initializeBrowser();
    }

    async initializeBrowser() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    "--disable-dev-shm-usage",
                    "--block-new-web-contents",
                    "--disable-gpu",
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                ],
            });

            const platform = process.platform;
            const userAgent = this.getUserAgent(platform);

            this.context = await this.browser.newContext({
                userAgent,
                acceptDownloads: false,
                bypassCSP: true,
                ignoreHTTPSErrors: true,
                javaScriptEnabled: true,
                viewport: { width: 1920, height: 1080 },
            });

            this.blocker =
                await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
        }
    }

    private getUserAgent(platform: string): string {
        const agents = {
            darwin: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            win32: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        };
        return agents[platform] || agents.linux;
    }

    async closeBrowser() {
        // Close all active pages
        for (const page of this.activePages) {
            try {
                await page.close();
            } catch (error) {
                console.error("Error closing page:", error);
            }
        }
        this.activePages.clear();

        if (this.context) {
            await this.context.close();
            this.context = undefined;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }
    }

    private async withRetry<T>(
        operation: () => Promise<T>,
        retries = MAX_RETRIES
    ): Promise<T> {
        let lastError: Error;
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (error instanceof errors.TimeoutError) {
                    console.warn(`Attempt ${i + 1} timed out, retrying...`);
                    continue;
                }
                throw error;
            }
        }
        throw lastError;
    }

    private async extractPageContent(page: Page): Promise<string> {
        return await page.evaluate(() => {
            // Remove unwanted elements
            const selectorsToRemove = [
                "script",
                "style",
                "noscript",
                "iframe",
                "nav",
                "footer",
                "header",
                '[role="banner"]',
                '[role="navigation"]',
                '[role="complementary"]',
                '[role="contentinfo"]',
                ".cookie-banner",
                ".advertisement",
                ".social-share",
            ];

            selectorsToRemove.forEach((selector) => {
                document
                    .querySelectorAll(selector)
                    .forEach((el) => el.remove());
            });

            // Get main content
            const mainContent = document.querySelector(
                'main, article, [role="main"]'
            );
            if (mainContent) {
                return mainContent.textContent;
            }

            // Fallback to body content
            return document.body.textContent;
        });
    }

    async getPageContent(
        url: string,
        runtime: IAgentRuntime
    ): Promise<PageContent> {
        await this.initializeBrowser();
        return await this.withRetry(() => this.fetchPageContent(url, runtime));
    }

    private getCacheKey(url: string): string {
        return stringToUuid(url);
    }

    private async fetchPageContent(
        url: string,
        runtime: IAgentRuntime
    ): Promise<PageContent> {
        const cacheKey = this.getCacheKey(url);
        const cached = await runtime.cacheManager.get<{
            url: string;
            content: PageContent;
        }>(`${this.cacheKey}/${cacheKey}`);

        if (cached) {
            return cached.content;
        }

        let page: Page | undefined;

        try {
            if (!this.context) {
                console.log(
                    "Browser context not initialized. Call initializeBrowser() first."
                );
            }

            page = await this.context.newPage();

            // Enable stealth mode
            await page.setExtraHTTPHeaders({
                "Accept-Language": "en-US,en;q=0.9",
            });

            // Apply ad blocker
            if (this.blocker) {
                await this.blocker.enableBlockingInPage(page);
            }

            const response = await page.goto(url, {
                waitUntil: "networkidle",
                timeout: PAGE_TIMEOUT,
            });

            if (!response) {
                console.log("Failed to load the page");
            }

            if (response.status() === 403 || response.status() === 404) {
                return await this.tryAlternativeSources(url, runtime);
            }

            // Check for CAPTCHA
            const captchaDetected = await this.detectCaptcha(page);
            if (captchaDetected) {
                await this.solveCaptcha(page, url);
            }
            const documentTitle = await page.evaluate(() => document.title);
            const bodyContent = await this.extractPageContent(page);
            const { title: parsedTitle, description } = await generateSummary(
                runtime,
                documentTitle + "\n" + bodyContent
            );
            const content = { title: parsedTitle, description, bodyContent };
            await runtime.cacheManager.set(`${this.cacheKey}/${cacheKey}`, {
                url,
                content,
            });
            return content;
        } catch (error) {
            console.error("Error:", error);
            return {
                title: url,
                description: "Error, could not fetch content",
                bodyContent: "",
            };
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

    private async detectCaptcha(page: Page): Promise<boolean> {
        const captchaSelectors = [
            'iframe[src*="captcha"]',
            'div[class*="captcha"]',
            "#captcha",
            ".g-recaptcha",
            ".h-captcha",
        ];

        for (const selector of captchaSelectors) {
            const element = await page.$(selector);
            if (element) return true;
        }

        return false;
    }

    private async solveCaptcha(page: Page, url: string): Promise<void> {
        try {
            const hcaptchaKey = await this.getHCaptchaWebsiteKey(page);
            if (hcaptchaKey) {
                const solution = await this.captchaSolver.hcaptchaProxyless({
                    websiteURL: url,
                    websiteKey: hcaptchaKey,
                });
                await page.evaluate((token) => {
                    // eslint-disable-next-line
                    // @ts-ignore
                    window.hcaptcha.setResponse(token);
                }, solution.gRecaptchaResponse);
                return;
            }

            const recaptchaKey = await this.getReCaptchaWebsiteKey(page);
            if (recaptchaKey) {
                const solution = await this.captchaSolver.recaptchaV2Proxyless({
                    websiteURL: url,
                    websiteKey: recaptchaKey,
                });
                await page.evaluate((token) => {
                    // eslint-disable-next-line
                    // @ts-ignore
                    document.getElementById("g-recaptcha-response").innerHTML =
                        token;
                }, solution.gRecaptchaResponse);
            }
        } catch (error) {
            console.error("Error solving CAPTCHA:", error);
        }
    }

    private async getHCaptchaWebsiteKey(page: Page): Promise<string> {
        return page.evaluate(() => {
            const hcaptchaIframe = document.querySelector(
                'iframe[src*="hcaptcha.com"]'
            );
            if (hcaptchaIframe) {
                const src = hcaptchaIframe.getAttribute("src");
                const match = src?.match(/sitekey=([^&]*)/);
                return match ? match[1] : "";
            }
            return "";
        });
    }

    private async getReCaptchaWebsiteKey(page: Page): Promise<string> {
        return page.evaluate(() => {
            const recaptchaElement = document.querySelector(".g-recaptcha");
            return recaptchaElement
                ? recaptchaElement.getAttribute("data-sitekey") || ""
                : "";
        });
    }

    private async tryAlternativeSources(
        url: string,
        runtime: IAgentRuntime
    ): Promise<{ title: string; description: string; bodyContent: string }> {
        // Try Internet Archive
        const archiveUrl = `https://web.archive.org/web/${url}`;
        try {
            return await this.fetchPageContent(archiveUrl, runtime);
        } catch (error) {
            console.error("Error fetching from Internet Archive:", error);
        }

        // Try Google Search as a last resort
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        try {
            return await this.fetchPageContent(googleSearchUrl, runtime);
        } catch (error) {
            console.error("Error fetching from Google Search:", error);
            console.error("Failed to fetch content from alternative sources");
            return {
                title: url,
                description:
                    "Error, could not fetch content from alternative sources",
                bodyContent: "",
            };
        }
    }
}
