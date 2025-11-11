import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useInventory } from "../lib/stores/useInventory";
import { useResources } from "../lib/stores/useResources";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";
import { useMobileInput } from "../lib/stores/useMobileInput";
import { useIsMobile } from "../hooks/use-is-mobile";
import { getTerrainHeight } from "../lib/gameUtils";

enum Controls {
  interact = 'interact'
}

interface ResourceProps {
  position: [number, number, number];
  type: 'tree' | 'rock' | 'berry';
  id: string;
}

function ResourceObject({ position, type, id }: ResourceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { addItem } = useInventory();
  const { removeResource } = useResources();
  const { camera } = useThree();
  const [, getControls] = useKeyboardControls<Controls>();
  const { playSuccess } = useAudio();
  const { isPaused } = useGame();
  const { interactPressed } = useMobileInput();
  const isMobile = useIsMobile();
  
  const woodTexture = useTexture("/textures/wood.jpg");
  
  const lastInteractTime = useRef(0);

  const getResourceData = () => {
    switch (type) {
      case 'tree':
        return { 
          color: '#8B4513', 
          size: [2, 6, 2] as [number, number, number],
          items: [{ name: 'wood', quantity: 3 }, { name: 'leaves', quantity: 2 }]
        };
      case 'rock':
        return { 
          color: '#696969', 
          size: [2, 2, 2] as [number, number, number],
          items: [{ name: 'stone', quantity: 2 }]
        };
      case 'berry':
        return { 
          color: '#FF6347', 
          size: [1, 1, 1] as [number, number, number],
          items: [{ name: 'berries', quantity: 1 }]
        };
      default:
        return { color: '#ffffff', size: [1, 1, 1] as [number, number, number], items: [] };
    }
  };

  const resourceData = getResourceData();

  useFrame((state) => {
    if (!meshRef.current || isPaused) return;

    const controls = getControls();
    const currentTime = state.clock.elapsedTime;
    
    // Check interaction (keyboard or mobile)
    const shouldInteract = isMobile ? interactPressed : controls.interact;
    
    if (shouldInteract && currentTime - lastInteractTime.current > 0.5) {
      const distance = camera.position.distanceTo(meshRef.current.position);
      
      if (distance < 5) { // Interaction range
        // Add items to inventory
        resourceData.items.forEach(item => {
          addItem(item.name, item.quantity);
        });
        
        // Remove resource from world
        removeResource(id);
        
        // Play success sound
        playSuccess();
        
        lastInteractTime.current = currentTime;
        console.log(`[${isMobile ? 'Mobile' : 'Desktop'}] Collected ${type} - added:`, resourceData.items);
      }
    }

    // Add slight bobbing animation for berries
    if (type === 'berry') {
      meshRef.current.position.y = position[1] + Math.sin(currentTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={resourceData.size} />
      <meshStandardMaterial 
        color={resourceData.color} 
        map={type === 'tree' ? woodTexture : undefined}
      />
      
      {/* Add a simple crown for trees */}
      {type === 'tree' && (
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[3, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      )}
    </mesh>
  );
}

export function Resources() {
  const { isCollected } = useResources();
  
  // Pre-calculate random positions for resources
  const resourcePositions = useMemo(() => {
    const positions = [];
    
    // Trees - TRIPLED! Spread across larger area
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 15 + Math.random() * 70;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const terrainHeight = getTerrainHeight(x, z);
      // Trees are 6 units tall, centered at y position, so base is at y-3
      const y = terrainHeight + 3; // Position center of tree above ground
      positions.push({
        position: [x, y, z] as [number, number, number],
        type: 'tree' as const,
        id: `tree-${i}`
      });
    }
    
    // Rocks - TRIPLED! Spread across larger area
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      const terrainHeight = getTerrainHeight(x, z);
      // Rocks are 2 units tall, centered at y position, so base is at y-1
      const y = terrainHeight + 1; // Position center of rock above ground
      positions.push({
        position: [x, y, z] as [number, number, number],
        type: 'rock' as const,
        id: `rock-${i}`
      });
    }
    
    // Berry bushes - TRIPLED! Spread across larger area
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      const terrainHeight = getTerrainHeight(x, z);
      // Berries are 1 unit tall, centered at y position, so base is at y-0.5
      const y = terrainHeight + 0.5; // Position center of berry above ground
      positions.push({
        position: [x, y, z] as [number, number, number],
        type: 'berry' as const,
        id: `berry-${i}`
      });
    }
    
    return positions;
  }, []);

  return (
    <group>
      {resourcePositions.map((resource) => {
        // Don't render if already collected
        if (isCollected(resource.id)) return null;
        
        return (
          <ResourceObject
            key={resource.id}
            position={resource.position}
            type={resource.type}
            id={resource.id}
          />
        );
      })}
    </group>
  );
}
