import React, { useState } from 'react';
import { audioSystem } from './AudioSystem';
import { LogIn, User, Lock, ShieldCheck } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (username: string, password: string, isSignUp: boolean) => void;
  authError?: string;
}

export default function AuthPage({ onSignIn, authError }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Validation feedback indicators
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validateForm = () => {
    const nextErrors: typeof errors = {};
    if (!username.trim()) {
      nextErrors.username = 'A unique nickname is required.';
    }
    if (password.length < 4) {
      nextErrors.password = 'Password must be at least 4 characters.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audioSystem.playClick();
    if (validateForm()) {
      audioSystem.playPowerUp();
      onSignIn(username.trim(), password, isSignUp);
    } else {
      audioSystem.playExplosion();
    }
  };

  const handleToggleMode = () => {
    audioSystem.playClick();
    setIsSignUp(!isSignUp);
    setErrors({});
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col justify-center items-center min-h-[80vh]">
      {/* Radiant backlight ambient halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#a855f7]/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Glassmorphic controller frame card */}
      <div className="w-full max-w-md bg-[#0a0712]/80 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-8 md:p-10 text-left relative overflow-hidden backdrop-blur-md">
        
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#a855f7]/40 rounded-tl-[2.5rem]" />
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#06b6d4]/40 rounded-tr-[2.5rem]" />
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#ec4899]/40 rounded-bl-[2.5rem]" />
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#a855f7]/40 rounded-br-[2.5rem]" />

        {/* Card header elements */}
        <div className="flex flex-col items-center text-center gap-2 mb-8 relative z-10">
          <div className="bg-gradient-to-tr from-[#a855f7] to-[#06b6d4] p-3 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white">
            <ShieldCheck size={28} />
          </div>
          
          <h2 className="text-2xl font-black font-sans text-white tracking-widest uppercase mt-2">
            {isSignUp ? 'Sync New Account' : 'Gateway Access Link'}
          </h2>
          <p className="text-gray-400 text-xs font-mono max-w-xs mt-1">
            {isSignUp 
              ? 'Formulate neural connection keys to access live multiplayer simulations.' 
              : 'Supply credentials matrix to download terminal user states.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          
          {/* USERNAME INPUT (ONLY FOR SIGN UP) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-semibold">
              Pilot Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AstroPioneer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all ${
                  errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#a855f7]'
                }`}
              />
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            {errors.username && <span className="text-[10px] text-red-400 font-mono">{errors.username}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-semibold">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-white/5 border rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 transition-all ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#a855f7]'
                }`}
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
            {errors.password && <span className="text-[10px] text-red-400 font-mono">{errors.password}</span>}
          </div>
          {authError && <span className="text-[10px] text-red-400 font-mono">{authError}</span>}

          {/* Submit Action Button */}
          <button
            type="submit"
            className="cursor-pointer w-full mt-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono font-bold uppercase tracking-widest text-xs px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-102 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={13} /> {isSignUp ? 'Construct Key link' : 'Authorize Core Entry'}
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col gap-4 relative z-10 text-center">
          <span className="text-[9px] uppercase font-mono tracking-widest text-gray-500">
            {isSignUp
              ? 'Create a unique profile using only a nickname and password.'
              : 'Sign in with your saved nickname and password.'}
          </span>
          <button
            onClick={handleToggleMode}
            className="cursor-pointer text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
          >
            {isSignUp ? 'Already registered? Sign in instead' : 'New user? Register a profile'}
          </button>
        </div>

      </div>
    </div>
  );
}
