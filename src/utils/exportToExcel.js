import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const LOGO_URL = 'http://localhost:8080/assets/logo.png';

const applyBorder = (cell, style = 'thin') => {
  cell.border = {
    top: { style },
    left: { style },
    bottom: { style },
    right: { style }
  };
};

export const exportHoaDonToExcel = async (hoaDon, nhaKhoaInfo) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Hóa Đơn');

  // Column widths A-K
  worksheet.columns = [
    { width: 5 },
    { width: 12 },
    { width: 14 },
    { width: 16 },
    { width: 18 },
    { width: 10 },
    { width: 6 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 16 }
  ];

  // ===== HEADER AREA =====
  worksheet.mergeCells('A1:B4');
  worksheet.mergeCells('C1:G2');
  worksheet.mergeCells('C3:G3');
  worksheet.mergeCells('C4:G4');
  worksheet.mergeCells('H1:K4');

  worksheet.getCell('C1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('C1').font = { bold: true, size: 20 };
  worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.getCell('C3').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('C3').font = { size: 11 };
  worksheet.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.getCell('C4').value = 'Hotline: 0842312828';
  worksheet.getCell('C4').font = { size: 11 };
  worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.getCell('H1').value = 'GIẤY BÁO THANH TOÁN';
  worksheet.getCell('H1').font = { bold: true, size: 18 };
  worksheet.getCell('H1').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Add logo image
  try {
    const response = await fetch(LOGO_URL);
    const arrayBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'png'
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: 4 }
    });
  } catch (error) {
    worksheet.getCell('A1').value = 'LOGO';
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  }

  // Borders for header block
  ['A1', 'B1', 'C1', 'H1'].forEach((ref) => {
    applyBorder(worksheet.getCell(ref), 'medium');
  });

  // ===== CUSTOMER & DATE =====
  worksheet.mergeCells('A5:K5');
  worksheet.mergeCells('A6:K6');
  worksheet.getCell('A5').value = `Khách hàng: ${nhaKhoaInfo?.hoVaTen || 'N/A'}`;
  worksheet.getCell('A5').font = { bold: true, size: 12 };
  worksheet.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

  const fromDate = new Date(hoaDon.ngayXuatHoaDon).toLocaleDateString('vi-VN');
  const toDate = new Date(hoaDon.ngayXuatHoaDon).toLocaleDateString('vi-VN');
  worksheet.getCell('A6').value = `Từ ngày: ${fromDate} đến ngày: ${toDate}`;
  worksheet.getCell('A6').font = { bold: true, size: 12 };
  worksheet.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

  applyBorder(worksheet.getCell('A5'), 'thin');
  applyBorder(worksheet.getCell('A6'), 'thin');

  // ===== TABLE HEADER =====
  const tableHeaderRow = 8;
  const headers = ['TT', 'NGÀY', 'BÁC SĨ', 'BỆNH NHÂN', 'LOẠI PHỤC HÌNH', 'RĂNG', 'S.L', 'ĐƠN GIÁ', 'GIẢM GIÁ', 'THANH TIỀN', 'GHI CHÚ'];
  worksheet.getRow(tableHeaderRow).values = headers;
  worksheet.getRow(tableHeaderRow).font = { bold: true, size: 11 };
  worksheet.getRow(tableHeaderRow).alignment = { horizontal: 'center', vertical: 'middle' };

  headers.forEach((_, index) => {
    const cell = worksheet.getCell(tableHeaderRow, index + 1);
    applyBorder(cell, 'medium');
  });

  // ===== TABLE DATA =====
  const buildTeethText = (viTri = []) => {
    if (!Array.isArray(viTri)) return '';
    const parts = viTri
      .map((v) => (Array.isArray(v.soRang) ? v.soRang.join(', ') : ''))
      .filter(Boolean);
    return parts.join(' | ');
  };

  const rows = [];
  hoaDon.danhSachDonHang.forEach((wrap) => {
    const donHang = wrap.donHang || {};
    const bacSi = donHang.bacSi?.hoVaTen || '';
    const benhNhan = donHang.benhNhan?.hoVaTen || '';
    const ngay = donHang.ngayNhan || hoaDon.ngayXuatHoaDon;
    const sanPhamList = donHang.danhSachSanPham || [];

    if (sanPhamList.length === 0) {
      rows.push({
        ngay,
        bacSi,
        benhNhan,
        loaiPhucHinh: '',
        rang: '',
        soLuong: '',
        donGia: '',
        giamGia: wrap.chietKhau
          ? `${wrap.chietKhau}${wrap.loaiChietKhau === 'phanTram' ? '%' : 'đ'}`
          : '',
        thanhTien: wrap.thanhTienSauCK || 0,
      });
      return;
    }

    sanPhamList.forEach((sp, spIndex) => {
      rows.push({
        ngay,
        bacSi,
        benhNhan,
        loaiPhucHinh: sp.sanPham?.tenSanPham || '',
        rang: buildTeethText(sp.viTri),
        soLuong: sp.soLuong || '',
        donGia: sp.sanPham?.donGiaChung || '',
        giamGia:
          spIndex === 0 && wrap.chietKhau
            ? `${wrap.chietKhau}${wrap.loaiChietKhau === 'phanTram' ? '%' : 'đ'}`
            : '',
        thanhTien: spIndex === 0 ? wrap.thanhTienSauCK || 0 : '',
      });
    });
  });

  let dataRowStart = tableHeaderRow + 1;
  rows.forEach((rowData, index) => {
    const rowIndex = dataRowStart + index;
    const row = worksheet.getRow(rowIndex);
    row.values = [
      index + 1,
      rowData.ngay ? new Date(rowData.ngay).toLocaleDateString('vi-VN') : '',
      rowData.bacSi,
      rowData.benhNhan,
      rowData.loaiPhucHinh,
      rowData.rang,
      rowData.soLuong,
      rowData.donGia,
      rowData.giamGia,
      rowData.thanhTien,
      ''
    ];
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    [8, 10].forEach((col) => {
      row.getCell(col).numFmt = '#,##0';
      row.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' };
    });
    row.eachCell((cell) => applyBorder(cell, 'thin'));
  });

  // ===== SUMMARY =====
  const summaryStart = dataRowStart + rows.length + 1;
  worksheet.mergeCells(`A${summaryStart}:G${summaryStart}`);
  worksheet.mergeCells(`H${summaryStart}:K${summaryStart}`);
  worksheet.mergeCells(`A${summaryStart + 1}:G${summaryStart + 1}`);
  worksheet.mergeCells(`H${summaryStart + 1}:K${summaryStart + 1}`);
  worksheet.mergeCells(`A${summaryStart + 2}:G${summaryStart + 2}`);
  worksheet.mergeCells(`H${summaryStart + 2}:K${summaryStart + 2}`);

  worksheet.getCell(`A${summaryStart}`).value = 'TỔNG CỘNG';
  worksheet.getCell(`H${summaryStart}`).value = hoaDon.tongTien || 0;
  worksheet.getCell(`A${summaryStart + 1}`).value = 'CHIẾT KHẤU';
  worksheet.getCell(`H${summaryStart + 1}`).value = hoaDon.tongChietKhau || 0;
  worksheet.getCell(`A${summaryStart + 2}`).value = 'GIÁ TRỊ THANH TOÁN';
  worksheet.getCell(`H${summaryStart + 2}`).value = hoaDon.thanhTien || 0;

  ['A', 'H'].forEach((col) => {
    worksheet.getCell(`${col}${summaryStart}`).font = { bold: true, size: 12 };
    worksheet.getCell(`${col}${summaryStart + 1}`).font = { bold: true, size: 12 };
    worksheet.getCell(`${col}${summaryStart + 2}`).font = { bold: true, size: 12 };
  });

  worksheet.getCell(`H${summaryStart}`).numFmt = '#,##0';
  worksheet.getCell(`H${summaryStart + 1}`).numFmt = '#,##0';
  worksheet.getCell(`H${summaryStart + 2}`).numFmt = '#,##0';

  [summaryStart, summaryStart + 1, summaryStart + 2].forEach((r) => {
    worksheet.getCell(`A${r}`).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(`H${r}`).alignment = { horizontal: 'right', vertical: 'middle' };
    applyBorder(worksheet.getCell(`A${r}`), 'medium');
    applyBorder(worksheet.getCell(`H${r}`), 'medium');
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const clinicNameRaw = nhaKhoaInfo?.hoVaTen || 'Nha khoa';
  const clinicNameSafe = clinicNameRaw.replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `Hoá đơn ${clinicNameSafe}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

export const exportPhieuThuToExcel = async (
  phieuThuList = [],
  { fromDate = "", toDate = "", nhaKhoaName = "Tất cả" } = {}
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Phiếu thu");

  worksheet.columns = [
    { width: 18 },
    { width: 30 },
    { width: 17 },
    { width: 18 },
    { width: 18 },
    { width: 14 },
    { width: 20 },
    { width: 28 },
    { width: 20 },
  ];

  worksheet.mergeCells("A1:C1");
  worksheet.mergeCells("A2:F2");
  worksheet.mergeCells("A3:D3");
  worksheet.mergeCells("A4:D4");

  worksheet.getCell("A1").value = "CÔNG TY TNHH TẤN DENTAL";
  worksheet.getCell("A1").font = { bold: true, size: 14 };

  worksheet.getCell("A2").value =
    "Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ";
  worksheet.getCell("A3").value = "Điện thoại: 0842 312 828";
  worksheet.getCell("A4").value = "Email: tandentallab@gmail.com";

  ["A1", "A2", "A3", "A4"].forEach((ref) => {
    worksheet.getCell(ref).alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
  });

  worksheet.getCell("A5").value = `Từ ngày: ${fromDate || ""}   Đến ngày: ${toDate || ""}`;
  worksheet.getCell("A5").font = { bold: true, size: 11 };
  worksheet.getCell("A6").value = `Nha khoa: ${nhaKhoaName || "Tất cả"}`;
  worksheet.getCell("A6").font = { bold: true, size: 11 };

  const headers = [
    "Số",
    "Khách hàng",
    "Ngày thu",
    "Số tiền thu",
    "Được khấu trừ",
    "Còn thừa",
    "Nội dung thu",
    "Phương thức thanh toán",
    "Người tạo",
  ];

  const headerRowIndex = 8;
  worksheet.getRow(headerRowIndex).values = headers;
  worksheet.getRow(headerRowIndex).font = { bold: true, size: 12 };
  worksheet.getRow(headerRowIndex).alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  headers.forEach((_, i) => {
    const cell = worksheet.getCell(headerRowIndex, i + 1);
    applyBorder(cell, "thin");
  });

  phieuThuList.forEach((pt, idx) => {
    const rowIndex = headerRowIndex + 1 + idx;
    const soPhieu = pt.soPhieuThu || (pt._id ? `TAN${pt._id.toString().slice(-8).toUpperCase()}` : "");
    const tenKhach = pt.nhaKhoaInfo?.hoVaTen || pt.nhaKhoaInfo?.tenGiaoDich || "";
    const ngayThu = pt.ngayThu
      ? new Date(pt.ngayThu).toLocaleDateString("vi-VN")
      : "";

    worksheet.getRow(rowIndex).values = [
      soPhieu,
      tenKhach,
      ngayThu,
      pt.soTienThu || 0,
      pt.duocKhauTru || 0,
      pt.conThua || 0,
      pt.noiDung || "",
      pt.phuongThucThanhToan || "",
      pt.nguoiTaoInfo?.HoTenNV || pt.nguoiTaoInfo?.hoVaTen || "",
    ];

    [4, 5, 6].forEach((col) => {
      worksheet.getCell(rowIndex, col).numFmt = "#,##0";
      worksheet.getCell(rowIndex, col).alignment = {
        horizontal: "right",
        vertical: "middle",
      };
    });

    for (let col = 1; col <= headers.length; col += 1) {
      applyBorder(worksheet.getCell(rowIndex, col), "thin");
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Danh sach phieu thu ${fromDate || ""}-${toDate || ""}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};
