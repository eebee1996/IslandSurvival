import { useState, useEffect, useCallback } from "react";

export function usePointerLock() {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement !== null);
    };

    const handlePointerLockError = () => {
      console.error("Pointer lock failed");
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
    };
  }, []);

  const requestLock = useCallback(() => {
    if (document.body.requestPointerLock) {
      document.body.requestPointerLock();
    }
  }, []);

  const exitLock = useCallback(() => {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }, []);

  return { isLocked, requestLock, exitLock };
}
