import { create } from "zustand";

export const JOIN_STEPS = ["Personal Information", "Emergency Contact", "Motorcycle", "Riding Experience"] as const;

type JoinWizardState = {
  step: number;
  furthestStep: number;
  goTo: (step: number) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
};

// Field values live in a single react-hook-form instance in the /join page —
// this store only tracks which step is showing, so the step indicator, the
// form, and the submit button (separate components) can stay in sync without
// prop-drilling the current step through every section component.
export const useJoinWizardStore = create<JoinWizardState>((set, get) => ({
  step: 0,
  furthestStep: 0,
  goTo: (step) => set({ step, furthestStep: Math.max(step, get().furthestStep) }),
  next: () => {
    const step = Math.min(get().step + 1, JOIN_STEPS.length - 1);
    set({ step, furthestStep: Math.max(step, get().furthestStep) });
  },
  back: () => set({ step: Math.max(get().step - 1, 0) }),
  reset: () => set({ step: 0, furthestStep: 0 }),
}));
