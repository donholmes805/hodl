import React, { useState, useEffect, FormEvent } from 'react';
import { GeminiAnalysis, ChatMessage } from '../types';

// Component parts for better readability
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4 pt-6 border-t border-gray-200/80 mt-6">
    <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
    <div className="h-6 bg-gray-200 rounded-md w-1/3 mt-4"></div>
    <div className="h-4 bg-gray-200 rounded-md w-full"></div>
  </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="text-center pt-6 border-t border-gray-200/80 mt-6">
    <h3 className="font-bold text-red-600 mb-2">AI Analysis Failed</h3>
    <p className="text-sm text-red-500 italic">{message}</p>
  </div>
);

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-md p-3 rounded-lg ${isModel ? 'bg-gray-100 text-gray-800' : 'bg-purple-600 text-white'}`}>
        <p className="text-sm">{message.parts[0].text}</p>
      </div>
    </div>
  );
};


interface GeminiAnalysisDisplayProps {
  coinName: string;
  coinSymbol: string;
  description: string;
}

const GeminiAnalysisDisplay: React.FC<GeminiAnalysisDisplayProps> = ({ coinName, coinSymbol, description }) => {
  const [initialAnalysis, setInitialAnalysis] = useState<GeminiAnalysis | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userMessagesCount = chatHistory.filter(m => m.role === 'user').length;
  const canAskMore = userMessagesCount < 2;

  useEffect(() => {
    // Reset state when coin changes
    setInitialAnalysis(null);
    setChatHistory([]);
    setUserInput('');
    setIsThinking(false);
    setError(null);
    setIsLoading(true);

    const fetchInitialAnalysis = async () => {
      try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coinName, coinSymbol, description }),
        });
        
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error?.message || 'Failed to fetch analysis.');
        }

        setInitialAnalysis(result);

      } catch (err: any) {
        console.error("Gemini Analysis Error:", err);
        setError(err.message || 'An unknown error occurred while fetching analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialAnalysis();

  }, [coinName, coinSymbol, description]);

  const handleChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isThinking || !canAskMore) return;

    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
    const currentHistory = [...chatHistory, newUserMessage];
    setChatHistory(currentHistory);
    setUserInput('');
    setIsThinking(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              history: currentHistory, 
              coinName, 
              coinSymbol, 
              description 
          }),
      });

      const result = await response.json();
      if (!response.ok) {
          throw new Error(result.error?.message || "Failed to get a response from the AI.");
      }
      setChatHistory(prev => [...prev, result]);

    } catch(err: any) {
      setError(err.message || "Failed to get a response from the AI.");
      // OPTIONAL: remove the user's message if the API call fails
      // setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setIsThinking(false);
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error && !initialAnalysis) return <ErrorDisplay message={error} />;

  return (
    <div className="space-y-4 pt-6 border-t border-gray-200/80 mt-6">
      {initialAnalysis && (
        <>
          <div>
            <h3 className="font-bold text-lg text-green-600 flex items-center"><span className="text-2xl mr-2">🐂</span> Bull Case</h3>
            <p className="text-gray-700 italic">"{initialAnalysis.bullCase}"</p>
          </div>
          <div>
            <h3 className="font-bold text-lg text-red-600 flex items-center"><span className="text-2xl mr-2">🐻</span> Bear Case</h3>
            <p className="text-gray-700 italic">"{initialAnalysis.bearCase}"</p>
          </div>
        </>
      )}

      {chatHistory.length > 0 && (
          <div className="space-y-3 mt-4">
              {chatHistory.map((msg, index) => <ChatBubble key={index} message={msg} />)}
          </div>
      )}
      
      {isThinking && (
         <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-gray-100">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
                     <span className="text-sm text-gray-500 italic">AI is thinking...</span>
                </div>
            </div>
         </div>
      )}

      {error && <p className="text-sm text-red-500 text-center italic mt-2">{error}</p>}

      {initialAnalysis && (
        <form onSubmit={handleChatSubmit} className="mt-4">
            <fieldset disabled={isThinking || !canAskMore}>
              <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={canAskMore ? 'Ask a follow-up...' : 'No more questions.'}
                    className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    Send
                  </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 pl-3">
                {canAskMore ? `${2 - userMessagesCount} questions remaining.` : "You've reached the question limit for this project."}
              </p>
            </fieldset>
        </form>
      )}
    </div>
  );
};

export default GeminiAnalysisDisplay;