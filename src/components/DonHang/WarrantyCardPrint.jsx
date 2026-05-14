import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const WarrantyCardPrint = ({ open, onClose, warranty, donHang }) => {
  const printRef = useRef();

  if (!warranty) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "", "height=400,width=600");
    printWindow.document.write(printRef.current.innerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  const qrValue = `http://${host}:3000/warranty/?qrcode=${warranty.maQR}`;
  const warrantyCodeNumber = String(warranty.maBaoHanh || "").match(/\d+/g)?.join("") || warranty.maBaoHanh || "---";

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh", height: "auto" }
      }}
    >
      <DialogTitle className="bg-blue-600 text-white font-bold">
        In thẻ bảo hành
      </DialogTitle>

      <DialogContent className="p-4">
        {/* Card Preview */}
        <div
          ref={printRef}
          style={{
            width: "100%",
            maxWidth: "450px",
            margin: "0 auto",
            height: "500px",
            background: "#ffffff",
            border: "2px solid #e5e7eb",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            padding: 0,
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {/* Tên nha khoa: top 37mm, left 10mm, size 12pt bold */}
            <div
              style={{
                position: "absolute",
                left: "8mm",
                top: "36mm",
                fontSize: "10pt",
                fontWeight: 700,
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              {warranty.nhaKhoa?.tenGiaoDich || warranty.nhaKhoa?.hoVaTen || "---"}
            </div>

            {/* Bệnh nhân: top 47mm, left 10mm, size 12pt bold */}
            <div
              style={{
                position: "absolute",
                left: "8mm",
                top: "46mm",
                fontSize: "10pt",
                fontWeight: 700,
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              {warranty.benhNhan?.hoVaTen || "---"}
            </div>

            {/* Mã thẻ: top 47mm, left 60mm, size 12pt bold */}
            <div
              style={{
                position: "absolute",
                left: "59mm",
                top: "46mm",
                fontSize: "10pt",
                fontWeight: 700,
                color: "#111827",
                whiteSpace: "nowrap",
              }}
            >
              {warrantyCodeNumber}
            </div>

            {/* Mã QR: top 33mm, left 60mm */}
            <div
              style={{
                position: "absolute",
                left: "59mm",
                top: "31mm",
              }}
            >
              <QRCodeSVG value={qrValue} size={53} level="H" includeMargin={false} />
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button onClick={handlePrint} variant="contained" color="primary">
          In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarrantyCardPrint;
