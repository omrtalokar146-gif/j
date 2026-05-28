import React, { useState } from 'react';
import { UserProfile } from '../types';
import { audioSystem } from './AudioSystem';
import { Gamepad2, User, LogIn, LogOut, Bell, Flame, ShieldAlert, Award, Grid, Star } from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'games' | 'auth' | 'profile' | 'admin';
  setActiveTab: (tab: 'home' | 'games' | 'auth' | 'profile' | 'admin') => void;
  userProfile: UserProfile | null; // Null if signed out
  onLogout: () => void;
}

export default function Navbar({ activeTab, setActiveTab, userProfile, onLogout }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const handleTabClick = (tab: 'home' | 'games' | 'auth' | 'profile') => {
    audioSystem.playClick();
    setActiveTab(tab);
  };

  const isAdmin = userProfile && ['admin', 'omy13456'].includes(userProfile.username.toLowerCase());

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'games', label: 'Explore Games' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel' }] : []),
  ] as const;

  // Unlocked achievements notifications count
  const unlockedCount = userProfile?.achievements.filter(a => a.unlocked).length || 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050409]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
      {/* Brand Logo with modern futuristic style */}
      <div 
        onClick={() => handleTabClick('home')}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="relative bg-gradient-to-tr from-purple-600 to-cyan-400 p-2 rounded-xl border border-white/10 group-hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.35)]">
          <Gamepad2 size={22} className="text-white animate-pulse" />
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

      {/* Navigation center tabs */}
      <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-2xl p-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`px-5 py-2 rounded-xl text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
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
            className={`px-5 py-2 rounded-xl text-xs uppercase font-mono tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 border border-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            My Terminal
          </button>
        )}
      </nav>

      {/* Profile/Auth Status items */}
      <div className="flex items-center gap-4">
        {userProfile ? (
          <>
            {/* Level badge summary */}
            <div className="hidden lg:flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3.5 py-1.5 cursor-pointer hover:bg-purple-500/15 duration-200" onClick={() => handleTabClick('profile')}>
              <Flame size={14} className="text-amber-400" />
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-widest">
                LVL {userProfile.level}
              </span>
            </div>

            {/* Notifications panel toggle */}
            <div className="relative">
              <button 
                onClick={() => { audioSystem.playClick(); setShowNotifications(!showNotifications); }}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
              >
                <Bell size={16} />
                {unlockedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 border-2 border-[#050409] text-white text-[9px] font-mono flex items-center justify-center rounded-full font-bold">
                    {unlockedCount}
                  </span>
                )}
              </button>

              {/* Notifications box overlay */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-[#0d0a15]/95 backdrop-blur-lg border border-[#a855f7]/30 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] p-4 text-left z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-2.5">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Award size={13} className="text-purple-400" /> Sync Intelligence
                    </span>
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-2 py-0.5 rounded-full">
                      Network Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                    {unlockedCount > 0 ? (
                      userProfile.achievements
                        .filter(a => a.unlocked)
                        .map(a => (
                          <div key={a.id} className="flex gap-3 bg-white/5 rounded-xl p-2 border border-white/5 hover:bg-white/10 duration-200">
                            <div className="text-yellow-400 text-xs mt-0.5"><Star size={14} fill="currentColor" /></div>
                            <div>
                              <p className="text-white text-xs font-bold leading-tight">{a.title}</p>
                              <p className="text-gray-400 text-[10px] leading-tight mt-0.5">{a.description}</p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-400 text-xs text-center py-4 font-mono">
                        No active badges currently. Play games to unlock achievement parameters!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger dropdown */}
            <div 
              onClick={() => handleTabClick('profile')}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-1.5 pr-4 hover:bg-white/10 duration-300 cursor-pointer"
            >
              <img 
                src={userProfile.avatar} 
                alt={userProfile.username} 
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-xl object-cover border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)] pointer-events-none"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white line-clamp-1 truncate block -mb-0.5">
                  {userProfile.username}
                </span>
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                  {userProfile.rank}
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                audioSystem.playClick();
                onLogout();
              }}
              className="hidden lg:flex p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:text-white rounded-xl transition-all font-mono text-xs items-center gap-1.5 cursor-pointer"
              title="Disconnect Server Connection"
            >
              <LogOut size={14} /> Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => handleTabClick('auth')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-500 text-white hover:from-purple-500 hover:to-cyan-400 rounded-2xl text-xs uppercase font-mono tracking-widest font-bold transition-transform hover:scale-103 duration-200 shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer"
          >
            <LogIn size={14} /> Gateway Key
          </button>
        )}
      </div>
    </header>
  );
}
