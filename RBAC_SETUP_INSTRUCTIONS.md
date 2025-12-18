USING RBAC INITIALIZATION IN YOUR APP
======================================

## Quick Start: Initialize on App Load

### Option 1: Initialize in Dashboard Component

```javascript
// src/Pages/Dashboard/Dashboard.js

import { useEffect } from 'react';
import { initializeCompleteRBACSystem } from '../../Utils/RBAC/rbacInit';

export default function Dashboard() {
  useEffect(() => {
    const setupRBAC = async () => {
      try {
        // Check if this is first run (no roles exist)
        const { getAllRoles } = require('../../Utils/RBAC/rbacUtils');
        const roles = await getAllRoles();
        
        if (roles.length === 0) {
          console.log("First run detected. Initializing RBAC system...");
          const result = await initializeCompleteRBACSystem();
          console.log("✅ RBAC System initialized:", result);
        }
      } catch (error) {
        console.error("RBAC initialization error:", error);
      }
    };

    setupRBAC();
  }, []);

  // Rest of component...
}
```

### Option 2: Initialize in App.js on Mount

```javascript
// src/App.js

import { useEffect } from 'react';
import { initializeCompleteRBACSystem } from './Utils/RBAC/rbacInit';

function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to initialize RBAC on first load
        await initializeCompleteRBACSystem();
      } catch (error) {
        // Silently fail if already initialized
        if (!error.message.includes("already_exists")) {
          console.warn("RBAC initialization info:", error.message);
        }
      }
    };

    initializeApp();
  }, []);

  return (
    // Your app JSX
  );
}

export default App;
```

### Option 3: Initialize via Browser Console

Open browser console (F12) and run:

```javascript
// Import and initialize
import rbacInit from './src/Utils/RBAC/rbacInit.js';
await rbacInit.initializeCompleteRBACSystem();

// Or individual functions
await rbacInit.initializeDefaultRoles();
await rbacInit.createRudraSuperAdmin();
```

## After Initialization: User Workflow

### 1. First Login
```
URL: /login
Username: rudra
Password: rudra@123
```

### 2. Dashboard appears with all buttons enabled

### 3. Create additional users in User Management
- Go to Dashboard → Access Control → Manage Users
- Click "Create New User"
- Assign roles from the fetched list

### 4. Assign roles to users
- Click 👤 "Manage Roles" button
- Select from dynamically loaded roles:
  - superadmin
  - editor
  - contributor
  - viewer
- Click "Save Roles"

## Role Hierarchy After Setup

```
SuperAdmin (Rudra)
├── Can manage users
├── Can assign roles
├── Can reset passwords
└── Has all resource permissions

Editor
├── Can manage most content
├── Cannot manage users
└── Limited by role permissions

Contributor
├── Can create own content
├── Limited management
└── Read-only for others

Viewer
├── Read-only access
└── Cannot create/edit/delete
```

## Verifying Setup

### Check 1: Roles Exist
```javascript
import { getAllRoles } from './src/Utils/RBAC/rbacUtils';

const roles = await getAllRoles();
console.log("Roles:", roles);
// Should show: superadmin, editor, contributor, viewer
```

### Check 2: Rudra User Exists
```javascript
import { getUser, getAllAdminUsers } from './src/Utils/RBAC/rbacUtils';

const users = await getAllAdminUsers();
const rudra = users.find(u => u.username === 'rudra');
console.log("Rudra:", rudra);
// Should have role: superadmin, roles: ["superadmin"]
```

### Check 3: Login Works
1. Go to login page
2. Enter: rudra / rudra@123
3. Should successfully authenticate

### Check 4: Dashboard Shows All Buttons
1. After login, verify dashboard loads
2. All action buttons should be ENABLED
3. No lock icons visible
4. "Access Control" section visible

## Creating Additional Admin Users

### Method 1: Via User Management UI
1. Login as rudra
2. Go to User Management
3. Click "Create New User"
4. Enter details
5. Click 👤 "Manage Roles"
6. Select "superadmin" role
7. Save

### Method 2: Via Code
```javascript
import { 
  createAdminUser, 
  assignUserRoles 
} from './src/Utils/RBAC/rbacUtils';

// Create user
const newUser = await createAdminUser({
  email: 'admin2@example.com',
  username: 'admin2',
  phone: '1234567890',
  password: 'secure_password'
});

// Assign superadmin role
await assignUserRoles(newUser.id, ['superadmin']);
```

### Method 3: Via Initialization Function
```javascript
import { makeUserSuperAdmin } from './src/Utils/RBAC/rbacInit';

// Promote existing user
await makeUserSuperAdmin('existing_username');
```

## Testing the System

### Test as Different Roles

```javascript
// After creating test users:
// 1. Logout
// 2. Login as each test user
// 3. Verify correct buttons enabled/disabled
```

**Viewer User Test:**
```
Expected:
- All buttons DISABLED
- "You don't have permission" tooltip on hover
- Lock icon on buttons
- Dashboard shows limited options
```

**Editor User Test:**
```
Expected:
- Create buttons ENABLED
- Update buttons ENABLED
- Delete buttons ENABLED
- User management DISABLED
- Role management DISABLED
```

**Superadmin Test:**
```
Expected:
- All buttons ENABLED
- No lock icons
- "Access Control" section visible
- User Management accessible
- Role Management accessible
```

## Common Issues & Solutions

### Issue: "Roles collection not found"
**Solution:**
```javascript
import { initializeDefaultRoles } from './src/Utils/RBAC/rbacInit';
await initializeDefaultRoles();
```

### Issue: "Rudra user creation failed"
**Solution:**
```javascript
import { createRudraSuperAdmin } from './src/Utils/RBAC/rbacInit';
await createRudraSuperAdmin();
```

### Issue: "Can't assign roles to user"
**Causes:**
- Roles collection doesn't exist → Run initializeDefaultRoles()
- Role ID doesn't match → Check role document IDs in Firestore

**Solution:**
```javascript
// Check what roles exist
import { getAllRoles } from './src/Utils/RBAC/rbacUtils';
const roles = await getAllRoles();
console.log(roles.map(r => r.id)); // Should include: superadmin, editor, etc.
```

### Issue: "Buttons not respecting permissions"
**Causes:**
- Roles not assigned to user
- Permissions don't match RESOURCE_TYPES in rbacUtils
- Cache not cleared

**Solution:**
```javascript
// Clear browser cache
// Logout and login again
// Verify roles assigned: User Management → View Details
```

## Production Deployment

### Before Going Live

- [ ] Change rudra password to something secure
- [ ] Remove hardcoded passwords from code
- [ ] Use proper password hashing (not base64)
- [ ] Set up Firestore security rules
- [ ] Test with real users
- [ ] Verify role permissions are correct
- [ ] Audit user access logs

### Firestore Security Rules

```javascript
// Add to Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Only authenticated users can access
    match /roles/{roleId} {
      allow read: if request.auth != null;
      allow write: if hasRole('superadmin');
    }
    
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if hasRole('superadmin');
    }
    
    function hasRole(role) {
      return get(/databases/$(database)/documents/users/$(request.auth.uid))
        .data.role == role;
    }
  }
}
```

## Quick Reference

### Initialize Everything
```javascript
import { initializeCompleteRBACSystem } from './src/Utils/RBAC/rbacInit';
await initializeCompleteRBACSystem();
```

### Login Credentials
```
Username: rudra
Email: rudra@admin.com
Password: rudra@123
```

### Verify Setup
```javascript
// Check roles
import { getAllRoles } from './src/Utils/RBAC/rbacUtils';
const roles = await getAllRoles();

// Check rudra user
import { getUser, getAllAdminUsers } from './src/Utils/RBAC/rbacUtils';
const users = await getAllAdminUsers();
const rudra = users.find(u => u.username === 'rudra');
```

---

✅ Ready to set up and test your RBAC system!
