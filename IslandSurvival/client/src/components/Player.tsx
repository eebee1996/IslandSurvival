import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { useSurvival } from "../lib/stores/useSurvival";
import { usePlayer } from "../lib/stores/usePlayer";
import { useGame } from "../lib/stores/useGame";
import { useMobileInput } from "../lib/stores/useMobileInput";
import { usePointerLock } from '../hooks/usePointerLock';
import { useIsMobile } from '../hooks/use-is-mobile';


enum Controls {
  forward = 'forward',
  backward = 'backward',
  leftward = 'leftward',
  rightward = 'rightward',
  jump = 'jump',
  interact = 'interact'
}

export function Player() {
  const { camera } = useThree();
  const { isLocked } = usePointerLock();
  const isMobile = useIsMobile();
  const playerRef = useRef<THREE.Mesh>(null);
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  const { position, rotation, setPosition, setDirection, updateRotation } = usePlayer();
  const { decreaseHunger, decreaseThirst, isGameOver } = useSurvival();
  const { isPaused } = useGame();
  const mobileInput = useMobileInput();

  const lastHungerUpdate = useRef(0);

  const MOVE_SPEED = 8;
  const JUMP_FORCE = 5;
  const GRAVITY = -20;
  const GROUND_HEIGHT = 2; // Player eye height above ground

  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    // Set rotation order for natural first-person camera feel
    camera.rotation.order = 'YXZ';
    // Ensure rotation values exist before setting
    if (rotation && typeof rotation.x === 'number' && typeof rotation.y === 'number') {
      camera.rotation.set(rotation.x, rotation.y, 0);
    }
  }, [camera, position, rotation]);


  useFrame((state, delta) => {
    if (isPaused || isGameOver) return;

    // For desktop, require pointer lock. For mobile, always allow movement
    if (!isMobile && !isLocked) return;

    let forwardInput = 0;
    let rightInput = 0;
    let jumpInput = false;

    if (isMobile) {
      forwardInput = mobileInput.forward;
      rightInput = mobileInput.right;
      jumpInput = mobileInput.jumpPressed;
    } else {
      const [subscribeKeys, getKeys] = useKeyboardControls();
      const { forward, backward, leftward, rightward, jump } = getKeys();
      forwardInput = Number(forward) - Number(backward);
      rightInput = Number(rightward) - Number(leftward);
      jumpInput = jump;
    }

    const moveSpeed = 5;
    const sprintMultiplier = jumpInput ? 1.5 : 1;

    direction.current.set(
      rightInput,
      0,
      -forwardInput
    ).normalize();


    // Get camera direction for movement
    camera.getWorldDirection(direction.current);
    direction.current.y = 0; // Remove vertical component
    direction.current.normalize();

    // Calculate movement direction
    const rightVector = new THREE.Vector3().crossVectors(direction.current, new THREE.Vector3(0, 1, 0));

    if (forwardInput > 0) {
      velocity.current.add(direction.current.clone().multiplyScalar(MOVE_SPEED * delta * sprintMultiplier));
    }
    if (forwardInput < 0) {
      velocity.current.add(direction.current.clone().multiplyScalar(-MOVE_SPEED * delta * sprintMultiplier));
    }
    if (rightInput < 0) {
      velocity.current.add(rightVector.clone().multiplyScalar(-MOVE_SPEED * delta * sprintMultiplier));
    }
    if (rightInput > 0) {
      velocity.current.add(rightVector.clone().multiplyScalar(MOVE_SPEED * delta * sprintMultiplier));
    }

    // Jumping
    if (jumpInput && Math.abs(camera.position.y - GROUND_HEIGHT) < 0.1) {
      velocity.current.y = JUMP_FORCE;
    }

    // Apply gravity
    velocity.current.y += GRAVITY * delta;

    // Apply friction on horizontal movement
    velocity.current.x *= 0.9;
    velocity.current.z *= 0.9;

    // Move camera
    camera.position.add(velocity.current.clone().multiplyScalar(delta));

    // Ground collision
    if (camera.position.y <= GROUND_HEIGHT) {
      camera.position.y = GROUND_HEIGHT;
      velocity.current.y = 0;
    }

    // Keep player on island (simple boundary) - EXPANDED!
    const maxDistance = 100;
    if (camera.position.x > maxDistance) camera.position.x = maxDistance;
    if (camera.position.x < -maxDistance) camera.position.x = -maxDistance;
    if (camera.position.z > maxDistance) camera.position.z = maxDistance;
    if (camera.position.z < -maxDistance) camera.position.z = -maxDistance;

    // Update player store for UI components
    setPosition([camera.position.x, camera.position.y, camera.position.z]);
    setDirection([direction.current.x, direction.current.y, direction.current.z]);

    // Decrease hunger and thirst over time
    const currentTime = state.clock.elapsedTime;
    if (currentTime - lastHungerUpdate.current > 5) { // Every 5 seconds
      decreaseHunger(1);
      decreaseThirst(1);
      lastHungerUpdate.current = currentTime;
    }
  });

  return null;
}