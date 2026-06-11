import React, { useMemo, useState } from 'react';
import { Game, GameComment, StoredAccount } from '../types';
import { audioSystem } from './AudioSystem';
import { Plus, Users, MessageSquare, Upload, Link2, CheckCircle2, Trash2, Gamepad2 } from 'lucide-react';

interface AdminPanelProps {
  games: Game[];
  onAddGame: (game: Game) => void;
  onDeleteGame: (gameId: string) => void;
  onSetBrandLogo: (file: File) => void;
  onResetBrandLogo: () => void;
  currentBrandLogo: string;
  accounts: StoredAccount[];
  comments: GameComment[];
  activeUsersCount: number;
  activeGamePlayersCount: number;
  activeGameTitle: string;
  pageViewsCount: number;
  liveSocketConnections: number;
}

const categoryOptions: Game['category'][] = ['Action', 'Racing', 'Adventure', 'Multiplayer', 'Puzzle'];

export default function AdminPanel({ games, onAddGame, onDeleteGame, onSetBrandLogo, onResetBrandLogo, currentBrandLogo, accounts, comments, activeUsersCount, activeGamePlayersCount, activeGameTitle, pageViewsCount, liveSocketConnections }: AdminPanelProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [iframeUrl, setIframeUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [category, setCategory] = useState<Game['category']>('Action');
  const [xpReward, setXpReward] = useState(150);
  const [formError, setFormError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFileName, setLogoFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const signedInUsers = useMemo(() => accounts.filter((account) => account.isLoggedIn), [accounts]);
  const signedOutUsers = useMemo(() => accounts.filter((account) => !account.isLoggedIn), [accounts]);

  const commentsByGame = useMemo(() => {
    return comments.reduce<Record<string, GameComment[]>>((acc, comment) => {
      if (!acc[comment.gameId]) acc[comment.gameId] = [];
      acc[comment.gameId].push(comment);
      return acc;
    }, {});
  }, [comments]);

  const filteredGames = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) => game.title.toLowerCase().includes(normalized));
  }, [games, searchQuery]);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoPreview(dataUrl);
      setLogoFileName(file.name);
      onSetBrandLogo(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    audioSystem.playClick();
    if (!title.trim() || !description.trim() || !image.trim() || (!iframeUrl.trim() && !externalUrl.trim())) {
      setFormError('All fields are required, and either an internal game URL or external redirect link must be provided.');
      return;
    }

    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const newGame: Game = {
      id: slug || `game-${Date.now()}`,
      title: title.trim(),
      category,
      rating: 0,
      players: '0 Active',
      image: image.trim(),
      description: description.trim(),
      controlInstructions: 'Use the embedded game controls in the iframe to play.',
      color: category === 'Action' ? 'purple' : category === 'Racing' ? 'cyan' : category === 'Adventure' ? 'pink' : category === 'Multiplayer' ? 'orange' : 'emerald',
      xpReward,
      iframeUrl: iframeUrl.trim() || undefined,
      externalUrl: externalUrl.trim() || undefined,
    };

    onAddGame(newGame);
    audioSystem.playPowerUp();
    setTitle('');
    setDescription('');
    setImage('');
    setIframeUrl('');
    setExternalUrl('');
    setCategory('Action');
    setXpReward(150);
    setFormError('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col gap-10 text-white">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 bg-[#0a0712]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-cyan-500 p-3 rounded-3xl text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Upload size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-[0.26em]">Admin Game Upload</h1>
              <p className="text-gray-400 text-sm mt-1">Add iframe-based games directly to the portal with title, image, description and embedded URL.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
                Game Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                  placeholder="Neon Drift Arena"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Game['category'])}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
              Game Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none resize-none"
                rows={4}
                placeholder="Describe the game experience and what users should expect."
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
                Cover Image URL
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                  placeholder="https://..."
                />
              </label>
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
                Internal Game URL (embedded)
                <input
                  value={iframeUrl}
                  onChange={(e) => setIframeUrl(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                  placeholder="https://example.com/embed/game"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
              External Redirect Link
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                placeholder="https://external-site.com/play"
              />
              <span className="text-[10px] text-gray-500">Provide either an internal embedded game URL or an external redirect URL.</span>
            </label>

            <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
              App Logo from File Manager
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:bg-[#1f2937] file:text-white file:px-3 file:py-2 file:rounded-2xl file:border-none focus:border-[#a855f7] focus:outline-none"
              />
              <span className="text-[10px] text-gray-400">Choose a local image to replace your app's brand logo in the header and footer.</span>
            </label>

            {(logoPreview || currentBrandLogo) && (
              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-[#08070e] flex items-center justify-center">
                    {logoPreview || currentBrandLogo ? (
                      <img src={logoPreview || currentBrandLogo} alt="Current app logo" className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 size={24} className="text-white/80" />
                    )}
                  </div>
                  <div className="flex-1 text-sm text-gray-300">
                    <p className="font-semibold text-white">App logo preview</p>
                    <p className="text-[10px] text-gray-400">{logoFileName || 'Current app logo will show here after upload.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onResetBrandLogo}
                  className="self-start rounded-2xl border border-white/10 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] font-bold text-red-200 hover:bg-red-500/15 transition-all"
                >
                  Reset to default logo
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">
                XP Reward
                <input
                  type="number"
                  min={0}
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.3em] text-white hover:opacity-90 transition-all"
                >
                  <Plus size={16} /> Publish Game
                </button>
              </div>
            </div>

            {formError && <p className="text-red-400 text-sm font-mono">{formError}</p>}
          </form>
        </div>

        <div className="w-full lg:w-96 bg-[#0a0712]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-cyan-500/10 p-3 rounded-3xl text-cyan-300">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">Current sessions</p>
              <h2 className="text-xl font-bold">Live visitor status</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Active website sessions</p>
                <p className="text-3xl font-bold text-white">{activeUsersCount}</p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-bold">Live</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Users playing now</p>
                <p className="text-3xl font-bold text-white">{activeGamePlayersCount}</p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-bold">{activeGameTitle || 'Idle'}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Live socket connections</p>
                <p className="text-3xl font-bold text-white">{liveSocketConnections}</p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-bold">Realtime</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono">Total page loads</p>
                <p className="text-3xl font-bold text-white">{pageViewsCount.toLocaleString()}</p>
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300 font-bold">Database</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-mono mb-2">Signed in now</p>
              {signedInUsers.length ? (
                signedInUsers.map((account) => (
                  <div key={account.username} className="flex items-center justify-between gap-3 py-2 border-b border-white/10 last:border-none">
                    <div>
                      <p className="text-sm font-semibold">{account.username}</p>
                      <p className="text-[10px] text-gray-400">Active since {account.lastSeenAt ? new Date(account.lastSeenAt).toLocaleString() : 'Not tracked'}</p>
                    </div>
                    <CheckCircle2 className="text-emerald-400" />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No active sessions yet.</p>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-mono mb-2">Logged out users</p>
              {signedOutUsers.length ? (
                signedOutUsers.map((account) => (
                  <div key={account.username} className="py-2 border-b border-white/10 last:border-none">
                    <p className="text-sm font-semibold">{account.username}</p>
                    <p className="text-[10px] text-gray-400">Last seen {account.lastSeenAt ? new Date(account.lastSeenAt).toLocaleString() : 'Not tracked'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No registered users are logged out at the moment.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
        <div className="bg-[#0a0712]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-purple-500/10 p-3 rounded-3xl text-purple-300">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">Game Comments</p>
              <h2 className="text-xl font-bold">Community Feedback</h2>
            </div>
          </div>

          <div className="space-y-4">
            {comments.length ? (
              comments.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((comment) => {
                const game = games.find((gameItem) => gameItem.id === comment.gameId);
                return (
                  <div key={comment.id} className="bg-white/5 border border-white/10 rounded-3xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-semibold">{comment.username}</p>
                        <p className="text-[10px] text-gray-400">{game?.title || 'Unknown Game'}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-200">{comment.text}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No game comments have been posted yet.</p>
            )}
          </div>
        </div>

        <div className="bg-[#0a0712]/90 border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-cyan-500/10 p-3 rounded-3xl text-cyan-300">
              <Link2 size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-mono">Game Library</p>
              <h2 className="text-xl font-bold">Published Titles</h2>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search published titles..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#a855f7] focus:outline-none"
              />
            </label>

            {filteredGames.length ? (
              filteredGames.map((game) => (
                <div key={game.id} className="bg-white/5 border border-white/10 rounded-3xl p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <img src={game.image} alt={game.title} className="w-16 h-16 rounded-2xl object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{game.title}</p>
                        <p className="text-[10px] text-gray-400">{game.category} • {game.players}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <span className="text-xs text-cyan-300 uppercase tracking-[0.2em] font-bold">{commentsByGame[game.id]?.length || 0} comments</span>
                      <button
                        type="button"
                        onClick={() => {
                          audioSystem.playClick();
                          onDeleteGame(game.id);
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-widest text-red-200 hover:bg-red-500/15 transition-all"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No published games found matching your search.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
