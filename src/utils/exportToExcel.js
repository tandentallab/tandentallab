import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const LOGO_URL = window.location.origin + '/logo_tan_dental.jpg';

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

  // Khai báo lại 13 cột khớp với bảng hiển thị trên Web
  worksheet.columns = [
    { width: 5 },  // A: STT
    { width: 12 }, // B: Ngày nhận
    { width: 18 }, // C: Bác sĩ
    { width: 18 }, // D: Bệnh nhân
    { width: 22 }, // E: Sản phẩm
    { width: 14 }, // F: Loại
    { width: 16 }, // G: Vị trí răng
    { width: 6 },  // H: S.L
    { width: 12 }, // I: Đơn giá
    { width: 12 }, // J: Thành tiền
    { width: 10 }, // K: Giảm giá
    { width: 14 }, // L: Tổng cộng
    { width: 20 }, // M: Ghi chú
  ];

  // ===== HEADER AREA =====
  worksheet.mergeCells('A1:B4');
  worksheet.mergeCells('C1:I2');
  worksheet.mergeCells('C3:I3');
  worksheet.mergeCells('C4:I4');
  worksheet.mergeCells('J1:M4');

  worksheet.getCell('C1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('C1').font = { bold: true, size: 20 };
  worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.getCell('C3').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('C3').font = { size: 11 };
  worksheet.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  worksheet.getCell('C4').value = 'Hotline: 0842312828';
  worksheet.getCell('C4').font = { size: 11 };
  worksheet.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.getCell('J1').value = 'GIẤY BÁO THANH TOÁN';
  worksheet.getCell('J1').font = { bold: true, size: 18 };
  worksheet.getCell('J1').alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

  // Thêm Logo
  try {
    const response = await fetch(LOGO_URL);
    const arrayBuffer = await response.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'jpeg'
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      br: { col: 2, row: 4 }
    });
  } catch (error) {
    worksheet.getCell('A1').value = 'LOGO';
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  }

  ['A1', 'C1', 'J1'].forEach((ref) => {
    applyBorder(worksheet.getCell(ref), 'medium');
  });

  // ===== THÔNG TIN KHÁCH HÀNG & HÓA ĐƠN =====
  worksheet.mergeCells('A5:M5');
  worksheet.mergeCells('A6:M6');

  // Lấy tên nha khoa (Ưu tiên lấy thẳng từ hoaDon đã populate)
  const tenKhachHang = hoaDon.nhaKhoa?.hoVaTen || hoaDon.nhaKhoa?.tenGiaoDich || nhaKhoaInfo?.hoVaTen || '---';
  worksheet.getCell('A5').value = `Khách hàng: ${tenKhachHang}`;
  worksheet.getCell('A5').font = { bold: true, size: 12 };
  worksheet.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

  const hdDate = new Date(hoaDon.ngayXuatHoaDon || new Date()).toLocaleDateString('vi-VN');
  worksheet.getCell('A6').value = `Hóa đơn số: ${hoaDon.soHoaDon || '---'}   -   Ngày xuất: ${hdDate}`;
  worksheet.getCell('A6').font = { bold: true, size: 12 };
  worksheet.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

  applyBorder(worksheet.getCell('A5'), 'thin');
  applyBorder(worksheet.getCell('A6'), 'thin');

  // ===== TABLE HEADER =====
  const tableHeaderRow = 8;
  const headers = ['STT', 'NGÀY NHẬN', 'BÁC SĨ', 'BỆNH NHÂN', 'SẢN PHẨM', 'LOẠI', 'VỊ TRÍ RĂNG', 'S.L', 'ĐƠN GIÁ', 'THÀNH TIỀN', 'GIẢM GIÁ', 'TỔNG CỘNG', 'GHI CHÚ'];
  worksheet.getRow(tableHeaderRow).values = headers;
  worksheet.getRow(tableHeaderRow).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(tableHeaderRow).alignment = { horizontal: 'center', vertical: 'middle' };

  headers.forEach((_, index) => {
    const cell = worksheet.getCell(tableHeaderRow, index + 1);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    applyBorder(cell, 'medium');
  });

  // ===== TABLE DATA (RENDER TỪ danhSachSanPham) =====
  const buildTeethText = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "-";
    return viTriArr
      .map((v) =>
        v.kieu === "Cầu" && v.soRang?.length > 1
          ? `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
          : v.soRang?.join(", ")
      )
      .join("; ");
  };

  const rows = hoaDon.danhSachSanPham || [];
  let dataRowStart = tableHeaderRow + 1;

  rows.forEach((sp, index) => {
    const rowIndex = dataRowStart + index;
    const row = worksheet.getRow(rowIndex);

    const ngayNhan = sp.donHang?.ngayNhan ? new Date(sp.donHang.ngayNhan).toLocaleDateString('vi-VN') : '---';
    const bacSi = sp.donHang?.bacSi?.hoVaTen || '---';
    const benhNhan = sp.donHang?.benhNhan?.hoVaTen || '---';

    row.values = [
      index + 1,
      ngayNhan,
      bacSi,
      benhNhan,
      sp.tenSanPham || '---',
      sp.loaiDon || '---',
      buildTeethText(sp.viTri),
      sp.soLuong || 0,
      sp.donGia || 0,
      sp.thanhTien || 0,
      sp.giamGia || 0,
      sp.tongCongSanPham || 0,
      sp.ghiChu || ''
    ];

    row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Format center & right cho các cột số/tiền
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    row.getCell(8).alignment = { horizontal: 'center', vertical: 'middle' };
    [9, 10, 11, 12].forEach((col) => {
      row.getCell(col).numFmt = '#,##0';
      row.getCell(col).alignment = { horizontal: 'right', vertical: 'middle' };
    });

    row.eachCell((cell) => applyBorder(cell, 'thin'));
  });

  // ===== SUMMARY (KHỚP THEO BẢN CẬP NHẬT MỚI NHẤT) =====
  const summaryStart = dataRowStart + rows.length + 1;

  const tongCong = hoaDon.tongCong || 0;
  const ckAmount = hoaDon.chietKhau || 0;

  // Tính % chiết khấu để in ra chữ (làm tròn 2 chữ số)
  const ckPercent = tongCong > 0 ? Number(Number((ckAmount / tongCong) * 100).toFixed(2)) : 0;
  const sauCk = Math.max(0, tongCong - ckAmount);

  // 👇 Tách biệt: Dùng % làm tròn để hiển thị chữ, dùng % gốc (hoaDon.thue) để tính tiền
  const thuePercent = Number(Number(hoaDon.thue || 0).toFixed(2));
  const thueAmount = Math.round(sauCk * ((hoaDon.thue || 0) / 100)); // ✅ Lấy tỷ lệ gốc cực lẻ để nhân, ra tiền chẵn bóc!

  const chiPhiKhac = hoaDon.chiPhiKhac || 0;

  // Tạo danh sách các dòng summary động (ẩn Thuế và Chi phí khác nếu bằng 0 giống hệt trên web)
  const summaryItems = [
    { label: 'Tổng cộng', value: tongCong },
    { label: `Chiết khấu                ${ckPercent} % =`, value: ckAmount },
  ];

  if (thuePercent > 0) {
    summaryItems.push({ label: `Thuế                     ${thuePercent} % =`, value: thueAmount });
  }

  if (chiPhiKhac > 0) {
    summaryItems.push({ label: 'Chi phí khác', value: chiPhiKhac });
  }

  summaryItems.push(
    { label: 'Giá trị thanh toán', value: hoaDon.giaTriThanhToan || 0 },
    { label: 'Đã thanh toán', value: hoaDon.daThanhToan || 0 },
    { label: 'Còn nợ', value: hoaDon.conLai || 0 }
  );

  summaryItems.forEach((item, i) => {
    const r = summaryStart + i;
    worksheet.mergeCells(`A${r}:J${r}`); // Cột Label (từ A đến J)
    worksheet.mergeCells(`K${r}:M${r}`); // Cột Value (từ K đến M)

    const labelCell = worksheet.getCell(`A${r}`);
    const valueCell = worksheet.getCell(`K${r}`);

    labelCell.value = item.label;
    valueCell.value = item.value;

    // In đậm các dòng quan trọng như trên Web
    if (['Tổng cộng', 'Giá trị thanh toán', 'Đã thanh toán', 'Còn nợ'].includes(item.label)) {
      labelCell.font = { bold: true, size: 12 };
      valueCell.font = { bold: true, size: 12 };
    } else {
      labelCell.font = { size: 11, color: { argb: 'FF333333' } };
      valueCell.font = { size: 11 };
    }

    valueCell.numFmt = '#,##0';
    labelCell.alignment = { horizontal: 'right', vertical: 'middle' };
    valueCell.alignment = { horizontal: 'right', vertical: 'middle' };

    // Format viền dưới nhạt giống Web
    if (item.label.includes('Chiết khấu') || item.label.includes('Thuế') || item.label.includes('Chi phí khác')) {
      labelCell.border = { bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } } };
      valueCell.border = { bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } } };
    } else {
      applyBorder(labelCell, 'thin');
      applyBorder(valueCell, 'thin');
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const safeClinicName = tenKhachHang.replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `Hoa_don_${hoaDon.soHoaDon || 'TAN'}_${safeClinicName}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};
// ==========================================
// CÁC HÀM XUẤT EXCEL KHÁC GIỮ NGUYÊN BÊN DƯỚI
// ==========================================

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

  const headerRow = 6;
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
    const so = hd.soHoaDon || (hd._id ? `TAN${hd._id.toString().slice(-8).toUpperCase()}` : '');
    const nk = hd.nhaKhoa || {};
    worksheet.getRow(rowIndex).values = [
      hd.ngayXuatHoaDon ? new Date(hd.ngayXuatHoaDon).toLocaleDateString('vi-VN') : '',
      so,
      nk.hoVaTen || nk.tenGiaoDich || '',
      hd.tongCong || 0,
      hd.chietKhau || 0,
      hd.giaTriThanhToan || 0,
      hd.daThanhToan || 0,
      hd.conLai || 0,
      hd.chiPhiKhac || 0,
      hd.trangThai || '',
      hd.ghiChuChoKhachHang || '',
      computeDueDate(hd),
    ];

    [4, 5, 6, 7, 8].forEach((col) => {
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
    { width: 18 }, // A: Nhận lúc
    { width: 16 }, // B: Số
    { width: 24 }, // C: Khách hàng
    { width: 18 }, // D: Bác sĩ
    { width: 32 }, // E: Bệnh nhân
    { width: 12 }, // F: Loại
    { width: 32 }, // G: Sản phẩm
    { width: 6 }, // H: S.L
    { width: 20 }, // I: Vị trí răng
    { width: 14 }, // J: Trạng thái
    { width: 18 }, // K: Hẹn giao
  ];

  worksheet.mergeCells("A1:D1");
  worksheet.mergeCells("A2:H2");
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
    "Nhận lúc",
    "Số",
    "Khách hàng",
    "Bác sĩ",
    "Bệnh nhân",
    "Loại",
    "Sản phẩm",
    "S.L",
    "Vị trí răng",
    "Trạng thái",
    "Hẹn giao",
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

  const loaiDonPrefix = {
    "Hàng sửa": "Sửa",
    "Hàng làm lại": "Làm lại",
    "Hàng bảo hành": "Bảo hành",
  };

  const renderViTri = (viTri) => {
    if (!Array.isArray(viTri) || viTri.length === 0) return "";
    return viTri
      .map((vt) => {
        const soRang = vt.soRang || [];
        if (soRang.length === 0) return "";
        if (vt.kieu === "Cầu" && soRang.length >= 2) {
          const min = Math.min(...soRang);
          const max = Math.max(...soRang);
          return `R${min}->${max}`;
        }
        return soRang.map((r) => `R${r}`).join(" ");
      })
      .filter(Boolean)
      .join(" ");
  };

  const formatDT = (value) =>
    value
      ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      : "";

  let currentRowIndex = headerRow + 1;

  donHangList.forEach((dh, idx) => {
    const so =
      dh?.maDonHang ||
      (dh?._id ? `TAN${dh._id.toString().slice(-8).toUpperCase()}` : "");
    const dssp = dh?.danhSachSanPham || [];

    if (dssp.length === 0) {
      const rowValues = [
        formatDT(dh?.ngayNhan),
        so,
        dh?.nhaKhoa?.tenGiaoDich || dh?.nhaKhoa?.hoVaTen || "",
        dh?.bacSi?.hoVaTen || "",
        dh?.benhNhan?.hoVaTen || "",
        "",
        "",
        "",
        "",
        dh?.trangThai || "",
        formatDT(dh?.henGiao),
      ];
      worksheet.getRow(currentRowIndex).values = rowValues;

      const row = worksheet.getRow(currentRowIndex);
      row.alignment = { vertical: "middle", horizontal: "left" };
      row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
      row.height = 20;

      for (let col = 1; col <= headers.length; col += 1) {
        applyBorder(worksheet.getCell(currentRowIndex, col), "thin");
      }

      currentRowIndex += 1;
    } else {
      dssp.forEach((sp) => {
        const qtyRaw = sp?.soLuong !== undefined && sp?.soLuong !== null ? Number(sp.soLuong) : 1;
        const qty = isNaN(qtyRaw) ? 1 : qtyRaw;

        const rowValues = [
          formatDT(dh?.ngayNhan),
          so,
          dh?.nhaKhoa?.tenGiaoDich || dh?.nhaKhoa?.hoVaTen || "",
          dh?.bacSi?.hoVaTen || "",
          dh?.benhNhan?.hoVaTen || "",
          loaiDonPrefix[sp.loaiDon] || "Mới",
          sp?.sanPham?.tenSanPham || "",
          qty, // Lưu giá trị số lượng dưới dạng kiểu Number của Excel
          renderViTri(sp.viTri),
          dh?.trangThai || "",
          formatDT(dh?.henGiao),
        ];
        worksheet.getRow(currentRowIndex).values = rowValues;

        const row = worksheet.getRow(currentRowIndex);
        row.alignment = { vertical: "middle", horizontal: "left" };
        row.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
        row.height = 20;

        for (let col = 1; col <= headers.length; col += 1) {
          applyBorder(worksheet.getCell(currentRowIndex, col), "thin");
        }

        currentRowIndex += 1;
      });
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Danh sach don hang ${pickRangeLabel() || ""}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

export const exportBangLuongToExcel = async (salaryData, thang, nam) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bảng Lương');

  // Column widths
  worksheet.columns = [
    { width: 6 },   // A: STT
    { width: 20 },  // B: TÊN NHÂN VIÊN
    { width: 15 },  // C: LƯƠNG CẦN BẢN
    { width: 14 },  // D: LƯƠNG / 28 CÔNG
    { width: 13 },  // E: SỐ NGÀY CÔNG
    { width: 16 },  // F: THÀNH TIỀN CÔNG
    { width: 12 },  // G: CƠM
    { width: 12 },  // H: ĐIỆN THOẠI
    { width: 12 },  // I: THƯỞNG
    { width: 12 },  // J: ỨNG TRƯỚC
    { width: 16 },  // K: THÀNH TIỀN
  ];

  // Row 1: Title (merged A1:K1)
  worksheet.mergeCells('A1:K1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `BẢNG LƯƠNG THÁNG ${thang} - ${nam}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 24;

  // Row 2: Summary totals
  worksheet.getRow(2).height = 18;

  // Calculate totals for row 2
  let totalLuongCanBan = 0;
  let totalCom = 0;
  let totalUngTruoc = 0;
  let totalThucNhan = 0;

  salaryData.forEach((item) => {
    totalLuongCanBan += Number(item.luongCanBan || 0);
    totalCom += Number(item.com || 0);
    totalUngTruoc += Number(item.ungTruoc || 0);
    totalThucNhan += Number(item.thucNhan || 0);
  });

  // Set row 2 values
  worksheet.getCell('C2').value = totalLuongCanBan;
  worksheet.getCell('G2').value = totalCom;
  worksheet.getCell('J2').value = totalUngTruoc;
  worksheet.getCell('K2').value = totalThucNhan;

  // Format row 2 cells
  [
    { col: 3, cell: 'C2' },
    { col: 7, cell: 'G2' },
    { col: 10, cell: 'J2' },
    { col: 11, cell: 'K2' },
  ].forEach(({ col, cell }) => {
    const cellObj = worksheet.getCell(cell);
    cellObj.numFmt = '#,##0';
    cellObj.alignment = { horizontal: 'right', vertical: 'middle' };
    cellObj.font = { bold: true };
    applyBorder(cellObj);
  });

  // Row 3-4: Headers (with merge for multi-line headers)
  worksheet.mergeCells('A3:A4');
  worksheet.mergeCells('B3:B4');
  worksheet.mergeCells('C3:C4');
  worksheet.mergeCells('D3:D4');
  worksheet.mergeCells('E3:E4');
  worksheet.mergeCells('F3:F4');
  worksheet.mergeCells('G3:I3'); // Merge PHỤ CẤP
  worksheet.mergeCells('J3:J4');
  worksheet.mergeCells('K3:K4');

  // Row 3: First level headers
  const row3Headers = [
    'STT',
    'TÊN NHÂN VIÊN',
    'LƯƠNG CẦN BẢN',
    'LƯƠNG / 28 CÔNG',
    'SỐ NGÀY CÔNG',
    'THÀNH TIỀN CÔNG',
    'PHỤ CẤP',           // G3: Merged with H3, I3
    null,                // H3
    null,                // I3
    'ỨNG TRƯỚC',
    'THÀNH TIỀN',
  ];

  row3Headers.forEach((header, idx) => {
    if (header === null) return; // Skip merged cells
    const cell = worksheet.getCell(3, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell);
  });

  // Row 4: Second level headers
  const row4Headers = [
    'STT',
    'TÊN NHÂN VIÊN',
    'LƯƠNG CẦN BẢN',
    'LƯƠNG / 28 CÔNG',
    'SỐ NGÀY CÔNG',
    'THÀNH TIỀN CÔNG',
    'CƠM',
    'ĐIỆN THOẠI',
    'THƯỞNG',
    'ỨNG TRƯỚC',
    'THÀNH TIỀN',
  ];

  row4Headers.forEach((header, idx) => {
    const cell = worksheet.getCell(4, idx + 1);
    cell.value = header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1976D2' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell);
  });

  worksheet.getRow(3).height = 24;
  worksheet.getRow(4).height = 24;

  // Data rows starting from row 5
  salaryData.forEach((item, idx) => {
    const rowIdx = 5 + idx;
    const row = worksheet.getRow(rowIdx);

    const luongCanBan = Number(item.luongCanBan || 0);
    const soNgayCong = Number(item.soNgayCong || 0);
    const luongMoiNgay = luongCanBan / 28;
    const thanhTienCong = luongMoiNgay * soNgayCong;
    const com = Number(item.com || 0);
    const dienThoai = Number(item.dienThoai || 0);
    const thuong = Number(item.thuong || 0);
    const ungTruoc = Number(item.ungTruoc || 0);
    const thucNhan = Number(item.thucNhan || 0);

    row.values = [
      idx + 1,                           // STT
      item.hoVaTen || '',                // TÊN NHÂN VIÊN
      luongCanBan,                       // LƯƠNG CẦN BẢN
      luongMoiNgay,                      // LƯƠNG / 28 CÔNG
      soNgayCong,                        // SỐ NGÀY CÔNG
      thanhTienCong,                     // THÀNH TIỀN CÔNG
      com,                               // CƠM
      dienThoai,                         // ĐIỆN THOẠI
      thuong,                            // THƯỞNG
      ungTruoc,                          // ỨNG TRƯỚC
      thucNhan,                          // THÀNH TIỀN
    ];

    // Format currency columns
    for (let col = 3; col <= 11; col++) {
      const cell = worksheet.getCell(rowIdx, col);
      cell.numFmt = '#,##0';
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      applyBorder(cell);
    }

    // Format text columns
    worksheet.getCell(rowIdx, 1).alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell(rowIdx, 2).alignment = { horizontal: 'left', vertical: 'middle' };
    applyBorder(worksheet.getCell(rowIdx, 1));
    applyBorder(worksheet.getCell(rowIdx, 2));

    row.height = 20;
  });

  // Freeze panes at row 5 (freeze rows 1-4)
  worksheet.views = [
    { state: 'frozen', ySplit: 4, xSplit: 0 }
  ];

  // Save file
  const buffer = await workbook.xlsx.writeBuffer();
  const fileName = `Bang_luong_thang_${thang}_${nam}.xlsx`;
  saveAs(new Blob([buffer]), fileName);
};

export const exportBangGiaRiengToExcel = async (nhaKhoaInfo, bangGiaData = []) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bảng Giá Riêng');

  worksheet.columns = [
    { width: 10 },
    { width: 45 },
    { width: 25 },
  ];

  // ===== PHẦN ĐẦU =====
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 16 };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('A2').font = { size: 11 };

  worksheet.mergeCells('A3:C3');
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A3').font = { size: 11 };

  worksheet.mergeCells('A4:C4');
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';
  worksheet.getCell('A4').font = { size: 11 };

  ['A1', 'A2', 'A3', 'A4'].forEach((ref) => {
    worksheet.getCell(ref).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // ===== TIÊU ĐỀ & TÊN NHA KHOA =====
  worksheet.mergeCells('A6:C6');
  worksheet.getCell('A6').value = 'BẢNG GIÁ RIÊNG';
  worksheet.getCell('A6').font = { bold: true, size: 16 };
  worksheet.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.mergeCells('A7:C7');
  const tenNhaKhoa = nhaKhoaInfo?.hoVaTen || nhaKhoaInfo?.tenGiaoDich || 'Chưa xác định';
  worksheet.getCell('A7').value = `Nha khoa: ${tenNhaKhoa}`;
  worksheet.getCell('A7').font = { bold: true, size: 12, italic: true };
  worksheet.getCell('A7').alignment = { horizontal: 'left', vertical: 'middle' };

  // ===== TABLE HEADER =====
  const headerRow = 8;
  const headers = ['STT', 'TÊN SẢN PHẨM', 'GIÁ RIÊNG'];
  worksheet.getRow(headerRow).values = headers;
  worksheet.getRow(headerRow).font = { bold: true, size: 12 };
  worksheet.getRow(headerRow).alignment = { horizontal: 'center', vertical: 'middle' };

  headers.forEach((_, idx) => {
    applyBorder(worksheet.getCell(headerRow, idx + 1), 'medium');
  });

  // ===== TABLE DATA =====
  bangGiaData.forEach((item, idx) => {
    const rowIndex = headerRow + 1 + idx;

    // MAPPING ĐÚNG VỚI BACKEND (tenSanPham, donGia)
    const tenSp = item.tenSanPham || '---';
    const giaRieng = item.donGia || 0;

    worksheet.getRow(rowIndex).values = [
      idx + 1,
      tenSp,
      giaRieng
    ];

    const sttCell = worksheet.getCell(rowIndex, 1);
    sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    applyBorder(sttCell, 'thin');

    const tenSpCell = worksheet.getCell(rowIndex, 2);
    tenSpCell.alignment = { horizontal: 'left', vertical: 'middle' };
    applyBorder(tenSpCell, 'thin');

    const giaCell = worksheet.getCell(rowIndex, 3);
    giaCell.numFmt = '#,##0'; // Format tiền tệ có dấu phẩy
    giaCell.alignment = { horizontal: 'right', vertical: 'middle' };
    applyBorder(giaCell, 'thin');
  });

  // ===== XUẤT FILE =====
  const buffer = await workbook.xlsx.writeBuffer();
  const safeClinicName = tenNhaKhoa.replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `Bang_Gia_Rieng_${safeClinicName}.xlsx`;

  saveAs(new Blob([buffer]), fileName);
};

export const exportKeHoachGiaoHangToExcel = async (filteredOrders, formatDanhSachSanPham) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Kế Hoạch Giao Hàng');

  // ===== PHẦN ĐẦU =====
  worksheet.mergeCells('A1:C1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 16, name: 'Arial' };

  worksheet.mergeCells('A2:C2');
  worksheet.getCell('A2').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('A2').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A3:C3');
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A3').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A4:C4');
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';
  worksheet.getCell('A4').font = { size: 11, name: 'Arial' };

  ['A1', 'A2', 'A3', 'A4'].forEach((ref) => {
    worksheet.getCell(ref).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  // Thêm tiêu đề
  worksheet.mergeCells('A6:G6');
  const titleCell = worksheet.getCell('A6');
  titleCell.value = 'KẾ HOẠCH GIAO HÀNG';
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Dòng trống 7
  worksheet.addRow([]);

  // Thêm header
  const headerRow = worksheet.addRow(['Nhận lúc', 'Số', 'Khách hàng', 'Bệnh nhân', 'Răng', 'Hẹn giao', 'Ghi chú']);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 12, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell, 'thin');
  });

  // Cấu hình chiều rộng cột
  worksheet.columns = [
    { width: 18 }, // Nhận lúc
    { width: 15 }, // Số
    { width: 25 }, // Khách hàng
    { width: 20 }, // Bệnh nhân
    { width: 40 }, // Răng
    { width: 18 }, // Hẹn giao
    { width: 30 }  // Ghi chú
  ];

  // Thêm dữ liệu
  filteredOrders.forEach((order) => {
    const maDon = order.maDonHang || `TAN${order._id.substring(order._id.length - 8).toUpperCase()}`;
    const formatDateCustom = (dateStr) => {
      if (!dateStr) return "—";
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "—";
      const pad = (num) => String(num).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${pad(d.getFullYear())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const nhanLuc = formatDateCustom(order.ngayNhan);
    const henGiao = formatDateCustom(order.henGiao);

    const row = worksheet.addRow([
      nhanLuc,
      maDon,
      order.nhaKhoa?.hoVaTen || "",
      order.benhNhan?.hoVaTen || "",
      formatDanhSachSanPham(order.danhSachSanPham),
      henGiao,
      order.ghiChuChung || ""
    ]);

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 11 };
      cell.alignment = {
        horizontal: colNumber === 1 || colNumber === 2 || colNumber === 6 ? 'center' : 'left',
        vertical: 'middle',
        wrapText: true
      };
      applyBorder(cell, 'thin');
    });
  });

  // Xuất file
  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = toFileDateSafe(new Date());
  saveAs(new Blob([buffer]), `KeHoach_GiaoHang_${dateStr}.xlsx`);
};

export const exportDanhSachNhaKhoaToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh Sách Nha Khoa');

  worksheet.mergeCells('A1:G1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 16, name: 'Arial' };

  worksheet.mergeCells('A2:G2');
  worksheet.getCell('A2').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('A2').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A3:G3');
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A3').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A4:G4');
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';
  worksheet.getCell('A4').font = { size: 11, name: 'Arial' };

  ['A1', 'A2', 'A3', 'A4'].forEach((ref) => {
    worksheet.getCell(ref).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  worksheet.mergeCells('A6:G6');
  const titleCell = worksheet.getCell('A6');
  titleCell.value = 'DANH SÁCH NHA KHOA';
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Tên', 'Liên hệ', 'Địa chỉ', 'Website', 'Mô tả', 'Ngày tạo']);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 12, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell, 'thin');
  });

  worksheet.columns = [
    { width: 35 }, // Tên
    { width: 25 }, // Liên hệ
    { width: 45 }, // Địa chỉ
    { width: 25 }, // Website
    { width: 35 }, // Mô tả
    { width: 15 }  // Ngày tạo
  ];

  data.forEach((item) => {
    const lienHeFull = [item.soDienThoai, item.email].filter(Boolean).join("\n");
    const diaChiFull = [item.diaChiCuThe, item.tinh, item.quocGia].filter(Boolean).join(", ");
    const row = worksheet.addRow([
      item.hoVaTen || item.tenGiaoDich || "",
      lienHeFull || "",
      diaChiFull || "",
      item.website || "",
      item.moTa || "",
      item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ""
    ]);

    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      applyBorder(cell, 'thin');
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = toFileDateSafe(new Date());
  saveAs(new Blob([buffer]), `DanhSach_NhaKhoa_${dateStr}.xlsx`);
};

export const exportDanhSachNguoiLienHeToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh Sách Người Liên Hệ');

  worksheet.mergeCells('A1:E1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 16, name: 'Arial' };

  worksheet.mergeCells('A2:E2');
  worksheet.getCell('A2').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('A2').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A3:E3');
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A3').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A4:E4');
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';
  worksheet.getCell('A4').font = { size: 11, name: 'Arial' };

  ['A1', 'A2', 'A3', 'A4'].forEach((ref) => {
    worksheet.getCell(ref).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  worksheet.mergeCells('A6:E6');
  const titleCell = worksheet.getCell('A6');
  titleCell.value = 'DANH SÁCH NGƯỜI LIÊN HỆ';
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Họ tên', 'Email', 'SĐT', 'Nha khoa', 'Mô tả']);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 12, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell, 'thin');
  });

  worksheet.columns = [
    { width: 25 }, // Họ tên
    { width: 25 }, // Email
    { width: 15 }, // SĐT
    { width: 30 }, // Nha khoa
    { width: 35 }  // Mô tả
  ];

  data.forEach((item) => {
    const row = worksheet.addRow([
      item.hoVaTen || "",
      item.email || "",
      item.soDienThoai || "",
      item.nhaKhoa?.hoVaTen || "",
      item.moTa || ""
    ]);

    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      applyBorder(cell, 'thin');
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = toFileDateSafe(new Date());
  saveAs(new Blob([buffer]), `DanhSach_NguoiLienHe_${dateStr}.xlsx`);
};

export const exportDanhSachBenhNhanToExcel = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh Sách Bệnh Nhân');

  worksheet.mergeCells('A1:D1');
  worksheet.getCell('A1').value = 'CÔNG TY TNHH TẤN DENTAL';
  worksheet.getCell('A1').font = { bold: true, size: 16, name: 'Arial' };

  worksheet.mergeCells('A2:D2');
  worksheet.getCell('A2').value = 'Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ';
  worksheet.getCell('A2').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A3:D3');
  worksheet.getCell('A3').value = 'Điện thoại: 0842 312 828';
  worksheet.getCell('A3').font = { size: 11, name: 'Arial' };

  worksheet.mergeCells('A4:D4');
  worksheet.getCell('A4').value = 'Email: tandentallab@gmail.com';
  worksheet.getCell('A4').font = { size: 11, name: 'Arial' };

  ['A1', 'A2', 'A3', 'A4'].forEach((ref) => {
    worksheet.getCell(ref).alignment = { horizontal: 'left', vertical: 'middle' };
  });

  worksheet.mergeCells('A6:D6');
  const titleCell = worksheet.getCell('A6');
  titleCell.value = 'DANH SÁCH BỆNH NHÂN';
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  worksheet.addRow([]);

  const headerRow = worksheet.addRow(['Tên', 'Số hồ sơ', 'Giới tính', 'Nha khoa']);
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 12, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    applyBorder(cell, 'thin');
  });

  worksheet.columns = [
    { width: 25 }, // Tên
    { width: 15 }, // Số hồ sơ
    { width: 12 }, // Giới tính
    { width: 35 }  // Nha khoa
  ];

  data.forEach((item) => {
    const row = worksheet.addRow([
      item.hoVaTen || "",
      item.soHoSo || "",
      item.gioiTinh || "",
      item.nhaKhoa?.hoVaTen || ""
    ]);

    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 11 };
      cell.alignment = { vertical: 'middle', wrapText: true };
      applyBorder(cell, 'thin');
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = toFileDateSafe(new Date());
  saveAs(new Blob([buffer]), `DanhSach_BenhNhan_${dateStr}.xlsx`);
};
