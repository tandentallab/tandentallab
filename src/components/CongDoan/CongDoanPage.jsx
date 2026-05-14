import React from "react";
import CongDoanTable from "./CongDoanTable";

export default function CongDoanPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Danh Mục Công Đoạn</h2>
      </div>
      <CongDoanTable />
    </div>
  );
}