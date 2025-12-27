/**
 * RBAC Initialization Script
 * 
 * This file contains initialization functions to set up default roles and users.
 * Run this once during first-time setup.
 */

import { db } from "../Firebase/Firebase";
import { 
  doc, setDoc, collection, getDocs, query, where, updateDoc 
} from "firebase/firestore";

/**
 * Initialize default roles in Firestore
 * Call this once to create: SuperAdmin, Editor, Contributor, Viewer
 */
export const initializeDefaultRoles = async () => {
  try {
    const rolesRef = collection(db, "roles");
    
    // Check if roles already exist
    const snapshot = await getDocs(rolesRef);
    if (snapshot.size > 0) {
      console.log("Roles already initialized");
      return { status: "already_exists", message: "Roles already initialized" };
    }

    // Define role permissions
    const defaultRoles = [
      {
        id: "superadmin",
        name: "SuperAdmin",
        description: "Full system access - can manage everything including users and roles",
        permissions: {
          researchers: ["create", "read", "update", "delete"],
          publications: ["create", "read", "update", "delete"],
          projects: ["create", "read", "update", "delete"],
          activities: ["create", "read", "update", "delete"],
          teachings: ["create", "read", "update", "delete"],
          partners: ["create", "read", "update", "delete"],
          datasets: ["create", "read", "update", "delete"],
          vacancies: ["create", "read", "update", "delete"],
          applications: ["create", "read", "update", "delete"],
          basicInfo: ["create", "read", "update", "delete"],
          users: ["create", "read", "update", "delete"],
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "editor",
        name: "Editor",
        description: "Can create, read, update, and delete most resources",
        permissions: {
          researchers: ["create", "read", "update", "delete"],
          publications: ["create", "read", "update", "delete"],
          projects: ["create", "read", "update", "delete"],
          activities: ["create", "read", "update", "delete"],
          vacancies: ["create", "read", "update", "delete"],
          applications: ["create", "read", "update", "delete"],
          teachings: ["read", "update", "delete"],
          partners: ["read", "update", "delete"],
          datasets: ["read", "update", "delete"],
          basicInfo: ["read", "update", "delete"],
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "contributor",
        name: "Contributor",
        description: "Can create and manage their own content",
        permissions: {
          researchers: ["create", "read"],
          publications: ["create", "read"],
          projects: ["create", "read"],
          activities: ["read"],
          teachings: ["read"],
          partners: ["read"],
          datasets: ["read"],
          vacancies: ["read"],
          applications: ["read"],
          basicInfo: ["read"],
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "viewer",
        name: "Viewer",
        description: "Read-only access to all resources",
        permissions: {
          researchers: ["read"],
          publications: ["read"],
          projects: ["read"],
          activities: ["read"],
          teachings: ["read"],
          partners: ["read"],
          datasets: ["read"],
          vacancies: ["read"],
          applications: ["read"],
          basicInfo: ["read"],
        },
        createdAt: new Date().toISOString(),
      },
    ];

    // Create each role
    for (const role of defaultRoles) {
      await setDoc(doc(db, "roles", role.id), role);
      console.log(`✅ Created role: ${role.name}`);
    }

    return { 
      status: "success", 
      message: "All default roles created successfully",
      rolesCreated: defaultRoles.length 
    };
  } catch (error) {
    console.error("Error initializing roles:", error);
    throw error;
  }
};

/**
 * Create superadmin user "rudra" with all access
 * Call this to set up the default admin user
 */
export const createRudraSuperAdmin = async () => {
  try {
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", "rudra"));
    const snapshot = await getDocs(q);

    if (snapshot.size > 0) {
      console.log("Rudra user already exists");
      return { 
        status: "already_exists", 
        message: "Rudra superadmin user already exists",
        userId: snapshot.docs[0].id 
      };
    }

    // Create superadmin user "rudra"
    const rudrUser = {
      email: "rudra@admin.com",
      username: "rudra",
      password: btoa("rudra@123"), // Base64 encoded password
      phone: "+91-9999999999",
      role: "superadmin", // Primary role
      roles: ["superadmin"], // Role ID from roles collection
      isSuperAdmin: true,
      accessControl: {
        researchers: { "*": ["create", "read", "update", "delete"] },
        publications: { "*": ["create", "read", "update", "delete"] },
        projects: { "*": ["create", "read", "update", "delete"] },
        activities: { "*": ["create", "read", "update", "delete"] },
        teachings: { "*": ["create", "read", "update", "delete"] },
        partners: { "*": ["create", "read", "update", "delete"] },
        datasets: { "*": ["create", "read", "update", "delete"] },
        vacancies: { "*": ["create", "read", "update", "delete"] },
        applications: { "*": ["create", "read", "update", "delete"] },
        basicInfo: { "*": ["create", "read", "update", "delete"] },
        users: { "*": ["create", "read", "update", "delete"] },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };

    // Save to Firestore
    const usersCollRef = collection(db, "users");
    const docRef = doc(usersCollRef);
    await setDoc(docRef, rudrUser);

    console.log("✅ Superadmin user 'rudra' created successfully!");
    console.log("📧 Email: rudra@admin.com");
    console.log("👤 Username: rudra");
    console.log("🔐 Password: rudra@123");

    return {
      status: "success",
      message: "Rudra superadmin user created successfully",
      userId: docRef.id,
      credentials: {
        username: "rudra",
        email: "rudra@admin.com",
        password: "rudra@123",
      },
    };
  } catch (error) {
    console.error("Error creating rudra user:", error);
    throw error;
  }
};

/**
 * Assign superadmin role to an existing user by username
 */
export const makeUserSuperAdmin = async (username) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (snapshot.size === 0) {
      throw new Error(`User with username '${username}' not found`);
    }

    const userId = snapshot.docs[0].id;
    const userRef = doc(db, "users", userId);

    // Get all permissions (SuperAdmin access)
    const allPermissions = {
      researchers: { "*": ["create", "read", "update", "delete"] },
      publications: { "*": ["create", "read", "update", "delete"] },
      projects: { "*": ["create", "read", "update", "delete"] },
      activities: { "*": ["create", "read", "update", "delete"] },
      teachings: { "*": ["create", "read", "update", "delete"] },
      partners: { "*": ["create", "read", "update", "delete"] },
      datasets: { "*": ["create", "read", "update", "delete"] },
      vacancies: { "*": ["create", "read", "update", "delete"] },
      applications: { "*": ["create", "read", "update", "delete"] },
      basicInfo: { "*": ["create", "read", "update", "delete"] },
      users: { "*": ["create", "read", "update", "delete"] },
    };

    await updateDoc(userRef, {
      role: "superadmin",
      roles: ["superadmin"],
      isSuperAdmin: true,
      accessControl: allPermissions,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ User '${username}' is now a SuperAdmin with all permissions`);
    return { 
      status: "success", 
      message: `User '${username}' promoted to SuperAdmin`,
      userId 
    };
  } catch (error) {
    console.error("Error promoting user to superadmin:", error);
    throw error;
  }
};

/**
 * Reset superadmin password (for recovery)
 */
export const resetRudraSuperAdminPassword = async (newPassword = "rudra@123") => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", "rudra"));
    const snapshot = await getDocs(q);

    if (snapshot.size === 0) {
      throw new Error("Rudra superadmin user not found");
    }

    const userId = snapshot.docs[0].id;
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      password: btoa(newPassword),
      passwordUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Rudra password reset to: ${newPassword}`);
    return { 
      status: "success", 
      message: "Password reset successfully",
      newPassword 
    };
  } catch (error) {
    console.error("Error resetting rudra password:", error);
    throw error;
  }
};

/**
 * Initialize complete RBAC system (Roles + Rudra superadmin)
 * Call this ONCE on first-time setup
 */
export const initializeCompleteRBACSystem = async () => {
  try {
    console.log("🚀 Starting RBAC initialization...\n");

    // Step 1: Initialize roles
    console.log("📋 Step 1: Initializing default roles...");
    const rolesResult = await initializeDefaultRoles();
    console.log(`   ${rolesResult.message}\n`);

    // Step 2: Create rudra superadmin
    console.log("👑 Step 2: Creating Rudra superadmin user...");
    const rudraResult = await createRudraSuperAdmin();
    console.log(`   ${rudraResult.message}\n`);

    console.log("✅ RBAC System initialized successfully!\n");
    console.log("📝 Superadmin Credentials:");
    console.log("   Username: rudra");
    console.log("   Email: rudra@admin.com");
    console.log("   Password: rudra@123\n");

    return {
      status: "success",
      message: "RBAC system initialized completely",
      roles: rolesResult,
      superAdmin: rudraResult,
    };
  } catch (error) {
    console.error("❌ Error initializing RBAC system:", error);
    throw error;
  }
};

const rbacInit = {
  initializeDefaultRoles,
  createRudraSuperAdmin,
  makeUserSuperAdmin,
  resetRudraSuperAdminPassword,
  initializeCompleteRBACSystem,
};

export default rbacInit;
