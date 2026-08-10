import { create } from "zustand";
import api from "../api/axios";

/**
 * ES6 Zustand Global Store for Monthly Student Remarks
 */
let sectionRequestSeq = 0;

export const useRemarksStore = create((set, get) => ({
  remarksByStudent: {}, // cacheKey -> Array of remarks
  sectionRemarks: [], // Current loaded section remarks list
  loading: false,
  error: null,
  successMessage: null,

  // Fetch monthly remarks history for a student (for UserProfileView)
  fetchStudentRemarks: async (studentId, options = {}) => {
    if (!studentId) return [];
    set({ loading: true, error: null });
    const cacheKey = options.by === "user_id" ? `user:${studentId}` : `student:${studentId}`;
    try {
      const url = options.by === "user_id" ? `/remarks/student/${studentId}?by=user_id` : `/remarks/student/${studentId}`;
      const { data } = await api.get(url);
      const list = data?.data || [];
      set((state) => ({
        remarksByStudent: {
          ...state.remarksByStudent,
          [cacheKey]: list,
        },
        loading: false,
      }));
      return list;
    } catch (err) {
      console.error("Failed to fetch student remarks:", err);
      set({
        error: err.response?.data?.message || "Failed to load student remarks",
        loading: false,
      });
      return [];
    }
  },

  // Fetch section remarks roster for a month/year (for TeacherDashboard)
  fetchSectionRemarks: async (sectionId, month, year) => {
    if (!sectionId) return { success: false, error: "Section ID is required", data: [] };
    const currentSeq = ++sectionRequestSeq;
    set({ sectionRemarks: [], loading: true, error: null });
    try {
      const { data } = await api.get(`/remarks/section/${sectionId}`, {
        params: { month, year },
      });
      if (currentSeq !== sectionRequestSeq) {
        return { success: false, cancelled: true };
      }
      const roster = data?.data || [];
      set({ sectionRemarks: roster, loading: false });
      return { success: true, data: roster };
    } catch (err) {
      console.error("Failed to fetch section remarks:", err);
      const msg = err.response?.data?.message || "Failed to load section remarks";
      if (currentSeq === sectionRequestSeq) {
        set({
          error: msg,
          loading: false,
        });
      }
      return { success: false, error: msg, data: [] };
    }
  },

  // Save batch remarks for class students
  saveBatchRemarks: async ({ section_id, month, year, remarks }) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const { data } = await api.post("/remarks/batch", {
        section_id,
        month,
        year,
        remarks,
      });
      // Refresh section remarks roster
      const refreshRes = await get().fetchSectionRemarks(section_id, month, year);
      if (refreshRes && refreshRes.success === false && !refreshRes.cancelled) {
        const msg = refreshRes.error || "Failed to refresh section remarks.";
        set({ error: msg, successMessage: null, loading: false });
        return { success: false, error: msg };
      }
      const msg = data?.message || "Monthly remarks saved successfully!";
      set({
        successMessage: msg,
        loading: false,
      });
      return { success: true };
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to save monthly remarks.";
      set({ error: msg, successMessage: null, loading: false });
      return { success: false, error: msg };
    }
  },

  clearStatus: () => set({ error: null, successMessage: null }),
}));

export default useRemarksStore;
