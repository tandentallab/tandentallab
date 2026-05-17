import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchNhanVien,
  uploadCCCDNhanVien,
  deleteCCCDImage,
} from "../../redux/slices/nhanVienSlice";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Avatar,
  Divider,
} from "@mui/material";

// Thay thế đoạn import icon cũ bằng đoạn này:
import UploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete"; // Đổi từ DeleteOutline thành Delete
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work"; // Đổi từ WorkOutline thành Work
import PaidIcon from "@mui/icons-material/Paid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { API_URL } from "../../config/api";

const NhanVienDetail = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.nhanVien);
  const { id } = useParams();

  const [selectedNhanVienId, setSelectedNhanVienId] = useState(id);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchNhanVien());
  }, [dispatch]);

  const danhSachNhanVien = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const nhanVien = useMemo(() => {
    return danhSachNhanVien.find((nv) => nv._id === selectedNhanVienId);
  }, [danhSachNhanVien, selectedNhanVienId]);

  useEffect(() => {
    if (danhSachNhanVien.length > 0 && !selectedNhanVienId) {
      setSelectedNhanVienId(danhSachNhanVien[0]._id);
    }
  }, [danhSachNhanVien, selectedNhanVienId]);

  // ================= UPLOAD =================
  const handleUploadCCCD = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !nhanVien) return;

    try {
      setUploading(true);
      await dispatch(
        uploadCCCDNhanVien({
          id: nhanVien._id,
          files,
        })
      ).unwrap();
      alert("Upload CCCD thành công");
    } catch (err) {
      console.log(err);
      alert(err || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  // ================= DELETE =================
  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("Xóa ảnh này?")) return;

    try {
      await dispatch(
        deleteCCCDImage({
          id: nhanVien._id,
          imageUrl,
        })
      ).unwrap();
      alert("Đã xóa ảnh");
    } catch (err) {
      console.log(err);
      alert(err || "Xóa ảnh thất bại");
    }
  };

  if (loading) {
    return (
      <Box className="p-10 flex justify-center items-center min-h-[50vh]">
        <CircularProgress thickness={4} size={48} sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  if (!nhanVien) {
    return (
      <Box className="p-6 max-w-4xl mx-auto text-center">
        <Paper
          sx={{
            p: 6,
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy thông tin nhân viên
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Lấy chữ cái đầu của tên để làm Avatar khi không có ảnh đại diện riêng biệt
  const initialName = nhanVien.hoVaTen
    ? nhanVien.hoVaTen.split(" ").pop()[0]
    : "N";

  return (
    <Box className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
      <Box className="max-w-6xl mx-auto space-y-6">
        {/* PROFILE HEADER CARD */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            background: "linear-gradient(to right, #ffffff, #f8fafc)",
          }}
        >
          <Box className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: "2.5rem",
                fontWeight: 700,
                bgcolor: "#3b82f6",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
              }}
            >
              {initialName}
            </Avatar>

            <Box className="space-y-2 flex-1">
              <Box className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <Typography variant="h4" fontWeight={800} color="#1e293b">
                  {nhanVien.hoVaTen}
                </Typography>
                <Chip
                  label={nhanVien.trangThai || "Đang làm việc"}
                  color="success"
                  variant="soft"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "#e6f4ea",
                    color: "#137333",
                    alignSelf: { xs: "center", md: "flex-start" },
                  }}
                />
              </Box>
              <Typography
                variant="body1"
                color="text.secondary"
                className="flex items-center justify-center md:justify-start gap-1"
              >
                <WorkIcon fontSize="small" /> {nhanVien.chucVu || "Nhân viên"}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* MAIN BODY CONTENTS */}
        <Grid container spacing={4}>
          {/* THÔNG TIN CHI TIẾT */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                height: "100%",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="#1e293b" mb={3}>
                Thông tin cá nhân
              </Typography>

              <Box className="space-y-4">
                <InfoItem
                  icon={<BadgeIcon />}
                  label="Số CCCD"
                  value={nhanVien.cccd}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <InfoItem
                  icon={<PhoneIcon />}
                  label="Số điện thoại"
                  value={nhanVien.soDienThoai || "-"}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <InfoItem
                  icon={<EmailIcon />}
                  label="Email"
                  value={nhanVien.email || "-"}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <InfoItem
                  icon={<HomeIcon />}
                  label="Địa chỉ"
                  value={nhanVien.diaChi || "-"}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <InfoItem
                  icon={<WorkIcon />}
                  label="Chức vụ"
                  value={nhanVien.chucVu || "-"}
                />
                <Divider sx={{ borderStyle: "dashed" }} />

                <InfoItem
                  icon={<PaidIcon />}
                  label="Lương cơ bản"
                  value={`${Number(nhanVien.luongCanBan || 0).toLocaleString(
                    "vi-VN"
                  )} đ`}
                  highlight
                />
              </Box>
            </Paper>
          </Grid>

          {/* QUẢN LÝ ẢNH CCCD */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box className="flex items-center justify-between mb-4">
                <Typography variant="h6" fontWeight={700} color="#1e293b">
                  Ảnh tài liệu CCCD
                </Typography>

                <Button
                  component="label"
                  variant="contained"
                  disableElevation
                  startIcon={uploading ? null : <UploadIcon />}
                  disabled={uploading}
                  sx={{
                    mx: 4,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    bgcolor: "#3b82f6",
                    "&:hover": { bgcolor: "#2563eb" },
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Tải ảnh lên"
                  )}
                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleUploadCCCD}
                  />
                </Button>
              </Box>

              <Box className="flex-1">
                {nhanVien.cccdImages?.length > 0 ? (
                  <Grid container spacing={2} className="mt-2">
                    {nhanVien.cccdImages.map((img, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 3,
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                            transition: "transform 0.2s",
                            "&:hover": { transform: "scale(1.02)" },
                          }}
                        >
                          <img
                            src={`${API_URL}${img}`}
                            alt={`CCCD Mặt ${index + 1}`}
                            style={{
                              width: "100%",
                              height: 180,
                              objectFit: "cover",
                            }}
                          />

                          <IconButton
                            onClick={() => handleDeleteImage(img)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background: "rgba(255, 255, 255, 0.85)",
                              backdropFilter: "blur(4px)",
                              "&:hover": {
                                background: "rgba(254, 226, 226, 1)",
                                color: "#dc2626",
                              },
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 20 }} color="error" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box
                    className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl"
                    sx={{ height: 250, mt: 2, bgcolor: "#f8fafc" }}
                  >
                    <UploadIcon
                      sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      Chưa có dữ liệu hình ảnh bản ghi này
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

/* COMPONENT CON HIỂN THỊ DÒNG THÔNG TIN MỚI */
const InfoItem = ({ icon, label, value, highlight = false }) => {
  return (
    <Box className="flex items-center justify-between py-1">
      <Box className="flex items-center gap-3 text-slate-500">
        {React.cloneElement(icon, { sx: { fontSize: 20, color: "#64748b" } })}
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        fontWeight={highlight ? 700 : 600}
        color={highlight ? "#2563eb" : "#1e293b"}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default NhanVienDetail;
