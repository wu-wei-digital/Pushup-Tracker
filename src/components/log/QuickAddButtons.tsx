"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { PomodoroModal } from "@/components/pomodoro";
import type { EntrySource } from "@/types";

interface QuickAddButtonsProps {
  onAdd: (amount: number, note?: string, source?: EntrySource) => Promise<{ success: boolean; pointsEarned?: number }>;
}

const QUICK_AMOUNTS = [1, 5, 10, 20, 50];

export default function QuickAddButtons({ onAdd }: QuickAddButtonsProps) {
    const [customAmount, setCustomAmount] = useState("");
    const [isAdding, setIsAdding] = useState<number | null>(null);
    const [showPomodoroModal, setShowPomodoroModal] = useState(false);
    const { showToast } = useToast();

    const handlePomodoroComplete = async (totalPushups: number) => {
        const result = await onAdd(totalPushups, "Pomodoro session", "pomodoro");
        if (result.success) {
            showToast("success", `Added ${totalPushups} pushups from Pomodoro! +${result.pointsEarned} XP`);
        } else {
            showToast("error", "Failed to save pomodoro pushups");
            throw new Error("Failed to save");
        }
    };

    const handleQuickAdd = async (amount: number) => {
        setIsAdding(amount);
        const result = await onAdd(amount);
        if (result.success) {
            showToast("success", `Added ${amount} pushup${amount > 1 ? "s" : ""}! +${result.pointsEarned} XP`);
        } else {
            showToast("error", "Failed to add pushups");
        }
        setIsAdding(null);
    };

    const handleCustomAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseInt(customAmount);
        if (isNaN(amount) || amount < 1) {
            showToast("error", "Please enter a valid number");
            return;
        }
        if (amount > 10000) {
            showToast("error", "Maximum is 10,000 pushups");
            return;
        }

        setIsAdding(-1);
        const result = await onAdd(amount);
        if (result.success) {
            showToast("success", `Added ${amount} pushups! +${result.pointsEarned} XP`);
            setCustomAmount("");
        } else {
            showToast("error", "Failed to add pushups");
        }
        setIsAdding(null);
    };

    return (
        <div className="space-y-4">
            {/* Quick add buttons */}
            <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                    <button
                        key={amount}
                        onClick={() => handleQuickAdd(amount)}
                        disabled={isAdding !== null}
                        className="quick-add-btn flex-1 min-w-[60px] py-4 px-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isAdding === amount ? (
                            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            `+${amount}`
                        )}
                    </button>
                ))}
            </div>

            {/* Custom amount input */}
            <form onSubmit={handleCustomAdd} className="flex gap-2">
                <Input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount"
                    min="1"
                    max="10000"
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={isAdding !== null || !customAmount}
                    isLoading={isAdding === -1}
                >
          Add
                </Button>
            </form>

            {/* Pomodoro Mode Button */}
            <button
                onClick={() => setShowPomodoroModal(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-medium shadow-md hover:shadow-lg hover:shadow-coral-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <span>🍅</span>
                <span>Start Pomodoro Mode</span>
            </button>

            {/* Pomodoro Modal */}
            <PomodoroModal
                isOpen={showPomodoroModal}
                onClose={() => setShowPomodoroModal(false)}
                onComplete={handlePomodoroComplete}
            />
        </div>
    );
}
