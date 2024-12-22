import { Plugin } from "@ai16z/eliza";

import { scanTokenAction } from "./actions/scanToken.ts";
import { scanWalletAction } from "./actions/scanWallet.ts";
import { rulesProvider } from "./providers/rules.ts";
import { trendingTokensProvider } from "./providers/trendingTokens.ts";

export * as actions from "./actions";
export * as providers from "./providers";

export const analysisPlugin: Plugin = {
    name: "analysis",
    description:
        "A plugin for Eliza that provides solana token and wallet analysis.",
    actions: [scanWalletAction, scanTokenAction],
    evaluators: [],
    providers: [rulesProvider, trendingTokensProvider],
};
