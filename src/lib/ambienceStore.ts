"use client";

import { create } from "zustand";
import type { FieldRecording } from "@/lib/aporee";

/**
 * The recording currently playing. Kept apart from the session store because the
 * player lives in SoundEffects while the credit line renders on the arrival card,
 * and the two never share a parent.
 */
type AmbienceStore = {
  recording: FieldRecording | null;
  setRecording: (recording: FieldRecording | null) => void;
};

export const useAmbienceStore = create<AmbienceStore>((set) => ({
  recording: null,
  setRecording: (recording) => set({ recording }),
}));
