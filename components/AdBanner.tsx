
import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-12 border-t border-gray-200">
      <div className="text-center text-sm text-gray-500 space-y-2 px-4">
        <div>
          <span>Copyright © {new Date().getFullYear()} </span>
          <a 
            href="https://fitotechnology.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-700 hover:text-purple-600 transition-colors underline"
          >
            Fito Technology, LLC
          </a>
          <span>. All Rights Reserved.</span>
        </div>
        <div className="flex justify-center items-center gap-x-6 flex-wrap">
           <a 
            href="https://fitochain.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-700 hover:text-purple-600 transition-colors underline"
          >
            Fitochain
          </a>
           <a 
            href="https://t.me/fitochain" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-purple-600 transition-colors underline"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13H2l9 9zM22 2l-7 20-4-9-9-4Z"></path></svg>
            Telegram
          </a>
           <a 
            href="https://x.com/fitochain" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-purple-600 transition-colors underline"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"></path></svg>
            X
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AdBanner;
