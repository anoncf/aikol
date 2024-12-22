import { IAgentRuntime, Provider, elizaLogger } from "@ai16z/eliza";

const responseRules = {
    formatting: ["RESPONSE SIZE - get straight to the point, no fluff"],
    tokenInfo: [
        "ALWAYS use the token symbol if defined",
        "ALWAYS finish your message with the chart dexscreener link if defined",
        "ALWAYS use the token address inside the dexscreener link",
    ],
    intentHandling: [
        "If user asks for help or uses /start or /help, respond with skills and capabilities list",
        "If user asks for more info about last analysis, provide raw data analysis of the token",
        "If a MUST ASK is detected, focus answer only on missing information",
        "If a MUST DO is detected, focus answer only on missing information",
    ],
};

export const rulesProvider: Provider = {
    get: async (_runtime: IAgentRuntime) => {
        try {
            // Combine all rules
            const allRules = [
                ...responseRules.formatting,
                ...responseRules.tokenInfo,
                ...responseRules.intentHandling,
            ];

            const rulesReminder = `
# RESPONSE RULES:
${allRules.map((rule) => `• ${rule}`).join("\n")}`;

            elizaLogger.debug("Applied rules:", rulesReminder);
            return rulesReminder;
        } catch (error) {
            elizaLogger.error("Rules provider error:", error);
            return "MUST FOLLOW: Provide concise token information without emojis or markdown, always include dexscreener links.";
        }
    },
};
