"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, Badge, Modal, Input, ProgressBar } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";

interface Team {
  id: number;
  name: string;
  description: string | null;
  teamGoal: number;
  creator: { id: number; username: string; displayName: string | null };
  memberCount: number;
  totalPushups: number;
  isJoined: boolean;
  userRole: string | null;
}

export default function TeamsPage() {
  const { showToast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "joined">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "", teamGoal: "50000" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teams?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (teamId: number) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, { method: "POST" });
      if (res.ok) {
        showToast("success", "Joined team!");
        fetchTeams();
      }
    } catch {
      showToast("error", "Failed to join");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createForm,
          teamGoal: parseInt(createForm.teamGoal),
        }),
      });
      if (res.ok) {
        showToast("success", "Team created!");
        setShowCreate(false);
        setCreateForm({ name: "", description: "", teamGoal: "50000" });
        fetchTeams();
      } else {
        const data = await res.json();
        showToast("error", data.error || "Failed to create");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Work together towards shared goals</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Create Team</Button>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("all")}>
          All Teams
        </Button>
        <Button variant={filter === "joined" ? "primary" : "ghost"} size="sm" onClick={() => setFilter("joined")}>
          My Teams
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}><div className="animate-pulse h-32" /></Card>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            No teams found. Create one!
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{team.name}</h3>
                  {team.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{team.description}</p>
                  )}
                </div>
                {team.isJoined && (
                  <Badge variant={team.userRole === "admin" ? "primary" : "default"} size="sm">
                    {team.userRole === "admin" ? "Admin" : "Member"}
                  </Badge>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Team Progress</span>
                  <span className="font-medium">{team.totalPushups.toLocaleString()} / {team.teamGoal.toLocaleString()}</span>
                </div>
                <ProgressBar
                  value={(team.totalPushups / team.teamGoal) * 100}
                  color={team.totalPushups >= team.teamGoal ? "success" : "primary"}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{team.memberCount} members</span>
                <div className="flex gap-2">
                  <Link href={`/teams/${team.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  {!team.isJoined && (
                    <Button size="sm" onClick={() => handleJoin(team.id)}>Join</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Team">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Team Name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              rows={2}
            />
          </div>
          <Input
            label="Team Goal (yearly pushups)"
            type="number"
            value={createForm.teamGoal}
            onChange={(e) => setCreateForm({ ...createForm, teamGoal: e.target.value })}
            min="1000"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
