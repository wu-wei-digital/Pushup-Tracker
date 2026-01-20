"use client";

import { useEffect, useState } from "react";
import { Card, Button, Input, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [yearlyGoal, setYearlyGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalPushups: number;
    yearTotal: number;
    currentStreak: number;
    longestStreak: number;
    achievementsCount: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setYearlyGoal(user.yearlyGoal.toString());
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName || null,
          bio: bio || null,
          yearlyGoal: parseInt(yearlyGoal) || 10000,
        }),
      });

      if (res.ok) {
        showToast("success", "Profile updated successfully");
        setIsEditing(false);
        refreshUser();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to update profile");
      }
    } catch {
      showToast("error", "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Profile
        </h1>
        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
            <span className="text-primary-600 font-bold text-4xl">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </span>
          </div>

          {isEditing ? (
            <div className="w-full space-y-4">
              <Input
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Input
                label="Yearly Goal"
                type="number"
                value={yearlyGoal}
                onChange={(e) => setYearlyGoal(e.target.value)}
                min="100"
                max="1000000"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} isLoading={isLoading}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900">
                {user.displayName || user.username}
              </h2>
              <p className="text-gray-500">@{user.username}</p>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary">Level {user.level}</Badge>
                {user.currentTitle && (
                  <Badge variant="info">{user.currentTitle}</Badge>
                )}
              </div>

              {user.bio && (
                <p className="text-gray-600 mt-4 max-w-md">
                  {user.bio}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-4">
                {user.points.toLocaleString()} XP · Goal: {user.yearlyGoal.toLocaleString()} pushups/year
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      {stats && !isEditing && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPushups.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Total Pushups
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.yearTotal.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                This Year
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.currentStreak}
              </p>
              <p className="text-sm text-gray-500">
                Current Streak
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">
                {stats.achievementsCount}
              </p>
              <p className="text-sm text-gray-500">
                Achievements
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
