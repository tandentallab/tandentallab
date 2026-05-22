import React, { useState, useEffect } from "react";
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
import { upsertBangGia, deleteBangGia } from "../../redux/slices/bangGiaSlice";
import NhaKhoaSelector from "./NhaKhoaSelector";

// Hàm tiện ích định dạng số thành chuỗi tiền tệ 100.000
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return Number(value).toLocaleString("vi-VN");
};

// Hàm loại bỏ dấu chấm để chuyển về số thuần túy khi xử lý logic
const parseCurrencyToNumber = (valueString) => {
  return Number(valueString.replace(/\./g, ""));
};

export default function TabBangGiaRieng({ nhaKhoaData, handleClose }) {
  const dispatch = useDispatch();

  // ✅ Lấy state an toàn (tránh undefined crash)
  const { data, loading } = useSelector((state) => state.bangGia);
  const sanPham = useSelector((state) => state.sanPham);

  // State tạm thời để quản lý việc gõ số trong TextField mà không bị lỗi định dạng
  const [inputValues, setInputValues] = useState({});

  // Cập nhật giá trị hiển thị ban đầu từ props/redux data
  useEffect(() => {
    if (data && data.length > 0) {
      const initialValues = {};
      data.forEach((item) => {
        initialValues[item.sanPhamId] = formatCurrency(item.donGia);
      });
      setInputValues(initialValues);
    }
  }, [data]);

  const handleInputChange = (sanPhamId, value) => {
    // Chỉ cho phép nhập số, tự động định dạng lại khi người dùng gõ
    const cleanValue = value.replace(/\D/g, "");
    setInputValues((prev) => ({
      ...prev,
      [sanPhamId]: formatCurrency(cleanValue),
    }));
  };

  return (
    <Paper
      sx={{
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <NhaKhoaSelector nhaKhoaData={nhaKhoaData}></NhaKhoaSelector>

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
              gridTemplateColumns: "2fr 1fr 1fr 1fr", // Sửa lại số cột cho khớp (4 cột)
              p: 2,
              bgcolor: "#f1f5f9",
              fontWeight: 700,
              alignItems: "center",
            }}
          >
            <Box>Sản phẩm</Box>
            <Box textAlign="right" sx={{ pr: 2 }}>
              Giá chung
            </Box>
            <Box textAlign="center">Giá riêng (VNĐ)</Box>
            <Box textAlign="center">Hành động</Box>
          </Box>

          {/* EMPTY */}
          {(!data || data.length === 0) && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">Chưa có bảng giá</Typography>
            </Box>
          )}

          {/* LIST */}
          {data &&
            data.map((item) => {
              // Tìm giá chung tương ứng từ danh sách sản phẩm
              const productCommon = Array.isArray(sanPham?.data)
                ? sanPham.data.find((sp) => sp._id === item.sanPhamId)
                : null;
              const giaChungHienThi = productCommon
                ? `${formatCurrency(productCommon.donGiaChung)} đ`
                : "—";

              return (
                <Box
                  key={item.sanPhamId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr", // Đồng bộ 4 cột với Header
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

                  {/* ĐỊNH DẠNG GIÁ CHUNG CHỈ HIỂN THỊ */}
                  <Box
                    textAlign="right"
                    sx={{ pr: 2, fontWeight: 500, color: "text.primary" }}
                  >
                    {giaChungHienThi}
                  </Box>

                  {/* GIÁ RIÊNG - ĐÃ ĐỊNH DẠNG DẤU CHẤM KHI GÕ */}
                  <Box display="flex" justifyContent="center">
                    <TextField
                      size="small"
                      type="text" // Chuyển thành text để hiển thị dấu chấm phân cách hàng nghìn
                      value={inputValues[item.sanPhamId] || ""}
                      onChange={(e) =>
                        handleInputChange(item.sanPhamId, e.target.value)
                      }
                      onBlur={() => {
                        const rawString = inputValues[item.sanPhamId] || "";
                        const numericValue = parseCurrencyToNumber(rawString);

                        // ❌ tránh gửi rác
                        if (!numericValue || numericValue < 0) return;

                        dispatch(
                          upsertBangGia({
                            nhaKhoaId: nhaKhoaData._id,
                            sanPhamId: item.sanPhamId,
                            donGia: numericValue, // Gửi lên Redux số nguyên thuần túy (VD: 100000)
                          })
                        );
                      }}
                      sx={{
                        width: "140px",
                        "& input": {
                          textAlign: "right",
                          color: item.laGiaRieng ? "#dc2626" : "#111827",
                          fontWeight: item.laGiaRieng ? 700 : 500,
                        },
                      }}
                    />
                  </Box>

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
                            ) {
                              dispatch(deleteBangGia(item.bangGiaId));
                              handleClose();
                            }
                          }}
                          color="error"
                        >
                          <IconButton
                            component="div"
                            sx={{ p: 0, color: "inherit" }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              );
            })}
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
