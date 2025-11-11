import React from "react";
import { useInventory } from "../lib/stores/useInventory";
import { useSurvival } from "../lib/stores/useSurvival";
import { useAudio } from "../lib/stores/useAudio";
import { useStructures } from "../lib/stores/useStructures";
import { usePlayer } from "../lib/stores/usePlayer";
import { useIsMobile } from "../hooks/use-is-mobile";
import { craftingRecipes, getTerrainHeight, type CraftingRecipe } from "../lib/gameUtils";

interface CraftingMenuProps {
  onClose: () => void;
}

export function CraftingMenu({ onClose }: CraftingMenuProps) {
  const { inventory, removeItem, addItem, trackCraftedItem } = useInventory();
  const { increaseHunger, increaseThirst } = useSurvival();
  const { playSuccess } = useAudio();
  const { addStructure, structures } = useStructures();
  const { position, direction } = usePlayer();
  const isMobile = useIsMobile();

  const isNearStructure = (structureType: string, maxDistance: number = 10): boolean => {
    return structures.some(structure => {
      if (structure.type !== structureType) return false;
      
      const dx = position[0] - structure.position[0];
      const dz = position[2] - structure.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      return distance <= maxDistance;
    });
  };

  const canCraft = (recipe: CraftingRecipe): boolean => {
    return recipe.ingredients.every(ingredient => {
      // Special case: campfire can be nearby structure instead of in inventory
      if (ingredient.name === 'campfire') {
        const hasInInventory = (inventory[ingredient.name] || 0) >= ingredient.quantity;
        const isNearCampfire = isNearStructure('campfire');
        return hasInInventory || isNearCampfire;
      }
      
      // Normal inventory check for all other ingredients
      return (inventory[ingredient.name] || 0) >= ingredient.quantity;
    });
  };

  const craft = (recipe: CraftingRecipe) => {
    if (!canCraft(recipe)) return;

    // Check which ingredients are satisfied by proximity (before removing anything)
    const usingNearbyCampfire = recipe.ingredients.some(ing => ing.name === 'campfire') && isNearStructure('campfire');

    // Remove ingredients from inventory
    recipe.ingredients.forEach(ingredient => {
      // Don't consume campfire if using nearby structure
      if (ingredient.name === 'campfire' && usingNearbyCampfire) {
        console.log('Using nearby campfire (not consuming from inventory)');
        return; // Skip removing this ingredient
      }
      
      // Only remove if player actually has it in inventory
      if ((inventory[ingredient.name] || 0) >= ingredient.quantity) {
        removeItem(ingredient.name, ingredient.quantity);
      }
    });

    // List of structures that should be placed in the world
    const placeableStructures = [
      'basic_shelter', 'tent', 'campfire', 'storage_chest', 
      'workbench', 'bed', 'stone_wall', 'watchtower', 'water_collector'
    ];
    
    const isPlaceable = placeableStructures.includes(recipe.result.name);
    
    // Track that this item was crafted (for achievements)
    trackCraftedItem(recipe.result.name);
    
    if (isPlaceable) {
      // Place structure in front of player using stored position and direction
      const forwardX = direction[0];
      const forwardZ = direction[2];
      const distance = 5; // 5 units in front
      
      const x = position[0] + forwardX * distance;
      const z = position[2] + forwardZ * distance;
      const terrainHeight = getTerrainHeight(x, z);
      
      const structurePosition: [number, number, number] = [
        x,
        terrainHeight, // Place at terrain level
        z
      ];
      
      addStructure(recipe.result.name, structurePosition);
      console.log(`Placed ${recipe.result.name} in the world at terrain height ${terrainHeight.toFixed(2)}`);
    } else {
      // Add to inventory for non-placeable items
      addItem(recipe.result.name, recipe.result.quantity);
    }

    // Play success sound
    playSuccess();

    console.log(`Crafted: ${recipe.result.name} x${recipe.result.quantity}`);
  };

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0, 0, 0, 0.9)',
    color: 'white',
    padding: isMobile ? '15px' : '20px',
    borderRadius: '10px',
    minWidth: isMobile ? '90%' : '400px',
    maxWidth: isMobile ? '90%' : '600px',
    maxHeight: isMobile ? '75vh' : '500px',
    overflowY: 'auto',
    pointerEvents: 'auto',
    fontFamily: 'Inter, sans-serif'
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: isMobile ? '20px' : '18px' }}>Crafting Menu</h3>
        <button 
          onClick={onClose}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: isMobile ? '10px 15px' : '5px 10px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            touchAction: 'manipulation'
          }}
        >
          Close
        </button>
      </div>

      {craftingRecipes.map((recipe) => {
        const craftable = canCraft(recipe);
        
        return (
          <div 
            key={recipe.id}
            style={{
              margin: '10px 0',
              padding: isMobile ? '12px' : '15px',
              backgroundColor: craftable ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '5px',
              border: craftable ? '2px solid #4CAF50' : '1px solid #333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, marginBottom: '5px' }}>{recipe.name}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>{recipe.description}</p>
                
                <div style={{ marginTop: '10px' }}>
                  <strong>Ingredients:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {recipe.ingredients.map((ingredient, index) => {
                      const available = inventory[ingredient.name] || 0;
                      const hasEnough = available >= ingredient.quantity;
                      
                      // Check if this ingredient can be satisfied by proximity
                      const nearbyStructure = ingredient.name === 'campfire' && isNearStructure('campfire');
                      const satisfied = hasEnough || nearbyStructure;
                      
                      return (
                        <li 
                          key={index}
                          style={{ 
                            color: satisfied ? '#4CAF50' : '#f44336',
                            fontSize: '12px'
                          }}
                        >
                          {ingredient.name}: {nearbyStructure ? 'nearby ✓' : `${available}/${ingredient.quantity}`}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <strong>Result:</strong> {recipe.result.name} x{recipe.result.quantity}
                </div>
              </div>

              <button
                onClick={() => craft(recipe)}
                disabled={!craftable}
                style={{
                  padding: isMobile ? '12px 20px' : '10px 15px',
                  backgroundColor: craftable ? '#4CAF50' : '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: craftable ? 'pointer' : 'not-allowed',
                  fontSize: isMobile ? '16px' : '14px',
                  fontWeight: 'bold',
                  touchAction: 'manipulation',
                  minWidth: isMobile ? '80px' : 'auto',
                  minHeight: isMobile ? '44px' : 'auto'
                }}
              >
                Craft
              </button>
            </div>
          </div>
        );
      })}

      {craftingRecipes.length === 0 && (
        <p style={{ textAlign: 'center', color: '#ccc' }}>
          No crafting recipes available yet!
        </p>
      )}
    </div>
  );
}
