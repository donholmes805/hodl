
import React, { useState } from 'react';
import { CoinDetail, VoteStats } from '../types';
import GeminiAnalysisDisplay from './GeminiAnalysisDisplay';
import confetti from 'canvas-confetti';

interface CryptoCardProps {
  coin: CoinDetail;
  onHodl: () => boolean; // Returns true if vote was successful
  onDump: () => boolean; // Returns true if vote was successful
  onToggleWatchlist: (coinId: string) => void;
  onShare: (coin: CoinDetail) => void;
  isWatchlisted: boolean;
  isHighlighted: boolean;
}

const ActionButton: React.FC<{ onClick: () => void; className: string; children: React.ReactNode; disabled: boolean }> = ({ onClick, className, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl transform transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
    aria-label={`Decision button: ${children}`}
  >
    {children}
  </button>
);

const LinkButton: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200 text-sm font-semibold"
  >
    {children}
  </a>
);

const PriceDisplay: React.FC<{ quote: CoinDetail['quotes'] }> = ({ quote }) => {
  if (!quote?.USD?.price) {
    return <div className="h-10"></div>; // Reserve space
  }
  const price = quote.USD.price;
  const change = quote.USD.percent_change_24h;
  const isPositive = change >= 0;

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 6 : 2,
  });

  return (
    <div className="flex items-center justify-center space-x-4 mb-4">
      <p className="text-4xl font-mono font-bold text-gray-800">{priceFormatter.format(price)}</p>
      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-white font-semibold text-lg ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
        <span>{isPositive ? '▲' : '▼'}</span>
        <span>{change.toFixed(2)}%</span>
      </div>
    </div>
  );
};

const LivePoll: React.FC<{ stats?: VoteStats }> = ({ stats }) => {
  if (!stats || (stats.hodl === 0 && stats.dump === 0)) {
    return (
       <div className="text-center text-gray-400 my-6 py-2 bg-gray-50 rounded-lg">
         Be the first to vote!
       </div>
    );
  }

  const totalVotes = stats.hodl + stats.dump;
  const hodlPercent = Math.round((stats.hodl / totalVotes) * 100);

  return (
    <div className="my-6">
      <h4 className="text-center font-bold text-gray-700 mb-2">Live Poll</h4>
      <div className="flex w-full h-8 bg-red-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
        <div
          className="flex items-center justify-center bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold text-xs transition-all duration-500"
          style={{ width: `${hodlPercent}%` }}
        >
          {hodlPercent > 15 && `HODL ${hodlPercent}%`}
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">{totalVotes.toLocaleString()} total votes</p>
    </div>
  );
};

const TagsDisplay: React.FC<{ tags?: CoinDetail['tags'] }> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  const filteredTags = tags.filter(tag => tag.name).slice(0, 4);

  if (filteredTags.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {filteredTags.map((tag) => (
        <span key={tag.id} className="text-xs font-medium bg-gray-200/80 text-gray-700 px-2.5 py-1 rounded-full">
          {tag.name}
        </span>
      ))}
    </div>
  );
};

const CryptoCard: React.FC<CryptoCardProps> = ({ coin, onHodl, onDump, onToggleWatchlist, onShare, isWatchlisted, isHighlighted }) => {
  const [revealed, setRevealed] = useState<null | 'HODL' | 'DUMP'>(null);
  
  const handleVote = (decision: 'HODL' | 'DUMP') => {
    const voteSuccessful = decision === 'HODL' ? onHodl() : onDump();

    if (voteSuccessful) {
        setRevealed(decision);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: decision === 'HODL' ? ['#4ade80', '#2dd4bf', '#ffffff'] : ['#f87171', '#f472b6', '#ffffff']
        });
    }
  };

  const descriptionSnippet = coin.description 
    ? coin.description.split('. ').slice(0, 2).join('. ') + '.'
    : 'No description available for this project.';
  
  const hasLinks = coin.links?.website?.[0] || coin.whitepaper?.link;
  
  const renderVerdict = () => {
    if (!revealed) return null;
    
    const hodlVotes = (coin.voteStats?.hodl || 0) + (revealed === 'HODL' ? 1 : 0);
    const dumpVotes = (coin.voteStats?.dump || 0) + (revealed === 'DUMP' ? 1 : 0);
    const totalVotes = hodlVotes + dumpVotes;
    const hodlPercent = totalVotes > 0 ? Math.round((hodlVotes / totalVotes) * 100) : 50;
    const dumpPercent = 100 - hodlPercent;

    return (
        <div className="w-full max-w-md px-4 animate-slide-in-up">
            <h4 className="text-center font-bold text-gray-700 mb-2">Community Verdict</h4>
            <div className="flex w-full h-12 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`flex items-center justify-center bg-green-500 text-white font-bold transition-all duration-500 ${revealed === 'HODL' ? 'ring-4 ring-offset-2 ring-green-400' : ''}`}
                  style={{ width: `${hodlPercent}%` }}
                >
                  HODL {hodlPercent}%
                </div>
                <div
                  className={`flex items-center justify-center bg-red-500 text-white font-bold transition-all duration-500 ${revealed === 'DUMP' ? 'ring-4 ring-offset-2 ring-red-400' : ''}`}
                  style={{ width: `${dumpPercent}%` }}
                >
                  {dumpPercent}% DUMP
                </div>
            </div>
        </div>
    );
  }

  const cardClasses = isHighlighted 
    ? 'border-yellow-400 shadow-yellow-400/30' 
    : 'border-gray-200/50 shadow-purple-500/10';

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`relative bg-white/80 backdrop-blur-sm border-2 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-500 ${cardClasses}`}>
        {isHighlighted && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md -rotate-6 transform">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                PROMOTED
            </div>
        )}
        <div className="absolute top-4 right-4 flex items-center space-x-1">
            <button
                onClick={() => onShare(coin)}
                className="text-gray-400 hover:text-purple-500 transition-colors duration-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                aria-label="Share project"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </button>
            <button 
                onClick={() => onToggleWatchlist(coin.id)}
                className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                aria-label={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isWatchlisted ? '#FBBF24' : 'currentColor'}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left mb-2 pt-4">
          <img src={coin.logo} alt={`${coin.name} logo`} className="w-24 h-24 mb-4 sm:mb-0 sm:mr-6 rounded-full shadow-lg border-2 border-white" />
          <div>
            <h2 className="text-4xl font-bold text-gray-800">{coin.name}</h2>
            <p className="text-2xl text-gray-400 font-mono">{coin.symbol}</p>
          </div>
        </div>

        <TagsDisplay tags={coin.tags} />

        <PriceDisplay quote={coin.quotes} />

        <p className="text-gray-600 mb-6 text-center">{descriptionSnippet}</p>

        {hasLinks && (
          <div className="flex justify-center items-center space-x-3 mb-6">
            {coin.links?.website?.[0] && (
              <LinkButton href={coin.links.website[0]}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <span>Website</span>
              </LinkButton>
            )}
            {coin.whitepaper?.link && (
               <LinkButton href={coin.whitepaper.link}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <span>Whitepaper</span>
              </LinkButton>
            )}
          </div>
        )}
        
        <LivePoll stats={coin.voteStats} />

        <GeminiAnalysisDisplay coinName={coin.name} coinSymbol={coin.symbol} description={coin.description} />
      </div>

      <div className="mt-8 flex justify-around items-center h-40">
        {!revealed ? (
          <>
            <ActionButton onClick={() => handleVote('DUMP')} disabled={!!revealed} className="bg-gradient-to-br from-red-500 to-pink-600 ring-pink-400">DUMP</ActionButton>
            <ActionButton onClick={() => handleVote('HODL')} disabled={!!revealed} className="bg-gradient-to-br from-green-400 to-teal-500 ring-teal-300">HODL</ActionButton>
          </>
        ) : (
            renderVerdict()
        )}
      </div>
    </div>
  );
};

export default CryptoCard;
