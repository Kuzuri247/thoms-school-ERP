/**
 * Centralized Role Utility Module
 * Canonical roles from backend/config/constants.js
 */

export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CASHIER: 'cashier',
  TEACHER: 'teacher',
  BUSSTAFF: 'busstaff',
  STUDENT: 'student',
});

// Explicit mapping for legacy aliases
const LEGACY_ROLE_MAP = Object.freeze({
  fee_collector: ROLES.CASHIER,
  fees_collector: ROLES.CASHIER,
  accountant: ROLES.CASHIER,
  bus_staff: ROLES.BUSSTAFF,
});

/**
 * Normalizes any role input string to a canonical backend role constant.
 * Returns null if the role is unknown or invalid (Fail Closed).
 * @param {string} [role]
 * @returns {string|null}
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== 'string') return null;
  const cleaned = role.trim().toLowerCase().replace(/\s+/g, '_');

  // Check if already canonical
  if (Object.values(ROLES).includes(cleaned)) {
    return cleaned;
  }

  // Check legacy map
  if (LEGACY_ROLE_MAP[cleaned]) {
    return LEGACY_ROLE_MAP[cleaned];
  }

  // Fail closed for unknown/removed roles (e.g. principal, vp, receptionist, hacker)
  return null;
};

/**
 * Super Admin ONLY check. Strictly super_admin role.
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isSuperAdmin = (user) => {
  return normalizeRole(user?.role) === ROLES.SUPER_ADMIN;
};

/**
 * Admin or Super Admin check (Admin hierarchy level).
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  const norm = normalizeRole(user?.role);
  return norm === ROLES.ADMIN || norm === ROLES.SUPER_ADMIN;
};

/**
 * Cashier check.
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isCashier = (user) => {
  return normalizeRole(user?.role) === ROLES.CASHIER;
};

/**
 * Teacher check.
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isTeacher = (user) => {
  return normalizeRole(user?.role) === ROLES.TEACHER;
};

/**
 * Bus Staff check.
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isBusStaff = (user) => {
  return normalizeRole(user?.role) === ROLES.BUSSTAFF;
};

/**
 * Student check.
 * @param {Object} [user]
 * @returns {boolean}
 */
export const isStudent = (user) => {
  return normalizeRole(user?.role) === ROLES.STUDENT;
};

/**
 * Fail-closed RBAC check for allowed roles.
 * @param {Object} [user]
 * @param {Array<string>} [allowedRoles]
 * @returns {boolean}
 */
export const hasRole = (user, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return false;
  if (allowedRoles.includes('*')) {
    return normalizeRole(user?.role) !== null;
  }

  const userRole = normalizeRole(user?.role);
  if (!userRole) return false;

  return allowedRoles.some((allowed) => {
    const normAllowed = normalizeRole(allowed) || allowed.trim().toLowerCase().replace(/\s+/g, '_');
    if (normAllowed === ROLES.ADMIN && isAdmin(user)) {
      return true;
    }
    return normAllowed === userRole;
  });
};

/**
 * Default home path per role for login/redirects.
 * @param {Object} [user]
 * @returns {string}
 */
export const getRoleHomePath = (user) => {
  const role = normalizeRole(user?.role);
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/dashboard';
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.TEACHER:
      return '/teacher/dashboard';
    case ROLES.STUDENT:
      return '/student/dashboard';
    case ROLES.CASHIER:
      return '/finance/dashboard';
    case ROLES.BUSSTAFF:
      return '/dashboard';
    default:
      return '/unauthorized';
  }
};

/**
 * UI Role Badge styling class string based on canonical role.
 * @param {string} [role]
 * @returns {string}
 */
export const getRoleBadgeStyle = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case ROLES.SUPER_ADMIN:
      return 'bg-red-50 text-red-700 border-red-200';
    case ROLES.ADMIN:
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case ROLES.TEACHER:
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case ROLES.STUDENT:
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    case ROLES.CASHIER:
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case ROLES.BUSSTAFF:
      return 'bg-sky-50 text-sky-700 border-sky-200/80';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
