"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Badge, ProgressBar } from "@/components/ui";
import { InviteUserModal, PendingInvitations } from "@/components/teams";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  user: { id: number; username: string; displayName: string | null; level: number; profilePicture?: string | null };
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
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteRefreshKey, setInviteRefreshKey] = useState(0);

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

    const handleInviteSent = () => {
        setInviteRefreshKey(prev => prev + 1);
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
    const isAdmin = team.userRole === "admin";

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
                        <Badge variant={isAdmin ? "primary" : "default"}>
                            {isAdmin ? "Admin" : "Member"}
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

                <div className="flex justify-end gap-2">
                    {isAdmin && (
                        <Button variant="outline" onClick={() => setShowInviteModal(true)}>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Invite Members
                        </Button>
                    )}
                    {team.isJoined && (
                        <Button variant="outline" onClick={handleLeave}>Leave Team</Button>
                    )}
                    {!team.isJoined && (
                        <p className="text-sage-500 text-sm py-2">
                            Contact a team admin to request an invitation
                        </p>
                    )}
                </div>
            </Card>

            {/* Pending Invitations (Admin only) */}
            {isAdmin && (
                <Card>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                        Pending Invitations
                    </h2>
                    <PendingInvitations teamId={team.id} refreshKey={inviteRefreshKey} />
                </Card>
            )}

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
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium overflow-hidden">
                                    {member.user.profilePicture ? (
                                        <img
                                            src={member.user.profilePicture}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        (member.user.displayName || member.user.username).charAt(0).toUpperCase()
                                    )}
                                </div>
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

            {/* Invite Modal */}
            <InviteUserModal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                teamId={team.id}
                onInviteSent={handleInviteSent}
            />
        </div>
    );
}
