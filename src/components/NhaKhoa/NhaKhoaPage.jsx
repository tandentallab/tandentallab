import React, { useState } from "react";
import NhaKhoaTable from "./NhaKhoaTable";

export default function NhaKhoaPage() {
  // ✅ ADD NEW
  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Nha khoa</h2>
      </div>

      <NhaKhoaTable />
    </div>
  );
}
