export const APP_ROLES = {
  ADMIN: "admin",
  KE_TOAN: "ke-toan",
  NHAN_VIEN: "nhan-vien",
};

const normalizeRoleName = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-");

export const resolveAppRoleFromUser = (user) => {
  const roleFromToken = normalizeRoleName(user?.appRole);
  if (roleFromToken === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  
  const roleFromQuyen = normalizeRoleName(user?.quyenSuDung?.ten);
  if (roleFromQuyen === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;

  return APP_ROLES.NHAN_VIEN;
};

const doesPathMatch = (path, basePath) => {
  if (basePath === "/") return path === "/";
  if (basePath === "/don-hang" && path.startsWith("/donhang")) return true;
  return path === basePath || path.startsWith(`${basePath}/`);
};

export const hasRouteAccess = (user, path) => {
  const normalizedPath = String(path || "/").trim();
  
  if (normalizedPath.startsWith("/ho-so")) return true;

  const appRole = resolveAppRoleFromUser(user);
  const permissions = user?.quyenSuDung?.permissions;

  // Fallback cho admin cũ chưa có permissions để tránh bị khóa
  if (appRole === APP_ROLES.ADMIN && (!permissions || permissions.length === 0)) {
    return true; 
  }

  if (permissions && Array.isArray(permissions)) {
    return permissions.some((basePath) => doesPathMatch(normalizedPath, basePath));
  }

  return false;
};

export const getDefaultPathForUser = (user) => {
  const permissions = user?.quyenSuDung?.permissions;
  if (permissions && Array.isArray(permissions) && permissions.length > 0) {
    return permissions[0];
  }

  const appRole = resolveAppRoleFromUser(user);
  if (appRole === APP_ROLES.ADMIN) return "/";

  return "/ho-so";
};
