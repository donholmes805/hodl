import React, { useState, useEffect } from 'react';
import { CoinDetail } from '../types';

interface FeaturedProjectsProps {
  featuredCoins: CoinDetail[];
  onSelectProject: (coinId: string) => void;
  onPromoteClick: () => void;
}

const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({ featuredCoins, onSelectProject, onPromoteClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredCoins.length < 2) return;

    const intervalId = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredCoins.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(intervalId);
  }, [featuredCoins.length]);
  
  const renderFeaturedProject = () => {
    const currentProject = featuredCoins[currentIndex];
     return (
        <div 
            key={currentProject.id} // This key forces re-render and re-triggers animation
            className="animate-fade-in bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-2 border-yellow-400 p-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => onSelectProject(currentProject.id)}
            role="button"
            tabIndex={0}
            aria-label={`View featured project: ${currentProject.name}`}
        >
            <div className="flex items-center space-x-4">
            <img src={currentProject.logo} alt={currentProject.name} className="w-14 h-14 rounded-full" />
            <div className="flex-grow">
                <h4 className="text-xl font-bold text-gray-800">{currentProject.name}</h4>
                <p className="text-gray-500">{currentProject.symbol}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-yellow-700 font-semibold bg-yellow-200 px-2 py-1 rounded-full">PROMOTED</p>
                <p className="text-xs text-gray-500 mt-1">Click to view</p>
            </div>
            </div>
        </div>
     )
  }
  
  const renderPlaceholder = () => {
      return (
        <div 
            className="animate-fade-in bg-gradient-to-br from-purple-50 via-white to-blue-50 border-2 border-dashed border-gray-300 p-4 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300"
            role="button"
            tabIndex={0}
            onClick={onPromoteClick}
            aria-label="Promote your project"
        >
            <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-4">
               <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
               </div>
               <div className="flex-grow">
                   <h4 className="font-bold text-gray-800">Want to get your project seen?</h4>
                   <p className="text-sm text-gray-600">This spot gets you to the top of the list for 24 hours.</p>
               </div>
               <button
                  className="w-full sm:w-auto flex-shrink-0 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full hover:scale-105 transform transition-transform duration-200"
                >
                  Get Featured
                </button>
            </div>
        </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-2 flex items-center">
        Featured Project
      </h3>
      {featuredCoins.length > 0 ? renderFeaturedProject() : renderPlaceholder()}
    </div>
  );
};

export default FeaturedProjects;
