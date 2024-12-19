import { IAgentRuntime } from "@ai16z/eliza";
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
        filter: string = "rising"
    ): Promise<NewsResponse> {
        const response = await axios.get(
            `${this.baseUrl}?auth_token=${this.authToken}&currencies=${currency}&filter=${filter}&metadata=true`
        );
        return response.data;
    }

    async formatNews(
        news: CryptoNews[],
        targetCurrency: string,
        runtime: IAgentRuntime,
        maxCrawl: number = 3 // Limit number of articles to crawl
    ): Promise<FormattedNews[]> {
        const filteredNews = news
            .filter((item) =>
                item.currencies.some((curr) => curr.code === targetCurrency)
            )
            .map((news) => ({
                title: news.title,
                description: news.metadata.description,
                published: news.published_at,
                url: news.url,
                likes: news.votes.liked,
                relevance: this.calculateRelevance(news),
            }))
            .sort((a, b) => b.relevance - a.relevance);

        // Take top N articles and fetch their full content
        const topNews = filteredNews.slice(0, maxCrawl);

        // Fetch full content for each article in parallel
        const newsWithContent = await Promise.all(
            topNews.map(async (news) => {
                try {
                    const fullContent =
                        await this.browserService.getPageContent(
                            news.url,
                            runtime
                        );
                    return {
                        ...news,
                        fullContent,
                    };
                } catch (error) {
                    console.error(
                        `Error fetching content for ${news.url}:`,
                        error
                    );
                    return news;
                }
            })
        );

        return newsWithContent;
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

export const cryptoPanicService = new CryptoPanicService();
