import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaTable from "./NhaKhoaTable";
import { Box, Typography } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";

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
      <Box
        sx={{
          borderRadius: "18px",
          px: 3,
          py: 2.5,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          boxShadow: "0 8px 20px rgba(217,119,6,0.25)",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "14px",
            backgroundColor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PaymentsIcon sx={{ color: "#fff", fontSize: 26 }} />
        </Box>
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 0.3,
              lineHeight: 1.1,
            }}
          >
            {tongCongNo.toLocaleString("vi-VN")}đ
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.9)", fontSize: 14, mt: 0.3 }}
          >
            {soNhaKhoaCoCongNo} nha khoa đang có công nợ
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Nha khoa
        </Typography>
      </Box>

      <NhaKhoaTable />
    </div>
  );
}
