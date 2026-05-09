"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OfflineDraftKind = "expense" | "progress_update" | "project_note" | "boq_edit";

export type OfflineDraft = {
  id: string;
  kind: OfflineDraftKind;
  label: string;
  payload: Record<string, unknown>;
  createdAt: string;
  status: "queued" | "syncing" | "failed";
  error?: string;
};

type OfflineState = {
  online: boolean;
  drafts: OfflineDraft[];
  setOnline: (online: boolean) => void;
  addDraft: (draft: Omit<OfflineDraft, "id" | "createdAt" | "status">) => void;
  markQueued: (id: string) => void;
  markSyncing: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  removeDraft: (id: string) => void;
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      online: true,
      drafts: [],
      setOnline: (online) => set({ online }),
      addDraft: (draft) =>
        set((state) => ({
          drafts: [
            ...state.drafts,
            {
              ...draft,
              id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
              createdAt: new Date().toISOString(),
              status: "queued"
            }
          ]
        })),
      markQueued: (id) =>
        set((state) => ({
          drafts: state.drafts.map((draft) => (draft.id === id ? { ...draft, status: "queued", error: undefined } : draft))
        })),
      markSyncing: (id) =>
        set((state) => ({
          drafts: state.drafts.map((draft) => (draft.id === id ? { ...draft, status: "syncing", error: undefined } : draft))
        })),
      markFailed: (id, error) =>
        set((state) => ({
          drafts: state.drafts.map((draft) => (draft.id === id ? { ...draft, status: "failed", error } : draft))
        })),
      removeDraft: (id) => set((state) => ({ drafts: state.drafts.filter((draft) => draft.id !== id) }))
    }),
    {
      name: "freelaner-offline-drafts"
    }
  )
);
