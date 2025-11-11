import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface InventoryState {
  inventory: Record<string, number>;
  craftedItems: Set<string>;
  
  // Actions
  addItem: (item: string, quantity: number) => void;
  removeItem: (item: string, quantity: number) => void;
  hasItem: (item: string, quantity?: number) => boolean;
  clearInventory: () => void;
  trackCraftedItem: (item: string) => void;
  setCraftedItems: (items: string[]) => void;
}

export const useInventory = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    inventory: {},
    craftedItems: new Set<string>(),
    
    addItem: (item: string, quantity: number) => {
      set((state) => ({
        inventory: {
          ...state.inventory,
          [item]: (state.inventory[item] || 0) + quantity
        }
      }));
    },
    
    removeItem: (item: string, quantity: number) => {
      set((state) => {
        const currentQuantity = state.inventory[item] || 0;
        const newQuantity = Math.max(0, currentQuantity - quantity);
        
        if (newQuantity === 0) {
          const { [item]: removed, ...rest } = state.inventory;
          return { inventory: rest };
        }
        
        return {
          inventory: {
            ...state.inventory,
            [item]: newQuantity
          }
        };
      });
    },
    
    hasItem: (item: string, quantity: number = 1) => {
      const { inventory } = get();
      return (inventory[item] || 0) >= quantity;
    },
    
    clearInventory: () => {
      set({ inventory: {}, craftedItems: new Set<string>() });
    },
    
    trackCraftedItem: (item: string) => {
      set((state) => ({
        craftedItems: new Set(state.craftedItems).add(item)
      }));
    },
    
    setCraftedItems: (items: string[]) => {
      set({ craftedItems: new Set(items) });
    }
  }))
);
