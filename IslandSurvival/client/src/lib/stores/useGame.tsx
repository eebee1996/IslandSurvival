import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "ready" | "playing" | "ended";

interface GameState {
  phase: GamePhase;
  isPaused: boolean;
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  pause: () => void;
  resume: () => void;
  togglePause: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: "ready",
    isPaused: false,
    
    start: () => {
      set((state) => {
        // Only transition from ready to playing
        if (state.phase === "ready") {
          return { phase: "playing" };
        }
        return {};
      });
    },
    
    restart: () => {
      set(() => ({ phase: "ready", isPaused: false }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },
    
    pause: () => {
      set(() => ({ isPaused: true }));
    },
    
    resume: () => {
      set(() => ({ isPaused: false }));
    },
    
    togglePause: () => {
      set((state) => ({ isPaused: !state.isPaused }));
    }
  }))
);
