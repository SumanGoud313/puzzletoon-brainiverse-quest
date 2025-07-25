import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Star, Lock, Play, Trophy, Brain, Clock, Target } from 'lucide-react';
import { useAudio } from './AudioSystem';

const LevelSelectScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    setCurrentLevel,
    currentWorld,
    worlds, 
    player 
  } = useGameStore();
  
  const { playSoundEffect } = useAudio();

  const currentWorldData = worlds.find(w => w.id === currentWorld);

  const handleBackClick = () => {
    playSoundEffect('click');
    setCurrentScreen('worlds');
  };

  const handleLevelClick = (levelId: string) => {
    const level = currentWorldData?.levels.find(l => l.id === levelId);
    if (level && level.unlocked) {
      playSoundEffect('success');
      setCurrentLevel(levelId);
      setCurrentScreen('level');
    } else {
      playSoundEffect('error');
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '#22c55e'; // Green
      case 2: return '#eab308'; // Yellow
      case 3: return '#f97316'; // Orange
      case 4: return '#ef4444'; // Red
      case 5: return '#a855f7'; // Purple
      default: return '#64748b'; // Gray
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Unknown';
    }
  };

  if (!currentWorldData) {
    return (
      <div className="fixed inset-0 bg-gradient-cosmic flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">World not found</h1>
          <Button onClick={handleBackClick}>Back to Worlds</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-cosmic game-ui">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
            <mesh>
              <torusGeometry args={[3, 0.8, 16, 100]} />
              <meshStandardMaterial 
                color={currentWorldData.color}
                emissive={currentWorldData.color}
                emissiveIntensity={0.2}
                transparent
                opacity={0.3}
              />
            </mesh>
          </Float>

          <Sparkles 
            count={30} 
            scale={[20, 20, 20]} 
            size={3} 
            speed={0.3}
            color={currentWorldData.color}
          />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={1}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <Button
            variant="outline"
            size="lg"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">{currentWorldData.name}</h1>
            <p className="text-sm text-muted-foreground">{currentWorldData.description}</p>
          </div>

          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold">
                {currentWorldData.levels.reduce((sum, level) => sum + level.stars, 0)}/
                {currentWorldData.levels.length * 3}
              </span>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {currentWorldData.levels.map((level) => {
              const isCompleted = player.completedLevels.includes(level.id);
              const isLocked = !level.unlocked;
              
              return (
                <div
                  key={level.id}
                  className={`relative bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-cosmic transition-all duration-300 ${
                    isLocked ? 'opacity-50' : 'hover:scale-105 cursor-pointer'
                  }`}
                  onClick={() => handleLevelClick(level.id)}
                >
                  {/* Level Number */}
                  <div className="text-center mb-3">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-lg font-bold"
                      style={{ 
                        backgroundColor: isLocked ? '#444444' : getDifficultyColor(level.difficulty),
                        color: '#ffffff'
                      }}
                    >
                      {isLocked ? <Lock className="w-5 h-5" /> : level.levelNumber}
                    </div>
                  </div>

                  {/* Level Info */}
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-bold truncate">{level.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getDifficultyText(level.difficulty)}
                    </p>
                  </div>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= level.stars ? 'text-warning fill-warning' : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Level Type Icon */}
                  <div className="flex justify-center mb-2">
                    {level.type === 'emotion-shift' && <Target className="w-4 h-4 text-primary" />}
                    {level.type === 'memory-replay' && <Brain className="w-4 h-4 text-warning" />}
                    {level.type === 'light-mirror' && <Star className="w-4 h-4 text-secondary" />}
                    {level.type === 'rube-goldberg' && <Trophy className="w-4 h-4 text-success" />}
                    {level.type === 'gravity-flip' && <Clock className="w-4 h-4 text-danger" />}
                    {level.type === 'boss' && <Trophy className="w-4 h-4 text-cosmic" />}
                  </div>

                  {/* Best Time */}
                  {level.bestTime && (
                    <div className="text-xs text-center text-muted-foreground">
                      Best: {Math.floor(level.bestTime / 60)}:{(level.bestTime % 60).toString().padStart(2, '0')}
                    </div>
                  )}

                  {/* Play Button for Unlocked Levels */}
                  {!isLocked && (
                    <Button
                      variant={isCompleted ? "success" : "cosmic"}
                      size="sm"
                      className="w-full mt-2"
                    >
                      {isCompleted ? (
                        <>
                          <Trophy className="mr-1 w-3 h-3" />
                          Replay
                        </>
                      ) : (
                        <>
                          <Play className="mr-1 w-3 h-3" />
                          Play
                        </>
                      )}
                    </Button>
                  )}

                  {/* Required Emotion Badge */}
                  {level.requiredEmotion && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-background/80 flex items-center justify-center text-xs">
                        {level.requiredEmotion === 'joy' && '😊'}
                        {level.requiredEmotion === 'curiosity' && '🤔'}
                        {level.requiredEmotion === 'sadness' && '😢'}
                        {level.requiredEmotion === 'anger' && '😠'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Footer */}
        <div className="p-6 bg-card/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">World Progress</span>
              <span className="text-sm">
                {currentWorldData.levels.filter(l => player.completedLevels.includes(l.id)).length}/
                {currentWorldData.levels.length} Completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-success rounded-full h-3 transition-all duration-500"
                style={{ 
                  width: `${(currentWorldData.levels.filter(l => player.completedLevels.includes(l.id)).length / currentWorldData.levels.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelectScreen;