import { db } from "../Firebase/Firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, getDocs } from "firebase/firestore";

/**
 * RBAC Utility Functions
 * Handles all role-based access control operations
 */

// ============= RESOURCE TYPES =============
export const RESOURCE_TYPES = {
  RESEARCHERS: "researchers",
  PUBLICATIONS: "publications",
  PROJECTS: "projects",
  TEACHINGS: "teachings",
  ACTIVITIES: "activities",
  RESEARCHES: "researches",
  PARTNERS: "partners",
  DATASETS: "datasets",
  VACANCIES: "vacancies",
  APPLICATIONS: "applications",
  BASIC_INFO: "basicInfo",
  USERS: "users"
};

// ============= OPERATIONS =============
export const OPERATIONS = {
  CREATE: "C",
  READ: "R",
  UPDATE: "U",
  DELETE: "D"
};

export const ALL_OPERATIONS = [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.UPDATE, OPERATIONS.DELETE];

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
      return operation; // Return as-is if not recognized
  }
};
export const PREDEFINED_ROLES = {
  SUPER_ADMIN: "superadmin",
  EDITOR: "editor",
  VIEWER: "viewer",
  CONTRIBUTOR: "contributor"
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
 * Also treats pre-RBAC users (no role or no roles in DB) as superadmin for backward compatibility
 */
export const isSuperAdmin = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Explicitly set as superadmin
  if (user.role === PREDEFINED_ROLES.SUPER_ADMIN) return true;
  
  // Backward compatibility: if user has no role assigned, treat as superadmin
  // This handles pre-RBAC system users
  if (!user.role) return true;
  
  return false;
};

/**
 * Check if user has ANY access to a resource type (for dashboard section visibility)
 * Used to determine if a section should be shown
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
  
  // Implicit READ access for UPDATE/DELETE
  if (normalizedOp === OPERATIONS.READ) {
    checkOps.push(OPERATIONS.UPDATE, OPERATIONS.DELETE);
  }
  
  // Helper function to check if operations array/string contains any of the checkOps
  const hasOperation = (ops) => {
    if (!ops) return false;
    if (Array.isArray(ops)) {
      return checkOps.some(op => ops.includes(op));
    } else if (typeof ops === 'string') {
      // If stored as string, check exact match or include
      return checkOps.includes(ops);
    }
    return false;
  };
  
  // Debug logging
  const debug = false; // Set to true to enable detailed logging
  if (debug) {
    console.log(`hasAnyAccess check: resourceType=${resourceType}, operation=${operation}, normalizedOp=${normalizedOp}`);
    console.log(`  effectivePermissions:`, user.effectivePermissions?.[resourceType]);
    console.log(`  accessControl:`, user.accessControl?.[resourceType]);
  }
  
  // Check effective permissions
  if (user.effectivePermissions && user.effectivePermissions[resourceType]) {
    const resourceAccess = user.effectivePermissions[resourceType];
    
    // Check if they have access to any resource (wildcard or specific)
    for (const [resourceId, operations] of Object.entries(resourceAccess)) {
      if (hasOperation(operations)) {
        if (debug) console.log(`  ✓ Found in effectivePermissions[${resourceType}][${resourceId}]`);
        return true;
      }
    }
  }
  
  // Check manual access grants
  if (user.accessControl && user.accessControl[resourceType]) {
    const resourceAccess = user.accessControl[resourceType];
    
    for (const [resourceId, operations] of Object.entries(resourceAccess)) {
      if (hasOperation(operations)) {
        if (debug) console.log(`  ✓ Found in accessControl[${resourceType}][${resourceId}]`);
        return true;
      }
    }
  }
  
  if (debug) console.log(`  ✗ No access found`);
  return false;
};

/**
 * Check if user has specific access to resource
 * Uses effective permissions (cached after Firebase load)
 * Implements implicit READ access when UPDATE or DELETE is granted
 * @param {string} resourceType - Type of resource (e.g., "researchers")
 * @param {string} operation - Operation type (C, R, U, D) or (create, read, update, delete)
 * @param {string} resourceId - Specific resource ID or "*" for all
 * @returns {boolean}
 */
export const hasAccess = (resourceType, operation, resourceId = "*") => {
  const user = getCurrentUser();
  
  if (!user) return false;
  if (user.role === PREDEFINED_ROLES.SUPER_ADMIN) return true;
  
  // Normalize operation string
  const normalizedOp = normalizeOperation(operation);
  
  // Implicit READ access: if user has UPDATE or DELETE, they can READ
  const checkOps = [normalizedOp];
  if (normalizedOp === OPERATIONS.READ) {
    // When checking for READ, also accept if they have UPDATE or DELETE
    checkOps.push(OPERATIONS.UPDATE, OPERATIONS.DELETE);
  }
  
  // Use cached effective permissions (these are computed and cached in localStorage)
  if (user.effectivePermissions && user.effectivePermissions[resourceType]) {
    const resourceAccess = user.effectivePermissions[resourceType];
    
    // Check if all resources are granted (*)
    if (resourceAccess["*"]) {
      if (checkOps.some(op => resourceAccess["*"].includes(op))) {
        return true;
      }
    }
    
    // Check specific resource
    if (resourceId !== "*" && resourceAccess[resourceId]) {
      if (checkOps.some(op => resourceAccess[resourceId].includes(op))) {
        return true;
      }
    }
  }
  
  // Fallback: check manual access grants (legacy)
  if (user.accessControl && user.accessControl[resourceType]) {
    const resourceAccess = user.accessControl[resourceType];
    
    // Check if all resources are granted
    if (resourceAccess["*"]) {
      if (checkOps.some(op => resourceAccess["*"].includes(op))) {
        return true;
      }
    }
    
    // Check specific resource
    if (resourceId !== "*" && resourceAccess[resourceId]) {
      if (checkOps.some(op => resourceAccess[resourceId].includes(op))) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Check if specific role has access
 */
export const checkRoleAccess = async (roleId, resourceType, operation, resourceId = "*") => {
  try {
    const roleDoc = await getDoc(doc(db, "roles", roleId));
    if (roleDoc.exists()) {
      const roleData = roleDoc.data();
      if (roleData.permissions && roleData.permissions[resourceType]) {
        const resourcePerms = roleData.permissions[resourceType];
        
        if (resourcePerms["*"] && resourcePerms["*"].includes(operation)) {
          return true;
        }
        
        if (resourceId !== "*" && resourcePerms[resourceId] && resourcePerms[resourceId].includes(operation)) {
          return true;
        }
      }
    }
  } catch (error) {
    console.error("Error checking role access:", error);
  }
  return false;
};

// ============= USER MANAGEMENT =============

/**
 * Create a new admin user
 */
export const createAdminUser = async (userData) => {
  try {
    const { email, username, phone, password, role = PREDEFINED_ROLES.VIEWER, roles = [], accessControl = {} } = userData;
    
    // Get existing users from BasicInfo
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    
    let accounts = authDocSnap.exists() ? authDocSnap.data().accounts || [] : [];
    
    // Check if user already exists
    const userExists = accounts.some(acc => acc.email === email || acc.username === username || acc.phone === phone);
    if (userExists) {
      throw new Error("User already exists");
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      phone,
      password,
      role,
      roles: roles || [],
      accessControl: accessControl || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    accounts.push(newUser);
    
    // Update in BasicInfo (for login)
    await setDoc(authDocRef, { accounts }, { merge: true });
    
    // Also store in users collection for easier querying
    await setDoc(doc(db, "users", newUser.id), newUser);
    
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Get all admin users
 */
export const getAllAdminUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get single user by ID
 */
export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Update user roles
 */
export const updateUserRoles = async (userId, roleIds) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      roles: roleIds,
      updatedAt: new Date().toISOString()
    });
    
    // Also update in BasicInfo accounts
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    if (authDocSnap.exists()) {
      const accounts = authDocSnap.data().accounts || [];
      const userIndex = accounts.findIndex(acc => acc.id === userId);
      if (userIndex !== -1) {
        accounts[userIndex].roles = roleIds;
        await setDoc(authDocRef, { accounts }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
};

/**
 * Delete admin user
 */
export const deleteAdminUser = async (userId) => {
  try {
    // Delete from users collection
    await deleteDoc(doc(db, "users", userId));
    
    // Also remove from BasicInfo accounts
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    if (authDocSnap.exists()) {
      let accounts = authDocSnap.data().accounts || [];
      accounts = accounts.filter(acc => acc.id !== userId);
      await setDoc(authDocRef, { accounts }, { merge: true });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// ============= ACCESS CONTROL MANAGEMENT =============

/**
 * Grant access to user for specific resource
 * @param {string} userId - User ID
 * @param {string} resourceType - Resource type (e.g., "researchers")
 * @param {string[]} operations - Operations to grant (C, R, U, D)
 * @param {string|string[]} resourceIds - Resource ID(s) or "*" for all
 */
export const grantUserAccess = async (userId, resourceType, operations, resourceIds) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const accessControl = userData.accessControl || {};
    
    if (!accessControl[resourceType]) {
      accessControl[resourceType] = {};
    }
    
    // Ensure resourceIds is an array
    const ids = Array.isArray(resourceIds) ? resourceIds : [resourceIds];
    
    // Grant access for each resource ID
    ids.forEach(resourceId => {
      if (!accessControl[resourceType][resourceId]) {
        accessControl[resourceType][resourceId] = [];
      }
      // Add new operations without duplicates
      operations.forEach(op => {
        if (!accessControl[resourceType][resourceId].includes(op)) {
          accessControl[resourceType][resourceId].push(op);
        }
      });
    });
    
    await updateDoc(userRef, { 
      accessControl,
      updatedAt: new Date().toISOString()
    });
    
    // Update in BasicInfo
    await updateUserInBasicInfo(userId, { accessControl });
  } catch (error) {
    console.error("Error granting access:", error);
    throw error;
  }
};

/**
 * Revoke user access for specific resource
 */
export const revokeUserAccess = async (userId, resourceType, operations, resourceIds) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const accessControl = userData.accessControl || {};
    
    if (!accessControl[resourceType]) {
      return; // Nothing to revoke
    }
    
    const ids = Array.isArray(resourceIds) ? resourceIds : [resourceIds];
    
    ids.forEach(resourceId => {
      if (accessControl[resourceType][resourceId]) {
        // Remove operations
        operations.forEach(op => {
          const index = accessControl[resourceType][resourceId].indexOf(op);
          if (index !== -1) {
            accessControl[resourceType][resourceId].splice(index, 1);
          }
        });
        
        // Remove resource ID key if no operations left
        if (accessControl[resourceType][resourceId].length === 0) {
          delete accessControl[resourceType][resourceId];
        }
      }
    });
    
    // Remove resource type if no resources left
    if (Object.keys(accessControl[resourceType]).length === 0) {
      delete accessControl[resourceType];
    }
    
    await updateDoc(userRef, { 
      accessControl,
      updatedAt: new Date().toISOString()
    });
    
    // Update in BasicInfo
    await updateUserInBasicInfo(userId, { accessControl });
  } catch (error) {
    console.error("Error revoking access:", error);
    throw error;
  }
};

/**
 * Clear all access for user on specific resource
 */
export const clearResourceAccess = async (userId, resourceType, resourceId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const accessControl = userData.accessControl || {};
    
    if (accessControl[resourceType] && accessControl[resourceType][resourceId]) {
      delete accessControl[resourceType][resourceId];
      
      if (Object.keys(accessControl[resourceType]).length === 0) {
        delete accessControl[resourceType];
      }
      
      await updateDoc(userRef, { 
        accessControl,
        updatedAt: new Date().toISOString()
      });
      
      // Update in BasicInfo
      await updateUserInBasicInfo(userId, { accessControl });
    }
  } catch (error) {
    console.error("Error clearing access:", error);
    throw error;
  }
};

// ============= ROLE MANAGEMENT =============

/**
 * Create a predefined role with permissions
 */
export const createRole = async (roleData) => {
  try {
    const { name, description = "", permissions = {} } = roleData;
    
    const roleId = `role_${Date.now()}`;
    const newRole = {
      id: roleId,
      name,
      description,
      permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, "roles", roleId), newRole);
    return newRole;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
};

/**
 * Get all roles
 */
export const getAllRoles = async () => {
  try {
    const rolesRef = collection(db, "roles");
    const querySnapshot = await getDocs(rolesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

/**
 * Get single role
 */
export const getRole = async (roleId) => {
  try {
    const roleDoc = await getDoc(doc(db, "roles", roleId));
    if (roleDoc.exists()) {
      return { id: roleDoc.id, ...roleDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching role:", error);
    throw error;
  }
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (roleId, permissions) => {
  try {
    await updateDoc(doc(db, "roles", roleId), {
      permissions,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating role permissions:", error);
    throw error;
  }
};

/**
 * Delete role
 */
export const deleteRole = async (roleId) => {
  try {
    await deleteDoc(doc(db, "roles", roleId));
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
};

// ============= HELPER FUNCTIONS =============

/**
 * Helper to update user in BasicInfo accounts array
 */
const updateUserInBasicInfo = async (userId, updates) => {
  try {
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    if (authDocSnap.exists()) {
      const accounts = authDocSnap.data().accounts || [];
      const userIndex = accounts.findIndex(acc => acc.id === userId);
      if (userIndex !== -1) {
        accounts[userIndex] = { ...accounts[userIndex], ...updates };
        await setDoc(authDocRef, { accounts }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error updating user in BasicInfo:", error);
  }
};

/**
 * Get formatted permissions summary for display
 */
export const getPermissionsSummary = (accessControl) => {
  const summary = {};
  
  Object.entries(accessControl).forEach(([resourceType, resources]) => {
    Object.entries(resources).forEach(([resourceId, operations]) => {
      if (!summary[resourceType]) summary[resourceType] = [];
      summary[resourceType].push({
        resourceId,
        operations: operations.join(",")
      });
    });
  });
  
  return summary;
};

/**
 * Fetch fresh user data from Firestore and compute effective permissions
 * Always fetches from DB, doesn't rely on cached data
 */
export const getUserEffectivePermissions = async (userIdParam) => {
  try {
    // Get user ID from param or current user
    let userId = userIdParam;
    if (!userId) {
      const currentUser = getCurrentUser();
      userId = currentUser?.id;
    }
    
    if (!userId) return {};
    
    // Fetch fresh user data from Firestore
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return {};
    }
    
    const freshUser = userSnap.data();
    const effectivePerms = { ...freshUser.accessControl };
    
    // Merge role-based permissions
    if (freshUser.roles && Array.isArray(freshUser.roles)) {
      for (const roleId of freshUser.roles) {
        try {
          const role = await getRole(roleId);
          if (role && role.permissions) {
            Object.entries(role.permissions).forEach(([resourceType, resources]) => {
              if (!effectivePerms[resourceType]) {
                effectivePerms[resourceType] = {};
              }
              Object.entries(resources).forEach(([resourceId, operations]) => {
                if (!effectivePerms[resourceType][resourceId]) {
                  effectivePerms[resourceType][resourceId] = [];
                }
                operations.forEach(op => {
                  if (!effectivePerms[resourceType][resourceId].includes(op)) {
                    effectivePerms[resourceType][resourceId].push(op);
                  }
                });
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching role ${roleId}:`, error);
        }
      }
    }
    
    // Update localStorage with fresh data
    const updatedUser = {
      ...freshUser,
      effectivePermissions: effectivePerms
    };
    localStorage.setItem("adminLogin", JSON.stringify(updatedUser));
    
    return effectivePerms;
  } catch (error) {
    console.error("Error fetching user effective permissions:", error);
    return {};
  }
};
/**
 * Update user password (SuperAdmin only)
 */
export const updateUserPassword = async (userId, newPassword) => {
  try {
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const userRef = doc(db, "users", userId);
    
    await updateDoc(userRef, {
      password: btoa(newPassword), // Simple base64 encoding - in production, use proper hashing
      passwordUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error(`Error updating password for user ${userId}:`, error);
    throw new Error(error.message || "Failed to update password");
  }
};

/**
 * Assign predefined roles to a user
 */
export const assignUserRoles = async (userId, roleIds = []) => {
  try {
    const userRef = doc(db, "users", userId);
    
    // Validate that roles exist in Firestore
    let validatedRoles = roleIds;
    
    if (roleIds.length > 0) {
      for (const roleId of roleIds) {
        const roleDoc = await getDoc(doc(db, "roles", roleId));
        if (!roleDoc.exists()) {
          throw new Error(`Role '${roleId}' does not exist`);
        }
      }
    }

    await updateDoc(userRef, {
      roles: validatedRoles,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, rolesAssigned: validatedRoles };
  } catch (error) {
    console.error(`Error assigning roles to user ${userId}:`, error);
    throw new Error(error.message || "Failed to assign roles");
  }
};

/**
 * Remove a role from a user
 */
export const removeUserRole = async (userId, roleId) => {
  try {
    const user = await getUser(userId);
    const updatedRoles = (user.roles || []).filter(r => r !== roleId);
    
    return assignUserRoles(userId, updatedRoles);
  } catch (error) {
    console.error(`Error removing role from user ${userId}:`, error);
    throw new Error(error.message || "Failed to remove role");
  }
};

/**
 * Get user's permission string for display
 */
export const getUserPermissionsSummary = async (userId) => {
  try {
    const user = await getUser(userId);
    const summary = {
      roles: user.roles || [],
      manualAccess: user.accessControl ? Object.keys(user.accessControl) : [],
      totalPermissions: 0,
    };

    if (user.accessControl) {
      Object.values(user.accessControl).forEach(items => {
        summary.totalPermissions += Object.keys(items).length;
      });
    }

    return summary;
  } catch (error) {
    console.error(`Error getting permission summary for user ${userId}:`, error);
    return { roles: [], manualAccess: [], totalPermissions: 0 };
  }
};

/**
 * Update user information (SuperAdmin only)
 * Can update: email, username
 */
export const updateUserInfo = async (userId, updateData) => {
  try {
    // Only SuperAdmin can update user info
    if (!isSuperAdmin()) {
      throw new Error("Only SuperAdmins can update user information");
    }

    const { email, username } = updateData;

    if (!email && !username) {
      throw new Error("At least one field (email or username) must be provided");
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }
    }

    // Validate username if provided
    if (username && username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    const userRef = doc(db, "users", userId);
    const updateObj = {};

    if (email) updateObj.email = email;
    if (username) updateObj.username = username;

    // Add updatedAt timestamp
    updateObj.updatedAt = new Date().toISOString();

    await updateDoc(userRef, updateObj);

    // Update localStorage if it's the current user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updateObj };
      localStorage.setItem("adminLogin", JSON.stringify(updatedUser));
    }

    return true;
  } catch (error) {
    console.error(`Error updating user info for ${userId}:`, error);
    throw new Error(error.message || "Failed to update user information");
  }
};