import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useStructures } from "../lib/stores/useStructures";
import { useSurvival } from "../lib/stores/useSurvival";
import { useAudio } from "../lib/stores/useAudio";
import { useMobileInput } from "../lib/stores/useMobileInput";
import { useIsMobile } from "../hooks/use-is-mobile";

interface StructureObjectProps {
  type: string;
  position: [number, number, number];
  id: string;
}

enum Controls {
  interact = 'interact'
}

function StructureObject({ type, position, id }: StructureObjectProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { increaseThirst } = useSurvival();
  const { playSuccess } = useAudio();
  const [, getKeys] = useKeyboardControls<Controls>();
  const { interactPressed } = useMobileInput();
  const isMobile = useIsMobile();
  const [lastInteractTime, setLastInteractTime] = useState(0);
  const [waterLevel, setWaterLevel] = useState(100); // Start with full water

  // Handle interaction with water collector
  useFrame(() => {
    if (type !== 'water_collector') return;
    
    const playerPos = camera.position;
    const structurePos = new THREE.Vector3(...position);
    const distance = playerPos.distanceTo(structurePos);
    
    // Check if player is near and wants to interact
    const controls = getKeys();
    const wantsToInteract = isMobile ? interactPressed : controls.interact;
    
    if (distance < 3 && wantsToInteract && waterLevel > 0) {
      const now = Date.now();
      if (now - lastInteractTime > 1000) { // 1 second cooldown
        increaseThirst(30); // Restore 30 thirst
        setWaterLevel(prev => Math.max(0, prev - 30)); // Use 30 water
        playSuccess();
        setLastInteractTime(now);
        console.log(`Used water collector - Water remaining: ${waterLevel - 30}`);
      }
    }
  });

  const getStructureModel = () => {
    switch (type) {
      case 'basic_shelter':
        return (
          <group ref={meshRef} position={position}>
            {/* Base */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[4, 3, 4]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <coneGeometry args={[3, 2, 4]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
        
      case 'tent':
        return (
          <group ref={meshRef} position={position}>
            <mesh position={[0, 1, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[2, 2, 4]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
        
      case 'campfire':
        return (
          <group ref={meshRef} position={position}>
            {/* Stones in circle */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i / 6) * Math.PI * 2) * 0.8,
                  0.2,
                  Math.sin((i / 6) * Math.PI * 2) * 0.8
                ]}
                castShadow
              >
                <boxGeometry args={[0.3, 0.4, 0.3]} />
                <meshStandardMaterial color="#696969" />
              </mesh>
            ))}
            {/* Fire */}
            <pointLight position={[0, 1, 0]} color="#FF6600" intensity={2} distance={10} />
            <mesh position={[0, 0.5, 0]}>
              <coneGeometry args={[0.5, 1, 8]} />
              <meshStandardMaterial color="#FF6600" emissive="#FF6600" emissiveIntensity={1} />
            </mesh>
          </group>
        );
        
      case 'storage_chest':
        return (
          <group ref={meshRef} position={position}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1.5, 1, 1]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
        
      case 'workbench':
        return (
          <group ref={meshRef} position={position}>
            {/* Table top */}
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[2, 0.2, 1.5]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Legs */}
            {[[-0.8, -0.6], [-0.8, 0.6], [0.8, -0.6], [0.8, 0.6]].map((pos, i) => (
              <mesh key={i} position={[pos[0], 0.5, pos[1]]} castShadow>
                <boxGeometry args={[0.1, 1, 0.1]} />
                <meshStandardMaterial color="#654321" />
              </mesh>
            ))}
          </group>
        );
        
      case 'watchtower':
        return (
          <group ref={meshRef} position={position}>
            {/* Tower base */}
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[2, 6, 2]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Platform */}
            <mesh position={[0, 6.5, 0]} castShadow>
              <boxGeometry args={[3, 0.3, 3]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 8, 0]} castShadow>
              <coneGeometry args={[2, 2, 4]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
        
      case 'stone_wall':
        return (
          <group ref={meshRef} position={position}>
            <mesh position={[0, 1, 0]} castShadow>
              <boxGeometry args={[4, 2, 0.5]} />
              <meshStandardMaterial color="#808080" />
            </mesh>
          </group>
        );
        
      case 'bed':
        return (
          <group ref={meshRef} position={position}>
            {/* Frame */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <boxGeometry args={[2, 0.3, 1.5]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Mattress */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[1.8, 0.3, 1.3]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        );
        
      case 'water_collector':
        const waterHeight = (waterLevel / 100) * 1.5; // Visual water level
        return (
          <group ref={meshRef} position={position}>
            {/* Container */}
            <mesh position={[0, 1, 0]} castShadow>
              <cylinderGeometry args={[0.8, 1, 2, 8]} />
              <meshStandardMaterial color="#4682B4" transparent opacity={0.4} />
            </mesh>
            {/* Water inside */}
            {waterLevel > 0 && (
              <mesh position={[0, 0.2 + waterHeight / 2, 0]}>
                <cylinderGeometry args={[0.75, 0.95, waterHeight, 8]} />
                <meshStandardMaterial color="#1E90FF" transparent opacity={0.8} />
              </mesh>
            )}
            {/* Interaction indicator when near */}
            <mesh position={[0, 2.5, 0]}>
              <ringGeometry args={[0.3, 0.4, 16]} />
              <meshBasicMaterial color="#00FF00" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );

      default:
        // Default cube for unknown structures
        return (
          <group ref={meshRef} position={position}>
            <mesh castShadow>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#FF00FF" />
            </mesh>
          </group>
        );
    }
  };

  return <>{getStructureModel()}</>;
}

export function Structures() {
  const { structures } = useStructures();

  return (
    <group>
      {structures.map((structure) => (
        <StructureObject
          key={structure.id}
          id={structure.id}
          type={structure.type}
          position={structure.position}
        />
      ))}
    </group>
  );
}
