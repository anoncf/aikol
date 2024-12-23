import React from 'react';
import { Eye } from 'lucide-react';

export const HowItsBuilt: React.FC = () => {
  return (
    <div className="container mx-auto p-4 max-w-4xl text-left">
      <h1 className="text-4xl font-bold mt-8 mb-4">How aiKOL Lea Is Built</h1>
      <a
        href="https://github.com/anoncf/aikol/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors mb-8"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        View on Github
      </a>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🏗️ Technical Architecture</h2>
        <p className="mb-4">aiKOL Lea is built on a modular architecture with specialized components for news aggregation, analysis, and distribution:</p>

        <h3 className="text-xl font-bold mt-6 mb-3">Core Modules</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">1. @client-news</h4>
            <p className="mb-2">News aggregation and processing client:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Real-time crypto news polling via CryptoPanic API</li>
              <li>Smart content extraction with Playwright browser</li>
              <li>Embedded memory system for news storage and retrieval</li>
              <li>CAPTCHA handling and rate limiting for reliable scraping</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">2. @plugin-news</h4>
            <p className="mb-2">News analysis and distribution plugin:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Intelligent news filtering (rising, hot, bullish, bearish)</li>
              <li>Platform-specific formatting for Telegram/Twitter</li>
              <li>LLM-powered news summarization</li>
              <li>Integration with news memory system</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">3. @plugin-analysis</h4>
            <p className="mb-2">Token and wallet analysis tools:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Deep token metrics analysis via TopWallets API</li>
              <li>Wallet performance tracking and scoring</li>
              <li>Risk assessment and market analysis</li>
              <li>Multi-platform response formatting</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🤖 Platform Integration</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Twitter Integration</h3>
            <p className="mb-2">Enhanced Eliza Twitter client with:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>News-based tweet generation from memory</li>
              <li>Relevance-based content selection</li>
              <li>Smart formatting within tweet limits</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Telegram Integration</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Simple Telegram bot</li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="my-8 border-gray-300" />

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🚀 Future Development</h2>
        <ul className="list-disc pl-6 mb-6">
          <li>Trading automation with wallet delegation</li>
          <li>Expanded data source integration</li>
          <li>Advanced pattern recognition</li>
        </ul>
      </section>
    </div>
  );
};

export default HowItsBuilt;