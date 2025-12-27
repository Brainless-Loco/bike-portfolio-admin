RBAC Implementation - Quick Start
==================================

## What's Been Implemented

Your system now has complete Role-Based Access Control with three critical features:

### 1. User Management Enhancements
✅ Password Reset - Change user passwords securely
✅ Role Assignment - Assign predefined roles (SuperAdmin, Editor, Contributor, Viewer)
✅ Role Management UI - Visual interface for managing user roles
✅ User Details - View all user information including roles and permissions

### 2. RBAC Enforcement
✅ Dashboard buttons automatically disable/enable based on permissions
✅ Tooltips explain why buttons are disabled
✅ Visual indicators (lock icons) on restricted buttons
✅ Empty state messages when user lacks permissions

### 3. Developer Tools
✅ Custom useRBAC hook - Easy permission checking in components
✅ hasAccess() function - Direct permission checks
✅ New utility functions - Password management and role assignment

## How RBAC Works

**Two-Layer Access Model:**
1. **Role-Based** - Assign roles that grant permissions
2. **Manual Access** - Grant specific resource access

**Permission Hierarchy:**
- SuperAdmin: All permissions
- Editor: Create, read, update most resources
- Contributor: Create and read own resources  
- Viewer: Read-only access

## How to Use It

### In Your Components

**Option 1: Use the Hook (Recommended)**
```javascript
import { useRBAC } from '../../Hooks/useRBAC';

function MyComponent() {
  const { canCreate, canRead, canUpdate, canDelete } = useRBAC("projects");
  
  return (
    <>
      {canCreate && <Button>Create Project</Button>}
      {canRead && <ProjectsList />}
      {canUpdate && <EditProjectButton />}
      {canDelete && <DeleteProjectButton />}
    </>
  );
}
```

**Option 2: Direct Check**
```javascript
import { hasAccess } from '../../Utils/RBAC/rbacUtils';

if (hasAccess("researchers", "update")) {
  // Show update button
}
```

**Option 3: Protected Component**
```javascript
import { hasAccess } from '../../Utils/RBAC/rbacUtils';

<Button disabled={!hasAccess("researchers", "delete")}>
  Delete
</Button>
```

### In User Management

1. **Create User** - Creates new admin user
2. **Manage Roles** (👤 icon) - Assign predefined roles
3. **Reset Password** (🔐 icon) - Change user password
4. **Manage Access** (✏️ icon) - Fine-grained access control
5. **View Details** (👁️ icon) - See user permissions

## Resource Types

Use these when checking permissions:
- researchers
- publications  
- projects
- activities
- teachings
- partners
- datasets
- vacancies
- applications
- basicInfo
- users

## Operations

Check against these operations:
- create
- read
- update
- delete

## Real-World Examples

### Example 1: Researcher Management with RBAC
```javascript
import { useRBAC } from '../../Hooks/useRBAC';
import { Box, Button, Alert } from '@mui/material';

function ResearchersPage() {
  const { canCreate, canRead, canUpdate, canDelete } = useRBAC("researchers");

  if (!canRead) {
    return <Alert severity="error">No access to researchers</Alert>;
  }

  return (
    <Box>
      <h1>Manage Researchers</h1>
      
      {canCreate && (
        <Button variant="contained" color="primary">
          + Add Researcher
        </Button>
      )}

      <ResearchersList />

      {canUpdate && (
        <ResearcherEditSection />
      )}

      {canDelete && (
        <ResearcherDeleteSection />
      )}
    </Box>
  );
}
```

### Example 2: Disable Actions Based on Permissions
```javascript
function ResearcherCard({ researcher }) {
  const { canUpdate, canDelete } = useRBAC("researchers");

  return (
    <Card>
      <h3>{researcher.name}</h3>
      
      <Button 
        disabled={!canUpdate}
        onClick={() => handleEdit(researcher)}
      >
        Edit
      </Button>

      <Button 
        disabled={!canDelete}
        onClick={() => handleDelete(researcher)}
        color="error"
      >
        Delete
      </Button>
    </Card>
  );
}
```

### Example 3: Multiple Permissions Check
```javascript
import { useResourcePermission } from '../../Hooks/useRBAC';

function AdminPanel() {
  // Check if user can either update OR delete
  const { hasPermission } = useResourcePermission(
    "projects", 
    ["update", "delete"]
  );

  if (!hasPermission) {
    return <Alert>You cannot manage projects</Alert>;
  }

  return <ProjectManagement />;
}
```

## Role Definitions

### SuperAdmin
- Full system access
- Create, read, update, delete everything
- Can assign roles to other users

### Editor  
- Create: Researchers, Publications, Projects, Activities, Vacancies
- Read: All resources
- Update: All resources
- Delete: Own content

### Contributor
- Create: Limited resources (own content)
- Read: All resources
- Update: Own content only
- Delete: Own content only

### Viewer
- Read only access to all resources
- No create/update/delete permissions

## Testing the System

1. **Create Test Users:**
   - One SuperAdmin (test full access)
   - One Editor (test most features)
   - One Contributor (test limited features)
   - One Viewer (test read-only)

2. **Test Dashboard:**
   - Log in as each user
   - Verify buttons enable/disable correctly
   - Hover over disabled buttons to see messages

3. **Test Components:**
   - Navigate to researcher/project pages
   - Verify features available match permissions
   - Try creating/editing/deleting (should work for Editor, fail for Viewer)

4. **Test Role Management:**
   - Assign new role to user
   - Log out and back in
   - Verify new permissions appear

## Troubleshooting

**Issue: Button is always enabled**
- Make sure component is wrapped with useRBAC hook
- Check resource type is in RESOURCE_TYPES
- Verify user role is assigned in User Management

**Issue: SuperAdmin sees restricted features**
- SuperAdmin has all permissions by default
- This is correct behavior
- Test with Editor/Contributor/Viewer users

**Issue: Permissions not updating**
- Clear browser cache/localStorage
- Log out and back in
- Check user has role assigned in User Management

**Issue: Password reset not working**
- Verify user has no special characters in email
- Check Firebase rules allow updateDoc
- See browser console for error messages

## File Structure

```
src/
├── Hooks/
│   └── useRBAC.js (NEW - Permission checking hooks)
├── Components/RBAC/
│   ├── RoleManagementModal.js (NEW - Assign roles)
│   ├── PasswordResetModal.js (NEW - Reset password)
│   ├── AccessControlModal.js (UPDATED - Access management)
│   └── CreateUserModal.js (existing)
├── Pages/RBAC/
│   └── UserManagement.js (UPDATED - Added role & password features)
├── Pages/Dashboard/
│   └── Dashboard.js (UPDATED - RBAC enforcement)
├── Utils/RBAC/
│   └── rbacUtils.js (UPDATED - New functions)
└── RBAC_ENFORCEMENT_GUIDE.md (NEW - Detailed guide)
```

## Next Steps

1. ✅ Create test users with different roles
2. ✅ Test dashboard button enabling/disabling
3. ✅ Apply useRBAC hook to other components
4. ✅ Add permission checks to edit/delete buttons
5. ✅ Test with read-only user
6. ✅ Monitor console for permission errors
7. ✅ Adjust role permissions as needed

## Key Points to Remember

- ✅ SuperAdmin has all permissions automatically
- ✅ Users inherit permissions from assigned roles
- ✅ Manual access can override or supplement roles
- ✅ Use useRBAC hook in components for easy checks
- ✅ Always show disabled state with explanation
- ✅ Test with non-admin users
- ✅ Keep password reset secure (only SuperAdmin can do it)

---

Everything is set up and ready to use! Start by creating test users with different roles and testing the dashboard.
