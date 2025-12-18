RBAC INITIALIZATION GUIDE
=========================

## Setup Instructions

### Step 1: Initialize Roles & Superadmin (One-Time Setup)

The system now fetches roles dynamically from Firestore instead of hardcoding them.

#### Option A: Initialize Everything at Once

In your browser console or a test component:

```javascript
import { initializeCompleteRBACSystem } from './src/Utils/RBAC/rbacInit';

// Call this ONCE on first-time setup
await initializeCompleteRBACSystem();
```

This will:
1. Create 4 default roles in Firestore:
   - SuperAdmin (full access)
   - Editor (create, read, update, delete most resources)
   - Contributor (limited management)
   - Viewer (read-only)

2. Create superadmin user "rudra":
   - Username: rudra
   - Email: rudra@admin.com
   - Password: rudra@123
   - Role: SuperAdmin (all permissions)

#### Option B: Initialize Separately

If you want to do it in steps:

```javascript
import { 
  initializeDefaultRoles, 
  createRudraSuperAdmin 
} from './src/Utils/RBAC/rbacInit';

// Step 1: Create roles
await initializeDefaultRoles();

// Step 2: Create rudra superadmin
await createRudraSuperAdmin();
```

### Step 2: First Login

1. Go to login page
2. Enter credentials:
   - Username: `rudra`
   - Password: `rudra@123`
3. Click login
4. You should be logged in as SuperAdmin with full access

### Step 3: Create Additional Users

Now that rudra is a superadmin, you can:

1. Go to Dashboard → Access Control → Manage Users
2. Click "Create New User"
3. Create users with different roles:
   - Assign roles: Editor, Contributor, or Viewer
   - Or assign specific resource access

## Functions Available

### Initialize Everything
```javascript
import { initializeCompleteRBACSystem } from './src/Utils/RBAC/rbacInit';

const result = await initializeCompleteRBACSystem();
// Returns: { status, message, roles, superAdmin }
```

### Initialize Only Roles
```javascript
import { initializeDefaultRoles } from './src/Utils/RBAC/rbacInit';

const result = await initializeDefaultRoles();
// Creates: SuperAdmin, Editor, Contributor, Viewer roles
// Returns: { status, message, rolesCreated }
```

### Create Rudra Superadmin
```javascript
import { createRudraSuperAdmin } from './src/Utils/RBAC/rbacInit';

const result = await createRudraSuperAdmin();
// Creates user: rudra (superadmin)
// Returns: { status, message, userId, credentials }
```

### Promote Existing User to SuperAdmin
```javascript
import { makeUserSuperAdmin } from './src/Utils/RBAC/rbacInit';

const result = await makeUserSuperAdmin("existing_username");
// Assigns all permissions to existing user
// Returns: { status, message, userId }
```

### Reset Rudra Password
```javascript
import { resetRudraSuperAdminPassword } from './src/Utils/RBAC/rbacInit';

const result = await resetRudraSuperAdminPassword("new_password");
// Resets rudra's password
// Returns: { status, message, newPassword }
```

## How It Works Now

### Before
- Roles were hardcoded in PREDEFINED_ROLES constant
- Limited to 4 fixed roles

### After
- Roles are fetched from Firestore "roles" collection
- Dynamic and flexible
- Can create custom roles later
- RoleManagementModal fetches from Firestore

### Role Storage in Firestore

Roles are stored in `db.collection('roles')` with structure:

```javascript
{
  id: "superadmin",
  name: "SuperAdmin",
  description: "Full system access...",
  permissions: {
    researchers: ["create", "read", "update", "delete"],
    publications: ["create", "read", "update", "delete"],
    // ... all resources
  },
  createdAt: "2025-12-18T...",
  updatedAt: "2025-12-18T..."
}
```

### User Role Assignment

Users now have `roles` field that contains role IDs from Firestore:

```javascript
{
  id: "user123",
  username: "john",
  email: "john@example.com",
  roles: ["editor", "contributor"],  // Array of role IDs
  accessControl: { /* manual access */ },
  // ... other fields
}
```

## Default Roles Permissions

### SuperAdmin
- **All resources**: create, read, update, delete
- **Users**: create, read, update, delete (manage other users)
- **Roles**: manage roles and permissions

### Editor
- **Researchers, Publications, Projects, Vacancies, Applications**: C, R, U, D
- **Activities**: R, U, D
- **Teachings, Partners, Datasets, BasicInfo**: R, U, D
- Cannot manage users or roles

### Contributor
- **Researchers, Publications, Projects**: C, R only
- **Other resources**: R only
- Own content: limited update/delete

### Viewer
- **All resources**: R only
- No create, update, or delete permissions

## Testing the Setup

After initialization, test each user type:

```javascript
// Test as Rudra (SuperAdmin)
// All buttons should be enabled in dashboard

// Test as Editor
// Most create/update buttons enabled
// Cannot create users or manage roles

// Test as Contributor
// Limited create options
// Cannot update others' content

// Test as Viewer
// All buttons disabled except view
// Read-only access only
```

## Troubleshooting

### Issue: "Roles not loading"
- Check browser console for errors
- Verify initializeDefaultRoles() was called
- Check Firestore has 'roles' collection

### Issue: "Can't find rudra user"
- Run createRudraSuperAdmin() again
- Or use makeUserSuperAdmin("username") to promote existing user

### Issue: "Roles still showing old values"
- Clear browser cache
- Refresh page
- Check Firestore directly for roles

### Issue: "Can't assign roles"
- Make sure roles are created first (initializeDefaultRoles)
- Check user ID is valid
- Verify Firestore permissions allow writes

## Next Steps

1. ✅ Run `initializeCompleteRBACSystem()` once
2. ✅ Login with rudra / rudra@123
3. ✅ Create test users with different roles
4. ✅ Test dashboard permission enforcement
5. ✅ Verify roles inherited correctly

## Important Notes

- ⚠️ Only run initialization ONCE - roles shouldn't be created multiple times
- ⚠️ The rudra user is a superadmin with all permissions
- ⚠️ Default password "rudra@123" should be changed after first login
- ⚠️ This is a basic setup - use proper password hashing in production
- ⚠️ Firestore rules should restrict admin operations to authenticated users

## File Structure

```
src/Utils/RBAC/
├── rbacUtils.js (Updated - assignUserRoles now uses role IDs)
└── rbacInit.js (NEW - Initialization functions)

Components/RBAC/
└── RoleManagementModal.js (Updated - Fetches roles from Firestore)
```

## Quick Command Reference

```javascript
// Initialize everything (run once)
import rbacInit from './src/Utils/RBAC/rbacInit';
await rbacInit.initializeCompleteRBACSystem();

// Create just roles
await rbacInit.initializeDefaultRoles();

// Create just rudra
await rbacInit.createRudraSuperAdmin();

// Promote existing user
await rbacInit.makeUserSuperAdmin("username");

// Reset rudra password
await rbacInit.resetRudraSuperAdminPassword("new_password");
```

---

✅ Setup complete! You can now proceed with testing the RBAC system.
