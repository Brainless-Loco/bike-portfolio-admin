/**
 * RBAC Core Functions
 * Core access checking and validation logic
 */

import { PREDEFINED_ROLES, OPERATIONS } from './rbacConstants';

/**
 * Normalize operation string to OPERATIONS enum
 * Handles both full names (create, read, update, delete) and short forms (C, R, U, D)
 */
export const normalizeOperation = (operation) => {
  if (!operation) return null;
  
  const op = operation.toLowerCase();
  switch (op) {
    case 'create':
    case 'c':
      return OPERATIONS.CREATE;
    case 'read':
    case 'r':
      return OPERATIONS.READ;
    case 'update':
    case 'u':
      return OPERATIONS.UPDATE;
    case 'delete':
    case 'd':
      return OPERATIONS.DELETE;
    default:
      return operation;
  }
};

/**
 * Get user's permission object from localStorage
 */
export const getCurrentUserRole = () => {
  const adminLogin = localStorage.getItem("adminLogin");
  if (adminLogin) {
    const user = JSON.parse(adminLogin);
    return user.role || null;
  }
  return null;
};

/**
 * Get user's full data from localStorage
 */
export const getCurrentUser = () => {
  const adminLogin = localStorage.getItem("adminLogin");
  if (adminLogin) {
    return JSON.parse(adminLogin);
  }
  return null;
};

/**
 * Check if current user is superadmin
 * Users with no defined role in RBAC are treated as superadmin (backward compatibility)
 * Only explicitly assigned VIEWER or other roles restrict access
 */
export const isSuperAdmin = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Explicitly set as superadmin
  if (user.role === PREDEFINED_ROLES.SUPER_ADMIN) return true;
  
  // If no role is defined, treat as superadmin (backward compatibility for pre-RBAC users)
  if (!user.role) return true;
  
  return false;
};

/**
 * Check if user has ANY access to a resource type (for dashboard section visibility)
 * @param {string} resourceType - Type of resource
 * @param {string} operation - Operation type
 * @returns {boolean} - True if user has access to ANY resource of this type
 */
export const hasAnyAccess = (resourceType, operation) => {
  const user = getCurrentUser();
  
  if (!user) return false;
  if (user.role === PREDEFINED_ROLES.SUPER_ADMIN) return true;
  
  const normalizedOp = normalizeOperation(operation);
  const checkOps = [normalizedOp];
  
  if (normalizedOp === OPERATIONS.READ) {
    checkOps.push(OPERATIONS.UPDATE, OPERATIONS.DELETE);
  }
  
  const hasOperation = (ops) => {
    if (!ops) return false;
    if (Array.isArray(ops)) {
      return checkOps.some(op => ops.includes(op));
    } else if (typeof ops === 'string') {
      return checkOps.includes(ops);
    }
    return false;
  };
  
  if (user.effectivePermissions && user.effectivePermissions[resourceType]) {
    const resourceAccess = user.effectivePermissions[resourceType];
    for (const [resourceId, operations] of Object.entries(resourceAccess)) {
      if (hasOperation(operations)) return true;
    }
  }
  
  if (user.accessControl && user.accessControl[resourceType]) {
    const resourceAccess = user.accessControl[resourceType];
    for (const [resourceId, operations] of Object.entries(resourceAccess)) {
      if (hasOperation(operations)) return true;
    }
  }
  
  return false;
};

/**
 * Check if user has specific access to resource
 * @param {string} resourceType - Type of resource
 * @param {string} operation - Operation type
 * @param {string} resourceId - Specific resource ID or "*"
 * @returns {boolean}
 */
export const hasAccess = (resourceType, operation, resourceId = "*") => {
  const user = getCurrentUser();
  
  if (!user) return false;
  if (user.role === PREDEFINED_ROLES.SUPER_ADMIN) return true;
  
  const normalizedOp = normalizeOperation(operation);
  const checkOps = [normalizedOp];
  
  if (normalizedOp === OPERATIONS.READ) {
    checkOps.push(OPERATIONS.UPDATE, OPERATIONS.DELETE);
  }
  
  if (user.effectivePermissions && user.effectivePermissions[resourceType]) {
    const resourceAccess = user.effectivePermissions[resourceType];
    
    if (resourceAccess["*"] && checkOps.some(op => resourceAccess["*"].includes(op))) {
      return true;
    }
    
    if (resourceId !== "*" && resourceAccess[resourceId] && checkOps.some(op => resourceAccess[resourceId].includes(op))) {
      return true;
    }
  }
  
  if (user.accessControl && user.accessControl[resourceType]) {
    const resourceAccess = user.accessControl[resourceType];
    
    if (resourceAccess["*"] && checkOps.some(op => resourceAccess["*"].includes(op))) {
      return true;
    }
    
    if (resourceId !== "*" && resourceAccess[resourceId] && checkOps.some(op => resourceAccess[resourceId].includes(op))) {
      return true;
    }
  }
  
  return false;
};
