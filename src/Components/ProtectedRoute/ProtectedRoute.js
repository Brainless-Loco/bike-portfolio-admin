import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { isSuperAdmin, hasAnyAccess } from '../../Utils/RBAC/rbacUtils';

/**
 * ProtectedRoute component for restricting access to pages/routes
 * If user doesn't have permission, shows a modal and prevents access
 * 
 * Usage:
 * <ProtectedRoute 
 *   resource="users" 
 *   operation="read"
 *   allowSuperAdmin={true}
 * >
 *   <YourComponent />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  resource,
  operation = 'read',
  allowSuperAdmin = true,
  onAccessDenied = null
}) {
  const [openModal, setOpenModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // Check permission on mount
    const checkPermission = () => {
      // SuperAdmin has access to everything
      if (allowSuperAdmin && isSuperAdmin()) {
        setHasPermission(true);
        return;
      }

      // Check specific resource/operation permission
      if (resource && operation) {
        // For read operations without wildcard access, use hasAnyAccess to check
        // if user has ANY access to the resource type (including UPDATE/DELETE which imply READ)
        const permitted = hasAnyAccess(resource, operation);
        setHasPermission(permitted);
        
        if (!permitted) {
          setOpenModal(true);
          if (onAccessDenied) onAccessDenied();
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermission();
  }, [resource, operation, allowSuperAdmin, onAccessDenied]);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleGoBack = () => {
    setOpenModal(false);
    // Navigate back
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  // Show loading state while checking permission
  if (hasPermission === null) {
    return <div>Loading...</div>;
  }

  // If user doesn't have permission
  if (!hasPermission) {
    return (
      <>
        {/* Permission Denied Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
            <ErrorIcon />
            Access Denied
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You don't have permission to access this page.
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Please contact your administrator if you believe this is a mistake.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#999' }}>
                Resource: <strong>{resource}</strong> | Operation: <strong>{operation}</strong>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleGoBack} variant="contained" color="primary">
              Go Back
            </Button>
          </DialogActions>
        </Dialog>

        {/* Blocked content */}
        <Box sx={{ p: 4, textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
            <ErrorIcon sx={{ fontSize: 60, color: '#d32f2f', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, color: '#d32f2f' }}>
              Access Denied
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              You don't have permission to access this page.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoBack}>
              Go Back to Dashboard
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  // User has permission, render children
  return children;
}
