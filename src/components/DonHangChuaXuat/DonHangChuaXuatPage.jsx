import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import DonHangChuaXuatTable from "./DonHangChuaXuatTable";
import DonHangChuaXuatSidebar from "./DonHangChuaXuatFilter";
import {
  fetchCountDonHangChuaXuat,
  fetchNgayXuatHoaDonGanNhatAll,
} from "../../redux/slices/hoaDonSlice";
import { fetchAllBangGia } from "../../redux/slices/bangGiaSlice";

export default function DonHangChuaXuatPage() {
  const dispatch = useDispatch();

  const { loadingMeta } = useSelector((state) => state.hoaDon);
  const { loading: loadingBangGia } = useSelector((state) => state.bangGia);
  const isInitialLoading = loadingMeta || loadingBangGia;

  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Chỉ fetch metadata cho sidebar + bảng giá
  // Đơn hàng sẽ được fetch lazy khi user click vào từng nha khoa
  useEffect(() => {
    dispatch(fetchCountDonHangChuaXuat());
    dispatch(fetchNgayXuatHoaDonGanNhatAll());
    dispatch(fetchAllBangGia());
  }, [dispatch]);

  return (
    <div className="flex flex-col md:flex-row bg-white md:h-screen md:overflow-hidden relative">
      {isInitialLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
          <CircularProgress size={32} sx={{ color: "#00a8df" }} />
          <span className="text-sm text-gray-500">Đang tải dữ liệu...</span>
        </div>
      )}
      <div className="w-full md:w-auto md:h-full max-h-[35vh] md:max-h-none flex-shrink-0 border-b md:border-b-0 md:border-r overflow-y-auto">
        <DonHangChuaXuatSidebar
          selectedClinic={selectedClinic}
          setSelectedClinic={(clinicId) => {
            setSelectedClinic(clinicId);
            setSelectedOrders([]); // Reset selection khi đổi clinic
          }}
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