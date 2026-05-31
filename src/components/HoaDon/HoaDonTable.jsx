import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { updateHoaDon } from "../../redux/slices/hoaDonSlice";
import { useNavigate } from "react-router-dom";

// ================= FORMATTERS (module-level, khởi tạo 1 lần) =================
const vndFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN");

const fmtVND = (v) => vndFormatter.format(v || 0);
const fmtDate = (d) => (d ? dateFormatter.format(new Date(d)) : "—");

// ================= CONSTANTS =================
const NUMERIC_KEYS = new Set([
  "tongCong",
  "giamGia",
  "giaTriThanhToan",
  "daThanhToan",
  "conLai",
  "chiPhiKhac",
]);

const STATUS_CLASS = {
  "Chưa thanh toán": "bg-[#f44336] text-white",
  "Thanh toán một phần": "bg-[#ff9800] text-white",
  "Đã thanh toán": "bg-[#4CAF50] text-white",
};

// ================= RESIZABLE HEADER CELL =================
const ResizableHeaderCell = React.memo(
  ({ label, style, columnKey, onResize }) => (
    <TableCell sx={style}>
      {label}
      <div
        onMouseDown={(e) => onResize(columnKey, e)}
        className="absolute top-0 right-0 w-3 h-full cursor-col-resize z-10 flex items-center justify-center transition-all hover:bg-gray-100 after:content-[''] after:absolute after:w-[2px] after:h-3/5 after:bg-gray-300 after:rounded"
      />
    </TableCell>
  )
);

// ================= ROW COMPONENT =================
const RowComponent = React.memo(({ hd, cellStyles, onNavigate }) => (
  <TableRow
    hover
    className="cursor-pointer transition-colors duration-200 hover:bg-slate-50"
    onClick={() => onNavigate(`/hoa-don/${hd._id}/edit`)}
  >
    <TableCell sx={cellStyles.ngayXuat}>
      {fmtDate(hd.ngayXuatHoaDon || hd.createdAt)}
    </TableCell>
    <TableCell sx={cellStyles.soHoaDon}>{hd.soHoaDon}</TableCell>
    <TableCell sx={cellStyles.nhaKhoa}>
      {hd.nhaKhoa?.hoVaTen || hd.nhaKhoa?.tenNhaKhoa || "—"}
    </TableCell>
    <TableCell sx={cellStyles.tongCong}>{fmtVND(hd.tongCong)}</TableCell>
    <TableCell sx={cellStyles.giamGia}>{fmtVND(hd.chietKhau)}</TableCell>
    <TableCell sx={cellStyles.giaTriThanhToan}>
      {fmtVND(hd.giaTriThanhToan)}
    </TableCell>
    <TableCell sx={cellStyles.daThanhToan}>{fmtVND(hd.daThanhToan)}</TableCell>
    <TableCell sx={cellStyles.conLai}>{fmtVND(hd.conLai)}</TableCell>
    <TableCell sx={cellStyles.chiPhiKhac}>{fmtVND(hd.chiPhiKhac)}</TableCell>
    <TableCell sx={cellStyles.trangThai}>
      <span
        className={`inline-block px-2.5 py-1 text-[13px] font-medium tracking-wide ${STATUS_CLASS[hd.trangThai] ?? "bg-gray-500 text-white"
          }`}
      >
        {hd.trangThai || "—"}
      </span>
    </TableCell>
    <TableCell sx={cellStyles.ghiChu}>{hd.ghiChuChoKhachHang || "—"}</TableCell>
    <TableCell sx={cellStyles.ngayDenHan}>{fmtDate(hd.ngayDenHan)}</TableCell>
  </TableRow>
));

// ================= COMPONENT CHÍNH =================
const HoaDonTable = ({ danhSachHoaDon, loading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedHD, setSelectedHD] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");

  // ── Resizable columns ──
  const [columnWidths, setColumnWidths] = useState({
    ngayXuat: 120,
    soHoaDon: 140,
    nhaKhoa: 220,
    tongCong: 130,
    giamGia: 110,
    giaTriThanhToan: 160,
    daThanhToan: 140,
    conLai: 120,
    chiPhiKhac: 120,
    trangThai: 140,
    ghiChu: 200,
    ngayDenHan: 130,
  });

  const columnWidthsRef = useRef(columnWidths);
  useEffect(() => {
    columnWidthsRef.current = columnWidths;
  }, [columnWidths]);

  const totalTableWidth = useMemo(
    () => Object.values(columnWidths).reduce((a, b) => a + b, 0),
    [columnWidths]
  );

  // 🔥 ── Lọc / Sắp xếp Ngày Xuất ── 🔥
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" = Trễ nhất (mới nhất), "asc" = Sớm nhất (cũ nhất)

  const handleToggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const sortedDanhSachHoaDon = useMemo(() => {
    if (!danhSachHoaDon) return [];
    const copy = [...danhSachHoaDon];

    copy.sort((a, b) => {
      // 1. Lấy Tiêu chí chính: Ngày xuất hóa đơn
      const timeA = new Date(a.ngayXuatHoaDon || a.createdAt || 0).getTime();
      const timeB = new Date(b.ngayXuatHoaDon || b.createdAt || 0).getTime();

      // Nếu Ngày xuất khác nhau -> Cứ thế mà xếp
      if (timeA !== timeB) {
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }

      // 🔥 2. TIÊU CHÍ PHỤ (Tie-breaker): Nếu Ngày xuất giống hệt nhau
      // Chuyển sang so sánh mili-giây tạo thực tế (createdAt)
      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();

      return sortOrder === "asc" ? createdA - createdB : createdB - createdA;
    });

    return copy;
  }, [danhSachHoaDon, sortOrder]);

  // ── Virtual scroll ──
  const [visibleCount, setVisibleCount] = useState(30);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Cập nhật lại list mỗi khi đổi filter hoặc đổi data
  useEffect(() => { setVisibleCount(30); }, [sortedDanhSachHoaDon]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisibleCount((prev) => Math.min(prev + 30, sortedDanhSachHoaDon.length));
      },
      { root: container, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedDanhSachHoaDon.length]);

  const visibleRows = useMemo(
    () => sortedDanhSachHoaDon.slice(0, visibleCount),
    [sortedDanhSachHoaDon, visibleCount]
  );

  // ── RAF throttle resize ──
  const handleResize = useCallback((columnKey, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidthsRef.current[columnKey];
    let rafPending = false;
    let lastX = startX;

    const onMouseMove = (mv) => {
      lastX = mv.clientX;
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        setColumnWidths((prev) => ({
          ...prev,
          [columnKey]: Math.max(startWidth + (lastX - startX), 60),
        }));
        rafPending = false;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  // ── Precompute tất cả cell styles 1 lần ──
  const cellStyles = useMemo(() => {
    const base = (key) => ({
      width: columnWidths[key],
      minWidth: columnWidths[key],
      maxWidth: columnWidths[key],
      boxSizing: "border-box",
      fontSize: "0.85rem",
      color: "#333",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "clip",
      borderBottom: "1px solid #d1d5db",
      py: 0.75,
      pl: 2,
      pr: NUMERIC_KEYS.has(key) ? 3 : 2,
      textAlign: NUMERIC_KEYS.has(key) ? "right" : "left",
    });

    const baseHeader = (key) => ({
      ...base(key),
      position: "relative",
      fontWeight: 600,
      fontSize: "0.85rem",
      userSelect: "none",
      color: "#26a69a",
      py: 1,
      bgcolor: "#fff",
      borderBottom: "2px solid #cbd5e1",
    });

    const row = {};
    const hdr = {};
    [
      "ngayXuat",
      "soHoaDon",
      "nhaKhoa",
      "tongCong",
      "giamGia",
      "giaTriThanhToan",
      "daThanhToan",
      "conLai",
      "chiPhiKhac",
      "trangThai",
      "ghiChu",
      "ngayDenHan",
    ].forEach((k) => {
      row[k] = base(k);
      hdr[k] = baseHeader(k);
    });

    return { row, hdr };
  }, [columnWidths]);

  const onNavigate = useCallback((path) => navigate(path), [navigate]);

  const handleConfirmUpdate = async () => {
    await dispatch(
      updateHoaDon({ id: selectedHD._id, data: { trangThai: statusUpdate } })
    );
    setOpenUpdate(false);
  };

  // ================= RENDER =================
  return (
    <>
      <TableContainer
        ref={containerRef}
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 14, width: 14 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 10,
            border: "3px solid #ffffff",
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#94a3b8" },
        }}
      >
        <Table sx={{ tableLayout: "fixed", width: totalTableWidth, minWidth: totalTableWidth }}>
          <TableHead>
            <TableRow>
              <ResizableHeaderCell
                label={
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-[#00796b] transition-colors"
                    onClick={handleToggleSort}
                    title={sortOrder === "desc" ? "Đang xếp: Mới nhất -> Cũ nhất (Bấm để xem Sớm nhất)" : "Đang xếp: Cũ nhất -> Mới nhất (Bấm để xem Trễ nhất)"}
                  >
                    Ngày xuất
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-transform duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </div>
                }
                columnKey="ngayXuat"
                style={cellStyles.hdr.ngayXuat}
                onResize={handleResize}
              />
              <ResizableHeaderCell label="Số" columnKey="soHoaDon" style={cellStyles.hdr.soHoaDon} onResize={handleResize} />
              <ResizableHeaderCell label="Nha khoa" columnKey="nhaKhoa" style={cellStyles.hdr.nhaKhoa} onResize={handleResize} />
              <ResizableHeaderCell label="Tổng cộng" columnKey="tongCong" style={cellStyles.hdr.tongCong} onResize={handleResize} />
              <ResizableHeaderCell label="Giảm giá" columnKey="giamGia" style={cellStyles.hdr.giamGia} onResize={handleResize} />
              <ResizableHeaderCell label="Giá trị thanh toán" columnKey="giaTriThanhToan" style={cellStyles.hdr.giaTriThanhToan} onResize={handleResize} />
              <ResizableHeaderCell label="Đã thanh toán" columnKey="daThanhToan" style={cellStyles.hdr.daThanhToan} onResize={handleResize} />
              <ResizableHeaderCell label="Còn lại" columnKey="conLai" style={cellStyles.hdr.conLai} onResize={handleResize} />
              <ResizableHeaderCell label="Chi phí khác" columnKey="chiPhiKhac" style={cellStyles.hdr.chiPhiKhac} onResize={handleResize} />
              <ResizableHeaderCell label="Trạng thái" columnKey="trangThai" style={cellStyles.hdr.trangThai} onResize={handleResize} />
              <ResizableHeaderCell label="Ghi chú cho khách hàng" columnKey="ghiChu" style={cellStyles.hdr.ghiChu} onResize={handleResize} />
              <ResizableHeaderCell label="Ngày đến hạn" columnKey="ngayDenHan" style={cellStyles.hdr.ngayDenHan} onResize={handleResize} />
            </TableRow >
          </TableHead >

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <CircularProgress size={30} className="my-10" />
                </TableCell>
              </TableRow>
            ) : visibleRows.length > 0 ? (
              <>
                {visibleRows.map((hd) => (
                  <RowComponent
                    key={hd._id}
                    hd={hd}
                    cellStyles={cellStyles.row}
                    onNavigate={onNavigate}
                  />
                ))}
                {visibleCount < (danhSachHoaDon?.length ?? 0) && (
                  <TableRow ref={sentinelRef}>
                    <TableCell
                      colSpan={12}
                      align="center"
                      sx={{ py: 2, borderBottom: "none" }}
                    >
                      <CircularProgress size={18} sx={{ color: "#26a69a" }} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={12}
                  align="center"
                  className="py-20 text-gray-500"
                >
                  Không tìm thấy dữ liệu hóa đơn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table >
      </TableContainer >

      {/* MODAL CHI TIẾT */}
      < Modal open={openDetail} onClose={() => setOpenDetail(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] md:w-[90%] max-w-[1000px] max-h-[90vh] overflow-auto bg-white shadow-2xl p-8 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-4 text-blue-700">
            Chi Tiết Hóa Đơn: {selectedHD?.soHoaDon}
          </h3>
          <hr className="mb-4 border-gray-200" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-xs text-gray-400 block">Nha khoa</span>
              <span className="font-medium text-gray-800">
                {selectedHD?.nhaKhoa?.hoVaTen ||
                  selectedHD?.nhaKhoa?.tenNhaKhoa}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Trạng thái</span>
              <Chip label={selectedHD?.trangThai} size="small" color="info" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block">
                Tổng tiền chưa CK
              </span>
              <span className="font-medium">
                {fmtVND(selectedHD?.tongCong)}đ
              </span>
            </div>
            <div>
              <span className="text-xs text-red-400 block">
                Thực thu (Sau CK)
              </span>
              <span className="text-lg font-bold text-red-600">
                {fmtVND(selectedHD?.giaTriThanhToan)}đ
              </span>
            </div>
          </div>

          <p className="font-semibold mb-2 text-sm uppercase text-gray-500">
            Danh sách sản phẩm
          </p>
          <div className="max-h-60 overflow-y-auto bg-gray-50 rounded border p-3 flex flex-col gap-3">
            {selectedHD?.danhSachSanPham?.map((item, idx) => (
              <div
                key={idx}
                className="pb-3 border-b border-gray-200 last:border-0 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-blue-700">
                    {item.tenSanPham || item.sanPham?.tenSanPham || "Sản phẩm"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    SL: {item.soLuong} | Đơn giá: {fmtVND(item.donGia)}đ
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800">
                    {fmtVND(item.tongCongSanPham)}đ
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setOpenDetail(false)} variant="outlined">
              Đóng
            </Button>
          </div>
        </div>
      </Modal >

      {/* MODAL CẬP NHẬT TRẠNG THÁI */}
      < Modal open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] max-w-[450px] bg-white shadow-2xl p-6 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-6 text-center text-gray-800">
            Cập Nhật Trạng Thái
          </h3>
          <FormControl fullWidth className="mb-6">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusUpdate}
              label="Trạng thái"
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
              <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
            </Select>
          </FormControl>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setOpenUpdate(false)}>Hủy</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmUpdate}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </Modal >
    </>
  );
};

export default HoaDonTable;
