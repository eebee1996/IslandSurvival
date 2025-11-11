import { create } from 'zustand';

export interface Structure {
  id: string;
  type: string;
  position: [number, number, number];
}

interface StructuresState {
  structures: Structure[];
  addStructure: (type: string, position: [number, number, number]) => void;
  removeStructure: (id: string) => void;
  setStructures: (structures: Structure[]) => void;
  clearStructures: () => void;
}

export const useStructures = create<StructuresState>((set) => ({
  structures: [],
  
  addStructure: (type: string, position: [number, number, number]) => {
    const id = `${type}-${Date.now()}-${Math.random()}`;
    set((state) => ({
      structures: [...state.structures, { id, type, position }]
    }));
    console.log(`Placed ${type} at`, position);
  },
  
  removeStructure: (id: string) => {
    set((state) => ({
      structures: state.structures.filter((s) => s.id !== id)
    }));
  },
  
  setStructures: (structures: Structure[]) => {
    set({ structures });
  },
  
  clearStructures: () => {
    set({ structures: [] });
  }
}));
