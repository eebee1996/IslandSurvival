import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CombatState {
  equippedWeapon: string | null;
  torchEquipped: boolean;
  lastAttackTime: number;
  
  // Actions
  equipWeapon: (weapon: string) => void;
  unequipWeapon: () => void;
  toggleTorch: () => void;
  canAttack: () => boolean;
  attack: () => boolean;
}

export const useCombat = create<CombatState>()(
  subscribeWithSelector((set, get) => ({
    equippedWeapon: null,
    torchEquipped: false,
    lastAttackTime: 0,
    
    equipWeapon: (weapon: string) => {
      set({ equippedWeapon: weapon });
      console.log(`Equipped weapon: ${weapon}`);
    },
    
    unequipWeapon: () => {
      set({ equippedWeapon: null });
    },
    
    toggleTorch: () => {
      set((state) => ({ torchEquipped: !state.torchEquipped }));
    },
    
    canAttack: () => {
      const { lastAttackTime } = get();
      const now = Date.now();
      return now - lastAttackTime > 500; // 500ms cooldown
    },
    
    attack: () => {
      const { canAttack } = get();
      if (canAttack()) {
        set({ lastAttackTime: Date.now() });
        return true;
      }
      return false;
    }
  }))
);

// Weapon damage values
export const weaponDamage: Record<string, number> = {
  bow: 40,
  spear: 30,
  iron_axe: 25,
  iron_pickaxe: 20,
  stone_axe: 20,
  stone_pickaxe: 15,
  bare_hands: 5
};

export function getWeaponDamage(weapon: string | null): number {
  if (!weapon) return weaponDamage.bare_hands;
  return weaponDamage[weapon] || weaponDamage.bare_hands;
}
