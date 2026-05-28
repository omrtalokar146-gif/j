import React, { useState } from 'react';
import { UserProfile, Game } from '../types';
import { audioSystem } from './AudioSystem';
import { Star, Shield, Trophy, Zap, Clock, StarOff, Edit3, Settings, Save, LogOut, X, Flame, CheckCircle2, Crown, Award } from 'lucide-react';

interface ProfileViewProps {
  userProfile: UserProfile;
  games: Game[];
  onPlayGame: (game: Game) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

export default function ProfileView({ userProfile, games, onPlayGame, updateProfile, onLogout }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom robotic avatar list for futuristic selection
  const avatarList = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150', // neon orb
    'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=150', // digital light grid
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=150', // digital geometry fluid
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=150', // abstract gold paint
  ];
  
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar);

  const handleEditProfile = () => {
    audioSystem.playClick();
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    audioSystem.playPowerUp();
    updateProfile({ avatar: selectedAvatar });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    audioSystem.playClick();
    setSelectedAvatar(userProfile.avatar);
    setIsEditing(false);
  };

  const toggleFavorite = (gameId: string) => {
    audioSystem.playClick();
    const isFav = userProfile.favoriteGames.includes(gameId);
    let updated: string[];
    if (isFav) {
      updated = userProfile.favoriteGames.filter((id) => id !== gameId);
    } else {
      updated = [...userProfile.favoriteGames, gameId];
    }
    updateProfile({ favoriteGames: updated });
  };

  // Convert recently played IDs to actual Game entities
  const recentlyPlayedGames = userProfile.recentlyPlayed
    .map((id) => games.find((g) => g.id === id))
    .filter((g): g is Game => !!g);

  // Convert favorite IDs to actual Game entities
  const favoriteGames = userProfile.favoriteGames
    .map((id) => games.find((g) => g.id === id))
    .filter((g): g is Game => !!g);

  const levelProgressPercent = Math.min(
    100,
    Math.floor((userProfile.xp / userProfile.xpToNextLevel) * 100)
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 relative z-10 flex flex-col gap-10 text-left">
      
      {/* Upper Grid: Profile Header details & Interactive level system */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Profile Details Panel (Left Card) */}
        <div className="lg:col-span-7 bg-[#0a0712]/70 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-stretch justify-between relative overflow-hidden backdrop-blur-md">
          {/* Neon side decor halo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            {/* Outer animated neon ring for Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-500 via-[#ec4899] to-cyan-400 rounded-2xl blur opacity-65 group-hover:opacity-100 transition duration-500" />
              <img
                src={userProfile.avatar}
                alt={userProfile.username}
                referrerPolicy="no-referrer"
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-white/10 pointer-events-none"
              />
            </div>

            <div className="flex flex-col justify-center text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl sm:text-3xl font-sans font-black text-white tracking-tight">
                  {userProfile.username}
                </h1>
                <Crown size={18} className="text-yellow-400 animate-pulse" />
              </div>
              
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 mt-1 block">
                {userProfile.rank}
              </span>
              <p className="text-gray-500 text-xs font-mono mt-1">
                Linked: {userProfile.email || 'Local Account'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 mt-4 justify-center sm:justify-start">
                <button
                  onClick={handleEditProfile}
                  className="cursor-pointer font-mono text-[9px] uppercase tracking-widest font-bold px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Edit3 size={11} /> Modify Core Data
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      onLogout();
                    }}
                    className="cursor-pointer font-mono text-[9px] uppercase tracking-widest font-bold px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-xl transition-all flex items-center gap-1.5"
                    title="Log Out of Plateform"
                  >
                    <LogOut size={11} /> Disconnect Matrix
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-white/5 pt-6 sm:pt-0 sm:pl-8 flex flex-col justify-between items-center sm:items-end w-full sm:w-auto">
            <div className="text-center sm:text-right w-full">
              <span className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">
                Account Status
              </span>
              <div className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 justify-center sm:justify-end mt-1 font-mono">
                <CheckCircle2 size={13} /> SECURED_ACTIVE
              </div>
            </div>

            <div className="mt-4 sm:mt-0 text-center sm:text-right">
              <span className="text-gray-500 text-[10px] uppercase font-mono tracking-widest block">
                Core Runtimes
              </span>
              <span className="text-2xl font-bold font-sans text-white mt-1 block">
                {userProfile.gamesPlayedCount}{' '}
                <span className="text-xs text-gray-500 font-mono font-normal">SIMS</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level Progression & EXP Panel (Right Card) */}
        <div className="lg:col-span-5 bg-[#0a0712]/70 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <span className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">
                Platform Sync Status
              </span>
              <h2 className="text-2xl font-black font-sans text-white tracking-widest mt-1">
                LEVEL_0{userProfile.level}
              </h2>
            </div>
            
            <div className="bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 px-3.5 py-2 rounded-2xl border border-purple-500/25 font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
              XP System
            </div>
          </div>

          {/* Level Progress loading bar element */}
          <div className="my-6">
            <div className="flex justify-between items-end text-xs font-mono text-gray-400 mb-2">
              <span>{userProfile.xp} / {userProfile.xpToNextLevel} XP</span>
              <span className="text-purple-400 font-bold">{levelProgressPercent}% SYNC</span>
            </div>
            
            {/* Actual glowing progress lane */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 via-[#ec4899] to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-left text-gray-400 text-xs leading-relaxed font-mono">
            Earn <span className="text-emerald-400 font-semibold">+{userProfile.xpToNextLevel - userProfile.xp} additional XP</span> to synchronize matrix level {userProfile.level + 1}. Standard multipliers are active.
          </p>
        </div>
      </div>

      {/* Editing overlay modal if triggered */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0b0914] border border-white/10 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold font-sans text-white mb-4 uppercase tracking-widest font-black text-center">
              Configure Terminal Identity
            </h3>

            <div className="flex flex-col gap-5">
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-semibold">
                  Current Nickname
                </span>
                <p className="mt-2 text-sm font-mono text-white">{userProfile.username}</p>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-semibold">
                  Choose Holographic Core Avatar
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {avatarList.map((avatar, idx) => (
                    <button
                      key={idx}
                      onClick={() => { audioSystem.playHover(); setSelectedAvatar(avatar); }}
                      className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedAvatar === avatar ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSaveProfile}
                  className="cursor-pointer flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Save size={13} /> Save Adjustments
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="cursor-pointer py-3 px-5 bg-white/5 text-gray-400 hover:text-white border border-white/10 rounded-xl font-mono text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges and achievement statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Achievements list panel (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-6 text-left">
          <h2 className="text-xl md:text-2xl font-sans font-bold text-white tracking-tight border-b border-white/5 pb-3 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            Synchronized Achievements Badges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userProfile.achievements.map((badge) => (
              <div
                key={badge.id}
                className={`flex gap-4 p-4 rounded-3xl border transition-all ${
                  badge.unlocked
                    ? 'bg-gradient-to-tr from-white/5 to-white/[0.01] border-white/10 text-white hover:border-purple-500/20'
                    : 'bg-black/40 border-white/5 text-gray-500 opacity-60'
                }`}
              >
                {/* Badge thumbnail */}
                <div
                  className={`relative w-12 h-12 flex items-center justify-center rounded-2xl border ${
                    badge.unlocked
                      ? 'bg-purple-500/10 border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-purple-300'
                      : 'bg-white/5 border-white/5 text-gray-500'
                  }`}
                >
                  <Award size={22} className={badge.unlocked ? 'animate-pulse' : ''} />
                </div>

                {/* Badge title details */}
                <div className="flex flex-col text-left justify-center">
                  <span className="text-xs font-bold leading-tight flex items-center gap-1.5 text-white">
                    {badge.title}
                    {badge.unlocked && (
                      <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-mono font-normal tracking-wide px-1.5 py-0.5 rounded-full uppercase">
                        Active
                      </span>
                    )}
                  </span>
                  <p className="text-gray-400 text-[10px] leading-relaxed mt-1">
                    {badge.description}
                  </p>
                  
                  {/* Lock telemetry */}
                  {badge.unlocked ? (
                    <span className="text-gray-500 text-[8px] font-mono mt-1.5">
                      UNLOCKED_DEC: {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Active'}
                    </span>
                  ) : (
                    <span className="text-gray-600 text-[8px] font-mono mt-1.5">
                      LOCK_STATUS: UNAUTHORIZED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Played & Bookmarks Panel (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          
          {/* Recently Played List */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold font-sans text-white tracking-tight border-b border-white/5 pb-3">
              Telemetry Log
            </h2>

            {recentlyPlayedGames.length > 0 ? (
              <div className="flex flex-col gap-3">
                {recentlyPlayedGames.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => { audioSystem.playClick(); onPlayGame(game); }}
                    className="flex justify-between items-center bg-white/5 border border-white/10 hover:border-purple-500/20 hover:bg-white/10 hover:scale-102 p-3 rounded-2xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={game.image}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover pointer-events-none"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">
                          {game.title}
                        </span>
                        <span className="text-[9px] font-mono text-purple-400 mt-0.5 uppercase">
                          {game.category} System
                        </span>
                      </div>
                    </div>
                    
                    <button className="text-[9px] uppercase tracking-wider font-mono px-3.5 py-1.5 bg-[#a855f7]/10 text-purple-300 font-bold rounded-xl hover:bg-[#a855f7] hover:text-white transition duration-200">
                      Sync
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs font-mono py-4 text-center border border-dashed border-white/5 rounded-2xl">
                No active play session records located.
              </p>
            )}
          </div>

          {/* Favorites List */}
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-xl font-bold font-sans text-white tracking-tight border-b border-white/5 pb-3">
              Favorite Channels
            </h2>

            {favoriteGames.length > 0 ? (
              <div className="flex flex-col gap-3">
                {favoriteGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-2xl relative"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={game.image}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover pointer-events-none"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white leading-tight">
                          {game.title}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400 mt-0.5 uppercase">
                          {game.rating} Rated
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleFavorite(game.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl cursor-pointer"
                        title="Remove bookmark"
                      >
                        <StarOff size={12} />
                      </button>
                      <button
                        onClick={() => { audioSystem.playClick(); onPlayGame(game); }}
                        className="p-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white rounded-xl font-mono text-[9px] font-bold uppercase cursor-pointer"
                      >
                        Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-xs font-mono py-5 text-center border border-dashed border-white/5 rounded-2xl p-4">
                No favorited simulations. Filter games on the Explore Grid and toggle bookmarks to save channels here.
              </div>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
}
