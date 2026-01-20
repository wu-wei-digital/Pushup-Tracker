"use client";

import { useEffect, useState } from "react";
import { Card, Button } from "@/components/ui";
import LeaderboardTable from "@/components/leaderboard/LeaderboardTable";
import { useAuth } from "@/contexts/AuthContext";
import type { LeaderboardEntry } from "@/types";

type Tab = "global" | "friends" | "weekly";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("global");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLeaderboard = async (tab: Tab, pageNum: number) => {
    setIsLoading(true);
    try {
      const endpoint =
        tab === "global"
          ? "/api/leaderboard"
          : tab === "friends"
          ? "/api/leaderboard/friends"
          : "/api/leaderboard/weekly";

      const res = await fetch(`${endpoint}?page=${pageNum}&pageSize=20`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.items);
        setCurrentUserRank(data.currentUserRank);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab, page);
  }, [activeTab, page]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Leaderboard
        </h1>
        <p className="text-gray-600 mt-1">
          See how you stack up against others
        </p>
      </div>

      {/* Current User Rank */}
      {currentUserRank > 0 && (
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Rank</p>
              <p className="text-3xl font-bold text-primary-600">
                #{currentUserRank}
              </p>
            </div>
            <div className="text-4xl">
              {currentUserRank === 1 ? "🥇" : currentUserRank === 2 ? "🥈" : currentUserRank === 3 ? "🥉" : "🏅"}
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: "global" as Tab, label: "Global" },
          { id: "friends" as Tab, label: "Friends" },
          { id: "weekly" as Tab, label: "This Week" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card padding="none">
        <LeaderboardTable
          entries={entries}
          isLoading={isLoading}
          currentUserId={user?.id}
          showPercentage={activeTab !== "weekly"}
        />
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
