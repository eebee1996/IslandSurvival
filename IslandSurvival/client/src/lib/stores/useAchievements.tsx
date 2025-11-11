import { create } from 'zustand';
import { useInventory } from './useInventory';
import { useSurvival } from './useSurvival';

export interface AchievementReward {
  type: 'resources' | 'health' | 'hunger' | 'thirst' | 'item';
  items?: Record<string, number>;
  health?: number;
  hunger?: number;
  thirst?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  reward?: AchievementReward;
}

interface AchievementsState {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: (inventory: Record<string, number>, structures: any[]) => void;
  restoreAchievements: (savedAchievements: Array<{ id: string; unlocked: boolean; unlockedAt?: number }>) => void;
}

const initialAchievements: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Collect your first resource',
    icon: '👣',
    unlocked: false,
    reward: { type: 'resources', items: { wood: 5, stone: 3 } }
  },
  {
    id: 'gatherer',
    name: 'Gatherer',
    description: 'Collect 50 wood',
    icon: '🪵',
    unlocked: false,
    reward: { type: 'resources', items: { wood: 20, berries: 5 }, health: 20 }
  },
  {
    id: 'stone_collector',
    name: 'Stone Collector',
    description: 'Collect 50 stone',
    icon: '⛏️',
    unlocked: false,
    reward: { type: 'resources', items: { stone: 20, wood: 10 }, health: 20 }
  },
  {
    id: 'first_tool',
    name: 'First Tool',
    description: 'Craft your first tool',
    icon: '🔨',
    unlocked: false,
    reward: { type: 'resources', items: { stone: 10, wood: 10 }, health: 15 }
  },
  {
    id: 'builder',
    name: 'Builder',
    description: 'Place your first structure',
    icon: '🏗️',
    unlocked: false,
    reward: { type: 'resources', items: { wood: 15, stone: 15, rope: 3 } }
  },
  {
    id: 'master_builder',
    name: 'Master Builder',
    description: 'Place 5 structures',
    icon: '🏰',
    unlocked: false,
    reward: { type: 'resources', items: { wood: 50, stone: 50, rope: 10 }, health: 30 }
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Craft a bow and arrows',
    icon: '🏹',
    unlocked: false,
    reward: { type: 'resources', items: { arrows: 20, wood: 10 }, health: 25 }
  },
  {
    id: 'survivor',
    name: 'Survivor',
    description: 'Build a shelter',
    icon: '🏕️',
    unlocked: false,
    reward: { type: 'health', health: 40, hunger: 30, thirst: 30 }
  },
  {
    id: 'fisherman',
    name: 'Fisherman',
    description: 'Craft a fishing rod',
    icon: '🎣',
    unlocked: false,
    reward: { type: 'resources', items: { fish: 5, rope: 2 }, health: 15 }
  },
  {
    id: 'well_rested',
    name: 'Well Rested',
    description: 'Craft and use a bed',
    icon: '🛏️',
    unlocked: false,
    reward: { type: 'health', health: 50, hunger: 40, thirst: 40 }
  },
  {
    id: 'advanced_crafter',
    name: 'Advanced Crafter',
    description: 'Craft 20 different items',
    icon: '⚒️',
    unlocked: false,
    reward: { type: 'resources', items: { wood: 30, stone: 30, rope: 10, arrows: 15 }, health: 30 }
  },
  {
    id: 'island_explorer',
    name: 'Island Explorer',
    description: 'Collect 100 total resources',
    icon: '🗺️',
    unlocked: false,
    reward: { type: 'health', health: 50, hunger: 50, thirst: 50, items: { berries: 10 } }
  }
];

export const useAchievements = create<AchievementsState>((set, get) => ({
  achievements: initialAchievements,
  
  unlockAchievement: (id: string) => {
    const currentAchievement = get().achievements.find((a) => a.id === id);
    
    // Don't unlock if already unlocked
    if (currentAchievement?.unlocked) {
      return;
    }
    
    set((state) => ({
      achievements: state.achievements.map((achievement) =>
        achievement.id === id && !achievement.unlocked
          ? { ...achievement, unlocked: true, unlockedAt: Date.now() }
          : achievement
      )
    }));
    
    const achievement = get().achievements.find((a) => a.id === id);
    if (achievement) {
      console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
      
      // Grant rewards
      if (achievement.reward) {
        const { addItem } = useInventory.getState();
        const { increaseHealth, increaseHunger, increaseThirst } = useSurvival.getState();
        
        // Grant item rewards
        if (achievement.reward.items) {
          Object.entries(achievement.reward.items).forEach(([item, quantity]) => {
            addItem(item, quantity);
            console.log(`  Reward: +${quantity} ${item}`);
          });
        }
        
        // Grant stat rewards
        if (achievement.reward.health) {
          increaseHealth(achievement.reward.health);
          console.log(`  Reward: +${achievement.reward.health} health`);
        }
        
        if (achievement.reward.hunger) {
          increaseHunger(achievement.reward.hunger);
          console.log(`  Reward: +${achievement.reward.hunger} hunger`);
        }
        
        if (achievement.reward.thirst) {
          increaseThirst(achievement.reward.thirst);
          console.log(`  Reward: +${achievement.reward.thirst} thirst`);
        }
      }
    }
  },
  
  checkAchievements: (inventory: Record<string, number>, structures: any[]) => {
    const { unlockAchievement, achievements } = get();
    
    // Check resource-based achievements
    const totalResources = Object.values(inventory).reduce((sum, qty) => sum + qty, 0);
    
    if (totalResources > 0 && !achievements.find(a => a.id === 'first_steps')?.unlocked) {
      unlockAchievement('first_steps');
    }
    
    if ((inventory['wood'] || 0) >= 50) {
      unlockAchievement('gatherer');
    }
    
    if ((inventory['stone'] || 0) >= 50) {
      unlockAchievement('stone_collector');
    }
    
    if (totalResources >= 100) {
      unlockAchievement('island_explorer');
    }
    
    // Check crafting achievements
    if (inventory['stone_axe'] || inventory['stone_pickaxe'] || inventory['spear']) {
      unlockAchievement('first_tool');
    }
    
    if (inventory['bow'] && inventory['arrows']) {
      unlockAchievement('hunter');
    }
    
    if (inventory['fishing_rod']) {
      unlockAchievement('fisherman');
    }
    
    // Check structure-based achievements (structures are placed in world, not inventory)
    const hasShelter = structures.some(s => s.type === 'basic_shelter' || s.type === 'tent');
    if (hasShelter) {
      unlockAchievement('survivor');
    }
    
    const hasBed = structures.some(s => s.type === 'bed');
    if (hasBed) {
      unlockAchievement('well_rested');
    }
    
    // Check structure count achievements
    if (structures.length >= 1) {
      unlockAchievement('builder');
    }
    
    if (structures.length >= 5) {
      unlockAchievement('master_builder');
    }
    
    // Check total crafted items (using tracked crafted items)
    const { craftedItems } = useInventory.getState();
    const uniqueCraftedCount = craftedItems.size;
    if (uniqueCraftedCount >= 20) {
      unlockAchievement('advanced_crafter');
    }
  },
  
  restoreAchievements: (savedAchievements: Array<{ id: string; unlocked: boolean; unlockedAt?: number }>) => {
    set((state) => ({
      achievements: state.achievements.map((achievement) => {
        const saved = savedAchievements.find((a) => a.id === achievement.id);
        if (saved && saved.unlocked) {
          return {
            ...achievement,
            unlocked: true,
            unlockedAt: saved.unlockedAt
          };
        }
        return achievement;
      })
    }));
  }
}));
