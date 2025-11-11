import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type WeatherType = 'clear' | 'rain' | 'storm';

interface WeatherState {
  currentWeather: WeatherType;
  weatherTimer: number;
  
  // Actions
  setWeather: (weather: WeatherType) => void;
  updateWeatherTimer: (deltaTime: number) => void;
}

export const useWeather = create<WeatherState>()(
  subscribeWithSelector((set, get) => ({
    currentWeather: 'clear',
    weatherTimer: 60, // Change weather every 60 seconds
    
    setWeather: (weather: WeatherType) => {
      set({ currentWeather: weather });
      console.log(`Weather changed to: ${weather}`);
    },
    
    updateWeatherTimer: (deltaTime: number) => {
      set((state) => {
        const newTimer = state.weatherTimer - deltaTime;
        
        if (newTimer <= 0) {
          // Randomly pick new weather
          const weatherTypes: WeatherType[] = ['clear', 'clear', 'rain', 'storm']; // More clear weather
          const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
          
          return {
            weatherTimer: 40 + Math.random() * 40, // 40-80 seconds between weather changes
            currentWeather: newWeather
          };
        }
        
        return { weatherTimer: newTimer };
      });
    }
  }))
);

// Auto-update weather timer
let lastTime = 0;
const updateWeatherLoop = () => {
  const currentTime = Date.now();
  const deltaTime = (currentTime - lastTime) / 1000;
  
  if (lastTime > 0) {
    useWeather.getState().updateWeatherTimer(deltaTime);
  }
  
  lastTime = currentTime;
  requestAnimationFrame(updateWeatherLoop);
};

// Start the weather loop
updateWeatherLoop();
