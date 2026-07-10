import ExcelJS from "exceljs";

/**
 * Xuất file Excel "Lịch sử lương căn bản" dạng pivot, có định dạng đẹp:
 *  - Tiêu đề merge, nền xanh đậm, chữ trắng đậm
 *  - Hàng tiêu đề cột: nền xanh, chữ trắng đậm, có border
 *  - Dữ liệu: xen kẽ màu hàng (trắng / xám nhạt), số có dấu phân cách nghìn + "đ"
 *  - Ô trống (chưa có bảng lương tháng đó): hiện "—" màu xám nhạt, in nghiêng
 *  - Cố định (freeze) 3 hàng đầu + 2 cột đầu khi cuộn
 *  - Có hàng Tổng cuối bảng + auto-filter trên hàng tiêu đề
 *
 * ⚠️ Cần cài thêm thư viện: npm install exceljs
 *
 * @param {Array} rows  Mảng đã pivot sẵn: [{ stt, hoVaTen, values: { "thang-nam": number|null } }]
 * @param {Array} columns Mảng cột tháng đã lọc, đã sort tăng dần: [{ key, thang, nam, label }]
 * @param {string} rangeLabel  Nhãn khoảng thời gian để đặt tiêu đề, vd "Tháng 7/2025 - Tháng 6/2026"
 */

const COLOR = {
  titleBg: "FF0369A1",
  titleText: "FFFFFFFF",
  headerBg: "FF0284C7",
  headerText: "FFFFFFFF",
  rowEven: "FFFFFFFF",
  rowOdd: "FFF8FAFC",
  border: "FFDDE3EA",
  sttText: "FF64748B",
  nameText: "FF1E293B",
  numberText: "FF334155",
  emptyText: "FFB6C0CC",
  totalBg: "FFECFDF5",
  totalText: "FF047857",
};

const thinBorder = {
  top: { style: "thin", color: { argb: COLOR.border } },
  left: { style: "thin", color: { argb: COLOR.border } },
  bottom: { style: "thin", color: { argb: COLOR.border } },
  right: { style: "thin", color: { argb: COLOR.border } },
};

export const exportLichSuLuongToExcel = async (rows, columns, rangeLabel) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Bảng lương";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Lich su luong", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 3, showGridLines: false }],
  });

  const colCount = 2 + columns.length;
  const headerRowIdx = 3;

  /* ================= TIÊU ĐỀ ================= */
  sheet.mergeCells(1, 1, 1, colCount);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `LỊCH SỬ LƯƠNG CĂN BẢN  (${rangeLabel})`;
  titleCell.font = { bold: true, size: 14, color: { argb: COLOR.titleText } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR.titleBg },
  };
  sheet.getRow(1).height = 30;

  sheet.getRow(2).height = 6;

  /* ================= HÀNG TIÊU ĐỀ CỘT ================= */
  const headerValues = ["STT", "Tên nhân viên", ...columns.map((c) => c.label)];
  const headerRow = sheet.getRow(headerRowIdx);
  headerValues.forEach((val, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = val;
    cell.font = { bold: true, size: 11, color: { argb: COLOR.headerText } };
    cell.alignment = {
      horizontal: i < 2 ? "center" : "right",
      vertical: "middle",
      wrapText: true,
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR.headerBg },
    };
    cell.border = thinBorder;
  });
  headerRow.height = 24;

  /* ================= DỮ LIỆU ================= */
  rows.forEach((r, idx) => {
    const rowIdx = headerRowIdx + 1 + idx;
    const row = sheet.getRow(rowIdx);
    const bg = idx % 2 === 0 ? COLOR.rowEven : COLOR.rowOdd;

    const sttCell = row.getCell(1);
    sttCell.value = r.stt;
    sttCell.alignment = { horizontal: "center", vertical: "middle" };
    sttCell.font = { size: 10, color: { argb: COLOR.sttText } };

    const nameCell = row.getCell(2);
    nameCell.value = r.hoVaTen;
    nameCell.alignment = { vertical: "middle" };
    nameCell.font = { bold: true, size: 10.5, color: { argb: COLOR.nameText } };

    columns.forEach((c, ci) => {
      const cell = row.getCell(3 + ci);
      const val = r.values[c.key];
      if (val === undefined || val === null) {
        cell.value = "—";
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { size: 10, italic: true, color: { argb: COLOR.emptyText } };
      } else {
        cell.value = val;
        cell.numFmt = '#,##0 "đ"';
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.font = { size: 10, color: { argb: COLOR.numberText } };
      }
    });

    for (let c = 1; c <= colCount; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.border = thinBorder;
    }
    row.height = 20;
  });

  /* ================= HÀNG TỔNG (tổng theo từng tháng) ================= */
  if (rows.length > 0) {
    const totalRowIdx = headerRowIdx + 1 + rows.length;
    const totalRow = sheet.getRow(totalRowIdx);

    sheet.mergeCells(totalRowIdx, 1, totalRowIdx, 2);
    const labelCell = totalRow.getCell(1);
    labelCell.value = `Tổng (${rows.length} NV)`;
    labelCell.alignment = { horizontal: "center", vertical: "middle" };
    labelCell.font = { bold: true, size: 10.5, color: { argb: COLOR.totalText } };

    columns.forEach((c, ci) => {
      const cell = totalRow.getCell(3 + ci);
      const sum = rows.reduce((s, r) => s + Number(r.values[c.key] || 0), 0);
      cell.value = sum;
      cell.numFmt = '#,##0 "đ"';
      cell.alignment = { horizontal: "right", vertical: "middle" };
      cell.font = { bold: true, size: 10, color: { argb: COLOR.totalText } };
    });

    for (let c = 1; c <= colCount; c++) {
      const cell = totalRow.getCell(c);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLOR.totalBg },
      };
      cell.border = thinBorder;
    }
    totalRow.height = 22;
  }

  /* ================= ĐỘ RỘNG CỘT ================= */
  sheet.getColumn(1).width = 7;
  sheet.getColumn(2).width = 26;
  columns.forEach((_, i) => {
    sheet.getColumn(3 + i).width = 15;
  });

  /* ================= AUTO FILTER ================= */
  sheet.autoFilter = {
    from: { row: headerRowIdx, column: 1 },
    to: { row: headerRowIdx, column: colCount },
  };

  /* ================= XUẤT FILE ================= */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `LichSuLuong_${rangeLabel.replace(/[\s/]/g, "_")}.xlsx`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default exportLichSuLuongToExcel;
