import { useEffect, useRef } from "react";
import { useAudio } from "../lib/stores/useAudio";

export function AudioManager() {
  const { setBackgroundMusic, setHitSound, setSuccessSound, isMuted, backgroundMusic } = useAudio();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Create audio context for iOS
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log("AudioContext not supported");
    }

    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    setSuccessSound(success);

    console.log("Audio files loaded");
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  useEffect(() => {
    if (!backgroundMusic) return;

    if (!isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else {
      backgroundMusic.pause();
    }
  }, [isMuted, backgroundMusic]);

  // iOS requires user interaction to enable audio
  useEffect(() => {
    const enableAudio = () => {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };

    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('click', enableAudio);

    return () => {
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('click', enableAudio);
    };
  }, []);


  return null;
}