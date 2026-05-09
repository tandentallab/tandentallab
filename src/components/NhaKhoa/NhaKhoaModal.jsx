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
import {
  Group,
  Assignment,
  Description,
  Download,
  Upload,
  Business,
  Add,
} from "@mui/icons-material";

import vietnamAddress from "../../data/vietNameAddress";

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

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="bg-white w-[800px] max-h-[90vh] overflow-y-auto mx-auto mt-10 p-6 rounded-2xl shadow-xl">
          <div className="bg-[#0091ea] px-4 py-2 my-2 flex justify-between items-center shrink-0 text-white">
            <Typography variant="h6" className="font-medium text-[16px]">
              Tạo Nha Khoa
            </Typography>
          </div>
          <div className="grid grid-cols-2 gap-4">
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

          <div className="mt-4">
            <TextField
              label="Địa chỉ cụ thể"
              fullWidth
              value={form.diaChiCuThe}
              onChange={(e) => handleChange("diaChiCuThe", e.target.value)}
            />
          </div>

          <div className="mt-4">
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={form.moTa}
              onChange={(e) => handleChange("moTa", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
