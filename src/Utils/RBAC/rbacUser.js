/**
 * RBAC User Management Functions
 * Create, read, update, and delete user operations
 */

import { db } from "../Firebase/Firebase";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { isSuperAdmin } from './rbacCore';

/**
 * Create a new admin user
 */
export const createAdminUser = async (userData) => {
  try {
    const { email, username, phone, password, role = 'viewer', roles = [], accessControl = {} } = userData;
    
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    
    let accounts = authDocSnap.exists() ? authDocSnap.data().accounts || [] : [];
    
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
    
    await setDoc(authDocRef, { accounts }, { merge: true });
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
    // Read from BasicInfo/auth which is the source of truth for user accounts
    const authDocRef = doc(db, "BasicInfo", "auth");
    const authDocSnap = await getDoc(authDocRef);
    
    if (authDocSnap.exists()) {
      const accounts = authDocSnap.data().accounts || [];
      return accounts;
    }
    return [];
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
    await deleteDoc(doc(db, "users", userId));
    
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
      password: btoa(newPassword),
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
 * Update user information (SuperAdmin only)
 * Can update: email, username
 */
export const updateUserInfo = async (userId, updateData) => {
  try {
    if (!isSuperAdmin()) {
      throw new Error("Only SuperAdmins can update user information");
    }

    const { email, username } = updateData;

    if (!email && !username) {
      throw new Error("At least one field (email or username) must be provided");
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }
    }

    if (username && username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }

    const userRef = doc(db, "users", userId);
    const updateObj = {};

    if (email) updateObj.email = email;
    if (username) updateObj.username = username;

    updateObj.updatedAt = new Date().toISOString();

    await updateDoc(userRef, updateObj);

    const { getCurrentUser } = require('./rbacCore');
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
