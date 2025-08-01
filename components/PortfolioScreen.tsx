
import React from 'react';
import { HodlDumpDecision } from '../types';
import PortfolioItemCard from './PortfolioItemCard';
import EmptyState from './EmptyState';

interface PortfolioScreenProps {
  history: HodlDumpDecision[];
  onNavigate: (view: 'game' | 'portfolio' | 'profile' | 'watchlist') => void;
}

const PortfolioScreen: React.FC<PortfolioScreenProps> = ({ history, onNavigate }) => {
  const hodlHistory = history.filter(d => d.decision === 'HODL');
  const dumpHistory = history.filter(d => d.decision === 'DUMP');

  const HistorySection: React.FC<{ title: string; items: HodlDumpDecision[]; colorClass: string; emptyIcon: React.ReactNode; emptyMessage: string; }> = ({ title, items, colorClass, emptyIcon, emptyMessage }) => (
    <div>
      <h3 className={`text-3xl font-bold mb-6 text-center ${colorClass}`}>{title}</h3>
      {items.length === 0 ? (
        <EmptyState
            icon={emptyIcon}
            title="Nothing to see here!"
            message={emptyMessage}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((decision) => (
            <PortfolioItemCard key={decision.coin.id} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="text-center max-w-7xl mx-auto p-4 sm:p-8 animate-slide-in-up">
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8">
        <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2">
          My Crypto Portfolio
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your complete HODL or DUMP history.
        </p>

        <div className="flex justify-center space-x-8 mb-12">
          <div className="text-center p-4 bg-green-50/80 rounded-lg w-40">
            <p className="text-5xl font-bold text-green-500">{hodlHistory.length}</p>
            <p className="text-lg text-gray-500">Total HODL'd</p>
          </div>
          <div className="text-center p-4 bg-red-50/80 rounded-lg w-40">
            <p className="text-5xl font-bold text-red-500">{dumpHistory.length}</p>
            <p className="text-lg text-gray-500">Total DUMP'd</p>
          </div>
        </div>
        
        <div className="space-y-12">
           <HistorySection 
            title="💎 Diamond Hands (HODL)" 
            items={hodlHistory} 
            colorClass="text-green-600"
            emptyIcon={<span className="text-5xl">💎</span>}
            emptyMessage="You haven't HODL'd any projects yet. Go find some gems!"
          />
           <HistorySection 
            title="🧻 Paper Hands (DUMP)" 
            items={dumpHistory} 
            colorClass="text-red-600"
            emptyIcon={<span className="text-5xl">🧻</span>}
            emptyMessage="You haven't DUMP'd any projects. Your hands are pure!"
          />
        </div>

         <div className="mt-12">
            <button
                onClick={() => onNavigate('game')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200"
            >
                Back to the Game
            </button>
         </div>
      </div>
    </div>
  );
};

export default PortfolioScreen;