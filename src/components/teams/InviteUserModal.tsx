"use client";

import { useState } from "react";
import { Modal, Button, Input, Avatar } from "@/components/ui";
import type { PublicUser } from "@/types";

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: number;
    onInviteSent: () => void;
}

export function InviteUserModal({ isOpen, onClose, teamId, onInviteSent }: InviteUserModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isInviting, setIsInviting] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError("");
        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch {
            setError("Failed to search users");
        } finally {
            setIsSearching(false);
        }
    };

    const handleInvite = async (userId: number) => {
        setIsInviting(userId);
        setError("");
        setSuccess("");

        try {
            const res = await fetch(`/api/teams/${teamId}/invitations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteeId: userId, message: message || undefined }),
            });

            if (res.ok) {
                setSuccess("Invitation sent!");
                setSearchResults(prev => prev.filter(u => u.id !== userId));
                onInviteSent();
                setTimeout(() => setSuccess(""), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to send invitation");
            }
        } catch {
            setError("Failed to send invitation");
        } finally {
            setIsInviting(null);
        }
    };

    const handleClose = () => {
        setSearchQuery("");
        setSearchResults([]);
        setMessage("");
        setError("");
        setSuccess("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Invite User to Team">
            <div className="space-y-4">
                {/* Search */}
                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">
                        Search for users
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by username..."
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <Button onClick={handleSearch} disabled={isSearching}>
                            {isSearching ? "..." : "Search"}
                        </Button>
                    </div>
                </div>

                {/* Optional message */}
                <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1">
                        Message (optional)
                    </label>
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a personal message..."
                        maxLength={200}
                    />
                </div>

                {/* Error/Success messages */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                        {success}
                    </div>
                )}

                {/* Search results */}
                {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-sage-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={user.profilePicture}
                                        name={user.displayName || user.username}
                                        size="md"
                                    />
                                    <div>
                                        <p className="font-medium text-sage-800">
                                            {user.displayName || user.username}
                                        </p>
                                        <p className="text-sm text-sage-600">@{user.username}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleInvite(user.id)}
                                    disabled={isInviting === user.id}
                                >
                                    {isInviting === user.id ? "Sending..." : "Invite"}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {searchResults.length === 0 && searchQuery && !isSearching && (
                    <p className="text-center text-sage-600 py-4">
                        No users found
                    </p>
                )}
            </div>
        </Modal>
    );
}
