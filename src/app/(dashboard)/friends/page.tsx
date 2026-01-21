"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Input, Badge, Avatar } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface Friend {
  id: number;
  user: {
    id: number;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    level: number;
    currentTitle: string | null;
  };
  status: string;
  isInitiator: boolean;
}

interface SearchUser {
  id: number;
  username: string;
  displayName: string | null;
  profilePicture: string | null;
  level: number;
  friendshipStatus: { id: number; status: string; isInitiator: boolean } | null;
}

export default function FriendsPage() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">("friends");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<Friend[]>([]);
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    const fetchFriends = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/friends?status=accepted");
            if (res.ok) {
                const data = await res.json();
                setFriends(data.friends);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch("/api/friends?status=pending");
            if (res.ok) {
                const data = await res.json();
                setRequests(data.friends.filter((f: Friend) => !f.isInitiator));
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        }
    };

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchUsers(query);
    };

    const handleSendRequest = async (userId: number) => {
        setActionLoading(userId);
        try {
            const res = await fetch("/api/friends", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendId: userId }),
            });
            if (res.ok) {
                showToast("success", "Friend request sent!");
                searchUsers(searchQuery);
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to send request");
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleAccept = async (friendshipId: number) => {
        setActionLoading(friendshipId);
        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "accept" }),
            });
            if (res.ok) {
                showToast("success", "Friend request accepted!");
                fetchFriends();
                fetchRequests();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (friendshipId: number) => {
        setActionLoading(friendshipId);
        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject" }),
            });
            if (res.ok) {
                showToast("success", "Friend request declined");
                fetchRequests();
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemove = async (friendshipId: number) => {
        setActionLoading(friendshipId);
        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast("success", "Friend removed");
                fetchFriends();
            }
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Friends</h1>
                <p className="text-sage-600 mt-1">
          Connect with other pushup enthusiasts
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-sage-200">
                {[
                    { id: "friends" as const, label: "Friends", count: friends.length },
                    { id: "requests" as const, label: "Requests", count: requests.length },
                    { id: "search" as const, label: "Find Friends" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                            activeTab === tab.id
                                ? "border-primary-600 text-sage-600"
                                : "border-transparent text-sage-500 hover:text-sage-700"
                        }`}
                    >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <Badge variant={tab.id === "requests" ? "danger" : "default"} size="sm">
                                {tab.count}
                            </Badge>
                        )}
                    </button>
                ))}
            </div>

            {/* Friends List */}
            {activeTab === "friends" && (
                <Card>
                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-sage-500">
                            <p>No friends yet.</p>
                            <p className="text-sm mt-1">Search for users to add as friends!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {friends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-sage-50">
                                    <Link href={`/profile/${friend.user.id}`} className="flex items-center gap-3 hover:underline">
                                        <Avatar
                                            src={friend.user.profilePicture}
                                            name={friend.user.displayName || friend.user.username}
                                            size="md"
                                        />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {friend.user.displayName || friend.user.username}
                                            </p>
                                            <p className="text-xs text-sage-500">Level {friend.user.level}</p>
                                        </div>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(friend.id)}
                                        isLoading={actionLoading === friend.id}
                                    >
                    Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Requests */}
            {activeTab === "requests" && (
                <Card>
                    {requests.length === 0 ? (
                        <div className="text-center py-8 text-sage-500">
              No pending friend requests.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-sage-50">
                                    <Link href={`/profile/${request.user.id}`} className="flex items-center gap-3">
                                        <Avatar
                                            src={request.user.profilePicture}
                                            name={request.user.displayName || request.user.username}
                                            size="md"
                                        />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {request.user.displayName || request.user.username}
                                            </p>
                                            <p className="text-xs text-sage-500">Level {request.user.level}</p>
                                        </div>
                                    </Link>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleAccept(request.id)} isLoading={actionLoading === request.id}>
                      Accept
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleReject(request.id)} isLoading={actionLoading === request.id}>
                      Decline
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Search */}
            {activeTab === "search" && (
                <div className="space-y-4">
                    <Input
                        placeholder="Search by username..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Card>
                        {searchQuery.length < 2 ? (
                            <div className="text-center py-8 text-sage-500">
                Enter at least 2 characters to search
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-8 text-sage-500">
                No users found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {searchResults.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-sage-50">
                                        <Link href={`/profile/${user.id}`} className="flex items-center gap-3">
                                            <Avatar
                                                src={user.profilePicture}
                                                name={user.displayName || user.username}
                                                size="md"
                                            />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {user.displayName || user.username}
                                                </p>
                                                <p className="text-xs text-sage-500">Level {user.level}</p>
                                            </div>
                                        </Link>
                                        {user.friendshipStatus?.status === "accepted" ? (
                                            <Badge>Friends</Badge>
                                        ) : user.friendshipStatus?.status === "pending" ? (
                                            <Badge variant="info">Pending</Badge>
                                        ) : (
                                            <Button size="sm" onClick={() => handleSendRequest(user.id)} isLoading={actionLoading === user.id}>
                        Add Friend
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
