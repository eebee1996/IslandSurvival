import { create } from 'zustand';

interface UIState {
  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  isMenuOpen: false,
  setMenuOpen: (open: boolean) => set({ isMenuOpen: open }),
}));
