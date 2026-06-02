import React, { useEffect, useMemo, useState } from "react";
import { Typography, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import {
  fetchCountDonHangChuaXuat,
  fetchNgayXuatHoaDonGanNhatAll,
} from "../../redux/slices/hoaDonSlice";

export default function DonHangChuaXuatFilter({
  selectedClinic,
  setSelectedClinic,
}) {
  const [searchText, setSearchText] = useState(""); // ✅ thêm state search

  const dispatch = useDispatch();
  const { data = [], loading: loadingNhaKhoa } = useSelector(
    (state) => state.nhaKhoa
  );
  const {
    countDonHangChuaXuat = [],
    ngayXuatHoaDonGanNhatAll = [],
    loading: loadingHoaDon,
  } = useSelector((state) => state.hoaDon);

  // Gộp trạng thái loading của cả 2 luồng dữ liệu
  const isGlobalLoading = loadingNhaKhoa || loadingHoaDon;

  useEffect(() => {
    dispatch(fetchNhaKhoa());
    dispatch(fetchCountDonHangChuaXuat());
    dispatch(fetchNgayXuatHoaDonGanNhatAll());
  }, [dispatch]);

  /* ================= MAP DATA ================= */
  const infoMap = useMemo(() => {
    const map = {};

    // 1. Map số lượng đơn hàng chưa xuất hóa đơn trước
    countDonHangChuaXuat.forEach((item) => {
      map[item.nhaKhoaId] = {
        count: item.soDonHangChuaXuatHoaDon || 0,
        ngayXuatHoaDonCuoi: null, // Giá trị mặc định ban đầu
      };
    });

    // 2. 🔥 Trộn dữ liệu ngày xuất hóa đơn gần nhất dựa trên cấu trúc JSON thực tế
    ngayXuatHoaDonGanNhatAll.forEach((item) => {
      const clinicId = item.nhaKhoaId;

      if (clinicId) {
        if (!map[clinicId]) {
          map[clinicId] = { count: 0, ngayXuatHoaDonCuoi: null };
        }
        // Truy cập chính xác vào: item.hoaDonGanNhat.ngayXuatHoaDon
        map[clinicId].ngayXuatHoaDonCuoi =
          item.hoaDonGanNhat?.ngayXuatHoaDon || null;
      }
    });

    return map;
  }, [countDonHangChuaXuat, ngayXuatHoaDonGanNhatAll]);

  const formatDate = (date) => {
    if (!date) return "Chưa xuất";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Sắp xếp theo số đơn giảm dần
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const countA = infoMap[a._id]?.count || 0;
      const countB = infoMap[b._id]?.count || 0;
      return countB - countA;
    });
  }, [data, infoMap]);

  const selectedNhaKhoa = data.find((nk) => nk._id === selectedClinic);

  const filteredData = useMemo(() => {
    return sortedData
      .filter((nk) => (infoMap[nk._id]?.count || 0) > 0)
      .filter((nk) =>
        !searchText.trim() ||
        nk.hoVaTen?.toLowerCase().includes(searchText.toLowerCase().trim())
      );
  }, [sortedData, searchText, infoMap]);

  return (
    <div className="w-52 md:w-52 w-full flex-shrink-0 border-r flex flex-col bg-white overflow-hidden">
      <div className="px-3 py-2 border-b bg-white">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2.5"
            className="flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm nha khoa..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* SELECTED CLINIC CHIP ở trên cùng */}
      {selectedClinic && selectedNhaKhoa && (
        <div className="px-3 pt-3 pb-2 border-b bg-gray-50 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: "#1976d2" }}
          >
            {selectedNhaKhoa.hoVaTen?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              fontSize={10}
            >
              Khách hàng
            </Typography>
            <Typography
              fontSize={12}
              fontWeight={700}
              noWrap
              className="text-gray-800"
            >
              {selectedNhaKhoa.hoVaTen}
            </Typography>
          </div>
          <button
            className="text-gray-400 hover:text-gray-700 flex-shrink-0"
            onClick={() => setSelectedClinic(null)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        {isGlobalLoading ? (
          <div className="flex justify-center py-8">
            <CircularProgress size={20} />
          </div>
        ) : filteredData.length === 0 ? (
          // ✅ Hiển thị khi không tìm thấy
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-xs mt-2">Không tìm thấy nha khoa</p>
          </div>
        ) : (
          filteredData.map((nk, idx) => {
            const info = infoMap[nk._id] || {
              count: 0,
              ngayXuatHoaDonCuoi: null,
            };
            const isSelected = selectedClinic === nk._id;

            return (
              <div
                key={nk._id}
                className={`px-3 py-1 cursor-pointer border-b border-gray-300 transition-colors ${isSelected
                  ? "bg-blue-50 border-l-2 border-l-blue-500"
                  : "hover:bg-gray-100 border-l-2 border-l-transparent"
                  }`}
                onClick={() => setSelectedClinic(nk._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Typography
                      fontSize={13}
                      fontWeight={isSelected ? 700 : 600}
                      noWrap
                      color={isSelected ? "primary" : "text.primary"}
                    >
                      {nk.hoVaTen}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontSize={12}
                    >
                      Hóa đơn cuối: {formatDate(info.ngayXuatHoaDonCuoi)}
                    </Typography>
                  </div>
                  {info.count > 0 && (
                    <span
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: "#ed6c02" }}
                    >
                      {info.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}