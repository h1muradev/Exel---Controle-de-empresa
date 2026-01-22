const roleLevels = {
  ADMIN: 3,
  MANAGER: 2,
  VIEWER: 1
};

export function requireRole(user, minRole) {
  if (!user || roleLevels[user.role] < roleLevels[minRole]) {
    return false;
  }
  return true;
}

export function canViewSensitive(user) {
  return Boolean(user && user.can_view_sensitive);
}
