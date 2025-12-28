export interface EarnedReward {
    rewardId: string;
    name: string;
    description?: string | null;
    points: number;
    badgeIcon?: string | null;
    earnedAt?: string | null;
}

export interface RewardSummary {
    dailyStreak: number;
    totalPoints: number;
    lastActivityDate?: string | null;
    rewards: EarnedReward[];
}
