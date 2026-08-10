import { create } from "zustand";
import api from "../api/axios";

/**
 * ES6 Zustand Global Store for Academic Sessions, Classes & Grade Advancement
 */
export const useAcademicsStore = create((set, get) => ({
  classes: [],
  activeSession: null,
  promoting: false,
  promotionResult: null,
  error: null,

  // Execute Annual April 1st Grade Advancement (Promotion)
  executeAnnualPromotion: async () => {
    if (get().promoting) return;
    set({ promoting: true, error: null, promotionResult: null });
    try {
      const { data } = await api.post("/admin/promote-students");
      if (data?.success) {
        set({
          promotionResult: data?.data || data,
          promoting: false,
        });
        return { success: true, message: data?.message };
      } else {
        set({ error: data?.message || "Promotion failed", promoting: false });
        return { success: false, error: data?.message };
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to execute grade advancement.";
      set({ error: msg, promoting: false });
      return { success: false, error: msg };
    }
  },

  clearPromotionStatus: () => set({ error: null, promotionResult: null }),
}));

export default useAcademicsStore;
