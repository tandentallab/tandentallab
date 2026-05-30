import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { tinhLuong } from "../../utils/tinhLuong";

export default function InBangLuongModal({ open, onClose, salaryData, thang, nam }) {
  const [selectedId, setSelectedId] = useState("");
  const printRef = useRef(null);

  const selectedData = salaryData.find((item) => item._id === selectedId);

  const result = selectedData ? tinhLuong({
    luongCoBan: selectedData.luongCanBan || 0,
    ngayCongThang: selectedData.ngayCongThang || 28,
    soNgayCong: selectedData.soNgayCong || 0,
    com: selectedData.com || 0,
    dienThoai: selectedData.dienThoai || 0,
    thuong: selectedData.thuong || 0,
    phat: selectedData.phat || 0,
    ungTruoc: selectedData.ungTruoc || 0,
  }) : {};

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>In Phiếu Lương - ${selectedData?.hoVaTen || ''}</title>
          <style>
            body { font-family: 'Segoe UI', serif; padding: 20px; color: #000; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .bold { font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            @media print {
              .no-print { display: none; }
              @page { size: A5 portrait; margin: 10mm; }
              .col-container {
                flex-direction: column !important;
              }
              .col-item {
                margin-bottom: 12px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>In Bảng Lương Nhân Viên</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Chọn nhân viên</InputLabel>
          <Select
            value={selectedId}
            label="Chọn nhân viên"
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {salaryData.map((nv) => (
              <MenuItem key={nv._id} value={nv._id}>
                {nv.hoVaTen}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedData ? (
          <Box sx={{ p: { xs: 2, sm: 4 }, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fff", overflowX: "auto" }}>
            <div ref={printRef} style={{ minWidth: "600px", color: "#000", fontFamily: "Segoe UI, serif" }}>
              <div style={{ textAlign: "center", marginBottom: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", textTransform: "uppercase" }}>CÔNG TY TNHH TẤN DENTAL</h2>
                <p style={{ margin: "2px 0 0", fontSize: "13px" }}>Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</p>
                <h3 style={{ margin: "12px 0 4px 0", fontSize: "20px", fontWeight: "bold" }}>PHIẾU LƯƠNG NHÂN VIÊN</h3>
                <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic" }}>Tháng {thang} Năm {nam}</p>
              </div>

              <div style={{ marginBottom: "8px", fontSize: "15px" }}>
                <p style={{ margin: "0 0 8px 0" }}><strong>Họ và tên:</strong> {selectedData.hoVaTen}</p>
              </div>

              <div className="col-container" style={{ display: "flex", gap: "12px", fontSize: "14px", alignItems: "stretch" }}>
                {/* CỘT 1: Lương chính */}
                <div className="col-item" style={{ flex: 1, border: "1px solid #000", padding: "8px", borderRadius: "4px" }}>
                  <strong style={{ display: "block", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "8px", fontSize: "15px" }}>
                    I. CÔNG TÁC & LƯƠNG CHÍNH
                  </strong>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Lương cơ bản (LCB):</span>
                    <strong>{Math.round(Number(selectedData.luongCanBan || 0)).toLocaleString("vi-VN")} đ</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Ngày công quy định (NCT):</span>
                    <strong>{selectedData.ngayCongThang || 28} ngày</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", padding: "4px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
                    <span>Lương 1 ngày <span style={{ fontSize: "11px", color: "#6b7280" }}>(LCB/NCT)</span>:</span>
                    <strong style={{ color: "#1d4ed8" }}>{Math.round(result.luongNgay || 0).toLocaleString("vi-VN")} đ</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span>Số ngày làm thực tế (SNC):</span>
                    <strong>{selectedData.soNgayCong || 0} ngày</strong>
                  </div>

                  <div style={{ marginTop: "10px", borderTop: "1px dashed #ccc", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                    <span><strong>Thành tiền công</strong> <br /><span style={{ fontSize: "11px", color: "#6b7280", fontWeight: "normal" }}>(Lương ngày x SNC)</span></span>
                    <strong style={{ color: "#1d4ed8" }}>{Math.round(result.thanhTienCong || 0).toLocaleString("vi-VN")} đ</strong>
                  </div>
                </div>

                {/* CỘT 2: Phụ cấp & Khấu trừ */}
                <div className="col-item" style={{ flex: 1, border: "1px solid #000", padding: "8px", borderRadius: "4px" }}>
                  <strong style={{ display: "block", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "8px", fontSize: "15px" }}>
                    II. PHỤ CẤP & KHẤU TRỪ
                  </strong>

                  <strong style={{ color: "#15803d" }}>1. Các khoản phụ cấp (+)</strong>
                  <div style={{ paddingLeft: "10px", marginTop: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>- Cơm:</span> <span>{Math.round(Number(selectedData.com || 0)).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>- Điện thoại:</span> <span>{Math.round(Number(selectedData.dienThoai || 0)).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>- Thưởng:</span> <span>{Math.round(Number(selectedData.thuong || 0)).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderTop: "1px dashed #ccc", paddingTop: "4px" }}>
                      <strong style={{ color: "#15803d" }}>Tổng phụ cấp:</strong>
                      <strong style={{ color: "#15803d" }}>{Math.round(Number(result.tongPhuCap || 0)).toLocaleString("vi-VN")} đ</strong>
                    </div>
                  </div>

                  <strong style={{ color: "#b91c1c" }}>2. Các khoản khấu trừ (-)</strong>
                  <div style={{ paddingLeft: "10px", marginTop: "2px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>- Phạt:</span> <span>{Math.round(Number(selectedData.phat || 0)).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span>- Ứng trước:</span> <span>{Math.round(Number(selectedData.ungTruoc || 0)).toLocaleString("vi-VN")} đ</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #ccc", paddingTop: "4px" }}>
                      <strong style={{ color: "#b91c1c" }}>Tổng khấu trừ:</strong>
                      <strong style={{ color: "#b91c1c" }}>{Math.round(Number((selectedData.phat || 0) + (selectedData.ungTruoc || 0))).toLocaleString("vi-VN")} đ</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* TỔNG KẾT */}
              <div style={{ marginTop: "12px", border: "2px solid #000", padding: "10px", backgroundColor: "#eff6ff", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "6px" }}>
                <div>
                  <strong style={{ fontSize: "16px" }}>III. LƯƠNG THỰC NHẬN</strong><br />
                  <span style={{ fontSize: "12px", color: "#4b5563" }}>(Thành tiền công + Tổng phụ cấp - Tổng khấu trừ)</span>
                </div>
                <div style={{ textAlign: "right", color: "#b91c1c", fontSize: "20px", fontWeight: "bold" }}>
                  {Math.round(Number(selectedData.thucNhan || result.thucNhan || 0)).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>
          </Box>
        ) : (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            Vui lòng chọn nhân viên để xem trước bảng lương.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
        <Button onClick={onClose} color="inherit" sx={{ mr: 1 }}>Đóng</Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          disabled={!selectedData}
          onClick={handlePrint}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          In phiếu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
