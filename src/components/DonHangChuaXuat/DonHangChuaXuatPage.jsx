import React, { useState } from "react";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";

export default function DonHangChuaXuatPage() {
  const [selectedClinic, setSelectedClinic] = useState(null); // null = chưa chọn
  const [selectedOrders, setSelectedOrders] = useState([]);

  return (
    <div className="flex h-screen overflow-hidden bg-white flex-col md:flex-row">
      {/* SIDEBAR TRÁI — desktop: cột trái | mobile: 50% chiều cao trên */}
      <div className="md:h-full h-[50%] md:w-auto w-full flex-shrink-0 border-r md:border-r border-b md:border-b-0 overflow-hidden overflow-y-auto">
        <DonHangChuaXuatSidebar
          selectedClinic={selectedClinic}
          setSelectedClinic={setSelectedClinic}
        />
      </div>

      {/* NỘI DUNG PHẢI — desktop: cột phải | mobile: 50% chiều cao dưới */}
      <div className="mt-5 md:mt-0 flex-1 flex flex-col overflow-hidden">
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