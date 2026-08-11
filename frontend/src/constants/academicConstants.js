/**
 * Academic & ERP Shared Constants
 * Centralized global definitions for CBSE subjects, roles, fee statuses, departments, and designations.
 */

export const CBSE_SUBJECTS_LIST = [
  "Mathematics",
  "Science",
  "Social Science",
  "English Language & Literature",
  "Hindi Course-A",
  "Hindi Course-B",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "Political Science",
  "Economics",
  "Business Studies",
  "Accountancy",
  "Computer Science",
  "Information Technology",
  "Psychology",
  "Sociology",
  "Physical Education",
  "Fine Arts",
  "Music",
  "Sanskrit",
  "Environmental Studies (EVS)",
];

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  CASHIER: "cashier",
  TEACHER: "teacher",
  STUDENT: "student",
};

export const FEE_STATUSES = {
  PENDING: "PENDING",
  PARTIAL: "PARTIAL",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  WAIVED: "WAIVED",
};

export const DEPARTMENTS = [
  "Academics",
  "Administration",
  "Accounts & Finance",
  "IT & Systems",
  "Facilities & Operations",
];

export const DESIGNATIONS = [
  "Senior Administrator",
  "Academic Teacher",
  "Head of Department",
  "Accounts Executive",
  "System Administrator",
  "Transport Coordinator",
];

export const BUS_DISTANCE_SLABS = [
  { slab: "0-2 KM", quarterlyFee: 3825 },
  { slab: "2-4 KM", quarterlyFee: 3975 },
  { slab: "4-6 KM", quarterlyFee: 4125 },
  { slab: "6-8 KM", quarterlyFee: 4275 },
  { slab: "8-10 KM", quarterlyFee: 4425 },
  { slab: "10-12 KM", quarterlyFee: 4575 },
  { slab: "12-14 KM", quarterlyFee: 4725 },
  { slab: "14-16 KM", quarterlyFee: 4875 },
  { slab: "16-18 KM", quarterlyFee: 5025 },
  { slab: "18-20 KM", quarterlyFee: 5175 },
];

export function getBusFeeForSlab(slab) {
  const found = BUS_DISTANCE_SLABS.find((s) => s.slab === slab);
  return found ? found.quarterlyFee : 3825;
}

