import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Environment, Text3D, Box, Sphere } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Star, Play, Pause, RotateCcw, Lightbulb, Heart, Timer } from 'lucide-react';
import * as THREE from 'three';

// Game Character Component
const GameCharacter = ({ emotion, position }: { emotion: string; position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'joy': return '#f59e0b';
      case 'curiosity': return '#3b82f6';
      case 'sadness': return '#8b5cf6';
      case 'anger': return '#ef4444';
      default: return '#00ffff';
    }
  };

  return (
    <group ref={meshRef} position={position}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Character Body */}
        <mesh>
          <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
          <meshStandardMaterial 
            color={getEmotionColor(emotion)}
            emissive={getEmotionColor(emotion)}
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        
        {/* Character Head */}
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial 
            color="#ffdbaa"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Emotion Aura */}
        <Sparkles 
          count={10} 
          scale={[2, 2, 2]} 
          size={1} 
          speed={0.8}
          color={getEmotionColor(emotion)}
        />
      </Float>
    </group>
  );
};

// Puzzle Element Components
const PuzzleBlock = ({ position, color, onClick }: {
  position: [number, number, number];
  color: string;
  onClick?: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <Box
      ref={meshRef}
      position={position}
      args={[1, 1, 1]}
      onClick={onClick}
    >
      <meshStandardMaterial 
        color={color}
        roughness={0.2}
        metalness={0.8}
      />
    </Box>
  );
};

const EnergyOrb = ({ position, collected }: {
  position: [number, number, number];
  collected: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && !collected) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.03;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  if (collected) return null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere
        ref={meshRef}
        position={position}
        args={[0.2, 16, 16]}
      >
        <meshStandardMaterial 
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      <Sparkles 
        count={8} 
        scale={[1, 1, 1]} 
        size={1} 
        speed={1}
        color="#00ffff"
      />
    </Float>
  );
};

const LevelScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    setCurrentLevel,
    setIsPlaying,
    setIsPaused,
    currentWorld, 
    currentLevel,
    isPlaying,
    isPaused,
    player,
    worlds,
    completeLevel,
    spendHints,
    changeEmotion
  } = useGameStore();

  const [gameTime, setGameTime] = useState(0);
  const [collectedStars, setCollectedStars] = useState(0);
  const [collectedFragments, setCollectedFragments] = useState(0);
  const [puzzleState, setPuzzleState] = useState({
    blocksActivated: 0,
    orbsCollected: 0,
    emotionUsed: false
  });

  const currentWorldData = worlds.find(w => w.id === currentWorld);
  const currentLevelData = currentWorldData?.levels.find(l => l.id === currentLevel);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  const handleBackClick = () => {
    setCurrentScreen('worlds');
    setCurrentLevel(null);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleRestart = () => {
    setGameTime(0);
    setCollectedStars(0);
    setCollectedFragments(0);
    setPuzzleState({
      blocksActivated: 0,
      orbsCollected: 0,
      emotionUsed: false
    });
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleHint = () => {
    if (player.hints > 0) {
      spendHints(1);
      // Show hint logic here
    }
  };

  const handleEmotionChange = (emotion: 'joy' | 'curiosity' | 'sadness' | 'anger') => {
    changeEmotion(emotion);
    setPuzzleState(prev => ({ ...prev, emotionUsed: true }));
  };

  const handlePuzzleInteraction = (type: 'block' | 'orb') => {
    if (type === 'block') {
      setPuzzleState(prev => ({ ...prev, blocksActivated: prev.blocksActivated + 1 }));
    } else if (type === 'orb') {
      setPuzzleState(prev => ({ ...prev, orbsCollected: prev.orbsCollected + 1 }));
      setCollectedFragments(prev => prev + 1);
    }

    // Check win condition
    if (puzzleState.blocksActivated >= 2 && puzzleState.orbsCollected >= 2 && puzzleState.emotionUsed) {
      handleLevelComplete();
    }
  };

  const handleLevelComplete = () => {
    const stars = Math.min(3, Math.floor((180 - gameTime) / 60) + 1); // Time-based scoring
    const brainStars = stars * 10;
    
    if (currentLevel) {
      completeLevel(currentLevel, stars, gameTime, brainStars, collectedFragments);
    }
    
    setIsPlaying(false);
    setCurrentScreen('worlds');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentLevelData) {
    return <div>Level not found</div>;
  }

  return (
    <div className="fixed inset-0 bg-gradient-cosmic game-ui">
      {/* 3D Game Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 10, 5]} intensity={1} color="#00ffff" />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ff6b9d" />
          
          {/* Game Character */}
          <GameCharacter 
            emotion={player.currentEmotion} 
            position={[0, 0, 0]} 
          />
          
          {/* Puzzle Elements */}
          <PuzzleBlock 
            position={[-3, 0, -2]} 
            color={puzzleState.blocksActivated > 0 ? "#00ff00" : "#666666"}
            onClick={() => handlePuzzleInteraction('block')}
          />
          <PuzzleBlock 
            position={[3, 0, -2]} 
            color={puzzleState.blocksActivated > 1 ? "#00ff00" : "#666666"}
            onClick={() => handlePuzzleInteraction('block')}
          />
          
          {/* Collectible Orbs */}
          <EnergyOrb 
            position={[-2, 2, 1]} 
            collected={puzzleState.orbsCollected > 0}
          />
          <EnergyOrb 
            position={[2, 2, 1]} 
            collected={puzzleState.orbsCollected > 1}
          />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top HUD */}
        <div className="flex justify-between items-center p-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Exit
          </Button>

          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
            <h2 className="text-lg font-bold text-center">{currentLevelData.name}</h2>
            <p className="text-xs text-muted-foreground text-center">
              {currentWorldData?.name} - Level {currentLevelData.levelNumber}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-2 shadow-cosmic">
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold">{formatTime(gameTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="absolute top-20 left-4 flex flex-col gap-2">
          <Button
            variant={isPlaying && !isPaused ? "warning" : "success"}
            size="icon"
            onClick={handlePlayPause}
          >
            {isPlaying && !isPaused ? <Pause /> : <Play />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRestart}
          >
            <RotateCcw />
          </Button>

          <Button
            variant="curiosity"
            size="icon"
            onClick={handleHint}
            disabled={player.hints === 0}
          >
            <Lightbulb />
            <span className="absolute -top-1 -right-1 text-xs bg-warning text-warning-foreground rounded-full w-5 h-5 flex items-center justify-center">
              {player.hints}
            </span>
          </Button>
        </div>

        {/* Emotion Wheel */}
        <div className="absolute top-20 right-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-full p-3 shadow-cosmic">
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="joy"
                size="icon"
                onClick={() => handleEmotionChange('joy')}
                className={player.currentEmotion === 'joy' ? 'ring-2 ring-warning' : ''}
              >
                😊
              </Button>
              <Button
                variant="curiosity"
                size="icon"
                onClick={() => handleEmotionChange('curiosity')}
                className={player.currentEmotion === 'curiosity' ? 'ring-2 ring-warning' : ''}
              >
                🤔
              </Button>
              <Button
                variant="sadness"
                size="icon"
                onClick={() => handleEmotionChange('sadness')}
                className={player.currentEmotion === 'sadness' ? 'ring-2 ring-warning' : ''}
              >
                😢
              </Button>
              <Button
                variant="anger"
                size="icon"
                onClick={() => handleEmotionChange('anger')}
                className={player.currentEmotion === 'anger' ? 'ring-2 ring-warning' : ''}
              >
                😠
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-cosmic">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-warning" />
                <span className="text-sm font-bold">{collectedStars}/3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary"></div>
                <span className="text-sm font-bold">{collectedFragments}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-anger" />
                <span className="text-sm font-bold">3/3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Instructions */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-cosmic max-w-md">
            <p className="text-sm text-center text-muted-foreground">
              {currentLevelData.type === 'emotion-shift' && "Use different emotions to activate the colored blocks!"}
              {currentLevelData.type === 'memory-replay' && "Replay the sequence you just saw!"}
              {currentLevelData.type === 'light-mirror' && "Reflect the light beams to hit all targets!"}
              {currentLevelData.type === 'rube-goldberg' && "Set up the chain reaction to solve the puzzle!"}
              {currentLevelData.type === 'gravity-flip' && "Change gravity to navigate the level!"}
              {currentLevelData.type === 'boss' && "Defeat the boss using all your skills!"}
            </p>
          </div>
        </div>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card rounded-xl p-8 shadow-cosmic">
              <h2 className="text-2xl font-bold text-center mb-6">Game Paused</h2>
              <div className="flex gap-4">
                <Button variant="cosmic" onClick={handlePlayPause}>
                  Resume
                </Button>
                <Button variant="outline" onClick={handleRestart}>
                  Restart
                </Button>
                <Button variant="outline" onClick={handleBackClick}>
                  Exit Level
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelScreen;