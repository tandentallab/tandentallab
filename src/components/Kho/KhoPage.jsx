// pages/Kho/KhoPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CategoryIcon from "@mui/icons-material/Category";

export default function KhoPage() {
  const dispatch = useDispatch();
  const { vatLieu } = useSelector((state) => state.kho);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  // ===== Đo chiều cao thực tế của khối Tabs + Thống kê =====
  // Trên mobile, khối thống kê có thể xuống dòng (flexWrap) khiến chiều cao
  // tăng lên so với desktop. VatLieuTable dùng chiều cao này (qua CSS variable
  // --kho-header-h) để tính vị trí sticky cho thanh lọc/bảng, tránh bị chồng lấn.
  const headerRef = useRef(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--kho-header-h",
        `${el.offsetHeight + 64}px` // +64px chiều cao Header cố định của hệ thống
      );
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(el);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [tongVatLieu, soHangThieuHang]);

  return (
    <div className="px-6 py-2">
      {/* ===== TABS + THỐNG KÊ (gộp chung 1 hàng để tiết kiệm diện tích) ===== */}
      <Box
        ref={headerRef}
        sx={{
          position: "sticky",
          // Nếu toàn bộ trang cuộn (window scroll): chỉnh bằng đúng chiều cao của Header (ví dụ: 64px)
          // Nếu chỉ có vùng nội dung bên dưới Header cuộn: để là 0
          top: "64px",
          backgroundColor: "#f3f4f6", // Khớp với màu nền xám nhạt của hệ thống để che phần nội dung cuộn lên bên dưới
          zIndex: 10, // Đảm bảo tabs nằm trên bảng dữ liệu khi cuộn
          borderBottom: 1,
          borderColor: "divider",
          // mb: 3,
          pt: 0.25, // Giảm khoảng trống phía trên Tabs
          pb: { xs: 1, sm: 0 }, // Thêm khoảng cách dưới khối thống kê khi xuống dòng trên mobile
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Tabs
          value={tab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 40, sm: 48 },
            "& .MuiTab-root": {
              minHeight: { xs: 40, sm: 48 },
              minWidth: { xs: "auto", sm: 90 },
              px: { xs: 1, sm: 2 },
              py: 0,
              fontSize: { xs: 12.5, sm: 14 },
              gap: { xs: 0.5, sm: 1 },
            },
            "& .MuiTabs-scrollButtons": {
              width: { xs: 24, sm: 40 },
            },
          }}
        >
          <Tab
            icon={<CategoryIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            iconPosition="start"
            label="Vật liệu"
          />
          <Tab
            icon={<AssignmentIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            iconPosition="start"
            label={isMobile ? "Nhập - Xuất" : "Phiếu Nhập - Xuất"}
          />
          <Tab
            icon={<StorefrontIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            iconPosition="start"
            label={isMobile ? "NCC" : "Nhà cung cấp"}
          />
        </Tabs>

        {/* ===== THỐNG KÊ THU GỌN ===== */}
        <Box sx={{ display: "flex", gap: 1, pr: 1, flexWrap: "wrap" }}>
          <Box
            onClick={() => dispatch(resetVatLieuFilters())}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              cursor: "pointer",
              backgroundColor: "#e3f2fd",
              color: "#1976d2",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "#d0e6fb" },
            }}
          >
            <CategoryIcon sx={{ fontSize: 16 }} />
            {tongVatLieu} vật liệu trong kho
          </Box>

          <Box
            onClick={() => {
              if (soHangThieuHang > 0) {
                dispatch(setVatLieuFilters({ filterTrangThai: "thieu" }));
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: "999px",
              cursor: soHangThieuHang > 0 ? "pointer" : "default",
              backgroundColor: soHangThieuHang > 0 ? "#fee2e2" : "#dcfce7",
              color: soHangThieuHang > 0 ? "#ef4444" : "#22c55e",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: soHangThieuHang > 0 ? "#fbd0d0" : "#dcfce7",
              },
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 16 }} />
            {soHangThieuHang > 0
              ? `${soHangThieuHang} vật liệu thiếu hàng`
              : "Tồn kho ổn định"}
          </Box>
        </Box>
      </Box>

      {tab === 0 && <VatLieuTable />}
      {tab === 1 && <NhapXuatTable />}
      {tab === 2 && <NhaCungCapTable />}
    </div>
  );
}
