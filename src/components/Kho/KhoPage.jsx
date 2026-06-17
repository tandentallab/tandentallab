// pages/Kho/KhoPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu, fetchNhaCungCap } from "../../redux/slices/khoSlice";
import VatLieuTable from "./VatLieuTable";
import NhaCungCapTable from "./NhaCungCapTable";
import { Box, Tab, Tabs } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function KhoPage() {
  const dispatch = useDispatch();
  const { vatLieu } = useSelector((state) => state.kho);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    dispatch(fetchVatLieu());
    dispatch(fetchNhaCungCap());
  }, [dispatch]);

  const { tongVatLieu, soHangThieuHang } = useMemo(() => {
    const thieu = (vatLieu || []).filter(
      (vl) => (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0)
    );
    return {
      tongVatLieu: (vatLieu || []).length,
      soHangThieuHang: thieu.length,
    };
  }, [vatLieu]);

  return (
    <div className="p-6">
      {/* ===== BANNER TỔNG QUAN ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Tổng vật liệu */}
        <div
          className="rounded-xl px-6 py-4 flex items-center gap-4"
          style={{ backgroundColor: "#1976d2" }}
        >
          <InventoryIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.8)" }} />
          <div>
            <div className="text-white text-2xl font-bold">{tongVatLieu}</div>
            <div className="text-white text-sm mt-0.5">Vật liệu trong kho</div>
          </div>
        </div>

        {/* Hàng thiếu */}
        <div
          className="rounded-xl px-6 py-4 flex items-center gap-4"
          style={{
            backgroundColor: soHangThieuHang > 0 ? "#ef4444" : "#22c55e",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 36, color: "rgba(255,255,255,0.85)" }} />
          <div>
            <div className="text-white text-2xl font-bold">{soHangThieuHang}</div>
            <div className="text-white text-sm mt-0.5">
              {soHangThieuHang > 0
                ? "Vật liệu dưới mức tồn kho tối thiểu"
                : "Tồn kho ổn định"}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab
            icon={<InventoryIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Vật liệu"
          />
          <Tab
            icon={<StorefrontIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Nhà cung cấp"
          />
        </Tabs>
      </Box>

      {tab === 0 && <VatLieuTable />}
      {tab === 1 && <NhaCungCapTable />}
    </div>
  );
}
