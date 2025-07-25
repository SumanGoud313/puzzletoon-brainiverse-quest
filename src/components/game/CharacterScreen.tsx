import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, Environment } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Palette, Crown, Zap } from 'lucide-react';
import * as THREE from 'three';

// 3D Character Preview
const CharacterPreview = ({ emotion, skinColor }: { emotion: string; skinColor: string }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
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
    <group ref={meshRef}>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Character Body */}
        <mesh position={[0, -1, 0]}>
          <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
          <meshStandardMaterial 
            color={getEmotionColor(emotion)}
            emissive={getEmotionColor(emotion)}
            emissiveIntensity={0.3}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Character Head */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial 
            color={skinColor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 0.6, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.15, 0.6, 0.5]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Emotion Aura */}
        <Sparkles 
          count={20} 
          scale={[4, 4, 4]} 
          size={2} 
          speed={1}
          color={getEmotionColor(emotion)}
        />
      </Float>
    </group>
  );
};

const CharacterScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    player, 
    updatePlayer,
    spendBrainStars 
  } = useGameStore();

  const handleBackClick = () => {
    setCurrentScreen('home');
  };

  const handleSkinColorChange = (color: string) => {
    updatePlayer({
      customization: {
        ...player.customization,
        skinColor: color
      }
    });
  };

  const handleEmotionChange = (emotion: 'joy' | 'curiosity' | 'sadness' | 'anger') => {
    updatePlayer({
      customization: {
        ...player.customization,
        emotion: emotion
      },
      currentEmotion: emotion
    });
  };

  const handleAccessoryChange = (accessory: string) => {
    const cost = 100; // Brain stars cost
    if (player.brainStars >= cost) {
      spendBrainStars(cost);
      updatePlayer({
        customization: {
          ...player.customization,
          accessory: accessory
        }
      });
    }
  };

  const skinColors = [
    '#ffdbaa', '#f4c2a1', '#e8b896', '#d4a574',
    '#c9935c', '#b8804a', '#a66d3a', '#8b5a2b'
  ];

  const accessories = [
    { id: 'none', name: 'None', cost: 0, icon: '🚫' },
    { id: 'crown', name: 'Golden Crown', cost: 100, icon: '👑' },
    { id: 'hat', name: 'Magic Hat', cost: 150, icon: '🎩' },
    { id: 'glasses', name: 'Smart Glasses', cost: 75, icon: '👓' },
    { id: 'headband', name: 'Energy Headband', cost: 125, icon: '🎯' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-joy game-ui">
      {/* 3D Character Preview */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <pointLight position={[2, 2, 2]} intensity={1} color="#ffffff" />
          <pointLight position={[-2, -2, -2]} intensity={0.5} color="#8b5cf6" />
          
          <CharacterPreview 
            emotion={player.customization.emotion}
            skinColor={player.customization.skinColor}
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

          <h1 className="text-2xl font-bold text-transparent bg-gradient-energy bg-clip-text">
            Character Customization
          </h1>

          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-cosmic">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-sm font-bold">{player.brainStars}</span>
            </div>
          </div>
        </div>

        {/* Customization Panels */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Player Info */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-warning" />
                Player Profile
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer({ name: e.target.value })}
                    className="w-full p-3 mt-1 bg-input rounded-lg text-foreground font-bold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Level</label>
                    <div className="text-2xl font-bold text-success">{player.level}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Experience</label>
                    <div className="text-2xl font-bold text-primary">{player.experience}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skin Color Selection */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-joy" />
                Skin Color
              </h2>
              
              <div className="grid grid-cols-4 gap-3">
                {skinColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSkinColorChange(color)}
                    className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 ${
                      player.customization.skinColor === color 
                        ? 'border-primary shadow-neon' 
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Emotion Selection */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4">Default Emotion</h2>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={player.customization.emotion === 'joy' ? 'joy' : 'outline'}
                  onClick={() => handleEmotionChange('joy')}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl">😊</div>
                    <div className="text-sm">Joy</div>
                  </div>
                </Button>
                
                <Button
                  variant={player.customization.emotion === 'curiosity' ? 'curiosity' : 'outline'}
                  onClick={() => handleEmotionChange('curiosity')}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl">🤔</div>
                    <div className="text-sm">Curiosity</div>
                  </div>
                </Button>
                
                <Button
                  variant={player.customization.emotion === 'sadness' ? 'sadness' : 'outline'}
                  onClick={() => handleEmotionChange('sadness')}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl">😢</div>
                    <div className="text-sm">Sadness</div>
                  </div>
                </Button>
                
                <Button
                  variant={player.customization.emotion === 'anger' ? 'anger' : 'outline'}
                  onClick={() => handleEmotionChange('anger')}
                  className="h-16"
                >
                  <div className="text-center">
                    <div className="text-2xl">😠</div>
                    <div className="text-sm">Anger</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Accessories Shop */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4">Accessories Shop</h2>
              
              <div className="space-y-3">
                {accessories.map((accessory) => (
                  <div
                    key={accessory.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      player.customization.accessory === accessory.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{accessory.icon}</span>
                      <div>
                        <div className="font-medium">{accessory.name}</div>
                        {accessory.cost > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {accessory.cost} Brain Stars
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant={player.customization.accessory === accessory.id ? 'success' : 'outline'}
                      size="sm"
                      onClick={() => handleAccessoryChange(accessory.id)}
                      disabled={accessory.cost > player.brainStars && player.customization.accessory !== accessory.id}
                    >
                      {player.customization.accessory === accessory.id ? 'Equipped' : 'Equip'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Customize your character to express your unique puzzle-solving style!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharacterScreen;