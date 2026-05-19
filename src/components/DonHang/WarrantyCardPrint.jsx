import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogActions, Button, CircularProgress } from "@mui/material";
import { api } from "../../config/api";

const WarrantyCardPrint = ({ open, onClose, warranty, donHang }) => {
  const [mauThe, setMauThe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadMauThe();
  }, [open, warranty]);

  const loadMauThe = async () => {
    try {
      setLoading(true);
      const mauTheId = typeof warranty?.mauThe === 'object' ? warranty.mauThe?._id : warranty?.mauThe;
      
      let res;
      if (mauTheId) {
        res = await api.get(`/mau-the-bao-hanh/${mauTheId}`);
      } else {
        const listRes = await api.get("/mau-the-bao-hanh", { params: { nhaKhoaId: warranty.nhaKhoa?._id } });
        if (listRes.data?.success && listRes.data.data.length > 0) {
          res = { data: { success: true, data: listRes.data.data[0] } };
        }
      }

      if (res?.data?.success && res.data.data) {
        setMauThe(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải mẫu:", error);
    } finally {
      setLoading(false);
    }
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
      PaperProps={{ style: { boxShadow: 'none', border: 'none' } }} // Xóa bóng mờ của khung dialog
    >
      <DialogContent id="print-content" style={{ minHeight: "300px", padding: 0 }}>
        {loading ? <CircularProgress /> : !mauThe ? <p>Không tìm thấy mẫu.</p> : (
          /* Xóa border: "1px dashed #ccc" ở đây */
          <div style={{ position: "relative", width: "100%", height: "297mm", border: "none" }}>
            {mauThe.cacTruong?.map((field, idx) => {
              const left = Number(field.leTrai) || 0; 
              const top = Number(field.leTren) || 0;
              
              if (field.loaiTruong === "maQR") {
                // 1. Lấy mã và loại bỏ chữ "TAN" ở đầu
                const rawCode = (warranty?.maQR || "N/A").replace(/^TAN/, "");
                
                // 2. Tạo đường dẫn đầy đủ
                const fullUrl = `https://tan-dental-frontend-snmb.vercel.app/warranty/?qrcode=${rawCode}`;

                return (
                  <div key={idx} style={{ position: "absolute", left: `${left}mm`, top: `${top}mm` }}>
                    {/* 3. Truyền đường dẫn đầy đủ vào QR */}
                    <QRCodeSVG value={fullUrl} size={field.coChu ? field.coChu * 4 : 65} />
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