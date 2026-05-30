import React, { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogActions, Button, CircularProgress, MenuItem, TextField } from "@mui/material";
import { api } from "../../config/api";

const WarrantyCardPrint = ({ open, onClose, warranty, donHang, initialMauTheId }) => {
  const [mauThe, setMauThe] = useState(null);
  const [mauTheList, setMauTheList] = useState([]);
  const [selectedMauTheId, setSelectedMauTheId] = useState("");
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (open) loadMauTheList();
  }, [open, warranty, initialMauTheId]);

  const loadMauTheList = async () => {
    try {
      setLoading(true);
      const listRes = await api.get("/mau-the-bao-hanh");
      if (listRes.data?.success && listRes.data.data.length > 0) {
        const list = listRes.data.data;
        setMauTheList(list);

        // Ưu tiên: initialMauTheId (truyền từ ngoài) → mẫu gắn với phiếu → mẫu đầu tiên
        const attachedId = typeof warranty?.mauThe === 'object' ? warranty.mauThe?._id : warranty?.mauThe;
        const defaultId = initialMauTheId || attachedId || list[0]._id;
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
        return warranty?.danhSachBaoHanh?.[0]?.tenSanPhamBaoHanh || warranty?.danhSachBaoHanh?.[0]?.sanPham?.tenSanPham || donHang?.danhSachSanPham?.[0]?.sanPham?.tenSanPham || "---";

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

  const handlePrint = () => {
    if (!cardRef.current) return;

    const printContent = cardRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Thẻ Bảo Hành</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fff;
              font-family: sans-serif;
            }
            .card-container {
              width: 85mm;
              height: 53mm;
              position: relative;
              border: 1px dashed #ccc; 
            }
            @media print {
              @page { size: auto; margin: 0; }
              body { padding: 10mm; display: block; }
              .card-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ style: { boxShadow: 'none', border: 'none' } }}
    >
      {/* Selector mẫu thẻ — chỉ hiện khi KHÔNG có initialMauTheId (tức là chưa chọn từ ngoài) */}
      {!initialMauTheId && (
        <div style={{ padding: "12px 16px 0 16px" }}>
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
      )}

      <DialogContent style={{
        minHeight: "260px",
        padding: "24px 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f172a",
        backgroundImage: "radial-gradient(#1e293b 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}>
        {loading ? <CircularProgress /> : !mauThe ? <p style={{ padding: 16, color: "#fff" }}>Không tìm thấy mẫu thẻ bảo hành.</p> : (
          <div ref={cardRef} className="card-container" style={{
            position: "relative",
            width: "85mm",
            height: "53mm",
            backgroundColor: "white",
            borderRadius: "4px",
            boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.5)",
            overflow: "hidden",
            border: "none",
          }}>
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
                  fontStyle: field.nghieng ? "italic" : "normal",
                  textDecoration: field.gachChan ? "underline" : "none",
                  textTransform: field.inHoa ? "uppercase" : "none",
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
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={handlePrint}>In</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarrantyCardPrint;