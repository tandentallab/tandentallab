// pages/Kho/KhoPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVatLieu,
  fetchNhaCungCap,
  setVatLieuFilters,
  resetVatLieuFilters,
} from "../../redux/slices/khoSlice";
import VatLieuTable from "./VatLieuTable";
import NhapXuatTable from "./NhapXuatKho/NhapXuatTable";
import NhaCungCapTable from "./NhaCungCapTable";
import { Box, Tab, Tabs } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoryIcon from "@mui/icons-material/Category";

export default function KhoPage() {
  const dispatch = useDispatch();
  const { vatLieu } = useSelector((state) => state.kho);

  // Lưu tab đang chọn vào sessionStorage để giữ nguyên khi quay lại trang
  // (ví dụ: từ trang in phiếu nhập/xuất bấm nút Back)
  const [tab, setTab] = useState(() => {
    const saved = sessionStorage.getItem("khoPage_activeTab");
    return saved !== null ? Number(saved) : 0;
  });

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    sessionStorage.setItem("khoPage_activeTab", newValue);
  };

  useEffect(() => {
    dispatch(fetchVatLieu());
    dispatch(fetchNhaCungCap());
  }, [dispatch]);

  const { tongVatLieu, soHangThieuHang } = useMemo(() => {
    const thieu = (vatLieu || []).filter(
      (vl) => (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0)
    );
    return {
      tongVatLieu: (vatLieu || []).length,
      soHangThieuHang: thieu.length,
    };
  }, [vatLieu]);

  return (
    <div className="p-6">
      {/* ===== BANNER TỔNG QUAN ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 cursor-pointer">
        {/* Tổng vật liệu */}
        <div
          className="rounded-xl px-6 py-4 flex items-center gap-4"
          style={{ backgroundColor: "#1976d2" }}
          onClick={() => dispatch(resetVatLieuFilters())}
        >
          <CategoryIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.8)" }} />
          <div>
            <div className="text-white text-2xl font-bold">{tongVatLieu}</div>
            <div className="text-white text-sm mt-0.5">Vật liệu trong kho</div>
          </div>
        </div>

        {/* Hàng thiếu */}
        <div
          className="rounded-xl px-6 py-4 flex items-center gap-4 cursor-pointer"
          style={{
            backgroundColor: soHangThieuHang > 0 ? "#ef4444" : "#22c55e",
          }}
          onClick={() => {
            if (soHangThieuHang > 0) {
              dispatch(setVatLieuFilters({ filterTrangThai: "thieu" }));
            }
          }}
        >
          <WarningAmberIcon
            sx={{ fontSize: 36, color: "rgba(255,255,255,0.85)" }}
          />
          <div>
            <div className="text-white text-2xl font-bold">
              {soHangThieuHang}
            </div>
            <div className="text-white text-sm mt-0.5">
              {soHangThieuHang > 0
                ? "Vật liệu dưới mức tồn kho tối thiểu"
                : "Tồn kho ổn định"}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab
            icon={<CategoryIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Vật liệu"
          />
          <Tab
            icon={<AssignmentIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Phiếu Nhập - Xuất"
          />
          <Tab
            icon={<StorefrontIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Nhà cung cấp"
          />
        </Tabs>
      </Box>

      {tab === 0 && <VatLieuTable />}
      {tab === 1 && <NhapXuatTable />}
      {tab === 2 && <NhaCungCapTable />}
    </div>
  );
}