import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useCombat } from '../lib/stores/useCombat';
import { useInventory } from '../lib/stores/useInventory';
import { useTime } from '../lib/stores/useTime';

export function Torch() {
  const { camera } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const torchEquipped = useCombat(state => state.torchEquipped);
  const toggleTorch = useCombat(state => state.toggleTorch);
  const inventory = useInventory(state => state.inventory);
  const isNight = useTime(state => state.isNight);

  // Auto-turn off torch if player runs out of torches
  useFrame(() => {
    if (torchEquipped && (!inventory.torch || inventory.torch === 0)) {
      toggleTorch();
    }

    // Update light position to follow camera
    if (lightRef.current && torchEquipped) {
      lightRef.current.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );
    }
  });

  // Only render the light if torch is equipped and player has torches
  if (!torchEquipped || !inventory.torch || inventory.torch === 0) {
    return null;
  }

  return (
    <>
      <pointLight
        ref={lightRef}
        position={[camera.position.x, camera.position.y, camera.position.z]}
        intensity={isNight ? 5 : 3}
        distance={20}
        decay={1}
        color="#FFA500"
      />
      {/* Helper to visualize the light source */}
      <mesh position={[camera.position.x + 0.5, camera.position.y - 0.3, camera.position.z - 1]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#FFA500" />
      </mesh>
    </>
  );
}
