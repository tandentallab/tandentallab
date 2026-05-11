import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { updateNguoiLienHe } from "../../redux/slices/nguoiLienHeSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

export default function NguoiLienHeUpdateModal({ open, setOpen, data }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.nguoiLienHe);
  const { data: nhaKhoas } = useSelector((state) => state.nhaKhoa);

  const [form, setForm] = useState({
    hoVaTen: "",
    email: "",
    soDienThoai: "",
    nhaKhoa: "",
    moTa: "",
  });

  // ===== LOAD DATA VÀO FORM =====
  useEffect(() => {
    if (data) {
      setForm({
        hoVaTen: data.hoVaTen || "",
        email: data.email || "",
        soDienThoai: data.soDienThoai || "",
        nhaKhoa: data.nhaKhoa?._id || "",
        moTa: data.moTa || "",
      });
    }
  }, [data]);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(
        updateNguoiLienHe({
          id: data._id,
          data: form,
        })
      ).unwrap();

      setOpen(false);
    } catch (err) {
      console.log("Update lỗi:", err);
    }
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          backgroundColor: "white",
          width: {
            xs: "95%",
            sm: "90%",
            md: 600,
          },
          maxHeight: "90vh",
          overflowY: "auto",
          p: {
            xs: 2,
            sm: 3,
          },
          mx: "auto",
          mt: {
            xs: 3,
            sm: 6,
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
            Cập Nhật Người Liên Hệ
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
            label="Họ tên"
            value={form.hoVaTen}
            onChange={(e) => handleChange("hoVaTen", e.target.value)}
            fullWidth
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
          />

          <TextField
            label="SĐT"
            value={form.soDienThoai}
            onChange={(e) => handleChange("soDienThoai", e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Nha khoa"
            value={form.nhaKhoa}
            onChange={(e) => handleChange("nhaKhoa", e.target.value)}
            fullWidth
          >
            {nhaKhoas.map((nk) => (
              <MenuItem key={nk._id} value={nk._id}>
                {nk.hoVaTen}
              </MenuItem>
            ))}
          </TextField>

          {/* MÔ TẢ */}
          <Box
            sx={{
              gridColumn: {
                xs: "span 1",
                sm: "span 2",
              },
            }}
          >
            <TextField
              label="Mô tả"
              value={form.moTa}
              onChange={(e) => handleChange("moTa", e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
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
            {loading ? <CircularProgress size={20} /> : "Cập nhật"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
