import { IAgentRuntime, elizaLogger } from "@ai16z/eliza";
import axios from "axios";
import { CryptoNews, FormattedNews, NewsResponse } from "../types";
import { BrowserService } from "./browser";

export class CryptoPanicService {
    private readonly baseUrl = "https://cryptopanic.com/api/pro/v1/posts/";
    private readonly authToken: string;
    private browserService: BrowserService;

    constructor() {
        const token = process.env.CRYPTOPANIC_API_KEY;
        if (!token) {
            throw new Error(
                "CRYPTOPANIC_API_KEY not found in environment variables"
            );
        }
        this.authToken = token;
        this.browserService = new BrowserService();
    }

    async fetchNews(
        currency: string = "SOL",
        filter: string | null = null
    ): Promise<NewsResponse> {
        elizaLogger.debug(
            `Fetching news for ${currency}${filter ? ` with filter ${filter}` : ""}`
        );
        const baseUrl = `${this.baseUrl}?auth_token=${this.authToken}&public=true&currencies=${currency}&metadata=true&kind=news&page=1`;
        const url = filter ? `${baseUrl}&filter=${filter}` : baseUrl;

        const response = await axios.get(url);
        elizaLogger.debug("API Response cryptopanic:", {
            count: response.data.count,
            next: response.data.next,
            results: response.data.results?.map((r) => ({
                title: r.title,
                published_at: r.published_at,
                currencies: r.currencies,
            })),
        });
        return response.data;
    }

    async formatNews(
        news: any[],
        currency: string,
        runtime: IAgentRuntime,
        maxCrawl: number
    ): Promise<FormattedNews[]> {
        const formattedNews: FormattedNews[] = [];
        let processedCount = 0;

        for (const item of news) {
            if (processedCount >= maxCrawl) break;

            const baseNews = {
                title: item.title,
                description: item.metadata?.description || "",
                url: item.url,
                published: item.published_at,
                relevance: item.votes?.positive || 0,
                likes: item.votes?.liked || 0,
                currency,
            };

            try {
                // Add delay between requests (2 seconds)
                if (processedCount > 0) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }

                const pageContent = await this.browserService.getPageContent(
                    item.url,
                    runtime
                );
                formattedNews.push({
                    ...baseNews,
                    fullContent: pageContent.bodyContent,
                });
            } catch (error) {
                elizaLogger.warn(
                    `Failed to crawl ${item.url}, using base content only:`,
                    error instanceof Error ? error.message : error
                );
                formattedNews.push({
                    ...baseNews,
                    fullContent: "",
                });
            }

            processedCount++;
        }

        return formattedNews;
    }

    private calculateRelevance(news: CryptoNews): number {
        const age =
            (Date.now() - new Date(news.published_at).getTime()) /
            (1000 * 60 * 60); // hours
        const engagement =
            news.votes.liked + news.votes.important + news.votes.saved;
        return engagement / Math.sqrt(age + 1); // decay factor
    }

    async cleanup() {
        await this.browserService.closeBrowser();
    }
}
