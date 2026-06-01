import React from "react";
import { QRCodeSVG } from "qrcode.react";

const PhieuBaoHanhPreview = ({ phieuBaoHanh }) => {
  if (!phieuBaoHanh) return null;

  const nhaKhoaTen = phieuBaoHanh.nhaKhoa?.tenGiaoDich || phieuBaoHanh.nhaKhoa?.hoVaTen || "";
  const benhNhanTen = phieuBaoHanh.benhNhan?.hoVaTen || "";

  // Tự động nhận diện tên miền hiện tại để tạo mã QR động
  const origin = window.location.origin;
  const qrLink = `${origin}/tra-cuu-bao-hanh/?qrcode=${phieuBaoHanh.maQR}`;

  return (
    <div className="w-72 border border-gray-400 rounded shadow-md p-4 bg-white flex flex-col gap-3 text-sm">
      <div className="text-center">
        <div className="font-bold text-base">{nhaKhoaTen}</div>
        <div className="text-sm text-gray-700 mt-1">{benhNhanTen}</div>
      </div>

      {/* Mã bảo hành */}
      <div className="border-t pt-2 text-center">
        <div className="text-xs text-gray-600">Mã bảo hành</div>
        <div className="font-bold text-base text-blue-600">{phieuBaoHanh.maBaoHanh}</div>
      </div>

      {/* Mã QR và QR code */}
      <div className="flex justify-between items-center border-t pt-2">
        <div>
          <div className="text-xs text-gray-600">Mã QR</div>
          <div className="font-bold text-lg text-orange-600">{phieuBaoHanh.maQR}</div>
        </div>
        <div>
          {/* Quét bắt buộc ra link Vercel */}
          <QRCodeSVG
            value={qrLink}
            size={100}
            level="L"
            includeMargin={true}
          />
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="border-t pt-2 text-xs">
        <span className="text-gray-600">Sản phẩm: </span>
        <span className="font-medium">{phieuBaoHanh.sanPham?.tenSanPham}</span>
      </div>
    </div>
  );
};

export default PhieuBaoHanhPreview;