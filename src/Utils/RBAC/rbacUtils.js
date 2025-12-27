/**
 * RBAC Utility Functions - Main Export File
 * Re-exports all RBAC functionality from organized modules
 * 
 * Modules:
 * - rbacConstants: Constants and types
 * - rbacCore: Core access checking functions
 * - rbacUser: User management operations
 * - rbacAccess: Access control operations
 * - rbacRoles: Role management operations
 * - rbacHelpers: Helper functions
 */

// ============= Constants =============
export { 
  RESOURCE_TYPES, 
  OPERATIONS, 
  ALL_OPERATIONS, 
  PREDEFINED_ROLES 
} from './rbacConstants';

// ============= Core Functions =============
export { 
  normalizeOperation,
  getCurrentUserRole,
  getCurrentUser,
  isSuperAdmin,
  hasAnyAccess,
  hasAccess
} from './rbacCore';

// ============= User Management =============
export { 
  createAdminUser,
  getAllAdminUsers,
  getUser,
  updateUserRoles,
  deleteAdminUser,
  updateUserPassword,
  updateUserInfo
} from './rbacUser';

// ============= Access Control =============
export { 
  grantUserAccess,
  revokeUserAccess,
  clearResourceAccess,
  updateUserInBasicInfo
} from './rbacAccess';

// ============= Role Management =============
export { 
  createRole,
  getAllRoles,
  getRole,
  updateRolePermissions,
  deleteRole,
  checkRoleAccess,
  assignUserRoles,
  removeUserRole
} from './rbacRoles';

// ============= Helper Functions =============
export { 
  getPermissionsSummary,
  getUserEffectivePermissions,
  getUserPermissionsSummary
} from './rbacHelpers';
