import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";

import { Group } from "@mui/icons-material";

import vietnamAddress from "../../data/vietNameAddress";

// 🔥 REDUX
import { useDispatch, useSelector } from "react-redux";
import { createBenhNhan } from "../../redux/slices/benhNhanSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

import AddIcon from "@mui/icons-material/Add";
import vietnamProvinces from "../../utils/vietNamProvinces";

export default function BenhNhanModal({ isQuickMenu }) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.benhNhan);
  const { data: nhaKhoas } = useSelector((state) => state.nhaKhoa);

  const [open, setOpen] = useState(false);
  const [districts, setDistricts] = useState([]);

  const [form, setForm] = useState({
    hoVaTen: "",
    soHoSo: "",
    gioiTinh: "",
    tinh: "",
    quanHuyen: "",
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
      await dispatch(createBenhNhan(form)).unwrap();

      setOpen(false);

      // reset form
      setForm({
        hoVaTen: "",
        soHoSo: "",
        gioiTinh: "",
        tinh: "",
        quanHuyen: "",
        nhaKhoa: "",
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

          <span className="font-medium">Thêm Bệnh Nhân</span>
        </button>
      ) : (
        <Tooltip title="Thêm bệnh nhân">
          <IconButton
            onClick={() => setOpen(true)}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

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
              Tạo Bệnh Nhân
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
              label="Tỉnh / Thành phố"
              value={form.tinh}
              onChange={(e) => {
                handleProvince(e);
                handleChange("tinh", e.target.value);
              }}
            >
              {vietnamProvinces.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
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
              fullWidth={window.innerWidth < 600}
              onClick={() => setOpen(false)}
              variant="outlined"
            >
              Hủy
            </Button>

            <Button
              fullWidth={window.innerWidth < 600}
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
