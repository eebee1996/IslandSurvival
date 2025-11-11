import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useGame } from "./useGame";

interface TimeState {
  timeOfDay: number; // 0-24 hours
  daySpeed: number; // How fast time passes
  isNight: boolean;
  
  // Actions
  updateTime: (deltaTime: number) => void;
  setTimeSpeed: (speed: number) => void;
}

export const useTime = create<TimeState>()(
  subscribeWithSelector((set, get) => ({
    timeOfDay: 8, // Start at 8 AM
    daySpeed: 0.1, // 1 real second = 0.1 game hours (10 real minutes = 1 game hour)
    isNight: false,
    
    updateTime: (deltaTime: number) => {
      set((state) => {
        const newTime = (state.timeOfDay + deltaTime * state.daySpeed) % 24;
        const newIsNight = newTime < 6 || newTime > 18;
        
        return {
          timeOfDay: newTime,
          isNight: newIsNight
        };
      });
    },
    
    setTimeSpeed: (speed: number) => {
      set({ daySpeed: speed });
    }
  }))
);

// Auto-update time
let lastTime = 0;
const updateTimeLoop = () => {
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
  
  if (lastTime > 0) {
    // Check pause state from useGame
    const { isPaused } = useGame.getState();
    
    // Only update time if not paused
    if (!isPaused) {
      useTime.getState().updateTime(deltaTime);
    }
  }
  
  lastTime = currentTime;
  requestAnimationFrame(updateTimeLoop);
};

// Start the time loop
updateTimeLoop();
