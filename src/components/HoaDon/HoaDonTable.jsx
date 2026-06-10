import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import useMediaQuery from "@mui/material/useMediaQuery";

// ================= FORMATTERS =================
const vndFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN");

const fmtVND = (v) => vndFormatter.format(v || 0);
const fmtDate = (d) => d ? dateFormatter.format(new Date(d)) : "";

// ================= CONSTANTS =================
const NUMERIC_KEYS = new Set([
  "tongCong", "giamGia", "giaTriThanhToan",
  "daThanhToan", "conLai", "chiPhiKhac",
]);

const STATUS_CLASS = {
  "Chưa thanh toán": "bg-[#f44336] text-white",
  "Thanh toán một phần": "bg-[#ff9800] text-white",
  "Đã thanh toán": "bg-[#4CAF50] text-white",
  "Lưu tạm": "bg-blue-500 text-white"
};

// ================= RESIZABLE HEADER CELL =================
const ResizableHeaderCell = React.memo(({ label, style, columnKey, onResize }) => (
  <TableCell sx={style}>
    {label}
    <div
      onMouseDown={(e) => onResize(columnKey, e)}
      className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 flex items-center justify-center"
    >
      <div className="w-[1.5px] h-[75%] bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
    </div>
  </TableCell>
));

// ================= ROW COMPONENT =================
const RowComponent = React.memo(({ hd, cellStyles, onNavigate }) => {
  const baseDate = hd.ngayXuatHoaDon || hd.createdAt;
  let textDenHan = "";
  let isTreHan = false;

  if (baseDate) {
    const ngayDenHan = dayjs(baseDate).add(20, 'day').endOf('day');
    textDenHan = ngayDenHan.format('DD/MM/YYYY');

    if (dayjs().isAfter(ngayDenHan) && Number(hd.conLai || 0) > 0) {
      isTreHan = true;
    }
  }

  return (
    <TableRow
      hover
      className="cursor-pointer transition-colors duration-200 hover:bg-slate-50"
      onClick={() => onNavigate(`/hoa-don/${hd._id}/edit`)}
    >
      <TableCell sx={cellStyles.ngayXuat}>{fmtDate(hd.ngayXuatHoaDon || hd.createdAt)}</TableCell>
      <TableCell sx={cellStyles.soHoaDon}>{hd.soHoaDon}</TableCell>
      <TableCell sx={cellStyles.nhaKhoa}>{hd.nhaKhoa?.hoVaTen || hd.nhaKhoa?.tenNhaKhoa || ""}</TableCell>
      <TableCell sx={cellStyles.tongCong}>{fmtVND(hd.tongCong)}</TableCell>
      <TableCell sx={cellStyles.giamGia}>{fmtVND(hd.chietKhau)}</TableCell>
      <TableCell sx={cellStyles.giaTriThanhToan}>{fmtVND(hd.giaTriThanhToan)}</TableCell>
      <TableCell sx={cellStyles.daThanhToan}>{fmtVND(hd.daThanhToan)}</TableCell>
      <TableCell sx={cellStyles.conLai}>{fmtVND(hd.conLai)}</TableCell>
      <TableCell sx={cellStyles.chiPhiKhac}>{fmtVND(hd.chiPhiKhac)}</TableCell>
      <TableCell sx={cellStyles.trangThai}>
        <span className={`inline-block px-2.5 py-1 text-[13px] font-medium tracking-wide  ${STATUS_CLASS[hd.trangThai] ?? "bg-gray-500 text-white"}`}>
          {hd.trangThai || ""}
        </span>
      </TableCell>
      <TableCell sx={cellStyles.ghiChu}>{hd.ghiChuChoKhachHang || ""}</TableCell>
      <TableCell
        sx={{
          ...cellStyles.ngayDenHan,
          color: isTreHan ? '#ef4444' : '#6b7280',
          fontWeight: isTreHan ? 600 : 400
        }}
      >
        {textDenHan}
      </TableCell>
      {/* CỘT ẢO DÀNH CHO DÒNG DỮ LIỆU */}
      <TableCell sx={{ padding: 0, borderBottom: "1px solid #d1d5db", width: "auto", minWidth: 0 }} />
    </TableRow>
  );
});

// ================= MOBILE CARD COMPONENT =================
const MobileCard = React.memo(({ hd, onNavigate }) => {
  const baseDate = hd.ngayXuatHoaDon || hd.createdAt;
  let textDenHan = "";
  let isTreHan = false;

  if (baseDate) {
    const ngayDenHan = dayjs(baseDate).add(20, "day").endOf("day");
    textDenHan = ngayDenHan.format("DD/MM/YYYY");
    if (dayjs().isAfter(ngayDenHan) && Number(hd.conLai || 0) > 0) {
      isTreHan = true;
    }
  }

  const statusClass = STATUS_CLASS[hd.trangThai] ?? "bg-gray-500 text-white";

  return (
    <div
      onClick={() => onNavigate(`/hoa-don/${hd._id}/edit`)}
      className="bg-white rounded-2xl shadow-sm border border-[#999] mx-3 mb-3 overflow-hidden active:scale-[0.98] transition-transform duration-150 cursor-pointer"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 border-b border-gray-50">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-gray-800 truncate leading-tight">
            {hd.nhaKhoa?.hoVaTen || hd.nhaKhoa?.tenNhaKhoa || "—"}
          </p>
          <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
            #{hd.soHoaDon || "—"}
          </p>
        </div>
        <span className={`shrink-0 inline-block px-2.5 py-1 text-[11px] font-semibold tracking-wide ${statusClass}`}>
          {hd.trangThai || ""}
        </span>
      </div>

      {/* Card Body: số tiền */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-4 py-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Tổng cộng</p>
          <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.tongCong)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Giảm giá</p>
          <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.chietKhau)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Giá trị TT</p>
          <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.giaTriThanhToan)}</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Đã thanh toán</p>
          <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.daThanhToan)}</p>
        </div>
        {Number(hd.conLai || 0) > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Còn lại</p>
            <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.conLai)}</p>
          </div>
        )}
        {Number(hd.chiPhiKhac || 0) > 0 && (
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Chi phí khác</p>
            <p className="text-[13px] font-semibold text-gray-800">{fmtVND(hd.chiPhiKhac)}</p>
          </div>
        )}
      </div>

      {/* Card Footer: ngày xuất + đến hạn + ghi chú */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/70 border-t border-gray-100 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] text-gray-400 shrink-0">
            {fmtDate(hd.ngayXuatHoaDon || hd.createdAt)}
          </span>
          {textDenHan && (
            <span className={`text-[11px] shrink-0 font-medium ${isTreHan ? "text-[#ef4444]" : "text-gray-400"}`}>
              {isTreHan ? "⚠️ Trễ hạn " : "Đến hạn "}
              {textDenHan}
            </span>
          )}
        </div>
        {hd.ghiChuChoKhachHang && (
          <span className="text-[11px] text-gray-400 truncate ml-2 italic">
            "{hd.ghiChuChoKhachHang}"
          </span>
        )}
      </div>
    </div>
  );
});

// ================= MOBILE LIST =================
const MobileCardList = ({ danhSachHoaDon, loading, onLoadMore, sortOrder, onToggleSort }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const onNavigate = useCallback((path) => navigate(path), [navigate]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      if (onLoadMore) onLoadMore();
    }
  }, [onLoadMore]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto pt-2 pb-4"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Sort bar */}
      <div className="flex items-center justify-between px-4 pb-2">
        <span className="text-[12px] text-gray-400 font-medium">
          {danhSachHoaDon?.length ?? 0} hóa đơn
        </span>
        <button
          onClick={onToggleSort}
          className="flex items-center gap-1 text-[12px] text-[#00a8df] font-semibold"
        >
          Ngày xuất
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-3.5 h-3.5 transition-transform duration-300 ${sortOrder === "desc" ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      {!loading && (!danhSachHoaDon || danhSachHoaDon.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">Không tìm thấy hóa đơn nào.</p>
        </div>
      ) : (
        danhSachHoaDon.map((hd) => (
          <MobileCard key={hd._id} hd={hd} onNavigate={onNavigate} />
        ))
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <CircularProgress size={26} sx={{ color: "#00a8df" }} />
        </div>
      )}
    </div>
  );
};

// ================= COMPONENT CHÍNH =================
const ROW_HEIGHT = 45;
const VISIBLE_ROWS = 25;
const OVERSCAN = 10;

const HoaDonTable = ({ danhSachHoaDon, loading, onLoadMore }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // ── Resizable columns ──
  const [columnWidths, setColumnWidths] = useState({
    ngayXuat: 120, soHoaDon: 130, nhaKhoa: 180, tongCong: 200, giamGia: 120,
    giaTriThanhToan: 200, daThanhToan: 180, conLai: 160, chiPhiKhac: 160,
    trangThai: 160, ghiChu: 160, ngayDenHan: 130,
  });

  const columnWidthsRef = useRef(columnWidths);
  useEffect(() => { columnWidthsRef.current = columnWidths; }, [columnWidths]);

  const totalTableWidth = useMemo(
    () => Object.values(columnWidths).reduce((a, b) => a + b, 0),
    [columnWidths]
  );

  // 🔥 ── Sắp xếp ── 🔥
  const [sortOrder, setSortOrder] = useState("desc");
  const handleToggleSort = () => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));

  const sortedDanhSachHoaDon = useMemo(() => {
    if (!danhSachHoaDon) return [];
    return [...danhSachHoaDon].sort((a, b) => {
      const timeA = new Date(a.ngayXuatHoaDon || a.createdAt || 0).getTime();
      const timeB = new Date(b.ngayXuatHoaDon || b.createdAt || 0).getTime();
      if (timeA !== timeB) return sortOrder === "asc" ? timeA - timeB : timeB - timeA;

      const createdA = new Date(a.createdAt || 0).getTime();
      const createdB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "asc" ? createdA - createdB : createdB - createdA;
    });
  }, [danhSachHoaDon, sortOrder]);

  // 🔥 ── VIRTUAL SCROLLING ── 🔥
  const [scrollTop, setScrollTop] = useState(0);
  const loadingRef = useRef(false);

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    requestAnimationFrame(() => setScrollTop(scrollTop));

    if (scrollHeight - scrollTop - clientHeight < 200) {
      if (onLoadMore && !loadingRef.current) {
        loadingRef.current = true;
        onLoadMore();
      }
    }
  };

  const totalRows = sortedDanhSachHoaDon.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(totalRows, Math.floor(scrollTop / ROW_HEIGHT) + VISIBLE_ROWS + OVERSCAN);
  const visibleRows = sortedDanhSachHoaDon.slice(startIndex, endIndex);

  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = Math.max(0, (totalRows - endIndex) * ROW_HEIGHT);

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

  const cellStyles = useMemo(() => {
    const base = (key) => ({
      width: columnWidths[key], minWidth: columnWidths[key], maxWidth: columnWidths[key],
      boxSizing: "border-box", fontSize: "0.91rem", color: "#333", overflow: "hidden",
      whiteSpace: "nowrap", textOverflow: "clip", borderBottom: "1px solid #d1d5db",
      py: 0.75, pl: 2, pr: NUMERIC_KEYS.has(key) ? 3 : 2, textAlign: NUMERIC_KEYS.has(key) ? "right" : "left",
    });

    const baseHeader = (key) => ({
      ...base(key), position: "relative", fontWeight: 700, fontSize: "0.92rem",
      userSelect: "none", color: "#00a8df", pt: 1, pb: 0.5, pl: 2,
      pr: NUMERIC_KEYS.has(key) ? 3 : 2,
      backgroundColor: "#e6f7ff", borderBottom: "1px solid #e6f7ff",
    });

    const row = {}; const hdr = {};
    ["ngayXuat", "soHoaDon", "nhaKhoa", "tongCong", "giamGia",
      "giaTriThanhToan", "daThanhToan", "conLai", "chiPhiKhac",
      "trangThai", "ghiChu", "ngayDenHan"].forEach((k) => {
        row[k] = base(k); hdr[k] = baseHeader(k);
      });
    return { row, hdr };
  }, [columnWidths]);

  const onNavigate = useCallback((path) => navigate(path), [navigate]);

  // ── Mobile: render card list ──
  if (isMobile) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-[#f5f7fa] ">
        <MobileCardList
          danhSachHoaDon={sortedDanhSachHoaDon}
          loading={loading}
          onLoadMore={onLoadMore}
          sortOrder={sortOrder}
          onToggleSort={handleToggleSort}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <TableContainer
        component={Paper}
        elevation={0}
        onScroll={handleScroll}
        sx={{
          borderRadius: 0, flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 14, width: 14 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#cbd5e1", borderRadius: 10, border: "3px solid #ffffff" },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#94a3b8" },
        }}
      >
        <Table sx={{ tableLayout: "fixed", width: totalTableWidth, minWidth: totalTableWidth }}>
          <TableHead sx={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: "#e6f7ff" }}>
            <TableRow className="group" sx={{ border: "none !important" }}>
              <ResizableHeaderCell
                label={
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-[#00796b] transition-colors"
                    onClick={handleToggleSort}
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
                columnKey="ngayXuat" style={cellStyles.hdr.ngayXuat} onResize={handleResize}
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
              <ResizableHeaderCell label="Ghi chú" columnKey="ghiChu" style={cellStyles.hdr.ghiChu} onResize={handleResize} />
              <ResizableHeaderCell label="Đến hạn" columnKey="ngayDenHan" style={cellStyles.hdr.ngayDenHan} onResize={handleResize} />

              {/* 🔥 CỘT ẢO DÀNH CHO HEADER CHỐNG TRÙNG LẶP */}
              <TableCell sx={{ width: "auto", minWidth: 0, padding: 0, borderBottom: "1px solid #e6f7ff", borderTopRightRadius: "12px", backgroundColor: "#e6f7ff" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {totalRows === 0 && !loading ? (
              <TableRow>
                {/* Đổi colSpan từ 12 thành 13 để đếm luôn cả cột ảo */}
                <TableCell colSpan={13} align="center" className="py-20 text-gray-500">
                  Không tìm thấy dữ liệu hóa đơn nào.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {paddingTop > 0 && (
                  <TableRow style={{ height: paddingTop }}>
                    <TableCell colSpan={13} style={{ padding: 0, border: 'none' }} />
                  </TableRow>
                )}

                {visibleRows.map((hd) => (
                  <RowComponent
                    key={hd._id}
                    hd={hd}
                    cellStyles={cellStyles.row}
                    onNavigate={onNavigate}
                  />
                ))}

                {paddingBottom > 0 && (
                  <TableRow style={{ height: paddingBottom }}>
                    <TableCell colSpan={13} style={{ padding: 0, border: 'none' }} />
                  </TableRow>
                )}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={13} align="center" sx={{ py: 3, border: 'none' }}>
                      <CircularProgress size={26} sx={{ color: "#00a8df" }} />
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default HoaDonTable;