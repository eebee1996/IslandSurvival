import { useRef, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useInventory } from "../lib/stores/useInventory";
import { useAudio } from "../lib/stores/useAudio";
import { useGame } from "../lib/stores/useGame";

interface AnimalProps {
  position: [number, number, number];
  type: 'deer' | 'boar';
  id: string;
  onKilled: (id: string, position: [number, number, number], type: string) => void;
}

function Animal({ position, type, id, onKilled }: AnimalProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const [health, setHealth] = useState(type === 'deer' ? 50 : 80);
  const [isDead, setIsDead] = useState(false);
  const { playHit } = useAudio();
  const { isPaused } = useGame();
  
  // AI state
  const targetPosition = useRef(new THREE.Vector3(...position));
  const currentDirection = useRef(new THREE.Vector3(0, 0, 0));
  const wanderTimer = useRef(0);
  const fleeTimer = useRef(0);
  const isAlarmed = useRef(false);

  const getAnimalData = () => {
    switch (type) {
      case 'deer':
        return {
          bodyColor: '#8B7355',
          size: [1, 1.5, 2] as [number, number, number],
          speed: 3,
          detectionRange: 8,
          fleeSpeed: 6,
          maxHealth: 50
        };
      case 'boar':
        return {
          bodyColor: '#4A4A4A',
          size: [1.2, 1, 1.5] as [number, number, number],
          speed: 2,
          detectionRange: 5,
          fleeSpeed: 4,
          maxHealth: 80
        };
      default:
        return {
          bodyColor: '#FFFFFF',
          size: [1, 1, 1] as [number, number, number],
          speed: 2,
          detectionRange: 5,
          fleeSpeed: 4,
          maxHealth: 50
        };
    }
  };

  const animalData = getAnimalData();

  // Expose takeDamage function to be called from combat system
  (meshRef as any).takeDamage = (damage: number) => {
    const newHealth = Math.max(0, health - damage);
    setHealth(newHealth);
    playHit();
    
    if (newHealth <= 0 && !isDead) {
      setIsDead(true);
      onKilled(id, [meshRef.current!.position.x, meshRef.current!.position.y, meshRef.current!.position.z], type);
    }
  };

  useFrame((state, delta) => {
    if (!meshRef.current || isDead || isPaused) return;

    const currentPos = meshRef.current.position;
    
    // Check if player is nearby
    const distanceToPlayer = camera.position.distanceTo(currentPos);
    
    // Animal flees if player gets too close
    if (distanceToPlayer < animalData.detectionRange && !isAlarmed.current) {
      isAlarmed.current = true;
      fleeTimer.current = 3; // Flee for 3 seconds
      
      // Set flee direction away from player
      const fleeDirection = new THREE.Vector3()
        .subVectors(currentPos, camera.position)
        .normalize();
      
      targetPosition.current.copy(currentPos).add(fleeDirection.multiplyScalar(15));
      
      // Keep within island bounds
      targetPosition.current.x = Math.max(-40, Math.min(40, targetPosition.current.x));
      targetPosition.current.z = Math.max(-40, Math.min(40, targetPosition.current.z));
    }

    // Handle fleeing
    if (fleeTimer.current > 0) {
      fleeTimer.current -= delta;
      
      const direction = new THREE.Vector3()
        .subVectors(targetPosition.current, currentPos)
        .normalize();
      
      currentDirection.current.lerp(direction, 0.1);
      currentPos.add(currentDirection.current.clone().multiplyScalar(animalData.fleeSpeed * delta));
      
      // Look in movement direction
      if (currentDirection.current.length() > 0.01) {
        meshRef.current.lookAt(currentPos.clone().add(currentDirection.current));
      }
      
      if (fleeTimer.current <= 0) {
        isAlarmed.current = false;
      }
    } 
    // Normal wandering behavior
    else {
      wanderTimer.current -= delta;
      
      if (wanderTimer.current <= 0) {
        // Pick new random target
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 10;
        targetPosition.current.set(
          currentPos.x + Math.cos(angle) * distance,
          0,
          currentPos.z + Math.sin(angle) * distance
        );
        
        // Keep within island bounds
        targetPosition.current.x = Math.max(-40, Math.min(40, targetPosition.current.x));
        targetPosition.current.z = Math.max(-40, Math.min(40, targetPosition.current.z));
        
        wanderTimer.current = 2 + Math.random() * 3; // Wander for 2-5 seconds
      }
      
      const direction = new THREE.Vector3()
        .subVectors(targetPosition.current, currentPos)
        .normalize();
      
      currentDirection.current.lerp(direction, 0.05);
      currentPos.add(currentDirection.current.clone().multiplyScalar(animalData.speed * delta));
      
      // Look in movement direction
      if (currentDirection.current.length() > 0.01) {
        meshRef.current.lookAt(currentPos.clone().add(currentDirection.current));
      }
    }

    // Keep on ground
    currentPos.y = 1;
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Health bar above animal */}
      <group position={[0, 2.5, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.2]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        <mesh position={[-(1.5 / 2) * (1 - health / animalData.maxHealth) / 2, 0, 0.01]}>
          <planeGeometry args={[1.5 * (health / animalData.maxHealth), 0.15]} />
          <meshBasicMaterial color={health > animalData.maxHealth * 0.5 ? "#4CAF50" : "#F44336"} />
        </mesh>
      </group>

      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={animalData.size} />
        <meshStandardMaterial color={animalData.bodyColor} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.5, animalData.size[2] / 2 + 0.3]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={animalData.bodyColor} />
      </mesh>
      
      {/* Legs */}
      {[[-0.3, -0.75, 0.5], [0.3, -0.75, 0.5], [-0.3, -0.75, -0.5], [0.3, -0.75, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color={animalData.bodyColor} />
        </mesh>
      ))}
      
      {/* Ears for deer */}
      {type === 'deer' && (
        <>
          <mesh position={[-0.2, 0.8, 1.3]} castShadow>
            <coneGeometry args={[0.15, 0.4, 4]} />
            <meshStandardMaterial color={animalData.bodyColor} />
          </mesh>
          <mesh position={[0.2, 0.8, 1.3]} castShadow>
            <coneGeometry args={[0.15, 0.4, 4]} />
            <meshStandardMaterial color={animalData.bodyColor} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function Wildlife() {
  const { addItem } = useInventory();
  const { playSuccess } = useAudio();

  // Pre-calculate random positions for animals
  const animalPositions = useMemo(() => {
    const positions = [];
    
    // Deer
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 15 + Math.random() * 20;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      positions.push({
        position: [x, 1, z] as [number, number, number],
        type: 'deer' as const,
        id: `deer-${i}`
      });
    }
    
    // Boars
    for (let i = 0; i < 3; i++) {
      const x = (Math.random() - 0.5) * 60;
      const z = (Math.random() - 0.5) * 60;
      positions.push({
        position: [x, 1, z] as [number, number, number],
        type: 'boar' as const,
        id: `boar-${i}`
      });
    }
    
    return positions;
  }, []);

  const [killedAnimals, setKilledAnimals] = useState<Set<string>>(new Set());

  const handleAnimalKilled = (id: string, position: [number, number, number], type: string) => {
    setKilledAnimals(prev => new Set([...Array.from(prev), id]));
    
    // Drop resources
    if (type === 'deer') {
      addItem('meat', 3);
      addItem('leather', 1);
    } else if (type === 'boar') {
      addItem('meat', 5);
      addItem('leather', 2);
    }
    
    playSuccess();
    console.log(`Killed ${type}, dropped resources at`, position);
  };

  return (
    <group>
      {animalPositions.map((animal) => {
        if (killedAnimals.has(animal.id)) return null;
        
        return (
          <Animal
            key={animal.id}
            position={animal.position}
            type={animal.type}
            id={animal.id}
            onKilled={handleAnimalKilled}
          />
        );
      })}
    </group>
  );
}
