import {
    Action,
    ActionExample,
    composeContext,
    generateMessageResponse,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    messageCompletionFooter,
    ModelClass,
    State,
} from "@ai16z/eliza";
import { cryptoPanicService } from "../services/cryptopanic";

const messageHandlerTemplate =
    `
# Task: Generate a response about crypto news
About {{agentName}}:
{{bio}}
{{lore}}
{{knowledge}}

News Data:
{{newsData}}

Detailed Content:
{{detailedContent}}

Recent Messages:
{{recentMessages}}

# Instructions: Write a response discussing the news in an engaging way, focusing on the most relevant and recent developments. Use the detailed content to provide more in-depth insights when available.
` + messageCompletionFooter;

function determineNewsFilter(text: string): string {
    const filters = {
        rising: ["rising", "trending", "going up"],
        hot: ["hot", "popular", "trending"],
        bullish: ["bullish", "positive", "optimistic"],
        bearish: ["bearish", "negative", "pessimistic"],
        important: ["important", "significant", "major"],
        saved: ["saved", "bookmarked"],
        lol: ["funny", "lol", "hilarious"],
    };

    for (const [filter, keywords] of Object.entries(filters)) {
        if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
            return filter;
        }
    }

    return "rising"; // default filter
}

function determineCurrency(text: string): string {
    const currencies = {
        SOL: ["solana", "sol"],
        BTC: ["bitcoin", "btc"],
        ETH: ["ethereum", "eth"],
    };

    for (const [currency, keywords] of Object.entries(currencies)) {
        if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
            return currency;
        }
    }

    return "SOL"; // default currency
}

export const newsAction: Action = {
    name: "CRYPTO_NEWS",
    similes: ["NEWS", "UPDATES", "MARKET_NEWS"],
    description:
        "Provide crypto news updates based on user request. Use when users ask about market news, updates, or specific crypto trends.",
    validate: async (_runtime: IAgentRuntime, message: Memory) => {
        const newsKeywords = ["news", "update", "happening", "trend", "market"];
        return newsKeywords.some((keyword) =>
            message.content.text.toLowerCase().includes(keyword)
        );
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        const filter = determineNewsFilter(message.content.text);
        const currency = determineCurrency(message.content.text);

        try {
            const newsData = await cryptoPanicService.fetchNews(
                currency,
                filter
            );
            const formattedNews = await cryptoPanicService.formatNews(
                newsData.results,
                currency,
                runtime,
                3 // Fetch detailed content for top 3 articles
            );

            // Format detailed content for template
            const detailedContent = formattedNews
                .filter((news) => news.fullContent)
                .map(
                    (news) => `
Article: ${news.title}
${news.fullContent?.description || ""}
${news.fullContent?.bodyContent ? "Full content: " + news.fullContent.bodyContent.slice(0, 1000) + "..." : ""}
-------------------
                `
                )
                .join("\n");

            const context = composeContext({
                state: {
                    ...state,
                    newsData: JSON.stringify(formattedNews, null, 2),
                    detailedContent,
                },
                template: messageHandlerTemplate,
            });

            const response = await generateMessageResponse({
                runtime,
                context,
                modelClass: ModelClass.LARGE,
            });

            await callback(response);

            // Cleanup browser resources
            await cryptoPanicService.cleanup();

            return response;
        } catch (error) {
            console.error("Error fetching crypto news:", error);
            await cryptoPanicService.cleanup();
            return {
                text: "I apologize, but I'm having trouble accessing the latest crypto news at the moment.",
                action: "NONE",
            };
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: { text: "What's the latest news about Solana?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "According to recent news, Solana has seen significant growth in developer activity...",
                    action: "CRYPTO_NEWS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: { text: "Any bullish news for SOL?" },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Yes! There are several positive developments for Solana...",
                    action: "CRYPTO_NEWS",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
