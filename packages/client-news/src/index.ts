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
        const manager =
            await runtime.cacheManager.get<NewsManager>("newsManager");
        if (manager) {
            await manager.stop();
        }
    },
};

export default NewsClientInterface;
