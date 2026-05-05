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

// 🔥 REDUX
import { useDispatch, useSelector } from "react-redux";
import {
  createStaff,
  updateStaff,
  fetchStaff,
} from "../../redux/slices/staffSlice";
import AddIcon from "@mui/icons-material/Add";
import { api } from "../../config/api";

export default function StaffModal({ staffId = null, onClose = null }) {
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
    ChucVu: "Thành viên",
    quyenSuDung: "",
    DienThoai: "",
    DiaChi: "",
    GioiThieu: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  /* ================= FETCH QUYỀN SỬ DỤNG ================= */
  useEffect(() => {
    const fetchQuyens = async () => {
      try {
        setLoadingQuyens(true);
        const response = await api.get("/quyen-su-dung");
        setQuyens(response.data.data || []);
      } catch (error) {
        console.error("Lỗi lấy quyền sử dụng:", error);
      } finally {
        setLoadingQuyens(false);
      }
    };

    if (open) {
      fetchQuyens();
    }
  }, [open]);

  /* ================= LOAD STAFF DATA (EDIT MODE) ================= */
  useEffect(() => {
    if (staffId && open) {
      // Load staff data từ Redux store (có thể fetch nếu cần)
      // Để đơn giản, ta sẽ gọi API lấy chi tiết
    }
  }, [staffId, open]);

  /* ================= VALIDATE FORM ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!form.HoTenNV.trim()) {
      newErrors.HoTenNV = "Tên nhân viên là bắt buộc";
    }

    if (!form.Email.trim()) {
      newErrors.Email = "Email là bắt buộc";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.Email)) {
      newErrors.Email = "Email không hợp lệ";
    }

    if (!form.Password.trim()) {
      newErrors.Password = "Mật khẩu là bắt buộc";
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (staffId) {
        // Chế độ chỉnh sửa
        await dispatch(
          updateStaff({
            id: staffId,
            data: form,
          })
        ).unwrap();
      } else {
        // Chế độ tạo mới
        await dispatch(createStaff(form)).unwrap();
        // Refetch dữ liệu để đảm bảo _id đầy đủ
        dispatch(fetchStaff());
      }

      // Reset form
      setForm({
        MSNV: "",
        HoTenNV: "",
        Email: "",
        Password: "",
        ChucVu: "Thành viên",
        quyenSuDung: "",
        DienThoai: "",
        DiaChi: "",
        GioiThieu: "",
        Status: 1,
      });

      setOpen(false);

      if (onClose) onClose();
    } catch (err) {
      console.log("Lỗi:", err);
    }
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  /* ================= UI ================= */

  return (
    <>
      <Tooltip title="Thêm nha khoa">
        <IconButton
          onClick={handleOpenModal}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="bg-white w-[700px] p-6 mx-auto mt-20 rounded-2xl shadow-xl">
          <div className="bg-[#0091ea] px-4 py-2 my-2 flex justify-between items-center shrink-0 text-white">
            <Typography variant="h6" className="font-medium text-[16px]">
              {staffId ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CODE */}
            <TextField
              label="Mã nhân viên (Code)"
              value={form.MSNV}
              onChange={(e) => handleChange("MSNV", e.target.value)}
              placeholder="Tùy chọn"
              size="small"
            />

            {/* TÊN */}
            <TextField
              label="Tên nhân viên"
              value={form.HoTenNV}
              onChange={(e) => handleChange("HoTenNV", e.target.value)}
              error={!!errors.HoTenNV}
              helperText={errors.HoTenNV}
              required
              size="small"
            />

            {/* EMAIL */}
            <TextField
              label="Email"
              value={form.Email}
              onChange={(e) => handleChange("Email", e.target.value)}
              error={!!errors.Email}
              helperText={errors.Email}
              required
              size="small"
              type="email"
            />

            {/* PASSWORD */}
            <TextField
              label="Mật khẩu"
              value={form.Password}
              onChange={(e) => handleChange("Password", e.target.value)}
              error={!!errors.Password}
              helperText={errors.Password}
              type="password"
              size="small"
              required
            />

            {/* ĐIỆN THOẠI */}
            <TextField
              label="Điện thoại"
              value={form.DienThoai}
              onChange={(e) => handleChange("DienThoai", e.target.value)}
              placeholder="Số điện thoại"
              size="small"
            />

            {/* ĐỊA CHỈ */}
            <TextField
              label="Địa chỉ"
              value={form.DiaChi}
              onChange={(e) => handleChange("DiaChi", e.target.value)}
              placeholder="Địa chỉ"
              size="small"
            />

            {/* VAI TRÒ */}
            <TextField
              select
              label="Vai trò"
              value={form.ChucVu}
              onChange={(e) => handleChange("ChucVu", e.target.value)}
              size="small"
            >
              <MenuItem value="Sở hữu">Sở hữu (Admin)</MenuItem>
              <MenuItem value="Quản lý">Quản lý</MenuItem>
              <MenuItem value="Thành viên">Thành viên</MenuItem>
            </TextField>

            {/* QUYỀN SỬ DỤNG */}
            <TextField
              select
              label="Quyền sử dụng"
              value={form.quyenSuDung}
              onChange={(e) => handleChange("quyenSuDung", e.target.value)}
              size="small"
              disabled={loadingQuyens}
            >
              <MenuItem value="">-- Chọn quyền sử dụng --</MenuItem>
              {quyens.map((quyen) => (
                <MenuItem key={quyen._id} value={quyen._id}>
                  {quyen.ten}
                </MenuItem>
              ))}
            </TextField>

            {/* GIỚI THIỆU */}
            <TextField
              label="Giới thiệu"
              value={form.GioiThieu}
              onChange={(e) => handleChange("GioiThieu", e.target.value)}
              placeholder="Giới thiệu bản thân"
              multiline
              rows={3}
              fullWidth
            />

            {/* BỊ KHOÁ */}
            <TextField
              select
              label="Trạng thái"
              value={form.Status}
              onChange={(e) => handleChange("Status", Number(e.target.value))}
              size="small"
              fullWidth
            >
              <MenuItem value={1}>Hoạt động</MenuItem>
              <MenuItem value={0}>Bị khoá</MenuItem>
            </TextField>
          </div>

          {/* ACTION */}
          <div className="flex justify-end mt-6 gap-3">
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
