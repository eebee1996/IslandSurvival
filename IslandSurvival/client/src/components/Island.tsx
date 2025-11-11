import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { getTerrainHeight } from "../lib/gameUtils";

export function Island() {
  const grassTexture = useTexture("/textures/grass.png");
  const sandTexture = useTexture("/textures/sand.jpg");

  // Configure texture repeating
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(5, 5);

  // Generate island terrain with some height variation - EXPANDED!
  const terrainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(250, 250, 50, 50);
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Add some height variation using deterministic noise
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 1];
      // Use the same getTerrainHeight function for consistency
      positions[i + 2] = getTerrainHeight(x, z);
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group>
      {/* Main island terrain */}
      <mesh 
        geometry={terrainGeometry}
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      {/* Beach area - EXPANDED! */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[280, 280]} />
        <meshStandardMaterial map={sandTexture} />
      </mesh>

      {/* Ocean - EXPANDED! */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]}
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#006994" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
