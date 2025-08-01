
import React, { useState, useEffect } from 'react';
import { CoinDetail } from '../types';
import PortfolioItemCard from './PortfolioItemCard';
import EmptyState from './EmptyState';

interface WatchlistScreenProps {
  watchlistCoinIds: string[];
  onNavigate: (view: 'game' | 'portfolio' | 'profile' | 'watchlist') => void;
  getDetailsForId: (coinId: string) => Promise<CoinDetail | null>;
}

const WatchlistScreen: React.FC<WatchlistScreenProps> = ({ watchlistCoinIds, onNavigate, getDetailsForId }) => {
  const [watchedCoins, setWatchedCoins] = useState<CoinDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlistCoinIds.length === 0) {
        setWatchedCoins([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const coinPromises = watchlistCoinIds.map(id => getDetailsForId(id));
        const results = await Promise.all(coinPromises);
        setWatchedCoins(results.filter((c): c is CoinDetail => c !== null));
      } catch (error) {
        console.error("Failed to fetch watchlist coin details:", error);
        setWatchedCoins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchlistDetails();
  }, [watchlistCoinIds, getDetailsForId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(watchlistCoinIds.length || 3)].map((_, i) => (
            <div key={i} className="bg-white/50 p-4 rounded-xl shadow-md animate-pulse">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                    <div className="flex-grow space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      );
    }

    if (watchedCoins.length === 0) {
      return (
         <EmptyState
            icon={
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            }
            title="Your Watchlist is Empty"
            message="You can add projects to your watchlist by clicking the star icon on their card."
            buttonText="Find Projects to Watch"
            onButtonClick={() => onNavigate('game')}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchedCoins.map((coin) => (
          // We can reuse the PortfolioItemCard if we create a mock decision object
          <PortfolioItemCard 
            key={coin.id} 
            decision={{ coin, decision: 'HODL' }} // Decision type is arbitrary here
            isWatchlistItem={true}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="text-center max-w-7xl mx-auto p-4 sm:p-8 animate-slide-in-up">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center mb-2 space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                My Watchlist
            </h2>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          Projects you're keeping an eye on.
        </p>
        
        {renderContent()}

        {watchedCoins.length > 0 && (
            <div className="mt-12">
                <button
                    onClick={() => onNavigate('game')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200"
                >
                    Back to the Game
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistScreen;
