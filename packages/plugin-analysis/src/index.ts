import { Plugin } from "@ai16z/eliza";

import { scanTokenAction } from "./actions/scanToken.ts";
import { scanWalletAction } from "./actions/scanWallet.ts";

export * as actions from "./actions";

export const analysisPlugin: Plugin = {
    name: "analysis",
    description:
        "A plugin for Eliza that provides solana token and wallet analysis.",
    actions: [scanTokenAction, scanWalletAction],
    evaluators: [],
    providers: [],
};
