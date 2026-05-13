import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
  Divider,
  InputAdornment,
  Box,
  Chip,
} from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import PaymentsIcon from "@mui/icons-material/Payments";
import PersonIcon from "@mui/icons-material/Person";

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
  trangThai: "Đang làm",
};

const NhanVienFormModal = ({ open, onClose, initialData = null }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(initialState);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        hoVaTen: initialData.hoVaTen || "",

        cccd: initialData.cccd || "",

        diaChi: initialData.diaChi || "",

        soDienThoai: initialData.soDienThoai || "",

        email: initialData.email || "",

        chucVu: initialData.chucVu || "",

        luongCanBan: initialData.luongCanBan || 0,

        trangThai: initialData.trangThai || "Đang làm",
      });
    } else {
      setFormData(initialState);
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!formData.hoVaTen) {
      alert("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.cccd) {
      alert("Vui lòng nhập CCCD");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      if (initialData?._id) {
        await dispatch(
          updateNhanVien({
            id: initialData._id,
            data: formData,
          })
        ).unwrap();

        alert("Cập nhật nhân viên thành công");
      } else {
        await dispatch(
          createNhanVien({
            ...formData,
            luongCanBan: Number(formData.luongCanBan),
          })
        ).unwrap();

        alert("Tạo nhân viên thành công");
      }

      onClose();
    } catch (err) {
      console.log(err);

      alert(err);
    } finally {
      setLoading(false);
    }
  };

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
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "#fff",
          py: 3,
        }}
      >
        <Box className="flex items-center justify-between">
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {initialData ? "Cập nhật nhân viên" : "Thêm nhân viên"}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                mt: 0.5,
              }}
            >
              Quản lý thông tin nhân viên
            </Typography>
          </Box>

          <Chip
            label={initialData ? "EDIT MODE" : "NEW"}
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 600,
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          mt: 2,
          py: 4,
          px: 4,
          backgroundColor: "#f8fafc",
        }}
      >
        <Grid container spacing={3}>
          {/* HỌ TÊN */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Họ và tên"
              value={formData.hoVaTen}
              onChange={(e) => handleChange("hoVaTen", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* CCCD */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="CCCD"
              value={formData.cccd}
              onChange={(e) => handleChange("cccd", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* SĐT */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={formData.soDienThoai}
              onChange={(e) => handleChange("soDienThoai", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* EMAIL */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* ĐỊA CHỈ */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Địa chỉ"
              value={formData.diaChi}
              onChange={(e) => handleChange("diaChi", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* CHỨC VỤ */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Chức vụ"
              value={formData.chucVu}
              onChange={(e) => handleChange("chucVu", e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* TRẠNG THÁI */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={formData.trangThai}
              onChange={(e) => handleChange("trangThai", e.target.value)}
            >
              <MenuItem value="Đang làm">Đang làm</MenuItem>

              <MenuItem value="Nghỉ việc">Nghỉ việc</MenuItem>
            </TextField>
          </Grid>

          {/* LƯƠNG */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="number"
              label="Lương cơ bản"
              value={formData.luongCanBan}
              onChange={(e) =>
                handleChange("luongCanBan", Number(e.target.value))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon color="success" />
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">VNĐ</InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "#fff",
        }}
      >
        <Button
          color="inherit"
          onClick={onClose}
          sx={{
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: 2,
          }}
        >
          {loading
            ? "Đang xử lý..."
            : initialData
            ? "Cập nhật"
            : "Lưu nhân viên"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NhanVienFormModal;
