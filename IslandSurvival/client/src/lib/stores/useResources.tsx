import { create } from "zustand";

interface ResourcesState {
  collectedResources: Set<string>;
  
  // Actions
  removeResource: (id: string) => void;
  isCollected: (id: string) => boolean;
  resetResources: () => void;
}

export const useResources = create<ResourcesState>((set, get) => ({
  collectedResources: new Set(),
  
  removeResource: (id: string) => {
    set((state) => ({
      collectedResources: new Set([...Array.from(state.collectedResources), id])
    }));
  },
  
  isCollected: (id: string) => {
    const { collectedResources } = get();
    return collectedResources.has(id);
  },
  
  resetResources: () => {
    set({ collectedResources: new Set() });
  }
}));
