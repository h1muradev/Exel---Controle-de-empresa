export const Roles = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  VIEWER: "VIEWER"
} as const;

export const Permissions = {
  VIEW_SENSITIVE: "VIEW_SENSITIVE"
} as const;

export function hasRole(role: string, allowed: string[]) {
  return allowed.includes(role);
}

export function hasPermission(permissions: string[], required: string) {
  return permissions.includes(required);
}
