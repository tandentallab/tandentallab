import React, { useState, useEffect } from "react";
import { api } from "../../config/api";
import { CircularProgress, Button } from "@mui/material";

export default function CongTyPage() {
  const [company, setCompany] = useState({
    Ten: "",
    GioiThieu: "",
    Website: "",
    Email: "",
    DienThoai: "",
    DiaChi: "",
    Avatar: "",
  });

  const [editMode, setEditMode] = useState({
    Ten: false,
    GioiThieu: false,
    Website: false,
    Email: false,
    DienThoai: false,
    DiaChi: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch company info
  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cong-ty");
      console.log("📥 Company data:", response.data.data);
      setCompany(response.data.data);
    } catch (error) {
      console.error("❌ Lỗi tải thông tin công ty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put("/cong-ty", company);
      console.log("✅ Lưu thành công:", response.data);
      setCompany(response.data.data);
      
      // Đóng tất cả edit mode
      Object.keys(editMode).forEach(key => setEditMode(prev => ({ ...prev, [key]: false })));
      
      alert("Cập nhật thông tin công ty thành công!");
    } catch (error) {
      console.error("❌ Lỗi lưu:", error);
      alert("Lỗi cập nhật thông tin công ty!");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("Avatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEditMode = (field) => {
    setEditMode((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 bg-white rounded-2xl shadow-lg">
      {/* LOGO/AVATAR */}
      <div className="flex flex-col items-center mb-8 pb-8 border-b">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
          {company.Avatar ? (
            <img src={company.Avatar} alt="Company Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="text-4xl text-gray-400">🏢</div>
          )}
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <span className="text-blue-500 hover:text-blue-700 text-sm font-medium">
            Tải lên ảnh đại diện
          </span>
        </label>
      </div>

      {/* COMPANY NAME */}
      <div className="mb-6 pb-6 border-b">
        <label className="text-xs font-bold text-gray-500 uppercase">Công ty *</label>
        {editMode.Ten ? (
          <input
            type="text"
            value={company.Ten}
            onChange={(e) => handleChange("Ten", e.target.value)}
            className="w-full text-2xl font-bold border-b-2 border-blue-500 px-0 py-2 focus:outline-none"
            autoFocus
          />
        ) : (
          <h1
            className="text-2xl font-bold text-gray-800 py-2 cursor-pointer hover:text-blue-500 min-h-10"
            onClick={() => toggleEditMode("Ten")}
          >
            {company.Ten}
          </h1>
        )}
      </div>

      {/* DESCRIPTION */}
      <div className="mb-6 pb-6 border-b">
        <label className="text-xs font-bold text-gray-500 uppercase">Giới thiệu</label>
        {editMode.GioiThieu ? (
          <textarea
            value={company.GioiThieu}
            onChange={(e) => handleChange("GioiThieu", e.target.value)}
            className="w-full border-b-2 border-blue-500 px-0 py-2 focus:outline-none"
            rows="3"
            autoFocus
          />
        ) : (
          <p
            className="text-gray-700 py-2 cursor-pointer hover:text-blue-500 min-h-12 whitespace-pre-wrap"
            onClick={() => toggleEditMode("GioiThieu")}
          >
            {company.GioiThieu}
          </p>
        )}
      </div>

      {/* WEBSITE, EMAIL, PHONE */}
      <div className="mb-6 pb-6 border-b grid grid-cols-3 gap-6">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
          {editMode.Website ? (
            <input
              type="url"
              value={company.Website}
              onChange={(e) => handleChange("Website", e.target.value)}
              className="w-full border-b-2 border-blue-500 px-0 py-2 focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <p
              className="text-blue-600 hover:underline py-2 cursor-pointer text-sm min-h-6"
              onClick={() => toggleEditMode("Website")}
            >
              {company.Website}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
          {editMode.Email ? (
            <input
              type="email"
              value={company.Email}
              onChange={(e) => handleChange("Email", e.target.value)}
              className="w-full border-b-2 border-blue-500 px-0 py-2 focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <p
              className="text-gray-700 py-2 cursor-pointer hover:text-blue-500 text-sm min-h-6"
              onClick={() => toggleEditMode("Email")}
            >
              {company.Email}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Điện thoại</label>
          {editMode.DienThoai ? (
            <input
              type="tel"
              value={company.DienThoai}
              onChange={(e) => handleChange("DienThoai", e.target.value)}
              className="w-full border-b-2 border-blue-500 px-0 py-2 focus:outline-none text-sm"
              autoFocus
            />
          ) : (
            <p
              className="text-gray-700 py-2 cursor-pointer hover:text-blue-500 text-sm min-h-6"
              onClick={() => toggleEditMode("DienThoai")}
            >
              {company.DienThoai}
            </p>
          )}
        </div>
      </div>

      {/* ADDRESS */}
      <div className="mb-8 pb-8 border-b">
        <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ</label>
        {editMode.DiaChi ? (
          <textarea
            value={company.DiaChi}
            onChange={(e) => handleChange("DiaChi", e.target.value)}
            className="w-full border-b-2 border-blue-500 px-0 py-2 focus:outline-none"
            rows="3"
            autoFocus
          />
        ) : (
          <p
            className="text-gray-700 py-2 cursor-pointer hover:text-blue-500 min-h-12 whitespace-pre-wrap"
            onClick={() => toggleEditMode("DiaChi")}
          >
            {company.DiaChi}
          </p>
        )}
      </div>

      {/* SAVE BUTTON */}
      <div className="flex gap-3 justify-center pt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
          className="px-8"
        >
          {saving ? <CircularProgress size={20} /> : "Lưu"}
        </Button>
      </div>

      {/* METADATA */}
      <div className="text-xs text-gray-400 mt-6 text-center">
        Được tạo bởi Administrator
        {company.createdAt && ` lúc ${new Date(company.createdAt).toLocaleString("vi-VN")}`}
      </div>
    </div>
  );
}
