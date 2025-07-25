import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';

interface AudioSystemProps {
  children: React.ReactNode;
}

const AudioSystem: React.FC<AudioSystemProps> = ({ children }) => {
  const { settings, currentScreen, player } = useGameStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<OscillatorNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Web Audio API
  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsInitialized(true);
      }
    };

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Create procedural background music
  const createBackgroundMusic = (screen: string, emotion: string) => {
    if (!audioContextRef.current || !settings.musicEnabled) return;

    const audioContext = audioContextRef.current;
    
    // Stop previous music
    if (backgroundMusicRef.current) {
      try {
        backgroundMusicRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
    }

    // Create oscillators for layered music
    const baseFreq = getBaseFrequency(screen, emotion);
    const duration = 8; // 8 second loop

    // Main melody oscillator
    const mainOsc = audioContext.createOscillator();
    const mainGain = audioContext.createGain();
    
    // Harmony oscillator
    const harmonyOsc = audioContext.createOscillator();
    const harmonyGain = audioContext.createGain();
    
    // Bass oscillator
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();

    // Configure main melody
    mainOsc.type = 'sine';
    mainOsc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    mainGain.gain.setValueAtTime(0.1, audioContext.currentTime);

    // Configure harmony
    harmonyOsc.type = 'triangle';
    harmonyOsc.frequency.setValueAtTime(baseFreq * 1.25, audioContext.currentTime); // Perfect fifth
    harmonyGain.gain.setValueAtTime(0.06, audioContext.currentTime);

    // Configure bass
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(baseFreq * 0.5, audioContext.currentTime); // Octave down
    bassGain.gain.setValueAtTime(0.08, audioContext.currentTime);

    // Add some reverb/delay effect
    const delay = audioContext.createDelay();
    delay.delayTime.setValueAtTime(0.3, audioContext.currentTime);
    const delayGain = audioContext.createGain();
    delayGain.gain.setValueAtTime(0.2, audioContext.currentTime);

    // Connect nodes
    mainOsc.connect(mainGain);
    harmonyOsc.connect(harmonyGain);
    bassOsc.connect(bassGain);
    
    mainGain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(audioContext.destination);
    
    mainGain.connect(audioContext.destination);
    harmonyGain.connect(audioContext.destination);
    bassGain.connect(audioContext.destination);

    // Create melody patterns based on emotion
    createMelodyPattern(mainOsc, baseFreq, emotion, audioContext.currentTime, duration);
    
    // Start oscillators
    mainOsc.start(audioContext.currentTime);
    harmonyOsc.start(audioContext.currentTime);
    bassOsc.start(audioContext.currentTime);

    // Store reference for cleanup
    backgroundMusicRef.current = mainOsc;

    // Loop the music
    setTimeout(() => {
      if (settings.musicEnabled) {
        createBackgroundMusic(screen, emotion);
      }
    }, duration * 1000);
  };

  const getBaseFrequency = (screen: string, emotion: string) => {
    const screenFreqs = {
      home: 261.63,    // C4
      worlds: 293.66,  // D4
      level: 329.63,   // E4
      character: 349.23, // F4
      shop: 392.00,    // G4
      settings: 440.00  // A4
    };

    const emotionMultipliers = {
      joy: 1.0,
      curiosity: 1.125,  // Major second
      sadness: 0.9,      // Minor
      anger: 1.2         // Augmented
    };

    const baseFreq = screenFreqs[screen as keyof typeof screenFreqs] || 261.63;
    const multiplier = emotionMultipliers[emotion as keyof typeof emotionMultipliers] || 1.0;
    
    return baseFreq * multiplier;
  };

  const createMelodyPattern = (
    oscillator: OscillatorNode, 
    baseFreq: number, 
    emotion: string, 
    startTime: number, 
    duration: number
  ) => {
    const patterns = {
      joy: [1, 1.125, 1.25, 1.5, 1.25, 1.125, 1, 0.875], // Uplifting major scale
      curiosity: [1, 1.2, 1.1, 1.3, 1.15, 1.25, 1.05, 1.2], // Wandering pattern
      sadness: [1, 0.9, 0.8, 0.75, 0.8, 0.9, 0.85, 0.95], // Descending minor
      anger: [1, 1.3, 1.1, 1.4, 1.2, 1.35, 1.15, 1.25] // Aggressive intervals
    };

    const pattern = patterns[emotion as keyof typeof patterns] || patterns.joy;
    const noteLength = duration / pattern.length;

    pattern.forEach((multiplier, index) => {
      const noteTime = startTime + (index * noteLength);
      const frequency = baseFreq * multiplier;
      oscillator.frequency.setValueAtTime(frequency, noteTime);
    });
  };

  // Play sound effect
  const playSoundEffect = (type: 'click' | 'success' | 'collect' | 'error' | 'complete') => {
    if (!audioContextRef.current || !settings.soundEnabled) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    const effects = {
      click: { freq: 800, duration: 0.1, volume: 0.1 },
      success: { freq: 1200, duration: 0.3, volume: 0.15 },
      collect: { freq: 1600, duration: 0.2, volume: 0.12 },
      error: { freq: 200, duration: 0.5, volume: 0.1 },
      complete: { freq: 1000, duration: 1.0, volume: 0.2 }
    };

    const effect = effects[type];
    
    oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(effect.freq, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(effect.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + effect.duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + effect.duration);
  };

  // Update music when screen or emotion changes
  useEffect(() => {
    if (isInitialized && settings.musicEnabled) {
      createBackgroundMusic(currentScreen, player.currentEmotion);
    }
  }, [currentScreen, player.currentEmotion, settings.musicEnabled, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (backgroundMusicRef.current) {
        try {
          backgroundMusicRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Provide audio functions to children via context
  return (
    <>
      {children}
      {/* Hidden audio trigger for sound effects */}
      <div style={{ display: 'none' }} id="audio-trigger" onClick={() => playSoundEffect('click')} />
    </>
  );
};

// Hook to use audio system
export const useAudio = () => {
  const playSoundEffect = (type: 'click' | 'success' | 'collect' | 'error' | 'complete') => {
    // Trigger sound effect
    const event = new CustomEvent('playSound', { detail: type });
    window.dispatchEvent(event);
  };

  return { playSoundEffect };
};

// Add global event listener for sound effects
if (typeof window !== 'undefined') {
  window.addEventListener('playSound', ((event: CustomEvent) => {
    const audioTrigger = document.getElementById('audio-trigger');
    if (audioTrigger) {
      audioTrigger.click();
    }
  }) as EventListener);
}

export default AudioSystem;