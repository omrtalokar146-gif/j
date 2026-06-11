import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioSystem } from './AudioSystem';
import { Gamepad2, User, LogIn, LogOut, Bell, Flame, ShieldAlert, Award, Grid, Star, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'games' | 'auth' | 'profile' | 'admin';
  setActiveTab: (tab: 'home' | 'games' | 'auth' | 'profile' | 'admin') => void;
  userProfile: UserProfile | null; // Null if signed out
  onLogout: () => void;
  brandLogo?: string;
}

export default function Navbar({ activeTab, setActiveTab, userProfile, onLogout, brandLogo }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = userProfile && ['omy134567'].includes(userProfile.username.toLowerCase());

  const navItems: Array<{ id: 'home' | 'games' | 'admin'; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'games', label: 'Explore Games' },
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin Panel' }] : []),
  ];

  const handleTabClick = (tab: 'home' | 'games' | 'auth' | 'profile' | 'admin') => {
    audioSystem.playClick();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Unlocked achievements notifications count (defensive when achievements missing)
  const unlockedCount = (userProfile?.achievements || []).filter(a => a.unlocked).length || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050409]/80 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-6 md:px-12 flex flex-col gap-3 sm:gap-4 transition-all duration-300">
      <div className="w-full flex items-center justify-between gap-3">
        <div 
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative bg-gradient-to-tr from-purple-600 to-cyan-400 p-2 rounded-xl border border-white/10 group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.35)] overflow-hidden">
            {brandLogo ? (
              <img src={brandLogo} alt="App logo" className="w-6 h-6 rounded-lg object-cover" />
            ) : (
              <Gamepad2 size={22} className="text-white animate-pulse" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-[0.25em] font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300">
              NEXUS
            </span>
            <span className="text-[9px] uppercase tracking-widest font-mono text-purple-400 font-bold -mt-1">
              Core Portal
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className={`w-full flex-col lg:flex-row ${mobileMenuOpen ? 'flex' : 'hidden lg:flex'} flex-wrap items-center gap-2 bg-white/5 border border-white/5 rounded-2xl p-3 overflow-hidden max-w-full`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`w-full lg:w-auto px-4 py-2 rounded-xl text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {item.label}
          </button>
        ))}

        {userProfile && (
          <button
            onClick={() => handleTabClick('profile')}
            className={`w-full lg:w-auto px-4 py-2 rounded-xl text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            My Terminal
          </button>
        )}

        {!userProfile && (
          <button
            onClick={() => handleTabClick('auth')}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl text-xs uppercase font-mono tracking-widest font-bold transition-transform hover:scale-103 duration-200 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
          >
            <LogIn size={14} /> Gateway Key
          </button>
        )}
      </nav>

      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {userProfile ? (
            <>
              <button
                type="button"
                onClick={() => handleTabClick('profile')}
                className="hidden lg:inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3.5 py-1.5 cursor-pointer hover:bg-purple-500/15 duration-200"
              >
                <Flame size={14} className="text-amber-400" />
                <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                  LVL {userProfile.level}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { audioSystem.playClick(); setShowNotifications(!showNotifications); }}
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative"
              >
                <Bell size={16} />
                {unlockedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 border-2 border-[#050409] text-white text-[9px] font-mono flex items-center justify-center rounded-full font-bold">
                    {unlockedCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('profile')}
                className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 hover:bg-white/10 duration-300"
              >
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-xl object-cover border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white truncate">
                    {userProfile.username}
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                    {userProfile.rank}
                  </span>
                </div>
              </button>
            </>
          ) : null}
        </div>

        {userProfile ? (
          <button 
            onClick={() => {
              audioSystem.playClick();
              onLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/20 rounded-xl transition-all font-mono text-xs uppercase tracking-widest font-semibold"
            title="Disconnect Server Connection"
          >
            <LogOut size={14} /> Disconnect
          </button>
        ) : null}
      </div>
    </header>
  );
}
