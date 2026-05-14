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

  const qrValue = `http://localhost:3000/warranty/?qrcode=${warranty.maQR}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="bg-blue-600 text-white font-bold">
        In thẻ bảo hành
      </DialogTitle>

      <DialogContent className="p-4">
        {/* Card Preview */}
        <div
          ref={printRef}
          className="bg-white border-2 border-gray-300 p-6"
          style={{ width: "100%", maxWidth: "450px", margin: "0 auto", height: "200px" }}
        >
          <div className="flex h-full gap-6">
            {/* Left side: Phone + Name */}
            <div className="flex flex-col justify-between flex-1">
              {/* Phone */}
              <div className="text-2xl font-bold text-gray-800">
                {warranty.soDienThoai || "---"}
              </div>

              {/* Customer Name */}
              <div className="text-lg font-semibold text-gray-700">
                {warranty.benhNhan?.hoVaTen || "---"}
              </div>
            </div>

            {/* Right side: QR + Code */}
            <div className="flex flex-col items-center justify-between">
              {/* QR Code */}
              <div>
                <QRCodeSVG value={qrValue} size={100} level="H" includeMargin={false} />
              </div>

              {/* Warranty Code */}
              <div className="text-sm font-semibold text-gray-800 text-center">
                {warranty.maBaoHanh}
              </div>
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
