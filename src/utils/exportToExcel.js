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

const formatDateSafe = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
};

const toFileDateSafe = (value) => formatDateSafe(value).replaceAll('/', '-');

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

  const fromDateLabel = formatDateSafe(fromDate);
  const toDateLabel = formatDateSafe(toDate);

  worksheet.getCell("A5").value = `Từ ngày: ${fromDateLabel || ""}   Đến ngày: ${toDateLabel || ""}`;
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
  const fileName = `Danh sach phieu thu ${toFileDateSafe(fromDate) || ""}-${toFileDateSafe(toDate) || ""}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

export const exportHoaDonListToExcel = async (
  hoaDonList = [],
  { fromDate = "", toDate = "", nhaKhoaName = "Tất cả" } = {}
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách Hóa Đơn');

  worksheet.columns = [
    { width: 12 }, // Ngày xuất
    { width: 18 }, // Số
    { width: 24 }, // Nha khoa
    { width: 14 }, // Tổng cộng
    { width: 12 }, // Giảm giá
    { width: 16 }, // Giá trị thanh toán
    { width: 14 }, // Đã thanh toán
    { width: 14 }, // Còn lại
    { width: 14 }, // Chi phí khác
    { width: 16 }, // Trạng thái
    { width: 28 }, // Ghi chú cho khách hàng
    { width: 14 }, // Ngày đến hạn
  ];

  // Header
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 14 };
  worksheet.getCell('A2').value = `Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ`;
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';

  const fromDateLabel = formatDateSafe(fromDate);
  const toDateLabel = formatDateSafe(toDate);

  worksheet.getCell('A6').value = `Từ ngày: ${fromDateLabel || ''}   Đến ngày: ${toDateLabel || ''}`;
  worksheet.getCell('A7').value = `Nha khoa: ${nhaKhoaName || 'Tất cả'}`;

  const headerRow = 9;
  const headers = [
    'Ngày xuất',
    'Số',
    'Nha khoa',
    'Tổng cộng',
    'Giảm giá',
    'Giá trị thanh toán',
    'Đã thanh toán',
    'Còn lại',
    'Chi phí khác',
    'Trạng thái',
    'Ghi chú cho khách hàng',
    'Ngày đến hạn',
  ];

  worksheet.getRow(headerRow).values = headers;
  worksheet.getRow(headerRow).font = { bold: true };

  const computeDueDate = (hoaDon) => {
    if (!hoaDon || !hoaDon.ngayXuatHoaDon) return '';
    const d = new Date(hoaDon.ngayXuatHoaDon);
    const policy = hoaDon.chinhSachThanhToan || '';
    if (policy.includes('7')) { d.setDate(d.getDate() + 7); }
    else if (policy.includes('10')) { d.setDate(d.getDate() + 10); }
    else if (policy.includes('30')) { d.setDate(d.getDate() + 30); }
    else if (policy.includes('60')) { d.setDate(d.getDate() + 60); }
    else if (policy.includes('90')) { d.setDate(d.getDate() + 90); }
    else if (policy.includes('cuối tháng')) {
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return last.toLocaleDateString('vi-VN');
    } else {
      return new Date(hoaDon.ngayXuatHoaDon).toLocaleDateString('vi-VN');
    }
    return d.toLocaleDateString('vi-VN');
  };

  hoaDonList.forEach((hd, idx) => {
    const rowIndex = headerRow + 1 + idx;
    const so = hd._id ? `TAN${hd._id.toString().slice(-8).toUpperCase()}` : '';
    const nk = hd.nhaKhoa || {};
    worksheet.getRow(rowIndex).values = [
      hd.ngayXuatHoaDon ? new Date(hd.ngayXuatHoaDon).toLocaleDateString('vi-VN') : '',
      so,
      nk.hoVaTen || nk.tenGiaoDich || '',
      hd.tongTien || 0,
      hd.tongChietKhau || 0,
      hd.thanhTien || 0,
      hd.daThanhToan || 0,
      hd.conLai || 0,
      hd.chiPhiKhac || 0,
      hd.trangThai || '',
      hd.ghiChuChoKhachHang || '',
      computeDueDate(hd),
    ];

    [4,5,6,7,8].forEach((col) => {
      worksheet.getCell(rowIndex, col).numFmt = '#,##0';
      worksheet.getCell(rowIndex, col).alignment = { horizontal: 'right' };
    });
    for (let c = 1; c <= headers.length; c++) applyBorder(worksheet.getCell(rowIndex, c), 'thin');
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Danh sach hoa don ${toFileDateSafe(fromDate) || ''}-${toFileDateSafe(toDate) || ''}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

export const exportDonHangListToExcel = async (
  donHangList = [],
  {
    ngayNhanFrom = "",
    ngayNhanTo = "",
    yeuCauGiaoFrom = "",
    yeuCauGiaoTo = "",
    daHoanThanhFrom = "",
    daHoanThanhTo = "",
    nhaKhoaName = "Tất cả",
    benhNhanName = "Tất cả",
  } = {}
) => {
  const pickRangeLabel = () => {
    const ranges = [
      { from: ngayNhanFrom, to: ngayNhanTo },
      { from: yeuCauGiaoFrom, to: yeuCauGiaoTo },
      { from: daHoanThanhFrom, to: daHoanThanhTo },
    ];

    const active = ranges.find((range) => range.from || range.to);
    if (!active) return "";

    const from = formatDateSafe(active.from);
    const to = formatDateSafe(active.to);
    if (from && to) return `${from}-${to}`;
    return from || to;
  };

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Danh sách đơn hàng");

  worksheet.columns = [
    { width: 16 },
    { width: 20 },
    { width: 24 },
    { width: 16 },
    { width: 22 },
    { width: 48 },
    { width: 20 },
    { width: 12 },
    { width: 18 },
    { width: 18 },
  ];

  worksheet.mergeCells("A1:D1");
  worksheet.mergeCells("A2:F2");
  worksheet.mergeCells("A3:D3");
  worksheet.mergeCells("A4:D4");

  worksheet.getCell("A1").value = "CÔNG TY TNHH TẤN DENTAL";
  worksheet.getCell("A1").font = { bold: true, size: 16 };

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

  worksheet.getCell("A5").value = `Ngày nhận: ${formatDateSafe(ngayNhanFrom)} - ${formatDateSafe(ngayNhanTo)}`;
  worksheet.getCell("A6").value = `Ngày yêu cầu giao: ${formatDateSafe(yeuCauGiaoFrom)} - ${formatDateSafe(yeuCauGiaoTo)}`;
  worksheet.getCell("A8").value = `Ngày hoàn thành: ${formatDateSafe(daHoanThanhFrom)} - ${formatDateSafe(daHoanThanhTo)}`;
  worksheet.getCell("A7").value = `Nha khoa: ${nhaKhoaName || "Tất cả"}`;
  worksheet.getCell("E7").value = `Bệnh nhân: ${benhNhanName || "Tất cả"}`;
  worksheet.getCell("A5").font = { bold: true, size: 11 };
  worksheet.getCell("A6").font = { bold: true, size: 11 };
  worksheet.getCell("A7").font = { bold: true, size: 11 };
  worksheet.getCell("E7").font = { bold: true, size: 11 };
  worksheet.getCell("A8").font = { bold: true, size: 11 };

  const headerRow = 10;
  const headers = [
    "Số",
    "Nhận lúc",
    "Nha khoa",
    "Bác sĩ",
    "Bệnh nhân",
    "Răng",
    "Hẹn giao",
    "Tiến độ",
    "Tiến độ sản xuất",
    "Loại đơn hàng",
  ];

  worksheet.getRow(headerRow).values = headers;
  worksheet.getRow(headerRow).font = { bold: true, size: 12 };
  worksheet.getRow(headerRow).alignment = {
    horizontal: "left",
    vertical: "middle",
  };

  headers.forEach((_, i) => {
    applyBorder(worksheet.getCell(headerRow, i + 1), "thin");
  });

  const buildTeethSummary = (danhSachSanPham = []) => {
    if (!Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0) return "";

    return danhSachSanPham
      .map((sp) => {
        const tenSp = sp?.sanPham?.tenSanPham || "SP";
        const soLuong = sp?.soLuong || 0;
        const rangText = (sp?.viTri || [])
          .map((vt) => (Array.isArray(vt?.soRang) ? vt.soRang.join(", ") : ""))
          .filter(Boolean)
          .join("; ");

        return `${soLuong} ${tenSp}${rangText ? ` ${rangText}` : ""}`;
      })
      .join(" | ");
  };

  const getProgress = (status = "") => {
    if (status === "Đang sản xuất") return 50;
    if (status === "Hoàn thành" || status === "Đã giao") return 100;
    return 0;
  };

  donHangList.forEach((dh, idx) => {
    const rowIndex = headerRow + 1 + idx;
    const so = dh?._id ? `TAN${dh._id.toString().slice(-8).toUpperCase()}` : "";
    const loaiDonHang = Array.from(
      new Set((dh?.danhSachSanPham || []).map((sp) => sp?.loaiDon).filter(Boolean))
    ).join(", ");

    worksheet.getRow(rowIndex).values = [
      so,
      dh?.ngayNhan
        ? new Date(dh.ngayNhan).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      dh?.nhaKhoa?.tenGiaoDich || dh?.nhaKhoa?.hoVaTen || "",
      dh?.bacSi?.hoVaTen || "",
      dh?.benhNhan?.hoVaTen || "",
      buildTeethSummary(dh?.danhSachSanPham),
      dh?.henGiao
        ? new Date(dh.henGiao).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      getProgress(dh?.trangThai),
      dh?.trangThai || "",
      loaiDonHang,
    ];

    worksheet.getCell(rowIndex, 8).alignment = {
      horizontal: "right",
      vertical: "middle",
    };

    for (let col = 1; col <= headers.length; col += 1) {
      applyBorder(worksheet.getCell(rowIndex, col), "thin");
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Danh sach don hang ${pickRangeLabel() || ""}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};
