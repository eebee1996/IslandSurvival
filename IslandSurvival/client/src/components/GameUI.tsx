import React, { useState, useEffect } from "react";
import { useInventory } from "../lib/stores/useInventory";
import { useSurvival } from "../lib/stores/useSurvival";
import { useTime } from "../lib/stores/useTime";
import { useAudio } from "../lib/stores/useAudio";
import { useCombat } from "../lib/stores/useCombat";
import { useWeather } from "../lib/stores/useWeather";
import { useUI } from "../lib/stores/useUI";
import { useStructures } from "../lib/stores/useStructures";
import { useAchievements } from "../lib/stores/useAchievements";
import { useGame } from "../lib/stores/useGame";
import { useKeyboardControls } from "@react-three/drei";
import { CraftingMenu } from "./CraftingMenu";
import { Achievements } from "./Achievements";
import { saveGame, loadGame, startAutoSave, stopAutoSave } from "../lib/saveLoad";
import { useIsMobile } from '../hooks/use-is-mobile';


enum Controls {
  inventory = 'inventory',
  craft = 'craft',
  pause = 'pause',
  torch = 'torch'
}

// Define consumable items and their effects
const CONSUMABLES: Record<string, { hunger?: number; thirst?: number; health?: number }> = {
  cooked_berries: { hunger: 20 },
  cooked_fish: { hunger: 35 },
  berries: { hunger: 10 },
  fish: { hunger: 25 }
};

export function GameUI() {
  const { inventory, removeItem } = useInventory();
  const { health, hunger, thirst, isGameOver, increaseHunger, increaseThirst, increaseHealth } = useSurvival();
  const { timeOfDay, isNight } = useTime();
  const { isMuted, toggleMute } = useAudio();
  const { equippedWeapon, torchEquipped, toggleTorch } = useCombat();
  const { currentWeather } = useWeather();
  const { setMenuOpen } = useUI();
  const { structures } = useStructures();
  const { checkAchievements } = useAchievements();
  const { isPaused, togglePause, resume } = useGame();
  const { playSuccess } = useAudio();
  const [, getControls] = useKeyboardControls<Controls>();
  const [showInventory, setShowInventory] = useState(false);
  const [showCrafting, setShowCrafting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Start auto-save on mount
  useEffect(() => {
    startAutoSave();
    return () => stopAutoSave();
  }, []);

  // Update UI menu state when inventory, crafting, or pause menu is opened/closed
  useEffect(() => {
    setMenuOpen(showInventory || showCrafting || isPaused);
  }, [showInventory, showCrafting, isPaused, setMenuOpen]);

  // Check achievements periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements(inventory, structures);
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [inventory, structures, checkAchievements]);

  // Handle keyboard shortcuts - track last key state to prevent flickering
  const lastInventoryState = React.useRef(false);
  const lastCraftState = React.useRef(false);
  const lastPauseState = React.useRef(false);
  const lastTorchState = React.useRef(false);

  React.useEffect(() => {
    const checkKeys = () => {
      const controls = getControls();

      // Only toggle when key transitions from false to true (key press, not hold)
      if (controls.inventory && !lastInventoryState.current) {
        setShowInventory(prev => !prev);
      }
      lastInventoryState.current = controls.inventory;

      if (controls.craft && !lastCraftState.current) {
        setShowCrafting(prev => !prev);
      }
      lastCraftState.current = controls.craft;

      if (controls.pause && !lastPauseState.current) {
        togglePause();
      }
      lastPauseState.current = controls.pause;

      if (controls.torch && !lastTorchState.current) {
        if (inventory.torch && inventory.torch > 0) {
          toggleTorch();
        }
      }
      lastTorchState.current = controls.torch;
    };

    const interval = setInterval(checkKeys, 50);
    return () => clearInterval(interval);
  }, [getControls, togglePause, toggleTorch, inventory.torch]);

  const handleSave = () => {
    const success = saveGame();
    setSaveMessage(success ? 'Game Saved!' : 'Save Failed!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleLoad = () => {
    const success = loadGame();
    setSaveMessage(success ? 'Game Loaded!' : 'Load Failed!');
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleConsumeItem = (itemName: string) => {
    const consumable = CONSUMABLES[itemName];
    if (!consumable) return;

    if ((inventory[itemName] || 0) < 1) return;

    removeItem(itemName, 1);

    if (consumable.hunger) increaseHunger(consumable.hunger);
    if (consumable.thirst) increaseThirst(consumable.thirst);
    if (consumable.health) increaseHealth(consumable.health);

    playSuccess();
    console.log(`Consumed ${itemName}: +${consumable.hunger || 0} hunger, +${consumable.thirst || 0} thirst, +${consumable.health || 0} health`);
  };

  const uiStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
    fontFamily: 'Inter, sans-serif'
  };

  const panelStyle: React.CSSProperties = {
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    pointerEvents: 'auto'
  };

  if (isGameOver) {
    return (
      <div style={uiStyle}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          ...panelStyle,
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Game Over!</h2>
          <p style={{ fontSize: '14px', margin: '0 0 15px 0' }}>You didn't survive on the island...</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Restart Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={uiStyle}>
      {/* Mobile Menu Buttons */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          display: 'flex',
          gap: '10px',
          pointerEvents: 'auto',
          zIndex: 2000
        }}>
          <button
            onClick={() => setShowInventory(!showInventory)}
            style={{
              padding: '12px 16px',
              backgroundColor: showInventory ? '#4CAF50' : 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '50px',
              touchAction: 'manipulation'
            }}
          >
            🎒
          </button>
          <button
            onClick={() => setShowCrafting(!showCrafting)}
            style={{
              padding: '12px 16px',
              backgroundColor: showCrafting ? '#4CAF50' : 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '50px',
              touchAction: 'manipulation'
            }}
          >
            🔨
          </button>
          <button
            onClick={togglePause}
            style={{
              padding: '12px 16px',
              backgroundColor: isPaused ? '#4CAF50' : 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '50px',
              touchAction: 'manipulation'
            }}
          >
            ⏸️
          </button>
        </div>
      )}

      {/* Pause Menu */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          zIndex: 3000,
          pointerEvents: 'auto',
          minWidth: '350px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '28px' : '32px' }}>PAUSED</h2>
          <p style={{ margin: '0 0 30px 0', color: '#ccc', fontSize: isMobile ? '14px' : '16px' }}>
            {isMobile ? 'Game is paused. Tap Resume to continue.' : 'Game is paused. Press ESC to resume.'}
          </p>

          <button
            onClick={resume}
            style={{
              padding: isMobile ? '15px 24px' : '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '18px' : '16px',
              fontWeight: 'bold',
              marginBottom: '10px',
              width: '100%',
              touchAction: 'manipulation',
              minHeight: isMobile ? '50px' : 'auto'
            }}
          >
            ▶️ Resume Game
          </button>

          <div style={{ marginTop: '30px', borderTop: '1px solid #555', paddingTop: '20px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '48%',
                marginRight: '4%',
                fontSize: isMobile ? '16px' : '14px',
                touchAction: 'manipulation',
                minHeight: isMobile ? '44px' : 'auto'
              }}
            >
              💾 Save Game
            </button>
            <button
              onClick={handleLoad}
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '48%',
                fontSize: isMobile ? '16px' : '14px',
                touchAction: 'manipulation',
                minHeight: isMobile ? '44px' : 'auto'
              }}
            >
              📂 Load Game
            </button>
          </div>
        </div>
      )}

      {/* Achievements */}
      <Achievements />
      {/* Health and Survival Stats - Hidden on mobile */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          ...panelStyle
        }}>
        <div style={{ marginBottom: '10px' }}>
          <div>Health: {health}/100</div>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${health}%`,
              height: '100%',
              backgroundColor: health > 50 ? '#4CAF50' : health > 25 ? '#FF9800' : '#F44336',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <div>Hunger: {hunger}/100</div>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${hunger}%`,
              height: '100%',
              backgroundColor: '#8B4513',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        <div>
          <div>Thirst: {thirst}/100</div>
          <div style={{
            width: '200px',
            height: '20px',
            backgroundColor: '#333',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${thirst}%`,
              height: '100%',
              backgroundColor: '#2196F3',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
      )}

      {/* Time Display, Weather and Sound Toggle - Hidden on mobile */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          ...panelStyle
        }}>
        <div>Time: {Math.floor(timeOfDay)}:00</div>
        <div>{isNight ? '🌙 Night' : '☀️ Day'}</div>
        <div style={{ marginTop: '5px' }}>
          {currentWeather === 'clear' && '☀️ Clear'}
          {currentWeather === 'rain' && '🌧️ Rain'}
          {currentWeather === 'storm' && '⛈️ Storm'}
        </div>
        <button
          onClick={toggleMute}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: isMuted ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {isMuted ? '🔇 Muted' : '🔊 Sound'}
        </button>
      </div>
      )}

      {/* Quick Inventory Display - Hidden on mobile */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '200px',
          left: '20px',
          ...panelStyle,
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
        <h4 style={{ margin: '0 0 10px 0' }}>Inventory:</h4>
        <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
          {Object.entries(inventory).map(([item, quantity]) => (
            <div key={item} style={{ margin: '3px 0', fontSize: '14px' }}>
              {item}: {quantity}
            </div>
          ))}
        </div>

        {/* Save/Load Buttons */}
        <div style={{ marginTop: '10px', borderTop: '1px solid #555', paddingTop: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '48%',
              marginRight: '4%',
              fontSize: '12px'
            }}
          >
            💾 Save
          </button>
          <button
            onClick={handleLoad}
            style={{
              padding: '8px 12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              width: '48%',
              fontSize: '12px'
            }}
          >
            📂 Load
          </button>
        </div>
      </div>
      )}

      {/* Save/Load Message */}
      {saveMessage && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '10px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 2000,
          pointerEvents: 'none'
        }}>
          {saveMessage}
        </div>
      )}

      {/* Controls Help and Weapon */}
      {!isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          ...panelStyle,
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            🗡️ {equippedWeapon ? equippedWeapon.replace(/_/g, ' ').toUpperCase() : 'BARE HANDS'}
          </div>
          {inventory.torch && inventory.torch > 0 && (
            <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: 'bold', color: torchEquipped ? '#FFA500' : '#888' }}>
              🔦 Torch {torchEquipped ? 'ON' : 'OFF'} ({inventory.torch})
            </div>
          )}
          <div>WASD - Move</div>
          <div>E - Interact</div>
          <div>I - Inventory</div>
          <div>C - Craft</div>
          <div>T - Toggle Torch</div>
          <div>Space - Jump</div>
          <div>Click - Attack</div>
        </div>
      )}
      
      {/* Mobile compact HUD - minimal stats at bottom */}
      {isMobile && !showInventory && !showCrafting && !isPaused && (
        <>
          {/* Left: Health/Hunger/Thirst mini bars */}
          <div style={{
            position: 'absolute',
            bottom: '160px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            minWidth: '90px',
            pointerEvents: 'none',
            zIndex: 100
          }}>
            <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>❤️</span>
              <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${health}%`, height: '100%', background: health > 50 ? '#4CAF50' : '#F44336' }} />
              </div>
            </div>
            <div style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🍖</span>
              <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${hunger}%`, height: '100%', background: '#8B4513' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>💧</span>
              <div style={{ flex: 1, height: '6px', background: '#333', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${thirst}%`, height: '100%', background: '#2196F3' }} />
              </div>
            </div>
          </div>

          {/* Right: Time & Weather */}
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '6px 8px',
            borderRadius: '8px',
            fontSize: '11px',
            textAlign: 'right',
            pointerEvents: 'none',
            zIndex: 100
          }}>
            <div>{isNight ? '🌙' : '☀️'} {Math.floor(timeOfDay)}:00</div>
            <div style={{ marginTop: '2px' }}>
              {currentWeather === 'clear' && '☀️'}
              {currentWeather === 'rain' && '🌧️'}
              {currentWeather === 'storm' && '⛈️'}
            </div>
          </div>

          {/* Mobile Torch Button - show if player has torches */}
          {inventory.torch && inventory.torch > 0 && (
            <button
              onClick={() => toggleTorch()}
              style={{
                position: 'absolute',
                bottom: '280px',
                right: '20px',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: torchEquipped ? 'rgba(255, 165, 0, 0.9)' : 'rgba(100, 100, 100, 0.8)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                padding: 0
              }}
            >
              <div>🔦</div>
              <div style={{ fontSize: '8px', marginTop: '-2px' }}>{inventory.torch}</div>
            </button>
          )}
        </>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          ...panelStyle,
          minWidth: isMobile ? '90%' : '300px',
          maxWidth: isMobile ? '90%' : '500px',
          maxHeight: isMobile ? '70vh' : '400px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: isMobile ? '20px' : '18px' }}>Inventory</h3>
            <button
              onClick={() => setShowInventory(false)}
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
          {Object.entries(inventory).length === 0 ? (
            <p>Your inventory is empty. Find some resources!</p>
          ) : (
            Object.entries(inventory).map(([item, quantity]) => {
              const isConsumable = CONSUMABLES[item];
              return (
                <div key={item} style={{
                  padding: isMobile ? '15px' : '10px',
                  margin: '5px 0',
                  backgroundColor: isConsumable ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: isConsumable ? 'pointer' : 'default',
                  border: isConsumable ? '2px solid #4CAF50' : 'none',
                  fontSize: isMobile ? '16px' : '14px',
                  touchAction: 'manipulation',
                  minHeight: isMobile ? '50px' : 'auto'
                }}
                onClick={() => isConsumable && handleConsumeItem(item)}
                >
                  <span>{item} {isConsumable && '🍴'}</span>
                  <span>x{quantity}</span>
                </div>
              );
            })
          )}
          {Object.values(CONSUMABLES).length > 0 && (
            <div style={{ marginTop: '15px', fontSize: '12px', color: '#aaa', borderTop: '1px solid #555', paddingTop: '10px' }}>
              💡 Click on consumable items (🍴) to use them
            </div>
          )}
        </div>
      )}

      {/* Crafting Modal */}
      {showCrafting && (
        <CraftingMenu onClose={() => setShowCrafting(false)} />
      )}
    </div>
  );
}