import React, { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import HomeScreen from './HomeScreen';
import WorldsScreen from './WorldsScreen';
import LevelScreen from './LevelScreen';
import LevelSelectScreen from './LevelSelectScreen';
import CharacterScreen from './CharacterScreen';
import ShopScreen from './ShopScreen';
import SettingsScreen from './SettingsScreen';
import AudioSystem from './AudioSystem';

const GameManager: React.FC = () => {
  const { currentScreen, settings } = useGameStore();

  // Initialize game audio and settings
  useEffect(() => {
    // Set up global game settings
    document.body.style.overflow = 'hidden';
    
    // Initialize audio context if needed
    if (settings.soundEnabled) {
      // Audio initialization would go here
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [settings.soundEnabled]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'worlds':
        return <WorldsScreen />;
      case 'level-select':
        return <LevelSelectScreen />;
      case 'level':
        return <LevelScreen />;
      case 'character':
        return <CharacterScreen />;
      case 'shop':
        return <ShopScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AudioSystem>
      <div className="game-container">
        {renderCurrentScreen()}
      </div>
    </AudioSystem>
  );
};

export default GameManager;