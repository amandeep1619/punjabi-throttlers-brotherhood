import { create } from "zustand";

export type Toast = {
  id: number;
  message: string;
  variant: "success" | "error" | "info";
};

type UiState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toasts: Toast[];
  showToast: (message: string, variant?: Toast["variant"]) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  toasts: [],
  showToast: (message, variant = "info") => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
