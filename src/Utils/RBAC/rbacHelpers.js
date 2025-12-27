/**
 * RBAC Helper Functions
 * Utility functions for permissions, summaries, and data fetching
 */

import { db } from "../Firebase/Firebase";
import { doc, getDoc } from "firebase/firestore";
import { getCurrentUser } from './rbacCore';

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
    let userId = userIdParam;
    if (!userId) {
      const currentUser = getCurrentUser();
      userId = currentUser?.id;
    }
    
    if (!userId) return {};
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return {};
    }
    
    const freshUser = userSnap.data();
    const effectivePerms = { ...freshUser.accessControl };
    
    if (freshUser.roles && Array.isArray(freshUser.roles)) {
      for (const roleId of freshUser.roles) {
        try {
          const { getRole } = require('./rbacRoles');
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
 * Get user's permission string for display
 */
export const getUserPermissionsSummary = async (userId) => {
  try {
    const { getUser } = require('./rbacUser');
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
