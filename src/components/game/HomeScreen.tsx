import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text3D, Float, Sparkles, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { Play, Settings, Trophy, User, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';

// Animated 3D Logo Component
const GameLogo = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text3D
          font="/fonts/comic.json"
          size={1.5}
          height={0.3}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.1}
          bevelSize={0.05}
          bevelOffset={0}
          bevelSegments={5}
          position={[-4, 0, 0]}
        >
          PuzzleToon
          <meshStandardMaterial 
            color="#00ffff" 
            emissive="#004444"
            roughness={0.3}
            metalness={0.8}
          />
        </Text3D>
      </Float>
      
      {/* Brain icon representation */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh position={[2, -1, 0]}>
          <sphereGeometry args={[0.8, 32, 16]} />
          <meshStandardMaterial 
            color="#ff6b9d"
            emissive="#662244"
            roughness={0.2}
            metalness={0.7}
          />
        </mesh>
        <Sparkles 
          count={20} 
          scale={[4, 4, 4]} 
          size={3} 
          speed={0.5}
          color="#00ffff"
        />
      </Float>
    </group>
  );
};

// Floating UI particles
const BackgroundParticles = () => {
  return (
    <Sparkles 
      count={50} 
      scale={[20, 20, 20]} 
      size={2} 
      speed={0.2}
      color="#8b5cf6"
      opacity={0.6}
    />
  );
};

const HomeScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    player, 
    settings, 
    updateSettings,
    premium 
  } = useGameStore();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handlePlayClick = () => {
    setCurrentScreen('worlds');
  };

  const handleCharacterClick = () => {
    setCurrentScreen('character');
  };

  const handleShopClick = () => {
    setCurrentScreen('shop');
  };

  const handleSettingsClick = () => {
    setCurrentScreen('settings');
  };

  return (
    <div className="fixed inset-0 bg-gradient-cosmic game-ui">
      {/* 3D Scene Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Environment preset="night" />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b9d" />
          
          <GameLogo />
          <BackgroundParticles />
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-energy"></div>
                <div>
                  <p className="text-sm font-bold text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">Level {player.level}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-warning"></div>
                  <span className="text-sm font-bold">{player.brainStars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                  <span className="text-sm font-bold">{player.memoryFragments}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className="cosmic-glow"
            >
              {settings.soundEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
            
            {premium.isUnlocked && (
              <div className="bg-gradient-mystery p-2 rounded-lg shadow-cosmic">
                <span className="text-xs font-bold text-warning">PREMIUM</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
          {/* Main Title Area */}
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-transparent bg-gradient-energy bg-clip-text mb-4">
              The Brainiverse
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Journey through worlds of mind-bending puzzles where emotions shape reality
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button
              variant="cosmic"
              size="xl"
              onClick={handlePlayClick}
              className="bounce-enter"
            >
              <Play className="mr-2" />
              Start Adventure
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="joy"
                size="lg"
                onClick={handleCharacterClick}
              >
                <User className="mr-2" />
                Character
              </Button>

              <Button
                variant="curiosity"
                size="lg"
                onClick={handleShopClick}
              >
                <ShoppingBag className="mr-2" />
                Shop
              </Button>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleSettingsClick}
            >
              <Settings className="mr-2" />
              Settings
            </Button>
          </div>

          {/* Progress Stats */}
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-center">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-success">{player.completedLevels.length}</div>
                <div className="text-xs text-muted-foreground">Levels Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{player.brainStars}</div>
                <div className="text-xs text-muted-foreground">Brain Stars</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{player.unlockedWorlds.length}</div>
                <div className="text-xs text-muted-foreground">Worlds Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-6">
          <p className="text-sm text-muted-foreground">
            Developed with ❤️ for puzzle enthusiasts
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;