import React, { useState } from "react";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";

export default function DonHangChuaXuatPage() {
  const [selectedClinic, setSelectedClinic] = useState(null); // null = chưa chọn
  const [selectedOrders, setSelectedOrders] = useState([]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* SIDEBAR TRÁI */}
      <DonHangChuaXuatSidebar
        selectedClinic={selectedClinic}
        setSelectedClinic={setSelectedClinic}
      />

      {/* NỘI DUNG PHẢI */}
      <div className="flex-1 flex flex-col overflow-hidden">
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
