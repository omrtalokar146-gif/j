import { Game } from '../types';

export const GAMES_DATABASE: Game[] = [
  {
    id: 'cyber-racer',
    title: 'Cyber Neon Racer',
    category: 'Racing',
    rating: 4.9,
    players: '14.2K Active',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400',
    description: 'Steer a hyper-speed luminescent runner through a winding cybernetic matrix highway. Dodge glowing firewall blockades and collect quantum power battery capsules.',
    controlInstructions: 'Use LEFT / RIGHT arrow keys or A / D to steer and dodge blocks. Survive as long as possible!',
    color: 'cyan',
    xpReward: 150
  },
  {
    id: 'astro-force',
    title: 'Void Space Force',
    category: 'Action',
    rating: 4.8,
    players: '28.5K Active',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400',
    description: 'Command a high-tech starship inside the mysterious stellar void core. Shoot down unstable space hazards, navigate gravity wells, and protect your warp drives.',
    controlInstructions: 'Use LEFT / RIGHT arrows to rotate ship, UP arrow to move, and SPACEBAR to fire defensive ionic blasters.',
    color: 'purple',
    xpReward: 180
  },
  {
    id: 'gravity-portal',
    title: 'Gravity Portal Run',
    category: 'Adventure',
    rating: 4.7,
    players: '9.3K Active',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
    description: 'An elegant runner where you manipulate localized magnetic polarity fields. Invert gravity to slide seamlessly along roofs and platforms to escape lethal security grids.',
    controlInstructions: 'Press SPACEBAR or CLICK to invert gravity cleanly. Avoid red barrier spikes and glide safely through terminal portals.',
    color: 'pink',
    xpReward: 200
  },
  {
    id: 'quantum-puzzle',
    title: 'Quantum Grid Alignment',
    category: 'Puzzle',
    rating: 4.6,
    players: '12.1K Active',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400',
    description: 'Realign unstable glowing quantum crystals by firing energy cores to clean up critical overloaded cells. Requires sharp spatial planning and rapid tactical thinking.',
    controlInstructions: 'Move launcher with MOUSE, CLICK to project energy node upward. Form groups of 3 matching states to clear energy lines.',
    color: 'emerald',
    xpReward: 120
  },
  {
    id: 'cyber-arena',
    title: 'Cyber AI Battle Arena',
    category: 'Multiplayer',
    rating: 4.9,
    players: '31.2K Active',
    image: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=400',
    description: 'Engage in ultra-fast virtual energy arena hockey against an intelligent adaptive neon bot inside a frictionless glow field. Power shots escalate as rally lengths grow.',
    controlInstructions: 'Move paddle with MOUSE vertically to block energy core from entering your sector. Launch curve bank shots using speed!',
    color: 'orange',
    xpReward: 220
  }
];
