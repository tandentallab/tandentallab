import React from "react";
import SanPhamTable from "./SanPhamTable";

export default function SanPhamPage() {
    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                <h2 className="text-xl md:text-2xl font-bold">Danh Mục Sản Phẩm</h2>
            </div>
            <SanPhamTable />
        </div>
    );
}