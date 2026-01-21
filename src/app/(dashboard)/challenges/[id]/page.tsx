"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Card, Button, Badge } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface Participant {
  id: number;
  userId: number;
  user: { id: number; username: string; displayName: string | null; level: number };
  totalPushups: number;
}

interface ChallengeDetail {
  id: number;
  name: string;
  description: string | null;
  challengeType: string;
  startDate: string;
  endDate: string;
  targetAmount: number | null;
  creator: { id: number; username: string; displayName: string | null };
  participants: Participant[];
  isJoined: boolean;
}

export default function ChallengeDetailPage() {
    const params = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const challengeId = params.id as string;

    useEffect(() => {
        fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [challengeId]);

    const fetchChallenge = async () => {
        try {
            const res = await fetch(`/api/challenges/${challengeId}`);
            if (res.ok) {
                const data = await res.json();
                setChallenge(data.challenge);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
            if (res.ok) {
                showToast("success", "Joined challenge!");
                fetchChallenge();
            }
        } catch {
            showToast("error", "Failed to join");
        }
    };

    const handleLeave = async () => {
        try {
            const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "DELETE" });
            if (res.ok) {
                showToast("success", "Left challenge");
                fetchChallenge();
            }
        } catch {
            showToast("error", "Failed to leave");
        }
    };

    if (isLoading) {
        return <Card><div className="animate-pulse h-48" /></Card>;
    }

    if (!challenge) {
        return (
            <Card>
                <div className="text-center py-8">
                    <p className="text-sage-500">Challenge not found</p>
                    <Link href="/challenges" className="text-sage-600 hover:underline mt-2 inline-block">
            Back to Challenges
                    </Link>
                </div>
            </Card>
        );
    }

    const now = new Date();
    const isActive = now >= new Date(challenge.startDate) && now <= new Date(challenge.endDate);
    const hasEnded = now > new Date(challenge.endDate);

    return (
        <div className="space-y-6">
            <Link href="/challenges" className="text-sage-600 hover:underline text-sm">
        &larr; Back to Challenges
            </Link>

            <Card>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{challenge.name}</h1>
                        {challenge.description && (
                            <p className="text-sage-600 mt-1">{challenge.description}</p>
                        )}
                    </div>
                    <Badge variant={isActive ? "success" : hasEnded ? "default" : "info"}>
                        {isActive ? "Active" : hasEnded ? "Ended" : "Upcoming"}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-sage-50 rounded-lg">
                        <p className="text-sm text-sage-500">Start</p>
                        <p className="font-semibold">{format(new Date(challenge.startDate), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-center p-3 bg-sage-50 rounded-lg">
                        <p className="text-sm text-sage-500">End</p>
                        <p className="font-semibold">{format(new Date(challenge.endDate), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-center p-3 bg-sage-50 rounded-lg">
                        <p className="text-sm text-sage-500">Participants</p>
                        <p className="font-semibold">{challenge.participants.length}</p>
                    </div>
                    {challenge.targetAmount && (
                        <div className="text-center p-3 bg-sage-50 rounded-lg">
                            <p className="text-sm text-sage-500">Target</p>
                            <p className="font-semibold">{challenge.targetAmount.toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {!hasEnded && (
                    <div className="flex justify-end">
                        {challenge.isJoined ? (
                            <Button variant="outline" onClick={handleLeave}>Leave Challenge</Button>
                        ) : (
                            <Button onClick={handleJoin}>Join Challenge</Button>
                        )}
                    </div>
                )}
            </Card>

            {/* Leaderboard */}
            <Card>
                <h2 className="text-lg font-semibold text-foreground mb-4">Leaderboard</h2>
                {challenge.participants.length === 0 ? (
                    <p className="text-sage-500 text-center py-4">No participants yet</p>
                ) : (
                    <div className="space-y-2">
                        {challenge.participants.map((participant, index) => (
                            <div
                                key={participant.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                    participant.userId === user?.id
                                        ? "bg-primary-50"
                                        : "bg-sage-50"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-400 w-8">
                                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                    </span>
                                    <Link href={`/profile/${participant.userId}`} className="hover:underline">
                                        <span className="font-medium text-foreground">
                                            {participant.user.displayName || participant.user.username}
                                        </span>
                                    </Link>
                                </div>
                                <span className="font-bold text-sage-600">
                                    {participant.totalPushups.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
