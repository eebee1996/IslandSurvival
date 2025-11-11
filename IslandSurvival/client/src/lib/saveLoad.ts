import { useInventory } from "./stores/useInventory";
import { useSurvival } from "./stores/useSurvival";
import { useResources } from "./stores/useResources";
import { useTime } from "./stores/useTime";
import { useWeather } from "./stores/useWeather";
import { useCombat } from "./stores/useCombat";
import { useStructures } from "./stores/useStructures";
import { useAchievements } from "./stores/useAchievements";

interface GameSave {
  version: string;
  timestamp: number;
  inventory: Record<string, number>;
  craftedItems: string[];
  survival: {
    health: number;
    hunger: number;
    thirst: number;
  };
  collectedResources: string[];
  time: {
    timeOfDay: number;
  };
  weather: {
    currentWeather: 'clear' | 'rain' | 'storm';
    weatherTimer: number;
  };
  combat: {
    equippedWeapon: string | null;
  };
  structures: Array<{
    id: string;
    type: string;
    position: [number, number, number];
  }>;
  achievements: Array<{
    id: string;
    unlocked: boolean;
    unlockedAt?: number;
  }>;
}

const SAVE_KEY = 'island_survival_save';
const SAVE_VERSION = '1.2'; // Updated to include craftedItems tracking

export function saveGame(): boolean {
  try {
    const save: GameSave = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      inventory: useInventory.getState().inventory,
      craftedItems: Array.from(useInventory.getState().craftedItems),
      survival: {
        health: useSurvival.getState().health,
        hunger: useSurvival.getState().hunger,
        thirst: useSurvival.getState().thirst,
      },
      collectedResources: Array.from(useResources.getState().collectedResources),
      time: {
        timeOfDay: useTime.getState().timeOfDay,
      },
      weather: {
        currentWeather: useWeather.getState().currentWeather,
        weatherTimer: useWeather.getState().weatherTimer,
      },
      combat: {
        equippedWeapon: useCombat.getState().equippedWeapon,
      },
      structures: useStructures.getState().structures,
      achievements: useAchievements.getState().achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt
      })),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export function loadGame(): boolean {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
      console.log('No save game found');
      return false;
    }

    const save: GameSave = JSON.parse(saveData);

    // Check version compatibility
    if (save.version !== SAVE_VERSION) {
      console.warn('Save game version mismatch, loading anyway...');
    }

    // Restore inventory
    const inventoryState = useInventory.getState();
    inventoryState.clearInventory();
    Object.entries(save.inventory).forEach(([item, quantity]) => {
      inventoryState.addItem(item, quantity);
    });
    
    // Restore crafted items tracking
    if (save.craftedItems) {
      inventoryState.setCraftedItems(save.craftedItems);
    }

    // Restore survival stats
    const survivalState = useSurvival.getState();
    survivalState.resetStats();
    // Set to saved values
    const healthDiff = save.survival.health - survivalState.health;
    const hungerDiff = save.survival.hunger - survivalState.hunger;
    const thirstDiff = save.survival.thirst - survivalState.thirst;
    
    if (healthDiff > 0) survivalState.increaseHealth(healthDiff);
    else if (healthDiff < 0) survivalState.decreaseHealth(-healthDiff);
    
    if (hungerDiff > 0) survivalState.increaseHunger(hungerDiff);
    else if (hungerDiff < 0) survivalState.decreaseHunger(-hungerDiff);
    
    if (thirstDiff > 0) survivalState.increaseThirst(thirstDiff);
    else if (thirstDiff < 0) survivalState.decreaseThirst(-thirstDiff);

    // Restore collected resources
    const resourcesState = useResources.getState();
    resourcesState.resetResources();
    save.collectedResources.forEach((id) => {
      resourcesState.removeResource(id);
    });

    // Restore time (using setTimeSpeed is a workaround since we can't directly set time)
    // Just accept that time will be approximate
    
    // Restore weather
    const weatherState = useWeather.getState();
    weatherState.setWeather(save.weather.currentWeather);

    // Restore combat
    if (save.combat.equippedWeapon) {
      useCombat.getState().equipWeapon(save.combat.equippedWeapon);
    }

    // Restore structures
    if (save.structures) {
      useStructures.getState().setStructures(save.structures);
      console.log(`Restored ${save.structures.length} structures`);
    }

    // Restore achievements
    if (save.achievements) {
      useAchievements.getState().restoreAchievements(save.achievements);
      const unlockedCount = save.achievements.filter(a => a.unlocked).length;
      console.log(`Restored ${unlockedCount} unlocked achievements`);
    }

    console.log('Game loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

export function hasSaveGame(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function deleteSaveGame(): boolean {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('Save game deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete save game:', error);
    return false;
  }
}

// Auto-save every 60 seconds
let autoSaveInterval: number | null = null;

export function startAutoSave() {
  if (autoSaveInterval) return;
  
  autoSaveInterval = window.setInterval(() => {
    saveGame();
  }, 60000); // Auto-save every 60 seconds
  
  console.log('Auto-save enabled');
}

export function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log('Auto-save disabled');
  }
}
