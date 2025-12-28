import { useEffect, useState, useCallback } from "react";
import { hasAccess, isSuperAdmin, getCurrentUser, getUserEffectivePermissions } from "../Utils/RBAC/rbacUtils";

/**
 * Custom hook for checking user RBAC permissions
 * 
 * Usage:
 * const { canRead, canCreate, canUpdate, canDelete } = useRBAC("projects");
 * 
 * Or check with specific resource ID:
 * const canEdit = useRBAC("projects").canUpdate("project-123");
 */
export const useRBAC = (resourceType) => {
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // SuperAdmin has all permissions
        if (isSuperAdmin()) {
          setPermissions({
            canCreate: true,
            canRead: true,
            canUpdate: true,
            canDelete: true,
          });
          return;
        }

        // Check specific resource permissions
        const perms = {
          canCreate: hasAccess(resourceType, "create"),
          canRead: hasAccess(resourceType, "read"),
          canUpdate: hasAccess(resourceType, "update"),
          canDelete: hasAccess(resourceType, "delete"),
        };

        setPermissions(perms);
      } catch (error) {
        console.error("Error loading RBAC permissions:", error);
        setPermissions({
          canCreate: false,
          canRead: false,
          canUpdate: false,
          canDelete: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [resourceType]);

  const checkAccess = useCallback((operation, resourceId = "*") => {
    return hasAccess(resourceType, operation, resourceId);
  }, [resourceType]);

  return {
    ...permissions,
    isLoading,
    user,
    checkAccess,
    isSuperAdmin: isSuperAdmin(),
  };
};

/**
 * Hook to check if user has any of specified operations on a resource
 * 
 * Usage:
 * const hasEditPerms = useResourcePermission("projects", ["update", "delete"]);
 */
export const useResourcePermission = (resourceType, operations = []) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(true);

      if (isSuperAdmin()) {
        setHasPermission(true);
        return;
      }

      // Check if user has any of the specified operations
      const allowed = operations.some(op => hasAccess(resourceType, op));
      setHasPermission(allowed);
    } catch (error) {
      console.error("Error checking resource permission:", error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, [resourceType, operations]);

  return { hasPermission, isLoading };
};

/**
 * Hook to get user's effective permissions for a role
 * 
 * Usage:
 * const perms = useEffectivePermissions("role-123");
 */
export const useEffectivePermissions = (roleId) => {
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setIsLoading(true);
        const perms = await getUserEffectivePermissions(roleId);
        setPermissions(perms);
      } catch (err) {
        console.error("Error loading effective permissions:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [roleId]);

  return { permissions, isLoading, error };
};

export default useRBAC;
