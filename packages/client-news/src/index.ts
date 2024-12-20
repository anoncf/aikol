import { Client, IAgentRuntime, elizaLogger } from "@ai16z/eliza";
import { NewsManager } from "./manager";

export const NewsClientInterface: Client = {
    async start(runtime: IAgentRuntime) {
        elizaLogger.log("News client started");

        const manager = new NewsManager(runtime);
        await manager.start();

        return manager;
    },

    async stop(runtime: IAgentRuntime) {
        const state = await runtime.cacheManager.get<{ active: boolean }>(
            "newsManager"
        );
        if (state?.active) {
            const manager = new NewsManager(runtime);
            await manager.stop();
        }
    },
};

export default NewsClientInterface;
