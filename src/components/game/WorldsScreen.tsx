import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Environment, Text3D } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Star, Lock, Play, Trophy, Brain, Clock } from 'lucide-react';
import * as THREE from 'three';

// 3D World Portal Component
const WorldPortal = ({ world, position, onClick, isLocked }: {
  world: any;
  position: [number, number, number];
  onClick: () => void;
  isLocked: boolean;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position} onClick={onClick}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* Portal Ring */}
        <mesh>
          <torusGeometry args={[1, 0.3, 16, 100]} />
          <meshStandardMaterial 
            color={isLocked ? "#444444" : world.color}
            emissive={isLocked ? "#000000" : world.color}
            emissiveIntensity={isLocked ? 0 : 0.3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Portal Center */}
        <mesh>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial 
            color={isLocked ? "#222222" : world.color}
            transparent
            opacity={isLocked ? 0.3 : 0.7}
            emissive={isLocked ? "#000000" : world.color}
            emissiveIntensity={isLocked ? 0 : 0.2}
          />
        </mesh>

        {/* Sparkles around portal */}
        {!isLocked && (
          <Sparkles 
            count={15} 
            scale={[3, 3, 3]} 
            size={2} 
            speed={0.5}
            color={world.color}
          />
        )}
        
        {/* Lock icon for locked worlds */}
        {isLocked && (
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[0.3, 0.4, 0.1]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
        )}
      </Float>
    </group>
  );
};

// Floating World Name
const WorldLabel = ({ text, position }: { text: string; position: [number, number, number] }) => {
  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <Text3D
        font="/fonts/comic.json"
        size={0.3}
        height={0.05}
        position={[position[0] - text.length * 0.1, position[1] - 2, position[2]]}
      >
        {text}
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </Text3D>
    </Float>
  );
};

const WorldsScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    setCurrentWorld, 
    worlds, 
    player 
  } = useGameStore();

  const handleBackClick = () => {
    setCurrentScreen('home');
  };

  const handleWorldClick = (worldId: number) => {
    const world = worlds.find(w => w.id === worldId);
    if (world && world.unlocked) {
      setCurrentWorld(worldId);
      setCurrentScreen('level');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-mystery game-ui">
      {/* 3D Scene Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 75 }}>
          <Environment preset="night" />
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
          <pointLight position={[-5, 5, -5]} intensity={0.8} color="#00ffff" />
          
          {/* World Portals arranged in a circle */}
          {worlds.map((world, index) => {
            const angle = (index / worlds.length) * Math.PI * 2;
            const radius = 4;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <React.Fragment key={world.id}>
                <WorldPortal
                  world={world}
                  position={[x, 0, z]}
                  onClick={() => handleWorldClick(world.id)}
                  isLocked={!world.unlocked}
                />
                <WorldLabel 
                  text={world.name}
                  position={[x, 0, z]}
                />
              </React.Fragment>
            );
          })}
          
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={15}
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

          <h1 className="text-2xl font-bold text-transparent bg-gradient-energy bg-clip-text">
            Choose Your World
          </h1>

          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold">{player.completedLevels.length}</span>
            </div>
          </div>
        </div>

        {/* World Selection Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {worlds.map((world) => {
              const completedLevels = world.levels.filter(level => 
                player.completedLevels.includes(level.id)
              ).length;
              const totalLevels = world.levels.length;
              const progressPercentage = (completedLevels / totalLevels) * 100;

              return (
                <div
                  key={world.id}
                  className={`relative bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic transition-all duration-300 hover:scale-105 ${
                    world.unlocked ? 'cursor-pointer' : 'opacity-50'
                  }`}
                  onClick={() => handleWorldClick(world.id)}
                >
                  {!world.unlocked && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* World Icon */}
                  <div 
                    className="w-16 h-16 rounded-full mb-4 mx-auto"
                    style={{ backgroundColor: world.color }}
                  ></div>

                  {/* World Info */}
                  <h3 className="text-xl font-bold text-center mb-2">{world.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {world.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{completedLevels}/{totalLevels}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-success rounded-full h-2 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-success font-bold">{completedLevels}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div>
                      <div className="text-warning font-bold">
                        {world.levels.reduce((sum, level) => sum + level.stars, 0)}
                      </div>
                      <div className="text-muted-foreground">Stars</div>
                    </div>
                    <div>
                      <div className="text-primary font-bold">
                        {world.levels.reduce((sum, level) => sum + level.brainStarsCollected, 0)}
                      </div>
                      <div className="text-muted-foreground">Brain Stars</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {world.unlocked && (
                    <Button
                      variant={world.completed ? "success" : "cosmic"}
                      size="sm"
                      className="w-full mt-4"
                    >
                      {world.completed ? (
                        <>
                          <Trophy className="mr-2 w-4 h-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 w-4 h-4" />
                          Enter World
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Complete levels to unlock new worlds and discover the secrets of the Brainiverse
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldsScreen;