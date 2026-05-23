import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import PaymentsIcon from "@mui/icons-material/Payments";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // 🔥 Thêm icon lịch cho ngày công
import { useDispatch } from "react-redux";
import {
  createNhanVien,
  updateNhanVien,
} from "../../redux/slices/nhanVienSlice";

const initialState = {
  hoVaTen: "",
  cccd: "",
  diaChi: "",
  soDienThoai: "",
  email: "",
  chucVu: "",
  luongCanBan: 0,
  ngayCongThang: 28, // 🔥 Thiết lập mặc định 28 ngày công cho nhân viên mới
  trangThai: "Đang làm",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    background: "#fff",
    fontSize: 14,
    "&:hover fieldset": { borderColor: "#93c5fd" },
    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: 2 },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
};

const NhanVienFormModal = ({ open, onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(
      initialData
        ? {
            hoVaTen: initialData.hoVaTen || "",
            cccd: initialData.cccd || "",
            diaChi: initialData.diaChi || "",
            soDienThoai: initialData.soDienThoai || "",
            email: initialData.email || "",
            chucVu: initialData.chucVu || "",
            luongCanBan: initialData.luongCanBan || 0,
            ngayCongThang: initialData.ngayCongThang || 28, // 🔥 Nhận dữ liệu cũ hoặc fallback về 28
            trangThai: initialData.trangThai || "Đang làm",
          }
        : initialState
    );
  }, [initialData, open]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    if (!formData.hoVaTen) {
      alert("Vui lòng nhập họ tên");
      return false;
    }
    if (!formData.cccd) {
      alert("Vui lòng nhập CCCD");
      return false;
    }
    // Thêm kiểm tra hợp lệ ngày công nếu cần
    if (formData.ngayCongThang < 0 || formData.ngayCongThang > 31) {
      alert("Ngày công tháng không hợp lệ (Từ 0 đến 31 ngày)");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      // Đồng bộ kiểu dữ liệu Number trước khi đẩy lên API/Redux
      const submitData = {
        ...formData,
        luongCanBan: Number(formData.luongCanBan),
        ngayCongThang: Number(formData.ngayCongThang),
      };

      if (initialData?._id) {
        await dispatch(
          updateNhanVien({ id: initialData._id, data: submitData })
        ).unwrap();
        alert("Cập nhật nhân viên thành công");
      } else {
        await dispatch(createNhanVien(submitData)).unwrap();
        alert("Tạo nhân viên thành công");
      }
      onClose();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
        },
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg,#2563eb,#3b82f6)",
        }}
      >
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            {isEdit ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý thông tin nhân viên
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={
              isEdit
                ? {
                    background: "#1e3a5f",
                    color: "#93c5fd",
                    border: "1px solid #2563eb",
                  }
                : {
                    background: "#166534",
                    color: "#86efac",
                    border: "1px solid #166534",
                  }
            }
          >
            {isEdit ? "EDIT MODE" : "NEW"}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>

      {/* Body */}
      <DialogContent sx={{ background: "#f8fafc", py: 4, px: 4 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên *"
              size="small"
              value={formData.hoVaTen}
              onChange={(e) => handleChange("hoVaTen", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CCCD *"
              size="small"
              value={formData.cccd}
              onChange={(e) => handleChange("cccd", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              size="small"
              value={formData.soDienThoai}
              onChange={(e) => handleChange("soDienThoai", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              size="small"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Địa chỉ"
              size="small"
              value={formData.diaChi}
              onChange={(e) => handleChange("diaChi", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chức vụ"
              size="small"
              value={formData.chucVu}
              onChange={(e) => handleChange("chucVu", e.target.value)}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              size="small"
              value={formData.trangThai}
              onChange={(e) => handleChange("trangThai", e.target.value)}
              sx={fieldSx}
            >
              <MenuItem value="Đang làm">Đang làm</MenuItem>
              <MenuItem value="Nghỉ việc">Nghỉ việc</MenuItem>
            </TextField>
          </Grid>

          {/* Thay đổi layout hàng cuối từ xs={12} thành md={6} để đặt 2 cột cạnh nhau */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Lương cơ bản"
              size="small"
              value={formData.luongCanBan}
              onChange={(e) =>
                handleChange("luongCanBan", Number(e.target.value))
              }
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ fontSize: 18, color: "#10b981" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <span className="text-slate-400 text-xs">VNĐ</span>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* 🔥 Hàng Input mới cho thuộc tính ngayCongThang */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Ngày công tháng"
              size="small"
              value={formData.ngayCongThang}
              onChange={(e) =>
                handleChange("ngayCongThang", Number(e.target.value))
              }
              inputProps={{ min: 0, max: 31 }} // Giới hạn số ngày trong tháng tại UI
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon
                      sx={{ fontSize: 18, color: "#eab308" }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <span className="text-slate-400 text-xs">Ngày</span>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 px-5 py-4 bg-white border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{
            background: loading
              ? "#94a3b8"
              : "linear-gradient(135deg,#2563eb,#3b82f6)",
          }}
        >
          {loading && <CircularProgress size={14} sx={{ color: "#fff" }} />}
          {loading ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Lưu nhân viên"}
        </button>
      </div>
    </Dialog>
  );
};

export default NhanVienFormModal;
