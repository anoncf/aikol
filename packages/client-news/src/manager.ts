import { IAgentRuntime, elizaLogger } from "@ai16z/eliza";
import { NewsPollerService } from "./poller";

export class NewsManager {
    poller: NewsPollerService;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        this.poller = new NewsPollerService(runtime);
    }

    async start() {
        await this.validateConfig();
        await this.poller.start();
        await this.runtime.cacheManager.set("newsManager", { active: true });
    }

    async stop() {
        await this.poller.stop();
        await this.runtime.cacheManager.set("newsManager", { active: false });
    }

    private async validateConfig() {
        const apiKey = this.runtime.getSetting("CRYPTOPANIC_API_KEY");
        if (!apiKey) {
            throw new Error("CRYPTOPANIC_API_KEY not found in settings");
        }

        // Validate other settings
        const pollInterval = Number(
            this.runtime.getSetting("NEWS_POLL_INTERVAL") || 600
        );
        if (isNaN(pollInterval) || pollInterval < 60) {
            // Minimum 1 minute
            throw new Error(
                "Invalid NEWS_POLL_INTERVAL setting. Must be at least 60 seconds."
            );
        }

        elizaLogger.log("News client configuration validated");
    }
}
