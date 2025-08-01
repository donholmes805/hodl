import React from 'react';

const CryptoCardSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="bg-white/50 backdrop-blur-sm border border-gray-200/30 rounded-2xl shadow-2xl shadow-purple-500/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left mb-6">
          <div className="w-24 h-24 mb-4 sm:mb-0 sm:mr-6 rounded-full bg-gray-200"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded-md w-48"></div>
            <div className="h-6 bg-gray-200 rounded-md w-24"></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-4 h-10">
            <div className="h-10 bg-gray-200 rounded-md w-40"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
        </div>


        <div className="space-y-2 mb-6 text-center">
            <div className="h-4 bg-gray-200 rounded-md w-11/12 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded-md w-10/12 mx-auto"></div>
        </div>

        <div className="my-6 space-y-2">
            <div className="h-4 w-1/4 mx-auto bg-gray-200 rounded-md"></div>
            <div className="h-8 w-full bg-gray-200 rounded-full"></div>
            <div className="h-3 w-1/3 mx-auto bg-gray-200 rounded-md"></div>
        </div>

        <div className="space-y-4 pt-6 border-t border-gray-200/80 mt-6">
            <div className="h-6 bg-gray-200 rounded-md w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
            <div className="h-6 bg-gray-200 rounded-md w-1/3 mt-4"></div>
            <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        </div>
      </div>

      <div className="mt-8 flex justify-around items-center h-40">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200"></div>
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
};

export default CryptoCardSkeleton;
