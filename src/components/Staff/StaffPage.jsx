import React from "react";
import StaffTable from "./StaffTable";
import StaffModal from "./StaffModal";
import { useSelector } from "react-redux";
import { APP_ROLES, resolveAppRoleFromUser } from "../../config/permissions";

export default function StaffPage() {
  const { user } = useSelector((state) => state.auth);

  // Kiểm tra xem user là Admin không
  const isAdmin = resolveAppRoleFromUser(user) === APP_ROLES.ADMIN;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tài khoản</h2>
        {isAdmin && <StaffModal />}
      </div>
      <StaffTable />
    </div>
  );
}
