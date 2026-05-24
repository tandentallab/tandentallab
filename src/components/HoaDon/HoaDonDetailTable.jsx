import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

// ================= CÁC HÀM TIỆN ÍCH =================
const fmtVND = (v) => new Intl.NumberFormat("vi-VN").format(Math.round(v || 0));

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "-");

const formatViTriRang = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "-";
    return viTriArr
        .map((v) =>
            v.kieu === "Cầu" && v.soRang?.length > 1
                ? `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
                : v.soRang?.join(", ")
        )
        .join("; ");
};

const getFirstName = (fullName) => {
    if (!fullName || fullName === "---") return "---";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
};

// ================= COMPONENT CHÍNH =================
// Đã nhận thêm prop handleGiamGiaChange
const HoaDonDetailTable = ({ rows, navigate, handleGhiChuChange, handleGiamGiaChange }) => {
    const [columnWidths, setColumnWidths] = useState({
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
        ghiChu: 120,
    });

    const totalTableWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);

    const numericKeys = ["soLuong", "donGia", "thanhTien", "giamGia", "tongCongSanPham"];

    const handleResize = (columnKey, e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = columnWidths[columnKey];

        const onMouseMove = (moveEvent) => {
            const newWidth = startWidth + (moveEvent.clientX - startX);
            setColumnWidths((prev) => ({
                ...prev,
                [columnKey]: Math.max(newWidth, 40),
            }));
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const getCellStyle = (key, isHeader = false) => {
        const isNumeric = numericKeys.includes(key);
        return {
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
            pr: isNumeric ? 3 : 2,
            textAlign: isNumeric ? "right" : "left",
            position: "relative",
            userSelect: isHeader ? "none" : "auto",
            bgcolor: isHeader ? "#e6f7ff" : "transparent",
        };
    };

    const ResizableHeaderCell = ({ label, columnKey, isFirst, isLast }) => (
        <TableCell
            sx={{
                ...getCellStyle(columnKey, true),
                borderTopLeftRadius: isFirst ? "12px" : 0,
                borderTopRightRadius: isLast ? "12px" : 0,
            }}
        >
            {label}
            <div
                onMouseDown={(e) => handleResize(columnKey, e)}
                className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-10 flex items-center justify-center group"
            >
                <div className="w-[1.5px] h-[75%] bg-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
            </div>
        </TableCell>
    );

    return (
        <div className="px-4  flex-1 flex flex-col min-h-0 bg-white">
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
                        bgcolor: "white"
                    }}
                >
                    <TableHead sx={{ position: "sticky", top: 0, zIndex: 20, bgcolor: "#e6f7ff" }}>
                        <TableRow className="group" sx={{ border: "none !important" }}>
                            <ResizableHeaderCell label="Đơn hàng ↓" columnKey="donHang" isFirst />
                            <ResizableHeaderCell label="Ngày nhận" columnKey="ngayNhan" />
                            <ResizableHeaderCell label="Bác sĩ" columnKey="bacSi" />
                            <ResizableHeaderCell label="Bệnh nhân" columnKey="benhNhan" />
                            <ResizableHeaderCell label="Sản phẩm" columnKey="sanPham" />
                            <ResizableHeaderCell label="Loại" columnKey="loaiDon" />
                            <ResizableHeaderCell label="Vị trí răng" columnKey="viTri" />
                            <ResizableHeaderCell label="S.L" columnKey="soLuong" />
                            <ResizableHeaderCell label="Đơn giá" columnKey="donGia" />
                            <ResizableHeaderCell label="Thành tiền" columnKey="thanhTien" />
                            <ResizableHeaderCell label="Giảm giá" columnKey="giamGia" />
                            <ResizableHeaderCell label="Tổng cộng" columnKey="tongCongSanPham" />
                            <ResizableHeaderCell label="Ghi chú" columnKey="ghiChu" />

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
                                <TableRow key={idx} hover className="transition-colors">
                                    <TableCell
                                        sx={{ ...getCellStyle("donHang"), color: "#00a8df", fontWeight: 500, cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => navigate(`/donhang/${sp.donHang?._id}/edit`)}
                                    >
                                        {sp.donHang?.maDonHang || "---"}
                                    </TableCell>
                                    <TableCell sx={getCellStyle("ngayNhan")}>{fmtDate(sp.donHang?.ngayNhan)}</TableCell>
                                    <TableCell sx={getCellStyle("bacSi")}>{getFirstName(sp.donHang?.bacSi?.hoVaTen)}</TableCell>
                                    <TableCell sx={getCellStyle("benhNhan")}>{sp.donHang?.benhNhan?.hoVaTen || "---"}</TableCell>
                                    <TableCell sx={{ ...getCellStyle("sanPham"), fontWeight: 500 }}>{sp.tenSanPham || "---"}</TableCell>
                                    <TableCell sx={getCellStyle("loaiDon")}>{sp.loaiDon || "---"}</TableCell>
                                    <TableCell sx={{ ...getCellStyle("viTri"), fontFamily: "monospace" }}>{formatViTriRang(sp.viTri)}</TableCell>
                                    <TableCell sx={{ ...getCellStyle("soLuong"), fontWeight: "bold" }}>{sp.soLuong}</TableCell>
                                    <TableCell sx={getCellStyle("donGia")}>{fmtVND(sp.donGia)}</TableCell>
                                    <TableCell sx={getCellStyle("thanhTien")}>{fmtVND(sp.thanhTien)}</TableCell>

                                    {/* CỘT GIẢM GIÁ % ĐÃ CHUYỂN THÀNH Ô INPUT */}
                                    <TableCell sx={getCellStyle("giamGia")}>
                                        <div className="flex items-center gap-2 w-full">

                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={
                                                    sp.loaiGiamGia === "phanTram"
                                                        ? (sp.giamGiaPhanTram || "")
                                                        : ((sp.giamGia || 0).toLocaleString("vi-VN"))
                                                }
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, "");

                                                    handleGiamGiaChange(
                                                        idx,
                                                        Number(rawValue),
                                                        sp.loaiGiamGia || "phanTram"
                                                    );
                                                }}
                                                className="w-[calc(100%-34px)] border border-gray-300 rounded-md px-2 py-1 outline-none text-right bg-white focus:border-blue-500"
                                            />

                                            <select
                                                value={sp.loaiGiamGia || "phanTram"}
                                                onChange={(e) =>
                                                    handleGiamGiaChange(
                                                        idx,
                                                        sp.giamGia,
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

                                    <TableCell sx={{ ...getCellStyle("tongCongSanPham"), fontWeight: "bold" }}>{fmtVND(sp.tongCongSanPham)}</TableCell>
                                    <TableCell sx={getCellStyle("ghiChu")}>
                                        <input
                                            type="text"
                                            value={sp.ghiChu || ""}
                                            onChange={(e) => handleGhiChuChange(idx, e.target.value)}
                                            placeholder="Ghi chú..."
                                            className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#00a8df] outline-none text-gray-700 transition-colors py-0.5"
                                        />
                                    </TableCell>

                                    {/* CỘT ẢO BODY */}
                                    <TableCell sx={{ padding: 0, borderBottom: "1px solid #cbd5e1", width: "auto", minWidth: 0 }} />
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default HoaDonDetailTable;