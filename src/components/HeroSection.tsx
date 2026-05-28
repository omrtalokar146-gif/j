import React, { useState, useEffect } from 'react';
import { Game } from '../types';
import { audioSystem } from './AudioSystem';
import { Play, Flame, Star, Award, ChevronRight, Gamepad2, Users, Rocket, Target, ShieldCheck } from 'lucide-react';

interface HeroSectionProps {
  onPlayGame: (game: Game) => void;
  trendingGames: Game[];
  featuredGames: Game[];
  setActiveTab: (tab: 'home' | 'games' | 'auth' | 'profile') => void;
}

export default function HeroSection({ onPlayGame, trendingGames, featuredGames, setActiveTab }: HeroSectionProps) {
  const [currentFeaturedIdx, setCurrentFeaturedIdx] = useState(0);

  // Auto transition featured carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeaturedIdx((prev) => (prev + 1) % featuredGames.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [featuredGames.length]);

  const activeFeaturedGame = featuredGames[currentFeaturedIdx] || featuredGames[0];

  const handleCtaClick = (type: 'play-random' | 'explore') => {
    audioSystem.playClick();
    if (type === 'explore') {
      setActiveTab('games');
    } else {
      // Play first game automatically
      if (featuredGames.length > 0) {
        onPlayGame(featuredGames[0]);
      }
    }
  };

  const platformStats = [
    { value: '348K+', label: 'Digital Pilots', icon: <Users size={14} className="text-cyan-400" /> },
    { value: '0.04ms', label: 'Matrix Telemetry', icon: <Rocket size={14} className="text-purple-400" /> },
    { value: '99.98%', label: 'Gateway Uptime', icon: <ShieldCheck size={14} className="text-emerald-400" /> },
    { value: '1,500+', label: 'Active Rallies', icon: <Target size={14} className="text-pink-400" /> },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-20 relative z-10 flex flex-col gap-16 md:gap-24">
      {/* Decorative top landing row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Core Slogan Block */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          {/* Tag marker */}
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono border border-purple-500/25 bg-purple-500/5 text-purple-300 px-4 py-1.5 rounded-full w-fit">
            <Flame size={12} className="text-purple-400 animate-pulse" />
            2026 Flagship Gaming Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tight text-white leading-[1.05]">
            Play Online Games{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-[#d946ef] to-cyan-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              Anytime
            </span>
          </h1>

          <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-xl">
            Plug straight into a high-fidelity synthetic multiverse. Compete against elite adaptive AI engines, experience immediate glassmorphic response, and unlock legendary achievements with fully fluid zero-latency canvas simulations.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <button
              onClick={() => handleCtaClick('play-random')}
              className="group/btn cursor-pointer bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] hover:from-[#7c3aed] hover:to-[#0891b2] text-white font-mono uppercase tracking-widest text-xs font-bold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-103 shadow-[0_0_25px_rgba(139,92,246,0.35)] flex items-center gap-2.5"
            >
              <Play size={13} fill="currentColor" /> Start Playing
            </button>
            <button
              onClick={() => handleCtaClick('explore')}
              className="cursor-pointer bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 font-mono uppercase tracking-widest text-xs font-bold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-2"
            >
              Explore Games <ChevronRight size={14} />
            </button>
          </div>

          {/* Mini platform telemetry markers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 border-t border-white/5 pt-8">
            {platformStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-gray-500 text-[10px] uppercase font-mono tracking-widest flex items-center gap-1">
                  {stat.icon}
                  {stat.label}
                </span>
                <span className="text-white text-base md:text-lg font-bold font-sans">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Carousel Slide panel in Hero */}
        <div className="lg:col-span-5 relative w-full flex justify-center items-center">
          {/* Radiant back glows */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-[3rem] blur-2xl opacity-60 pointer-events-none" />

          {activeFeaturedGame && (
            <div className="relative w-full max-w-sm bg-[#0a0712]/90 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] group transition-all duration-500 hover:border-purple-500/40">
              {/* Cover image area */}
              <div className="relative h-60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0712] via-transparent to-transparent z-10" />
                <img
                  src={activeFeaturedGame.image}
                  alt={activeFeaturedGame.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                
                {/* Category label */}
                <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest text-purple-300 uppercase border border-white/10">
                  Featured Simulation
                </span>

                <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold text-yellow-400">
                  <Star size={11} fill="currentColor" /> {activeFeaturedGame.rating}
                </div>
              </div>

              {/* Game description grid */}
              <div className="p-6 relative z-10 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  {activeFeaturedGame.title}
                </h3>
                <p className="text-gray-400 text-xs lines-2 line-clamp-2 leading-relaxed">
                  {activeFeaturedGame.description}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {activeFeaturedGame.players}
                  </span>
                  
                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      onPlayGame(activeFeaturedGame);
                    }}
                    className="cursor-pointer flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-mono text-[10px] tracking-widest uppercase font-bold px-4.5 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                  >
                    <Play size={10} fill="currentColor" /> Direct Play
                  </button>
                </div>
              </div>

              {/* Horizontal slide navigation bullets */}
              <div className="flex justify-center gap-2 pb-5 pt-1">
                {featuredGames.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      audioSystem.playHover();
                      setCurrentFeaturedIdx(index);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      index === currentFeaturedIdx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Games Row */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
              Multiplayer Grid
            </span>
            <h2 className="text-2xl md:text-3xl font-sans font-bold text-white tracking-tight">
              Trending Simulations
            </h2>
          </div>

          <button
            onClick={() => handleCtaClick('explore')}
            className="text-xs font-mono uppercase tracking-wider text-purple-300 hover:text-white flex items-center gap-1.5 cursor-pointer duration-200"
          >
            All Sectors <ChevronRight size={14} />
          </button>
        </div>

        {/* Grid cards listing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingGames.slice(0, 3).map((game) => (
            <div
              key={game.id}
              className="bg-[#0b0a13]/70 border border-white/5 rounded-3xl overflow-hidden shadow-md group hover:border-[#a855f7]/30 transition-all duration-300 hover:translate-y-[-4px] flex flex-col"
            >
              <div className="relative h-44 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a13] to-transparent opacity-85 z-10" />
                <img
                  src={game.image}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 pointer-events-none"
                />

                <span className="absolute top-3 left-3 z-20 px-2.5 py-0.5 bg-white/5 backdrop-blur-md rounded-full text-[8.5px] font-mono tracking-widest text-[#a855f7] uppercase border border-white/5">
                  {game.category}
                </span>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 text-left relative z-10 -mt-6">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-1 group-hover:text-purple-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {game.players}
                  </span>
                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      onPlayGame(game);
                    }}
                    className="cursor-pointer px-4 py-2.5 bg-white/5 border border-white/10 group-hover:border-purple-500/30 text-white hover:bg-[#a855f7] hover:border-transparent font-mono text-[9px] uppercase tracking-wider font-semibold rounded-xl transition-all duration-300"
                  >
                    Play
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
