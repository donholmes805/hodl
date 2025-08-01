
import React, { useState } from 'react';
import { User } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: User | null;
  onNavigate: (view: 'game' | 'portfolio' | 'profile' | 'login' | 'signup' | 'watchlist' | 'admin' | 'promote') => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: 'game' | 'portfolio' | 'profile' | 'login' | 'signup' | 'watchlist' | 'admin' | 'promote') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo and Title */}
          <button onClick={() => onNavigate('game')} className="flex items-center space-x-2 sm:space-x-3 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-lg p-1">
            <Logo />
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                HODL or DUMP
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">The Ultimate Crypto Showdown</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
             <button 
                onClick={() => onNavigate('promote')}
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full hover:scale-105 transform transition-transform duration-200"
              >
                List Project
              </button>
            {user ? (
              <>
                {user.isAdmin && (
                   <button 
                      onClick={() => onNavigate('admin')}
                      className="px-4 py-2 text-sm font-semibold text-orange-600 border border-orange-600 rounded-full hover:bg-orange-50 transition-colors duration-200"
                    >
                      Admin Panel
                    </button>
                )}
                <button onClick={() => onNavigate('profile')} className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 rounded-full">
                  <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full border-2 border-purple-400 hover:border-blue-500 transition-colors" />
                  <span className="font-semibold text-gray-700 hidden md:block">{user.name}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                 <button 
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-purple-600 border border-purple-600 rounded-full hover:bg-purple-50 transition-colors duration-200"
                >
                  Log In
                </button>
                 <button 
                  onClick={() => onNavigate('signup')}
                  className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                aria-label="Open main menu"
                aria-expanded={isMobileMenuOpen}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
            <div className="sm:hidden bg-white shadow-lg absolute top-full left-0 w-full z-10 animate-slide-in-up" style={{animationDuration: '200ms'}}>
                <div className="px-2 pt-2 pb-3 space-y-1">
                    <button 
                      onClick={() => handleMobileNav('promote')}
                      className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-purple-600 bg-purple-50 hover:bg-purple-100"
                    >
                      List Project
                    </button>
                    {user ? (
                        <>
                           {user.isAdmin && (
                              <button 
                                onClick={() => handleMobileNav('admin')}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-orange-600 bg-orange-50 hover:bg-orange-100"
                              >
                                Admin Panel
                              </button>
                           )}
                           <button 
                              onClick={() => handleMobileNav('profile')}
                              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                           >
                              My Profile
                           </button>
                           <button 
                              onClick={() => handleMobileNav('portfolio')}
                              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                           >
                              My Portfolio
                           </button>
                            <button 
                              onClick={() => handleMobileNav('watchlist')}
                              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                           >
                              My Watchlist
                           </button>
                        </>
                    ) : (
                        <>
                            <button 
                              onClick={() => handleMobileNav('login')}
                              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Log In
                            </button>
                            <button 
                              onClick={() => handleMobileNav('signup')}
                              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            >
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        )}
      </header>
    </>
  );
};

export default Header;
