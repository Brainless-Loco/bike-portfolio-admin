/**
 * RBAC Role Management Functions
 * Create, read, update, and delete roles and their permissions
 */

import { db } from "../Firebase/Firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, getDocs } from "firebase/firestore";

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
    const querySnapshot = await getDocs(query(rolesRef));
    
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

/**
 * Assign predefined roles to a user
 */
export const assignUserRoles = async (userId, roleIds = []) => {
  try {
    let validatedRoles = roleIds;
    
    if (roleIds.length > 0) {
      for (const roleId of roleIds) {
        const roleDoc = await getDoc(doc(db, "roles", roleId));
        if (!roleDoc.exists()) {
          throw new Error(`Role '${roleId}' does not exist`);
        }
      }
    }

    // Update user in BasicInfo/auth (source of truth for users)
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    
    if (authDocSnap.exists()) {
      const accounts = authDocSnap.data().accounts || [];
      const userIndex = accounts.findIndex(acc => acc.id === userId);
      
      if (userIndex !== -1) {
        accounts[userIndex].roles = validatedRoles;
        accounts[userIndex].updatedAt = new Date().toISOString();
        
        await updateDoc(authDocRef, { accounts });
        
        return { success: true, rolesAssigned: validatedRoles };
      } else {
        throw new Error(`User '${userId}' not found`);
      }
    } else {
      throw new Error("Auth configuration not found");
    }
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
    const { getUser } = require('./rbacUser');
    const user = await getUser(userId);
    const updatedRoles = (user.roles || []).filter(r => r !== roleId);
    
    return assignUserRoles(userId, updatedRoles);
  } catch (error) {
    console.error(`Error removing role from user ${userId}:`, error);
    throw new Error(error.message || "Failed to remove role");
  }
};
