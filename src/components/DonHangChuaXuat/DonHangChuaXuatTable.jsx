import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDonHangChuaHoaDon,
  fetchDonHangChuaHoaDonAll,
  createHoaDon,
} from "../../redux/slices/hoaDonSlice";
import {
  fetchBangGiaByNhaKhoa,
  fetchAllBangGia,
} from "../../redux/slices/bangGiaSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { buildProductNameMap } from "../../utils/hoaDonUtils";

// ================= UTILS =================
const vndFormatter = new Intl.NumberFormat("vi-VN");
const fmtVND = (v) => vndFormatter.format(Math.round(v || 0));

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "-";

const getFirstName = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
};

const renderViTriText = (viTriArr) => {
  if (!viTriArr || viTriArr.length === 0) return "-";
  return viTriArr
    .map((v) =>
      v.kieu === "Rời"
        ? v.soRang.join(", ")
        : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
    )
    .join("; ");
};

// ================= NUMERIC KEYS =================
const NUMERIC_KEYS = new Set(["soLuong", "donGia", "tongCong"]);

const ResizableHeaderCell = React.memo(
  ({ label, columnKey, isLast, style, onResize }) => (
    <TableCell sx={isLast ? { ...style, borderTopRightRadius: "12px" } : style}>
      {label}
      <div
        onMouseDown={(e) => onResize(columnKey, e)}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 flex items-center justify-center"
      >
        <div className="w-[1.5px] h-[75%] bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </div>
    </TableCell>
  )
);

const RowComponent = React.memo(
  ({ row, isSelected, cellStyles, onToggle, onNavigate }) => (
    <TableRow
      hover
      sx={{
        bgcolor: isSelected ? "#e8f4fd" : "white",
        "&:hover": { bgcolor: isSelected ? "#daeefa" : "#f8fafc" },
      }}
    >
      <TableCell
        padding="checkbox"
        sx={{
          borderBottom: "1px solid #cbd5e1",
          position: "sticky",
          left: 0,
          bgcolor: isSelected ? "#e8f4fd" : "white",
          zIndex: 1,
        }}
      >
        <Checkbox
          size="small"
          checked={isSelected}
          sx={{ color: "#00a8df", "&.Mui-checked": { color: "#00a8df" } }}
          onChange={() => onToggle(row.orderId, row.rawOrder)}
        />
      </TableCell>

      <TableCell
        sx={cellStyles.maDonHang_link}
        onClick={() => onNavigate(`/donhang/${row.orderId}/edit`)}
      >
        {row.maDonHang}
      </TableCell>

      <TableCell sx={cellStyles.ngayNhan}>{fmtDate(row.ngayNhan)}</TableCell>
      <TableCell sx={cellStyles.bacSi}>{getFirstName(row.bacSi)}</TableCell>
      <TableCell sx={cellStyles.benhNhan}>{row.benhNhan || "-"}</TableCell>
      <TableCell sx={cellStyles.sanPham_bold}>{row.sanPham}</TableCell>
      <TableCell sx={cellStyles.viTri_mono}>
        {renderViTriText(row.viTri)}
      </TableCell>
      <TableCell sx={cellStyles.loai}>{row.loai}</TableCell>
      <TableCell sx={cellStyles.soLuong_bold}>{row.soLuong}</TableCell>
      <TableCell sx={cellStyles.donGia}>{fmtVND(row.donGia)}</TableCell>
      <TableCell sx={cellStyles.tongCong_bold}>
        {fmtVND(row.tongCong)}
      </TableCell>
      <TableCell
        sx={cellStyles.ghiChuTaiChinh_ellipsis}
        title={row.ghiChuTaiChinh}
      >
        {row.ghiChuTaiChinh || "-"}
      </TableCell>

      <TableCell
        sx={{
          padding: 0,
          borderBottom: "1px solid #cbd5e1",
          width: "auto",
          minWidth: 0,
        }}
      />
    </TableRow>
  )
);

// ================= COMPONENT CHÍNH =================
export default function DonHangChuaXuatTable({
  selectedClinic,
  selectedOrders,
  setSelectedOrders,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  // Mặc định lọc "Tháng này" và xóa mục "Tất cả" theo ý sếp
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [searchMaDon, setSearchMaDon] = useState("");
  const [visibleCount, setVisibleCount] = useState(25);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  // ── Resizable columns ──
  const [columnWidths, setColumnWidths] = useState({
    maDonHang: 110,
    ngayNhan: 95,
    bacSi: 75,
    benhNhan: 140,
    sanPham: 120,
    viTri: 220,
    loai: 80,
    soLuong: 60,
    donGia: 115,
    tongCong: 120,
    ghiChuTaiChinh: 160,
  });

  const columnWidthsRef = useRef(columnWidths);
  useEffect(() => {
    columnWidthsRef.current = columnWidths;
  }, [columnWidths]);

  const totalTableWidth = useMemo(
    () => Object.values(columnWidths).reduce((a, b) => a + b, 0) + 48,
    [columnWidths]
  );

  const handleResize = useCallback((key, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = columnWidthsRef.current[key];
    let rafPending = false;
    let lastClientX = startX;

    const onMove = (mv) => {
      lastClientX = mv.clientX;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        setColumnWidths((p) => ({
          ...p,
          [key]: Math.max(startW + (lastClientX - startX), 40),
        }));
        rafPending = false;
      });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const cellStyles = useMemo(() => {
    const base = (key, isHeader = false) => ({
      width: columnWidths[key],
      minWidth: columnWidths[key],
      maxWidth: columnWidths[key],
      boxSizing: "border-box",
      fontSize: isHeader ? "0.8rem" : "0.875rem",
      fontWeight: isHeader ? 700 : 400,
      color: isHeader ? "#00a8df" : "#1f2937",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "clip",
      borderBottom: isHeader ? "1px solid #e6f7ff" : "1px solid #cbd5e1",
      borderTop: "none",
      pt: isHeader ? 1 : 1.25,
      pb: isHeader ? 0.5 : 1.25,
      pl: 2,
      pr: NUMERIC_KEYS.has(key) ? 3 : 2,
      textAlign: NUMERIC_KEYS.has(key) ? "right" : "left",
      position: "relative",
      userSelect: isHeader ? "none" : "auto",
      bgcolor: isHeader ? "#e6f7ff" : "transparent",
    });

    return {
      maDonHang_h: base("maDonHang", true),
      ngayNhan_h: base("ngayNhan", true),
      bacSi_h: base("bacSi", true),
      benhNhan_h: base("benhNhan", true),
      sanPham_h: base("sanPham", true),
      viTri_h: base("viTri", true),
      loai_h: base("loai", true),
      soLuong_h: base("soLuong", true),
      donGia_h: base("donGia", true),
      tongCong_h: base("tongCong", true),
      ghiChuTaiChinh_h: base("ghiChuTaiChinh", true),
      ngayNhan: base("ngayNhan"),
      bacSi: base("bacSi"),
      benhNhan: base("benhNhan"),
      loai: base("loai"),
      donGia: base("donGia"),
      maDonHang_link: {
        ...base("maDonHang"),
        color: "#00a8df",
        fontWeight: 600,
        cursor: "pointer",
      },
      sanPham_bold: { ...base("sanPham"), fontWeight: 500 },
      viTri_mono: {
        ...base("viTri"),
        fontFamily: "monospace",
        fontSize: "0.8rem",
      },
      soLuong_bold: { ...base("soLuong"), fontWeight: "bold" },
      tongCong_bold: { ...base("tongCong"), fontWeight: "bold" },
      ghiChuTaiChinh_ellipsis: {
        ...base("ghiChuTaiChinh"),
        textOverflow: "ellipsis",
      },
    };
  }, [columnWidths]);

  /* ================= API ================= */
  useEffect(() => {
    if (!selectedClinic) return;
    if (selectedClinic === "all") {
      dispatch(fetchDonHangChuaHoaDonAll());
      dispatch(fetchAllBangGia());
    } else {
      dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
    }
  }, [selectedClinic, dispatch]);

  /* 🔥 THÀNH PHẦN MỚI: TÍNH TOÁN KHOẢNG NGÀY ĐANG ĐƯỢC CHỌN TRÊN BỘ LỌC CÓ SẴN */
  const activeDateRange = useMemo(() => {
    const now = new Date();
    let start = startOfMonth(now);
    let end = endOfDay(now);

    switch (dateFilter) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "yesterday": {
        const y = subDays(now, 1);
        start = startOfDay(y);
        end = endOfDay(y);
        break;
      }
      case "thisWeek":
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "lastWeek": {
        const lw = subWeeks(now, 1);
        start = startOfWeek(lw, { weekStartsOn: 1 });
        end = endOfWeek(lw, { weekStartsOn: 1 });
        break;
      }
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth": {
        const lm = subMonths(now, 1);
        start = startOfMonth(lm);
        end = endOfMonth(lm);
        break;
      }
      case "custom":
        if (fromDate && toDate) {
          start = startOfDay(new Date(fromDate));
          end = endOfDay(new Date(toDate));
        }
        break;
      default:
        break;
    }
    return { start, end };
  }, [dateFilter, fromDate, toDate]);

  /* ================= LỌC NGÀY TRÊN BẢNG (Dùng chung activeDateRange) ================= */
  const filteredDonHangs = useMemo(() => {
    return donHangs.filter((o) =>
      isWithinInterval(new Date(o.ngayNhan), {
        start: activeDateRange.start,
        end: activeDateRange.end
      })
    );
  }, [donHangs, activeDateRange]);

  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  const donGiaMap = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      const key =
        (item.sanPhamId || item.sanPham)?._id?.toString() ||
        (item.sanPhamId || item.sanPham)?.toString();
      if (key) map[key] = Number(item.donGia ?? item.gia ?? 0);
    });
    return map;
  }, [bangGia]);

  const flattenedData = useMemo(() => {
    const result = [];
    filteredDonHangs.forEach((order) => {
      (order.danhSachSanPham || []).forEach((sp, index) => {
        const spId = sp.sanPham?.toString();
        const donGia = donGiaMap[spId] || 0;
        const soLuong = sp.soLuong || 1;
        result.push({
          rowId: `${order._id}_${index}`,
          orderId: order._id,
          rawOrder: order,
          maDonHang:
            order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`,
          ngayNhan: order.ngayNhan,
          bacSi: order.bacSi?.hoVaTen,
          benhNhan: order.benhNhan?.hoVaTen,
          sanPham: mapTen[spId] || "SP",
          viTri: sp.viTri,
          loai: sp.loaiDon || "Mới",
          soLuong,
          donGia,
          tongCong: donGia * soLuong,
          ghiChuTaiChinh: order.ghiChuTaiChinh,
        });
      });
    });
    return result;
  }, [filteredDonHangs, mapTen, donGiaMap]);

  const displayedData = useMemo(() => {
    if (!searchMaDon.trim()) return flattenedData;
    const kw = searchMaDon.toLowerCase().trim();
    return flattenedData.filter((row) =>
      row.maDonHang?.toLowerCase().includes(kw)
    );
  }, [flattenedData, searchMaDon]);

  const totalCost = useMemo(
    () => displayedData.reduce((s, r) => s + r.tongCong, 0),
    [displayedData]
  );

  const selectedSet = useMemo(
    () => new Set(selectedOrders.map((o) => o._id)),
    [selectedOrders]
  );

  const uniqueOrdersInDisplay = useMemo(() => {
    const seen = new Set();
    const orders = [];
    displayedData.forEach((row) => {
      if (!seen.has(row.orderId)) {
        seen.add(row.orderId);
        orders.push(row.rawOrder);
      }
    });
    return orders;
  }, [displayedData]);

  useEffect(() => {
    setVisibleCount(25);
  }, [displayedData]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 25, displayedData.length));
        }
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayedData.length]);

  const visibleRows = displayedData.slice(0, visibleCount);

  /* ================= SELECT ================= */
  const toggleOrder = useCallback(
    (orderId, rawOrder) => {
      setSelectedOrders((prev) =>
        prev.some((o) => o._id === orderId)
          ? prev.filter((o) => o._id !== orderId)
          : [...prev, rawOrder]
      );
    },
    [setSelectedOrders]
  );

  const toggleAll = useCallback(() => {
    const allSelected =
      uniqueOrdersInDisplay.length > 0 &&
      uniqueOrdersInDisplay.every((o) => selectedSet.has(o._id));
    setSelectedOrders(allSelected ? [] : uniqueOrdersInDisplay);
  }, [uniqueOrdersInDisplay, selectedSet, setSelectedOrders]);

  const onNavigate = useCallback((path) => navigate(path), [navigate]);

  /* ================= TẠO HÓA ĐƠN ================= */
  const handleCreateHoaDon = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng");
      return;
    }
    let nhaKhoaId = selectedClinic;
    if (selectedClinic === "all") {
      const ids = new Set(
        selectedOrders.map((o) => o.nhaKhoa?._id || o.nhaKhoa)
      );
      if (ids.size > 1) {
        toast.error("Các đơn hàng phải từ cùng 1 nha khoa. Vui lòng chọn lại!");
        return;
      }
      nhaKhoaId = selectedOrders[0].nhaKhoa?._id || selectedOrders[0].nhaKhoa;
      if (!nhaKhoaId) {
        toast.error("Không xác định được nha khoa của đơn hàng");
        return;
      }
    }

    try {
      // 🔥 SỬA CHÍNH: Bốc thẳng khoảng thời gian của bộ lọc hiện tại để gửi xuống backend
      await dispatch(
        createHoaDon({
          nhaKhoaId,
          danhSachDonHangIds: selectedOrders.map((o) => o._id),
          tuNgay: activeDateRange.start.toISOString(),
          denNgay: activeDateRange.end.toISOString(),
        })
      ).unwrap();

      toast.success("Tạo hóa đơn thành công!");
      navigate(`/hoa-don`);
      setSelectedOrders([]);
    } catch (err) {
      toast.error(err?.message || "Tạo hóa đơn thất bại");
    }
  };

  const allDisplaySelected =
    uniqueOrdersInDisplay.length > 0 &&
    uniqueOrdersInDisplay.every((o) => selectedSet.has(o._id));
  const someDisplaySelected =
    uniqueOrdersInDisplay.some((o) => selectedSet.has(o._id)) &&
    !allDisplaySelected;

  /* ================= EMPTY STATE ================= */
  if (!selectedClinic) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 9h18M9 21V9M3 3h18v18H3z" />
        </svg>
        <Typography color="text.secondary">
          Chọn nha khoa để xem đơn hàng
        </Typography>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full w-full relative">
      {/* TOOLBAR RESPONSIVE */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-4 py-2 border-b bg-white flex-shrink-0">

        {/* Nhóm Lọc & Tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto flex-1">
          <FormControl
            size="small"
            sx={{ minWidth: 160, width: { xs: "100%", sm: "auto" } }}
          >
            <InputLabel>Lọc bảng theo ngày</InputLabel>
            <Select
              value={dateFilter}
              label="Lọc bảng theo ngày"
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="custom">Chọn khoảng ngày</MenuItem>
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="yesterday">Hôm qua</MenuItem>
              <MenuItem value="thisWeek">Tuần này</MenuItem>
              <MenuItem value="lastWeek">Tuần trước</MenuItem>
              <MenuItem value="thisMonth">Tháng này</MenuItem>
              <MenuItem value="lastMonth">Tháng trước</MenuItem>
            </Select>
          </FormControl>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 130, flex: { xs: 1, sm: "none" } }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 130, flex: { xs: 1, sm: "none" } }}
              />
            </div>
          )}

          {/* Search mã đơn hàng */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-all w-full sm:w-auto"
            style={{ minWidth: 180 }}
          >
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
              placeholder="Tìm mã đơn hàng..."
              value={searchMaDon}
              onChange={(e) => setSearchMaDon(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full"
            />
            {searchMaDon && (
              <button
                onClick={() => setSearchMaDon("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Nhóm Nút Tạo hóa đơn đơn giản, không rườm rà */}
        {selectedOrders.length > 0 && (
          <div className="w-full xl:w-auto flex justify-end">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleCreateHoaDon}
              sx={{ width: { xs: "100%", xl: "auto" }, height: '40px', px: 4 }}
            >
              Tạo hóa đơn ({selectedOrders.length} đơn)
            </Button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-3 pb-0">
        <TableContainer
          ref={containerRef}
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "12px 12px 0 0",
            flex: 1,
            minHeight: 0,
            overflowX: "auto",
            overflowY: "auto",
            backgroundColor: "#ffffff",
            border: "none !important",
            boxShadow: "none !important",
            "&::-webkit-scrollbar": { height: 10, width: 10 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#cbd5e1",
              borderRadius: 8,
              border: "2px solid #ffffff",
            },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#94a3b8" },
          }}
        >
          <Table
            sx={{
              tableLayout: "fixed",
              width: "100%",
              minWidth: `${totalTableWidth}px`,
              borderCollapse: "collapse",
              bgcolor: "white",
            }}
          >
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                bgcolor: "#e6f7ff",
              }}
            >
              <TableRow className="group" sx={{ border: "none !important" }}>
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    minWidth: 48,
                    bgcolor: "#e6f7ff",
                    borderBottom: "1px solid #e6f7ff",
                    borderTopLeftRadius: "12px",
                    position: "sticky",
                    left: 0,
                    zIndex: 21,
                  }}
                >
                  <Checkbox
                    size="small"
                    sx={{
                      color: "#00a8df",
                      "&.Mui-checked": { color: "#00a8df" },
                    }}
                    indeterminate={someDisplaySelected}
                    checked={allDisplaySelected}
                    onChange={toggleAll}
                  />
                </TableCell>

                <ResizableHeaderCell
                  label="Đơn hàng"
                  columnKey="maDonHang"
                  style={cellStyles.maDonHang_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Ngày nhận"
                  columnKey="ngayNhan"
                  style={cellStyles.ngayNhan_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Bác sĩ"
                  columnKey="bacSi"
                  style={cellStyles.bacSi_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Bệnh nhân"
                  columnKey="benhNhan"
                  style={cellStyles.benhNhan_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Sản phẩm"
                  columnKey="sanPham"
                  style={cellStyles.sanPham_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Vị trí"
                  columnKey="viTri"
                  style={cellStyles.viTri_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Loại"
                  columnKey="loai"
                  style={cellStyles.loai_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="S.L"
                  columnKey="soLuong"
                  style={cellStyles.soLuong_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Đơn giá"
                  columnKey="donGia"
                  style={cellStyles.donGia_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Tổng cộng"
                  columnKey="tongCong"
                  style={cellStyles.tongCong_h}
                  onResize={handleResize}
                />
                <ResizableHeaderCell
                  label="Ghi chú TC"
                  columnKey="ghiChuTaiChinh"
                  style={cellStyles.ghiChuTaiChinh_h}
                  onResize={handleResize}
                  isLast
                />
                <TableCell
                  sx={{
                    width: "auto",
                    minWidth: 0,
                    padding: 0,
                    borderBottom: "1px solid #e6f7ff",
                    borderTopRightRadius: "12px",
                    bgcolor: "#e6f7ff",
                  }}
                />
              </TableRow >
            </TableHead >

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    align="center"
                    sx={{ py: 8, borderBottom: "none" }}
                  >
                    <CircularProgress size={24} sx={{ color: "#00a8df" }} />
                  </TableCell>
                </TableRow>
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    align="center"
                    sx={{
                      py: 8,
                      color: "text.secondary",
                      borderBottom: "none",
                    }}
                  >
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => (
                  <RowComponent
                    key={row.rowId}
                    row={row}
                    isSelected={selectedSet.has(row.orderId)}
                    cellStyles={cellStyles}
                    onToggle={toggleOrder}
                    onNavigate={onNavigate}
                  />
                ))
              )}
              {!loading && visibleCount < displayedData.length && (
                <TableRow ref={sentinelRef}>
                  <TableCell
                    colSpan={13}
                    align="center"
                    sx={{ py: 2, borderBottom: "none" }}
                  >
                    <CircularProgress size={18} sx={{ color: "#00a8df" }} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table >
        </TableContainer >
      </div >

      {/* FOOTER */}
      < div className="px-4 py-2 border-t bg-white flex-shrink-0 flex justify-between items-center relative z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" >
        <Typography variant="caption" color="text.secondary" fontSize={12}>
          {visibleCount < displayedData.length
            ? `${visibleCount} / ${displayedData.length} dòng`
            : `${displayedData.length} dòng`}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontSize={12}>
          Tổng: <strong>{fmtVND(totalCost)}</strong>
        </Typography>
      </div >
    </div >
  );
}
