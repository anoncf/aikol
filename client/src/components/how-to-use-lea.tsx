import React from 'react';

export const HowToUseLea: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">How to Use Lea</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          Lea is your AI companion designed to help you with conversations and tasks. Here's how to make the most of your interactions:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Start by greeting Lea and introducing yourself</li>
          <li>Be clear and specific with your questions or requests</li>
          <li>You can have natural conversations just like chatting with a friend</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tips for Better Interaction</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide context when asking questions</li>
          <li>Feel free to ask follow-up questions</li>
          <li>If you need clarification, just ask!</li>
          <li>You can use natural language - no need for special commands</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What Lea Can Help With</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>General conversations and chat</li>
          <li>Answering questions on various topics</li>
          <li>Helping you brainstorm ideas</li>
          <li>Providing explanations and clarifications</li>
          <li>And much more!</li>
        </ul>
      </section>
    </div>
  );
};

export default HowToUseLea;