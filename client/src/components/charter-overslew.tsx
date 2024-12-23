import { useParams } from "react-router-dom";
import bannerImage from "./github-banner.png";
import { Eye } from 'lucide-react';

export function CharterOverslew() {
    const { agentId } = useParams();

    return (
        <div className="container mx-auto p-4 max-w-4xl text-left">
            <div className="flex justify-between items-center">
                <div>
                    <img src={bannerImage} alt="aiKOL Banner" width="100%" />
                </div>
                <a
                    href="https://github.com/anoncf/aikol/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-6 right-6 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                    <Eye className="w-5 h-5 mr-2" />
                    View on GitHub
                </a>
            </div>
            <h1 className="text-4xl font-bold mt-8 mb-8">Welcome to aiKOL DAO</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">🚀 What is aiKOLdao?</h2>
                <p className="mb-4">KOLs (Key Opinion Leaders) dominate how most of us get crypto alpha. But many:</p>
                <ul className="list-none mb-4">
                    <li>❌ Don't disclose conflicts of interest</li>
                    <li>💩 Dump on followers</li>
                    <li>😈 Manipulate people for personal gain</li>
                </ul>
                <p className="mb-4">It's time to flip KOLs.</p>
                <p className="mb-4"><strong><a href="https://x.com/aikoldao" className="text-blue-600 hover:underline">@aiKOLdao</a></strong> is a collective of autonomous agent KOLs that provide <strong>top-tier memecoin alpha</strong> without the scams, dumps, or manipulation. These agents analyze real-time crypto news, token price data, and wallet activity to deliver expert recommendations directly to you.</p>
            </section>

            <hr className="my-8 border-gray-300" />

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">�� Meet Lea, the first aiKOL</h3>
                <p className="mb-4"><a href="https://x.com/aikollea" className="text-blue-600 hover:underline">@aiKOLLea</a> is the first autonomous agent of aiKOLdao, created to help you navigate the wild world of memecoins:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li><strong>Personal memecoin alpha:</strong> Lea analyzes real-time crypto data to provide high-quality tips.</li>
                    <li><strong>Trading coach:</strong> Get custom strategies tailored to your goals.</li>
                    <li><strong>Token analysis:</strong> In-depth metrics, wallet insights, and advice.</li>
                    <li><strong>Copytrading:</strong> Follow top-performing wallets with ease.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">🛠️ How Does Lea Work?</h3>
                <p className="mb-4">Lea uses cutting-edge AI tools and crypto APIs to analyze the best memecoin opportunities:</p>
                <ul className="list-disc pl-6 mb-4">
                    <li><strong>AI framework:</strong> Built on @ai16zdao's Eliza framework, trained with expert memecoin guides.</li>
                    <li><strong>Crypto data sources:</strong> Aggregates insights from @topwallets, @cryptopanic, @dexscreener, and more.</li>
                    <li><strong>Engagement channels:</strong> Shares insights on X (Twitter) and Telegram, where you can interact with her directly.</li>
                </ul>
            </section>

            <hr className="my-8 border-gray-300" />

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">🌟 How to Use Lea</h3>

      <a
        href="/how-to-use-lea"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors mb-8"
      >
        <Eye className="w-5 h-5 mr-2" />
        Read the Full Guide
      </a>

                <h4 className="text-lg font-bold mb-2">1. Follow Lea on X (Twitter)</h4>
                <p className="mb-4">Get Lea's top token picks and strategic insights: <a href="https://twitter.com/aikollea" className="text-blue-600 hover:underline">@aiKOLlea</a></p>

                <h4 className="text-lg font-bold mb-2">2. Chat with Lea on Telegram</h4>
                <p className="mb-4">Send her a DM and say hello: <a href="https://t.me/aiKOLLea_bot" className="text-blue-600 hover:underline">@aikollea_bot</a></p>

                <p className="mb-2">Ask Lea to:</p>
                <ul className="list-none mb-4">
                    <li>📊 <strong>Analyze tokens</strong> (financial metrics, holder info, price summaries)</li>
                    <li>👛 <strong>Analyze wallets</strong> (performance, known owners, recent trades)</li>
                    <li>📈 <strong>Copytrade wallets</strong> (alerts on trades, top performers)</li>
                </ul>

                <h4 className="text-lg font-bold mb-2">3. Custom Trading Advice</h4>
                <p className="mb-4">Lea can help you create a strategy that matches your goals and risk tolerance.</p>
            </section>

            <hr className="my-8 border-gray-300" />

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">🏗️ Built for the Solana AI Hackathon</h3>
                <p className="mb-4">We created aiKOLdao and Lea in under <strong>8 days</strong> during the <strong>@Solana AI Hackathon</strong> with: <strong>@ai16zdao's Eliza framework</strong>. PS: ai16z Eliza is awesome. <a href="https://elizaos.github.io/eliza/" className="text-blue-600 hover:underline">Try it here</a>.</p>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">✌️ About the Builders</h3>
                <p className="mb-4">We've been in the space a while. We think predatory KOLs are one of the worst parts of the space. So we're here to change that 😈.</p>
                <ul className="list-none mb-4">
                    <li className="mb-2"><a href="https://t.me/autistliberation" className="text-blue-600 hover:underline">@autistliberation</a> - full-time crypto since 2018, dev & wordcel, multiple time vc backed founder, likes bugs</li>
                    <li><a href="https://t.me/addybsf" className="text-blue-600 hover:underline">@addybsf</a> - solidity dev since 2018, 10x shape rotator, vc backed founder, pastel maxie</li>
                </ul>
            </section>

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">🚧 What's Next?</h3>
                <p className="mb-4">We're planning to add <strong>trading delegation</strong>, allowing you to let Lea place memecoin bets for you.</p>
                <p className="mb-4">Join us in flipping KOLs and making crypto fairer for everyone!</p>
            </section>

            <hr className="my-8 border-gray-300" />

            <section className="mb-8">
                <h3 className="text-xl font-bold mb-4">📌 Follow Us</h3>
                <ul className="list-none mb-4">
                    <li><strong>aiKOLdao:</strong> <a href="https://twitter.com/aikoldao" className="text-blue-600 hover:underline">@aiKOLdao</a></li>
                    <li><strong>Lea:</strong> <a href="https://twitter.com/aikollea" className="text-blue-600 hover:underline">@aiKOLlea</a></li>
                </ul>
                <p className="text-lg font-bold">Let's flip the KOLs together. 💪</p>
            </section>
        </div>
    );
}