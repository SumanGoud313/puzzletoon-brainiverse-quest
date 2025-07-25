import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Emotion = 'joy' | 'curiosity' | 'sadness' | 'anger';

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  currentEmotion: Emotion;
  unlockedWorlds: number[];
  completedLevels: string[];
  brainStars: number;
  memoryFragments: number;
  hints: number;
  customization: {
    skinColor: string;
    accessory: string;
    emotion: Emotion;
  };
}

export interface World {
  id: number;
  name: string;
  theme: string;
  description: string;
  levels: Level[];
  unlocked: boolean;
  completed: boolean;
  color: string;
  bgGradient: string;
}

export interface Level {
  id: string;
  worldId: number;
  levelNumber: number;
  name: string;
  type: 'emotion-shift' | 'memory-replay' | 'light-mirror' | 'rube-goldberg' | 'gravity-flip' | 'boss';
  difficulty: 1 | 2 | 3 | 4 | 5;
  requiredEmotion?: Emotion;
  completed: boolean;
  stars: number; // 0-3 stars based on performance
  bestTime?: number;
  brainStarsCollected: number;
  memoryFragmentsCollected: number;
  unlocked: boolean;
}

export interface GameState {
  // Game status
  currentScreen: 'home' | 'worlds' | 'level-select' | 'level' | 'character' | 'shop' | 'settings' | 'pause';
  currentWorld: number | null;
  currentLevel: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  
  // Player data
  player: Player;
  
  // Game content
  worlds: World[];
  
  // Game settings
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    hapticEnabled: boolean;
    graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
    language: string;
  };
  
  // Premium features
  premium: {
    isUnlocked: boolean;
    adsRemoved: boolean;
    seasonPassActive: boolean;
  };
  
  // Actions
  setCurrentScreen: (screen: GameState['currentScreen']) => void;
  setCurrentWorld: (worldId: number | null) => void;
  setCurrentLevel: (levelId: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  updatePlayer: (updates: Partial<Player>) => void;
  completeLevel: (levelId: string, stars: number, time: number, brainStars: number, fragments: number) => void;
  unlockWorld: (worldId: number) => void;
  changeEmotion: (emotion: Emotion) => void;
  spendHints: (amount: number) => void;
  addHints: (amount: number) => void;
  spendBrainStars: (amount: number) => void;
  addBrainStars: (amount: number) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  unlockPremium: () => void;
  resetProgress: () => void;
}

const createInitialWorlds = (): World[] => [
  {
    id: 1,
    name: "Joyful Jungle",
    theme: "Bright rainforest with bouncy platforms",
    description: "Welcome to your first adventure! Learn the basics of emotion-based puzzles.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `1-${i + 1}`,
      worldId: 1,
      levelNumber: i + 1,
      name: `Jungle Joy ${i + 1}`,
      type: 'emotion-shift' as const,
      difficulty: Math.min(i + 1, 3) as 1 | 2 | 3 | 4 | 5,
      requiredEmotion: 'joy' as Emotion,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: i === 0
    })),
    unlocked: true,
    completed: false,
    color: '#22c55e',
    bgGradient: 'var(--gradient-joy)'
  },
  {
    id: 2,
    name: "Circuit Caves",
    theme: "Technological underground with logic puzzles",
    description: "Master complex machinery and Rube Goldberg contraptions.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `2-${i + 1}`,
      worldId: 2,
      levelNumber: i + 1,
      name: `Circuit ${i + 1}`,
      type: 'rube-goldberg' as const,
      difficulty: Math.min(i + 2, 5) as 1 | 2 | 3 | 4 | 5,
      requiredEmotion: 'curiosity' as Emotion,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#3b82f6',
    bgGradient: 'var(--gradient-energy)'
  },
  {
    id: 3,
    name: "Shadow Shores",
    theme: "Mystical beaches with light manipulation",
    description: "Harness the power of light and shadow to solve ancient mysteries.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `3-${i + 1}`,
      worldId: 3,
      levelNumber: i + 1,
      name: `Shadow ${i + 1}`,
      type: 'light-mirror' as const,
      difficulty: Math.min(i + 2, 5) as 1 | 2 | 3 | 4 | 5,
      requiredEmotion: 'sadness' as Emotion,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#8b5cf6',
    bgGradient: 'var(--gradient-mystery)'
  },
  {
    id: 4,
    name: "Memory Meadows",
    theme: "Nostalgic landscapes with time puzzles",
    description: "Travel through time and replay memories to unlock the future.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `4-${i + 1}`,
      worldId: 4,
      levelNumber: i + 1,
      name: `Memory ${i + 1}`,
      type: 'memory-replay' as const,
      difficulty: Math.min(i + 2, 5) as 1 | 2 | 3 | 4 | 5,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#f59e0b',
    bgGradient: 'var(--gradient-cosmic)'
  },
  {
    id: 5,
    name: "MindMelt Volcano",
    theme: "Intense volcanic challenges with time pressure",
    description: "Face the ultimate test of speed and precision in the fiery depths.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `5-${i + 1}`,
      worldId: 5,
      levelNumber: i + 1,
      name: `Volcano ${i + 1}`,
      type: 'gravity-flip' as const,
      difficulty: Math.min(i + 3, 5) as 1 | 2 | 3 | 4 | 5,
      requiredEmotion: 'anger' as Emotion,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#ef4444',
    bgGradient: 'var(--gradient-energy)'
  },
  {
    id: 6,
    name: "Dreamvoid",
    theme: "Surreal dimension with mixed mechanics",
    description: "Enter the realm where reality bends and emotions shape the world.",
    levels: Array.from({ length: 10 }, (_, i) => ({
      id: `6-${i + 1}`,
      worldId: 6,
      levelNumber: i + 1,
      name: `Dream ${i + 1}`,
      type: (['emotion-shift', 'memory-replay', 'light-mirror', 'rube-goldberg'] as const)[i % 4],
      difficulty: Math.min(i + 3, 5) as 1 | 2 | 3 | 4 | 5,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#a855f7',
    bgGradient: 'var(--gradient-mystery)'
  },
  {
    id: 7,
    name: "Nyro's Core",
    theme: "AI Boss battles and ultimate challenges",
    description: "Face the AI overlord Nyro in the final showdown of minds.",
    levels: Array.from({ length: 5 }, (_, i) => ({
      id: `7-${i + 1}`,
      worldId: 7,
      levelNumber: i + 1,
      name: `Boss ${i + 1}`,
      type: 'boss' as const,
      difficulty: 5 as const,
      completed: false,
      stars: 0,
      brainStarsCollected: 0,
      memoryFragmentsCollected: 0,
      unlocked: false
    })),
    unlocked: false,
    completed: false,
    color: '#06b6d4',
    bgGradient: 'var(--gradient-cosmic)'
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentScreen: 'home',
      currentWorld: null,
      currentLevel: null,
      isPlaying: false,
      isPaused: false,
      
      player: {
        id: 'player_1',
        name: 'BrainHero',
        level: 1,
        experience: 0,
        currentEmotion: 'joy',
        unlockedWorlds: [1],
        completedLevels: [],
        brainStars: 50,
        memoryFragments: 10,
        hints: 3,
        customization: {
          skinColor: '#ffdbaa',
          accessory: 'none',
          emotion: 'joy'
        }
      },
      
      worlds: createInitialWorlds(),
      
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        hapticEnabled: true,
        graphicsQuality: 'high',
        language: 'en'
      },
      
      premium: {
        isUnlocked: false,
        adsRemoved: false,
        seasonPassActive: false
      },
      
      // Actions
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setCurrentWorld: (worldId) => set({ currentWorld: worldId }),
      setCurrentLevel: (levelId) => set({ currentLevel: levelId }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsPaused: (paused) => set({ isPaused: paused }),
      
      updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates }
      })),
      
      completeLevel: (levelId, stars, time, brainStars, fragments) => set((state) => {
        const updatedWorlds = state.worlds.map(world => ({
          ...world,
          levels: world.levels.map(level => {
            if (level.id === levelId) {
              const newLevel = {
                ...level,
                completed: true,
                stars: Math.max(level.stars, stars),
                bestTime: level.bestTime ? Math.min(level.bestTime, time) : time,
                brainStarsCollected: Math.max(level.brainStarsCollected, brainStars),
                memoryFragmentsCollected: Math.max(level.memoryFragmentsCollected, fragments)
              };
              
              // Unlock next level in same world
              const nextLevelIndex = world.levels.findIndex(l => l.id === levelId) + 1;
              if (nextLevelIndex < world.levels.length) {
                world.levels[nextLevelIndex].unlocked = true;
              }
              
              return newLevel;
            }
            return level;
          })
        }));
        
        // Check if world is completed
        updatedWorlds.forEach(world => {
          const allCompleted = world.levels.every(level => level.completed);
          if (allCompleted && !world.completed) {
            world.completed = true;
            // Unlock next world
            const nextWorld = updatedWorlds.find(w => w.id === world.id + 1);
            if (nextWorld) {
              nextWorld.unlocked = true;
              nextWorld.levels[0].unlocked = true;
            }
          }
        });
        
        return {
          worlds: updatedWorlds,
          player: {
            ...state.player,
            completedLevels: [...new Set([...state.player.completedLevels, levelId])],
            brainStars: state.player.brainStars + brainStars,
            memoryFragments: state.player.memoryFragments + fragments,
            experience: state.player.experience + stars * 100
          }
        };
      }),
      
      unlockWorld: (worldId) => set((state) => ({
        worlds: state.worlds.map(world => 
          world.id === worldId ? { ...world, unlocked: true } : world
        ),
        player: {
          ...state.player,
          unlockedWorlds: [...new Set([...state.player.unlockedWorlds, worldId])]
        }
      })),
      
      changeEmotion: (emotion) => set((state) => ({
        player: { ...state.player, currentEmotion: emotion }
      })),
      
      spendHints: (amount) => set((state) => ({
        player: { ...state.player, hints: Math.max(0, state.player.hints - amount) }
      })),
      
      addHints: (amount) => set((state) => ({
        player: { ...state.player, hints: state.player.hints + amount }
      })),
      
      spendBrainStars: (amount) => set((state) => ({
        player: { ...state.player, brainStars: Math.max(0, state.player.brainStars - amount) }
      })),
      
      addBrainStars: (amount) => set((state) => ({
        player: { ...state.player, brainStars: state.player.brainStars + amount }
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
      
      unlockPremium: () => set((state) => ({
        premium: { ...state.premium, isUnlocked: true, adsRemoved: true }
      })),
      
      resetProgress: () => set({
        player: {
          id: 'player_1',
          name: 'BrainHero',
          level: 1,
          experience: 0,
          currentEmotion: 'joy',
          unlockedWorlds: [1],
          completedLevels: [],
          brainStars: 50,
          memoryFragments: 10,
          hints: 3,
          customization: {
            skinColor: '#ffdbaa',
            accessory: 'none',
            emotion: 'joy'
          }
        },
        worlds: createInitialWorlds(),
        currentLevel: null,
        currentWorld: null
      })
    }),
    {
      name: 'puzzletoon-game-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);