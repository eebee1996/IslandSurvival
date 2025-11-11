import { useState } from "react";
import { useAchievements, type Achievement } from "../lib/stores/useAchievements";
import { useIsMobile } from "../hooks/use-is-mobile";

export function Achievements() {
  const { achievements } = useAchievements();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  const formatReward = (achievement: Achievement): string => {
    if (!achievement.reward) return "";
    
    const parts: string[] = [];
    
    if (achievement.reward.items) {
      Object.entries(achievement.reward.items).forEach(([item, quantity]) => {
        parts.push(`${quantity} ${item}`);
      });
    }
    
    if (achievement.reward.health) {
      parts.push(`${achievement.reward.health} health`);
    }
    
    if (achievement.reward.hunger) {
      parts.push(`${achievement.reward.hunger} hunger`);
    }
    
    if (achievement.reward.thirst) {
      parts.push(`${achievement.reward.thirst} thirst`);
    }
    
    return parts.join(", ");
  };

  return (
    <>
      {/* Achievements button - hidden on mobile to save space */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'auto'
        }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '10px 20px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '2px solid #FFD700',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            🏆 Achievements {unlockedCount}/{totalCount}
          </button>
        </div>
      )}

      {/* Achievements panel */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.95)',
          color: 'white',
          padding: isMobile ? '20px' : '30px',
          borderRadius: '15px',
          minWidth: isMobile ? '90%' : '400px',
          maxWidth: isMobile ? '90%' : '600px',
          maxHeight: '70vh',
          overflowY: 'auto',
          zIndex: 2000,
          border: '3px solid #FFD700',
          pointerEvents: 'auto',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>🏆 Achievements</h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>

          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#FFD700' }}>
            Progress: {unlockedCount} / {totalCount} unlocked
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                style={{
                  padding: '15px',
                  backgroundColor: achievement.unlocked 
                    ? 'rgba(255, 215, 0, 0.2)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  border: achievement.unlocked 
                    ? '2px solid #FFD700' 
                    : '1px solid #555',
                  opacity: achievement.unlocked ? 1 : 0.6,
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center'
                }}
              >
                <div style={{ fontSize: '32px' }}>{achievement.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    fontSize: '16px',
                    marginBottom: '5px' 
                  }}>
                    {achievement.name}
                    {achievement.unlocked && <span style={{ color: '#FFD700', marginLeft: '10px' }}>✓</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ccc' }}>
                    {achievement.description}
                  </div>
                  {achievement.reward && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#90EE90',
                      marginTop: '5px',
                      fontWeight: '500'
                    }}>
                      🎁 Reward: {formatReward(achievement)}
                    </div>
                  )}
                  {achievement.unlocked && achievement.unlockedAt && (
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '5px' }}>
                      Unlocked: {new Date(achievement.unlockedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
