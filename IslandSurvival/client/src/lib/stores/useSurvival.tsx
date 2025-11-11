import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SurvivalState {
  health: number;
  hunger: number;
  thirst: number;
  isGameOver: boolean;
  
  // Actions
  increaseHealth: (amount: number) => void;
  decreaseHealth: (amount: number) => void;
  increaseHunger: (amount: number) => void;
  decreaseHunger: (amount: number) => void;
  increaseThirst: (amount: number) => void;
  decreaseThirst: (amount: number) => void;
  resetStats: () => void;
}

export const useSurvival = create<SurvivalState>()(
  subscribeWithSelector((set, get) => ({
    health: 100,
    hunger: 100,
    thirst: 100,
    isGameOver: false,
    
    increaseHealth: (amount: number) => {
      set((state) => ({
        health: Math.min(100, state.health + amount)
      }));
    },
    
    decreaseHealth: (amount: number) => {
      set((state) => {
        const newHealth = Math.max(0, state.health - amount);
        return {
          health: newHealth,
          isGameOver: newHealth <= 0
        };
      });
    },
    
    increaseHunger: (amount: number) => {
      set((state) => ({
        hunger: Math.min(100, state.hunger + amount)
      }));
    },
    
    decreaseHunger: (amount: number) => {
      set((state) => {
        const newHunger = Math.max(0, state.hunger - amount);
        
        // If hunger gets too low, start losing health
        if (newHunger <= 10 && state.health > 0) {
          const newHealth = Math.max(0, state.health - 5);
          return {
            hunger: newHunger,
            health: newHealth,
            isGameOver: newHealth <= 0
          };
        }
        
        return { hunger: newHunger };
      });
    },
    
    increaseThirst: (amount: number) => {
      set((state) => ({
        thirst: Math.min(100, state.thirst + amount)
      }));
    },
    
    decreaseThirst: (amount: number) => {
      set((state) => {
        const newThirst = Math.max(0, state.thirst - amount);
        
        // If thirst gets too low, start losing health
        if (newThirst <= 10 && state.health > 0) {
          const newHealth = Math.max(0, state.health - 5);
          return {
            thirst: newThirst,
            health: newHealth,
            isGameOver: newHealth <= 0
          };
        }
        
        return { thirst: newThirst };
      });
    },
    
    resetStats: () => {
      set({
        health: 100,
        hunger: 100,
        thirst: 100,
        isGameOver: false
      });
    }
  }))
);
