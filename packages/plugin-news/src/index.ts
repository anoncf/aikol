import { Plugin } from "@ai16z/eliza";
import { newsAction } from "./actions/news";

export * as actions from "./actions/news";

export const newsPlugin: Plugin = {
    name: "news",
    description: "Plugin for fetching and discussing crypto news",
    actions: [newsAction],
    evaluators: [],
    providers: [],
};
