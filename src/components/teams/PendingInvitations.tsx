"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Avatar } from "@/components/ui";
import type { TeamInvitation } from "@/types";

interface PendingInvitationsProps {
    teamId: number;
    refreshKey?: number;
}

export function PendingInvitations({ teamId, refreshKey }: PendingInvitationsProps) {
    const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const fetchInvitations = useCallback(async () => {
        try {
            const res = await fetch(`/api/teams/${teamId}/invitations`);
            if (res.ok) {
                const data = await res.json();
                // Filter to show only pending invitations
                setInvitations(data.invitations.filter((i: TeamInvitation) => i.status === "pending"));
            }
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations, refreshKey]);

    const handleCancel = async (invitationId: number) => {
        setCancellingId(invitationId);
        try {
            const res = await fetch(`/api/teams/invitations/${invitationId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setInvitations(prev => prev.filter(i => i.id !== invitationId));
            }
        } catch (error) {
            console.error("Failed to cancel invitation:", error);
        } finally {
            setCancellingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-2">
                <div className="h-12 bg-sage-100 rounded-lg"></div>
                <div className="h-12 bg-sage-100 rounded-lg"></div>
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <p className="text-sage-600 text-sm text-center py-4">
                No pending invitations
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {invitations.map((invitation) => (
                <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 bg-sage-50 rounded-lg"
                >
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={invitation.invitee?.profilePicture}
                            name={invitation.invitee?.displayName || invitation.invitee?.username || "?"}
                            size="sm"
                        />
                        <div>
                            <p className="font-medium text-sage-800 text-sm">
                                {invitation.invitee?.displayName || invitation.invitee?.username}
                            </p>
                            <p className="text-xs text-sage-500">
                                Invited {new Date(invitation.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancel(invitation.id)}
                        disabled={cancellingId === invitation.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        {cancellingId === invitation.id ? "..." : "Cancel"}
                    </Button>
                </div>
            ))}
        </div>
    );
}
