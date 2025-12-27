/**
 * RBAC Access Control Functions
 * Grant, revoke, and manage user access to resources
 */

import { db } from "../Firebase/Firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

/**
 * Grant access to user for specific resource
 * @param {string} userId - User ID
 * @param {string} resourceType - Resource type
 * @param {string[]} operations - Operations to grant
 * @param {string|string[]} resourceIds - Resource ID(s) or "*"
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
    
    const ids = Array.isArray(resourceIds) ? resourceIds : [resourceIds];
    
    ids.forEach(resourceId => {
      if (!accessControl[resourceType][resourceId]) {
        accessControl[resourceType][resourceId] = [];
      }
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
      return;
    }
    
    const ids = Array.isArray(resourceIds) ? resourceIds : [resourceIds];
    
    ids.forEach(resourceId => {
      if (accessControl[resourceType][resourceId]) {
        operations.forEach(op => {
          const index = accessControl[resourceType][resourceId].indexOf(op);
          if (index !== -1) {
            accessControl[resourceType][resourceId].splice(index, 1);
          }
        });
        
        if (accessControl[resourceType][resourceId].length === 0) {
          delete accessControl[resourceType][resourceId];
        }
      }
    });
    
    if (Object.keys(accessControl[resourceType]).length === 0) {
      delete accessControl[resourceType];
    }
    
    await updateDoc(userRef, { 
      accessControl,
      updatedAt: new Date().toISOString()
    });
    
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
      
      await updateUserInBasicInfo(userId, { accessControl });
    }
  } catch (error) {
    console.error("Error clearing access:", error);
    throw error;
  }
};

/**
 * Helper to update user in BasicInfo accounts array
 */
export const updateUserInBasicInfo = async (userId, updates) => {
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
