import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Trash2 } from "lucide-react";

import {
  fetchBangGiaByNhaKhoa,
  upsertBangGia,
  deleteBangGia,
} from "../../redux/slices/bangGiaSlice";

import { fetchSanPham } from "../../redux/slices/sanPhamSlice";

export default function TabBangGiaRieng({ nhaKhoaData, handleClose }) {
  const dispatch = useDispatch();

  // ✅ Lấy state an toàn (tránh undefined crash)

  const { data, loading } = useSelector((state) => state.bangGia);

  const sanPham = useSelector((state) => state.sanPham);

  return (
    <Paper
      sx={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Loading */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* HEADER */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              p: 2,
              bgcolor: "#f1f5f9",
              fontWeight: 700,
            }}
          >
            <Box>Sản phẩm</Box>
            <Box>Giá chung</Box>
            <Box>Giá riêng</Box>
            <Box textAlign="center">Hành động</Box>
          </Box>

          {/* EMPTY */}
          {data.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">Chưa có bảng giá</Typography>
            </Box>
          )}

          {/* LIST */}
          {data.map((item) => (
            <Box
              key={item.sanPhamId}
              sx={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                alignItems: "center",
                p: 2,
                borderTop: "1px solid #e2e8f0",
                "&:hover": { bgcolor: "#f8fafc" },
              }}
            >
              {/* TÊN */}
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {item.tenSanPham}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.nhomSanPham}
                </Typography>
              </Box>

              <Box textAlign="center">
                {Array.isArray(sanPham?.data) &&
                  sanPham?.data?.find((sp) => sp._id === item.sanPhamId)
                    ?.donGiaChung}
              </Box>

              {/* GIÁ */}
              <TextField
                size="small"
                type="number"
                defaultValue={item.donGia}
                onBlur={(e) => {
                  const value = Number(e.target.value);

                  // ❌ tránh gửi rác
                  if (!value || value < 0) return;

                  dispatch(
                    upsertBangGia({
                      nhaKhoaId: nhaKhoaData._id,
                      sanPhamId: item.sanPhamId,
                      donGia: value,
                    })
                  );
                }}
                sx={{
                  "& input": {
                    color: item.laGiaRieng ? "#dc2626" : "#111827",
                    fontWeight: item.laGiaRieng ? 700 : 500,
                  },
                }}
              />

              {/* ACTION */}
              <Box textAlign="center">
                {item.laGiaRieng && (
                  <Tooltip title="Reset về giá chung">
                    <IconButton
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc muốn xóa đơn giá riêng này?"
                          )
                        )
                          dispatch(deleteBangGia(item.bangGiaId));
                        handleClose();
                      }}
                      color="error"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
        <Typography variant="caption" color="text.secondary">
          <span style={{ color: "#dc2626", fontWeight: 600 }}>
            ■ Giá màu đỏ
          </span>{" "}
          là đơn giá riêng &nbsp;|&nbsp;
          <span style={{ color: "#111827", fontWeight: 600 }}>
            ■ Giá màu đen
          </span>{" "}
          là đơn giá chung
        </Typography>
      </Box>
    </Paper>
  );
}
