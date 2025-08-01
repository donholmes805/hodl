
import React, { useState, FormEvent } from 'react';
import Logo from './Logo';
import AdBanner from './AdBanner';

interface SignUpScreenProps {
  onSignUp: (details: { name: string; email: string; pass: string }) => void;
  onNavigateToLogin: () => void;
  error: string | null;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onNavigateToLogin, error }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      onSignUp({ name, email, pass: password });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-grow flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full mx-auto">
          <div className="flex justify-center items-center space-x-3 mb-6">
              <Logo />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
                  HODL or DUMP
              </h1>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Create Your Account</h2>
            <p className="text-center text-gray-500 mb-6">Join the ultimate crypto showdown.</p>
             {error && <p className="text-center text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-fade-in">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="username"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="CryptoChad"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Create Account
              </button>
            </form>
          </div>
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
      <AdBanner />
    </div>
  );
};

export default SignUpScreen;
