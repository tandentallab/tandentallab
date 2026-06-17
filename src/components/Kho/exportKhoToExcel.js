// utils/exportKhoToExcel.js
// Cần cài: npm install exceljs file-saver
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

/**
 * Xuất danh sách vật liệu ra Excel
 * @param {Array} vatLieuList - mảng vật liệu (đã populate nhaCungCap)
 */
export const exportDanhSachVatLieuToExcel = async (vatLieuList = []) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Hệ thống quản lý kho";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Danh sách vật liệu", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // ===== TIÊU ĐỀ =====
  sheet.mergeCells("A1:H1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "DANH SÁCH VẬT LIỆU KHO";
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1565C0" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 32;

  // Ngày xuất
  sheet.mergeCells("A2:H2");
  const dateCell = sheet.getCell("A2");
  dateCell.value = `Ngày xuất: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
  dateCell.font = { italic: true, size: 10, color: { argb: "FF555555" } };
  dateCell.alignment = { horizontal: "right" };

  // ===== HEADER =====
  const headerRow = sheet.addRow([
    "STT",
    "Mã vật liệu",
    "Tên vật liệu",
    "Nhà cung cấp",
    "Số lượng tồn",
    "Tồn kho tối thiểu",
    "Đơn vị tính",
    "Ghi chú",
  ]);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1976D2" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFBBDEFB" } },
      bottom: { style: "thin", color: { argb: "FFBBDEFB" } },
      left: { style: "thin", color: { argb: "FFBBDEFB" } },
      right: { style: "thin", color: { argb: "FFBBDEFB" } },
    };
  });

  // ===== DỮ LIỆU =====
  let soHangThieuHang = 0;
  vatLieuList.forEach((vl, idx) => {
    const thieuHang = vl.soLuong < vl.tonKhoToiThieu;
    if (thieuHang) soHangThieuHang++;

    const row = sheet.addRow([
      idx + 1,
      vl.maVatLieu,
      vl.tenVatLieu,
      vl.nhaCungCap?.ten || "",
      vl.soLuong ?? 0,
      vl.tonKhoToiThieu ?? 0,
      vl.donViTinh || "",
      vl.ghiChu || "",
    ]);

    row.height = 20;
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE3F2FD" } },
        bottom: { style: "thin", color: { argb: "FFE3F2FD" } },
        left: { style: "thin", color: { argb: "FFE3F2FD" } },
        right: { style: "thin", color: { argb: "FFE3F2FD" } },
      };
      cell.alignment = { vertical: "middle" };
    });

    // Highlight hàng thiếu hàng
    if (thieuHang) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF3CD" } };
      });
      row.getCell(5).font = { bold: true, color: { argb: "FFDC3545" } };
    } else if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F5F5" } };
      });
    }
    // Căn phải số lượng
    row.getCell(5).alignment = { horizontal: "center", vertical: "middle" };
    row.getCell(6).alignment = { horizontal: "center", vertical: "middle" };
  });

  // ===== FOOTER =====
  sheet.addRow([]);
  const footerRow = sheet.addRow([
    "",
    `Tổng: ${vatLieuList.length} vật liệu`,
    "",
    "",
    "",
    `Thiếu hàng: ${soHangThieuHang}`,
    "",
    "",
  ]);
  footerRow.getCell(2).font = { bold: true, italic: true };
  footerRow.getCell(6).font = { bold: true, color: { argb: "FFDC3545" } };

  // ===== ĐỘ RỘNG CỘT =====
  sheet.columns = [
    { key: "stt", width: 6 },
    { key: "ma", width: 16 },
    { key: "ten", width: 32 },
    { key: "ncc", width: 24 },
    { key: "sl", width: 14 },
    { key: "min", width: 18 },
    { key: "dvt", width: 12 },
    { key: "ghichu", width: 28 },
  ];

  // ===== XUẤT FILE =====
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `DanhSachVatLieu_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
};

/**
 * Xuất danh sách nhà cung cấp ra Excel
 * @param {Array} nhaCungCapList
 */
export const exportDanhSachNhaCungCapToExcel = async (nhaCungCapList = []) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Nhà cung cấp");

  sheet.mergeCells("A1:E1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "DANH SÁCH NHÀ CUNG CẤP";
  titleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF388E3C" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  sheet.getRow(1).height = 30;

  sheet.mergeCells("A2:E2");
  sheet.getCell("A2").value = `Ngày xuất: ${dayjs().format("DD/MM/YYYY HH:mm")}`;
  sheet.getCell("A2").font = { italic: true, size: 10 };
  sheet.getCell("A2").alignment = { horizontal: "right" };

  const headerRow = sheet.addRow(["STT", "Tên nhà cung cấp", "Địa chỉ", "Số điện thoại", "Email"]);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF43A047" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFA5D6A7" } } };
  });
  headerRow.height = 22;

  nhaCungCapList.forEach((ncc, idx) => {
    const row = sheet.addRow([
      idx + 1,
      ncc.ten,
      ncc.diaChi || "",
      ncc.soDienThoai || "",
      ncc.email || "",
    ]);
    row.height = 20;
    if (idx % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F8E9" } };
      });
    }
  });

  sheet.columns = [
    { width: 6 }, { width: 30 }, { width: 36 }, { width: 18 }, { width: 28 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `DanhSachNhaCungCap_${dayjs().format("DDMMYYYY_HHmm")}.xlsx`;
  saveAs(new Blob([buffer], { type: "application/octet-stream" }), fileName);
};
