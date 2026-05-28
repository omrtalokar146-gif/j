import React, { useState, useMemo } from 'react';
import { Game, GameCategory } from '../types';
import { audioSystem } from './AudioSystem';
import { Search, SlidersHorizontal, Star, Play, Circle, Gamepad, Compass, Grid } from 'lucide-react';

interface GameListProps {
  games: Game[];
  onPlayGame: (game: Game) => void;
}

export default function GameList({ games, onPlayGame }: GameListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>('All');

  const categories: (GameCategory | 'All')[] = ['All', 'Action', 'Racing', 'Adventure', 'Multiplayer', 'Puzzle'];

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            game.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  const handleCategorySelect = (category: GameCategory | 'All') => {
    audioSystem.playClick();
    setSelectedCategory(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Silent tiny tick on typing
    audioSystem.playHover();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 relative z-10 flex flex-col gap-10 text-left">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] font-bold">
            Live Database
          </span>
          <h1 className="text-3xl md:text-5xl font-sans font-black tracking-tight text-white mt-1">
            Explore Simulation Grid
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl">
            Choose from different categories, filter instant states, and fire up active HTML5 Canvas simulations instantly on your terminal dashboard.
          </p>
        </div>

        {/* Dynamic Category Row */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 text-xs uppercase font-mono tracking-wider font-semibold rounded-xl border transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#a855f7]/20 border-[#a855f7]/60 text-white shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Control row with instant search and status info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input Bar */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search simulation parameter or tag..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-6 py-3.5 bg-[#0b0a13]/70 border border-white/10 rounded-2xl text-sm font-sans text-white placeholder-gray-500 focus:outline-none focus:border-[#a855f7]/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Found state indicator */}
        <div className="text-xs font-mono text-gray-500">
          Sync States Loaded:{' '}
          <span className="text-white font-bold">{filteredGames.length}</span> /{' '}
          {games.length} Active
        </div>
      </div>

      {/* Grid of games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game, idx) => (
            <div
              key={game.id}
              className="group bg-[#090810]/70 border border-white/5 rounded-[2rem] overflow-hidden shadow-lg hover:border-purple-500/30 transition-all duration-300 hover:translate-y-[-4px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Graphic container */}
              <div className="relative h-52 overflow-hidden">
                {/* Visual vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090810] to-transparent opacity-90 z-10" />
                <img
                  src={game.image}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 pointer-events-none"
                />

                {/* Left hover banner details */}
                <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-mono tracking-widest text-[#06b6d4] uppercase border border-white/10 font-bold">
                  {game.category}
                </span>

                {/* Rating display */}
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-yellow-500">
                  <Star size={11} fill="currentColor" /> {game.rating}
                </div>
              </div>

              {/* Information body with description */}
              <div className="p-6 flex flex-col justify-between flex-1 relative z-10 -mt-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight mb-2 group-hover:text-purple-300 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {game.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 font-semibold mb-0.5">
                      Pilot Activity
                    </span>
                    <span className="text-xs text-white font-mono font-semibold">
                      {game.players}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      audioSystem.playClick();
                      onPlayGame(game);
                    }}
                    className="relative cursor-pointer group/btn overflow-hidden px-5 py-2.5 bg-[#a855f7]/10 hover:bg-[#a855f7] rounded-xl border border-purple-500/25 hover:border-transparent text-white duration-300 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider font-bold"
                  >
                    <Play size={11} fill="currentColor" /> Play
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty feedback state */
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/5 rounded-[2rem] text-center max-w-lg mx-auto w-full">
          <div className="bg-white/5 p-4 rounded-full text-purple-400 mb-4 animate-bounce">
            <Compass size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5 font-sans">
            No active nodes located
          </h3>
          <p className="text-gray-400 text-xs px-6 leading-relaxed mb-4">
            We couldn't match search patterns or categories to any existing simulations. Refine parameters and re-query dashboard logs.
          </p>
          <button
            onClick={() => {
              audioSystem.playClick();
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="cursor-pointer font-mono text-[10px] uppercase tracking-wider font-bold px-5 py-2.5 bg-[#a855f7] text-white rounded-xl transition-all"
          >
            Clear Search parameters
          </button>
        </div>
      )}
    </div>
  );
}
