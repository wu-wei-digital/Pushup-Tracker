"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, Button } from "@/components/ui";

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasAutoMarkedRef = useRef(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);

                // Auto-mark all as read after a brief moment (so user sees the unread state)
                if (!hasAutoMarkedRef.current && data.notifications.some((n: Notification) => !n.isRead)) {
                    hasAutoMarkedRef.current = true;
                    setTimeout(async () => {
                        await fetch("/api/notifications/read-all", { method: "PATCH" });
                        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                    }, 1500);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
        case "poke": return "👆";
        case "reaction": return "💪";
        case "comment": return "💬";
        case "achievement": return "🏆";
        case "friend_request": return "👋";
        case "friend_accepted": return "🤝";
        default: return "🔔";
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-sage-600 dark:text-sage-400 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <div className="animate-pulse h-16" />
                        </Card>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <Card>
                    <div className="text-center py-8 text-sage-500 dark:text-sage-400">
                        <div className="text-4xl mb-2">🔔</div>
                        <p>No notifications yet</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-colors ${
                                !notification.isRead ? "bg-sage-50 dark:bg-sage-800/50" : ""
                            }`}
                            padding="sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl">{getIcon(notification.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-medium text-foreground">
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-sage-500 dark:text-sage-400 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {notification.content && (
                                        <p className="text-sm text-sage-600 dark:text-sage-400 mt-1">
                                            {notification.content}
                                        </p>
                                    )}
                                    {notification.link && (
                                        <div className="mt-2">
                                            <Link href={notification.link}>
                                                <Button variant="ghost" size="sm">
                          View
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
