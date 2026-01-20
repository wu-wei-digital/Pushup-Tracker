"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string | null;
}

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const previousCountRef = useRef(0);
    const seenNotificationIds = useRef<Set<number>>(new Set());
    const { showToast } = useToast();

    const getNotificationIcon = (type: string) => {
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

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications/count");
            if (res.ok) {
                const data = await res.json();
                const newCount = data.count || 0;

                // If count increased, fetch the new notifications and show toasts
                if (newCount > previousCountRef.current) {
                    const notifRes = await fetch("/api/notifications?unreadOnly=true&pageSize=5");
                    if (notifRes.ok) {
                        const notifData = await notifRes.json();
                        const notifications: Notification[] = notifData.notifications || [];

                        // Show toast for each new notification we haven't seen
                        for (const notif of notifications) {
                            if (!seenNotificationIds.current.has(notif.id)) {
                                seenNotificationIds.current.add(notif.id);
                                const icon = getNotificationIcon(notif.type);
                                showToast("info", `${icon} ${notif.title}${notif.content ? `: ${notif.content}` : ""}`);
                            }
                        }
                    }
                }

                previousCountRef.current = newCount;
                setUnreadCount(newCount);
            }
        } catch {
            // Ignore errors
        }
    }, [showToast]);

    useEffect(() => {
    // Initial fetch
        fetchNotifications();

        // Poll every 10 seconds for better responsiveness
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return (
        <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-sage-500 hover:bg-sage-100 dark:text-sage-400 dark:hover:bg-sage-800 transition-colors"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-coral-500 rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </Link>
    );
}
