import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Tooltip, Alert, Divider, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import useLogout from './../../Components/Auth/useLogOut';
import useAuthRedirect from './../../Components/Auth/useAuthRedirect';
import { getCurrentUser, isSuperAdmin, hasAnyAccess, RESOURCE_TYPES, getUserEffectivePermissions } from '../../Utils/RBAC/rbacUtils';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';

const routes = {
  insert: [
    { path: "/add-new/researcher", label: "Researcher", resource: RESOURCE_TYPES.RESEARCHERS, operation: "create" },
    { path: "/add-new/activity", label: "Activity", resource: RESOURCE_TYPES.ACTIVITIES, operation: "create" },
    { path: "/add-new/researches", label: "Publication", resource: RESOURCE_TYPES.PUBLICATIONS, operation: "create" },
    // { path: "/add-new/teaching-courses", label: "Add Teaching Course" },
    { path: "/add-new/partner", label: "Partner", resource: RESOURCE_TYPES.PARTNERS, operation: "create" },
    { path: "/add-new/project", label: "Project", resource: RESOURCE_TYPES.PROJECTS, operation: "create" },
    // { path: "/add-new/dataset", label: "Dataset" },
    { path: "/add-new/vacancy", label: "Vacancy", resource: RESOURCE_TYPES.VACANCIES, operation: "create" },
  ],
  update: [
    // { path: "/update", label: "Update Basic Info" },
    { path: "/update/researchers", label: "Researchers", resource: RESOURCE_TYPES.RESEARCHERS, operation: "update" },
    { path: "/update/activities", label: "Activities", resource: RESOURCE_TYPES.ACTIVITIES, operation: "update" },
    { path: "/update/publications", label: "Publications", resource: RESOURCE_TYPES.PUBLICATIONS, operation: "update" },
    { path: "/update/projects", label: "Projects", resource: RESOURCE_TYPES.PROJECTS, operation: "update" },
    { path: "/update/vacancy", label: "Vacancy", resource: RESOURCE_TYPES.VACANCIES, operation: "update" },
  ],
  read: [
    { path: "/view/researchers", label: "Researchers", resource: RESOURCE_TYPES.RESEARCHERS, operation: "read" },
    { path: "/view/activities", label: "Activities", resource: RESOURCE_TYPES.ACTIVITIES, operation: "read" },
    { path: "/view/publications", label: "Publications", resource: RESOURCE_TYPES.PUBLICATIONS, operation: "read" },
    { path: "/view/projects", label: "Projects", resource: RESOURCE_TYPES.PROJECTS, operation: "read" },
  ],
  others:[
    { path: "/others/messages", label: "Messages", resource: "messages", operation: "read" },
    { path: "/others/applications", label: "Applications", resource: RESOURCE_TYPES.APPLICATIONS, operation: "read" },
    { path: "/others/scrolling-news", label: "Scrolling News" },
    { path: "/others/featured-members", label: "Featured Team Members", resource: RESOURCE_TYPES.FEATURED_MEMBERS, operation: "update", superAdminOnly: true },
    { path:"https://docs.google.com/document/d/16z6ZEAPfC5lMZLSaejWE0uvK1HDtF4Anr5YwBGWNqpg/edit?usp=sharing", label:"Server Set up WIKI", target:"__blank"}
  ],
  rbac: [
    { path: "/rbac/users", label: "Manage Users", superAdminOnly: true },
    { path: "/rbac/roles", label: "Manage Roles", superAdminOnly: true },
  ]
};

/**
 * Check if user has access to a route
 */
const canAccessRoute = (route) => {
  // SuperAdmin has access to everything
  if (isSuperAdmin()) return true;

  // External links are accessible by default
  if (route.path?.startsWith("http")) return true;

  // Check resource-based access
  if (route.resource && route.operation) {
    // Use hasAnyAccess to check if user has ANY access to resources of this type
    // This includes wildcard access OR specific resource access
    return hasAnyAccess(route.resource, route.operation);
  }

  // Default to true for routes without explicit permissions
  return true;
};

/**
 * Check if a section should be visible (if user has ANY access to resources in that section)
 */
const shouldShowSection = (sectionRoutes) => {
  // SuperAdmin sees everything
  if (isSuperAdmin()) return true;
  
  // Check if user has access to ANY route in the section
  return sectionRoutes.some(route => {
    // External links don't count
    if (route.path?.startsWith("http")) return false;
    
    // Check if user has ANY access to this resource
    if (route.resource && route.operation) {
      return hasAnyAccess(route.resource, route.operation);
    }
    
    return false;
  });
};

export default function Dashboard() {
  useAuthRedirect();
  const logout = useLogout();
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const isSuperAdminUser = isSuperAdmin();
  const [loading, setLoading] = useState(true);

  // Reload permissions from Firebase on mount
  useEffect(() => {
    const reloadPermissions = async () => {
      try {
        setLoading(true);
        // Get fresh user data from Firestore
        await getUserEffectivePermissions();
        // Update currentUser state to trigger re-render
        const updatedUser = getCurrentUser();
        console.log("=== Dashboard Loaded ===");
        console.log("User ID:", updatedUser?.id);
        console.log("User Email:", updatedUser?.email);
        console.log("Access Control:", updatedUser?.accessControl);
        console.log("Effective Permissions:", updatedUser?.effectivePermissions);
        setCurrentUser(updatedUser);
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    reloadPermissions();
  }, []);

  // Filter routes based on RBAC - recalculate whenever currentUser changes
  // currentUser is used indirectly through hasAccess() and isSuperAdmin()
  const accessibleInsertRoutes = routes.insert.filter(canAccessRoute);
  const accessibleUpdateRoutes = routes.update.filter(canAccessRoute);
  const accessibleReadRoutes = routes.read.filter(canAccessRoute);
  const accessibleOthersRoutes = routes.others.filter(canAccessRoute);

  const hasRestrictedAccess = 
    accessibleInsertRoutes.length < routes.insert.length ||
    accessibleUpdateRoutes.length < routes.update.length ||
    accessibleReadRoutes.length < routes.read.length ||
    accessibleOthersRoutes.length < routes.others.length;

  return (
    <Box sx={{ padding: "50px 5%", minHeight:'100vh' }}>
      <Box className="flex justify-between items-center flex-wrap"> 
        <Typography variant="h2" sx={{ color: "blue", mb: 3 }}>
          BIKE Admin Dashboard
        </Typography>
        {/* log out button */}
        <Button variant="contained" color="error" sx={{ minWidth: 200, p: 2, borderRadius: 2 }} onClick={logout}>Log Out</Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* User Info Box */}
          <Box
            sx={{
              backgroundColor: "#e3f2fd",
              border: "2px solid #2196f3",
              p: 2,
              borderRadius: 1,
              mb: 4,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <InfoIcon color="info" />
            <Box>
              <p className="font-semibold text-gray-700">
                Welcome, {currentUser?.username || "User"}
              </p>
              <p className="text-sm text-gray-600">
                Role: <span className="font-medium">{currentUser?.role || "viewer"}</span>
                {currentUser?.roles && currentUser.roles.length > 0 && (
                  <span className="ml-2">
                    + {currentUser.roles.length} additional role{currentUser.roles.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </Box>
          </Box>

      {/* Access Restricted Warning */}
      {hasRestrictedAccess && !isSuperAdminUser && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠️ Some features are restricted based on your permissions. Buttons for features you don't have access to are disabled.
        </Alert>
      )}

      {/* Insert Section */}
      {shouldShowSection(routes.insert) && (
        <>
          <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
            Insert
          </Typography>
          {accessibleInsertRoutes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              <LockIcon sx={{ mr: 1, fontSize: 18 }} />
              You don't have permission to create new items. Contact your administrator.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
              {routes.insert.map((route) => {
                const hasAccessToRoute = canAccessRoute(route);
                return (
                  <Tooltip
                    key={route.path}
                    title={!hasAccessToRoute ? "You don't have permission to access this" : ""}
                    arrow
                  >
                    <span>
                      <Button
                        component={Link}
                        to={hasAccessToRoute ? route.path : "#"}
                        variant="contained"
                        disabled={!hasAccessToRoute}
                        sx={{
                          bgcolor: hasAccessToRoute ? "#1976d2" : "#ccc",
                          color: "white",
                          minWidth: 200,
                          p: 2,
                          borderRadius: 2,
                          cursor: hasAccessToRoute ? "pointer" : "not-allowed",
                          opacity: hasAccessToRoute ? 1 : 0.6,
                        }}
                      >
                        {route.label}
                        {!hasAccessToRoute && <LockIcon sx={{ ml: 1, fontSize: 18 }} />}
                      </Button>
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </>
      )}

      {/* Update Section */}
      {shouldShowSection(routes.update) && (
        <>
          <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
            Update
          </Typography>
          {accessibleUpdateRoutes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              <LockIcon sx={{ mr: 1, fontSize: 18 }} />
              You don't have permission to update items. Contact your administrator.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb:4 }}>
              {routes.update.map((route) => {
                const canAccess = canAccessRoute(route);
                return (
                  <Tooltip
                    key={route.path}
                    title={!canAccess ? "You don't have permission to access this" : ""}
                    arrow
                  >
                    <span>
                      <Button
                        component={Link}
                        to={canAccess ? route.path : "#"}
                        variant="contained"
                        disabled={!canAccess}
                        sx={{
                          bgcolor: canAccess ? "#ff9800" : "#ccc",
                          color: "white",
                          minWidth: 200,
                          p: 2,
                          borderRadius: 2,
                          cursor: canAccess ? "pointer" : "not-allowed",
                          opacity: canAccess ? 1 : 0.6,
                        }}
                      >
                        {route.label}
                        {!canAccess && <LockIcon sx={{ ml: 1, fontSize: 18 }} />}
                      </Button>
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </>
      )}

      {/* Read Section */}
      {shouldShowSection(routes.read) && (
        <>
          <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
            View
          </Typography>
          {accessibleReadRoutes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              <LockIcon sx={{ mr: 1, fontSize: 18 }} />
              You don't have permission to view items. Contact your administrator.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
              {routes.read.map((route) => {
                const canAccess = canAccessRoute(route);
                return (
                  <Tooltip
                    key={route.path}
                    title={!canAccess ? "You don't have permission to access this" : ""}
                    arrow
                  >
                    <span>
                      <Button
                        component={Link}
                        to={canAccess ? route.path : "#"}
                        variant="contained"
                        disabled={!canAccess}
                        sx={{
                          bgcolor: canAccess ? "#1976d2" : "#ccc",
                          color: "white",
                          minWidth: 200,
                          p: 2,
                          borderRadius: 2,
                          cursor: canAccess ? "pointer" : "not-allowed",
                          opacity: canAccess ? 1 : 0.6,
                        }}
                      >
                        {route.label}
                        {!canAccess && <LockIcon sx={{ ml: 1, fontSize: 18 }} />}
                      </Button>
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </>
      )}

      {/* Others Section */}
      {shouldShowSection(routes.others) && (
        <>
          <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #1976d2" }}>
            Others
          </Typography>
          {accessibleOthersRoutes.length === 0 ? (
            <Alert severity="info" sx={{ mb: 4 }}>
              <LockIcon sx={{ mr: 1, fontSize: 18 }} />
              You don't have permission to access these features. Contact your administrator.
            </Alert>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 4 }}>
              {accessibleOthersRoutes.map((route) => (
                <Button
                  key={route.path}
                  component={Link}
                  to={route.path}
                  target={route.target ?? ""}
                  variant="contained"
                  sx={{ bgcolor: "#014a0e", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
                >
                  {route.label}
                </Button>
              ))}
            </Box>
          )}
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* RBAC Section - Only for SuperAdmin */}
      {isSuperAdminUser && (
        <>
          <Typography variant="h5" sx={{ mb: 2, pb: 1, borderBottom: "2px solid #9c27b0" }}>
            Access Control
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {routes.rbac.map((route) => (
              <Button
                key={route.path}
                component={Link}
                to={route.path}
                variant="contained"
                sx={{ bgcolor: "#9c27b0", color: "white", minWidth: 200, p: 2, borderRadius: 2 }}
              >
                {route.label}
              </Button>
            ))}
          </Box>
        </>
      )}
        </>
      )}
    </Box>
  );
}
