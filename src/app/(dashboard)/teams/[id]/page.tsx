"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  user: { id: number; username: string; displayName: string | null; level: number };
  totalPushups: number;
}

interface TeamDetail {
  id: number;
  name: string;
  description: string | null;
  teamGoal: number;
  creator: { id: number; username: string; displayName: string | null };
  members: TeamMember[];
  totalPushups: number;
  isJoined: boolean;
  userRole: string | null;
}

export default function TeamDetailPage() {
    const params = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [team, setTeam] = useState<TeamDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const teamId = params.id as string;

    useEffect(() => {
        fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamId]);

    const fetchTeam = async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}`);
            if (res.ok) {
                const data = await res.json();
                setTeam(data.team);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}/join`, { method: "POST" });
            if (res.ok) {
                showToast("success", "Joined team!");
                fetchTeam();
            }
        } catch {
            showToast("error", "Failed to join");
        }
    };

    const handleLeave = async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}/leave`, { method: "DELETE" });
            if (res.ok) {
                showToast("success", "Left team");
                fetchTeam();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to leave");
            }
        } catch {
            showToast("error", "Failed to leave");
        }
    };

    if (isLoading) {
        return <Card><div className="animate-pulse h-48" /></Card>;
    }

    if (!team) {
        return (
            <Card>
                <div className="text-center py-8">
                    <p className="text-sage-500">Team not found</p>
                    <Link href="/teams" className="text-sage-600 hover:underline mt-2 inline-block">
            Back to Teams
                    </Link>
                </div>
            </Card>
        );
    }

    const progress = (team.totalPushups / team.teamGoal) * 100;

    return (
        <div className="space-y-6">
            <Link href="/teams" className="text-sage-600 hover:underline text-sm">
        &larr; Back to Teams
            </Link>

            <Card>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{team.name}</h1>
                        {team.description && (
                            <p className="text-sage-600 mt-1">{team.description}</p>
                        )}
                    </div>
                    {team.isJoined && (
                        <Badge variant={team.userRole === "admin" ? "primary" : "default"}>
                            {team.userRole === "admin" ? "Admin" : "Member"}
                        </Badge>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="font-medium">Team Progress</span>
                        <span className="text-sage-600 font-bold">
                            {team.totalPushups.toLocaleString()} / {team.teamGoal.toLocaleString()}
                        </span>
                    </div>
                    <ProgressBar
                        value={progress}
                        size="lg"
                        color={progress >= 100 ? "success" : "primary"}
                        showLabel
                    />
                </div>

                <div className="flex justify-end">
                    {team.isJoined ? (
                        <Button variant="outline" onClick={handleLeave}>Leave Team</Button>
                    ) : (
                        <Button onClick={handleJoin}>Join Team</Button>
                    )}
                </div>
            </Card>

            <Card>
                <h2 className="text-lg font-semibold text-foreground mb-4">
          Members ({team.members.length})
                </h2>
                <div className="space-y-2">
                    {team.members.map((member, index) => (
                        <div
                            key={member.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                                member.userId === user?.id
                                    ? "bg-primary-50"
                                    : "bg-sage-50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-400 w-8">
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                </span>
                                <Link href={`/profile/${member.userId}`} className="hover:underline">
                                    <span className="font-medium text-foreground">
                                        {member.user.displayName || member.user.username}
                                    </span>
                                </Link>
                                {member.role === "admin" && (
                                    <Badge variant="primary" size="sm">Admin</Badge>
                                )}
                            </div>
                            <span className="font-bold text-sage-600">
                                {member.totalPushups.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
