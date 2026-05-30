import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import {
  createStaff,
  updateStaff,
  fetchStaff,
} from "../../redux/slices/staffSlice";

import AddIcon from "@mui/icons-material/Add";
import { api } from "../../config/api";
import { Group } from "@mui/icons-material";

export default function StaffModal({
  staffId = null,
  onClose = null,
  isQuickMenu = false,
}) {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.staff);

  const [open, setOpen] = useState(false);
  const [quyens, setQuyens] = useState([]);
  const [loadingQuyens, setLoadingQuyens] = useState(false);

  const [form, setForm] = useState({
    MSNV: "",
    HoTenNV: "",
    Email: "",
    Password: "",
    quyenSuDung: "",
    DienThoai: "",
    DiaChi: "",
    GioiThieu: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  /* ================= FETCH QUYỀN ================= */
  useEffect(() => {
    const fetchQuyens = async () => {
      try {
        setLoadingQuyens(true);
        const res = await api.get("/quyen-su-dung");
        setQuyens(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingQuyens(false);
      }
    };

    if (open) fetchQuyens();
  }, [open]);

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!form.HoTenNV.trim()) {
      newErrors.HoTenNV = "Tên nhân viên là bắt buộc";
    }

    if (!form.Email.trim()) {
      newErrors.Email = "Email là bắt buộc";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.Email)) {
      newErrors.Email = "Email không hợp lệ";
    }

    if (!form.Password.trim()) {
      newErrors.Password = "Mật khẩu là bắt buộc";
    }

    if (!form.quyenSuDung) {
      newErrors.quyenSuDung = "Quyền sử dụng là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= HANDLE ================= */
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const resetForm = () => {
    setForm({
      MSNV: "",
      HoTenNV: "",
      Email: "",
      Password: "",
      quyenSuDung: "",
      DienThoai: "",
      DiaChi: "",
      GioiThieu: "",
      Status: 1,
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (staffId) {
        await dispatch(updateStaff({ id: staffId, data: form })).unwrap();
      } else {
        await dispatch(createStaff(form)).unwrap();
        dispatch(fetchStaff());
      }

      resetForm();
      setOpen(false);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = () => setOpen(true);

  const handleCloseModal = () => {
    setOpen(false);
    if (onClose) onClose();
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
          <span className="font-medium">Thêm Tài Khoản Mới</span>
        </button>
      ) : (
        <Tooltip title="Thêm tài khoản">
          <IconButton onClick={handleOpenModal}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      )}

      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            backgroundColor: "white",
            width: { xs: "90%", sm: "85%", md: "700px" },
            maxHeight: "90vh",
            overflowY: "auto",
            padding: { xs: "1.25rem", md: "1.5rem" },
            margin: { xs: "2rem auto", md: "5rem auto 0" },
            borderRadius: "1rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
            {staffId ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </Typography>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Mã nhân viên"
              value={form.MSNV}
              onChange={(e) => handleChange("MSNV", e.target.value)}
              size="small"
            />

            <TextField
              label="Tên nhân viên"
              value={form.HoTenNV}
              onChange={(e) => handleChange("HoTenNV", e.target.value)}
              error={!!errors.HoTenNV}
              helperText={errors.HoTenNV}
              size="small"
            />

            <TextField
              label="Email"
              value={form.Email}
              onChange={(e) => handleChange("Email", e.target.value)}
              error={!!errors.Email}
              helperText={errors.Email}
              size="small"
            />

            <TextField
              label="Mật khẩu"
              type="password"
              value={form.Password}
              onChange={(e) => handleChange("Password", e.target.value)}
              error={!!errors.Password}
              helperText={errors.Password}
              size="small"
            />

            <TextField
              label="Điện thoại"
              value={form.DienThoai}
              onChange={(e) => handleChange("DienThoai", e.target.value)}
              size="small"
            />

            <TextField
              label="Địa chỉ"
              value={form.DiaChi}
              onChange={(e) => handleChange("DiaChi", e.target.value)}
              size="small"
            />

            <TextField
              select
              label="Quyền sử dụng"
              value={form.quyenSuDung}
              onChange={(e) => handleChange("quyenSuDung", e.target.value)}
              size="small"
              error={!!errors.quyenSuDung}
              helperText={errors.quyenSuDung}
              disabled={loadingQuyens}
            >
              <MenuItem value="">Chọn quyền</MenuItem>
              {quyens.map((q) => (
                <MenuItem key={q._id} value={q._id}>
                  {q.ten}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Giới thiệu"
              value={form.GioiThieu}
              onChange={(e) => handleChange("GioiThieu", e.target.value)}
              multiline
              rows={3}
              fullWidth
              className="sm:col-span-2"
            />

            <TextField
              select
              label="Trạng thái"
              value={form.Status}
              onChange={(e) => handleChange("Status", Number(e.target.value))}
              fullWidth
              size="small"
              className="sm:col-span-2"
            >
              <MenuItem value={1}>Hoạt động</MenuItem>
              <MenuItem value={0}>Bị khoá</MenuItem>
            </TextField>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <Button onClick={handleCloseModal} fullWidth className="sm:w-auto">
              Hủy
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              className="sm:w-auto"
            >
              {loading ? <CircularProgress size={20} /> : "Lưu"}
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}
