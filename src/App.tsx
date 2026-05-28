import React, { useState, useEffect } from 'react';
import { Game, UserProfile } from './types';
import { GAMES_DATABASE } from './data/gamesData';
import CanvasBackground from './components/CanvasBackground';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import GameList from './components/GameList';
import GamePlayer from './components/GamePlayer';
import AuthPage from './components/AuthPage';
import ProfileView from './components/ProfileView';
import { audioSystem } from './components/AudioSystem';
import AdminPanel from './components/AdminPanel';
import { Gamepad2, Info, Twitter, Github, Globe, Shield, Activity, Volume2, VolumeX } from 'lucide-react';
import { StoredAccount, GameComment } from './types';

const LOCAL_STORAGE_KEY_PROFILE = 'nexus_user_profile_2026';
const LOCAL_STORAGE_KEY_ACCOUNTS = 'nexus_registered_accounts_2026';
const LOCAL_STORAGE_KEY_GAMES = 'nexus_saved_games_2026';
const LOCAL_STORAGE_KEY_COMMENTS = 'nexus_game_comments_2026';

const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || '';

const loadRegisteredAccounts = (): StoredAccount[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as StoredAccount[];
  } catch {
    return [];
  }
};

const saveRegisteredAccounts = (accounts: StoredAccount[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
};

const loadSavedGames = (): Game[] => {
  if (typeof window === 'undefined') return GAMES_DATABASE;
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_GAMES);
  if (!saved) return GAMES_DATABASE;
  try {
    return JSON.parse(saved) as Game[];
  } catch {
    return GAMES_DATABASE;
  }
};

const saveGames = (games: Game[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_GAMES, JSON.stringify(games));
};

const loadSavedComments = (): GameComment[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY_COMMENTS);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as GameComment[];
  } catch {
    return [];
  }
};

const saveComments = (data: GameComment[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_COMMENTS, JSON.stringify(data));
};

const isAdminUser = (username?: string): boolean => {
  if (!username) return false;
  const adminUsernames = ['admin', 'omy13456'];
  return adminUsernames.includes(username.toLowerCase());
};

const DEFAULT_ACHIEVEMENTS = [
  { id: 'first_run', title: 'Grid Runner First Step', description: 'Initiate playing your first neon game simulation', unlocked: false, icon: 'Gamepad2', rarity: 'Common' as const, color: 'cyan' },
  { id: 'level_5', title: 'Elite Sync Master', description: 'Reach Level 5 platform sync status', unlocked: false, icon: 'Zap', rarity: 'Rare' as const, color: 'purple' },
  { id: 'high_score', title: 'Matrix Decryptor', description: 'Attain a score of 1000+ in any platform game', unlocked: false, icon: 'Award', rarity: 'Epic' as const, color: 'pink' },
  { id: 'level_max', title: 'Grandmaster Singularity', description: 'Reach Level 10 or earn 5000 total score points', unlocked: false, icon: 'Crown', rarity: 'Legendary' as const, color: 'orange' }
];

const createProfile = (username: string): UserProfile => ({
  username,
  email: '',
  avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=150',
  level: 1,
  xp: 0,
  xpToNextLevel: 500,
  rank: 'Bronze Recruit',
  gamesPlayedCount: 0,
  totalScore: 0,
  recentlyPlayed: [],
  favoriteGames: [],
  achievements: DEFAULT_ACHIEVEMENTS.map((achievement) => ({ ...achievement })),
});

const INITIAL_PROFILE: UserProfile = {
  username: "Matrix_Pilot",
  email: "pilot@nexus-quantum.net",
  avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
  level: 3,
  xp: 180,
  xpToNextLevel: 500,
  rank: "Vapor Operative",
  gamesPlayedCount: 4,
  totalScore: 1650,
  recentlyPlayed: ['cyber-racer', 'cyber-arena'],
  favoriteGames: ['cyber-arena'],
  achievements: [
    { id: 'first_run', title: 'Grid Runner First Step', description: 'Initiated playing your first neon game simulation', unlocked: true, unlockedAt: "2026-05-24T12:00:00.000Z", icon: 'Gamepad2', rarity: 'Common' as const, color: 'cyan' },
    { id: 'level_5', title: 'Elite Sync Master', description: 'Reach Level 5 platform sync status', unlocked: false, icon: 'Zap', rarity: 'Rare' as const, color: 'purple' },
    { id: 'high_score', title: 'Matrix Decryptor', description: 'Attained a score of 1000+ in any platform game', unlocked: false, icon: 'Award', rarity: 'Epic' as const, color: 'pink' },
    { id: 'level_max', title: 'Grandmaster Singularity', description: 'Reach Level 10 or earn 5000 total score points', unlocked: false, icon: 'Crown', rarity: 'Legendary' as const, color: 'orange' }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'auth' | 'profile' | 'admin'>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [games, setGames] = useState<Game[]>(GAMES_DATABASE);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [comments, setComments] = useState<GameComment[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [muteSound, setMuteSound] = useState(audioSystem.isMuted());
  const [authError, setAuthError] = useState('');

  // Handle high quality local persistence on load
  useEffect(() => {
    const savedAccounts = loadRegisteredAccounts();
    setAccounts(savedAccounts);

    const savedGames = loadSavedGames();
    setGames(savedGames);

    // If backend URL present, fetch canonical games from backend
    if (typeof window !== 'undefined' && BACKEND_URL) {
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/games`);
          if (res.ok) {
            const remoteGames = await res.json();
            if (Array.isArray(remoteGames) && remoteGames.length > 0) {
              setGames(remoteGames);
              saveGames(remoteGames);
            }
          }
        } catch (e) {
          // leave local games as fallback
          console.warn('Could not fetch games from backend', e);
        }
      })();
    }

    const savedComments = loadSavedComments();
    setComments(savedComments);

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);

        const userAccountIndex = savedAccounts.findIndex(
          (account) => account.username.toLowerCase() === parsed.username.toLowerCase()
        );

        if (userAccountIndex !== -1) {
          const updatedAccounts = [...savedAccounts];
          updatedAccounts[userAccountIndex] = {
            ...updatedAccounts[userAccountIndex],
            isLoggedIn: true,
            lastSeenAt: new Date().toISOString(),
          };
          saveRegisteredAccounts(updatedAccounts);
          setAccounts(updatedAccounts);
        }
      } catch (e) {
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, []);

  const handleUpdateProfile = (updatedFields: Partial<UserProfile>) => {
    if (userProfile) {
      const nextProfile = { ...userProfile, ...updatedFields };
      setUserProfile(nextProfile);
      localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(nextProfile));
      const accountList = loadRegisteredAccounts();
      const accountIndex = accountList.findIndex(
        (account) => account.username.toLowerCase() === userProfile.username.toLowerCase()
      );
      if (accountIndex !== -1) {
        accountList[accountIndex] = { ...accountList[accountIndex], profile: nextProfile };
        saveRegisteredAccounts(accountList);
        setAccounts(accountList);
      }
    }
  };

  const handleSignIn = (username: string, password: string, isSignUp: boolean) => {
    const trimmedUsername = username.trim();
    const accountList = loadRegisteredAccounts();
    const existingIndex = accountList.findIndex(
      (account) => account.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    const now = new Date().toISOString();

    // If backend configured, use remote auth endpoints
    if (BACKEND_URL) {
      (async () => {
        try {
          if (isSignUp) {
            const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: trimmedUsername, email: `${trimmedUsername}@nexus.local`, password }),
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              setAuthError(err.error || 'Failed to register');
              return;
            }
            const data = await res.json();
            const raw = data.user || {};
            const profile = {
              ...raw,
              avatar: raw.avatar || raw.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
            };
            // store token if provided
            if (data.token) localStorage.setItem('nexus_token', data.token);
            setUserProfile(profile);
            localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
            setAuthError('');
            setActiveTab('home');
            return;
          }

          // login
          const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: `${trimmedUsername}@nexus.local`, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setAuthError(err.error || 'Failed to log in');
            return;
          }
          const data = await res.json();
          if (data.token) localStorage.setItem('nexus_token', data.token);
          const raw = data.user || {};
          const profile = {
            ...raw,
            avatar: raw.avatar || raw.avatarUrl || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
          };
          setUserProfile(profile);
          localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
          setAuthError('');
          setActiveTab('home');
          return;
        } catch (e) {
          console.warn('Auth request failed, falling back to local auth', e);
          setAuthError('Auth service unreachable');
        }
      })();
      return;
    }

    if (existingIndex === -1) {
      setAuthError('Nickname not found. Register first with a unique nickname.');
      return;
    }

    const account = accountList[existingIndex];
    if (account.password !== password) {
      setAuthError('Invalid password for this nickname.');
      return;
    }

    const nextAccounts = accountList.map((item, idx) =>
      idx === existingIndex
        ? { ...item, isLoggedIn: true, lastSeenAt: now }
        : item
    );
    saveRegisteredAccounts(nextAccounts);
    setAccounts(nextAccounts);
    setUserProfile(account.profile);
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(account.profile));
    setAuthError('');
    setActiveTab('home');
  };

  const handleLogout = () => {
    if (userProfile) {
      const accountList = loadRegisteredAccounts();
      const nextAccounts = accountList.map((account) =>
        account.username.toLowerCase() === userProfile.username.toLowerCase()
          ? { ...account, isLoggedIn: false, lastSeenAt: new Date().toISOString() }
          : account
      );
      saveRegisteredAccounts(nextAccounts);
      setAccounts(nextAccounts);
    }
    setUserProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
    setActiveTab('home'); // Go back to home seamlessly instead of sending directly to locked login screens
  };

  const handleAddGame = (game: Game) => {
    // If backend is configured, POST the new game so everyone sees it
    if (BACKEND_URL) {
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/games`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(game),
          });
          if (res.ok) {
            const updated = await res.json();
            setGames(updated);
            saveGames(updated);
            return;
          }
        } catch (e) {
          console.warn('Failed to save game to backend, falling back to local', e);
        }
        // fallback to local save
        const nextGames = [game, ...games];
        setGames(nextGames);
        saveGames(nextGames);
      })();
      return;
    }

    const nextGames = [game, ...games];
    setGames(nextGames);
    saveGames(nextGames);
  };

  const handleAddComment = (gameId: string, text: string) => {
    if (!userProfile || !text.trim()) return;
    const newComment: GameComment = {
      id: `comment-${Date.now()}`,
      gameId,
      username: userProfile.username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const nextComments = [newComment, ...comments];
    setComments(nextComments);
    saveComments(nextComments);
  };

  const handlePlayGame = (game: Game) => {
    audioSystem.playPowerUp();
    setActiveGame(game);
  };

  const toggleGlobalMute = () => {
    const result = audioSystem.toggleMute();
    setMuteSound(result);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-white bg-[#040307] font-sans relative overflow-x-hidden selection:bg-purple-600/50 selection:text-white">
      {/* Interactive 3D Stars constellation space background */}
      <CanvasBackground />

      {/* Futuristic Floating Mute system at absolute screen side */}
      <button 
        onClick={toggleGlobalMute}
        className="fixed bottom-6 right-6 z-40 p-3 bg-white/5 border border-white/10 hover:border-[#a855f7]/40 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl cursor-pointer shadow-lg transition duration-200"
        title={muteSound ? "Enable system sweep audio" : "Mute audio synthesizer"}
      >
        {muteSound ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {/* Main navigation header */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userProfile={userProfile} 
        onLogout={handleLogout} 
      />

      {/* Dynamic top banner for guest pilots */}
      {!userProfile && (
        <div className="relative z-20 w-full bg-[#120925]/60 hover:bg-[#120925]/80 border-b border-[#a855f7]/20 py-2.5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left transition-colors font-mono">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-purple-200">
            <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-bold text-cyan-400 uppercase tracking-wider">PROVISIONAL DIRECT PLAY:</span>
            <span className="text-gray-300">Play any game immediately. Link a Gateway Key to track permanent stats, level XP, and achievement badges!</span>
          </div>
          <button 
            onClick={() => {
              audioSystem.playClick();
              setActiveTab('auth');
            }}
            className="cursor-pointer text-[10px] uppercase font-bold tracking-widest text-[#a855f7] hover:text-cyan-400 border border-[#a855f7]/30 hover:border-cyan-400/50 bg-purple-500/5 px-3 py-1 rounded-lg transition duration-200"
          >
            Connect Sync Identity &gt;&gt;
          </button>
        </div>
      )}

      {/* Main body content based on active viewport state */}
      <main className="flex-1 relative z-10 w-full">
        {activeTab === 'home' && (
          <HeroSection 
            onPlayGame={handlePlayGame} 
            trendingGames={games} 
            featuredGames={games} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'games' && (
          <GameList 
            games={games} 
            onPlayGame={handlePlayGame} 
          />
        )}

        {activeTab === 'auth' && (
          <AuthPage onSignIn={handleSignIn} authError={authError} />
        )}

        {activeTab === 'profile' && userProfile && (
          <ProfileView 
            userProfile={userProfile} 
            games={games} 
            onPlayGame={handlePlayGame} 
            updateProfile={handleUpdateProfile} 
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin' && isAdminUser(userProfile?.username) && (
          <AdminPanel 
            games={games} 
            onAddGame={handleAddGame} 
            accounts={accounts} 
            comments={comments} 
          />
        )}

        {activeTab === 'admin' && !isAdminUser(userProfile?.username) && (
          <div className="w-full max-w-4xl mx-auto px-6 py-24 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Admin access required</h2>
            <p className="text-gray-400">Only the admin user can access this dashboard. Sign in as <strong>admin</strong> to manage games and monitor user sessions.</p>
          </div>
        )}
      </main>

      {/* Integrated Gaming Console Modal Overlays */}
      {activeGame && (
        <GamePlayer 
          game={activeGame} 
          onClose={() => setActiveGame(null)} 
          userProfile={userProfile} 
          updateProfile={handleUpdateProfile} 
          comments={comments}
          onAddComment={handleAddComment}
        />
      )}

      {/* Sleek, ambient premium platform footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050409]/65 backdrop-blur-md py-10 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-3">
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-purple-400">
              <Gamepad2 size={18} />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase block">
                NEXUS PLATFORM
              </span>
              <span className="text-[9px] font-mono tracking-widest text-gray-500 uppercase">
                Synchronized Multiplayer Core · © 2026
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
            >
              <Twitter size={15} />
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
            >
              <Github size={15} />
            </a>
            <a 
              href="https://google.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
            >
              <Globe size={15} />
            </a>
          </div>

          <div className="text-center md:text-right">
            <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5 justify-center md:justify-end">
              <Activity size={12} className="text-purple-400 animate-pulse" />
              COMS_ONLINE · LATENCY 0.04ms
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
}
