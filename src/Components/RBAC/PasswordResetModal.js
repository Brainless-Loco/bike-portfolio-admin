import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Swal from "sweetalert2";
import { updateUserPassword } from "../../Utils/RBAC/rbacUtils";

const PasswordResetModal = ({ open, onClose, user, onPasswordReset }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      setError("Both password fields are required");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    setError("");

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      await updateUserPassword(user.id, password);
      Swal.fire("Success", "Password updated successfully", "success");
      onPasswordReset();
      handleClose();
    } catch (error) {
      const errorMsg = error.message || "Failed to update password";
      setError(errorMsg);
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reset Password - {user?.email}</DialogTitle>
      <DialogContent className="space-y-4 pt-4">
        <Alert severity="warning">
          ⚠️ Resetting the password will require the user to log in again with the new password.
        </Alert>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ backgroundColor: "#e3f2fd", p: 2, borderRadius: 1 }}>
          <p className="font-semibold text-sm text-gray-700 mb-3">User Details:</p>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Username:</strong> {user?.username}
          </p>
        </Box>

        <TextField
          label="New Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="Minimum 6 characters"
        />

        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleResetPassword}
          variant="contained"
          color="warning"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Reset Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordResetModal;
