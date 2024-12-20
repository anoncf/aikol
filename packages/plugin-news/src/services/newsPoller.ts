import {
    IAgentRuntime,
    elizaLogger,
    getEmbeddingZeroVector,
    stringToUuid,
} from "@ai16z/eliza";
import { FormattedNews } from "../types";
import { CryptoPanicService } from "./cryptopanic";

export class NewsPollerService {
    private runtime: IAgentRuntime;
    private cryptoPanicService: CryptoPanicService;
    private isProcessing: boolean = false;
    private stopPolling: boolean = false;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        this.cryptoPanicService = new CryptoPanicService();
    }

    async start() {
        const handleNewsPollingLoop = () => {
            this.pollNews();
            setTimeout(
                handleNewsPollingLoop,
                Number(this.runtime.getSetting("NEWS_POLL_INTERVAL") || 600) *
                    1000 // Default to 10 minutes
            );
        };

        handleNewsPollingLoop();
        elizaLogger.log("News polling service started");
    }

    async stop() {
        this.stopPolling = true;
        await this.cryptoPanicService.cleanup();
    }

    private async pollNews() {
        if (this.isProcessing || this.stopPolling) {
            elizaLogger.log(
                "Already processing news or stopping, skipping poll"
            );
            return;
        }

        try {
            this.isProcessing = true;
            elizaLogger.log("Polling for new crypto news");

            // Get the last processed news timestamp
            const lastProcessed = await this.runtime.cacheManager.get<number>(
                "news/last_processed_timestamp"
            );

            // Fetch news for multiple currencies
            const currencies = ["BTC", "ETH", "SOL"]; // Can be configured via settings
            const allNews: FormattedNews[] = [];

            for (const currency of currencies) {
                const newsResponse =
                    await this.cryptoPanicService.fetchNews(currency);
                if (!newsResponse.results) continue;

                const formattedNews = await this.cryptoPanicService.formatNews(
                    newsResponse.results,
                    currency,
                    this.runtime,
                    5 // Process top 5 news per currency
                );

                allNews.push(...formattedNews);
            }

            // Filter out already processed news
            const newNews = allNews.filter(
                (news) =>
                    !lastProcessed ||
                    new Date(news.published).getTime() > lastProcessed
            );

            if (newNews.length === 0) {
                elizaLogger.log("No new news to process");
                return;
            }

            // Process and store each news item
            for (const news of newNews) {
                const roomId = stringToUuid("news-room");

                // Ensure room exists
                await this.runtime.ensureRoomExists(roomId);
                await this.runtime.ensureParticipantInRoom(
                    this.runtime.agentId,
                    roomId
                );

                // Create memory for the news
                await this.runtime.messageManager.createMemory({
                    id: stringToUuid(news.url),
                    userId: this.runtime.agentId,
                    agentId: this.runtime.agentId,
                    content: {
                        text: `${news.title}\n\n${news.description}\n\n${news.fullContent || ""}`,
                        url: news.url,
                        source: "cryptopanic",
                        metadata: {
                            relevance: news.relevance,
                            likes: news.likes,
                        },
                    },
                    roomId,
                    embedding: getEmbeddingZeroVector(),
                    createdAt: new Date(news.published).getTime(),
                });

                elizaLogger.log(`Stored news: ${news.title}`);
            }

            // Update last processed timestamp
            const latestTimestamp = Math.max(
                ...newNews.map((news) => new Date(news.published).getTime())
            );
            await this.runtime.cacheManager.set(
                "news/last_processed_timestamp",
                latestTimestamp
            );

            elizaLogger.log(`Processed ${newNews.length} new news items`);
        } catch (error) {
            elizaLogger.error("Error polling news:", error);
        } finally {
            this.isProcessing = false;
        }
    }
}
