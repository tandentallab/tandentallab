import React, { useState } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { Group } from "@mui/icons-material";

// 🔥 REDUX
import { useDispatch, useSelector } from "react-redux";
import { createNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

import vietnamProvinces from "../../utils/vietNamProvinces";

export default function NhaKhoaModal({ isQuickMenu }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.nhaKhoa);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    hoVaTen: "",
    tenGiaoDich: "",
    soDienThoai: "",
    email: "",
    website: "",
    quocGia: "Việt Nam",
    tinh: "",
    quanHuyen: "",
    diaChiCuThe: "",
    moTa: "",
  });

  const [districts, setDistricts] = useState([]);

  /* ================= HANDLE ================= */

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createNhaKhoa(form)).unwrap();

      setOpen(false);

      // reset form
      setForm({
        hoVaTen: "",
        tenGiaoDich: "",
        soDienThoai: "",
        email: "",
        website: "",
        quocGia: "Việt Nam",
        tinh: "",
        quanHuyen: "",
        diaChiCuThe: "",
        moTa: "",
      });

      setDistricts([]);
    } catch (err) {
      console.log("Lỗi:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {isQuickMenu ? (
        <button
          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
          onClick={() => setOpen(true)}
        >
          <span className="mr-3 text-gray-500">
            <Group fontSize="small" />
          </span>

          <span className="font-medium">Thêm Nha Khoa</span>
        </button>
      ) : (
        <Tooltip title="Thêm nha khoa">
          <IconButton
            onClick={() => setOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

      {/* MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            backgroundColor: "white",
            width: {
              xs: "95%",
              sm: "90%",
              md: 800,
            },
            maxHeight: "90vh",
            overflowY: "auto",
            mx: "auto",
            mt: {
              xs: 3,
              sm: 5,
            },
            p: {
              xs: 2,
              sm: 3,
            },
            borderRadius: "20px",
            boxShadow: 24,
          }}
        >
          {/* HEADER */}
          <Box
            sx={{
              backgroundColor: "#0091ea",
              px: 2,
              py: 1.5,
              mb: 3,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "white",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: {
                  xs: "16px",
                  sm: "20px",
                },
              }}
            >
              Tạo Nha Khoa
            </Typography>
          </Box>

          {/* FORM */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Họ và tên"
              fullWidth
              value={form.hoVaTen}
              onChange={(e) => handleChange("hoVaTen", e.target.value)}
            />

            <TextField
              label="Tên giao dịch"
              fullWidth
              value={form.tenGiaoDich}
              onChange={(e) => handleChange("tenGiaoDich", e.target.value)}
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              value={form.soDienThoai}
              onChange={(e) => handleChange("soDienThoai", e.target.value)}
            />

            <TextField
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <TextField
              label="Website"
              fullWidth
              value={form.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />

            <TextField
              select
              label="Quốc gia"
              fullWidth
              value={form.quocGia}
              onChange={(e) => handleChange("quocGia", e.target.value)}
            >
              <MenuItem value="Việt Nam">Việt Nam</MenuItem>
            </TextField>

            <TextField
              select
              label="Tỉnh / Thành phố"
              fullWidth
              value={form.tinh}
              onChange={(e) => handleChange("tinh", e.target.value)}
            >
              {vietnamProvinces.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Địa chỉ cụ thể"
              fullWidth
              value={form.diaChiCuThe}
              onChange={(e) => handleChange("diaChiCuThe", e.target.value)}
            />
          </Box>

          {/* MÔ TẢ */}
          <Box mt={3} sx={{ mt: "16px" }}>
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={form.moTa}
              onChange={(e) => handleChange("moTa", e.target.value)}
            />
          </Box>

          {/* ACTION */}
          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "stretch",
                sm: "flex-end",
              },
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              gap: 2,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setOpen(false)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              Hủy
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              {loading ? <CircularProgress size={20} /> : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
