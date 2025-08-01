
import React from 'react';

// The component is being repurposed as a full screen view.
// The filename remains PromoteProjectModal.tsx due to platform constraints.

interface PromoteScreenProps {
  onNavigate: (view: 'game') => void;
}

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <svg className="flex-shrink-0 w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
    <span className="text-gray-600">{children}</span>
  </li>
);

const PriceCard: React.FC<{
  title: string;
  price: string;
  description: string;
  features: string[];
  isHighlighted?: boolean;
}> = ({ title, price, description, features, isHighlighted = false }) => (
  <div className={`flex flex-col p-6 mx-auto max-w-lg text-center text-gray-900 bg-white rounded-lg border shadow-md transition-shadow hover:shadow-lg ${isHighlighted ? 'border-yellow-400' : 'border-gray-200'}`}>
    <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
    <p className="font-light text-gray-500 sm:text-lg">{description}</p>
    <div className="flex justify-center items-baseline my-8">
      <span className="mr-2 text-5xl font-extrabold">{price}</span>
      <span className="text-gray-500">/ one-time</span>
    </div>
    <ul role="list" className="mb-8 space-y-4 text-left">
      {features.map((feature, index) => (
        <FeatureItem key={index}><span dangerouslySetInnerHTML={{ __html: feature }} /></FeatureItem>
      ))}
    </ul>
  </div>
);

const PromoteProjectModal: React.FC<PromoteScreenProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-slide-in-up">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-4xl sm:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
          List Your Project
        </h2>
        <p className="text-lg sm:text-xl text-center text-gray-600 mb-12">
          Get your project in front of thousands of crypto enthusiasts for valuable feedback and exposure.
        </p>

        <div className="space-y-8 lg:grid lg:grid-cols-2 sm:gap-6 xl:gap-10 lg:space-y-0">
          <PriceCard
            title="Standard Listing"
            price="$50"
            description="Your project gets added to the main HODL or DUMP queue."
            features={[
              "Permanent listing in the game",
              "Receive community votes & feedback",
              "Visible in user portfolios forever",
              "Standard queue placement"
            ]}
          />
          <PriceCard
            title="Highlighted Listing"
            price="$149"
            description="All Standard benefits, plus premium placement for maximum visibility."
            isHighlighted={true}
            features={[
              "All Standard features",
              "<strong>24 hours</strong> at the top of the queue",
              "<strong>'PROMOTED'</strong> tag on card",
              "Featured on the main page",
            ]}
          />
        </div>

        <div className="text-center mt-12 bg-gray-50 p-8 rounded-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to List?</h3>
            <p className="text-gray-600 mb-6">Contact us on Telegram to get started. We'll guide you through the simple process.</p>
            <a
                href="https://t.me/fitowolf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><path d="M22 2 11 13H2l9 9zM22 2l-7 20-4-9-9-4Z"></path></svg>
                Contact on Telegram
            </a>
            <p className="text-sm text-gray-500 mt-4">We accept Credit Card, PayPal, and Crypto.</p>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => onNavigate('game')}
            className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
          >
            &larr; Back to the Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteProjectModal;
