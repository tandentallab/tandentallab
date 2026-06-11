import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaTable from "./NhaKhoaTable";

export default function NhaKhoaPage() {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.nhaKhoa);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  const { tongCongNo, soNhaKhoaCoCongNo } = useMemo(() => {
    const coNo = (data || []).filter((nk) => (nk.tongCongNo ?? 0) > 0);
    return {
      tongCongNo: coNo.reduce((sum, nk) => sum + (nk.tongCongNo ?? 0), 0),
      soNhaKhoaCoCongNo: coNo.length,
    };
  }, [data]);

  return (
    <div className="p-6">
      {/* ===== BANNER CÔNG NỢ ===== */}
      <div
        className="rounded-xl px-6 py-4 mb-4"
        style={{ backgroundColor: "#f59e0b" }}
      >
        <div className="text-white text-2xl font-bold tracking-wide">
          {tongCongNo.toLocaleString("vi-VN")}
        </div>
        <div className="text-white text-sm mt-0.5">
          {soNhaKhoaCoCongNo} Nha khoa có công nợ
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Nha khoa</h2>
      </div>

      <NhaKhoaTable />
    </div>
  );
}
