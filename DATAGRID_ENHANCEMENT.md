# DataGrid Resource Selection Enhancement

## Overview

Enhanced the RBAC system with visual data grids for selecting specific resources when assigning permissions. Instead of manually typing resource IDs, users can now see and select from a data grid displaying actual resources with their details.

## Changes Made

### 1. **RoleManagement.js** - Enhanced Role Permission Builder
- **Added DataGrid Import**: `import { DataGrid } from "@mui/x-data-grid"`
- **Added State Variables**:
  - `resourceItems`: Stores fetched resources from Firestore
  - `selectedItemIds`: Tracks selected items from DataGrid
  - `loadingItems`: Manages loading state while fetching resources
- **New Functions**:
  - `fetchResourceItems(resourceType)`: Fetches resources from Firestore based on type
  - `getDataGridColumns()`: Returns appropriate columns based on resource type
  - `handleResourceChange(resourceType)`: Triggers resource fetching when type changes
- **UI Enhancements**:
  - DataGrid appears when "Apply to All Items" is unchecked
  - Checkbox selection for multi-select functionality
  - Selected items displayed as chips with delete capability
  - Type-specific columns (name, title, email, status, position, etc.)

### 2. **AccessControlModal.js** - Enhanced User Access Control
- **Added DataGrid Import**: `import { DataGrid } from "@mui/x-data-grid"`
- **Added State Variables**:
  - `resourceItems`: Stores fetched resources
  - `loadingItems`: Loading state indicator
- **New Functions**:
  - `fetchResourceItems(resourceType)`: Fetches resources based on selected type
  - `getDataGridColumns()`: Returns resource-specific columns
  - `handleResourceChange(e)`: Enhanced to fetch data when resource type changes
- **UI Enhancements**:
  - DataGrid displays when "Apply to All Items" is unchecked
  - Multi-select with checkboxes
  - Selected items shown as chips with delete option
  - Loading indicator while fetching
  - Empty state message when no items available

### 3. **Firestore Collection Mapping**
Resources are mapped to their Firestore collections:
- `researchers` → `authors`
- `publications` → `Publications`
- `projects` → `Projects`
- `activities` → `Activities`
- `teachings` → `Teachings`
- `partners` → `Partners`
- `datasets` → `Datasets`
- `vacancies` → `Vacancies`
- `applications` → `Applications`
- `basicInfo` → `BasicInfo`
- `users` → `users`

### 4. **DataGrid Columns by Resource Type**

**All Resources** (Base columns):
- ID
- Name

**Researchers**:
- ID, Name, Title, Email

**Publications**:
- ID, Name, Year, Type

**Projects**:
- ID, Name, Status

**Activities**:
- ID, Name, Date, Type

**Vacancies**:
- ID, Name, Position

**Others**:
- ID, Name (default)

## Features

✅ **Visual Resource Selection**
- View all available resources with key details
- Limit of 100 items per resource type (optimized loading)

✅ **Multi-Select Support**
- Checkbox selection for multiple items
- Selected items tracked in state
- Chips display selected items with delete capability

✅ **Type-Specific Data Preview**
- Columns adapt based on resource type
- Shows relevant fields (email for researchers, status for projects, etc.)

✅ **Loading States**
- CircularProgress indicator while fetching
- Alert message when no items available
- Error handling for fetch failures

✅ **Responsive UI**
- DataGrid height: 350px (adjustable)
- Pagination with configurable page size (5, 10, 25)
- Scrollable columns for large datasets

## Implementation Details

### Resource Data Structure
Each item in the DataGrid includes:
```javascript
{
  id: doc.id,
  name: data.name || data.title || data.email || "Unnamed",
  title: data.title || data.position || "",
  email: data.email || "",
  description: data.description || "",
  ...data // Spreads all other document fields
}
```

### Data Fetching
```javascript
const q = query(collection(db, collectionName), limit(100));
const querySnapshot = await getDocs(q);
```

### Integration Flow

**RoleManagement.js**:
1. User selects resource type
2. `handleResourceChange()` triggers `fetchResourceItems()`
3. Resources loaded into DataGrid
4. User selects items via checkboxes
5. Selected IDs stored in `selectedItemIds`
6. Permission added with specific item IDs

**AccessControlModal.js**:
1. User selects resource type (same workflow)
2. DataGrid displays available resources
3. User selects specific users/items
4. `handleSubmit()` grants/revokes access for selected items

## Unused Code Removed
- Old `handleAddItem()` and `handleRemoveItem()` functions removed from AccessControlModal
- Manual text input for IDs replaced with visual DataGrid selection

## Error Handling
- Graceful fallback if fetch fails
- Empty state message displayed
- Console error logging for debugging
- Swal notifications for user feedback

## Performance Optimizations
- Limits query to 100 items per type (configurable)
- Lazy loading: DataGrid only fetches when resource type selected
- Pagination to handle large datasets
- Efficient component re-renders via proper state management

## Testing Recommendations
1. **Test DataGrid Display**:
   - Select different resource types
   - Verify correct columns display
   - Check data loads properly

2. **Test Multi-Select**:
   - Click checkboxes to select items
   - Verify selected items appear in chips
   - Delete items from chips

3. **Test Permission Assignment**:
   - Create role with specific items selected
   - Grant access to specific users/items
   - Verify permissions saved correctly

4. **Test Edge Cases**:
   - Empty resource collections
   - Single item selection
   - All items selection
   - Revoke specific item access

## Future Enhancements
- Add search/filter functionality within DataGrid
- Expand column limits (currently 100)
- Add sorting options
- Implement lazy loading pagination
- Add bulk actions (select all, clear all)
- Cache fetched data to reduce API calls
