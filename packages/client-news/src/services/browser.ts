import { IAgentRuntime } from "@ai16z/eliza";
import { PlaywrightBlocker } from "@cliqz/adblocker-playwright";
import CaptchaSolver from "capsolver-npm";
import { Browser, BrowserContext, chromium } from "playwright";

export class BrowserService {
    private browser: Browser | undefined;
    private context: BrowserContext | undefined;
    private blocker: PlaywrightBlocker | undefined;
    private captchaSolver: CaptchaSolver;

    constructor() {
        this.browser = undefined;
        this.context = undefined;
        this.blocker = undefined;
        this.captchaSolver = new CaptchaSolver(
            process.env.CAPSOLVER_API_KEY || ""
        );
    }

    private async initializeBrowser() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: ["--disable-dev-shm-usage", "--block-new-web-contents"],
            });

            const platform = process.platform;
            let userAgent = "";
            switch (platform) {
                case "darwin":
                    userAgent =
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
                    break;
                case "win32":
                    userAgent =
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
                    break;
                default:
                    userAgent =
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
            }

            this.context = await this.browser.newContext({
                userAgent,
                acceptDownloads: false,
            });

            this.blocker =
                await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
        }
    }

    async getPageContent(url: string, runtime: IAgentRuntime): Promise<string> {
        try {
            await this.initializeBrowser();
            const page = await this.context.newPage();

            if (this.blocker) {
                await this.blocker.enableBlockingInPage(page);
            }

            await page.goto(url, { waitUntil: "networkidle" });

            // Extract the main content
            const content = await page.evaluate(() => {
                // Remove unwanted elements
                const elementsToRemove = document.querySelectorAll(
                    "header, footer, nav, script, style, iframe, ads"
                );
                elementsToRemove.forEach((el) => el.remove());

                // Get the main content
                const article =
                    document.querySelector("article") || document.body;
                return article.textContent.trim();
            });

            await page.close();
            return content;
        } catch (error) {
            console.error(`Error fetching content from ${url}:`, error);
            return "";
        }
    }

    async cleanup() {
        if (this.context) {
            await this.context.close();
            this.context = undefined;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }
    }
}
