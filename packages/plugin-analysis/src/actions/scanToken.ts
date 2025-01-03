import {
    Action,
    Content,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";
import { isAxiosError } from "axios";
import { TopWalletsAPI } from "../services/topwallets-api";
import { Source, TokenResponse } from "../types";
import { formatNumber } from "../utils/analysis";

function getMedalEmoji(index: number): string {
    switch (index) {
        case 0:
            return "🥇";
        case 1:
            return "🥈";
        case 2:
            return "🥉";
        default:
            return "•";
    }
}

function formatWalletName(
    wallet: TokenResponse["data"]["topWallets"][0]
): string {
    const name =
        wallet.name ||
        wallet.address.slice(0, 4) + "..." + wallet.address.slice(-4);
    return wallet.type === "kols" ? `⭐ ${name}` : name;
}

export const scanTokenAction: Action = {
    name: "SCAN_TOKEN",
    similes: [
        "CHECK_TOKEN",
        "ANALYZE_TOKEN",
        "GET_TOKEN_INFO",
        "TOKEN_ANALYSIS",
    ],
    description:
        "Analyze a Solana token to get detailed price, liquidity, and risk metrics",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const text = (message.content as Content).text;
        const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

        if (!text || typeof text !== "string") {
            return false;
        }

        return (
            solanaAddressRegex.test(text) ||
            /\$[A-Za-z]+/i.test(text) ||
            /token|price|analysis/i.test(text)
        );
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown } = {},
        callback?: HandlerCallback
    ): Promise<boolean> => {
        if (!callback) {
            throw new Error("Callback is required for scanToken action");
        }

        const source = state.source as Source;
        const text = (message.content as Content).text;
        const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
        const matches = text.match(solanaAddressRegex);

        elizaLogger.debug("Processing scanToken request", {
            text,
            matches,
            hasMatches: !!matches?.length,
        });

        if (!matches?.length) {
            await callback({
                text: "I couldn't find a valid token address. Please provide a valid Solana token address.",
            });
            return true;
        }

        const address = matches[0];

        try {
            const api = TopWalletsAPI.getInstance();
            const response = await api.getTokenInfo(address);
            const tokenData = response.data;

            elizaLogger.debug("Token data received", {
                address,
                symbol: tokenData.symbol,
                hasPrice: !!tokenData.price,
                hasLiquidity: !!tokenData.liquidity,
                hasSocial: !!tokenData.social,
            });

            let analysisText = `**${tokenData.name}** ($${tokenData.symbol})\n`;
            analysisText += `├ ${address}\n`;

            // Add days since creation if available
            const daysAgo = tokenData.pairCreatedAt
                ? Math.floor(
                      (Date.now() - tokenData.pairCreatedAt) /
                          (1000 * 60 * 60 * 24)
                  )
                : null;
            analysisText += `└ 🟣 #SOL${daysAgo ? ` | ${daysAgo}d` : ""}\n\n`;

            analysisText += `**📊 Token Stats**\n`;

            // Price and 24h change
            const priceChange24h = tokenData.priceChange["24h"];
            const changeIcon = priceChange24h >= 0 ? "+" : "";
            analysisText += ` ├ USD:  $${tokenData.price?.toFixed(6) || "N/A"}`;
            if (priceChange24h) {
                analysisText += ` (${changeIcon}${priceChange24h.toFixed(1)}%)\n`;
            } else {
                analysisText += "\n";
            }

            // Market cap and liquidity metrics
            analysisText += ` ├ MC:   $${formatNumber(tokenData.marketCap)}\n`;
            if (tokenData.liquidity) {
                analysisText += ` ├ LIQ:  $${formatNumber(tokenData.liquidity)}\n`;
            }

            // 24h price changes and transactions
            if (priceChange24h || tokenData.transactions?.h24) {
                const transactions = tokenData.transactions?.h24;
                let line = "";

                if (priceChange24h) {
                    const changeIcon = priceChange24h >= 0 ? "📈" : "📉";
                    line += `${changeIcon} ${priceChange24h.toFixed(2)}%`;
                }

                if (transactions?.buys || transactions?.sells) {
                    if (line) line += " | ";
                    line += `🅑 ${transactions.buys || 0} Ⓢ ${transactions.sells || 0}`;
                }

                if (line) {
                    analysisText += ` ├ 24h:  ${line}\n`;
                }
            }

            // Volume 24h
            if (tokenData.volume?.h24) {
                analysisText += ` └ Vol (24h):  $${formatNumber(tokenData.volume.h24)}\n`;
            }

            if (tokenData.isRugged) {
                analysisText += `\n⚠️ RUG PULL WARNING: This token has been flagged as potentially rugged!\n`;
            }

            // Top wallets section (if available)
            if (tokenData.topWallets && tokenData.topWallets.length > 0) {
                analysisText += `\n**👛 Top Wallets**\n`;
                const walletsToShow = source === "telegram" ? 5 : 1;

                tokenData.topWallets
                    .slice(0, walletsToShow)
                    .forEach((wallet, index) => {
                        const medal = getMedalEmoji(index);
                        const name = formatWalletName(wallet);
                        const prefix =
                            index === walletsToShow - 1 ? " └" : " ├";

                        analysisText += `${prefix} ${medal} ${name}\n`;
                        if (wallet.historic30d) {
                            const pnl = wallet.historic30d.realizedPnl;
                            const change = wallet.historic30d.percentageChange;
                            const changeIcon = change >= 0 ? "📈" : "📉";
                            analysisText += `    └ PnL: ${pnl} (${changeIcon} ${change.toFixed(1)}%)\n`;
                        }
                    });
            }

            // Links section
            analysisText += `\n**🔗 Links**\n`;
            if (
                tokenData.social?.telegram ||
                tokenData.social?.twitter ||
                tokenData.website
            ) {
                const links = [];
                if (tokenData.website) {
                    links.push(`[🌐](${tokenData.website})`);
                }
                if (tokenData.social.twitter) {
                    links.push(`[𝕏](${tokenData.social.twitter})`);
                }
                if (tokenData.social.telegram) {
                    links.push(`[TG](${tokenData.social.telegram})`);
                }

                const linksText = links.join(" • ");
                if (linksText) {
                    analysisText += ` ├ ${linksText}\n`;
                }
            }
            analysisText += ` ├ [Chart](https://dexscreener.com/solana/${address})\n`;
            analysisText += ` └ [More top wallets](https://www.topwallets.ai/solana/token/${address})`;

            await callback({
                text: analysisText,
            });

            return true;
        } catch (error) {
            elizaLogger.error("Token scan error", {
                error,
                address,
                errorMessage: isAxiosError(error)
                    ? error.response?.data?.message || error.message
                    : error instanceof Error
                      ? error.message
                      : "Unknown error",
                isAxiosError: isAxiosError(error),
            });

            const errorMessage = isAxiosError(error)
                ? `Failed to scan token: ${error.response?.data?.message || error.message}`
                : "An unexpected error occurred while scanning the token.";

            console.log(error);

            if (source === "telegram") {
                await callback({
                    text: errorMessage,
                });
            }

            return true;
        }
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Can you analyze this token: 97RggLo3zV5kFGYW4yoQTxr4Xkz4Vg2WPHzNYXXWpump",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll analyze that token for you. Here's what I found...",
                    action: "SCAN_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What's do you think about this token: 97RggLo3zV5kFGYW4yoQTxr4Xkz4Vg2WPHzNYXXWpump",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me check the token information for you...",
                    action: "SCAN_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "what's your thoughts on 79yTpy8uwmAkrdgZdq6ZSBTvxKsgPrNqTLvYQBh1pump?",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "I'll analyze this token and share my findings with you...",
                    action: "SCAN_TOKEN",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "79yTpy8uwmAkrdgZdq6ZSBTvxKsgPrNqTLvYQBh1pump",
                },
            },
            {
                user: "{{user2}}",
                content: {
                    text: "Let me look up the details of this token and give you my analysis...",
                    action: "SCAN_TOKEN",
                },
            },
        ],
    ],
};
