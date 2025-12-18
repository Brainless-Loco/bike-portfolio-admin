import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { assignUserRoles, getAllRoles } from "../../Utils/RBAC/rbacUtils";

const RoleManagementModal = ({ open, onClose, user, onRolesUpdated }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    if (user && user.roles) {
      setSelectedRoles([...user.roles]);
    } else {
      setSelectedRoles([]);
    }
  }, [user, open]);

  // Fetch available roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const roles = await getAllRoles();
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Error loading roles:", error);
        Swal.fire("Error", "Failed to load roles", "error");
      } finally {
        setRolesLoading(false);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open]);

  const handleRoleToggle = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await assignUserRoles(user.id, selectedRoles);
      Swal.fire("Success", "User roles updated successfully", "success");
      onRolesUpdated();
      onClose();
    } catch (error) {
      Swal.fire("Error", error.message || "Failed to update roles", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRoles([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Assign Roles - {user?.email}</DialogTitle>
      <DialogContent className="space-y-4 pt-4">
        {rolesLoading ? (
          <Box className="flex justify-center items-center py-6">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Alert severity="info">
              Select roles for the user. Users inherit permissions from assigned roles.
            </Alert>

            <Box
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                mb: 2,
              }}
            >
              <p className="font-semibold mb-3 text-gray-700">Currently Assigned Roles:</p>
              {selectedRoles.length > 0 ? (
                <Box className="flex flex-wrap gap-2">
                  {selectedRoles.map(roleId => {
                    const role = availableRoles.find(r => r.id === roleId);
                    return (
                      <Chip
                        key={roleId}
                        label={role?.name || roleId}
                        onDelete={() => handleRoleToggle(roleId)}
                        color={role?.name === "superadmin" ? "error" : "primary"}
                      />
                    );
                  })}
                </Box>
              ) : (
                <p className="text-gray-500 text-sm">No roles assigned</p>
              )}
            </Box>

            <Box
              sx={{
                backgroundColor: "#e8f5e9",
                p: 2,
                borderRadius: 1,
                border: "2px solid #c8e6c9",
              }}
            >
              <p className="font-semibold mb-3 text-gray-700">Available Roles:</p>
              {availableRoles.length === 0 ? (
                <p className="text-gray-500 text-sm">No roles available</p>
              ) : (
                <FormGroup>
                  {availableRoles.map(role => (
                    <FormControlLabel
                      key={role.id}
                      control={
                        <Checkbox
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          disabled={loading}
                        />
                      }
                      label={
                        <span className="text-sm">
                          {role.name}
                          {role.name === "superadmin" && (
                            <span className="text-red-500 ml-2 font-semibold">(Admin Access)</span>
                          )}
                        </span>
                      }
                    />
                  ))}
                </FormGroup>
              )}
            </Box>

            <Alert severity="warning">
              ⚠️ <strong>SuperAdmin</strong> role grants full system access. Assign carefully.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveRoles}
          variant="contained"
          color="primary"
          disabled={loading || rolesLoading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Roles"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoleManagementModal;
