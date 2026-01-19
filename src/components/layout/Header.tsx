"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "../notifications/NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-sage-900/80 backdrop-blur-md border-b border-sage-100 dark:border-sage-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-sage-500/25 transition-all duration-200">
              <span className="text-white font-bold text-lg font-display">P</span>
            </div>
            <span className="font-display font-semibold text-xl text-foreground hidden sm:block">
              Pushup Tracker
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user && (
              <>
                <NotificationBell />

                <div className="hidden sm:flex items-center gap-3 ml-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm text-sage-700 dark:text-sage-300 hover:text-sage-900 dark:hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-800 flex items-center justify-center">
                      <span className="text-sage-600 dark:text-sage-300 font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{user.displayName || user.username}</span>
                  </Link>

                  <button
                    onClick={() => logout()}
                    className="text-sm text-sage-500 hover:text-coral-500 dark:text-sage-400 dark:hover:text-coral-400 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
