# DataGrid Selection Flow Diagram

## User Interface Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Role/User Management                     │
│              Click "Edit Role" or "Access Control"          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Permission Dialog                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Resource Type: [Researchers ▼]                      │  │
│  │ Operations: [☑ C] [☑ R] [☐ U] [☐ D]               │  │
│  │ ☐ Apply to All Items                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼ (unchecked)                     ▼ (checked)
┌───────────────────────────────────┐   ┌──────────────────┐
│  DataGrid Appears:                │   │ All Items        │
│  ┌─────────────────────────────┐  │   │ Selected         │
│  │☑ ID │ Name    │ Title       │  │   └──────────────────┘
│  │☐ 1  │ Dr. Smith│ Professor  │  │
│  │☑ 2  │ Dr. Jones│ Lecturer   │  │
│  │☐ 3  │ Dr. Brown│ Assistant  │  │
│  │☑ 4  │ Dr. White│ Postdoc    │  │
│  └─────────────────────────────┘  │
│                                   │
│  Selected Items (3):              │
│  [2] [4] [Other] [X]              │
└───────────────────────────────────┘
                         │
                         ▼
                [Add Permission] ←── Permissions Saved to DB
```

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Component State                           │
│  selectedResource → "researchers"                            │
│  selectedItemIds → [2, 4, 8]                                 │
│  resourceItems → [obj1, obj2, obj3, ...]                     │
│  loadingItems → false                                        │
│  selectedOperations → ["R", "U"]                             │
└──────────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌──────────┐    ┌──────────┐
   │ FireStore│      │ DataGrid │    │ Chips UI │
   │ authors  │      │Component │    │Component │
   │collection│      │          │    │          │
   └─────────┘      └──────────┘    └──────────┘
        ▲                │
        │ query()        │
        │ getDocs()      │ rowSelectionModel
        │                │
        └────────────────┘
```

## Component Integration

```
┌─────────────────────────────────────────────────────────────┐
│                   RoleManagement.js                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  fetchResourceItems()                                │  │
│  │    ├─ Get collection name from resource type        │  │
│  │    ├─ Query Firestore: query(collection, limit 100) │  │
│  │    ├─ Process results into items array              │  │
│  │    └─ setResourceItems([...])                       │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  getDataGridColumns()                                │  │
│  │    ├─ Return base: [ID, Name]                       │  │
│  │    └─ Add type-specific: [Title, Email, etc.]      │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  handleResourceChange()                              │  │
│  │    ├─ setSelectedResource(type)                      │  │
│  │    ├─ setSelectedItemIds([])  // Reset              │  │
│  │    └─ fetchResourceItems(type)  // Load data        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  JSX Rendering:                                            │
│  {resourceItems.length > 0 ? (                             │
│    <DataGrid rows={resourceItems}                          │
│              columns={getDataGridColumns()}                │
│              checkboxSelection                             │
│              rowSelectionModel={selectedItemIds}           │
│    />                                                       │
│  ) : <Alert>No items available</Alert>}                    │
│                                                             │
│  Selected Chips:                                           │
│  {selectedItemIds.map(id => (                              │
│    <Chip label={id}                                        │
│          onDelete={() => removeId(id)} />                  │
│  ))}                                                        │
└─────────────────────────────────────────────────────────────┘
```

## Permission Assignment Workflow

```
User selects resource type (e.g., "researchers")
           │
           ▼
    ┌──────────────┐
    │ selectedResource = "researchers"
    │ loadingItems = true
    └──────────────┘
           │
           ▼
    fetchResourceItems("researchers")
           │
           ├─► Get collection: "authors"
           │
           ├─► Query: getDocs(query(collection(db, "authors"), limit(100)))
           │
           ├─► Process results:
           │   items = [{
           │     id: doc.id,
           │     name: data.name,
           │     title: data.title,
           │     email: data.email,
           │     ...
           │   }, ...]
           │
           ▼
    setResourceItems(items)
    setLoadingItems(false)
           │
           ▼
    DataGrid renders with:
    - rows={resourceItems}
    - columns={[ID, Name, Title, Email]}
    - checkboxSelection enabled
           │
           ▼
    User checks boxes for items 2, 4, 8
           │
           ▼
    onRowSelectionModelChange([2, 4, 8])
           │
           ▼
    setSelectedItemIds([2, 4, 8])
           │
           ▼
    Chips display: [2] [4] [8]
           │
           ▼
    User clicks "Add Permission"
           │
           ▼
    handleAddPermission()
           │
           ├─► Create permission object:
           │   {
           │     "researchers": {
           │       "2": ["R", "U"],
           │       "4": ["R", "U"],
           │       "8": ["R", "U"]
           │     }
           │   }
           │
           ├─► Save to formData.permissions
           │
           └─► Reset: resource="", items=[], operations=[]
                       │
                       ▼
                Permission Ready for DB
                (Save on "Create/Update Role" click)
```

## Resource Type → Collection Mapping

```
RBAC Resource Type          Firestore Collection
┌──────────────────────────┬──────────────────────┐
│ researchers              │ authors              │
│ publications             │ Publications         │
│ projects                 │ Projects             │
│ activities               │ Activities           │
│ teachings                │ Teachings            │
│ partners                 │ Partners             │
│ datasets                 │ Datasets             │
│ vacancies                │ Vacancies            │
│ applications             │ Applications         │
│ basicInfo                │ BasicInfo            │
│ users                    │ users                │
└──────────────────────────┴──────────────────────┘
        │
        └─► Dynamically mapped in fetchResourceItems()
```

## DataGrid Column Configuration

```
Resource Type          Columns Displayed
────────────────────────────────────────────────────────
researchers       │ ID  │ Name  │ Title      │ Email
publications      │ ID  │ Name  │ Year  Type │
projects          │ ID  │ Name  │ Status     │
activities        │ ID  │ Name  │ Date Type  │
vacancies         │ ID  │ Name  │ Position   │
(others)          │ ID  │ Name  │            │
```

## Error Handling Flow

```
fetchResourceItems(type)
           │
           ├─ Try/Catch block
           │
           ├─► Success: Render DataGrid
           │
           └─► Error:
               ├─ console.error(error)
               ├─ setResourceItems([])
               └─ <Alert severity="info">No items available</Alert>
```

## Loading State UI

```
┌─────────────────────────────────────┐
│        Loading Items...             │
│                                     │
│         [Circular Spinner]          │
│                                     │
│     (while fetching from DB)        │
└─────────────────────────────────────┘
                  │
         (after ~500-1000ms)
                  │
                  ▼
         ┌──────────────────┐
         │   DataGrid Ready │
         │   (items loaded) │
         └──────────────────┘
```

## Selection State Visualization

```
Before Selection:
┌──────────────────────┐
│ selectedItemIds = [] │
│ (empty array)        │
└──────────────────────┘

During Selection (user checks boxes):
┌──────────────────────────┐
│ selectedItemIds = [2, 4] │
│ (as user clicks)         │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Chips Update:            │
│ [2] ← Removable with X   │
│ [4] ← Removable with X   │
└──────────────────────────┘

After Permission Added:
┌──────────────────────┐
│ selectedItemIds = [] │
│ (reset for next)     │
└──────────────────────┘
```

This provides a complete visual understanding of how the DataGrid feature integrates into the RBAC system.
