/**
 * Nếu có nhiều bản ghi cùng nhân viên trong tháng,
 * giữ lại bản mới nhất (updatedAt lớn nhất).
 */
export function dedupSalary(data = []) {
  const map = new Map();
  for (const item of data) {
    const key = item.nhanVien?._id ?? item.nhanVien;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, item);
    } else {
      const t1 = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const t2 = item.updatedAt ? new Date(item.updatedAt).getTime() : 1;
      if (t2 > t1) map.set(key, item);
    }
  }
  return Array.from(map.values());
}