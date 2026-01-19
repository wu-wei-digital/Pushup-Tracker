"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button, Input, Modal } from "@/components/ui";
import { EntryItemSkeleton } from "@/components/ui/Skeleton";
import type { PushupEntry } from "@/types";

interface TodayEntriesProps {
  entries: PushupEntry[];
  isLoading: boolean;
  onUpdate: (id: number, data: { amount?: number; note?: string | null }) => Promise<{ success: boolean }>;
  onDelete: (id: number) => Promise<{ success: boolean }>;
}

export default function TodayEntries({
  entries,
  isLoading,
  onUpdate,
  onDelete,
}: TodayEntriesProps) {
  const [editingEntry, setEditingEntry] = useState<PushupEntry | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleEdit = (entry: PushupEntry) => {
    setEditingEntry(entry);
    setEditAmount(entry.amount.toString());
    setEditNote(entry.note || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    const amount = parseInt(editAmount);
    if (isNaN(amount) || amount < 1) return;

    setIsSubmitting(true);
    const result = await onUpdate(editingEntry.id, {
      amount,
      note: editNote || null,
    });

    if (result.success) {
      setEditingEntry(null);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    await onDelete(id);
    setDeleteConfirm(null);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <EntryItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No pushups logged today yet.</p>
        <p className="text-sm mt-1">Use the buttons above to start!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {entry.amount}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {entry.amount} pushup{entry.amount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(entry.createdAt), "h:mm a")}
                  {entry.note && <span className="ml-2">- {entry.note}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(entry)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setDeleteConfirm(entry.id)}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit Entry"
      >
        <div className="space-y-4">
          <Input
            label="Amount"
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            min="1"
            max="10000"
          />
          <Input
            label="Note (optional)"
            type="text"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder="Add a note..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Entry"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete this entry? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            isLoading={isSubmitting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
