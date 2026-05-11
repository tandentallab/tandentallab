import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { updateBenhNhan } from "../../redux/slices/benhNhanSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

import vietnamAddress from "../../data/vietNameAddress";

export default function BenhNhanUpdateModal({ open, setOpen, data }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.benhNhan);
  const { data: nhaKhoas } = useSelector((state) => state.nhaKhoa);

  const [districts, setDistricts] = useState([]);

  const [form, setForm] = useState({
    hoVaTen: "",
    soHoSo: "",
    gioiTinh: "",
    tinh: "",
    quanHuyen: "",
    nhaKhoa: "",
  });

  // ===== LOAD DATA VÀO FORM =====
  useEffect(() => {
    if (data) {
      setForm({
        hoVaTen: data.hoVaTen || "",
        soHoSo: data.soHoSo || "",
        gioiTinh: data.gioiTinh || "",
        tinh: data.tinh || "",
        quanHuyen: data.quanHuyen || "",
        nhaKhoa: data.nhaKhoa?._id || "",
      });

      // load quận theo tỉnh
      const province = vietnamAddress.find((p) => p.name === data.tinh);
      setDistricts(province?.districts || []);
    }
  }, [data]);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProvince = (e) => {
    const province = vietnamAddress.find((p) => p.name === e.target.value);

    setDistricts(province?.districts || []);

    setForm((prev) => ({
      ...prev,
      tinh: e.target.value,
      quanHuyen: "",
    }));
  };

  const handleSubmit = async () => {
    try {
      await dispatch(
        updateBenhNhan({
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
            md: 700,
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
            Cập Nhật Bệnh Nhân
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
            fullWidth
            label="Tên"
            value={form.hoVaTen}
            onChange={(e) => handleChange("hoVaTen", e.target.value)}
          />

          <TextField
            fullWidth
            label="Số hồ sơ"
            value={form.soHoSo}
            onChange={(e) => handleChange("soHoSo", e.target.value)}
          />

          <TextField
            fullWidth
            select
            label="Giới tính"
            value={form.gioiTinh}
            onChange={(e) => handleChange("gioiTinh", e.target.value)}
          >
            <MenuItem value="Nam">Nam</MenuItem>
            <MenuItem value="Nữ">Nữ</MenuItem>
          </TextField>

          {/* NHA KHOA */}
          <TextField
            fullWidth
            select
            label="Nha khoa"
            value={form.nhaKhoa}
            onChange={(e) => handleChange("nhaKhoa", e.target.value)}
          >
            {nhaKhoas.map((nk) => (
              <MenuItem key={nk._id} value={nk._id}>
                {nk.hoVaTen}
              </MenuItem>
            ))}
          </TextField>

          {/* TỈNH */}
          <TextField
            fullWidth
            select
            label="Tỉnh"
            value={form.tinh}
            onChange={handleProvince}
          >
            {vietnamAddress.map((p) => (
              <MenuItem key={p.name} value={p.name}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>

          {/* QUẬN */}
          <TextField
            fullWidth
            select
            label="Quận"
            value={form.quanHuyen}
            disabled={!districts.length}
            onChange={(e) => handleChange("quanHuyen", e.target.value)}
          >
            {districts.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
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
