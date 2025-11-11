import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-is-mobile';

interface MobileControlsProps {
  onMove: (forward: number, right: number) => void;
  onRotate: (deltaX: number, deltaY: number) => void;
  onJump: () => void;
  onAttack: () => void;
  onInteract: () => void;
}

export function MobileControls({ onMove, onRotate, onJump, onAttack, onInteract }: MobileControlsProps) {
  const isMobile = useIsMobile();
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<HTMLDivElement>(null);
  const lastTouchPos = useRef({ x: 0, y: 0 });
  const isRotating = useRef(false);
  const rotationStartPos = useRef({ x: 0, y: 0 });

  if (!isMobile) return null;

  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    updateJoystick(e.touches[0]);
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickActive) {
      updateJoystick(e.touches[0]);
    }
  };

  const handleJoystickEnd = () => {
    setJoystickActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    const maxDistance = 50;
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    setJoystickPosition({ x, y });
    
    const normalizedX = x / maxDistance;
    const normalizedY = -y / maxDistance;
    
    onMove(normalizedY, normalizedX);
  };

  const handleRotateStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    rotationStartPos.current = { x: touch.clientX, y: touch.clientY };
    lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
    isRotating.current = false;
  };

  const handleRotateMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    // Check if this is an intentional drag (moved more than 10px from start)
    const distanceFromStart = Math.sqrt(
      Math.pow(touch.clientX - rotationStartPos.current.x, 2) +
      Math.pow(touch.clientY - rotationStartPos.current.y, 2)
    );
    
    // Only start rotating if user has moved at least 10px (prevents accidental taps)
    if (!isRotating.current && distanceFromStart < 10) {
      return;
    }
    
    isRotating.current = true;
    
    const deltaX = (touch.clientX - lastTouchPos.current.x) * 0.006;
    const deltaY = (touch.clientY - lastTouchPos.current.y) * 0.006;
    
    lastTouchPos.current = { x: touch.clientX, y: touch.clientY };
    onRotate(deltaX, deltaY);
  };
  
  const handleRotateEnd = () => {
    isRotating.current = false;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 999
    }}>
      {/* Left side: Movement Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
          transition: joystickActive ? 'none' : 'transform 0.2s'
        }} />
      </div>

      {/* Right side: Look area - covers most of screen for easier use */}
      <div
        ref={rotateRef}
        onTouchStart={handleRotateStart}
        onTouchMove={handleRotateMove}
        onTouchEnd={handleRotateEnd}
        style={{
          position: 'absolute',
          top: '0',
          right: '0',
          bottom: '0',
          width: '60%',
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 15px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          borderRadius: '5px',
          fontSize: '12px',
          pointerEvents: 'none'
        }}>
          👆 Drag to Look
        </div>
      </div>

      {/* Action Buttons on the right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto'
      }}>
        {/* Jump Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(76, 175, 80, 0.8)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          ⬆️
        </button>

        {/* Attack Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onAttack();
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(244, 67, 54, 0.8)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          ⚔️
        </button>

        {/* Interact Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onInteract();
          }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(33, 150, 243, 0.8)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            touchAction: 'manipulation'
          }}
        >
          👋
        </button>
      </div>
    </div>
  );
}
