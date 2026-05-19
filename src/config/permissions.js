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

const resolveRoleFromQuyen = (user) => {
  const normalized = normalizeRoleName(user?.quyenSuDung?.ten);

  if (normalized === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  if (normalized === APP_ROLES.KE_TOAN || normalized === "ketoan") return APP_ROLES.KE_TOAN;
  if (normalized === APP_ROLES.NHAN_VIEN || normalized === "nhanvien") return APP_ROLES.NHAN_VIEN;

  return null;
};

export const resolveAppRoleFromUser = (user) => {
  const roleFromToken = normalizeRoleName(user?.appRole);
  if (roleFromToken === APP_ROLES.ADMIN) return APP_ROLES.ADMIN;
  if (roleFromToken === APP_ROLES.KE_TOAN || roleFromToken === "ketoan") return APP_ROLES.KE_TOAN;
  if (roleFromToken === APP_ROLES.NHAN_VIEN || roleFromToken === "nhanvien") return APP_ROLES.NHAN_VIEN;

  const roleFromQuyen = resolveRoleFromQuyen(user);
  if (roleFromQuyen) return roleFromQuyen;

  return APP_ROLES.NHAN_VIEN;
};

const ROLE_PATHS = {
  [APP_ROLES.KE_TOAN]: [
    "/",
    "/don-hang",
    "/donhang",
    "/phieu-bao-hanh",
    "/mau-the-bao-hanh",
    "/ke-hoach-giao-hang",
    "/cho-xuat-hoa-don",
    "/hoa-don",
    "/phieu-thu",
    "/bao-cao",
    "/nhan-vien",
    "/bang-luong",
    "/ho-so",
  ],
  [APP_ROLES.NHAN_VIEN]: [
    "/",
    "/don-hang",
    "/donhang",
    "/phieu-bao-hanh",
    "/mau-the-bao-hanh",
    "/san-pham",
    "/cong-doan",
    "/nha-khoa",
    "/nguoi-lien-he",
    "/benh-nhan",
    "/ke-hoach-giao-hang",
    "/ho-so",
  ],
};

const doesPathMatch = (path, basePath) => {
  if (basePath === "/") return path === "/";
  return path === basePath || path.startsWith(`${basePath}/`);
};

export const hasRouteAccess = (user, path) => {
  const normalizedPath = String(path || "/").trim();
  const appRole = resolveAppRoleFromUser(user);

  if (appRole === APP_ROLES.ADMIN) return true;

  const allowedPaths = ROLE_PATHS[appRole] || [];
  return allowedPaths.some((basePath) => doesPathMatch(normalizedPath, basePath));
};

export const getDefaultPathForUser = (user) => {
  const appRole = resolveAppRoleFromUser(user);

  if (appRole === APP_ROLES.ADMIN) return "/";

  const allowedPaths = ROLE_PATHS[appRole] || ["/"];
  return allowedPaths[0] || "/";
};
