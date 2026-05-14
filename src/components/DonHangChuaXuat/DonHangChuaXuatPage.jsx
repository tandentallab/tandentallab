import React, { useState } from "react";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatFilter from "./DonHangChuaXuatFilter";

export default function DonHangChuaXuatPage() {
  const [selectedClinic, setSelectedClinic] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Chờ xuất hóa đơn</h2>

      <DonHangChuaXuatFilter
        selectedClinic={selectedClinic}
        setSelectedClinic={setSelectedClinic}
      />

      <DonHangChuaXuatTable
        selectedClinic={selectedClinic}
        selectedOrders={selectedOrders}
        setSelectedOrders={setSelectedOrders}
      />
    </div>
  );
}
