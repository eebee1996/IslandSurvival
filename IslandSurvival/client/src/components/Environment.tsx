import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTime } from "../lib/stores/useTime";
import { useWeather } from "../lib/stores/useWeather";
import { useGame } from "../lib/stores/useGame";

export function Environment() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const { timeOfDay, isNight } = useTime();
  const { currentWeather } = useWeather();
  const { isPaused } = useGame();

  useFrame(() => {
    if (!directionalLightRef.current || isPaused) return;

    // Calculate sun position based on time of day
    const sunAngle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(sunAngle);
    const sunX = Math.cos(sunAngle) * 50;
    const sunY = Math.max(sunHeight * 50, -10); // Prevent going too far underground
    
    directionalLightRef.current.position.set(sunX, sunY, 0);
    
    // Adjust light intensity based on time and weather
    let baseIntensity = isNight ? 0.1 : Math.max(0.3, sunHeight);
    
    // Reduce intensity during bad weather
    if (currentWeather === 'rain') {
      baseIntensity *= 0.7;
    } else if (currentWeather === 'storm') {
      baseIntensity *= 0.5;
    }
    
    directionalLightRef.current.intensity = baseIntensity;
    
    // Change light color throughout the day
    if (isNight) {
      directionalLightRef.current.color.setHSL(0.6, 0.5, 0.3); // Blue moonlight
    } else if (timeOfDay < 8 || timeOfDay > 18) {
      directionalLightRef.current.color.setHSL(0.1, 0.8, 0.6); // Orange sunrise/sunset
    } else {
      directionalLightRef.current.color.setHSL(0.15, 0.3, 1); // White daylight
    }
  });

  return (
    <>
      {/* Ambient light for basic visibility */}
      <ambientLight intensity={isNight ? 0.05 : 0.2} color="#ffffff" />
      
      {/* Main directional light (sun/moon) */}
      <directionalLight
        ref={directionalLightRef}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        position={[10, 10, 0]}
      />

      {/* Atmospheric fog */}
      <fog attach="fog" args={[isNight ? "#001122" : "#87CEEB", 30, 100]} />
    </>
  );
}
