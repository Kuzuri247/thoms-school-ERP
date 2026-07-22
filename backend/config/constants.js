// backend/config/constants.js
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CASHIER: 'cashier',
  TEACHER: 'teacher',
  BUSSTAFF: 'busstaff',
  STUDENT: 'student',
};

const FEE_STATUS = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  WAIVED: 'WAIVED',
};

const HOMEWORK_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed',
  LATE: 'late',
  NOT_DONE: 'not_done',
};

const EXAM_TYPE = {
  INTERNAL_1: 'internal_1',
  INTERNAL_2: 'internal_2',
  SEMESTER: 'semester',
};

module.exports = { ROLES, FEE_STATUS, HOMEWORK_STATUS, EXAM_TYPE };