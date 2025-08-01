
import React from 'react';

interface LoginRequiredModalProps {
  onClose: () => void;
  onNavigate: (screen: 'login' | 'signup') => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ onClose, onNavigate }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 scale-95 animate-slide-in-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>

        <h3 id="login-required-title" className="text-2xl font-bold text-gray-800 mb-2">Join the Action!</h3>
        <p className="text-gray-600 mb-6">Create a free account or log in to cast your vote and build your portfolio.</p>
        
        <div className="space-y-3">
             <button
              onClick={() => onNavigate('login')}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200"
            >
              Log In
            </button>
             <button
              onClick={() => onNavigate('signup')}
              className="w-full px-4 py-2 text-purple-700 font-semibold hover:bg-purple-50 rounded-full transition-colors"
            >
              Create Account
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
