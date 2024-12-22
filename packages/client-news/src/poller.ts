import {
    IAgentRuntime,
    MemoryManager,
    elizaLogger,
    stringToUuid,
} from "@ai16z/eliza";
import { CryptoPanicService } from "./services/cryptopanic";
import { FormattedNews } from "./types";

export class NewsPollerService {
    private runtime: IAgentRuntime;
    private cryptoPanicService: CryptoPanicService;
    private isProcessing: boolean = false;
    private stopPolling: boolean = false;
    private newsManager: MemoryManager;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        this.cryptoPanicService = new CryptoPanicService();
        this.newsManager = new MemoryManager({
            runtime,
            tableName: "news",
        });
    }

    private async debugNews() {
        const newsRoomId = stringToUuid("news-room");
        const recentNews = await this.newsManager.getMemories({
            roomId: newsRoomId,
            count: 10,
            start: 0,
            end: Date.now(),
            unique: false,
        });

        elizaLogger.debug("=== Last 10 News Items ===");
        recentNews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        recentNews.forEach((news, index) => {
            elizaLogger.debug(
                `[${index + 1}] ${news.content.text.split("\n")[0]}`
            );
            elizaLogger.debug(`    URL: ${news.content.url}`);
            elizaLogger.debug(
                `    Created: ${new Date(news.createdAt).toISOString()}`
            );
        });
        elizaLogger.debug("========================");
    }

    async start() {
        await this.debugNews();
        const handleNewsPollingLoop = () => {
            elizaLogger.debug("Starting news polling loop");
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
        elizaLogger.debug("Stopping news polling service");
        await this.cryptoPanicService.cleanup();
    }

    private async pollNews() {
        if (this.isProcessing || this.stopPolling) {
            elizaLogger.debug(
                `Skipping poll: ${this.isProcessing ? "already processing" : "stopping"}`
            );
            return;
        }

        this.isProcessing = true;
        try {
            elizaLogger.debug("Starting news poll");
            const lastProcessed = await this.runtime.cacheManager.get<number>(
                "news/last_processed_timestamp"
            );
            elizaLogger.debug(`Last processed timestamp: ${lastProcessed}`);

            const currencies = (
                this.runtime.getSetting("NEWS_CURRENCIES") || "SOL"
            ).split(",");
            elizaLogger.debug(
                `Fetching news for currencies: ${currencies.join(", ")}`
            );

            const allNews: FormattedNews[] = [];
            for (const currency of currencies) {
                try {
                    elizaLogger.debug(`Fetching news for ${currency}`);
                    const newsResponse =
                        await this.cryptoPanicService.fetchNews(currency);
                    if (!newsResponse.results) {
                        elizaLogger.warn(`No results for ${currency}`);
                        continue;
                    }
                    elizaLogger.debug(
                        `Got ${newsResponse.results.length} results for ${currency}`
                    );

                    const formattedNews =
                        await this.cryptoPanicService.formatNews(
                            newsResponse.results,
                            currency,
                            this.runtime,
                            Number(
                                this.runtime.getSetting(
                                    "NEWS_MAX_PER_CURRENCY"
                                ) || 20
                            )
                        );
                    elizaLogger.debug(
                        `Formatted ${formattedNews.length} news items for ${currency} (${formattedNews.filter((n) => n.fullContent).length} with full content)`
                    );
                    allNews.push(...formattedNews);
                } catch (error) {
                    elizaLogger.error(
                        `Error processing currency ${currency}:`,
                        error instanceof Error ? error.stack : error
                    );
                }
            }

            const newNews = allNews.filter(
                (news) =>
                    !lastProcessed ||
                    new Date(news.published).getTime() > lastProcessed
            );

            elizaLogger.debug(`Found ${newNews.length} new news items`);
            if (newNews.length === 0) {
                elizaLogger.log("No new news to process");
                return;
            }

            for (const news of allNews) {
                try {
                    const roomId = stringToUuid("news-room");
                    await this.runtime.ensureRoomExists(roomId);
                    await this.runtime.ensureParticipantInRoom(
                        this.runtime.agentId,
                        roomId
                    );

                    if (!news.title) {
                        elizaLogger.warn(`No title for news item ${news.url}`);
                        continue;
                    }

                    const textToEmbed = `${news.title}\n\n${news.description}\n\n${
                        news.fullContent || ""
                    }`;

                    const newsMemory =
                        await this.newsManager.addEmbeddingToMemory({
                            id: stringToUuid(news.url + "-" + news.published),
                            userId: this.runtime.agentId,
                            agentId: this.runtime.agentId,
                            content: {
                                text: textToEmbed,
                                url: news.url,
                                source: "cryptopanic",
                                metadata: {
                                    relevance: news.relevance,
                                    likes: news.likes,
                                    published: news.published,
                                },
                            },
                            roomId,
                            createdAt: new Date(news.published).getTime(),
                        });

                    await this.newsManager.createMemory(newsMemory, true);
                    elizaLogger.log(`Stored news: ${news.title}`);
                } catch (error) {
                    elizaLogger.error(
                        `Error storing news item ${news.url}:`,
                        error instanceof Error ? error.stack : error
                    );
                }
            }

            const latestTimestamp = Math.max(
                ...allNews.map((news) => new Date(news.published).getTime())
            );
            await this.runtime.cacheManager.set(
                "news/last_processed_timestamp",
                latestTimestamp
            );
            elizaLogger.log(`Processed ${newNews.length} new news items`);

            await this.debugNews();
        } catch (error) {
            elizaLogger.error(
                "Error polling news:",
                error instanceof Error ? error.stack : error,
                "\nFull error object:",
                JSON.stringify(error, null, 2)
            );
        } finally {
            this.isProcessing = false;
        }
    }
}
