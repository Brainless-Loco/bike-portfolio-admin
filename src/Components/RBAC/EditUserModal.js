import { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import Swal from "sweetalert2";
import { updateUserInfo, isSuperAdmin } from "../../Utils/RBAC/rbacUtils";

const EditUserModal = ({ open, onClose, user, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    currentPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (user && open) {
      setFormData({
        email: user.email || "",
        username: user.username || "",
        currentPassword: user.password || "",
      });
      setError("");
      setSuccess("");
    }
  }, [open, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.username) {
      setError("Email and username are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    // Check if anything was actually changed
    if (
      formData.email === user.email &&
      formData.username === user.username
    ) {
      setError("No changes made");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Update user info
      await updateUserInfo(user.id, {
        email: formData.email,
        username: formData.username,
      });

      setSuccess("User information updated successfully!");
      
      // Call the callback to refresh user list
      if (onUserUpdated) {
        onUserUpdated();
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user information");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.currentPassword);
    Swal.fire({
      title: "Copied!",
      text: "Password copied to clipboard",
      icon: "success",
      timer: 2000,
    });
  };

  // Only SuperAdmin can edit users
  if (!isSuperAdmin()) {
    return (
      <Dialog open={open} onClose={onClose}  fullWidth>
        <DialogTitle sx={{ color: "#d32f2f" }}>Access Denied</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Only SuperAdmins can edit user information.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle sx={{ fontWeight: "bold", color: "#1976d2" }}>
        Edit User Information
      </DialogTitle>
      <DialogContent sx={{ minHeight: "350px" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Email Field */}
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            variant="outlined"
            size="small"
          />

          {/* Username Field */}
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            variant="outlined"
            size="small"
          />

          {/* Current Password Display */}
          <Box>
            <Typography variant="caption" sx={{ color: "#666", mb: 1 }}>
              Current Password (Encrypted/Base64)
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              value={formData.currentPassword}
              disabled={true}
              variant="outlined"
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCopyPassword}
                      edge="end"
                      title="Copy to clipboard"
                    >
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="caption" sx={{ color: "#999", display: "block", mt: 0.5 }}>
              Note: To change password, use the Password Reset option
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSaveChanges}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
