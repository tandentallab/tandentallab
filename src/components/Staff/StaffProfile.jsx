import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { getAuthSelector } from "../../redux/selector";
import { updateStaff } from "../../redux/slices/staffSlice";
import { setUser } from "../../redux/slices/authSlice";

const StaffProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(getAuthSelector);

  const [staff, setStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setStaff({
        MSNV: user.MSNV || "",
        HoTenNV: user.HoTenNV || "",
        Email: user.Email || "",
        ChucVu: user.ChucVu || "",
        Status: user.Status,
        Permissions: user.Permissions || "",
        DienThoai: user.DienThoai || "",
        DiaChi: user.DiaChi || "",
        GioiThieu: user.GioiThieu || "",
        createdAt: user.createdAt || "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setStaff((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const result = await dispatch(
        updateStaff({ id: user._id, data: staff })
      ).unwrap();
      dispatch(setUser(result.staff || result));
      setSaveSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err || "Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset về dữ liệu gốc
    setStaff({
      MSNV: user.MSNV || "",
      HoTenNV: user.HoTenNV || "",
      Email: user.Email || "",
      ChucVu: user.ChucVu || "",
      Status: user.Status,
      Permissions: user.Permissions || "",
      DienThoai: user.DienThoai || "",
      DiaChi: user.DiaChi || "",
      GioiThieu: user.GioiThieu || "",
      createdAt: user.createdAt || "",
    });
    setIsEditing(false);
    setSaveError(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setAvatar(preview);
    }
  };

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl rounded-2xl shadow-md overflow-hidden">
        {/* HEADER */}
        <div className="h-28 bg-gradient-to-r from-blue-700 to-green-500 relative flex justify-center">
          {/* AVATAR */}
          <div className="absolute -bottom-14">
            <Avatar
              src={avatar || undefined}
              sx={{ width: 120, height: 120 }}
              className="border-4 border-white shadow-lg"
            >
              {staff.HoTenNV?.charAt(0)}
            </Avatar>

            {/* Upload button */}
            {isEditing && (
              <IconButton
                component="label"
                className="!absolute bottom-0 right-0 bg-white shadow"
              >
                <PhotoCamera fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </IconButton>
            )}
          </div>
        </div>

        <CardContent className="mt-16">
          {/* NAME */}
          <div className="text-center mb-4">
            <Typography variant="h5" className="font-semibold">
              {staff.HoTenNV}
            </Typography>

            <Typography className="text-gray-500">{staff.Email}</Typography>

            <div className="flex justify-center gap-2 mt-2">
              <Chip label={staff.ChucVu} color="primary" />
              <Chip
                label={staff.Status === 1 ? "Hoạt động" : "Ngưng"}
                color={staff.Status === 1 ? "success" : "default"}
                variant="outlined"
              />
            </div>
          </div>

          {saveError && (
            <Alert severity="error" className="mb-4">
              {saveError}
            </Alert>
          )}
          {saveSuccess && (
            <Alert severity="success" className="mb-4">
              Cập nhật thành công!
            </Alert>
          )}

          {/* FORM */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <TextField
              label="Mã nhân viên"
              value={staff.MSNV}
              fullWidth
              size="small"
              disabled
            />

            <TextField
              label="Chức vụ"
              value={staff.ChucVu}
              fullWidth
              size="small"
              disabled
            />

            <TextField
              label="Ngày tạo"
              value={
                staff.createdAt
                  ? new Date(staff.createdAt).toLocaleDateString("vi-VN")
                  : ""
              }
              fullWidth
              size="small"
              disabled
            />

            <TextField
              label="Số điện thoại"
              value={staff.DienThoai}
              onChange={(e) => handleChange("DienThoai", e.target.value)}
              fullWidth
              size="small"
              disabled={!isEditing}
            />

            <TextField
              label="Họ và tên"
              value={staff.HoTenNV}
              onChange={(e) => handleChange("HoTenNV", e.target.value)}
              fullWidth
              size="small"
              disabled={!isEditing}
            />

            <TextField
              label="Email"
              value={staff.Email}
              onChange={(e) => handleChange("Email", e.target.value)}
              fullWidth
              size="small"
              disabled={!isEditing}
            />

            <TextField
              label="Địa chỉ"
              value={staff.DiaChi}
              onChange={(e) => handleChange("DiaChi", e.target.value)}
              fullWidth
              size="small"
              disabled={!isEditing}
              className="col-span-2"
            />

            <TextField
              label="Giới thiệu"
              value={staff.GioiThieu}
              onChange={(e) => handleChange("GioiThieu", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={3}
              disabled={!isEditing}
              className="col-span-2"
            />
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-8 gap-3">
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : null}
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
              </>
            ) : (
              <Button variant="outlined" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfile;

