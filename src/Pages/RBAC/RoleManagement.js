import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import Swal from "sweetalert2";
import {
  getAllRoles,
  createRole,
  deleteRole,
  updateRolePermissions,
  RESOURCE_TYPES,
  ALL_OPERATIONS,
  isSuperAdmin,
  getUserEffectivePermissions,
} from "../../Utils/RBAC/rbacUtils";
import { db } from "../../Utils/Firebase/Firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {},
  });
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [useAllItems, setUseAllItems] = useState(true);
  const [resourceItems, setResourceItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch items from Firestore based on resource type
  const fetchResourceItems = async (resourceType) => {
    setLoadingItems(true);
    try {
      let collectionName = resourceType;
      let itemsData = [];

      // Map resource type to collection name (must match Firestore)
      if (resourceType === "researchers") {
        collectionName = "researchers";  // lowercase
      } else if (resourceType === "publications") {
        collectionName = "Researches";   // Note: Researches, not Publications
      } else if (resourceType === "projects") {
        collectionName = "Projects";
      } else if (resourceType === "activities") {
        collectionName = "Activities";
      } else if (resourceType === "teachings") {
        collectionName = "TeachingCourses";  // TeachingCourses, not Teachings
      } else if (resourceType === "partners") {
        collectionName = "Partners";
      } else if (resourceType === "datasets") {
        collectionName = "Datasets";
      } else if (resourceType === "vacancies") {
        collectionName = "Vacancies";
      } else if (resourceType === "applications") {
        collectionName = "Vacancies";  // Applications are subcollections under Vacancies
      } else if (resourceType === "basicInfo") {
        collectionName = "BasicInfo";
      } else if (resourceType === "users") {
        collectionName = "users";
      }

      const q = query(collection(db, collectionName), limit(100));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const item = {
          id: doc.id,
          name: data.name || data.title || data.email || "Unnamed",
          title: data.title || data.position || "",
          email: data.email || "",
          description: data.description || "",
          ...data,
        };
        itemsData.push(item);
      });

      setResourceItems(itemsData);
    } catch (error) {
      console.error("Error fetching resource items:", error);
      Swal.fire("Error", "Failed to load items for this resource", "warning");
      setResourceItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Handle resource type change
  const handleResourceChange = (resourceType) => {
    setSelectedResource(resourceType);
    setSelectedItemIds([]);
    if (resourceType) {
      fetchResourceItems(resourceType);
    }
  };

  // Get columns based on resource type
  const getDataGridColumns = () => {
    const baseColumns = [
      {
        field: "id",
        headerName: "ID",
        width: 150,
        sortable: true,
      },
      {
        field: "name",
        headerName: "Name",
        width: 200,
        sortable: true,
      },
    ];

    // Add type-specific columns
    if (selectedResource === "researchers") {
      return [
        ...baseColumns,
        { field: "title", headerName: "Title", width: 150 },
        { field: "email", headerName: "Email", width: 200 },
      ];
    } else if (selectedResource === "publications") {
      return [
        ...baseColumns,
        { field: "year", headerName: "Year", width: 100 },
        { field: "type", headerName: "Type", width: 120 },
      ];
    } else if (selectedResource === "projects") {
      return [
        ...baseColumns,
        { field: "status", headerName: "Status", width: 120 },
      ];
    } else if (selectedResource === "activities") {
      return [
        ...baseColumns,
        { field: "date", headerName: "Date", width: 120 },
        { field: "type", headerName: "Type", width: 120 },
      ];
    } else if (selectedResource === "vacancies") {
      return [
        ...baseColumns,
        { field: "position", headerName: "Position", width: 150 },
      ];
    }

    return baseColumns;
  };

  const handleAddPermission = () => {
    if (!selectedResource || selectedOperations.length === 0) {
      Swal.fire("Error", "Please select resource type and at least one operation", "error");
      return;
    }

    if (!useAllItems && selectedItemIds.length === 0) {
      Swal.fire("Error", "Please select at least one item or enable 'Apply to All Items'", "error");
      return;
    }

    const updatedPermissions = { ...formData.permissions };
    if (!updatedPermissions[selectedResource]) {
      updatedPermissions[selectedResource] = {};
    }

    if (useAllItems) {
      updatedPermissions[selectedResource]["*"] = selectedOperations;
    } else {
      selectedItemIds.forEach((itemId) => {
        updatedPermissions[selectedResource][itemId] = selectedOperations;
      });
    }

    setFormData({ ...formData, permissions: updatedPermissions });
    setSelectedResource("");
    setSelectedOperations([]);
    setUseAllItems(true);
    setResourceItems([]);
    setSelectedItemIds([]);
  };

  useEffect(() => {
    if (isSuperAdmin()) {
      // Reload permissions from Firebase on mount
      const reloadPermissions = async () => {
        try {
          await getUserEffectivePermissions();
        } catch (error) {
          console.error("Error reloading permissions:", error);
        }
      };
      
      reloadPermissions();
      loadRoles();
    }
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const allRoles = await getAllRoles();
      setRoles(allRoles);
    } catch (error) {
      console.error("Error loading roles:", error);
      Swal.fire("Error", "Failed to load roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      name: "",
      description: "",
      permissions: {},
    });
    setSelectedResource("");
    setSelectedOperations([]);
    setUseAllItems(true);
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissions: { ...role.permissions },
    });
    setSelectedResource("");
    setSelectedOperations([]);
    setUseAllItems(true);
    setEditDialogOpen(true);
  };



  const handleRemovePermission = (resource, resourceId) => {
    const updatedPermissions = { ...formData.permissions };
    if (updatedPermissions[resource]) {
      delete updatedPermissions[resource][resourceId];
      if (Object.keys(updatedPermissions[resource]).length === 0) {
        delete updatedPermissions[resource];
      }
    }
    setFormData({ ...formData, permissions: updatedPermissions });
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      Swal.fire("Error", "Role name is required", "error");
      return;
    }

    try {
      if (selectedRole) {
        // Update existing role
        await updateRolePermissions(selectedRole.id, formData.permissions);
        Swal.fire("Success", "Role updated successfully", "success");
      } else {
        // Create new role
        await createRole({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
        Swal.fire("Success", "Role created successfully", "success");
      }
      loadRoles();
      handleCloseDialog();
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to save role", "error");
    }
  };

  const handleDeleteRole = async (roleId) => {
    const result = await Swal.fire({
      title: "Delete Role?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteRole(roleId);
        Swal.fire("Success", "Role deleted successfully", "success");
        loadRoles();
      } catch (error) {
        Swal.fire("Error", error.message || "Failed to delete role", "error");
      }
    }
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: {},
    });
  };

  if (!isSuperAdmin()) {
    return (
      <Box className="p-6">
        <Alert severity="error">
          You do not have permission to manage roles. Only SuperAdmins can manage roles.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 space-y-6" sx={{ minHeight: '100vh' }}>
      <Box className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create Role
        </Button>
      </Box>

      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">{role.name}</h2>
              <p className="text-gray-600 mb-4">{role.description}</p>
              <Box>
                <p className="font-semibold mb-2">Permissions:</p>
                {Object.keys(role.permissions).length > 0 ? (
                  Object.entries(role.permissions).map(([resource, items]) => (
                    <Box key={resource} className="mb-2">
                      <p className="text-sm font-medium">{resource}</p>
                      {Object.entries(items).map(([itemId, operations]) => (
                        <p key={itemId} className="text-xs text-gray-600 ml-2">
                          • {itemId === "*" ? "All Items" : itemId}: {operations.join(", ")}
                        </p>
                      ))}
                    </Box>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No permissions set</p>
                )}
              </Box>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => handleOpenEditDialog(role)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteRole(role.id)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {roles.length === 0 && (
        <Alert severity="info">No roles found. Create one to get started.</Alert>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog
        open={createDialogOpen || editDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
      >
        <DialogTitle>
          {selectedRole ? `Edit Role: ${selectedRole.name}` : "Create New Role"}
        </DialogTitle>
        <DialogContent className="space-y-6 pt-6">
          {/* Basic Info Section */}
          <Box sx={{ 
            pb: 3, 
            borderBottom: '2px solid #e3f2fd',
            backgroundColor: '#f8fbff',
            p: 2,
            borderRadius: 1
          }}>
            <h3 className="font-bold text-lg mb-4 text-gray-800">Basic Information</h3>
            <TextField
              label="Role Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Project Manager, Reviewer"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this role responsible for?"
              variant="outlined"
            />
          </Box>

          {/* Permissions Section */}
          <Box sx={{ 
            backgroundColor: '#fff3e0',
            p: 2.5,
            borderRadius: 1,
            border: '2px solid #ffe0b2'
          }}>
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center">
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                backgroundColor: '#ff9800',
                borderRadius: '50%',
                marginRight: '10px'
              }}></span>
              Manage Permissions
            </h3>

            {/* Add Permission Section */}
            <Box sx={{ 
              backgroundColor: '#e8f5e9',
              p: 3,
              borderRadius: 1,
              border: '1px solid #c8e6c9',
              mb: 3
            }}>
              <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Add New Permission</h4>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Resource Type</InputLabel>
                <Select
                  value={selectedResource}
                  onChange={(e) => handleResourceChange(e.target.value)}
                >
                  <MenuItem value="">-- Select Resource --</MenuItem>
                  {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                    <MenuItem key={value} value={value}>
                      {key.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedResource && (
                <Box sx={{ 
                  backgroundColor: '#f0f4ff',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #c5cae9',
                  mb: 2
                }}>
                  <label className="block text-sm font-bold mb-3 text-gray-700">Select Operations:</label>
                  <Box className="flex flex-wrap gap-3">
                    {ALL_OPERATIONS.map((op) => (
                      <FormControlLabel
                        key={op}
                        control={
                          <Checkbox
                            checked={selectedOperations.includes(op)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOperations([...selectedOperations, op]);
                              } else {
                                setSelectedOperations(
                                  selectedOperations.filter((o) => o !== op)
                                );
                              }
                            }}
                          />
                        }
                        label={`${op} (${getOperationName(op)})`}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ 
                backgroundColor: '#fce4ec',
                p: 2,
                borderRadius: 1,
                border: '1px solid #f8bbd0',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Checkbox
                  checked={useAllItems}
                  onChange={(e) => setUseAllItems(e.target.checked)}
                  sx={{ p: 0 }}
                />
                <label className="text-sm font-medium text-gray-700 cursor-pointer">
                  ✓ Apply to All Items (No need to select specific items)
                </label>
              </Box>

              {/* DataGrid for Specific Item Selection */}
              {selectedResource && !useAllItems && (
                <Box sx={{ 
                  backgroundColor: '#f3e5f5',
                  p: 2.5,
                  borderRadius: 1,
                  border: '2px solid #e1bee7'
                }}>
                  <label className="block text-sm font-bold mb-3 text-gray-700 uppercase tracking-wide">
                    📋 Select Specific Items (Leave unchecked for all):
                  </label>
                  {loadingItems ? (
                    <Box className="flex justify-center py-6">
                      <Box className="text-center">
                        <CircularProgress size={40} sx={{ mb: 2 }} />
                        <p className="text-gray-600 text-sm">Loading resources...</p>
                      </Box>
                    </Box>
                  ) : resourceItems.length > 0 ? (
                    <Box style={{ height: 350, width: "100%", backgroundColor: '#fff' }}>
                      <DataGrid
                        rows={resourceItems}
                        columns={getDataGridColumns()}
                        checkboxSelection
                        disableSelectionOnClick
                        rowSelectionModel={selectedItemIds}
                        onRowSelectionModelChange={(newSelection) => {
                          setSelectedItemIds(newSelection);
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        initialState={{
                          pagination: {
                            paginationModel: { pageSize: 5 },
                          },
                        }}
                        sx={{
                          "& .MuiDataGrid-root": {
                            border: "1px solid #e0e0e0",
                            borderRadius: "4px",
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{
                      backgroundColor: '#fff9c4',
                      p: 3,
                      borderRadius: 1,
                      border: '1px solid #fbc02d',
                      textAlign: 'center'
                    }}>
                      <p className="text-sm text-gray-700">⚠️ No items available for this resource type in the database.</p>
                    </Box>
                  )}
                  {selectedItemIds.length > 0 && (
                    <Box sx={{
                      backgroundColor: '#e3f2fd',
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid #90caf9',
                      mt: 2
                    }}>
                      <p className="text-sm font-bold mb-2 text-gray-800">
                        ✓ Selected Items ({selectedItemIds.length}):
                      </p>
                      <Box className="flex flex-wrap gap-1">
                        {selectedItemIds.map((itemId) => (
                          <Chip
                            key={itemId}
                            label={itemId}
                            size="small"
                            onDelete={() =>
                              setSelectedItemIds(
                                selectedItemIds.filter((id) => id !== itemId)
                              )
                            }
                            deleteIcon={<ClearIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleAddPermission}
                disabled={!selectedResource || selectedOperations.length === 0}
                sx={{
                  mt: 2,
                  backgroundColor: '#4caf50',
                  '&:hover': {
                    backgroundColor: '#45a049'
                  },
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                ➕ Add Permission
              </Button>
            </Box>

            {/* Current Permissions Display */}
            {Object.keys(formData.permissions).length > 0 && (
              <Box sx={{
                backgroundColor: '#fafafa',
                p: 3,
                borderRadius: 1,
                border: '2px solid #bdbdbd',
                mt: 3
              }}>
                <p className="font-bold mb-3 text-lg text-gray-800">📌 Assigned Permissions</p>
                {Object.entries(formData.permissions).map(([resource, items]) => (
                  <Box key={resource} className="mb-3">
                    <p className="text-sm font-medium">{resource}</p>
                    {Object.entries(items).map(([itemId, operations]) => (
                      <Box
                        key={itemId}
                        className="flex items-center justify-between ml-2 text-sm"
                      >
                        <span>
                          {itemId === "*" ? "All Items" : itemId}: {operations.join(", ")}
                        </span>
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePermission(resource, itemId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">
            {selectedRole ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const getOperationName = (op) => {
  const names = {
    C: "Create",
    R: "Read",
    U: "Update",
    D: "Delete",
  };
  return names[op] || op;
};

export default RoleManagement;
