// Terrain height calculation - matches Island.tsx terrain generation exactly
// Uses smooth radial falloff for perfect alignment with mesh
export function getTerrainHeight(x: number, z: number): number {
  const distance = Math.sqrt(x * x + z * z);
  
  // Create island shape - higher in center, lower towards edges
  if (distance < 100) {
    return Math.max(0, 2 - distance * 0.05);
  } else {
    return Math.max(-1, -distance * 0.05);
  }
}

export interface CraftingRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: Array<{ name: string; quantity: number }>;
  result: { name: string; quantity: number };
}

export const craftingRecipes: CraftingRecipe[] = [
  {
    id: 'stone_axe',
    name: 'Stone Axe',
    description: 'A basic tool for cutting wood more efficiently',
    ingredients: [
      { name: 'wood', quantity: 2 },
      { name: 'stone', quantity: 3 }
    ],
    result: { name: 'stone_axe', quantity: 1 }
  },
  {
    id: 'stone_pickaxe',
    name: 'Stone Pickaxe', 
    description: 'A tool for mining stone and other materials',
    ingredients: [
      { name: 'wood', quantity: 2 },
      { name: 'stone', quantity: 3 }
    ],
    result: { name: 'stone_pickaxe', quantity: 1 }
  },
  {
    id: 'basic_shelter',
    name: 'Basic Shelter',
    description: 'A simple shelter to protect from the elements',
    ingredients: [
      { name: 'wood', quantity: 10 },
      { name: 'leaves', quantity: 8 }
    ],
    result: { name: 'basic_shelter', quantity: 1 }
  },
  {
    id: 'campfire',
    name: 'Campfire',
    description: 'For cooking food and staying warm at night',
    ingredients: [
      { name: 'wood', quantity: 5 },
      { name: 'stone', quantity: 3 }
    ],
    result: { name: 'campfire', quantity: 1 }
  },
  {
    id: 'cooked_berries',
    name: 'Cooked Berries',
    description: 'More nutritious than raw berries',
    ingredients: [
      { name: 'berries', quantity: 3 },
      { name: 'campfire', quantity: 1 }
    ],
    result: { name: 'cooked_berries', quantity: 2 }
  },
  {
    id: 'spear',
    name: 'Spear',
    description: 'A simple weapon for protection',
    ingredients: [
      { name: 'wood', quantity: 3 },
      { name: 'stone', quantity: 1 }
    ],
    result: { name: 'spear', quantity: 1 }
  },
  {
    id: 'storage_chest',
    name: 'Storage Chest',
    description: 'Store extra items safely',
    ingredients: [
      { name: 'wood', quantity: 15 },
      { name: 'stone', quantity: 5 }
    ],
    result: { name: 'storage_chest', quantity: 1 }
  },
  {
    id: 'iron_axe',
    name: 'Iron Axe',
    description: 'A more efficient tool for gathering wood',
    ingredients: [
      { name: 'wood', quantity: 6 },
      { name: 'stone', quantity: 12 }
    ],
    result: { name: 'iron_axe', quantity: 1 }
  },
  {
    id: 'iron_pickaxe',
    name: 'Iron Pickaxe',
    description: 'A stronger tool for mining',
    ingredients: [
      { name: 'wood', quantity: 6 },
      { name: 'stone', quantity: 12 }
    ],
    result: { name: 'iron_pickaxe', quantity: 1 }
  },
  {
    id: 'bow',
    name: 'Bow',
    description: 'A ranged weapon for hunting',
    ingredients: [
      { name: 'wood', quantity: 5 },
      { name: 'leaves', quantity: 10 }
    ],
    result: { name: 'bow', quantity: 1 }
  },
  {
    id: 'arrows',
    name: 'Arrows',
    description: 'Ammunition for the bow',
    ingredients: [
      { name: 'wood', quantity: 2 },
      { name: 'stone', quantity: 1 }
    ],
    result: { name: 'arrows', quantity: 5 }
  },
  {
    id: 'water_collector',
    name: 'Water Collector',
    description: 'Collect rainwater to restore thirst',
    ingredients: [
      { name: 'wood', quantity: 8 },
      { name: 'leaves', quantity: 5 }
    ],
    result: { name: 'water_collector', quantity: 1 }
  },
  {
    id: 'fishing_rod',
    name: 'Fishing Rod',
    description: 'Catch fish from the ocean for food',
    ingredients: [
      { name: 'wood', quantity: 3 },
      { name: 'leaves', quantity: 2 }
    ],
    result: { name: 'fishing_rod', quantity: 1 }
  },
  {
    id: 'cooked_fish',
    name: 'Cooked Fish',
    description: 'A hearty meal that restores hunger',
    ingredients: [
      { name: 'fish', quantity: 1 },
      { name: 'campfire', quantity: 1 }
    ],
    result: { name: 'cooked_fish', quantity: 1 }
  },
  {
    id: 'torch',
    name: 'Torch',
    description: 'Provides light during the night',
    ingredients: [
      { name: 'wood', quantity: 2 },
      { name: 'leaves', quantity: 3 }
    ],
    result: { name: 'torch', quantity: 3 }
  },
  {
    id: 'rope',
    name: 'Rope',
    description: 'Useful crafting material',
    ingredients: [
      { name: 'leaves', quantity: 10 }
    ],
    result: { name: 'rope', quantity: 2 }
  },
  {
    id: 'tent',
    name: 'Tent',
    description: 'A portable shelter for protection',
    ingredients: [
      { name: 'wood', quantity: 6 },
      { name: 'leaves', quantity: 12 },
      { name: 'rope', quantity: 2 }
    ],
    result: { name: 'tent', quantity: 1 }
  },
  {
    id: 'workbench',
    name: 'Workbench',
    description: 'Advanced crafting station',
    ingredients: [
      { name: 'wood', quantity: 20 },
      { name: 'stone', quantity: 10 }
    ],
    result: { name: 'workbench', quantity: 1 }
  },
  {
    id: 'bed',
    name: 'Bed',
    description: 'Rest and restore health',
    ingredients: [
      { name: 'wood', quantity: 8 },
      { name: 'leaves', quantity: 15 }
    ],
    result: { name: 'bed', quantity: 1 }
  },
  {
    id: 'stone_wall',
    name: 'Stone Wall',
    description: 'Defensive structure',
    ingredients: [
      { name: 'stone', quantity: 15 },
      { name: 'wood', quantity: 5 }
    ],
    result: { name: 'stone_wall', quantity: 1 }
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    description: 'A tall structure to survey your island',
    ingredients: [
      { name: 'wood', quantity: 30 },
      { name: 'stone', quantity: 20 },
      { name: 'rope', quantity: 3 }
    ],
    result: { name: 'watchtower', quantity: 1 }
  }
];

// Resource spawn data
export const resourceTypes = {
  tree: {
    drops: [
      { name: 'wood', quantity: 3, chance: 1.0 },
      { name: 'leaves', quantity: 2, chance: 0.8 }
    ]
  },
  rock: {
    drops: [
      { name: 'stone', quantity: 2, chance: 1.0 }
    ]
  },
  berry: {
    drops: [
      { name: 'berries', quantity: 1, chance: 1.0 }
    ]
  }
};

// Utility functions
export function getRandomPosition(radius: number): [number, number, number] {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * radius;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  return [x, 0, z];
}

export function calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1]; 
  const dz = pos1[2] - pos2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
