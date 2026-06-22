import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";
import { fetchDonHangChuaHoaDonAll } from "../../redux/slices/hoaDonSlice";
import { fetchAllBangGia } from "../../redux/slices/bangGiaSlice";

export default function DonHangChuaXuatPage() {
  const dispatch = useDispatch();

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // FETCH ALL DATA 1 LẦN DUY NHẤT CHO CẢ FILTER VÀ TABLE DÙNG CHUNG
  useEffect(() => {
    dispatch(fetchDonHangChuaHoaDonAll());
    dispatch(fetchAllBangGia());
  }, [dispatch]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-screen md:overflow-hidden">
      <div className="w-full md:w-auto md:h-full max-h-[35vh] md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto">
        <DonHangChuaXuatSidebar
          selectedClinic={selectedClinic}
          setSelectedClinic={setSelectedClinic}
        />
      </div>

      <div className="flex-1 flex flex-col md:overflow-hidden md:min-h-0 pt-2 md:pt-0 min-h-[580px]">
        <div className="flex items-center justify-between px-4 py-2 border-b bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Chờ xuất Hóa đơn</span>
          </div>
        </div>

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