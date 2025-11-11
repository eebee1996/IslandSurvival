import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState, useRef } from "react";
import { KeyboardControls, PointerLockControls as PointerLockControlsImpl } from "@react-three/drei";
import "@fontsource/inter";

import { Island } from "./components/Island";
import { Player } from "./components/Player";
import { Resources } from "./components/Resources";
import { Wildlife } from "./components/Wildlife";
import { Combat } from "./components/Combat";
import { Weather } from "./components/Weather";
import { GameUI } from "./components/GameUI";
import { Environment } from "./components/Environment";
import { AudioManager } from "./components/AudioManager";
import { Structures } from "./components/Structures";
import { MobileControls } from "./components/MobileControls";
import { Torch } from "./components/Torch";
import { useAudio } from "./lib/stores/useAudio";
import { useUI } from "./lib/stores/useUI";
import { usePlayer } from "./lib/stores/usePlayer";
import { useMobileInput } from "./lib/stores/useMobileInput";
import { useIsMobile } from "./hooks/use-is-mobile";
import { useState as useReactState } from "react";

// Define control keys for the game
enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  interact = 'interact',
  inventory = 'inventory',
  craft = 'craft',
  pause = 'pause',
  torch = 'torch'
}

const controls = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.leftward, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.rightward, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.jump, keys: ["Space"] },
  { name: Controls.interact, keys: ["KeyE"] },
  { name: Controls.inventory, keys: ["KeyI"] },
  { name: Controls.craft, keys: ["KeyC"] },
  { name: Controls.pause, keys: ["Escape"] },
  { name: Controls.torch, keys: ["KeyT"] }
];

// Main App component
function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const isMuted = useAudio(state => state.isMuted);
  const toggleMute = useAudio(state => state.toggleMute);
  const isMenuOpen = useUI(state => state.isMenuOpen);
  const controlsRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const updateRotation = usePlayer(state => state.updateRotation);
  const setMovement = useMobileInput(state => state.setMovement);
  const setJumpPressed = useMobileInput(state => state.setJumpPressed);
  const setAttackPressed = useMobileInput(state => state.setAttackPressed);
  const setInteractPressed = useMobileInput(state => state.setInteractPressed);

  // Mobile control handlers
  const handleMobileMove = (forward: number, right: number) => {
    setMovement(forward, right);
  };

  const handleMobileRotate = (deltaX: number, deltaY: number) => {
    const currentRot = usePlayer.getState().rotation;
    updateRotation(
      Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentRot.x + deltaY)),
      currentRot.y + deltaX
    );
  };

  const handleMobileJump = () => {
    setJumpPressed(true);
    setTimeout(() => setJumpPressed(false), 100);
  };

  const handleMobileAttack = () => {
    setAttackPressed(true);
    setTimeout(() => setAttackPressed(false), 100);
  };

  const handleMobileInteract = () => {
    setInteractPressed(true);
    setTimeout(() => setInteractPressed(false), 200);
  };

  // Show the canvas once everything is loaded
  useEffect(() => {
    setShowCanvas(true);
  }, []);

  // Suppress harmless pointer lock errors that occur when ESC is pressed quickly
  useEffect(() => {
    const originalConsoleError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      // Filter out pointer lock related errors
      if (message.includes('PointerLockControls') || 
          message.includes('Pointer Lock API')) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('exited the lock') ||
          event.reason?.message?.includes('pointer lock')) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      console.error = originalConsoleError;
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Automatically exit pointer lock when menus open, re-enter when they close
  useEffect(() => {
    if (isMenuOpen && isLocked && controlsRef.current) {
      // Exit pointer lock when menu opens
      controlsRef.current.unlock();
    }
  }, [isMenuOpen, isLocked]);

  const handleCanvasClick = () => {
    // Request pointer lock when clicking, but only if no menu is open and not on mobile
    if (!isMobile && !isLocked && !isMenuOpen && controlsRef.current) {
      controlsRef.current.lock();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          {/* Audio Manager */}
          <AudioManager />

          {/* Instructions overlay */}
          {!isLocked && !isMobile && (
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                zIndex: 1000,
                cursor: 'pointer'
              }}
              onClick={handleCanvasClick}
            >
              <h2 style={{ fontSize: '24px', margin: '0 0 15px 0' }}>Island Survival</h2>
              <p style={{ fontSize: '14px', margin: '5px 0' }}>Click anywhere to start playing</p>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>WASD to move, Mouse to look around</p>
              <p style={{ fontSize: '13px', margin: '5px 0' }}>E to interact, I for inventory, C to craft</p>
              <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Press ESC to pause</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: isMuted ? '#666' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
              </button>
            </div>
          )}

          <Canvas
            shadows
            camera={{
              position: [0, 5, 10],
              fov: 75,
              near: 0.1,
              far: 1000
            }}
            gl={{
              antialias: true,
              powerPreference: "high-performance"
            }}
            onClick={handleCanvasClick}
          >
            <color attach="background" args={["#87CEEB"]} />

            {/* Lighting and Environment */}
            <Environment />
            <Weather />

            <Suspense fallback={null}>
              {/* Game World */}
              <Island />
              <Resources />
              <Wildlife />
              <Structures />
              
              {/* Player Controller */}
              <Player />
              <Combat />
              <Torch />
              
              {/* Pointer lock controls for first-person camera (desktop only) */}
              {!isMobile && (
                <PointerLockControlsImpl 
                  ref={controlsRef}
                  onLock={() => setIsLocked(true)}
                  onUnlock={() => setIsLocked(false)}
                />
              )}
            </Suspense>
          </Canvas>

          {/* Game UI Overlay */}
          <GameUI />
          
          {/* Mobile Controls Overlay */}
          {isMobile && (
            <MobileControls
              onMove={handleMobileMove}
              onRotate={handleMobileRotate}
              onJump={handleMobileJump}
              onAttack={handleMobileAttack}
              onInteract={handleMobileInteract}
            />
          )}
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
