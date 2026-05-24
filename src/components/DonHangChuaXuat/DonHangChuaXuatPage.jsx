import React, { useState } from "react";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";

export default function DonHangChuaXuatPage() {
  const [selectedClinic, setSelectedClinic] = useState(null); // null = chưa chọn
  const [selectedOrders, setSelectedOrders] = useState([]);

  return (
    // 1. Dùng min-h-screen trên mobile để trang có thể kéo dài. 
    // Chỉ giới hạn h-screen và overflow-hidden khi ở màn hình lớn (md:)
    <div className="flex flex-col md:flex-row bg-white min-h-screen md:h-screen md:overflow-hidden">

      {/* SIDEBAR TRÁI */}
      {/* 2. Đổi h-[50%] thành max-h-[50vh] để sidebar tự giới hạn chiều cao và scroll được bên trong khi ở mobile */}
      <div className="w-full md:w-auto md:h-full max-h-[50vh] md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto">
        <DonHangChuaXuatSidebar
          selectedClinic={selectedClinic}
          setSelectedClinic={setSelectedClinic}
        />
      </div>

      {/* NỘI DUNG PHẢI */}
      {/* 3. Bỏ mt-5 (margin top làm đẩy content xuống gây cắt xén). Thêm min-h-[70vh] để bảng có đủ không gian render trên mobile */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-[70vh] md:min-h-0 pt-2 md:pt-0">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Chờ xuất Hóa đơn</span>
            {/* icon filter & refresh */}
          </div>
        </div>

        {/* TABLE AREA */}
        <DonHangChuaXuatTable
          selectedClinic={selectedClinic}
          selectedOrders={selectedOrders}
          setSelectedOrders={setSelectedOrders}
        />
      </div>
    </div>
  );
}