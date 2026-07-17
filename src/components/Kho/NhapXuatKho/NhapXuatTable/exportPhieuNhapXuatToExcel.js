import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { api } from "../../../../config/api";
import dayjs from "dayjs";
import { aggregateVatLieu } from "./constants";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return "";
    return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
}

const BORDER = (argb = "FFD0D0D0") => ({
    top: { style: "thin", color: { argb } },
    bottom: { style: "thin", color: { argb } },
    left: { style: "thin", color: { argb } },
    right: { style: "thin", color: { argb } },
});

function headerStyle(cell, bgArgb = "FF1565C0") {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = BORDER("FFBBDEFB");
}

function stripeRow(row, index) {
    if (index % 2 === 1) {
        row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F8F8" } };
        });
    }
}

// ── Build filter label string ─────────────────────────────────────────────────

function buildFilterLabel({ selectedMonth, selectedNCC, selectedBoPhan, selectedTrangThai }) {
    const parts = [];
    if (selectedMonth) parts.push(`Tháng: ${selectedMonth}`);
    if (selectedNCC) parts.push(`NCC: ${selectedNCC}`);
    if (selectedBoPhan) parts.push(`Bộ phận: ${selectedBoPhan}`);
    if (selectedTrangThai?.length) parts.push(`Trạng thái: ${selectedTrangThai.join(", ")}`);
    return parts.length ? parts.join(" | ") : "Tất cả dữ liệu";
}

// ── Sheet 1: Phiếu Nhập Kho ───────────────────────────────────────────────────

function buildNhapSheet(workbook, data, filterLabel) {
    const sheet = workbook.addWorksheet("Phiếu Nhập Kho", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Title
    sheet.mergeCells("A1:I1");
    const title = sheet.getCell("A1");
    title.value = "DANH SÁCH PHIẾU NHẬP KHO";
    title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0277BD" } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    // Sub-title (filter + date)
    sheet.mergeCells("A2:I2");
    const sub = sheet.getCell("A2");
    sub.value = `${filterLabel}   |   Xuất ngày: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
    sub.font = { italic: true, size: 9, color: { argb: "FF555555" } };
    sub.alignment = { horizontal: "right" };

    // Header row
    const headers = [
        "STT", "Số phiếu", "Ngày nhập", "Người tạo", "Nhà cung cấp",
        "Tổng tiền (₫)", "Trạng thái nhập", "Trạng thái thanh toán", "Ghi chú",
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => headerStyle(cell, "FF0277BD"));

    // Cột: 1 STT | 2 Số phiếu | 3 Ngày nhập | 4 Người tạo | 5 NCC | 6 Tổng tiền | 7 TT nhập | 8 TT thanh toán | 9 Ghi chú
    const COL_TONG_TIEN = 6;
    const COL_TT_NHAP = 7;
    const COL_TT_THANH_TOAN = 8;

    // Data rows
    let tongTienAll = 0;
    data.forEach((phieu, idx) => {
        const tongTien = phieu.tongTien || 0;
        tongTienAll += tongTien;

        const row = sheet.addRow([
            idx + 1,
            phieu.soPhieu || "",
            formatDate(phieu.ngayTao),
            phieu.nguoiTao || "",
            phieu.nhaCungCap?.ten || "—",
            tongTien,
            phieu.trangThaiNhap || "",
            phieu.trangThaiThanhToan || "",
            phieu.ghiChu || "",
        ]);
        row.height = 20;
        row.eachCell((cell) => {
            cell.border = BORDER();
            cell.alignment = { vertical: "middle" };
        });
        stripeRow(row, idx);

        // Trạng thái nhập
        const ttNhapCell = row.getCell(COL_TT_NHAP);
        ttNhapCell.font = {
            bold: true,
            color: { argb: phieu.trangThaiNhap === "Đã nhận" ? "FF1B5E20" : "FF7B5800" },
        };

        // Trạng thái thanh toán
        const ttThanhToanCell = row.getCell(COL_TT_THANH_TOAN);
        ttThanhToanCell.font = {
            bold: true,
            color: { argb: phieu.trangThaiThanhToan === "Đã thanh toán" ? "FF1B5E20" : "FF7B5800" },
        };

        // Currency format
        row.getCell(COL_TONG_TIEN).numFmt = '#,##0';
        row.getCell(COL_TONG_TIEN).alignment = { horizontal: "right", vertical: "middle" };
    });

    // Total footer
    sheet.addRow([]);
    const footerRow = sheet.addRow([
        "", `Tổng: ${data.length} phiếu`, "", "", "Tổng tiền:", tongTienAll, "", "", ""
    ]);
    footerRow.height = 20;
    footerRow.getCell(2).font = { bold: true, italic: true };
    footerRow.getCell(5).font = { bold: true };
    footerRow.getCell(COL_TONG_TIEN).numFmt = '#,##0';
    footerRow.getCell(COL_TONG_TIEN).font = { bold: true, color: { argb: "FF1565C0" } };
    footerRow.getCell(COL_TONG_TIEN).alignment = { horizontal: "right", vertical: "middle" };

    // Column widths
    sheet.columns = [
        { key: "stt", width: 6 },
        { key: "soPhieu", width: 18 },
        { key: "ngay", width: 18 },
        { key: "nguoiTao", width: 18 },
        { key: "ncc", width: 28 },
        { key: "tongTien", width: 18 },
        { key: "trangThaiNhap", width: 16 },
        { key: "trangThaiThanhToan", width: 20 },
        { key: "ghiChu", width: 30 },
    ];
}

// ── Sheet 2: Phiếu Xuất Kho ───────────────────────────────────────────────────

function buildXuatSheet(workbook, data, filterLabel) {
    const sheet = workbook.addWorksheet("Phiếu Xuất Kho", {
        pageSetup: { paperSize: 9, orientation: "landscape" },
    });

    // Title
    sheet.mergeCells("A1:G1");
    const title = sheet.getCell("A1");
    title.value = "DANH SÁCH PHIẾU XUẤT KHO";
    title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1B5E20" } };
    title.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    // Sub-title
    sheet.mergeCells("A2:G2");
    const sub = sheet.getCell("A2");
    sub.value = `${filterLabel}   |   Xuất ngày: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
    sub.font = { italic: true, size: 9, color: { argb: "FF555555" } };
    sub.alignment = { horizontal: "right" };

    // Header
    const headers = ["STT", "Số phiếu", "Ngày xuất", "Bộ phận", "Nhân viên", "Trạng thái", "Ghi chú"];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => headerStyle(cell, "FF1B5E20"));

    // Data rows
    data.forEach((phieu, idx) => {
        const row = sheet.addRow([
            idx + 1,
            phieu.soPhieu || "",
            formatDate(phieu.ngayTao),
            phieu.boPhan || "",
            phieu.nhanVien || "",
            phieu.trangThai || "",
            phieu.ghiChu || "",
        ]);
        row.height = 20;
        row.eachCell((cell) => {
            cell.border = BORDER();
            cell.alignment = { vertical: "middle" };
        });
        stripeRow(row, idx);

        const statusCell = row.getCell(6);
        if (phieu.trangThai === "Đã xuất") {
            statusCell.font = { color: { argb: "FF1B5E20" }, bold: true };
        } else {
            statusCell.font = { color: { argb: "FF7B5800" }, bold: true };
        }
    });

    // Footer
    sheet.addRow([]);
    const footerRow = sheet.addRow(["", `Tổng: ${data.length} phiếu`]);
    footerRow.height = 20;
    footerRow.getCell(2).font = { bold: true, italic: true };

    // Column widths
    sheet.columns = [
        { key: "stt", width: 6 },
        { key: "soPhieu", width: 18 },
        { key: "ngay", width: 18 },
        { key: "boPhan", width: 20 },
        { key: "nhanVien", width: 20 },
        { key: "trangThai", width: 14 },
        { key: "ghiChu", width: 30 },
    ];
}

// ── Sheet 3 & 4: Vật liệu Nhập / Xuất (tổng hợp) ──────────────────────────────

function buildVatLieuSheet(workbook, sheetName, title, vatLieuData, filterLabel, bgArgb) {
    const sheet = workbook.addWorksheet(sheetName, {
        pageSetup: { paperSize: 9, orientation: "portrait" },
    });

    // Title
    sheet.mergeCells("A1:C1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgArgb } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 30;

    // Sub-title
    sheet.mergeCells("A2:C2");
    const sub = sheet.getCell("A2");
    sub.value = `${filterLabel}   |   Xuất ngày: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
    sub.font = { italic: true, size: 9, color: { argb: "FF555555" } };
    sub.alignment = { horizontal: "right" };

    // Header
    const headers = ["Tên vật liệu", "ĐVT", "Số lượng"];
    const headerRow = sheet.addRow(headers);
    headerRow.height = 22;
    headerRow.eachCell((cell) => headerStyle(cell, bgArgb));

    // Sort giảm dần theo số lượng cho dễ nhìn
    const sorted = [...vatLieuData].sort((a, b) => b.soLuong - a.soLuong);

    let tongSoLuong = 0;
    sorted.forEach((item, idx) => {
        tongSoLuong += item.soLuong || 0;
        const row = sheet.addRow([item.tenVatLieu, item.donViTinh || "", item.soLuong || 0]);
        row.height = 20;
        row.eachCell((cell) => {
            cell.border = BORDER();
            cell.alignment = { vertical: "middle" };
        });
        row.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
        stripeRow(row, idx);
    });

    // Footer
    if (sorted.length > 0) {
        const footerRow = sheet.addRow(["Tổng", "", tongSoLuong]);
        footerRow.height = 20;
        footerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F0F0" } };
            cell.border = BORDER();
        });
        footerRow.getCell(3).alignment = { horizontal: "right", vertical: "middle" };
    } else {
        const emptyRow = sheet.addRow(["Không có dữ liệu", "", ""]);
        emptyRow.getCell(1).font = { italic: true, color: { argb: "FF999999" } };
    }

    // Column widths
    sheet.columns = [
        { key: "tenVatLieu", width: 32 },
        { key: "donViTinh", width: 14 },
        { key: "soLuong", width: 14 },
    ];
}

// ── Main export function ──────────────────────────────────────────────────────

/**
 * @param {object} nhapParams  - query params cho phiếu nhập (không có page/limit)
 * @param {object} xuatParams  - query params cho phiếu xuất
 * @param {object} filterMeta  - { selectedMonth, selectedNCC, selectedBoPhan, selectedTrangThai }
 */
export async function exportPhieuNhapXuatToExcel(nhapParams, xuatParams, filterMeta) {
    const filterLabel = buildFilterLabel(filterMeta);

    // Fetch toàn bộ dữ liệu theo bộ lọc (bỏ phân trang)
    const [resNhap, resXuat] = await Promise.all([
        api.get("/phieu-nhap-kho", { params: { ...nhapParams, page: 1, limit: 10000 } }),
        api.get("/phieu-xuat-kho", { params: { ...xuatParams, page: 1, limit: 10000 } }),
    ]);

    const nhapData = resNhap.data?.data || [];
    const xuatData = resXuat.data?.data || [];

    // Tổng hợp vật liệu từ chính dữ liệu vừa fetch (khớp đúng bộ lọc, không phụ thuộc UI)
    const vatLieuNhap = aggregateVatLieu(nhapData);
    const vatLieuXuat = aggregateVatLieu(xuatData);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống quản lý kho";
    workbook.created = new Date();

    buildNhapSheet(workbook, nhapData, filterLabel);
    buildXuatSheet(workbook, xuatData, filterLabel);
    buildVatLieuSheet(workbook, "Vật Liệu Nhập", "TỔNG HỢP VẬT LIỆU NHẬP", vatLieuNhap, filterLabel, "FF0277BD");
    buildVatLieuSheet(workbook, "Vật Liệu Xuất", "TỔNG HỢP VẬT LIỆU XUẤT", vatLieuXuat, filterLabel, "FF1B5E20");

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `PhieuNhapXuat_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
    saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
}