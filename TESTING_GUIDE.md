# DataGrid Feature - Testing Guide

## Pre-Testing Checklist
- [ ] Code compiled without errors: `npm start` runs successfully
- [ ] Admin is logged in as SuperAdmin
- [ ] Firestore database is accessible
- [ ] Sample data exists in resource collections

## Test Scenarios

### Test 1: Navigate to Role Management
**Steps:**
1. Go to dashboard
2. Click "Access Control" (under superadmin)
3. Click "Role Management"

**Expected Result:**
- ✅ Page loads without errors
- ✅ List of existing roles displays
- ✅ "Create Role" button visible

---

### Test 2: Create Role and Access Permission Builder
**Steps:**
1. Click "Create Role" button
2. Enter role name (e.g., "Project Reviewer")
3. Enter description (e.g., "Can review projects")
4. Find the "Permissions" section
5. Open "Add Permission" area

**Expected Result:**
- ✅ Resource Type dropdown appears
- ✅ "Apply to All Items" checkbox visible
- ✅ No DataGrid showing (all items is default)

---

### Test 3: Resource Type Selection & DataGrid Display
**Steps:**
1. In permission builder, click Resource Type dropdown
2. Select "researchers" or "Researchers"
3. Wait 1-2 seconds for data loading

**Expected Result:**
- ✅ Loading spinner briefly appears
- ✅ DataGrid loads with data
- ✅ Columns show: ID | Name | Title | Email
- ✅ DataGrid shows actual researcher data from database
- ✅ Multiple rows visible (at least 5 if available)

---

### Test 4: DataGrid Pagination
**Steps:**
1. Look at bottom of DataGrid
2. Note pagination controls
3. Click page size dropdown
4. Select "10 per page"

**Expected Result:**
- ✅ Page size selector shows options: 5, 10, 25
- ✅ Selecting 10 shows 10 items per page
- ✅ Navigation arrows (previous/next) work
- ✅ Data persists when navigating pages

---

### Test 5: Multi-Select with Checkboxes
**Steps:**
1. Check "Apply to All Items" to uncheck it
2. In DataGrid, check the header checkbox (select all on page)
3. Uncheck a few individual rows

**Expected Result:**
- ✅ Header checkbox toggles all on page
- ✅ Individual row checkboxes toggle independently
- ✅ Checked rows highlight visually
- ✅ Selected item IDs appear in chips below

---

### Test 6: Selected Items Display as Chips
**Steps:**
1. Select 3-4 items in the DataGrid
2. Look for "Selected Items" section below grid
3. Count should match number selected

**Expected Result:**
- ✅ Section shows: "Selected Items (3)" or similar
- ✅ Each item appears as a chip/badge
- ✅ Chip shows the item ID
- ✅ Each chip has an X button to remove
- ✅ Items persist when scrolling DataGrid

---

### Test 7: Remove Items via Chips
**Steps:**
1. Select multiple items (5+)
2. Click X on one of the chips
3. Verify count updates

**Expected Result:**
- ✅ Chip disappears immediately
- ✅ Count decreases (e.g., 5 → 4)
- ✅ Corresponding checkbox in DataGrid unchecks
- ✅ No errors in console

---

### Test 8: Toggle "Apply to All Items"
**Steps:**
1. With items selected, CHECK "Apply to All Items"
2. Observe DataGrid

**Expected Result:**
- ✅ DataGrid disappears
- ✅ Selected items/chips cleared
- ✅ No error messages
- ✅ UI smooth transition

---

### Test 9: Test Different Resource Types
**Steps:**
1. Reset form or create new permission
2. For each resource type, select it and verify:

**For Researchers:**
- ✅ Shows: ID, Name, Title, Email

**For Publications:**
- ✅ Shows: ID, Name, Year, Type

**For Projects:**
- ✅ Shows: ID, Name, Status

**For Activities:**
- ✅ Shows: ID, Name, Date, Type

**For Vacancies:**
- ✅ Shows: ID, Name, Position

**For Others (Teachings, Partners, etc.):**
- ✅ Shows minimum: ID, Name

---

### Test 10: Operations Selection
**Steps:**
1. Select resource type
2. Check multiple operations checkboxes (C, R, U, D)
3. Select some items
4. Click "Add Permission"

**Expected Result:**
- ✅ Operations display in current permissions
- ✅ Format: "Item ID: [C, R, U]" or similar
- ✅ Removes item when "X" clicked
- ✅ Only selected operations persist

---

### Test 11: Add Permission with Specific Items
**Steps:**
1. Select resource type
2. Select 3 specific items
3. Check "R" and "U" operations
4. Click "Add Permission"

**Expected Result:**
- ✅ Permission added to "Current Permissions" list
- ✅ Shows all 3 items with R, U operations
- ✅ Form clears for next permission
- ✅ Can add more permissions

---

### Test 12: Save Role
**Steps:**
1. Add 2-3 permissions with mixed all/specific items
2. Click "Create" (or "Update" for editing)

**Expected Result:**
- ✅ Success notification appears
- ✅ Role saves and redirects to list
- ✅ New role appears in card view
- ✅ Permissions display correctly

---

### Test 13: Edit Role and Verify Permissions
**Steps:**
1. Create a role with mixed permissions
2. Click "Edit" on the role card
3. Observe permissions in dialog

**Expected Result:**
- ✅ Dialog opens with existing data
- ✅ All permissions display correctly
- ✅ Can modify permissions
- ✅ DataGrid works same as create flow

---

### Test 14: User Access Control Modal
**Steps:**
1. Go to User Management
2. Click "Access Control" on a user
3. Select a resource type
4. Uncheck "Apply to All Items"

**Expected Result:**
- ✅ Same DataGrid displays as in role management
- ✅ Multi-select works identically
- ✅ Chips display selected items
- ✅ Operations selection works

---

### Test 15: Grant/Revoke Access
**Steps:**
1. In Access Control Modal:
   - Select resource type
   - Uncheck "Apply to All Items"
   - Select 2-3 items
   - Select "R" and "U" operations
   - Click "Grant Access"

**Expected Result:**
- ✅ Success notification shows
- ✅ Modal closes
- ✅ User now has access to selected items
- ✅ Can revoke same way (toggle to Revoke mode)

---

### Test 16: Empty Collection Handling
**Steps:**
1. Add a permission
2. Select a resource type with no data in database

**Expected Result:**
- ✅ Loading spinner appears briefly
- ✅ Alert shows: "No items available for this resource type."
- ✅ DataGrid doesn't display
- ✅ No errors in console

---

### Test 17: Error Handling
**Steps:**
1. Force error (e.g., disconnect internet briefly)
2. Try to load resource data

**Expected Result:**
- ✅ Error logged to console (check dev tools)
- ✅ Empty state or alert displays
- ✅ User can try again without page reload
- ✅ No crashes or white screen

---

### Test 18: Sorting in DataGrid
**Steps:**
1. Load DataGrid for any resource
2. Click "Name" column header
3. Click again to reverse sort

**Expected Result:**
- ✅ Data sorts by name ascending
- ✅ Click again sorts descending
- ✅ Arrow indicator shows sort direction
- ✅ Performance remains good

---

### Test 19: Cross-browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if Mac)
- [ ] Edge (if Windows)

**Expected Result:**
- ✅ DataGrid renders consistently
- ✅ Checkboxes work smoothly
- ✅ Chips display properly
- ✅ No layout issues
- ✅ No console errors

---

### Test 20: Mobile/Responsive
**Steps:**
1. Resize browser to mobile width (375px)
2. Try to interact with DataGrid
3. Attempt to select items

**Expected Result:**
- ✅ DataGrid remains usable (may be scrollable)
- ✅ Checkboxes clickable on touch
- ✅ Chips display in rows
- ✅ No broken layout
- ✅ Pagination still works

---

## Performance Tests

### Test 21: Large Dataset Load Time
**Steps:**
1. Ensure resource collection has 100+ items
2. Select that resource type
3. Time how long DataGrid takes to load

**Expected Result:**
- ✅ Loads within 2-3 seconds max
- ✅ Loading spinner visible during wait
- ✅ No freezing or lag
- ✅ UI responsive during load

---

### Test 22: Multiple Item Selection Performance
**Steps:**
1. Select 20+ items from DataGrid
2. Check for performance issues

**Expected Result:**
- ✅ Chips render smoothly
- ✅ No lag when checking/unchecking
- ✅ Memory usage stays reasonable
- ✅ No console warnings

---

## Regression Tests

### Test 23: Old Features Still Work
**Steps:**
1. Test "Apply to All Items" checkbox
2. Test standard role/user creation (without DataGrid)
3. Test permission removal

**Expected Result:**
- ✅ All existing features work
- ✅ No breaking changes
- ✅ "All Items" still works correctly
- ✅ Old workflows unaffected

---

### Test 24: Permission Checks
**Steps:**
1. Login as non-SuperAdmin user
2. Try to access `/rbac/roles` and `/rbac/users`

**Expected Result:**
- ✅ Access denied alert appears
- ✅ Cannot see role/user data
- ✅ Proper permission handling maintained

---

## Bug Tracking Template

If you find an issue, document it as:

```
## Issue: [Brief Title]
- **Test**: Reference which test # found this
- **Steps to Reproduce**:
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected**: What should happen
- **Actual**: What actually happens
- **Environment**: Chrome v120, Desktop, localhost:3000
- **Console Errors**: [Copy any error messages]
- **Screenshots**: [Attach if helpful]
```

---

## Sign-Off Checklist

When all tests pass, confirm:

- [ ] All 24 test scenarios passing
- [ ] No console errors in any browser
- [ ] Performance acceptable on slower connections
- [ ] Mobile responsive
- [ ] No regressions to existing features
- [ ] DataGrid displays correctly for all resource types
- [ ] Permission assignments save to database
- [ ] Permissions enforce correctly

**Tested By**: ___________________  
**Date**: ___________________  
**Status**: ✅ READY FOR PRODUCTION
