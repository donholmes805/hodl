
import React, { useState } from 'react';
import { User } from '../types';

// --- 2FA Setup Modal (defined here to avoid creating new files) ---
const TwoFactorAuthSetupModal: React.FC<{
  userEmail: string;
  onClose: () => void;
  onVerify: (code: string) => void;
  error: string | null;
}> = ({ userEmail, onClose, onVerify, error }) => {
  const [code, setCode] = useState('');
  const dummySecret = 'JBSWY3DPEHPK3PXP'; // For display purposes
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/HODLorDUMP:${encodeURIComponent(userEmail)}?secret=${dummySecret}&issuer=HODLorDUMP`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="2fa-setup-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all duration-300 scale-95 animate-slide-in-up"
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
        <h3 id="2fa-setup-title" className="text-2xl font-bold text-gray-800 mb-2">Set Up 2FA</h3>
        <p className="text-gray-600 mb-6">Scan the QR code with your authenticator app.</p>
        
        <div className="flex flex-col items-center space-y-4">
            <img src={qrCodeUrl} alt="QR Code for 2FA" className="rounded-lg border-4 border-gray-200" />
            <p className="text-sm text-gray-500">Or enter this key manually:</p>
            <code className="text-lg bg-gray-100 p-2 rounded-md font-mono tracking-widest">{dummySecret}</code>
        </div>
        
        <hr className="my-6"/>

        <form onSubmit={handleSubmit}>
            <p className="text-center font-semibold text-gray-700 mb-2">Verify Setup</p>
            <p className="text-center text-gray-500 mb-4 text-sm">Enter the 6-digit code from your app to complete setup.</p>
            {error && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-fade-in">{error}</p>}
            <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center text-2xl tracking-[.5em] focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="_ _ _ _ _ _"
            />
            <button
                type="submit"
                disabled={code.length !== 6}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200 disabled:opacity-50"
            >
                Verify & Enable
            </button>
        </form>
      </div>
    </div>
  );
};


interface ProfileScreenProps {
  user: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onNavigate: (screen: 'game' | 'portfolio' | 'profile' | 'watchlist') => void;
}

const NavButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
    <button
        onClick={onClick}
        className="w-full text-left flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
    >
        <div className="mr-4 text-purple-600 bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
            {icon}
        </div>
        <span className="font-semibold text-lg text-gray-700 flex-grow">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </button>
);


const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdateUser, onLogout, onNavigate }) => {
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [tfaSetupError, setTfaSetupError] = useState<string | null>(null);

  const handle2FAToggle = () => {
    if (user.has2FA) {
      // Disable 2FA
      if (window.confirm("Are you sure you want to disable Two-Factor Authentication?")) {
        onUpdateUser({ ...user, has2FA: false });
      }
    } else {
      // Enable 2FA - open modal
      setTfaSetupError(null);
      setIs2FAModalOpen(true);
    }
  };

  const handleVerifyAndEnable2FA = (code: string) => {
    // In a real app, this would be a server-side check. Here we use a hardcoded value for demonstration.
    if (code === '123456') {
      onUpdateUser({ ...user, has2FA: true });
      setIs2FAModalOpen(false);
      setTfaSetupError(null);
    } else {
      setTfaSetupError('Invalid code. Please try again.');
    }
  };

  return (
    <>
      {is2FAModalOpen && (
        <TwoFactorAuthSetupModal 
          userEmail={user.email}
          onClose={() => setIs2FAModalOpen(false)}
          onVerify={handleVerifyAndEnable2FA}
          error={tfaSetupError}
        />
      )}
      <div className="max-w-2xl mx-auto p-4 sm:p-8 animate-slide-in-up">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-purple-400 mb-4 shadow-lg"
            />
            <h2 className="text-4xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-lg text-gray-500">{user.email}</p>
          </div>

          <div className="space-y-4 mb-8">
            <NavButton 
              onClick={() => onNavigate('portfolio')}
              label="My Portfolio"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
            <NavButton 
              onClick={() => onNavigate('watchlist')}
              label="My Watchlist"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />
          </div>
          
          <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                  <h4 className="font-semibold text-gray-700">Two-Factor Authentication (2FA)</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
              </div>
              <button
                  onClick={handle2FAToggle}
                  aria-pressed={user.has2FA}
                  className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  user.has2FA ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
              >
                  <span className="sr-only">Use Two-Factor Authentication</span>
                  <span
                  aria-hidden="true"
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                      user.has2FA ? 'translate-x-5' : 'translate-x-0'
                  }`}
                  />
              </button>
              </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <button
              onClick={onLogout}
              className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileScreen;
