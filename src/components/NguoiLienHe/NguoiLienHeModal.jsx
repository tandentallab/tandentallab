import React, { useState, useEffect } from "react";
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

import { Group } from "@mui/icons-material";

// 🔥 REDUX
import { useDispatch, useSelector } from "react-redux";
import { createNguoiLienHe } from "../../redux/slices/nguoiLienHeSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

import AddIcon from "@mui/icons-material/Add";

export default function NguoiLienHeModal({ isQuickMenu }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.nguoiLienHe);
  const { data: nhaKhoas = [] } = useSelector((state) => state.nhaKhoa);

  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    hoVaTen: "",
    email: "",
    soDienThoai: "",
    tieuDe: "",
    moTa: "",
    nhaKhoa: "",
  });

  /* ================= LOAD NHA KHOA ================= */
  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  /* ================= HANDLE ================= */

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(createNguoiLienHe(form)).unwrap();

      setOpen(false);

      // reset form
      setForm({
        hoVaTen: "",
        email: "",
        soDienThoai: "",
        tieuDe: "",
        moTa: "",
        nhaKhoa: "",
      });
    } catch (err) {
      console.log("Lỗi:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* BUTTON */}
      {isQuickMenu ? (
        <button
          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
          onClick={() => setOpen(true)}
        >
          <span className="mr-3 text-gray-500">
            <Group fontSize="small" />
          </span>

          <span className="font-medium">Thêm Người Liên Hệ</span>
        </button>
      ) : (
        <Tooltip title="Thêm người liên hệ">
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
              md: 700,
            },
            maxHeight: "90vh",
            overflowY: "auto",
            mx: "auto",
            mt: {
              xs: 3,
              sm: 6,
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
              justifyContent: "space-between",
              alignItems: "center",
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
              Tạo Người Liên Hệ
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
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <TextField
              label="Số điện thoại"
              fullWidth
              value={form.soDienThoai}
              onChange={(e) => handleChange("soDienThoai", e.target.value)}
            />

            <TextField
              label="Tiêu đề"
              fullWidth
              value={form.tieuDe}
              onChange={(e) => handleChange("tieuDe", e.target.value)}
            />

            {/* SELECT NHA KHOA */}
            <TextField
              select
              label="Nha khoa"
              fullWidth
              value={form.nhaKhoa}
              onChange={(e) => handleChange("nhaKhoa", e.target.value)}
            >
              {nhaKhoas.map((nk) => (
                <MenuItem key={nk._id} value={nk._id}>
                  {nk.hoVaTen}
                </MenuItem>
              ))}
            </TextField>
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
