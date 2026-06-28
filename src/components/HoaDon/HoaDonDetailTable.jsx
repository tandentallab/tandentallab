import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";

// ================= FORMATTERS (module-level, khởi tạo 1 lần) =================
const vndFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN");

const fmtVND = (v) => vndFormatter.format(Math.round(v || 0));
const fmtDate = (d) => d ? dateFormatter.format(new Date(d)) : "-";

// ================= UTILS (module-level) =================
const NUMERIC_KEYS = new Set(["soLuong", "donGia", "thanhTien", "giamGia", "tongCongSanPham"]);

const formatViTriRang = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "-";
    return viTriArr
        .map((v) =>
            v.kieu === "Cầu" && v.soRang?.length > 1
                ? `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
                : v.soRang?.join(", ")
        )
        .join(", ");
};

const getFirstName = (fullName) => {
    if (!fullName || fullName === "---") return "---";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
};

// ================= CELL STYLES — tĩnh hoàn toàn, tính 1 lần =================
// Width được kiểm soát bởi <colgroup> nên không cần đưa vào đây
const CELL_STYLES = (() => {
    const base = (key, isHeader = false) => ({
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

    const COLS = [
        "donHang", "ngayNhan", "bacSi", "benhNhan", "sanPham",
        "loaiDon", "viTri", "soLuong", "donGia", "thanhTien",
        "giamGia", "tongCongSanPham", "ghiChu",
    ];

    const row = {};
    const hdr = {};
    COLS.forEach((k) => {
        row[k] = base(k, false);
        hdr[k] = base(k, true);
    });

    row.donHang_link = { ...row.donHang, color: "#00a8df", fontWeight: 500, cursor: "pointer", textDecoration: "underline" };
    row.sanPham_bold = { ...row.sanPham, fontWeight: 500 };
    row.viTri_mono = { ...row.viTri, fontFamily: "monospace" };
    row.soLuong_bold = { ...row.soLuong, fontWeight: "bold" };
    row.tongCong_bold = { ...row.tongCongSanPham, fontWeight: "bold" };
    hdr.donHang_first = { ...hdr.donHang, borderTopLeftRadius: "12px" };

    return { row, hdr };
})();

// ================= RESIZABLE HEADER CELL =================
const RHCell = React.memo(({ label, style, columnKey, onResize }) => (
    <TableCell sx={style}>
        {label}
        <div
            onMouseDown={(e) => onResize(columnKey, e)}
            className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 flex items-center justify-center group"
        >
            <div className="w-[1.5px] h-[75%] bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        </div>
    </TableCell>
));

// ================= DETAIL ROW =================
const DetailRow = React.memo(({ sp, idx, isLocked, canEditItems, uniqueOrdersCount, handleGiamGiaChange, handleGhiChuChange, onDeleteClick, navigate }) => {
    return (
        <TableRow hover className="transition-colors group">
            <TableCell
                sx={CELL_STYLES.row.donHang_link}
                onClick={() => navigate(`/donhang/${sp.donHang?._id}/edit`)}
            >
                {sp.donHang?.maDonHang || "---"}
            </TableCell>

            <TableCell sx={CELL_STYLES.row.ngayNhan}>{fmtDate(sp.donHang?.ngayNhan)}</TableCell>
            <TableCell sx={CELL_STYLES.row.bacSi}>{getFirstName(sp.donHang?.bacSi?.hoVaTen)}</TableCell>
            <TableCell sx={CELL_STYLES.row.benhNhan}>{sp.donHang?.benhNhan?.hoVaTen || "---"}</TableCell>
            <TableCell sx={CELL_STYLES.row.sanPham_bold}>{sp.tenSanPham || "---"}</TableCell>
            <TableCell sx={CELL_STYLES.row.loaiDon}>{sp.loaiDon || "---"}</TableCell>
            <TableCell sx={CELL_STYLES.row.viTri_mono}>{formatViTriRang(sp.viTri)}</TableCell>
            <TableCell sx={CELL_STYLES.row.soLuong_bold}>{sp.soLuong}</TableCell>
            <TableCell sx={CELL_STYLES.row.donGia}>{fmtVND(sp.donGia)}</TableCell>
            <TableCell sx={CELL_STYLES.row.thanhTien}>{fmtVND(sp.thanhTien)}</TableCell>

            <TableCell sx={CELL_STYLES.row.giamGia}>
                <div className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        inputMode="numeric"
                        disabled={isLocked}
                        value={
                            sp.loaiGiamGia === "phanTram"
                                ? (sp.giamGiaPhanTram || "")
                                : vndFormatter.format(sp.giamGia || 0)
                        }
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            handleGiamGiaChange(idx, Number(rawValue), sp.loaiGiamGia || "phanTram");
                        }}
                        className="w-[calc(100%-34px)] border border-gray-300 rounded-md px-2 py-1 outline-none text-right bg-white focus:border-blue-500"
                    />
                    <select
                        disabled={isLocked}
                        value={sp.loaiGiamGia || "phanTram"}
                        onChange={(e) =>
                            handleGiamGiaChange(
                                idx,
                                e.target.value === "phanTram" ? (sp.giamGiaPhanTram || 0) : sp.giamGia,
                                e.target.value
                            )
                        }
                        className="w-[34px] h-[34px] rounded-md border border-gray-300 bg-gray-50 cursor-pointer outline-none text-sm"
                    >
                        <option value="phanTram">%</option>
                        <option value="tienMat">đ</option>
                    </select>
                </div>
            </TableCell>

            <TableCell sx={CELL_STYLES.row.tongCong_bold}>{fmtVND(sp.tongCongSanPham)}</TableCell>

            <TableCell sx={CELL_STYLES.row.ghiChu}>
                <input
                    disabled={isLocked}
                    type="text"
                    value={sp.ghiChu || ""}
                    onChange={(e) => handleGhiChuChange(idx, e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#00a8df] outline-none text-gray-700 transition-colors py-0.5"
                />
            </TableCell>

            {/* CỘT ẢO CUỐI CÙNG CHỨA NÚT X */}
            <TableCell sx={{ padding: 0, borderBottom: "1px solid #cbd5e1", width: 40, minWidth: 40, position: "relative" }}>
                {canEditItems && (
                    <button
                        onClick={() => {
                            if (uniqueOrdersCount <= 1) {
                                toast.error("Hóa đơn phải chứa ít nhất 1 đơn hàng! Nếu muốn hủy, vui lòng chọn Xóa Hóa Đơn ở dưới cùng.");
                            } else {
                                onDeleteClick(sp.donHang);
                            }
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 z-10"
                        title="Loại bỏ đơn hàng này"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </TableCell>
        </TableRow>
    );
});

// ================= COLGROUP — cập nhật DOM trực tiếp, không trigger React re-render =================
const ColGroup = ({ colRefs }) => (
    <colgroup>
        {Object.keys(colRefs.current).map((key) => (
            <col key={key} ref={(el) => { if (el) colRefs.current[key] = el; }} />
        ))}
        <col style={{ width: 40 }} />
    </colgroup>
);

// ================= COMPONENT CHÍNH =================
const DEFAULT_WIDTHS = {
    donHang: 110,
    ngayNhan: 95,
    bacSi: 80,
    benhNhan: 140,
    sanPham: 140,
    loaiDon: 85,
    viTri: 140,
    soLuong: 50,
    donGia: 115,
    thanhTien: 140,
    giamGia: 160,
    tongCongSanPham: 110,
    ghiChu: 300,
};

const COLS_ORDER = Object.keys(DEFAULT_WIDTHS);

const HoaDonDetailTable = ({ rows, navigate, handleGhiChuChange, handleGiamGiaChange, isLocked, canEditItems, onRemoveDonHang, onAddRowClick }) => {

    const [deleteTarget, setDeleteTarget] = useState(null);

    const uniqueOrdersCount = useMemo(() => {
        const ids = new Set();
        rows.forEach(sp => {
            if (sp.donHang?._id) ids.add(sp.donHang._id);
            else if (sp.donHang) ids.add(sp.donHang);
        });
        return ids.size;
    }, [rows]);

    // widths chỉ dùng để tính tổng width cho minWidth của Table
    // việc resize cập nhật DOM trực tiếp qua colRefs, không setState
    const widthsRef = useRef({ ...DEFAULT_WIDTHS });
    const colElemsRef = useRef(
        Object.fromEntries(COLS_ORDER.map((k) => [k, null]))
    );
    const tableRef = useRef(null);

    // Tổng width ban đầu — chỉ dùng để set minWidth Table, update qua ref khi resize
    const totalWidthRef = useRef(
        COLS_ORDER.reduce((s, k) => s + DEFAULT_WIDTHS[k], 0) + 40
    );
    const [tableMinWidth, setTableMinWidth] = useState(totalWidthRef.current);

    const handleResize = useCallback((columnKey, e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = widthsRef.current[columnKey];
        let rafPending = false;
        let lastX = startX;

        const onMouseMove = (mv) => {
            lastX = mv.clientX;
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                const newWidth = Math.max(startWidth + (lastX - startX), 40);
                const delta = newWidth - widthsRef.current[columnKey];
                widthsRef.current[columnKey] = newWidth;
                totalWidthRef.current += delta;

                // Cập nhật DOM trực tiếp — không setState, không re-render
                const colEl = colElemsRef.current[columnKey];
                if (colEl) colEl.style.width = `${newWidth}px`;
                if (tableRef.current) tableRef.current.style.minWidth = `${totalWidthRef.current}px`;

                rafPending = false;
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            // Sync state 1 lần duy nhất khi thả chuột (để persist nếu cần)
            setTableMinWidth(totalWidthRef.current);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, []);

    return (
        <div className="px-4 flex-1 flex flex-col min-h-0 bg-white relative">
            <TableContainer
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
                <Table
                    ref={tableRef}
                    sx={{
                        tableLayout: "fixed",
                        width: "100%",
                        minWidth: `${tableMinWidth}px`,
                        borderCollapse: "collapse",
                        bgcolor: "white",
                    }}
                >
                    {/* colgroup: mỗi <col> được ref trực tiếp để update width không qua React */}
                    <colgroup>
                        {COLS_ORDER.map((key) => (
                            <col
                                key={key}
                                ref={(el) => { if (el) colElemsRef.current[key] = el; }}
                                style={{ width: DEFAULT_WIDTHS[key] }}
                            />
                        ))}
                        <col style={{ width: 40 }} />
                    </colgroup>

                    <TableHead sx={{ position: "sticky", top: 0, zIndex: 20, bgcolor: "#e6f7ff" }}>
                        <TableRow className="group" sx={{ border: "none !important" }}>
                            <RHCell label="Đơn hàng ↓" columnKey="donHang" style={CELL_STYLES.hdr.donHang_first} onResize={handleResize} />
                            <RHCell label="Ngày nhận" columnKey="ngayNhan" style={CELL_STYLES.hdr.ngayNhan} onResize={handleResize} />
                            <RHCell label="Bác sĩ" columnKey="bacSi" style={CELL_STYLES.hdr.bacSi} onResize={handleResize} />
                            <RHCell label="Bệnh nhân" columnKey="benhNhan" style={CELL_STYLES.hdr.benhNhan} onResize={handleResize} />
                            <RHCell label="Sản phẩm" columnKey="sanPham" style={CELL_STYLES.hdr.sanPham} onResize={handleResize} />
                            <RHCell label="Loại" columnKey="loaiDon" style={CELL_STYLES.hdr.loaiDon} onResize={handleResize} />
                            <RHCell label="Vị trí răng" columnKey="viTri" style={CELL_STYLES.hdr.viTri} onResize={handleResize} />
                            <RHCell label="S.L" columnKey="soLuong" style={CELL_STYLES.hdr.soLuong} onResize={handleResize} />
                            <RHCell label="Đơn giá" columnKey="donGia" style={CELL_STYLES.hdr.donGia} onResize={handleResize} />
                            <RHCell label="Thành tiền" columnKey="thanhTien" style={CELL_STYLES.hdr.thanhTien} onResize={handleResize} />
                            <RHCell label="Giảm giá" columnKey="giamGia" style={CELL_STYLES.hdr.giamGia} onResize={handleResize} />
                            <RHCell label="Tổng cộng" columnKey="tongCongSanPham" style={CELL_STYLES.hdr.tongCongSanPham} onResize={handleResize} />
                            <RHCell label="Ghi chú" columnKey="ghiChu" style={CELL_STYLES.hdr.ghiChu} onResize={handleResize} />
                            <TableCell sx={{ width: 40, minWidth: 40, padding: 0, borderBottom: "1px solid #e6f7ff", borderTopRightRadius: "12px", bgcolor: "#e6f7ff" }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={14} align="center" sx={{ py: 6, color: "text.secondary", borderBottom: "none" }}>
                                    Chưa có sản phẩm
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((sp, idx) => (
                                <DetailRow
                                    key={idx}
                                    sp={sp}
                                    idx={idx}
                                    isLocked={isLocked}
                                    canEditItems={canEditItems}
                                    uniqueOrdersCount={uniqueOrdersCount}
                                    handleGiamGiaChange={handleGiamGiaChange}
                                    handleGhiChuChange={handleGhiChuChange}
                                    onDeleteClick={setDeleteTarget}
                                    navigate={navigate}
                                />
                            ))
                        )}

                        {/* DÒNG: + THÊM DÒNG */}
                        {canEditItems && (
                            <TableRow>
                                <TableCell colSpan={14} sx={{ py: 2, borderBottom: "none" }}>
                                    <button
                                        onClick={onAddRowClick}
                                        className="text-[#00a8df] font-semibold text-[13px] hover:underline flex items-center gap-1 ml-1"
                                    >
                                        + Thêm dòng
                                    </button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* POPUP XÁC NHẬN XÓA ĐƠN HÀNG */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md mx-4">
                        <p className="text-gray-900 font-bold text-lg mb-2">Xác nhận loại bỏ</p>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            Thao tác này sẽ loại bỏ tất cả sản phẩm của Đơn hàng <span className="font-bold text-black">{deleteTarget.maDonHang}</span> ra khỏi danh sách! Bạn có chắc không?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black hover:bg-gray-100 transition-colors"
                            >
                                Không
                            </button>
                            <button
                                onClick={() => {
                                    onRemoveDonHang(deleteTarget._id);
                                    setDeleteTarget(null);
                                }}
                                className="px-5 py-2.5 bg-[#00a8df] text-white rounded-xl text-sm font-bold hover:bg-sky-600 transition-colors shadow-sm"
                            >
                                Có
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HoaDonDetailTable;