"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface ProfileData {
  user: {
    id: number;
    username: string;
    displayName: string | null;
    bio: string | null;
    yearlyGoal: number;
    points: number;
    level: number;
    currentTitle: string | null;
    createdAt: string;
  };
  stats: {
    totalPushups: number;
    yearTotal: number;
    currentStreak: number;
    longestStreak: number;
    achievementsCount: number;
  };
  friendshipStatus: {
    id: number;
    status: string;
    isInitiator: boolean;
  } | null;
  isOwnProfile: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(false);

  const userId = params.id as string;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriendAction = async (action: "send" | "accept" | "reject" | "remove") => {
    setFriendLoading(true);
    try {
      if (action === "send") {
        const res = await fetch("/api/friends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ friendId: parseInt(userId) }),
        });
        if (res.ok) {
          showToast("success", "Friend request sent!");
          fetchProfile();
        }
      } else if (action === "accept" || action === "reject") {
        const res = await fetch(`/api/friends/${profile?.friendshipStatus?.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          showToast("success", action === "accept" ? "Friend request accepted!" : "Friend request rejected");
          fetchProfile();
        }
      } else if (action === "remove") {
        const res = await fetch(`/api/friends/${profile?.friendshipStatus?.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          showToast("success", "Friend removed");
          fetchProfile();
        }
      }
    } catch {
      showToast("error", "Action failed");
    } finally {
      setFriendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">User not found</p>
        <Link href="/leaderboard" className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block">
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  const { user, stats, friendshipStatus, isOwnProfile } = profile;

  const getFriendButton = () => {
    if (isOwnProfile) return null;

    if (!friendshipStatus) {
      return (
        <Button onClick={() => handleFriendAction("send")} isLoading={friendLoading}>
          Add Friend
        </Button>
      );
    }

    if (friendshipStatus.status === "pending") {
      if (friendshipStatus.isInitiator) {
        return <Badge variant="info">Request Sent</Badge>;
      }
      return (
        <div className="flex gap-2">
          <Button onClick={() => handleFriendAction("accept")} isLoading={friendLoading}>
            Accept
          </Button>
          <Button variant="ghost" onClick={() => handleFriendAction("reject")} isLoading={friendLoading}>
            Decline
          </Button>
        </div>
      );
    }

    if (friendshipStatus.status === "accepted") {
      return (
        <Button variant="outline" onClick={() => handleFriendAction("remove")} isLoading={friendLoading}>
          Remove Friend
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <Card>
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
            <span className="text-primary-600 dark:text-primary-400 font-bold text-4xl">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.displayName || user.username}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="primary">Level {user.level}</Badge>
            {user.currentTitle && <Badge variant="info">{user.currentTitle}</Badge>}
          </div>

          {user.bio && (
            <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md">{user.bio}</p>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {user.points.toLocaleString()} XP
          </p>

          <div className="mt-4">{getFriendButton()}</div>
        </div>
      </Card>

      {/* Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalPushups.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Pushups</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.yearTotal.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This Year</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.achievementsCount}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
