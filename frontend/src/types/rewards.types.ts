export interface Achievement {
  rewardId: number;
  name: string;
  description: string | null;
  points: number;
  badge_icon: string | null;
  earned_at: string;
  is_new?: boolean;
}

export interface AchievementNotification {
  achievements: Achievement[];
}

export interface RewardCreate {
  name: string;
  description?: string;
  points?: number;
  badge_icon?: string;
}
