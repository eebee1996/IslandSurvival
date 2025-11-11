import { create } from 'zustand';

interface MobileInputState {
  forward: number;
  right: number;
  jumpPressed: boolean;
  attackPressed: boolean;
  interactPressed: boolean;
  setMovement: (forward: number, right: number) => void;
  setJumpPressed: (pressed: boolean) => void;
  setAttackPressed: (pressed: boolean) => void;
  setInteractPressed: (pressed: boolean) => void;
}

export const useMobileInput = create<MobileInputState>((set) => ({
  forward: 0,
  right: 0,
  jumpPressed: false,
  attackPressed: false,
  interactPressed: false,
  
  setMovement: (forward: number, right: number) => {
    set({ forward, right });
  },
  
  setJumpPressed: (pressed: boolean) => {
    set({ jumpPressed: pressed });
  },
  
  setAttackPressed: (pressed: boolean) => {
    set({ attackPressed: pressed });
  },
  
  setInteractPressed: (pressed: boolean) => {
    set({ interactPressed: pressed });
  },
}));
