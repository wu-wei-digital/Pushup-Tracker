"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import type { TeamInvitation } from "@/types";

interface TeamInvitationCardProps {
    invitation: TeamInvitation;
    onRespond: (invitationId: number, accepted: boolean) => void;
}

export function TeamInvitationCard({ invitation, onRespond }: TeamInvitationCardProps) {
    const [isResponding, setIsResponding] = useState<"accept" | "decline" | null>(null);

    const handleRespond = async (action: "accept" | "decline") => {
        setIsResponding(action);
        try {
            const res = await fetch(`/api/teams/invitations/${invitation.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                onRespond(invitation.id, action === "accept");
            }
        } catch (error) {
            console.error("Failed to respond to invitation:", error);
        } finally {
            setIsResponding(null);
        }
    };

    return (
        <Card className="border-amber-200 bg-amber-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            Team Invitation
                        </span>
                    </div>
                    <h3 className="font-semibold text-foreground">
                        {invitation.team?.name}
                    </h3>
                    {invitation.team?.description && (
                        <p className="text-sm text-sage-600 mt-1 line-clamp-2">
                            {invitation.team.description}
                        </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-sage-500">
                        <span>
                            Invited by {invitation.inviter?.displayName || invitation.inviter?.username}
                        </span>
                        {invitation.team?._count && (
                            <span>
                                {invitation.team._count.members} member{invitation.team._count.members !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    {invitation.message && (
                        <p className="text-sm text-sage-700 mt-2 italic">
                            &ldquo;{invitation.message}&rdquo;
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRespond("decline")}
                        disabled={isResponding !== null}
                    >
                        {isResponding === "decline" ? "..." : "Decline"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => handleRespond("accept")}
                        disabled={isResponding !== null}
                    >
                        {isResponding === "accept" ? "..." : "Accept"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
