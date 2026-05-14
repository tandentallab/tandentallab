import React, { useState } from "react";
import NhaKhoaTable from "./NhaKhoaTable";

export default function NhaKhoaPage() {
  // ✅ FAKE DATA (giống backend)
  const [data, setData] = useState([
    {
      _id: "69e1bad0511d9d7ffe7cda73",
      hoVaTen: "Phòng khám A",
      tenGiaoDich: "PK A",
      soDienThoai: "0123456789",
      email: "quanpogba888@gmail.com",
      website: "hoangquan.com.vn",
      quocGia: "Việt Nam",
      tinh: "Sóc Trăng",
      quanHuyen: "Mỹ Xuyên",
      diaChiCuThe: "156, quốc lộ 1A, xã Thuận Hòa",
      moTa: "Nha khoa mới",
      createdAt: "2026-04-17T04:45:04.096Z",
      updatedAt: "2026-04-17T04:45:04.096Z",
    },
    {
      _id: "69e1bad0511d9d7ffe7cda74",
      hoVaTen: "Phòng khám A",
      tenGiaoDich: "PK A",
      soDienThoai: "0123456789",
      email: "quanpogba888@gmail.com",
      website: "hoangquan.com.vn",
      quocGia: "Việt Nam",
      tinh: "Sóc Trăng",
      quanHuyen: "Mỹ Xuyên",
      diaChiCuThe: "156, quốc lộ 1A, xã Thuận Hòa",
      moTa: "Nha khoa mới",
      createdAt: "2026-04-17T04:45:04.096Z",
      updatedAt: "2026-04-17T04:45:04.096Z",
    },
  ]);

  // ✅ ADD NEW
  const handleAdd = (newItem) => {
    setData((prev) => [
      {
        ...newItem,
        updatedAt: new Date(),
      },
      ...prev, // thêm lên đầu cho giống admin
    ]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Nha khoa</h2>
      </div>

      <NhaKhoaTable data={data} />
    </div>
  );
}
