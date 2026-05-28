import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogActions, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { api } from "../../config/api";

const WarrantyCardPrint = ({ open, onClose, warranty, donHang }) => {
  const [mauThe, setMauThe] = useState(null);
  const [mauTheList, setMauTheList] = useState([]);
  const [selectedMauTheId, setSelectedMauTheId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadMauTheList();
  }, [open, warranty]);

  const loadMauTheList = async () => {
    try {
      setLoading(true);
      const listRes = await api.get("/mau-the-bao-hanh");
      if (listRes.data?.success && listRes.data.data.length > 0) {
        const list = listRes.data.data;
        setMauTheList(list);

        // Ưu tiên mẫu đã gắn với phiếu, nếu không có thì chọn mẫu đầu tiên
        const attachedId = typeof warranty?.mauThe === 'object' ? warranty.mauThe?._id : warranty?.mauThe;
        const defaultId = attachedId || list[0]._id;
        setSelectedMauTheId(defaultId);

        const selected = list.find(m => m._id === defaultId) || list[0];
        setMauThe(selected);
      } else {
        setMauTheList([]);
        setMauThe(null);
      }
    } catch (error) {
      console.error("Lỗi tải mẫu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMauThe = (id) => {
    setSelectedMauTheId(id);
    const selected = mauTheList.find(m => m._id === id);
    setMauThe(selected || null);
  };

  const getFieldValue = (loaiTruong) => {
    if (!warranty && !donHang) return "---";

    switch (loaiTruong) {
      case "maThe":
        const maBaoHanh = warranty?.maBaoHanh || "";
        return maBaoHanh.replace(/^TAN/, "") || "---";

      case "nhaKhoa":
        return warranty?.nhaKhoa?.tenGiaoDich || warranty?.nhaKhoa?.hoVaTen || donHang?.nhaKhoa?.tenGiaoDich || donHang?.nhaKhoa?.hoVaTen || "---";

      case "bacSi":
        return warranty?.bacSi?.hoVaTen || donHang?.bacSi?.hoVaTen || "---";

      case "benhNhan":
        return warranty?.benhNhan?.hoVaTen || donHang?.benhNhan?.hoVaTen || "---";

      case "sanPham":
        return warranty?.danhSachBaoHanh?.[0]?.sanPham?.tenSanPham || donHang?.danhSachSanPham?.[0]?.sanPham?.tenSanPham || "---";

      case "viTriRang": {
        const viTriStr = warranty?.danhSachBaoHanh?.[0]?.viTriRang;
        if (typeof viTriStr === "string" && viTriStr !== "---" && viTriStr.trim() !== "") {
          return viTriStr;
        }
        const viTriArr = donHang?.danhSachSanPham?.[0]?.viTri || [];
        if (!Array.isArray(viTriArr) || viTriArr.length === 0) return "---";
        const parts = viTriArr
          .map((v) => {
            if (!Array.isArray(v.soRang) || v.soRang.length === 0) return "";
            if (v.kieu === "Rời") return v.soRang.join(", ");
            if (v.soRang.length === 1) return String(v.soRang[0]);
            return `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`;
          })
          .filter(Boolean);
        return parts.join("; ") || "---";
      }

      case "baoHanhTu":
        return warranty?.danhSachBaoHanh?.[0]?.baoHanhTu
          ? new Date(warranty.danhSachBaoHanh[0].baoHanhTu).toLocaleDateString("vi-VN")
          : "---";

      case "baoHanhDen":
        return warranty?.danhSachBaoHanh?.[0]?.baoHanhDen
          ? new Date(warranty.danhSachBaoHanh[0].baoHanhDen).toLocaleDateString("vi-VN")
          : "---";

      default: return "";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ style: { boxShadow: 'none', border: 'none' } }}
    >
      {/* Selector mẫu thẻ — ẩn khi in */}
      <div className="print-hidden" style={{ padding: "12px 16px 0 16px" }}>
        <TextField
          select
          size="small"
          fullWidth
          label="Chọn mẫu thẻ bảo hành"
          value={selectedMauTheId}
          onChange={(e) => handleSelectMauThe(e.target.value)}
          disabled={loading || mauTheList.length === 0}
        >
          {mauTheList.map((m) => (
            <MenuItem key={m._id} value={m._id}>{m.tenMau}</MenuItem>
          ))}
        </TextField>
      </div>

      <DialogContent id="print-content" style={{ minHeight: "300px", padding: 0 }}>
        {loading ? <CircularProgress /> : !mauThe ? <p style={{ padding: 16 }}>Không tìm thấy mẫu thẻ bảo hành.</p> : (
          /* Xóa border: "1px dashed #ccc" ở đây */
          <div style={{ position: "relative", width: "100%", height: "150mm", border: "none" }}>
            {mauThe.cacTruong?.map((field, idx) => {
              const left = Number(field.leTrai) || 0;
              const top = Number(field.leTren) || 0;

              if (field.loaiTruong === "maQR") {
                // 1. Lấy mã và loại bỏ chữ "TAN" ở đầu
                const rawCode = (warranty?.maQR || "N/A").replace(/^TAN/, "");

                // 2. Tạo đường dẫn đầy đủ
                const fullUrl = `${window.location.origin}/tra-cuu-bao-hanh/?qrcode=${rawCode}`;

                return (
                  <div key={idx} style={{ position: "absolute", left: `${left}mm`, top: `${top}mm` }}>
                    {/* 3. Truyền đường dẫn đầy đủ vào QR */}
                    <QRCodeSVG value={fullUrl} size={field.coChu ? field.coChu * 4 : 65} level="L" />
                  </div>
                );
              }

              return (
                <div key={idx} style={{
                  position: "absolute",
                  left: `${left}mm`,
                  top: `${top}mm`,
                  fontSize: `${field.coChu || 12}pt`,
                  fontWeight: field.doDam ? "bold" : "normal",
                  color: "#000",
                  whiteSpace: "nowrap"
                }}>
                  {getFieldValue(field.loaiTruong) || "..."}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
      <DialogActions className="print-hidden">
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={() => window.print()}>In</Button>
      </DialogActions>

      <style>{`
        @media print {
          .print-hidden { display: none !important; }
          @page { size: auto; margin: 0; }
          body * { visibility: hidden; }
          #print-content, #print-content * { visibility: visible; border: none !important; box-shadow: none !important; }
          #print-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </Dialog>
  );
};

export default WarrantyCardPrint;