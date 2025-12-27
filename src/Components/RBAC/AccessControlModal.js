import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ClearIcon from "@mui/icons-material/Clear";
import Swal from "sweetalert2";
import {
  RESOURCE_TYPES,
  ALL_OPERATIONS,
  grantUserAccess,
  revokeUserAccess,
} from "../../Utils/RBAC/rbacUtils";
import { db } from "../../Utils/Firebase/Firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

const AccessControlModal = ({ open, onClose, user, onAccessUpdated }) => {
  const [selectedResource, setSelectedResource] = useState("");
  const [selectedOperations, setSelectedOperations] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]); // "*" for all or specific IDs
  const [useAllItems, setUseAllItems] = useState(true);
  const [revokeMode, setRevokeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resourceItems, setResourceItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setSelectedResource("");
    setSelectedOperations([]);
    setSelectedItems([]);
    setUseAllItems(true);
    setRevokeMode(false);
    setError("");
  };

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
      setResourceItems([]);
    } finally {
      setLoadingItems(false);
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

  const handleResourceChange = (e) => {
    const resourceType = e.target.value;
    setSelectedResource(resourceType);
    setSelectedItems([]);
    setSelectedOperations([]);
    setError("");
    if (resourceType) {
      fetchResourceItems(resourceType);
    }
  };

  const handleOperationToggle = (op) => {
    setSelectedOperations((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op]
    );
  };

  // Get available operations based on selection mode
  const getAvailableOperations = () => {
    if (useAllItems) {
      // All items (*) - can use all operations including Create
      return ALL_OPERATIONS;
    } else {
      // Specific items - no Create operation for specific resources
      return ALL_OPERATIONS.filter(op => op !== "Create");
    }
  };

  const handleToggleAllItems = () => {
    setUseAllItems(!useAllItems);
    if (!useAllItems) {
      setSelectedItems([]);
    }
    // Clear operations when switching modes to prevent invalid combinations
    setSelectedOperations([]);
  };

  const validateForm = () => {
    if (!selectedResource) {
      setError("Please select a resource type");
      return false;
    }

    if (selectedOperations.length === 0) {
      setError("Please select at least one operation");
      return false;
    }

    if (!useAllItems && selectedItems.length === 0) {
      setError("Please select specific items or choose 'All Items'");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const resourceIds = useAllItems ? ["*"] : selectedItems;

      if (revokeMode) {
        await revokeUserAccess(user.id, selectedResource, selectedOperations, resourceIds);
        Swal.fire("Success", "Access revoked successfully!", "success");
      } else {
        await grantUserAccess(user.id, selectedResource, selectedOperations, resourceIds);
        Swal.fire("Success", "Access granted successfully!", "success");
      }

      onAccessUpdated();
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to update access");
      Swal.fire("Error", err.message || "Failed to update access", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="auto" fullWidth>
      <DialogTitle>
        {revokeMode ? "Revoke Access" : "Grant Access"} - {user?.email}
      </DialogTitle>
      <DialogContent className="space-y-4 pt-4">
        {error && <Alert severity="error">{error}</Alert>}

        {/* Mode Toggle */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          <Button
            variant={!revokeMode ? "contained" : "outlined"}
            onClick={() => {
              setRevokeMode(false);
              setError("");
            }}
            fullWidth
            sx={{
              backgroundColor: !revokeMode ? '#4caf50' : 'transparent',
              color: !revokeMode ? '#fff' : '#4caf50',
              fontWeight: 'bold'
            }}
          >
            ✓ Grant Access
          </Button>
          <Button
            variant={revokeMode ? "contained" : "outlined"}
            onClick={() => {
              setRevokeMode(true);
              setError("");
            }}
            fullWidth
            sx={{
              backgroundColor: revokeMode ? '#f44336' : 'transparent',
              color: revokeMode ? '#fff' : '#f44336',
              fontWeight: 'bold'
            }}
          >
            ✕ Revoke Access
          </Button>
        </Box>

        {/* Resource Type Selection */}
        <FormControl fullWidth sx={{ mb: 2.5 }}>
          <InputLabel>Select Resource Type</InputLabel>
          <Select
            value={selectedResource}
            onChange={handleResourceChange}
            disabled={loading}
          >
            <MenuItem value="">-- Select Resource --</MenuItem>
            {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
              <MenuItem key={value} value={value}>
                {key.replace(/_/g, " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Operations Selection */}
        {selectedResource && (
          <Box sx={{
            backgroundColor: '#f0f4ff',
            p: 2.5,
            borderRadius: 1,
            border: '1px solid #c5cae9',
            mb: 2.5
          }}>
            <label className="block text-sm font-bold mb-3 text-gray-700">
              Select Operations:
              {!useAllItems && <span className="text-red-500 ml-2">(Create not available for specific resources)</span>}
            </label>
            <Box className="flex flex-wrap gap-3">
              {getAvailableOperations().map((op) => (
                <FormControlLabel
                  key={op}
                  control={
                    <Checkbox
                      checked={selectedOperations.includes(op)}
                      onChange={() => handleOperationToggle(op)}
                      disabled={loading}
                    />
                  }
                  label={`${op} (${getOperationName(op)})`}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Items Selection */}
        {selectedResource && (
          <Box sx={{
            backgroundColor: '#fce4ec',
            p: 2,
            borderRadius: 1,
            border: '1px solid #f8bbd0',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Checkbox
              checked={useAllItems}
              onChange={handleToggleAllItems}
              disabled={loading}
              sx={{ p: 0 }}
            />
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              ✓ Apply to All Items (No need to select specific items)
            </label>

            {!useAllItems && (
              <Box sx={{
                backgroundColor: '#f3e5f5',
                p: 2.5,
                borderRadius: 1,
                border: '2px solid #e1bee7',
                mt: 2
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
                      rowSelectionModel={selectedItems}
                      onRowSelectionModelChange={(newSelection) => {
                        setSelectedItems(newSelection);
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
                {selectedItems.length > 0 && (
                  <Box sx={{
                    backgroundColor: '#e3f2fd',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #90caf9',
                    mt: 2
                  }}>
                    <p className="text-sm font-bold mb-2 text-gray-800">
                      ✓ Selected Items ({selectedItems.length}):
                    </p>
                    <Box className="flex flex-wrap gap-1">
                      {selectedItems.map((itemId) => (
                        <Chip
                          key={itemId}
                          label={itemId}
                          size="small"
                          onDelete={() =>
                            setSelectedItems(selectedItems.filter((id) => id !== itemId))
                          }
                          deleteIcon={<ClearIcon />}
                          disabled={loading}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : revokeMode ? "Revoke Access" : "Grant Access"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to display operation names
const getOperationName = (op) => {
  const names = {
    C: "Create",
    R: "Read",
    U: "Update",
    D: "Delete",
  };
  return names[op] || op;
};

export default AccessControlModal;
