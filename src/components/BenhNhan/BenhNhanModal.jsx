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
        <Box className="bg-white w-[700px] p-6 mx-auto mt-20 rounded-2xl shadow-xl">
          <div className="bg-[#0091ea] px-4 py-2 my-2 flex justify-between items-center shrink-0 text-white">
            <Typography variant="h6" className="font-medium text-[16px]">
              Tạo Bệnh Nhân
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Tên"
              value={form.hoVaTen}
              onChange={(e) => handleChange("hoVaTen", e.target.value)}
            />

            <TextField
              label="Số hồ sơ"
              value={form.soHoSo}
              onChange={(e) => handleChange("soHoSo", e.target.value)}
            />

            <TextField
              select
              label="Giới tính"
              value={form.gioiTinh}
              onChange={(e) => handleChange("gioiTinh", e.target.value)}
            >
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </TextField>

            {/* 🔥 NHA KHOA */}
            <TextField
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

            {/* 🔥 TỈNH */}
            <TextField
              select
              label="Tỉnh / Thành phố"
              value={form.tinh}
              onChange={(e) => handleChange("tinh", e.target.value)}
            >
              {vietnamProvinces.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* ACTION */}
          <div className="flex justify-end mt-4 gap-3">
            <Button onClick={() => setOpen(false)}>Hủy</Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Lưu"}
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}
