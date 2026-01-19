"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { LeaderboardEntry } from "@/types";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  currentUserId?: number;
  showPercentage?: boolean;
}

export default function LeaderboardTable({
  entries,
  isLoading,
  currentUserId,
  showPercentage = true,
}: LeaderboardTableProps) {
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              {showPercentage && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Progress
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRowSkeleton key={i} columns={showPercentage ? 4 : 3} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total
            </th>
            {showPercentage && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Progress
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {entries.map((entry) => {
            const isCurrentUser = entry.user.id === currentUserId;
            const medal = getMedalEmoji(entry.rank);

            return (
              <tr
                key={entry.user.id}
                className={clsx(
                  "transition-colors",
                  isCurrentUser
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 font-medium w-6 text-center">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/profile/${entry.user.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                        {(entry.user.displayName || entry.user.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p
                        className={clsx(
                          "font-medium",
                          isCurrentUser
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-900 dark:text-white"
                        )}
                      >
                        {entry.user.displayName || entry.user.username}
                        {isCurrentUser && " (You)"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lvl {entry.user.level}
                        {entry.user.currentTitle && ` · ${entry.user.currentTitle}`}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {entry.total.toLocaleString()}
                  </span>
                </td>
                {showPercentage && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span
                      className={clsx(
                        "font-medium",
                        entry.percentComplete >= 100
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {entry.percentComplete.toFixed(1)}%
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
