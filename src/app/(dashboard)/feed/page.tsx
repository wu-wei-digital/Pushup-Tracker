"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, Button, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { REACTION_EMOJIS, type ReactionType } from "@/types";

interface FeedEntry {
  id: string;
  type: string;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    level: number;
  };
  data: {
    entryId: number;
    amount: number;
    note: string | null;
    source?: "manual" | "pomodoro";
    reactions: Array<{
      id: number;
      userId: number;
      reactionType: string;
    }>;
    reactionCount: number;
    commentCount: number;
  };
  createdAt: string;
}

export default function FeedPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "friends">("all");
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/feed?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.items);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (entryId: number, reactionType: ReactionType) => {
    try {
      await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, reactionType }),
      });
      fetchFeed();
    } catch {
      showToast("error", "Failed to add reaction");
    }
  };

  const handleComment = async (entryId: number) => {
    if (!commentText.trim()) return;

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, content: commentText }),
      });
      if (res.ok) {
        showToast("success", "Comment added!");
        setCommentText("");
        setCommentingOn(null);
        fetchFeed();
      }
    } catch {
      showToast("error", "Failed to add comment");
    }
  };

  const getUserReaction = (entry: FeedEntry, type: ReactionType) => {
    return entry.data.reactions.some(
      (r) => r.userId === user?.id && r.reactionType === type
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Activity Feed
          </h1>
          <p className="text-sage-600 mt-1">
            See what everyone is up to
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Everyone
          </Button>
          <Button
            variant={filter === "friends" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setFilter("friends")}
          >
            Friends
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sage-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-sage-200 rounded mb-2" />
                    <div className="h-3 w-24 bg-sage-200 rounded" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-sage-500">
            {filter === "friends" ? (
              <p>No activity from friends yet. Add some friends!</p>
            ) : (
              <p>No activity yet. Be the first to log pushups!</p>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Link href={`/profile/${entry.user.id}`}>
                  <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                    <span className="text-sage-600 font-medium">
                      {(entry.user.displayName || entry.user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${entry.user.id}`} className="font-medium text-foreground hover:underline">
                    {entry.user.displayName || entry.user.username}
                  </Link>
                  <p className="text-xs text-sage-500">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">
                    Did <span className="text-sage-600">{entry.data.amount}</span> pushup{entry.data.amount !== 1 ? "s" : ""}
                  </p>
                  {entry.data.source === "pomodoro" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-coral-100 text-coral-700 text-xs font-medium rounded-full border border-coral-200">
                      🍅 Pomodoro
                    </span>
                  )}
                </div>
                {entry.data.note && (
                  <p className="text-sage-600 mt-1">{entry.data.note}</p>
                )}
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-1 mb-3">
                {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => {
                  const hasReacted = getUserReaction(entry, type);
                  const count = entry.data.reactions.filter((r) => r.reactionType === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(entry.data.entryId, type)}
                      className={`px-2 py-1 rounded-full text-sm transition-colors ${
                        hasReacted
                          ? "bg-sage-100"
                          : "bg-sage-100 hover:bg-sage-200"
                      }`}
                    >
                      {REACTION_EMOJIS[type]} {count > 0 && count}
                    </button>
                  );
                })}
              </div>

              {/* Comment count / toggle */}
              <div className="flex items-center gap-4 text-sm text-sage-500">
                <button
                  onClick={() => setCommentingOn(commentingOn === entry.data.entryId ? null : entry.data.entryId)}
                  className="hover:text-sage-700"
                >
                  {entry.data.commentCount} comment{entry.data.commentCount !== 1 ? "s" : ""}
                </button>
              </div>

              {/* Comment input */}
              {commentingOn === entry.data.entryId && (
                <div className="mt-4 flex gap-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleComment(entry.data.entryId)}>
                    Post
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
