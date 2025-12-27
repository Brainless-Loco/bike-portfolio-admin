import { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";
import { createAdminUser } from "../../Utils/RBAC/rbacUtils";

const CreateUserModal = ({ open, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.username || !formData.phone || !formData.password) {
      setError("All fields are required");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newUser = await createAdminUser({
        email: formData.email,
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
      });

      Swal.fire("Success", "User created successfully!", "success");
      onUserCreated(newUser);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to create user");
      Swal.fire("Error", err.message || "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      username: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}  fullWidth>
      <DialogTitle>Create New Admin User</DialogTitle>
      <DialogContent className="space-y-4 pt-4">
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          name="email"
          fullWidth
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Username"
          name="username"
          fullWidth
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Phone"
          name="phone"
          fullWidth
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          fullWidth
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          fullWidth
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleCreateUser} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;
