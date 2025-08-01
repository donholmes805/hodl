
import React from 'react';
import { HodlDumpDecision } from '../types';

interface ResultsScreenProps {
  decisions: HodlDumpDecision[];
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ decisions, onRestart }) => {
  const hodlCount = decisions.filter(d => d.decision === 'HODL').length;
  const dumpCount = decisions.filter(d => d.decision === 'DUMP').length;

  const getPortfolioValue = () => {
    return (hodlCount * 1000 - dumpCount * 100).toLocaleString();
  }

  return (
    <div className="text-center max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
        Round Over!
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        You've judged the crypto-verse. Here's your portfolio summary.
      </p>

      <div className="flex justify-center space-x-8 mb-10">
        <div className="text-center">
          <p className="text-5xl font-bold text-green-500">{hodlCount}</p>
          <p className="text-lg text-gray-500">HODL'd</p>
        </div>
        <div className="text-center">
          <p className="text-5xl font-bold text-red-500">{dumpCount}</p>
          <p className="text-lg text-gray-500">DUMP'd</p>
        </div>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <p className="text-lg text-gray-700">Estimated Portfolio Value:</p>
        <p className="text-4xl font-mono font-bold text-gray-800">${getPortfolioValue()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-green-600">Your Diamond Hands</h3>
          <ul className="space-y-2">
            {decisions.filter(d => d.decision === 'HODL').map(({ coin }) => (
              <li key={coin.id} className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center">
                <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full mr-3"/>
                <span className="font-medium">{coin.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-3 text-red-600">Your Paper Hands</h3>
           <ul className="space-y-2">
            {decisions.filter(d => d.decision === 'DUMP').map(({ coin }) => (
              <li key={coin.id} className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-center">
                <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full mr-3"/>
                <span className="font-medium">{coin.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200"
      >
        Play Again
      </button>
    </div>
  );
};

export default ResultsScreen;