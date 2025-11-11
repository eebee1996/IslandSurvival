import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useWeather } from "../lib/stores/useWeather";
import { useGame } from "../lib/stores/useGame";

export function Weather() {
  const { currentWeather } = useWeather();
  const { camera } = useThree();
  const rainRef = useRef<THREE.Points>(null);
  const { isPaused } = useGame();

  // Create rain particles
  const rainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    // Create 1000 rain drops
    for (let i = 0; i < 1000; i++) {
      positions.push(
        (Math.random() - 0.5) * 100,
        Math.random() * 50,
        (Math.random() - 0.5) * 100
      );
      velocities.push(Math.random() * 0.1 + 0.1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

    return geometry;
  }, []);

  const rainMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: currentWeather === 'storm' ? 0x4488ff : 0x88ccff,
      size: currentWeather === 'storm' ? 0.3 : 0.2,
      transparent: true,
      opacity: currentWeather === 'storm' ? 0.8 : 0.6
    });
  }, [currentWeather]);

  useFrame((state, delta) => {
    if (!rainRef.current || (currentWeather !== 'rain' && currentWeather !== 'storm') || isPaused) return;

    const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
    const velocities = rainRef.current.geometry.attributes.velocity.array as Float32Array;

    // Make rain follow camera
    const cameraPos = camera.position;
    
    for (let i = 0; i < positions.length; i += 3) {
      // Update Y position (falling)
      const speed = currentWeather === 'storm' ? 30 : 20;
      positions[i + 1] -= velocities[i / 3] * speed * delta;

      // Reset particles that fall too low
      if (positions[i + 1] < cameraPos.y - 10) {
        positions[i] = cameraPos.x + (Math.random() - 0.5) * 100;
        positions[i + 1] = cameraPos.y + 30 + Math.random() * 20;
        positions[i + 2] = cameraPos.z + (Math.random() - 0.5) * 100;
      }

      // Keep rain around camera
      if (Math.abs(positions[i] - cameraPos.x) > 60) {
        positions[i] = cameraPos.x + (Math.random() - 0.5) * 100;
      }
      if (Math.abs(positions[i + 2] - cameraPos.z) > 60) {
        positions[i + 2] = cameraPos.z + (Math.random() - 0.5) * 100;
      }
    }

    rainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  // Only show rain when weather is rain or storm
  if (currentWeather !== 'rain' && currentWeather !== 'storm') {
    return null;
  }

  return (
    <points ref={rainRef} geometry={rainGeometry} material={rainMaterial} />
  );
}
