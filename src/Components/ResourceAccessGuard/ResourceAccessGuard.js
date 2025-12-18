import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { hasAccess, isSuperAdmin } from '../../Utils/RBAC/rbacUtils';

/**
 * ResourceAccessGuard component for protecting access to specific resources
 * Checks if user has permission to access/edit a specific resource ID
 * 
 * Usage:
 * <ResourceAccessGuard 
 *   resource="researchers" 
 *   operation="update"
 *   resourceId={id}
 * >
 *   <YourComponent />
 * </ResourceAccessGuard>
 */
export default function ResourceAccessGuard({
  children,
  resource,
  operation = 'read',
  resourceId
}) {
  const [openModal, setOpenModal] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    // Check permission on mount
    const checkPermission = () => {
      if (!resource || !resourceId) {
        setHasPermission(true);
        return;
      }

      // SuperAdmin has access to everything
      if (isSuperAdmin()) {
        setHasPermission(true);
        return;
      }

      // Check specific resource access
      const permitted = hasAccess(resource, operation, resourceId);
      setHasPermission(permitted);
      
      if (!permitted) {
        setOpenModal(true);
      }
    };

    checkPermission();
  }, [resource, operation, resourceId]);

  const handleGoBack = () => {
    setOpenModal(false);
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
        <Dialog open={openModal} onClose={handleGoBack}  fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#d32f2f' }}>
            <ErrorIcon />
            Access Denied
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You don't have permission to access this resource.
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Please contact your administrator if you believe this is a mistake.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#999' }}>
                Resource: <strong>{resource}</strong> | ID: <strong>{resourceId}</strong>
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
              You don't have permission to access this resource.
            </Typography>
            <Button variant="contained" color="primary" onClick={handleGoBack}>
              Go Back
            </Button>
          </Box>
        </Box>
      </>
    );
  }

  // User has permission, render children
  return children;
}
