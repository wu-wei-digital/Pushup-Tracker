"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Input, Badge, Modal, Avatar } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import type { AdminUser } from "@/types";

type StatusFilter = "all" | "active" | "disabled";

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminUsersPage() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Modal states
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        displayName: "",
        email: "",
        username: "",
        yearlyGoal: "",
        isAdmin: false,
        isDisabled: false,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Password form state
    const [newPassword, setNewPassword] = useState("");
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: "20",
                ...(search && { search }),
                ...(statusFilter !== "all" && { status: statusFilter }),
            });

            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const data: UsersResponse = await res.json();
                setUsers(data.users);
                setTotalPages(data.totalPages);
                setTotal(data.total);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter]);

    const openEditModal = (user: AdminUser) => {
        setSelectedUser(user);
        setEditForm({
            displayName: user.displayName || "",
            email: user.email,
            username: user.username,
            yearlyGoal: "10000", // Will be fetched from detail
            isAdmin: user.isAdmin,
            isDisabled: user.isDisabled,
        });
        setIsEditModalOpen(true);
    };

    const openPasswordModal = (user: AdminUser) => {
        setSelectedUser(user);
        setNewPassword("");
        setIsPasswordModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    displayName: editForm.displayName || null,
                    email: editForm.email,
                    username: editForm.username,
                    yearlyGoal: parseInt(editForm.yearlyGoal) || 10000,
                    isAdmin: editForm.isAdmin,
                    isDisabled: editForm.isDisabled,
                }),
            });

            if (res.ok) {
                showToast("success", "User updated successfully");
                setIsEditModalOpen(false);
                fetchUsers();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to update user");
            }
        } catch {
            showToast("error", "Failed to update user");
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return;

        setIsResettingPassword(true);
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword }),
            });

            if (res.ok) {
                showToast("success", `Password reset for ${selectedUser.username}`);
                setIsPasswordModalOpen(false);
                setNewPassword("");
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to reset password");
            }
        } catch {
            showToast("error", "Failed to reset password");
        } finally {
            setIsResettingPassword(false);
        }
    };

    const toggleUserStatus = async (user: AdminUser) => {
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isDisabled: !user.isDisabled }),
            });

            if (res.ok) {
                showToast("success", `User ${user.isDisabled ? "enabled" : "disabled"}`);
                fetchUsers();
            } else {
                const data = await res.json();
                showToast("error", data.error || "Failed to update user");
            }
        } catch {
            showToast("error", "Failed to update user");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">
            User Management
                    </h1>
                    <p className="text-sage-600 mt-1">{total} users total</p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by username, email, or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {(["all", "active", "disabled"] as StatusFilter[]).map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-sage-100">
                                <th className="text-left p-4 text-sm font-medium text-sage-600">User</th>
                                <th className="text-left p-4 text-sm font-medium text-sage-600">Email</th>
                                <th className="text-left p-4 text-sm font-medium text-sage-600">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-sage-600">Entries</th>
                                <th className="text-left p-4 text-sm font-medium text-sage-600">Joined</th>
                                <th className="text-right p-4 text-sm font-medium text-sage-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b border-sage-50">
                                        <td className="p-4">
                                            <div className="h-5 w-32 bg-sage-100 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-5 w-48 bg-sage-100 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-5 w-16 bg-sage-100 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-5 w-12 bg-sage-100 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-5 w-24 bg-sage-100 rounded animate-pulse" />
                                        </td>
                                        <td className="p-4">
                                            <div className="h-8 w-24 bg-sage-100 rounded animate-pulse ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-sage-500">
                    No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-sage-50 hover:bg-sage-25">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={user.displayName || user.username}
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {user.displayName || user.username}
                                                    </p>
                                                    <p className="text-sm text-sage-500">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sage-700">{user.email}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {user.isAdmin && <Badge variant="primary">Admin</Badge>}
                                                {user.isDisabled ? (
                                                    <Badge variant="danger">Disabled</Badge>
                                                ) : (
                                                    <Badge variant="success">Active</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sage-700">{user._count.entries}</td>
                                        <td className="p-4 text-sage-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(user)}
                                                >
                          Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openPasswordModal(user)}
                                                >
                          Reset Password
                                                </Button>
                                                <Button
                                                    variant={user.isDisabled ? "outline" : "ghost"}
                                                    size="sm"
                                                    onClick={() => toggleUserStatus(user)}
                                                >
                                                    {user.isDisabled ? "Enable" : "Disable"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-sage-100">
                        <p className="text-sm text-sage-500">
              Page {page} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit User: ${selectedUser?.username}`}
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Display Name"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    />
                    <Input
                        label="Username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                    <Input
                        label="Yearly Goal"
                        type="number"
                        value={editForm.yearlyGoal}
                        onChange={(e) => setEditForm({ ...editForm, yearlyGoal: e.target.value })}
                    />
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.isAdmin}
                                onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                                className="w-4 h-4 rounded border-sage-300"
                            />
                            <span className="text-sm text-foreground">Admin</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={editForm.isDisabled}
                                onChange={(e) => setEditForm({ ...editForm, isDisabled: e.target.checked })}
                                className="w-4 h-4 rounded border-sage-300"
                            />
                            <span className="text-sm text-foreground">Disabled</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
                        </Button>
                        <Button onClick={handleSaveUser} isLoading={isSaving}>
              Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                title={`Reset Password: ${selectedUser?.username}`}
                size="sm"
            >
                <div className="space-y-4">
                    <Input
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        helperText="Min 8 chars, uppercase, lowercase, and number required"
                    />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleResetPassword}
                            isLoading={isResettingPassword}
                            disabled={!newPassword}
                        >
              Reset Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
