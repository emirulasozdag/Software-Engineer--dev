import { useState, useCallback } from 'react';
import { rewardsService } from '@/services/api';
import { Achievement } from '@/types/rewards.types';

const LAST_CHECK_KEY = 'achievements_last_check';

export const useAchievementNotifications = () => {
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkForNewAchievements = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
      const result = await rewardsService.checkNewAchievements(lastCheck || undefined);
      
      if (result.achievements && result.achievements.length > 0) {
        setNewAchievements((prev) => [...prev, ...result.achievements]);
      }
      
      // Update last check time
      localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
    } catch (error: any) {
      // Silently fail - user might not be authenticated or endpoint might not be ready
      // Only log in development
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // User not authenticated, this is expected
        return;
      }
      console.debug('Could not check for achievements:', error);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  const clearAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  return {
    newAchievements,
    checkForNewAchievements,
    clearAchievements,
  };
};
