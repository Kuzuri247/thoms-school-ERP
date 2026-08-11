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
