import { useMemo } from 'react';
import useAuthStore from '../../../store/authStore';
import { ROLES } from '../../../types/erp';

export const useFeeAccess = () => {
  const user = useAuthStore((state) => state.user);

  return useMemo(() => {
    if (!user || !user.role) {
      return {
        canViewGlobalFees: false,
        canCollectFees: false,
        canApproveRefunds: false,
        canEditFeeStructure: false,
      };
    }

    const role = String(user.role).toUpperCase().replace(/\s+/g, '_');

    return {
      canViewGlobalFees: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT].includes(role),
      canCollectFees: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.FEES_COLLECTOR].includes(role),
      canApproveRefunds: [ROLES.SUPERADMIN, ROLES.ACCOUNTANT].includes(role),
      canEditFeeStructure: [ROLES.SUPERADMIN, ROLES.ADMIN].includes(role),
    };
  }, [user]);
};
