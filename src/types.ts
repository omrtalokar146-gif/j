export type GameCategory = 'Action' | 'Racing' | 'Adventure' | 'Multiplayer' | 'Puzzle';

export interface Game {
  id: string;
  title: string;
  category: GameCategory;
  rating: number;
  players: string;
  image: string;
  description: string;
  controlInstructions: string;
  color: string; // Neon accent color (cyan, purple, pink, emerald, orange)
  xpReward: number;
  iframeUrl?: string;
  externalUrl?: string;
}

export interface GameComment {
  id: string;
  gameId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface StoredAccount {
  username: string;
  password: string;
  profile: UserProfile;
  isLoggedIn: boolean;
  registeredAt: string;
  lastSeenAt: string;
  isAdmin?: boolean;
}

export interface UserProfile {
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: string;
  gamesPlayedCount: number;
  totalScore: number;
  recentlyPlayed: string[]; // game IDs
  favoriteGames: string[]; // game IDs
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string; // lucide icon name
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}
