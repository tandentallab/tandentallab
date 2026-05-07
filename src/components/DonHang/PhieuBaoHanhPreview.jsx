import React from "react";

const PhieuBaoHanhPreview = ({ phieuBaoHanh }) => {
  if (!phieuBaoHanh) return null;

  const nhaKhoaTen = phieuBaoHanh.nhaKhoa?.tenGiaoDich || phieuBaoHanh.nhaKhoa?.hoVaTen || "";
  const benhNhanTen = phieuBaoHanh.benhNhan?.hoVaTen || "";

  return (
    <div className="w-64 h-40 border border-gray-400 rounded shadow-md p-6 bg-white flex flex-col justify-between text-sm">
      <div>
        <div className="font-bold text-center text-base">{nhaKhoaTen}</div>
        <div className="text-center mt-2">{benhNhanTen}</div>
      </div>

      <div className="text-right font-bold">
        {phieuBaoHanh.maBaoHanh}
      </div>
    </div>
  );
};

export default PhieuBaoHanhPreview;
