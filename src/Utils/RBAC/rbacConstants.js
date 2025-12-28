/**
 * RBAC Constants and Types
 * Centralized definitions for resource types, operations, and roles
 */

export const RESOURCE_TYPES = {
  RESEARCHERS: "researchers",
  PUBLICATIONS: "publications",
  PROJECTS: "projects",
  TEACHINGS: "teachings",
  ACTIVITIES: "activities",
  RESEARCHES: "researches",
  PARTNERS: "partners",
  DATASETS: "datasets",
  VACANCIES: "vacancies",
  APPLICATIONS: "applications",
  BASIC_INFO: "basicInfo",
  USERS: "users",
  FEATURED_MEMBERS: "featuredMembers"
};

export const OPERATIONS = {
  CREATE: "C",
  READ: "R",
  UPDATE: "U",
  DELETE: "D"
};

export const ALL_OPERATIONS = [OPERATIONS.CREATE, OPERATIONS.READ, OPERATIONS.UPDATE, OPERATIONS.DELETE];

export const PREDEFINED_ROLES = {
  SUPER_ADMIN: "superadmin",
  EDITOR: "editor",
  VIEWER: "viewer",
  CONTRIBUTOR: "contributor"
};
