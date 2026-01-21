"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { AdminStats } from "@/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to load stats");
      }
    } catch {
      setError("Failed to load stats");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-sage-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-sage-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sage-600 mt-1">Manage users and monitor activity</p>
        </div>
        <Badge variant="warning">Admin</Badge>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-foreground">
            {stats?.users.total.toLocaleString()}
          </p>
          <p className="text-sm text-sage-600">Total Users</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {stats?.users.active.toLocaleString()}
          </p>
          <p className="text-sm text-sage-600">Active Users</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-red-600">
            {stats?.users.disabled}
          </p>
          <p className="text-sm text-sage-600">Disabled</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {stats?.users.admins}
          </p>
          <p className="text-sm text-sage-600">Admins</p>
        </Card>
      </div>

      {/* Growth Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Growth</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-sage-50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              +{stats?.users.newLast7Days}
            </p>
            <p className="text-sm text-sage-600">New users (7 days)</p>
          </div>
          <div className="p-4 bg-sage-50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              +{stats?.users.newLast30Days}
            </p>
            <p className="text-sm text-sage-600">New users (30 days)</p>
          </div>
        </div>
      </Card>

      {/* Pushup Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-sage-50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {stats?.pushups.total.toLocaleString()}
            </p>
            <p className="text-sm text-sage-600">Total Pushups (all time)</p>
          </div>
          <div className="p-4 bg-sage-50 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {stats?.pushups.last7Days.toLocaleString()}
            </p>
            <p className="text-sm text-sage-600">Pushups (last 7 days)</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/admin/users">
            <div className="p-4 rounded-xl bg-sage-50 hover:bg-sage-100 transition-colors flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sage-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-sage-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Manage Users</p>
                <p className="text-sm text-sage-600">View, edit, and manage all users</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
