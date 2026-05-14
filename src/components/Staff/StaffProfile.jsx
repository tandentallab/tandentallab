import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  TextField,
  Button,
  Avatar,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

const StaffProfile = () => {
  const [staff, setStaff] = useState({
    MSNV: "admin5",
    HoTenNV: "Lâm Hoàng Quân",
    Email: "admin@gmail.com",
    quyenSuDung: "admin",
    Status: 1,
    Permissions: "",
    createdAt: "2026-04-27T12:09:42.431Z",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=12");

  const handleChange = (field, value) => {
    setStaff({ ...staff, [field]: value });
  };

  const handleSave = () => {
    console.log("DATA SAVE:", staff);
    console.log("AVATAR:", avatar);
    setIsEditing(false);
  };

  // 👉 xử lý chọn ảnh
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setAvatar(preview);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl rounded-2xl shadow-md overflow-hidden">
        {/* HEADER */}
        <div className="h-28 bg-gradient-to-r from-blue-700 to-green-500 relative flex justify-center">
          {/* AVATAR */}
          <div className="absolute -bottom-14">
            <Avatar
              sx={{ width: 120, height: 120 }}
              className="border-4 border-white shadow-lg"
            />

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
              <Chip label={`Quyền: ${staff.quyenSuDung || "-"}`} color="primary" />
              <Chip
                label={staff.Status === 1 ? "Hoạt động" : "Ngưng"}
                color="success"
                variant="outlined"
              />
            </div>
          </div>

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
              label="Quyền sử dụng"
              value={staff.quyenSuDung}
              onChange={(e) => handleChange("quyenSuDung", e.target.value)}
              fullWidth
              size="small"
              disabled={!isEditing}
            />

            <TextField
              label="Ngày tạo"
              value={new Date(staff.createdAt).toLocaleDateString("vi-VN")}
              fullWidth
              size="small"
              disabled
            />

            <TextField
              label="Permissions"
              value={staff.Permissions}
              onChange={(e) => handleChange("Permissions", e.target.value)}
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
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-8 gap-3">
            {isEditing ? (
              <>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Lưu
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
