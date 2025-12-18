import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockResetIcon from "@mui/icons-material/LockReset";
import BadgeIcon from "@mui/icons-material/Badge";
import Swal from "sweetalert2";
import { getAllAdminUsers, deleteAdminUser, isSuperAdmin, getUserEffectivePermissions } from "../../Utils/RBAC/rbacUtils";
import CreateUserModal from "../../Components/RBAC/CreateUserModal";
import AccessControlModal from "../../Components/RBAC/AccessControlModal";
import RoleManagementModal from "../../Components/RBAC/RoleManagementModal";
import PasswordResetModal from "../../Components/RBAC/PasswordResetModal";
import EditUserModal from "../../Components/RBAC/EditUserModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

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
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllAdminUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteAdminUser(userId);
        Swal.fire("Success", "User deleted successfully", "success");
        loadUsers();
      } catch (error) {
        Swal.fire("Error", error.message || "Failed to delete user", "error");
      }
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers([...users, newUser]);
  };

  const handleAccessUpdated = () => {
    loadUsers();
  };

  if (!isSuperAdmin()) {
    return (
      <Box className="p-6">
        <Alert severity="error">
          You do not have permission to access user management. Only SuperAdmins can manage users.
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateModalOpen(true)}
        >
          Create New User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="bg-gray-200">
              <TableCell className="font-bold">Email</TableCell>
              <TableCell className="font-bold">Username</TableCell>
              <TableCell className="font-bold">Phone</TableCell>
              <TableCell className="font-bold">Role</TableCell>
              <TableCell className="font-bold">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50">
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Box className="flex flex-wrap gap-1">
                    <Chip
                      label={user.role || "viewer"}
                      color={user.role === "superadmin" ? "error" : "primary"}
                      size="small"
                    />
                    {user.roles && user.roles.length > 0 && (
                      <Chip
                        label={`+${user.roles.length} roles`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setViewingUser(user);
                        setViewDetailsOpen(true);
                      }}
                      title="View Details"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit User Info">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditModalOpen(true);
                      }}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Manage Roles">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setRoleModalOpen(true);
                      }}
                      color="info"
                    >
                      <BadgeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setPasswordModalOpen(true);
                      }}
                      color="warning"
                    >
                      <LockResetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Manage Access">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedUser(user);
                        setAccessModalOpen(true);
                      }}
                      color="secondary"
                    >
                      <BadgeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteUser(user.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && (
        <Alert severity="info">No users found. Create one to get started.</Alert>
      )}

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {selectedUser && (
        <>
          <EditUserModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onUserUpdated={handleAccessUpdated}
          />

          <AccessControlModal
            open={accessModalOpen}
            onClose={() => {
              setAccessModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onAccessUpdated={handleAccessUpdated}
          />

          <RoleManagementModal
            open={roleModalOpen}
            onClose={() => {
              setRoleModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onRolesUpdated={handleAccessUpdated}
          />

          <PasswordResetModal
            open={passwordModalOpen}
            onClose={() => {
              setPasswordModalOpen(false);
              setSelectedUser(null);
            }}
            user={selectedUser}
            onPasswordReset={handleAccessUpdated}
          />
        </>
      )}

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onClose={() => setViewDetailsOpen(false)} fullWidth>
        <DialogTitle>User Details - {viewingUser?.email}</DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <Box>
            <p className="font-semibold">Email:</p>
            <p>{viewingUser?.email}</p>
          </Box>
          <Box>
            <p className="font-semibold">Username:</p>
            <p>{viewingUser?.username}</p>
          </Box>
          <Box>
            <p className="font-semibold">Phone:</p>
            <p>{viewingUser?.phone}</p>
          </Box>
          <Box>
            <p className="font-semibold">Primary Role:</p>
            <Chip label={viewingUser?.role || "viewer"} color="primary" size="small" />
          </Box>
          <Box>
            <p className="font-semibold mb-2">Assigned Roles:</p>
            {viewingUser?.roles && viewingUser.roles.length > 0 ? (
              <Box className="flex flex-wrap gap-2">
                {viewingUser.roles.map((role) => (
                  <Chip
                    key={role}
                    label={role}
                    size="small"
                    color={role === "superadmin" ? "error" : "primary"}
                    variant="outlined"
                  />
                ))}
              </Box>
            ) : (
              <p className="text-gray-500 text-sm">No additional roles assigned</p>
            )}
          </Box>
          <Box>
            <p className="font-semibold mb-2">Manual Access Control:</p>
            {viewingUser?.accessControl && Object.keys(viewingUser.accessControl).length > 0 ? (
              Object.entries(viewingUser.accessControl).map(([resource, items]) => (
                <Box key={resource} className="mb-2 p-2 bg-gray-50 rounded">
                  <p className="font-medium text-sm text-blue-600">{resource}</p>
                  {Object.entries(items).map(([itemId, operations]) => (
                    <p key={itemId} className="text-xs text-gray-600 ml-2">
                      • {itemId}: {operations.join(", ")}
                    </p>
                  ))}
                </Box>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No manual access granted</p>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
