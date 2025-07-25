import React from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeft, Volume2, VolumeX, Music, MicOff, Smartphone, Monitor, Trash2, RotateCcw } from 'lucide-react';

const SettingsScreen: React.FC = () => {
  const { 
    setCurrentScreen, 
    settings, 
    updateSettings,
    resetProgress 
  } = useGameStore();

  const handleBackClick = () => {
    setCurrentScreen('home');
  };

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const toggleMusic = () => {
    updateSettings({ musicEnabled: !settings.musicEnabled });
  };

  const toggleHaptic = () => {
    updateSettings({ hapticEnabled: !settings.hapticEnabled });
  };

  const changeGraphicsQuality = (quality: 'low' | 'medium' | 'high' | 'ultra') => {
    updateSettings({ graphicsQuality: quality });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
    }
  };

  const graphicsOptions = [
    { value: 'low', label: 'Low', description: 'Better performance' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Better visuals' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-cosmic game-ui">
      <div className="h-full flex flex-col">
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
            Settings
          </h1>

          <div className="w-24"></div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Audio Settings */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Audio Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sound Effects</div>
                    <div className="text-sm text-muted-foreground">
                      Puzzle interactions and UI sounds
                    </div>
                  </div>
                  <Button
                    variant={settings.soundEnabled ? 'success' : 'outline'}
                    size="icon"
                    onClick={toggleSound}
                  >
                    {settings.soundEnabled ? <Volume2 /> : <VolumeX />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Background Music</div>
                    <div className="text-sm text-muted-foreground">
                      Ambient music and level themes
                    </div>
                  </div>
                  <Button
                    variant={settings.musicEnabled ? 'success' : 'outline'}
                    size="icon"
                    onClick={toggleMusic}
                  >
                    {settings.musicEnabled ? <Music /> : <MicOff />}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Haptic Feedback</div>
                    <div className="text-sm text-muted-foreground">
                      Vibration on interactions (mobile)
                    </div>
                  </div>
                  <Button
                    variant={settings.hapticEnabled ? 'success' : 'outline'}
                    size="icon"
                    onClick={toggleHaptic}
                  >
                    <Smartphone />
                  </Button>
                </div>
              </div>
            </div>

            {/* Graphics Settings */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-curiosity" />
                Graphics Settings
              </h2>
              
              <div>
                <div className="font-medium mb-3">Quality Level</div>
                <div className="grid grid-cols-2 gap-2">
                  {graphicsOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.graphicsQuality === option.value ? 'cosmic' : 'outline'}
                      onClick={() => changeGraphicsQuality(option.value as any)}
                      className="h-auto p-3"
                    >
                      <div className="text-center">
                        <div className="font-bold">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    Current: <span className="font-medium text-foreground">
                      {graphicsOptions.find(o => o.value === settings.graphicsQuality)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Information */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4">Game Information</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build</span>
                  <span className="font-medium">2024.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium">Web</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">~2.5 MB</span>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Data Management
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="font-medium text-destructive mb-2">Reset All Progress</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    This will permanently delete all your game progress, including levels completed, 
                    brain stars collected, and character customizations. This action cannot be undone.
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetProgress}
                  >
                    <RotateCcw className="mr-2 w-4 h-4" />
                    Reset Progress
                  </Button>
                </div>
              </div>
            </div>

            {/* Privacy & Legal */}
            <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-cosmic">
              <h2 className="text-xl font-bold mb-4">Privacy & Legal</h2>
              
              <div className="space-y-3">
                <Button variant="link" className="h-auto p-0 justify-start">
                  Privacy Policy
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  Terms of Service
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  Licenses & Credits
                </Button>
                <Button variant="link" className="h-auto p-0 justify-start">
                  Report a Bug
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center p-6">
          <p className="text-sm text-muted-foreground">
            PuzzleToon: The Brainiverse v1.0.0
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Made with ❤️ for puzzle lovers everywhere
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;