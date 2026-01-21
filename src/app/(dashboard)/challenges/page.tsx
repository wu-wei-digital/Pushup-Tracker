"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, Button, Badge, Modal, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface Challenge {
  id: number;
  name: string;
  description: string | null;
  challengeType: string;
  startDate: string;
  endDate: string;
  targetAmount: number | null;
  creator: { id: number; username: string; displayName: string | null };
  participantCount: number;
  isJoined: boolean;
}

export default function ChallengesPage() {
    const { showToast } = useToast();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"active" | "joined" | "upcoming" | "past">("active");
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        challengeType: "time_based",
        startDate: "",
        endDate: "",
        targetAmount: "",
    });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const fetchChallenges = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/challenges?filter=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setChallenges(data.challenges);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (challengeId: number) => {
        try {
            const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
            if (res.ok) {
                showToast("success", "Joined challenge!");
                fetchChallenges();
            }
        } catch {
            showToast("error", "Failed to join");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch("/api/challenges", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...createForm,
                    targetAmount: createForm.targetAmount ? parseInt(createForm.targetAmount) : undefined,
                    startDate: new Date(createForm.startDate).toISOString(),
                    endDate: new Date(createForm.endDate).toISOString(),
                }),
            });
            if (res.ok) {
                showToast("success", "Challenge created!");
                setShowCreate(false);
                setCreateForm({ name: "", description: "", challengeType: "time_based", startDate: "", endDate: "", targetAmount: "" });
                fetchChallenges();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to create");
            }
        } finally {
            setIsCreating(false);
        }
    };

    const getChallengeStatus = (challenge: Challenge) => {
        const now = new Date();
        const start = new Date(challenge.startDate);
        const end = new Date(challenge.endDate);
        if (now < start) return { label: "Upcoming", variant: "info" as const };
        if (now > end) return { label: "Ended", variant: "default" as const };
        return { label: "Active", variant: "success" as const };
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
                    <p className="text-sage-600 mt-1">Compete with others</p>
                </div>
                <Button onClick={() => setShowCreate(true)}>Create Challenge</Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(["active", "joined", "upcoming", "past"] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "primary" : "ghost"}
                        size="sm"
                        onClick={() => setFilter(f)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Challenges List */}
            {isLoading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <div className="animate-pulse">
                                <div className="h-6 w-48 bg-sage-200 rounded mb-2" />
                                <div className="h-4 w-32 bg-sage-200 rounded" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : challenges.length === 0 ? (
                <Card>
                    <div className="text-center py-8 text-sage-500">
            No challenges found. Create one!
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {challenges.map((challenge) => {
                        const status = getChallengeStatus(challenge);
                        return (
                            <Card key={challenge.id}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">
                                                {challenge.name}
                                            </h3>
                                            <Badge variant={status.variant} size="sm">{status.label}</Badge>
                                        </div>
                                        {challenge.description && (
                                            <p className="text-sm text-sage-600 mb-2">
                                                {challenge.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-sage-500">
                                            <span>
                                                {format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d, yyyy")}
                                            </span>
                                            <span>{challenge.participantCount} participants</span>
                                            {challenge.targetAmount && <span>Target: {challenge.targetAmount}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/challenges/${challenge.id}`}>
                                            <Button variant="outline" size="sm">View</Button>
                                        </Link>
                                        {!challenge.isJoined && status.label !== "Ended" && (
                                            <Button size="sm" onClick={() => handleJoin(challenge.id)}>Join</Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Challenge">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1">
              Description
                        </label>
                        <textarea
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            className="w-full px-3 py-2 border border-sage-300 rounded-lg bg-white bg-sage-800"
                            rows={2}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Start Date"
                            type="date"
                            value={createForm.startDate}
                            onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                            required
                        />
                        <Input
                            label="End Date"
                            type="date"
                            value={createForm.endDate}
                            onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                            required
                        />
                    </div>
                    <Input
                        label="Target Amount (optional)"
                        type="number"
                        value={createForm.targetAmount}
                        onChange={(e) => setCreateForm({ ...createForm, targetAmount: e.target.value })}
                        placeholder="e.g., 1000"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
                        </Button>
                        <Button type="submit" isLoading={isCreating}>Create</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
