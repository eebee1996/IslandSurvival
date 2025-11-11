import { create } from 'zustand';

interface PlayerState {
  position: [number, number, number];
  direction: [number, number, number];
  rotation: { x: number; y: number };
  setPosition: (position: [number, number, number]) => void;
  setDirection: (direction: [number, number, number]) => void;
  updateRotation: (x: number, y: number) => void;
}

export const usePlayer = create<PlayerState>((set) => ({
  position: [0, 2, 10],
  direction: [0, 0, -1],
  rotation: { x: 0, y: 0 },
  
  setPosition: (position: [number, number, number]) => {
    set({ position });
  },
  
  setDirection: (direction: [number, number, number]) => {
    set({ direction });
  },
  
  updateRotation: (x: number, y: number) => {
    set({ rotation: { x, y } });
  }
}));
