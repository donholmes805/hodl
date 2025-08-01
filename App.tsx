
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Coin, CoinDetail, User, HodlDumpDecision } from './types';
import { getActiveCoins, getCoinDetails } from './services/coinpaprikaService';
import CryptoCard from './components/CryptoCard';
import Header from './components/Header';
import ResultsScreen from './components/ResultsScreen';
import PortfolioScreen from './components/PortfolioScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import ProfileScreen from './components/ProfileScreen';
import LoginRequiredModal from './components/LoginRequiredModal';
import CryptoCardSkeleton from './components/CryptoCardSkeleton';
import WatchlistScreen from './components/WatchlistScreen';
import AdBanner from './components/AdBanner';
import AdminPanel from './components/AdminPanel';
import FeaturedProjects from './components/FeaturedProjects';
import PromoteScreen from './components/PromoteProjectModal';
import Logo from './components/Logo';

type Screen = 'login' | 'signup' | 'game' | 'portfolio' | 'profile' | 'watchlist' | 'admin' | 'promote';

const fitoCoinBase: CoinDetail = {
  id: 'custom-fito',
  name: 'Fito',
  symbol: 'FITO',
  rank: 0,
  is_new: true,
  is_active: true,
  type: 'coin',
  logo: 'https://fitotechnology.com/wp-content/uploads/2025/06/cropped-Fito-Tech-Favicon.png',
  description: 'Experience the next generation of Blockchain EVM-Compatible, Low Fees, Lightning-Fast Transactions, and a powerful suite of applications for innovators, builders, and everyday users.',
  tags: [{id: 'native-coin', name: 'Native Coin'}, {id: 'fitochain', name: 'Fitochain'}],
  links: { website: ['https://fitochain.com'] },
  whitepaper: { link: 'https://fitochain.com/wp-content/uploads/2025/07/Fitochain-Whitepaper-Update-July-2025.pdf' },
};

const APP_ICON_URL = 'https://fitotechnology.com/wp-content/uploads/2025/07/HoD_Logo-1.png';

// --- Auth Helpers ---
const getAllUsers = (): Record<string, User> => {
    const usersJson = localStorage.getItem('hodlDumpUsers');
    return usersJson ? JSON.parse(usersJson) : {};
};

const saveAllUsers = (users: Record<string, User>) => {
    localStorage.setItem('hodlDumpUsers', JSON.stringify(users));
};

const initializeAdminUser = () => {
    const allUsers = getAllUsers();
    const adminEmail = 'fitotechnologyllc@gmail.com'.toLowerCase();
    
    const currentAdminUser = allUsers[adminEmail];

    // Create or update the admin user with the correct password and details.
    if (!currentAdminUser || currentAdminUser.pass_DUMMY_DO_NOT_USE_IN_PROD !== 'Atchison7378$') {
        allUsers[adminEmail] = {
            ...currentAdminUser, // Preserve existing data like 2FA status
            name: 'Fito Technology',
            email: adminEmail,
            pass_DUMMY_DO_NOT_USE_IN_PROD: 'Atchison7378$',
            avatarUrl: 'https://fitotechnology.com/wp-content/uploads/2025/06/cropped-Fito-Tech-Favicon.png',
            paidTier: true,
            has2FA: currentAdminUser?.has2FA || false,
            isAdmin: true,
        };
        saveAllUsers(allUsers);
        console.log("Admin user initialized or updated.");
    }
};


// --- 2FA Login Screen Component (defined in App.tsx to avoid creating new files) ---
const TwoFactorAuthLoginScreen: React.FC<{
  user: User;
  onVerify: (code: string) => void;
  onCancel: () => void;
  error: string | null;
}> = ({ user, onVerify, onCancel, error }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerify(code);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center items-center space-x-3 mb-6">
              <Logo />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  Two-Factor Auth
              </h1>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Enter Verification Code</h2>
            <p className="text-center text-gray-500 mb-6">Enter the 6-digit code from your authenticator app for {user.email}.</p>
            {error && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="2fa-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  maxLength={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-center text-2xl tracking-[.5em]"
                  placeholder="_ _ _ _ _ _"
                />
              </div>
              <button
                type="submit"
                disabled={code.length !== 6}
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                Verify
              </button>
            </form>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6">
            <button onClick={onCancel} className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline">
              Cancel and go back
            </button>
          </p>
        </div>
      </div>
      <AdBanner />
    </div>
  );
};


const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('game');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userAwaiting2FA, setUserAwaiting2FA] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);


  const [coins, setCoins] = useState<(Coin | CoinDetail)[]>([]);
  const [adminCoins, setAdminCoins] = useState<CoinDetail[]>([]);
  const [featuredCoins, setFeaturedCoins] = useState<CoinDetail[]>([]);
  const [currentCoinDetail, setCurrentCoinDetail] = useState<CoinDetail | null>(null);
  const [currentCoinIndex, setCurrentCoinIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<HodlDumpDecision[]>([]);
  const [history, setHistory] = useState<HodlDumpDecision[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [animationClass, setAnimationClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Auth & Initialization ---
  useEffect(() => {
    initializeAdminUser(); // Create the admin user if it doesn't exist.
    try {
      const sessionEmail = localStorage.getItem('hodlDumpSessionEmail');
      if (sessionEmail) {
        const allUsers = getAllUsers();
        const savedUser = allUsers[sessionEmail];
        if (savedUser) {
          // No need to call handleCompleteLogin here, as that would navigate.
          // Just set the user and load their data.
          setUser(savedUser);
          const savedHistoryJson = localStorage.getItem(`hodlDumpHistory_${savedUser.email}`);
          setHistory(savedHistoryJson ? JSON.parse(savedHistoryJson) : []);
          const savedWatchlistJson = localStorage.getItem(`hodlDumpWatchlist_${savedUser.email}`);
          setWatchlist(savedWatchlistJson ? JSON.parse(savedWatchlistJson) : []);
        } else {
           // Data inconsistency, clear session
           localStorage.removeItem('hodlDumpSessionEmail');
        }
      }
    } catch (e) {
      console.error("Failed to initialize user session", e);
      localStorage.removeItem('hodlDumpSessionEmail');
    } finally {
      setIsSessionInitialized(true);
    }
  }, []);
  
  // --- Data Persistence ---
  const saveHistory = (newHistory: HodlDumpDecision[]) => {
    setHistory(newHistory);
    if (user) {
      try {
        localStorage.setItem(`hodlDumpHistory_${user.email}`, JSON.stringify(newHistory));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    }
  };

  const saveWatchlist = (newWatchlist: string[]) => {
    setWatchlist(newWatchlist);
    if (user) {
      try {
        localStorage.setItem(`hodlDumpWatchlist_${user.email}`, JSON.stringify(newWatchlist));
      } catch (e) {
        console.error("Failed to save watchlist:", e);
      }
    }
  };

  // --- Auth Handlers ---
  const handleCompleteLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('hodlDumpSessionEmail', loggedInUser.email);

    const savedHistoryJson = localStorage.getItem(`hodlDumpHistory_${loggedInUser.email}`);
    setHistory(savedHistoryJson ? JSON.parse(savedHistoryJson) : []);
    
    const savedWatchlistJson = localStorage.getItem(`hodlDumpWatchlist_${loggedInUser.email}`);
    setWatchlist(savedWatchlistJson ? JSON.parse(savedWatchlistJson) : []);

    setIsLoginModalOpen(false);
    setUserAwaiting2FA(null);
    setCurrentScreen('game');
    setAuthError(null);
  };

  const handleLogin = (credentials: { email: string; pass: string }) => {
    setAuthError(null);
    const allUsers = getAllUsers();
    const loginEmail = credentials.email.toLowerCase();
    const foundUser = allUsers[loginEmail];

    if (!foundUser) {
        setAuthError("No user found with that email address. Please sign up.");
        return;
    }

    // NOTE: Storing and checking plaintext passwords is insecure. This is for demonstration only.
    if (foundUser.pass_DUMMY_DO_NOT_USE_IN_PROD && foundUser.pass_DUMMY_DO_NOT_USE_IN_PROD !== credentials.pass) {
        setAuthError("Invalid password. Please try again.");
        return;
    }
    
    if (foundUser.has2FA) {
        setUserAwaiting2FA(foundUser);
    } else {
        handleCompleteLogin(foundUser);
    }
  };

  const handleVerify2FA = (code: string) => {
    // In a real app, this would be a server-side check. Here we use a hardcoded value.
    if (code === '123456') {
        if(userAwaiting2FA) {
            handleCompleteLogin(userAwaiting2FA);
        }
    } else {
        setAuthError("Invalid verification code. Please try again.");
    }
  };

  const handleSignUp = (details: { name: string; email: string; pass: string }) => {
    setAuthError(null);
    const allUsers = getAllUsers();
    const signUpEmail = details.email.toLowerCase();

    if (allUsers[signUpEmail]) {
        setAuthError("A user with this email already exists. Please log in.");
        return;
    }

    const newUser: User = {
      name: details.name,
      email: signUpEmail,
      pass_DUMMY_DO_NOT_USE_IN_PROD: details.pass,
      avatarUrl: APP_ICON_URL,
      paidTier: false,
      has2FA: false,
      isAdmin: signUpEmail === 'fitotechnologyllc@gmail.com',
    };
    allUsers[signUpEmail] = newUser;
    saveAllUsers(allUsers);
    handleCompleteLogin(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('hodlDumpSessionEmail');
    setUser(null);
    setCurrentScreen('game');
    setHistory([]);
    setDecisions([]);
    setWatchlist([]);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const allUsers = getAllUsers();
    allUsers[updatedUser.email] = updatedUser;
    saveAllUsers(allUsers);
  };


  // --- Game Logic ---
  const fetchCoins = useCallback(async (sharedCoinId: string | null = null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const paprikaPromise = getActiveCoins();
      const adminPromise = fetch('/api/admin').then(res => res.ok ? res.json() : []).catch(() => []);
      
      const [paprikaCoins, customAdminCoins] = await Promise.all([paprikaPromise, adminPromise]);
      setAdminCoins(customAdminCoins);

      const fitoCoinWithHighlight: CoinDetail = {
        ...fitoCoinBase,
        highlightedUntil: Date.now() + 24 * 60 * 60 * 1000,
      };

      const adminCoinsWithoutFito = customAdminCoins.filter((c: Coin) => c.id !== fitoCoinWithHighlight.id);
      let allFetchedCoins = [fitoCoinWithHighlight, ...adminCoinsWithoutFito, ...paprikaCoins];
      
      const now = Date.now();
      
      const currentFeaturedCoins = allFetchedCoins.filter(
          c => (c as CoinDetail).highlightedUntil && (c as CoinDetail).highlightedUntil! > now
      ) as CoinDetail[];
      setFeaturedCoins(currentFeaturedCoins);

      allFetchedCoins.sort((a, b) => {
        const aIsHighlighted = (a as CoinDetail).highlightedUntil && (a as CoinDetail).highlightedUntil! > now;
        const bIsHighlighted = (b as CoinDetail).highlightedUntil && (b as CoinDetail).highlightedUntil! > now;
        if (aIsHighlighted && !bIsHighlighted) return -1;
        if (!aIsHighlighted && bIsHighlighted) return 1;
        return 0;
      });

      // Filter out coins that are already in the user's history
      const coinsToPlay = allFetchedCoins.filter(c => !history.some(h => h.coin.id === c.id));
      
      if (sharedCoinId) {
        const sharedIndex = coinsToPlay.findIndex(c => c.id === sharedCoinId);
        if (sharedIndex > -1) {
          const [sharedCoin] = coinsToPlay.splice(sharedIndex, 1);
          coinsToPlay.unshift(sharedCoin);
        } else {
          try {
            const historyCoin = history.find(h => h.coin.id === sharedCoinId);
            if (historyCoin) {
              coinsToPlay.unshift(historyCoin.coin);
            } else {
              console.log(`Shared coin ${sharedCoinId} not in lists, fetching...`);
              let detail: CoinDetail | null = null;
              if (sharedCoinId === fitoCoinBase.id) {
                 detail = fitoCoinWithHighlight;
              } else if (sharedCoinId.startsWith('custom-')) {
                 const adminCoin = customAdminCoins.find((c:CoinDetail) => c.id === sharedCoinId);
                 if (adminCoin) detail = adminCoin;
              } else {
                detail = await getCoinDetails(sharedCoinId);
              }
              if (detail) coinsToPlay.unshift(detail);
            }
          } catch (e) {
            console.error(`Could not fetch or place shared coin ${sharedCoinId}`, e);
          }
        }
      }

      setCoins(coinsToPlay);
      setCurrentCoinIndex(0);
      if (coinsToPlay.length === 0 && !sharedCoinId) {
        setIsFinished(true);
      } else {
        setIsFinished(false);
        setError(null);
      }
    } catch (e) {
      setError('Failed to fetch coin list. Please try again later.');
      console.error(e);
    }
    return Promise.resolve();
  }, [history]);

  useEffect(() => {
    if (isSessionInitialized) {
        const sharedCoinId = new URLSearchParams(window.location.search).get('coinId');
        fetchCoins(sharedCoinId).finally(() => {
            setIsInitializing(false);
        });
    }
  }, [isSessionInitialized, fetchCoins]);
  
  const fetchVoteStatsForDetail = async (detail: CoinDetail): Promise<CoinDetail> => {
    try {
      const statsResponse = await fetch(`/api/votes?coinId=${detail.id}`);
      if (statsResponse.ok) {
        detail.voteStats = await statsResponse.json();
      } else {
        console.warn(`Could not fetch vote stats for ${detail.id}`);
        detail.voteStats = { hodl: 0, dump: 0 };
      }
    } catch (e) {
      console.error('Failed fetching vote stats', e);
      detail.voteStats = { hodl: 0, dump: 0 };
    }
    return detail;
  }

  useEffect(() => {
    const fetchDetails = async () => {
      if (coins.length > 0 && currentCoinIndex < coins.length) {
        setIsLoading(true);
        try {
          const currentCoin = coins[currentCoinIndex];

          let detail: CoinDetail;
          if ('description' in currentCoin && typeof currentCoin.description === 'string') {
             detail = currentCoin as CoinDetail;
          } else {
             detail = await getCoinDetails(currentCoin.id);
          }
          
          const detailWithVotes = await fetchVoteStatsForDetail(detail);
          
          if (!detailWithVotes.highlightedUntil && (currentCoin as CoinDetail).highlightedUntil) {
            detailWithVotes.highlightedUntil = (currentCoin as CoinDetail).highlightedUntil;
          }

          setCurrentCoinDetail(detailWithVotes);

        } catch (e) {
          setError(`Failed to fetch details for ${coins[currentCoinIndex].name}. Skipping.`);
          handleNextCoin();
        } finally {
          setIsLoading(false);
        }
      } else if (coins.length > 0 && currentCoinIndex >= coins.length) {
        setIsFinished(true);
      }
    };
    if (coins.length > 0 && !isFinished) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCoinIndex, coins, isFinished]);
  
  useEffect(() => {
    if (currentCoinDetail) {
      setAnimationClass('animate-slide-in-up');
    }
  }, [currentCoinDetail]);

  const getDetailsForId = useCallback(async (coinId: string): Promise<CoinDetail | null> => {
    // Check already loaded data first to avoid unnecessary API calls
    
    // 1. Check current coin detail on screen
    if (currentCoinDetail?.id === coinId) {
        return currentCoinDetail;
    }

    // 2. Check user's game history
    const fromHistory = history.find(d => d.coin.id === coinId);
    if (fromHistory) {
        return fromHistory.coin;
    }

    // 3. Check for hardcoded Fito coin
    if (coinId === fitoCoinBase.id) {
        return fitoCoinBase;
    }

    // 4. Check admin-added custom coins
    const fromAdmin = adminCoins.find(c => c.id === coinId);
    if (fromAdmin) {
        return fromAdmin;
    }

    // 5. As a last resort, try fetching from the public API
    try {
        const detail = await getCoinDetails(coinId);
        return detail;
    } catch (e) {
        console.error(`[getDetailsForId] Failed to fetch details for ${coinId}:`, e);
        return null;
    }
  }, [currentCoinDetail, history, adminCoins]);

  const handleNextCoin = () => {
    const params = new URLSearchParams(window.location.search);
    if(params.has('coinId')) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    setCurrentCoinDetail(null);
    if (currentCoinIndex < coins.length - 1) {
      setCurrentCoinIndex(prevIndex => prevIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleDecision = (decision: 'HODL' | 'DUMP') => {
    if (!currentCoinDetail || animationClass.includes('slide-out')) {
      return;
    }

    // Create the updated coin detail object FIRST for consistent state
    const newStats = {
        hodl: (currentCoinDetail.voteStats?.hodl || 0) + (decision === 'HODL' ? 1 : 0),
        dump: (currentCoinDetail.voteStats?.dump || 0) + (decision === 'DUMP' ? 1 : 0),
    };
    const updatedCoinDetail = {
        ...currentCoinDetail,
        voteStats: newStats,
    };

    // 1. Optimistically update the UI for instant feedback
    setCurrentCoinDetail(updatedCoinDetail);

    // 2. Persist the vote to the backend (fire and forget, with error logging)
    fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId: updatedCoinDetail.id, decision }),
    }).catch(err => {
        console.error("Failed to post vote:", err);
        // In a real app, you might want to revert the UI change here or show a toast
    });
      
    // 3. Use the *updated* coin details for history to ensure consistency
    const newDecision = { coin: updatedCoinDetail, decision };
    setDecisions(prev => [...prev, newDecision]); // For current round results
    
    // Replace any existing history for this coin with the new decision
    const filteredHistory = history.filter(d => d.coin.id !== updatedCoinDetail.id);
    const updatedHistory = [...filteredHistory, newDecision];
    saveHistory(updatedHistory); // For persistence

    // 4. Trigger the animation
    setAnimationClass(decision === 'HODL' ? 'animate-slide-out-right' : 'animate-slide-out-left');
  };

  const handleVoteAttempt = (decision: 'HODL' | 'DUMP'): boolean => {
    if (!user) {
      setIsLoginModalOpen(true);
      return false;
    }
    handleDecision(decision);
    return true;
  };
  
  const handleAnimationEnd = () => {
    if (animationClass.includes('slide-out')) {
      handleNextCoin();
    }
  };

  const handleToggleWatchlist = (coinId: string) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    const newWatchlist = watchlist.includes(coinId)
      ? watchlist.filter(id => id !== coinId)
      : [...watchlist, coinId];
    saveWatchlist(newWatchlist);
  };

  const handleShare = async (coin: CoinDetail) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?coinId=${coin.id}`;
    const shareData = {
        title: `HODL or DUMP: ${coin.name}?`,
        text: `What's your verdict on ${coin.name} (${coin.symbol})? Cast your vote on HODL or DUMP!`,
        url: shareUrl,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
        }
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Project link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Could not copy link. Please copy it manually.');
        });
    }
  };


  const handleRestart = () => {
    setIsFinished(false);
    setCurrentCoinDetail(null);
    setDecisions([]); // Clear current round's decisions
    setIsInitializing(true);
    fetchCoins().finally(() => setIsInitializing(false));
  };
  
  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsLoginModalOpen(false);
    setAuthError(null);
  }

  const handleProjectsUpdated = () => {
    console.log("Projects updated in admin panel, refetching coins for game...");
    // Refetch the coins list to include any new or updated admin coins.
    // This will not reset the game for the user, just update the available coins list.
    fetchCoins();
  };
  
  const handleSelectSearchResult = (coinId: string) => {
    const foundIndex = coins.findIndex(c => c.id === coinId);
    if (foundIndex !== -1) {
      const [foundCoin] = coins.splice(foundIndex, 1);
      setCoins([foundCoin, ...coins]);
      setCurrentCoinIndex(0);
    }
    setSearchTerm('');
  };

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return [];
    return coins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [coins, searchTerm]);

  const renderContent = () => {
    switch (currentScreen) {
      case 'portfolio':
        return user ? <PortfolioScreen history={history} onNavigate={handleNavigate} /> : <div />;
      case 'profile':
        return user ? <ProfileScreen user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onNavigate={handleNavigate} /> : <div />;
      case 'watchlist':
        return user ? <WatchlistScreen watchlistCoinIds={watchlist} onNavigate={handleNavigate} getDetailsForId={getDetailsForId} /> : <div />;
      case 'admin':
        return user?.isAdmin ? <AdminPanel onNavigate={handleNavigate} onProjectsUpdated={handleProjectsUpdated} /> : <div />;
      case 'promote':
        return <PromoteScreen onNavigate={handleNavigate} />;
      case 'game':
      default:
        return (
          <>
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                </div>
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a project to HODL or DUMP..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                />
              </div>
            </div>
          
            <FeaturedProjects 
              featuredCoins={featuredCoins} 
              onSelectProject={handleSelectSearchResult}
              onPromoteClick={() => handleNavigate('promote')}
            />
          
            {searchTerm ? (
               <div className="max-w-2xl mx-auto animate-slide-in-up" style={{animationDuration: '200ms'}}>
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 px-2">Search Results</h3>
                        {filteredCoins.length > 0 ? (
                            <div className="space-y-2">
                                {filteredCoins.map(coin => {
                                    return (
                                    <button key={coin.id} onClick={() => handleSelectSearchResult(coin.id)} className="w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-4">
                                        {(coin as CoinDetail).logo ? (
                                            <img src={(coin as CoinDetail).logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-purple-600 flex-shrink-0">
                                                {coin.symbol.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-800">{coin.name}</p>
                                            <p className="text-sm text-gray-500">{coin.symbol}</p>
                                        </div>
                                    </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No results found for "{searchTerm}".</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
              <>
                {isFinished && <ResultsScreen decisions={decisions} onRestart={handleRestart} />}
                {isLoading && !currentCoinDetail && <CryptoCardSkeleton />}
                {error && !currentCoinDetail && (
                  <div className="text-center h-96 flex flex-col justify-center items-center">
                    <p className="text-red-500 text-2xl">{error}</p>
                    <button onClick={() => fetchCoins()} className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Try Again
                    </button>
                  </div>
                )}
                {currentCoinDetail && (
                  <div className={animationClass} onAnimationEnd={handleAnimationEnd}>
                    <CryptoCard
                      key={currentCoinDetail.id}
                      coin={currentCoinDetail}
                      onHodl={() => handleVoteAttempt('HODL')}
                      onDump={() => handleVoteAttempt('DUMP')}
                      onToggleWatchlist={handleToggleWatchlist}
                      onShare={handleShare}
                      isWatchlisted={watchlist.includes(currentCoinDetail.id)}
                      isHighlighted={currentCoinDetail.highlightedUntil ? currentCoinDetail.highlightedUntil > Date.now() : false}
                    />
                  </div>
                )}
                {!isFinished && !currentCoinDetail && !isLoading && !error && <CryptoCardSkeleton />}
              </>
            )}
          </>
        );
    }
  }
  
  if (isInitializing) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (userAwaiting2FA) {
    return (
        <TwoFactorAuthLoginScreen 
            user={userAwaiting2FA} 
            onVerify={handleVerify2FA} 
            onCancel={() => { setUserAwaiting2FA(null); setAuthError(null); }}
            error={authError}
        />
    );
  }

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} onNavigateToSignUp={() => handleNavigate('signup')} error={authError} />;
  }

  if (currentScreen === 'signup') {
    return <SignUpScreen onSignUp={handleSignUp} onNavigateToLogin={() => handleNavigate('login')} error={authError} />;
  }

  return (
    <div className="min-h-screen flex flex-col text-gray-800 font-sans">
      {isLoginModalOpen && (
        <LoginRequiredModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onNavigate={handleNavigate} 
        />
      )}
      
      <Header 
        user={user} 
        onNavigate={handleNavigate}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      <AdBanner />
    </div>
  );
};

export default App;
