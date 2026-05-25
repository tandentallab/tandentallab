import React, { useState } from "react";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";

export default function DonHangChuaXuatPage() {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  return (
    // Desktop: h-screen fixed layout. Mobile: scroll tự nhiên
    <div className="flex flex-col md:flex-row bg-white md:h-screen md:overflow-hidden">

      {/* SIDEBAR TRÁI */}
      {/* Mobile: max-h cố định + scroll riêng. Desktop: full height */}
      <div className="w-full md:w-auto md:h-full max-h-[35vh] md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto">
        <DonHangChuaXuatSidebar
          selectedClinic={selectedClinic}
          setSelectedClinic={setSelectedClinic}
        />
      </div>

      {/* NỘI DUNG PHẢI */}
      {/* Mobile: min-h để bảo đảm table đủ chỗ. Desktop: flex-1 fill */}
      <div className="flex-1 flex flex-col md:overflow-hidden md:min-h-0 pt-2 md:pt-0 min-h-[580px]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Chờ xuất Hóa đơn</span>
          </div>
        </div>

        {/* TABLE AREA */}
        {/* Mobile: min-h ~10 dòng (~52px/dòng) + toolbar + footer ≈ 560px */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-[520px] md:min-h-0">
          <DonHangChuaXuatTable
            selectedClinic={selectedClinic}
            selectedOrders={selectedOrders}
            setSelectedOrders={setSelectedOrders}
          />
        </div>

      </div>
    </div>
  );
}