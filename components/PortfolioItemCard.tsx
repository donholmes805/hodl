import React from 'react';
import { HodlDumpDecision } from '../types';

interface PortfolioItemCardProps {
    decision: HodlDumpDecision;
    isWatchlistItem?: boolean;
}

const PerformanceIndicator: React.FC<{ change: number | undefined }> = ({ change }) => {
    if (change === undefined) {
        return <span className="text-xs text-gray-400">N/A</span>;
    }

    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const icon = isPositive ? '▲' : '▼';

    return (
        <div className={`flex items-center text-sm font-semibold ${color}`}>
            <span>{icon}</span>
            <span className="ml-1">{change.toFixed(2)}%</span>
            <span className="text-xs text-gray-400 font-normal ml-1">(24h)</span>
        </div>
    );
};

const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ decision, isWatchlistItem = false }) => {
    const { coin } = decision;
    const change24h = coin.quotes?.USD?.percent_change_24h;
    
    let decisionColor = 'border-gray-200';
    if (!isWatchlistItem) {
        decisionColor = decision.decision === 'HODL' ? 'border-green-400' : 'border-red-400';
    }


    return (
        <div className={`bg-white/90 p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 ${decisionColor}`}>
            <div className="flex items-center">
                <img src={coin.logo} alt={coin.name} className="w-10 h-10 rounded-full mr-4" />
                <div className="flex-grow">
                    <div className="flex items-baseline">
                      <p className="font-bold text-lg text-gray-800">{coin.name}</p>
                      <p className="text-sm text-gray-400 ml-2">{coin.symbol}</p>
                    </div>
                    <PerformanceIndicator change={change24h} />
                </div>
            </div>
        </div>
    );
};

export default PortfolioItemCard;
