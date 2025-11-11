import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCombat, getWeaponDamage } from "../lib/stores/useCombat";
import { useInventory } from "../lib/stores/useInventory";
import { useGame } from "../lib/stores/useGame";
import { useMobileInput } from "../lib/stores/useMobileInput";
import { useIsMobile } from "../hooks/use-is-mobile";

export function Combat() {
  const { camera, scene } = useThree();
  const { equippedWeapon, attack } = useCombat();
  const { inventory } = useInventory();
  const { isPaused } = useGame();
  const { attackPressed } = useMobileInput();
  const isMobile = useIsMobile();
  const raycaster = useRef(new THREE.Raycaster());
  const attackIndicator = useRef<THREE.Mesh>(null);
  const lastMobileAttack = useRef(0);

  // Auto-equip best weapon from inventory (prioritize by damage)
  useEffect(() => {
    const { equipWeapon } = useCombat.getState();
    
    if (inventory['bow'] && inventory['arrows']) {
      equipWeapon('bow');
    } else if (inventory['spear']) {
      equipWeapon('spear');
    } else if (inventory['iron_axe']) {
      equipWeapon('iron_axe');
    } else if (inventory['stone_axe']) {
      equipWeapon('stone_axe');
    } else if (inventory['iron_pickaxe']) {
      equipWeapon('iron_pickaxe');
    } else if (inventory['stone_pickaxe']) {
      equipWeapon('stone_pickaxe');
    }
  }, [inventory]);

  // Handle mouse click for attacking
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Only attack on left click, and don't attack when paused
      if (event.button !== 0 || isPaused) return;
      
      const didAttack = attack();
      if (!didAttack) return;

      // Cast ray from camera
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        for (const intersect of intersects) {
          // Find the root group (animal)
          let obj: THREE.Object3D | null = intersect.object;
          while (obj && obj.parent && obj.parent.type !== 'Scene') {
            obj = obj.parent;
          }

          // Check if this object has takeDamage method (it's an animal)
          if (obj && (obj as any).takeDamage) {
            const distance = camera.position.distanceTo(intersect.point);
            
            // Only hit if within range
            if (distance < 5) {
              const damage = getWeaponDamage(equippedWeapon);
              (obj as any).takeDamage(damage);
              console.log(`Hit animal for ${damage} damage with ${equippedWeapon || 'bare hands'}`);
              break;
            }
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [camera, scene, attack, equippedWeapon, isPaused]);

  // Handle mobile attack
  useFrame((state) => {
    if (!attackIndicator.current || isPaused) return;
    
    // Position indicator in front of camera
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    
    attackIndicator.current.position.copy(camera.position).add(forward.multiplyScalar(3));
    attackIndicator.current.quaternion.copy(camera.quaternion);

    // Handle mobile attack input
    if (isMobile && attackPressed && state.clock.elapsedTime - lastMobileAttack.current > 0.3) {
      lastMobileAttack.current = state.clock.elapsedTime;
      
      const didAttack = attack();
      if (!didAttack) return;

      // Cast ray from camera
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.current.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        for (const intersect of intersects) {
          // Find the root group (animal)
          let obj: THREE.Object3D | null = intersect.object;
          while (obj && obj.parent && obj.parent.type !== 'Scene') {
            obj = obj.parent;
          }

          // Check if this object has takeDamage method (it's an animal)
          if (obj && (obj as any).takeDamage) {
            const distance = camera.position.distanceTo(intersect.point);
            
            // Only hit if within range
            if (distance < 5) {
              const damage = getWeaponDamage(equippedWeapon);
              (obj as any).takeDamage(damage);
              console.log(`[Mobile] Hit animal for ${damage} damage with ${equippedWeapon || 'bare hands'}`);
              break;
            }
          }
        }
      }
    }
  });

  return (
    <mesh ref={attackIndicator}>
      <ringGeometry args={[0.08, 0.1, 16]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </mesh>
  );
}
