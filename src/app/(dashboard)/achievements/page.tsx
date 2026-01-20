"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { BADGE_DEFINITIONS } from "@/lib/achievements";

interface Achievement {
  id: number;
  badgeType: string;
  badgeName: string;
  badgeDesc: string | null;
  badgeRarity: string;
  unlockedAt: string;
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/achievements/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const unlockedTypes = new Set(achievements.map((a) => a.badgeType));

  const getRarityStyles = (rarity: string) => {
    const styles: Record<string, string> = {
      common: "border-gray-300 bg-gray-50 REMOVEDARK:border-gray-600 REMOVEDARK:bg-gray-800",
      uncommon: "border-green-300 bg-green-50 REMOVEDARK:border-green-600 REMOVEDARK:bg-green-900/20",
      rare: "border-blue-300 bg-blue-50 REMOVEDARK:border-blue-600 REMOVEDARK:bg-blue-900/20",
      epic: "border-purple-300 bg-purple-50 REMOVEDARK:border-purple-600 REMOVEDARK:bg-purple-900/20",
      legendary: "border-amber-300 bg-amber-50 REMOVEDARK:border-amber-600 REMOVEDARK:bg-amber-900/20",
    };
    return styles[rarity] || styles.common;
  };

  const getRarityBadge = (rarity: string) => {
    const variants: Record<string, "default" | "success" | "info" | "warning" | "danger"> = {
      common: "default",
      uncommon: "success",
      rare: "info",
      epic: "warning",
      legendary: "warning",
    };
    return variants[rarity] || "default";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 REMOVEDARK:bg-gray-700 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 bg-gray-200 REMOVEDARK:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 REMOVEDARK:text-white">
          Achievements
        </h1>
        <p className="text-gray-600 REMOVEDARK:text-gray-400 mt-1">
          {achievements.length} of {BADGE_DEFINITIONS.length} badges unlocked
        </p>
      </div>

      {/* Progress */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 REMOVEDARK:text-gray-300">
            Collection Progress
          </span>
          <span className="text-sm text-gray-500 REMOVEDARK:text-gray-400">
            {Math.round((achievements.length / BADGE_DEFINITIONS.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 REMOVEDARK:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 REMOVEDARK:bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(achievements.length / BADGE_DEFINITIONS.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Unlocked Badges */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 REMOVEDARK:text-white mb-4">
            Unlocked
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-xl border-2 ${getRarityStyles(achievement.badgeRarity)} relative overflow-hidden`}
              >
                <div className="badge-shine absolute inset-0 pointer-events-none" />
                <div className="text-center relative">
                  <div className="text-4xl mb-2">
                    {achievement.badgeRarity === "legendary" ? "👑" :
                     achievement.badgeRarity === "epic" ? "🏆" :
                     achievement.badgeRarity === "rare" ? "💎" :
                     achievement.badgeRarity === "uncommon" ? "⭐" : "🎖️"}
                  </div>
                  <h3 className="font-semibold text-gray-900 REMOVEDARK:text-white text-sm">
                    {achievement.badgeName}
                  </h3>
                  <p className="text-xs text-gray-500 REMOVEDARK:text-gray-400 mt-1">
                    {achievement.badgeDesc}
                  </p>
                  <Badge variant={getRarityBadge(achievement.badgeRarity)} size="sm" className="mt-2">
                    {achievement.badgeRarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 REMOVEDARK:text-white mb-4">
          Locked ({BADGE_DEFINITIONS.length - achievements.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {BADGE_DEFINITIONS.filter((b) => !unlockedTypes.has(b.type)).map((badge) => (
            <div
              key={badge.type}
              className="p-4 rounded-xl border-2 border-gray-200 REMOVEDARK:border-gray-700 bg-gray-100 REMOVEDARK:bg-gray-800/50 opacity-60"
            >
              <div className="text-center">
                <div className="text-4xl mb-2 grayscale">🔒</div>
                <h3 className="font-semibold text-gray-600 REMOVEDARK:text-gray-400 text-sm">
                  {badge.name}
                </h3>
                <p className="text-xs text-gray-400 REMOVEDARK:text-gray-500 mt-1">
                  {badge.description}
                </p>
                <Badge variant="default" size="sm" className="mt-2">
                  {badge.rarity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
