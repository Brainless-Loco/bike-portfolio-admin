# DataGrid Resource Selection - Quick Start Guide

## Overview
The RBAC system now includes interactive data grids for selecting specific resources when assigning permissions to roles or users.

## Where It's Used

### 1. Role Management (`/rbac/roles`)
- Edit a role → Permissions section → "Add Permission"
- Uncheck "Apply to All Items" to see the DataGrid

### 2. User Management (`/rbac/users`)
- Select a user → Click "Access Control" button
- Uncheck "Apply to All Items" to see the DataGrid

## How to Use

### Step 1: Select Resource Type
```
FormControl "Resource Type" dropdown
↓
Choose from: Researchers, Publications, Projects, Activities, etc.
↓
DataGrid loads automatically with available resources
```

### Step 2: Review Available Items
The DataGrid displays resources with relevant fields:

| Resource Type | Columns Shown |
|---|---|
| Researchers | ID, Name, Title, Email |
| Publications | ID, Name, Year, Type |
| Projects | ID, Name, Status |
| Activities | ID, Name, Date, Type |
| Vacancies | ID, Name, Position |
| Others | ID, Name |

### Step 3: Select Specific Items
- Click checkboxes next to items you want to select
- Selected items automatically appear below as chips
- Maximum 100 items shown per resource (pagination available)

### Step 4: Remove Items (if needed)
- Click the X icon on any chip to deselect
- Or uncheck in the DataGrid

### Step 5: Choose Operations & Submit
- Select operations (Create, Read, Update, Delete)
- Click "Add Permission" or "Grant Access"
- Permission saves with specific selected items

## Key Features

✨ **Visual Selection**
- See ID, name, and relevant fields before selecting
- Know exactly which items you're granting access to

✨ **Multi-Select**
- Use checkboxes to select multiple items at once
- No need to manually type IDs

✨ **Easy Management**
- Chips show selected items
- Quick deselection via chip delete button
- Clear counts (e.g., "Selected Items (3)")

✨ **Smart Defaults**
- Columns adapt to resource type
- Shows most relevant information
- 5-item pagination by default (can increase to 10 or 25)

## Common Workflows

### Grant Access to Multiple Researchers
1. Edit user → Access Control
2. Select "Researchers" from dropdown
3. Uncheck "Apply to All Items"
4. Select researchers by checking boxes
5. Select operations (e.g., Read, Update)
6. Click "Grant Access"
✓ User can now access only those specific researchers

### Create Role for Project Managers
1. Create new role
2. Add Permission → "Projects"
3. Uncheck "Apply to All Items"
4. Select specific projects
5. Grant Create, Read, Update operations
✓ Role applies to only selected projects

### Revoke Access from Specific Resources
1. Edit user → Access Control
2. Set Revoke Mode (toggle button)
3. Select resource type
4. Uncheck "Apply to All Items"
5. Select items to revoke from
6. Click "Revoke Access"
✓ User loses access to only those items

## Troubleshooting

### DataGrid Not Showing?
- ✓ Resource type must be selected first
- ✓ "Apply to All Items" must be unchecked
- ✓ Resource collection must have data in Firestore

### Items Not Loading?
- Check browser console for errors
- Verify Firestore collection exists and contains data
- Check if limit of 100 items exceeded (pagination handles this)

### Can't Select Items?
- Ensure DataGrid fully loaded (no loading spinner)
- Try refreshing the page
- Check if you have permission to view resources

### Selection Not Saving?
- Ensure at least one item is selected
- Verify operations are selected (C, R, U, D)
- Check browser console for error messages

## Tips & Tricks

💡 **Pagination**: Click next/previous arrows or page size dropdown to navigate large datasets

💡 **Quick Deselect**: Use the trash icon on chips to quickly remove items

💡 **Bulk Selection**: Select all items on current page with header checkbox

💡 **Sorting**: Click column headers to sort by Name or ID

💡 **All vs Specific**: Use "Apply to All Items" for blanket permissions, DataGrid for fine-grained control

## Database Mapping

Resources automatically fetch from the correct Firestore collections:

```
researchers    → authors
publications   → Publications
projects       → Projects
activities     → Activities
teachings      → Teachings
partners       → Partners
datasets       → Datasets
vacancies      → Vacancies
applications   → Applications
basicInfo      → BasicInfo
users          → users
```

## API Details

For developers: The DataGrid implementation uses:
- **MUI DataGrid v6+**: Checkbox selection, pagination, sorting
- **Firestore**: `query(collection(db, name), limit(100))`
- **State Management**: React `useState` hooks
- **Columns**: Dynamic based on resource type via `getDataGridColumns()`

## Next Steps

1. Navigate to `/rbac/users` or `/rbac/roles`
2. Try creating/editing permissions
3. Use the DataGrid for visual resource selection
4. Enjoy easier permission management! 🎉
