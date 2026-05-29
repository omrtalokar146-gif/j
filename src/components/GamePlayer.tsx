import React, { useEffect, useRef, useState } from 'react';
import { Game, UserProfile, GameComment } from '../types';
import { audioSystem } from './AudioSystem';
import { X, Play, RotateCcw, AlertTriangle, ArrowLeft, Gamepad2, Volume2, VolumeX, Shield, Award, Zap, Maximize, Minimize } from 'lucide-react';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
  userProfile: UserProfile | null;
  updateProfile: (updated: Partial<UserProfile>) => void;
  comments: GameComment[];
  onAddComment: (gameId: string, text: string) => void;
}

export default function GamePlayer({ game, onClose, userProfile, updateProfile, comments, onAddComment }: GamePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameScreenRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muteSound, setMuteSound] = useState(audioSystem.isMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 700, height: 450 });
  const [commentText, setCommentText] = useState('');

  const isExternalGame = Boolean(game.externalUrl && !game.iframeUrl);

  const gameComments = comments
    .filter((comment) => comment.gameId === game.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // References to keep game loop variables without re-triggering effects
  const gameStateRef = useRef({
    score: 0,
    isPlaying: false,
    gameOver: false,
    keys: {} as Record<string, boolean>,
    mouse: { x: 350, y: 350 },
    lastFrameTime: 0,
    gameEntities: null as any
  });

  // Load custom local high score for this game
  useEffect(() => {
    const saved = localStorage.getItem(`neon_hs_${game.id}`);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, [game.id]);

  // Adjust canvas relative to outer glass container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const parentW = containerRef.current.clientWidth;
        // Keep standard 16:9 ratio
        const w = Math.min(760, parentW - 32);
        const h = w * 0.6;
        setDimensions({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const toggleSound = () => {
    const isMuted = audioSystem.toggleMute();
    setMuteSound(isMuted);
  };

  const toggleFullscreen = () => {
    if (!gameScreenRef.current) return;

    if (!document.fullscreenElement) {
      gameScreenRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error(`Error attempting to enable fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error(`Error attempting to disable fullscreen: ${err.message}`));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleStartGame = () => {
    audioSystem.playPowerUp();
    if (isExternalGame) {
      if (game.externalUrl) {
        window.open(game.externalUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    gameStateRef.current.score = 0;
    gameStateRef.current.isPlaying = true;
    gameStateRef.current.gameOver = false;
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(game.id, commentText);
    setCommentText('');
  };

  const handleGameOver = (finalScore: number) => {
    audioSystem.playExplosion();
    setIsPlaying(false);
    setGameOver(true);
    gameStateRef.current.isPlaying = false;
    gameStateRef.current.gameOver = true;

    // Save high score locally first for immediate persistence
    const currentHs = parseInt(localStorage.getItem(`neon_hs_${game.id}`) || '0', 10);
    if (finalScore > currentHs) {
      setHighScore(finalScore);
      localStorage.setItem(`neon_hs_${game.id}`, finalScore.toString());
    }

    if (!userProfile) {
      return; // Stop here if user isn't signed in yet (bina sign-in ke guest play)
    }

    // Update Platform user statistics and awards XP
    const earnedXp = Math.min(game.xpReward, Math.floor(finalScore / 10) + 10);
    let newXp = userProfile.xp + earnedXp;
    let newLevel = userProfile.level;
    let leveledUp = false;

    while (newXp >= userProfile.xpToNextLevel) {
      newXp -= userProfile.xpToNextLevel;
      newLevel += 1;
      leveledUp = true;
    }

    // Save platforms profile details (defensive defaults)
    const recent = [
      game.id,
      ...((userProfile.recentlyPlayed || []).filter(id => id !== game.id)),
    ].slice(0, 5);

    // Achievements unlocking logic (ensure achievements array exists)
    const currentAchievements = [...(userProfile.achievements || [])];
    let achievementUnlocked = false;

    // First step unlocked
    const firstStep = currentAchievements.find(a => a.id === 'first_run');
    if (firstStep && !firstStep.unlocked) {
      firstStep.unlocked = true;
      firstStep.unlockedAt = new Date().toISOString();
      achievementUnlocked = true;
    }

    // High score unlock
    if (finalScore >= 1000) {
      const highAward = currentAchievements.find(a => a.id === 'high_score');
      if (highAward && !highAward.unlocked) {
        highAward.unlocked = true;
        highAward.unlockedAt = new Date().toISOString();
        achievementUnlocked = true;
      }
    }

    // Total points unlock
    const totalScoreUpdated = userProfile.totalScore + finalScore;
    if (totalScoreUpdated >= 5000 || newLevel >= 10) {
      const maxAward = currentAchievements.find(a => a.id === 'level_max');
      if (maxAward && !maxAward.unlocked) {
        maxAward.unlocked = true;
        maxAward.unlockedAt = new Date().toISOString();
        achievementUnlocked = true;
      }
    }

    if (newLevel >= 5) {
      const syncAward = currentAchievements.find(a => a.id === 'level_5');
      if (syncAward && !syncAward.unlocked) {
        syncAward.unlocked = true;
        syncAward.unlockedAt = new Date().toISOString();
        achievementUnlocked = true;
      }
    }

    updateProfile({
      xp: newXp,
      level: newLevel,
      gamesPlayedCount: userProfile.gamesPlayedCount + 1,
      totalScore: totalScoreUpdated,
      recentlyPlayed: recent.slice(0, 5),
      achievements: currentAchievements
    });

    if (leveledUp || achievementUnlocked) {
      setTimeout(() => {
        audioSystem.playPowerUp();
      }, 350);
    }
  };

  // Main Canvas game renders based on running game ID
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = dimensions.width;
    const height = dimensions.height;
    
    gameStateRef.current.keys = {};
    gameStateRef.current.score = 0;

    // Subscriptions to input events
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = true;
      // Prevent browser default scrolling for gaming keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        gameStateRef.current.mouse.x = e.clientX - rect.left;
        gameStateRef.current.mouse.y = e.clientY - rect.top;
      }
    };

    const handleMouseDown = () => {
      gameStateRef.current.keys['click'] = true;
    };

    const handleMouseUp = () => {
      gameStateRef.current.keys['click'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Dynamic Setup of Entities inside our active engine based on game selected
    let animationId: number;
    let entities: any = {};

    if (game.id === 'cyber-racer') {
      // Setup cyber racer
      entities = {
        player: {
          x: width / 2,
          y: height - 60,
          width: 32,
          height: 44,
          speed: 7,
          color: '#06b6d4', // neon cyan
          trail: [] as { x: number; y: number }[]
        },
        obstacles: [] as any[],
        energy: [] as any[],
        spawnTimer: 0,
        energySpawnTimer: 0,
        speedMultiplier: 1.0,
        stars: Array.from({ length: 40 }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          v: Math.random() * 2 + 1
        }))
      };
    } else if (game.id === 'astro-force') {
      // Setup asteroid survival style space force
      entities = {
        ship: {
          x: width / 2,
          y: height / 2,
          r: 15,
          angle: -Math.PI / 2,
          rotationSpeed: 0.08,
          speed: 0,
          vx: 0,
          vy: 0,
          maxSpeed: 650,
          cooldown: 0
        },
        bullets: [] as any[],
        hazards: [] as any[],
        asteroidsSpawned: 0,
        spawnTimer: 0,
        particleExplosions: [] as any[]
      };
    } else if (game.id === 'gravity-portal') {
      // Gravity platformer run
      entities = {
        player: {
          x: 100,
          y: height - 50 - 20, // Floor placement
          r: 12,
          speedY: 0,
          gravityState: 1, // 1 for down, -1 for up
          color: '#ec4899', // neon pink
          trail: [] as {x: number, y: number, state: number}[]
        },
        obstacles: [] as any[],
        scoreMultiplier: 1,
        spawnTimer: 40,
        floorY: height - 50,
        ceilingY: 50,
        gridX: 0
      };
    } else if (game.id === 'quantum-puzzle') {
      // Quantum Block Breaker
      entities = {
        paddle: {
          x: width / 2 - 60,
          y: height - 30,
          w: 120,
          h: 12,
          speed: 8
        },
        ball: {
          x: width / 2,
          y: height - 120,
          vx: 4,
          vy: -4,
          r: 8,
          speed: 5.5
        },
        crystals: [] as any[]
      };

      // Generate colorful floating neon bricks
      const cols = 8;
      const rows = 4;
      const crystalW = (width - 60) / cols;
      const crystalH = 22;
      const brickColors = ['#06b6d4', '#ec4899', '#a855f7', '#10b981'];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          entities.crystals.push({
            x: 30 + c * crystalW + 4,
            y: 40 + r * crystalH + 4,
            w: crystalW - 8,
            h: crystalH - 6,
            color: brickColors[r % brickColors.length],
            points: (4 - r) * 20,
            active: true
          });
        }
      }
    } else if (game.id === 'cyber-arena') {
      // Cyber bot space pong
      entities = {
        paddleL: { x: 20, y: height / 2 - 45, w: 12, h: 90, score: 0, color: '#f97316' }, // Neon Orange AI
        paddleR: { x: width - 32, y: height / 2 - 45, w: 12, h: 90, score: 0, color: '#06b6d4' }, // Player
        ball: {
          x: width / 2,
          y: height / 2,
          vx: 4,
          vy: 2,
          r: 9,
          speed: 4.5,
          trail: [] as {x: number, y: number}[]
        },
        targetY: height / 2
      };
    }

    gameStateRef.current.gameEntities = entities;

    // Game loop runner
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      // Calculate delta time
      const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // Clamp dt to avoid huge jumps
      lastTime = timestamp;

      // Clear layout
      ctx.fillStyle = '#06050b';
      ctx.fillRect(0, 0, width, height);

      // Draw standard glowing border around game canvas
      ctx.strokeStyle = game.color === 'cyan' ? '#06b6d4' : 
                        game.color === 'purple' ? '#a855f7' :
                        game.color === 'pink' ? '#ec4899' :
                        game.color === 'emerald' ? '#10b981' : '#f97316';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // ----------------------------------------------------
      // GAME 1: CYBER NEON RACER
      // ----------------------------------------------------
      if (game.id === 'cyber-racer') {
        const ent = gameStateRef.current.gameEntities;
        const keys = gameStateRef.current.keys;

        // Draw animated backdrop stars moving down
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ent.stars.forEach((star: any) => {
          star.y += star.v;
          if (star.y > height) star.y = 0;
          ctx.fillRect(star.x, star.y, 1.5, 1.5);
        });

        // Lane visuals
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.25, 0); ctx.lineTo(width * 0.25, height);
        ctx.moveTo(width * 0.5, 0); ctx.lineTo(width * 0.5, height);
        ctx.moveTo(width * 0.75, 0); ctx.lineTo(width * 0.75, height);
        ctx.stroke();

        // Player Controls
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
          ent.player.x -= ent.player.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
          ent.player.x += ent.player.speed;
        }

        // Keep player in bounds
        ent.player.x = Math.max(20 + ent.player.width / 2, Math.min(width - 20 - ent.player.width / 2, ent.player.x));

        // Draw engine trail
        ent.player.trail.push({ x: ent.player.x, y: ent.player.y + ent.player.height });
        if (ent.player.trail.length > 15) ent.player.trail.shift();

        ent.player.trail.forEach((t: any, idx: number) => {
          const ratio = idx / ent.player.trail.length;
          ctx.fillStyle = `rgba(6, 182, 212, ${ratio * 0.4})`;
          const w = ent.player.width * 0.7 * ratio;
          ctx.fillRect(t.x - w / 2, t.y, w, 4);
        });

        // Draw ship rocket
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = '#06b6d4';
        
        ctx.beginPath();
        ctx.moveTo(ent.player.x, ent.player.y);
        ctx.lineTo(ent.player.x - ent.player.width / 2, ent.player.y + ent.player.height);
        ctx.lineTo(ent.player.x + ent.player.width / 2, ent.player.y + ent.player.height);
        ctx.closePath();
        ctx.fill();

        // Internal glass details of racer
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ent.player.x, ent.player.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Spawn Obstacles
        ent.spawnTimer += dt;
        if (ent.spawnTimer > 1.1 / ent.speedMultiplier) {
          ent.spawnTimer = 0;
          ent.obstacles.push({
            x: Math.random() * (width - 100) + 50,
            y: -50,
            w: 40 + Math.random() * 25,
            h: 30,
            speed: 5 * ent.speedMultiplier,
            color: '#a855f7' // Purple barrier
          });
          ent.speedMultiplier += 0.02; // Gradually speed up
        }

        // Spawn Energy Capsule
        ent.energySpawnTimer += dt;
        if (ent.energySpawnTimer > 3.0) {
          ent.energySpawnTimer = 0;
          ent.energy.push({
            x: Math.random() * (width - 80) + 40,
            y: -30,
            r: 10,
            speed: 4,
            collected: false
          });
        }

        // Move and draw obstacles
        ent.obstacles.forEach((obs: any, index: number) => {
          obs.y += obs.speed;
          
          ctx.save();
          ctx.strokeStyle = '#a855f7';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#a855f7';
          ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x - obs.w / 2, obs.y, obs.w, obs.h);
          ctx.fillRect(obs.x - obs.w / 2, obs.y, obs.w, obs.h);
          ctx.restore();

          // Simple rect collision
          const p = ent.player;
          if (
            p.x - p.width / 2 < obs.x + obs.w / 2 &&
            p.x + p.width / 2 > obs.x - obs.w / 2 &&
            p.y < obs.y + obs.h &&
            p.y + p.height > obs.y
          ) {
            // Collision! Crash game over
            handleGameOver(gameStateRef.current.score);
          }
        });

        // Filter out completed obstacles
        ent.obstacles = ent.obstacles.filter((o: any) => {
          if (o.y > height) {
            gameStateRef.current.score += 15;
            setScore(gameStateRef.current.score);
            return false;
          }
          return true;
        });

        // Move and draw energy capsules
        ent.energy.forEach((cap: any) => {
          cap.y += cap.speed;
          ctx.save();
          ctx.fillStyle = '#10b981'; // Green energy
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#10b981';
          ctx.beginPath();
          ctx.arc(cap.x, cap.y, cap.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Collision
          const p = ent.player;
          const dist = Math.hypot(p.x - cap.x, (p.y + p.height / 2) - cap.y);
          if (dist < p.width / 2 + cap.r) {
            cap.collected = true;
            audioSystem.playHover();
            gameStateRef.current.score += 50;
            setScore(gameStateRef.current.score);
          }
        });

        ent.energy = ent.energy.filter((e: any) => !e.collected && e.y < height);
      }

      // ----------------------------------------------------
      // GAME 2: ASTERIOD CORE SURVIVAL (ASTRO-FORCE)
      // ----------------------------------------------------
      else if (game.id === 'astro-force') {
        const ent = gameStateRef.current.gameEntities;
        const keys = gameStateRef.current.keys;
        const ship = ent.ship;

        // Rotation & Acceleration physics
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
          ship.angle -= ship.rotationSpeed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
          ship.angle += ship.rotationSpeed;
        }

        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
          const thrust = 12;
          ship.vx += Math.cos(ship.angle) * thrust;
          ship.vy += Math.sin(ship.angle) * thrust;

          // Draw thrust flame
          ctx.save();
          ctx.fillStyle = 'rgba(236, 72, 153, 0.8)'; // Neon pink flame
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(ship.x - Math.cos(ship.angle) * 16, ship.y - Math.sin(ship.angle) * 16);
          ctx.lineTo(
            ship.x - Math.cos(ship.angle) * 30 + (Math.random() - 0.5) * 8,
            ship.y - Math.sin(ship.angle) * 30 + (Math.random() - 0.5) * 8
          );
          ctx.lineTo(ship.x - Math.cos(ship.angle) * 16, ship.y - Math.sin(ship.angle) * 16);
          ctx.stroke();
          ctx.restore();
        }

        // Space friction
        ship.vx *= 0.985;
        ship.vy *= 0.985;

        // Position update
        ship.x += ship.vx * dt;
        ship.y += ship.vy * dt;

        // Warp bounds
        if (ship.x < 0) ship.x = width;
        if (ship.x > width) ship.x = 0;
        if (ship.y < 0) ship.y = height;
        if (ship.y > height) ship.y = 0;

        // Fire Bullet
        if (ship.cooldown > 0) ship.cooldown -= dt;
        if ((keys[' '] || keys['click']) && ship.cooldown <= 0) {
          audioSystem.playLaser();
          ent.bullets.push({
            x: ship.x + Math.cos(ship.angle) * ship.r,
            y: ship.y + Math.sin(ship.angle) * ship.r,
            vx: Math.cos(ship.angle) * 380,
            vy: Math.sin(ship.angle) * 380,
            life: 1.2
          });
          ship.cooldown = 0.22; // delay code
        }

        // Draw Player Starship
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.strokeStyle = '#a855f7'; // Neon Purple ship
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#a855f7';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';

        ctx.beginPath();
        ctx.moveTo(ship.r, 0);
        ctx.lineTo(-ship.r, ship.r * 0.8);
        ctx.lineTo(-ship.r * 0.5, 0);
        ctx.lineTo(-ship.r, -ship.r * 0.8);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();

        // Spawn space hazards
        ent.spawnTimer += dt;
        if (ent.spawnTimer > 1.4 && ent.hazards.length < 8) {
          ent.spawnTimer = 0;
          // Spawn hazard far from ship
          let hX = Math.random() * width;
          let hY = Math.random() * height;
          while (Math.hypot(hX - ship.x, hY - ship.y) < 150) {
            hX = Math.random() * width;
            hY = Math.random() * height;
          }

          ent.hazards.push({
            x: hX,
            y: hY,
            vx: (Math.random() - 0.5) * 80,
            vy: (Math.random() - 0.5) * 80,
            r: 18 + Math.random() * 20,
            sides: 5 + Math.floor(Math.random() * 4),
            offsetAngle: Math.random() * Math.PI
          });
        }

        // Update bullets
        ent.bullets.forEach((b: any) => {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dt;

          ctx.save();
          ctx.fillStyle = '#ec4899';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ec4899';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        ent.bullets = ent.bullets.filter((b: any) => b.life > 0);

        // Update hazards
        ent.hazards.forEach((haz: any) => {
          haz.x += haz.vx * dt;
          haz.y += haz.vy * dt;

          if (haz.x < 0) haz.x = width;
          if (haz.x > width) haz.x = 0;
          if (haz.y < 0) haz.y = height;
          if (haz.y > height) haz.y = 0;

          // Draw beautiful polygon asteroid
          ctx.save();
          ctx.translate(haz.x, haz.y);
          ctx.strokeStyle = '#22d3ee'; // Neon Cyan Asteroids
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#22d3ee';
          ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          for (let s = 0; s < haz.sides; s++) {
            const angle = haz.offsetAngle + (s / haz.sides) * Math.PI * 2;
            const rx = haz.r + (s % 2 === 0 ? 3 : -3);
            const px = Math.cos(angle) * rx;
            const py = Math.sin(angle) * rx;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fill();
          ctx.restore();

          // Collides with Bullet
          ent.bullets.forEach((b: any) => {
            const dist = Math.hypot(b.x - haz.x, b.y - haz.y);
            if (dist < haz.r) {
              b.life = 0; // Trigger removal
              haz.hit = true;
              audioSystem.playHover();

              // Spawn tiny explosions particles
              for (let pIdx = 0; pIdx < 8; pIdx++) {
                ent.particleExplosions.push({
                  x: haz.x,
                  y: haz.y,
                  vx: (Math.random() - 0.5) * 150,
                  vy: (Math.random() - 0.5) * 150,
                  life: 0.5,
                  color: '#22d3ee'
                });
              }

              gameStateRef.current.score += 25;
              setScore(gameStateRef.current.score);
            }
          });

          // Collides with Ship
          const distToShip = Math.hypot(ship.x - haz.x, ship.y - haz.y);
          if (distToShip < haz.r + ship.r - 2) {
            handleGameOver(gameStateRef.current.score);
          }
        });

        // Split hit hazards
        const nextHazards: any[] = [];
        ent.hazards.forEach((haz: any) => {
          if (haz.hit) {
            if (haz.r > 20) {
              // Split into two smaller
              for (let split = 0; split < 2; split++) {
                nextHazards.push({
                  x: haz.x + (Math.random() - 0.5) * 10,
                  y: haz.y + (Math.random() - 0.5) * 10,
                  vx: haz.vx * 1.4 + (Math.random() - 0.5) * 40,
                  vy: haz.vy * 1.4 + (Math.random() - 0.5) * 40,
                  r: haz.r / 2,
                  sides: 5,
                  offsetAngle: Math.random() * Math.PI
                });
              }
            }
          } else {
            nextHazards.push(haz);
          }
        });
        ent.hazards = nextHazards;

        // Explosion particle updates
        ent.particleExplosions.forEach((ep: any) => {
          ep.x += ep.vx * dt;
          ep.y += ep.vy * dt;
          ep.life -= dt;

          ctx.fillStyle = ep.color;
          ctx.globalAlpha = ep.life * 2;
          ctx.fillRect(ep.x, ep.y, 2.5, 2.5);
          ctx.globalAlpha = 1.0;
        });

        ent.particleExplosions = ent.particleExplosions.filter((ep: any) => ep.life > 0);
      }

      // ----------------------------------------------------
      // GAME 3: GRAVITY PORTAL RUN
      // ----------------------------------------------------
      else if (game.id === 'gravity-portal') {
        const ent = gameStateRef.current.gameEntities;
        const keys = gameStateRef.current.keys;
        const player = ent.player;

        // Draw animated bottom path, and ceiling path lines
        ent.gridX = (ent.gridX - 4) % 60;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.lineWidth = 1.5;

        // Draw floor and ceiling boundaries
        ctx.strokeStyle = '#ec4899';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(0, ent.floorY); ctx.lineTo(width, ent.floorY);
        ctx.moveTo(0, ent.ceilingY); ctx.lineTo(width, ent.ceilingY);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.1)';
        for (let g = ent.gridX; g < width; g += 30) {
          ctx.beginPath();
          ctx.moveTo(g, ent.ceilingY - 14);
          ctx.lineTo(g, ent.ceilingY);
          ctx.moveTo(g, ent.floorY);
          ctx.lineTo(g, ent.floorY + 14);
          ctx.stroke();
        }

        // Gravity swap trigger
        if (keys[' '] || keys['click']) {
          keys[' '] = false; // Prevent holding down instant rapid toggle
          keys['click'] = false;
          player.gravityState = -player.gravityState;
          audioSystem.playHover();
        }

        // Accelerate player towards current floor direction
        player.speedY += 1.8 * player.gravityState; // Grav force
        player.y += player.speedY;

        // Ceiling collision
        if (player.y - player.r <= ent.ceilingY) {
          player.y = ent.ceilingY + player.r;
          player.speedY = 0;
        }
        // Floor collision
        if (player.y + player.r >= ent.floorY) {
          player.y = ent.floorY - player.r;
          player.speedY = 0;
        }

        // Record trails
        player.trail.push({ x: player.x, y: player.y, state: player.gravityState });
        if (player.trail.length > 12) player.trail.shift();

        player.trail.forEach((t: any, idx: number) => {
          const ratio = idx / player.trail.length;
          ctx.fillStyle = `rgba(236, 72, 153, ${ratio * 0.35})`;
          ctx.beginPath();
          ctx.arc(t.x, t.y, player.r * ratio, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw player character (Sphere)
        ctx.save();
        ctx.fillStyle = '#ec4899';
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ec4899';
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.fill();

        // Draw cute core design
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(player.x + 3, player.y - 3 * player.gravityState, player.r * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Spawn obstacles (blocks or laser spikes)
        ent.spawnTimer += 1;
        if (ent.spawnTimer > 55) {
          ent.spawnTimer = 0;
          const isCeiling = Math.random() < 0.5;
          const blockH = 30 + Math.random() * 20;
          ent.obstacles.push({
            x: width + 50,
            y: isCeiling ? ent.ceilingY : ent.floorY - blockH,
            w: 22,
            h: blockH,
            isCeiling,
            speed: 5.5 + (gameStateRef.current.score * 0.002)
          });
        }

        // Move and draw obstacles
        ent.obstacles.forEach((obs: any) => {
          obs.x -= obs.speed;

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fb7185';
          ctx.strokeStyle = '#fb7185';
          ctx.fillStyle = 'rgba(251, 113, 133, 0.18)';
          ctx.lineWidth = 1.5;

          // Draw hazard box
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.restore();

          // Obstacle collision
          if (
            player.x + player.r - 2 > obs.x &&
            player.x - player.r + 2 < obs.x + obs.w &&
            player.y + player.r - 2 > obs.y &&
            player.y - player.r + 2 < obs.y + obs.h
          ) {
            handleGameOver(gameStateRef.current.score);
          }
        });

        // Clean up passed hazards and score items
        ent.obstacles = ent.obstacles.filter((obs: any) => {
          if (obs.x + obs.w < 0) {
            gameStateRef.current.score += 20;
            setScore(gameStateRef.current.score);
            return false;
          }
          return true;
        });
      }

      // ----------------------------------------------------
      // GAME 4: QUANTUM PADDLE BRICK BUSTER
      // ----------------------------------------------------
      else if (game.id === 'quantum-puzzle') {
        const ent = gameStateRef.current.gameEntities;
        const keys = gameStateRef.current.keys;
        const paddle = ent.paddle;
        const ball = ent.ball;

        // Move paddle using arrow keys or Mouse position
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
          paddle.x -= paddle.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
          paddle.x += paddle.speed;
        }

        // Mouse sync option
        if (gameStateRef.current.mouse.x) {
          paddle.x = gameStateRef.current.mouse.x - paddle.w / 2;
        }

        // Keep inside bounds
        paddle.x = Math.max(10, Math.min(width - 10 - paddle.w, paddle.x));

        // Let's render paddle
        ctx.save();
        ctx.strokeStyle = '#10b981'; // Neon Emerald
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#10b981';
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.restore();

        // Move Ball
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Hit wall checks
        if (ball.x - ball.r < 10) {
          ball.x = 10 + ball.r;
          ball.vx = -ball.vx;
          audioSystem.playHover();
        }
        if (ball.x + ball.r > width - 10) {
          ball.x = width - 10 - ball.r;
          ball.vx = -ball.vx;
          audioSystem.playHover();
        }
        if (ball.y - ball.r < 10) {
          ball.y = 10 + ball.r;
          ball.vy = -ball.vy;
          audioSystem.playHover();
        }

        // Paddle Collision
        if (
          ball.y + ball.r >= paddle.y &&
          ball.y - ball.r <= paddle.y + paddle.h &&
          ball.x + ball.r >= paddle.x &&
          ball.x - ball.r <= paddle.x + paddle.w
        ) {
          audioSystem.playHover();
          ball.y = paddle.y - ball.r;
          
          // Speed up slightly & adjust bounce angle based on hit position
          const hitPoint = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const currentSpeed = Math.hypot(ball.vx, ball.vy);
          const nextSpeed = Math.min(8.5, currentSpeed + 0.15);

          ball.vx = hitPoint * nextSpeed * 0.9;
          ball.vy = -Math.sqrt(Math.pow(nextSpeed, 2) - Math.pow(ball.vx, 2));

          // Ensure it goes upward
          if (ball.vy > -1.5) ball.vy = -1.5;
        }

        // Bottom border collision (fail condition)
        if (ball.y - ball.r > height) {
          handleGameOver(gameStateRef.current.score);
        }

        // Brick (crystals) collisions
        let remainingBricks = 0;
        ent.crystals.forEach((cryst: any) => {
          if (!cryst.active) return;
          remainingBricks += 1;

          // Check hit
          if (
            ball.x + ball.r > cryst.x &&
            ball.x - ball.r < cryst.x + cryst.w &&
            ball.y + ball.r > cryst.y &&
            ball.y - ball.r < cryst.y + cryst.h
          ) {
            cryst.active = false;
            audioSystem.playHover();
            
            // Simple flip velocity
            ball.vy = -ball.vy;

            gameStateRef.current.score += cryst.points;
            setScore(gameStateRef.current.score);
          }

          // Draw Crystals
          ctx.save();
          ctx.strokeStyle = cryst.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = cryst.color;
          ctx.fillStyle = cryst.color + '20'; // translucent transparency
          ctx.strokeRect(cryst.x, cryst.y, cryst.w, cryst.h);
          ctx.fillRect(cryst.x, cryst.y, cryst.w, cryst.h);
          ctx.restore();
        });

        // Trigger victory respawn if all broken
        if (remainingBricks === 0) {
          ent.crystals.forEach((c: any) => c.active = true); // Reset layout
          ball.y = height - 120;
          ball.vx = 4;
          ball.vy = -4;
        }

        // Draw projectile ball
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#10b981';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ----------------------------------------------------
      // GAME 5: CYBER AI BATTLE ARENA (PONG BOT)
      // ----------------------------------------------------
      else if (game.id === 'cyber-arena') {
        const ent = gameStateRef.current.gameEntities;
        const b = ent.ball;
        const pL = ent.paddleL; // AI
        const pR = ent.paddleR; // Player

        // AI Logic
        const diff = (b.y - (pL.y + pL.h / 2));
        const aiSpeed = Math.min(4.5 + (b.speed * 0.15), 8.5);
        if (diff > 12) {
          pL.y += aiSpeed;
        } else if (diff < -12) {
          pL.y -= aiSpeed;
        }

        // Player Logic with Cursor pointer
        if (gameStateRef.current.mouse.y) {
          pR.y = gameStateRef.current.mouse.y - pR.h / 2;
        }

        // Bind paddles
        pL.y = Math.max(10, Math.min(height - 10 - pL.h, pL.y));
        pR.y = Math.max(10, Math.min(height - 10 - pR.h, pR.y));

        // Ball movement and bounce physics
        b.x += b.vx;
        b.y += b.vy;

        // Top / Bottom walls bounce
        if (b.y - b.r < 10) {
          b.y = 10 + b.r;
          b.vy = -b.vy;
          audioSystem.playHover();
        }
        if (b.y + b.r > height - 10) {
          b.y = height - 10 - b.r;
          b.vy = -b.vy;
          audioSystem.playHover();
        }

        // Paddle L collision (AI) Handlers
        if (
          b.x - b.r <= pL.x + pL.w &&
          b.x + b.r >= pL.x &&
          b.y + b.r >= pL.y &&
          b.y - b.r <= pL.y + pL.h
        ) {
          audioSystem.playHover();
          b.x = pL.x + pL.w + b.r;
          b.vx = -b.vx;

          // Add feedback spin curves
          const hit = (b.y - (pL.y + pL.h / 2)) / (pL.h / 2);
          b.vy += hit * 1.5;
          b.vx *= 1.05; // speed up
        }

        // Paddle R collision (Player Handlers)
        if (
          b.x + b.r >= pR.x &&
          b.x - b.r <= pR.x + pR.w &&
          b.y + b.r >= pR.y &&
          b.y - b.r <= pR.y + pR.h
        ) {
          audioSystem.playClick();
          b.x = pR.x - b.r;
          b.vx = -b.vx;

          const hit = (b.y - (pR.y + pR.h / 2)) / (pR.h / 2);
          b.vy += hit * 1.8;
          b.vx *= 1.05; // accelerate speed

          gameStateRef.current.score += 30;
          setScore(gameStateRef.current.score);
        }

        // Score goal points trigger
        if (b.x - b.r < 0) {
          // Player scored a goal!
          gameStateRef.current.score += 150;
          setScore(gameStateRef.current.score);
          audioSystem.playHover();
          // Reset ball heading to Player side
          b.x = width / 2;
          b.y = height / 2;
          b.vx = 4;
          b.vy = (Math.random() - 0.5) * 4;
        }

        if (b.x + b.r > width) {
          // Player missed! Hit game over
          handleGameOver(gameStateRef.current.score);
        }

        // Draw Trails on hockey ball
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 8) b.trail.shift();

        b.trail.forEach((tr: any, idx: number) => {
          const rat = idx / b.trail.length;
          ctx.fillStyle = `rgba(6, 182, 212, ${rat * 0.28})`;
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, b.r * rat, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw Arena Entities
        ctx.fillStyle = '#f9731650';
        ctx.fillRect(pL.x, pL.y, pL.w, pL.h);
        ctx.strokeStyle = '#f97316';
        ctx.strokeRect(pL.x, pL.y, pL.w, pL.h);

        ctx.fillStyle = '#06b6d450';
        ctx.fillRect(pR.x, pR.y, pR.w, pR.h);
        ctx.strokeStyle = '#06b6d4';
        ctx.strokeRect(pR.x, pR.y, pR.w, pR.h);

        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
        ctx.stroke();

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPlaying, dimensions]);

  const screenWidth = isFullscreen ? window.innerWidth : Math.min(dimensions.width, window.innerWidth - 32);
  const screenHeight = isFullscreen ? window.innerHeight : Math.min(dimensions.height, window.innerHeight - 200);

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center items-start justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        ref={containerRef}
        className="relative w-full max-w-5xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 md:p-8 bg-[#0b0a13]/90 border border-[#a855f7]/40 overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col lg:flex-row gap-4 md:gap-6 animate-in fade-in zoom-in duration-300 max-h-[calc(100vh-48px)]"
      >
        {/* Absolute header options */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Outer sidebar info panel */}
        <div className="w-full lg:w-72 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 lg:pr-6 gap-3 md:gap-4 overflow-y-auto max-h-96 lg:max-h-none">
          <div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-mono px-2.5 py-1 rounded-full bg-white/5 text-purple-300 w-fit mb-2 sm:mb-3">
              <Gamepad2 size={10} />
              {game.category} System
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-sans font-bold text-white tracking-tight mb-1 sm:mb-2 line-clamp-2">
              {game.title}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 line-clamp-3">
              {game.description}
            </p>

            <div className="bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-mono text-cyan-400 block mb-2 font-semibold">
                Control Matrix:
              </span>
              <p className="text-white text-[11px] sm:text-xs leading-relaxed font-mono line-clamp-2">
                {game.controlInstructions}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 font-mono">
              <span>Potential XP:</span>
              <span className="text-emerald-400 font-semibold">+{game.xpReward} XP</span>
            </div>
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 font-mono">
              <span>High Score:</span>
              <span className="text-yellow-400 font-bold">{highScore} Pts</span>
            </div>

            <div className="flex gap-2 mt-1 sm:mt-2">
              <button 
                onClick={toggleSound}
                className="flex-1/2 flex items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title={muteSound ? "Unmute sounds" : "Mute sounds"}
              >
                {muteSound ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              
              <button 
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 p-2 sm:p-3 text-[10px] sm:text-xs uppercase font-mono tracking-wider rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={12} /> Exit
              </button>
            </div>

            <div className="mt-3 sm:mt-4 bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 max-h-56 md:max-h-64 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-white/5">
                <div>
                  <p className="text-[9px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 font-mono">Comments</p>
                  <p className="text-xs sm:text-sm text-white font-semibold">{gameComments.length}</p>
                </div>
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] text-cyan-300 line-clamp-1">{game.title}</span>
              </div>

              <div className="space-y-2 max-h-32 md:max-h-40 overflow-y-auto pr-1 flex-1 text-[11px]">
                {gameComments.length ? (
                  gameComments.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="bg-[#080716] rounded-lg p-2 border border-white/5">
                      <p className="text-[9px] text-gray-400 uppercase tracking-[0.15em] mb-0.5 font-mono truncate">{comment.username}</p>
                      <p className="text-xs text-white leading-tight line-clamp-2">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-xs">No comments yet.</p>
                )}
              </div>

              <div className="mt-2 sm:mt-3 border-t border-white/10 pt-2 sm:pt-3">
                {userProfile ? (
                  <form onSubmit={handleSubmitComment} className="space-y-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#07060e] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#a855f7] focus:outline-none resize-none"
                      placeholder="Leave a note..."
                      rows={2}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-white hover:opacity-90 transition-all"
                    >
                      Post
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-400 text-[11px]">Sign in to comment.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Game Screen Grid */}
        <div className="flex-1 flex flex-col justify-center items-center min-h-[350px] sm:min-h-[400px] md:min-h-[500px]">
          {!isPlaying && !gameOver && (
            <div 
              style={{ width: Math.min(dimensions.width, window.innerWidth - 32), height: dimensions.height * 0.6 }}
              className="bg-[#07060e] border border-white/5 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center p-4 sm:p-6 text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none" />
              <div className="absolute inset-0 bg-grid-[#ffffff]/[0.02] pointer-events-none" />

              {isExternalGame ? (
                <>
                  <div className="relative z-10 mb-3 sm:mb-4 rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                    <img src={game.image} alt={game.title} className="w-full h-56 object-cover" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 z-10">
                    Launch external game link
                  </h3>
                  <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm mb-4 sm:mb-6 z-10">
                    This title opens a website link instead of an embedded canvas game.
                  </p>
                  <button 
                    onClick={handleStartGame}
                    className="relative group/btn overflow-hidden cursor-pointer bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono uppercase tracking-widest text-[10px] sm:text-xs px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl font-bold transition-transform hover:scale-105 duration-200 flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  >
                    <Play size={12} fill="currentColor" /> Open Link
                  </button>
                </>
              ) : (
                <>
                  <div className="relative z-10 animate-bounce duration-1000 mb-3 sm:mb-4 bg-purple-500/10 p-3 sm:p-5 rounded-full border border-purple-500/20 text-purple-400">
                    <Gamepad2 size={32} />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-1.5 z-10">
                    Ready to Initiate Sim?
                  </h3>
                  <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm mb-4 sm:mb-6 z-10 line-clamp-2">
                    Level up and build badge credibility.
                  </p>
                  <button 
                    onClick={handleStartGame}
                    className="relative group/btn overflow-hidden cursor-pointer bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono uppercase tracking-widest text-[10px] sm:text-xs px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl font-bold transition-transform hover:scale-105 duration-200 flex items-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  >
                    <Play size={12} fill="currentColor" /> Initialize
                  </button>
                </>
              )}
            </div>
          )}

          {gameOver && (
            <div 
              style={{ width: Math.min(dimensions.width, window.innerWidth - 32), height: dimensions.height * 0.6 }}
              className="bg-[#0c0915] border border-red-500/20 rounded-xl sm:rounded-2xl flex flex-col justify-center items-center p-4 sm:p-6 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.08)_0%,transparent_65%)] pointer-events-none" />
              
              <div className="animate-pulse mb-3 sm:mb-4 bg-red-500/10 p-3 sm:p-4 rounded-full border border-red-500/20 text-red-500">
                <AlertTriangle size={28} />
              </div>

              <h3 className="text-lg sm:text-2xl font-black font-sans text-red-500 uppercase tracking-widest mb-0.5 sm:mb-1">
                Simulation Terminated
              </h3>
              <p className="text-gray-400 text-[11px] sm:text-xs mb-3 sm:mb-4">
                Systems desynchronized.
              </p>

              <div className="bg-white/5 rounded-lg sm:rounded-2xl py-2 sm:py-3.5 px-4 sm:px-6 border border-white/5 flex gap-6 sm:gap-8 mb-4 sm:mb-6 font-mono text-sm">
                <div>
                  <span className="text-gray-500 text-[9px] sm:text-[10px] uppercase block">Final Score</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">{score}</span>
                </div>
                <div className="border-r border-white/10" />
                <div>
                  <span className="text-gray-500 text-[9px] sm:text-[10px] uppercase block">Reward</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400">+{Math.min(game.xpReward, Math.floor(score / 10) + 10)} XP</span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 w-full flex-wrap justify-center">
                <button 
                  onClick={handleStartGame}
                  className="cursor-pointer font-mono uppercase tracking-wider text-[10px] sm:text-xs px-4 sm:px-6 py-2 sm:py-3 bg-white text-black hover:bg-gray-200 rounded-lg sm:rounded-xl font-bold transition-all flex items-center gap-1 sm:gap-2 shadow-lg flex-1 sm:flex-none justify-center"
                >
                  <RotateCcw size={12} /> Retry
                </button>
                <button 
                  onClick={onClose}
                  className="cursor-pointer font-mono uppercase tracking-wider text-[10px] sm:text-xs px-4 sm:px-6 py-2 sm:py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-lg sm:rounded-xl transition-colors flex-1 sm:flex-none"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="relative w-full flex flex-col justify-center items-center gap-3 sm:gap-4">
              <div 
                ref={gameScreenRef}
                className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-full'} flex justify-center`}
              >
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-center pointer-events-none z-20 font-mono gap-2">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white whitespace-nowrap">
                    Score: <span className="text-cyan-400 font-bold">{score}</span>
                  </div>
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white whitespace-nowrap">
                    Target: <span className="text-purple-400 font-bold">{highScore} Pts</span>
                  </div>
                </div>

                {game.iframeUrl ? (
                  <iframe
                    title={game.title}
                    src={game.iframeUrl}
                    width={screenWidth}
                    height={screenHeight}
                    className={`bg-[#05040a] rounded-lg sm:rounded-2xl block shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 ${isFullscreen ? 'w-full h-full' : ''}`}
                    frameBorder="0"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <canvas
                    ref={canvasRef}
                    width={screenWidth}
                    height={screenHeight}
                    className={`bg-[#05040a] rounded-lg sm:rounded-2xl block shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5 ${isFullscreen ? 'w-full h-full' : ''}`}
                    style={{ cursor: game.id === 'cyber-arena' || game.id === 'quantum-puzzle' ? 'none' : 'default', maxWidth: '100%', height: isFullscreen ? '100%' : 'auto' }}
                  />
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono uppercase tracking-wider text-[10px] sm:text-xs rounded-lg sm:rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize size={14} /> Exit Full Screen
                  </>
                ) : (
                  <>
                    <Maximize size={14} /> Full Screen
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
