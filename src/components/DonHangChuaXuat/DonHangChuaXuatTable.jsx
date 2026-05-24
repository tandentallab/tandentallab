import React, { useEffect, useMemo, useRef, useState } from "react";
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
  startOfDay, endOfDay, subDays,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subWeeks, subMonths,
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
const fmtVND = (v) => new Intl.NumberFormat("vi-VN").format(Math.round(v || 0));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";

const getFirstName = (fullName) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1];
};

const renderViTriText = (viTriArr) => {
  if (!viTriArr || viTriArr.length === 0) return "-";
  return viTriArr
    .map((v) =>
      v.kieu === "Rời" ? v.soRang.join(", ") : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
    )
    .join("; ");
};

// ================= COMPONENT CHÍNH =================
export default function DonHangChuaXuatTable({ selectedClinic, selectedOrders, setSelectedOrders }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  const [dateFilter, setDateFilter] = useState("all");
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

  const totalTableWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0) + 48; // 48 = checkbox col

  const numericKeys = ["soLuong", "donGia", "tongCong"];

  const handleResize = (key, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = columnWidths[key];
    const onMove = (mv) =>
      setColumnWidths((p) => ({ ...p, [key]: Math.max(startW + (mv.clientX - startX), 40) }));
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const getCellStyle = (key, isHeader = false) => ({
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
    pr: numericKeys.includes(key) ? 3 : 2,
    textAlign: numericKeys.includes(key) ? "right" : "left",
    position: "relative",
    userSelect: isHeader ? "none" : "auto",
    bgcolor: isHeader ? "#e6f7ff" : "transparent",
  });

  const ResizableHeaderCell = ({ label, columnKey, isLast }) => (
    <TableCell sx={{ ...getCellStyle(columnKey, true), ...(isLast ? { borderTopRightRadius: "12px" } : {}) }}>
      {label}
      <div
        onMouseDown={(e) => handleResize(columnKey, e)}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 flex items-center justify-center"
      >
        <div className="w-[1.5px] h-[75%] bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
      </div>
    </TableCell>
  );

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

  /* ================= LỌC NGÀY ================= */
  const filteredDonHangs = useMemo(() => {
    if (dateFilter === "all") return donHangs;
    const now = new Date();
    let start, end;
    switch (dateFilter) {
      case "today": start = startOfDay(now); end = endOfDay(now); break;
      case "yesterday": { const y = subDays(now, 1); start = startOfDay(y); end = endOfDay(y); break; }
      case "thisWeek": start = startOfWeek(now, { weekStartsOn: 1 }); end = endOfWeek(now, { weekStartsOn: 1 }); break;
      case "lastWeek": { const lw = subWeeks(now, 1); start = startOfWeek(lw, { weekStartsOn: 1 }); end = endOfWeek(lw, { weekStartsOn: 1 }); break; }
      case "thisMonth": start = startOfMonth(now); end = endOfMonth(now); break;
      case "lastMonth": { const lm = subMonths(now, 1); start = startOfMonth(lm); end = endOfMonth(lm); break; }
      case "custom":
        if (!fromDate || !toDate) return donHangs;
        start = startOfDay(new Date(fromDate));
        end = endOfDay(new Date(toDate));
        break;
      default: return donHangs;
    }
    return donHangs.filter((o) => isWithinInterval(new Date(o.ngayNhan), { start, end }));
  }, [donHangs, dateFilter, fromDate, toDate]);

  /* ================= MAP TÊN + GIÁ ================= */
  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  const donGiaMap = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      const key = (item.sanPhamId || item.sanPham)?._id?.toString()
        || (item.sanPhamId || item.sanPham)?.toString();
      if (key) map[key] = Number(item.donGia ?? item.gia ?? 0);
    });
    return map;
  }, [bangGia]);

  /* ================= FLATTEN ================= */
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
          maDonHang: order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`,
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
    return flattenedData.filter((row) =>
      row.maDonHang?.toLowerCase().includes(searchMaDon.toLowerCase().trim())
    );
  }, [flattenedData, searchMaDon]);

  useEffect(() => { setVisibleCount(25); }, [displayedData]);

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
  const toggleOrder = (orderId, rawOrder) => {
    setSelectedOrders((prev) =>
      prev.some((o) => o._id === orderId)
        ? prev.filter((o) => o._id !== orderId)
        : [...prev, rawOrder]
    );
  };

  const toggleAll = () => {
    setSelectedOrders(
      selectedOrders.length === filteredDonHangs.length ? [] : [...filteredDonHangs]
    );
  };

  /* ================= TẠO HÓA ĐƠN ================= */
  const handleCreateHoaDon = async () => {
    if (selectedOrders.length === 0) { toast.error("Vui lòng chọn ít nhất 1 đơn hàng"); return; }
    let nhaKhoaId = selectedClinic;
    if (selectedClinic === "all") {
      const ids = new Set(selectedOrders.map((o) => o.nhaKhoa?._id || o.nhaKhoa));
      if (ids.size > 1) { toast.error("Các đơn hàng phải từ cùng 1 nha khoa. Vui lòng chọn lại!"); return; }
      nhaKhoaId = selectedOrders[0].nhaKhoa?._id || selectedOrders[0].nhaKhoa;
      if (!nhaKhoaId) { toast.error("Không xác định được nha khoa của đơn hàng"); return; }
    }
    try {
      const result = await dispatch(
        createHoaDon({ nhaKhoaId, danhSachDonHangIds: selectedOrders.map((o) => o._id) })
      ).unwrap();
      toast.success("Tạo hóa đơn thành công!");
      navigate(`/hoa-don`);
      setSelectedOrders([]);
    } catch (err) {
      toast.error(err?.message || "Tạo hóa đơn thất bại");
    }
  };

  /* ================= EMPTY STATE ================= */
  if (!selectedClinic) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9h18M9 21V9M3 3h18v18H3z" />
        </svg>
        <Typography color="text.secondary">Chọn nha khoa để xem đơn hàng</Typography>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* TOOLBAR RESPONSIVE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-2 border-b bg-white flex-shrink-0">

        {/* Nhóm Lọc & Tìm kiếm */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto flex-1">
          <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel>Lọc theo ngày nhận</InputLabel>
            <Select value={dateFilter} label="Lọc theo ngày nhận" onChange={(e) => setDateFilter(e.target.value)}>
              <MenuItem value="all">Tất cả đơn hàng</MenuItem>
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
              <TextField label="Từ ngày" type="date" size="small" value={fromDate}
                onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, flex: { xs: 1, sm: "none" } }} />
              <TextField label="Đến ngày" type="date" size="small" value={toDate}
                onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140, flex: { xs: 1, sm: "none" } }} />
            </div>
          )}

          {/* Search mã đơn hàng */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white transition-all w-full sm:w-auto" style={{ minWidth: 180 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" className="flex-shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm mã đơn hàng..."
              value={searchMaDon}
              onChange={(e) => setSearchMaDon(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full"
            />
            {searchMaDon && (
              <button onClick={() => setSearchMaDon("")} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Nhóm Nút Tạo hóa đơn */}
        {selectedOrders.length > 0 && (
          <div className="w-full md:w-auto flex justify-end">
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleCreateHoaDon}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              Tạo hóa đơn ({selectedOrders.length} đơn)
            </Button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="flex-1 min-h-0 px-4 pt-3 flex flex-col">
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
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: 8, border: "2px solid #ffffff" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#94a3b8" },
          }}
        >
          <Table sx={{ tableLayout: "fixed", width: "100%", minWidth: `${totalTableWidth}px`, borderCollapse: "collapse", bgcolor: "white" }}>

            <TableHead sx={{ position: "sticky", top: 0, zIndex: 20, bgcolor: "#e6f7ff" }}>
              <TableRow className="group" sx={{ border: "none !important" }}>
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48, minWidth: 48, bgcolor: "#e6f7ff",
                    borderBottom: "1px solid #e6f7ff", borderTopLeftRadius: "12px",
                    position: "sticky", left: 0, zIndex: 21,
                  }}
                >
                  <Checkbox
                    size="small"
                    sx={{ color: "#00a8df", "&.Mui-checked": { color: "#00a8df" } }}
                    indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredDonHangs.length}
                    checked={filteredDonHangs.length > 0 && selectedOrders.length === filteredDonHangs.length}
                    onChange={toggleAll}
                  />
                </TableCell>

                <ResizableHeaderCell label="Đơn hàng" columnKey="maDonHang" />
                <ResizableHeaderCell label="Ngày nhận" columnKey="ngayNhan" />
                <ResizableHeaderCell label="Bác sĩ" columnKey="bacSi" />
                <ResizableHeaderCell label="Bệnh nhân" columnKey="benhNhan" />
                <ResizableHeaderCell label="Sản phẩm" columnKey="sanPham" />
                <ResizableHeaderCell label="Vị trí" columnKey="viTri" />
                <ResizableHeaderCell label="Loại" columnKey="loai" />
                <ResizableHeaderCell label="S.L" columnKey="soLuong" />
                <ResizableHeaderCell label="Đơn giá" columnKey="donGia" />
                <ResizableHeaderCell label="Tổng cộng" columnKey="tongCong" />
                <ResizableHeaderCell label="Ghi chú TC" columnKey="ghiChuTaiChinh" isLast />

                {/* Cột ảo fill space */}
                <TableCell sx={{ width: "auto", minWidth: 0, padding: 0, borderBottom: "1px solid #e6f7ff", borderTopRightRadius: "12px", bgcolor: "#e6f7ff" }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 8, borderBottom: "none" }}>
                    <CircularProgress size={24} sx={{ color: "#00a8df" }} />
                  </TableCell>
                </TableRow>
              ) : displayedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} align="center" sx={{ py: 8, color: "text.secondary", borderBottom: "none" }}>
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => {
                  const isSelected = selectedOrders.some((o) => o._id === row.orderId);
                  return (
                    <TableRow
                      key={row.rowId}
                      hover
                      sx={{
                        bgcolor: isSelected ? "#e8f4fd" : "white",
                        "&:hover": { bgcolor: isSelected ? "#daeefa" : "#f8fafc" },
                      }}
                    >
                      <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #cbd5e1", position: "sticky", left: 0, bgcolor: isSelected ? "#e8f4fd" : "white", zIndex: 1 }}>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          sx={{ color: "#00a8df", "&.Mui-checked": { color: "#00a8df" } }}
                          onChange={() => toggleOrder(row.orderId, row.rawOrder)}
                        />
                      </TableCell>

                      <TableCell
                        sx={{ ...getCellStyle("maDonHang"), color: "#00a8df", fontWeight: 600, cursor: "pointer" }}
                        onClick={() => navigate(`/donhang/${row.orderId}/edit`)}
                      >
                        {row.maDonHang}
                      </TableCell>

                      <TableCell sx={getCellStyle("ngayNhan")}>{fmtDate(row.ngayNhan)}</TableCell>
                      <TableCell sx={getCellStyle("bacSi")}>{getFirstName(row.bacSi)}</TableCell>
                      <TableCell sx={getCellStyle("benhNhan")}>{row.benhNhan || "-"}</TableCell>
                      <TableCell sx={{ ...getCellStyle("sanPham"), fontWeight: 500 }}>{row.sanPham}</TableCell>
                      <TableCell sx={{ ...getCellStyle("viTri"), fontFamily: "monospace", fontSize: "0.8rem" }}>{renderViTriText(row.viTri)}</TableCell>
                      <TableCell sx={getCellStyle("loai")}>{row.loai}</TableCell>
                      <TableCell sx={{ ...getCellStyle("soLuong"), fontWeight: "bold" }}>{row.soLuong}</TableCell>
                      <TableCell sx={getCellStyle("donGia")}>{fmtVND(row.donGia)}</TableCell>
                      <TableCell sx={{ ...getCellStyle("tongCong"), fontWeight: "bold" }}>{fmtVND(row.tongCong)}</TableCell>

                      <TableCell
                        sx={{ ...getCellStyle("ghiChuTaiChinh"), textOverflow: "ellipsis" }}
                        title={row.ghiChuTaiChinh}
                      >
                        {row.ghiChuTaiChinh || "-"}
                      </TableCell>

                      <TableCell sx={{ padding: 0, borderBottom: "1px solid #cbd5e1", width: "auto", minWidth: 0 }} />
                    </TableRow>
                  );
                })
              )}
              {!loading && visibleCount < displayedData.length && (
                <TableRow ref={sentinelRef}>
                  <TableCell colSpan={13} align="center" sx={{ py: 2, borderBottom: "none" }}>
                    <CircularProgress size={18} sx={{ color: "#00a8df" }} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div >

      {/* FOOTER */}
      < div className="px-4 py-2 border-t bg-white flex-shrink-0 flex justify-between items-center" >
        <Typography variant="caption" color="text.secondary" fontSize={12}>
          {visibleCount < displayedData.length
            ? `${visibleCount} / ${displayedData.length} dòng`
            : `${displayedData.length} dòng`}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontSize={12}>
          Tổng: <strong>{fmtVND(displayedData.reduce((s, r) => s + r.tongCong, 0))}</strong>
        </Typography>
      </div >

    </div >
  );
}