import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchNhanVien,
  uploadCCCDNhanVien,
  deleteCCCDImage,
} from "../../redux/slices/nhanVienSlice";
import { CircularProgress } from "@mui/material";
import UploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import PaidIcon from "@mui/icons-material/Paid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"; // 🔥 Thêm icon lịch cho ngày công tháng
import { API_URL } from "../../config/api";
import { toast } from "sonner";

const InfoRow = ({ icon, label, value, highlight }) => (
  <div
    className="flex items-center justify-between py-3"
    style={{ borderBottom: "1px dashed #e2e8f0" }}
  >
    <div className="flex items-center gap-2.5 text-slate-500">
      {React.cloneElement(icon, { sx: { fontSize: 18, color: "#94a3b8" } })}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span
      className={`text-sm font-semibold ${
        highlight ? "text-blue-600" : "text-slate-700"
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const NhanVienDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.nhanVien);
  const { id } = useParams();
  const [selectedNhanVienId, setSelectedNhanVienId] = useState(id);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchNhanVien());
  }, [dispatch]);

  const danhSachNhanVien = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );
  const nhanVien = useMemo(
    () => danhSachNhanVien.find((nv) => nv._id === selectedNhanVienId),
    [danhSachNhanVien, selectedNhanVienId]
  );

  useEffect(() => {
    if (danhSachNhanVien.length > 0 && !selectedNhanVienId) {
      setSelectedNhanVienId(danhSachNhanVien[0]._id);
    }
  }, [danhSachNhanVien, selectedNhanVienId]);

  const handleUploadCCCD = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !nhanVien) return;
    try {
      setUploading(true);
      await dispatch(uploadCCCDNhanVien({ id: nhanVien._id, files })).unwrap();

      toast.success("Upload CCCD thành công");
    } catch (err) {
      toast.error(err || "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm("Xóa ảnh này?")) return;
    try {
      await dispatch(deleteCCCDImage({ id: nhanVien._id, imageUrl })).unwrap();
      toast.success("Đã xóa ảnh");
    } catch (err) {
      toast.error(err || "Xóa ảnh thất bại");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <CircularProgress thickness={4} size={44} sx={{ color: "#3b82f6" }} />
      </div>
    );

  if (!nhanVien)
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-slate-400 text-sm">
          Không tìm thấy thông tin nhân viên
        </div>
      </div>
    );

  const initial = nhanVien.hoVaTen ? nhanVien.hoVaTen.split(" ").pop()[0] : "N";
  const isActive = nhanVien.trangThai?.trim() === "Đang làm";

  const formatDateVN = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Kiểm tra nếu ngày tháng không hợp lệ
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ background: "#f1f5f9" }}>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowBackIcon sx={{ fontSize: 17 }} />
          Quay lại
        </button>

        {/* Hero card */}
        <div
          className="rounded-2xl overflow-hidden shadow"
          style={{
            background: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)",
          }}
        >
          <div className="px-8 py-7 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                boxShadow: "0 8px 20px rgba(59,130,246,0.4)",
              }}
            >
              {initial}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {nhanVien.hoVaTen}
                </h1>
                <span
                  className="self-center md:self-auto text-xs font-bold px-2.5 py-1 rounded-full"
                  style={
                    isActive
                      ? { background: "#166534", color: "#86efac" }
                      : { background: "#7f1d1d", color: "#fca5a5" }
                  }
                >
                  {nhanVien.trangThai || "Đang làm"}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 text-slate-400 text-sm">
                <WorkIcon sx={{ fontSize: 15 }} />
                <span>{nhanVien.chucVu || "Nhân viên"}</span>
              </div>

              {/* Badges thông tin nhanh */}
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {/* Lương cơ bản */}
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                  <PaidIcon sx={{ fontSize: 16, color: "#86efac" }} />
                  <span className="text-sm font-bold text-emerald-300">
                    Lương cơ bản:{" "}
                    {Number(nhanVien.luongCanBan || 0).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>

                {/* 🔥 Ngày công tháng hiển thị nhanh trên Hero Card */}
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                  <CalendarMonthIcon sx={{ fontSize: 16, color: "#fef08a" }} />
                  <span className="text-sm font-bold text-yellow-300">
                    Ngày công: {nhanVien.ngayCongThang ?? 28} ngày
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Thông tin cá nhân */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
              Thông tin cá nhân
            </h3>
            <InfoRow
              icon={<BadgeIcon />}
              label="Số CCCD"
              value={nhanVien.cccd}
            />
            <InfoRow
              icon={<PhoneIcon />}
              label="Số điện thoại"
              value={nhanVien.soDienThoai}
            />
            <InfoRow
              icon={<EmailIcon />}
              label="Email"
              value={nhanVien.email}
            />
            <InfoRow
              icon={<HomeIcon />}
              label="Địa chỉ"
              value={nhanVien.diaChi}
            />
            <InfoRow
              icon={<WorkIcon />}
              label="Chức vụ"
              value={nhanVien.chucVu}
            />
            <InfoRow
              icon={<PaidIcon />}
              label="Lương cơ bản"
              value={`${Number(nhanVien.luongCanBan || 0).toLocaleString(
                "vi-VN"
              )} đ`}
              highlight
            />
            {/* 🔥 Row hiển thị Ngày công tháng trong bảng chi tiết */}
            <InfoRow
              icon={<CalendarMonthIcon />}
              label="Ngày công mặc định / tháng"
              value={`${nhanVien.ngayCongThang ?? 28} ngày`}
            />

            <InfoRow
              icon={<CalendarMonthIcon />}
              label="Ngày tạo"
              value={formatDateVN(nhanVien.ngayTao)}
            />
          </div>

          {/* CCCD Images */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-emerald-500 inline-block" />
                Ảnh tài liệu CCCD
              </h3>

              <label
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all"
                style={{ background: uploading ? "#94a3b8" : "#3b82f6" }}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={13} sx={{ color: "#fff" }} /> Đang
                    tải...
                  </>
                ) : (
                  <>
                    <UploadIcon sx={{ fontSize: 15 }} /> Tải ảnh lên
                  </>
                )}
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadCCCD}
                />
              </label>
            </div>

            <div className="flex-1">
              {nhanVien.cccdImages?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {nhanVien.cccdImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden border border-slate-100 shadow-sm group"
                    >
                      <img
                        src={`${API_URL}${img}`}
                        alt={`CCCD ${index + 1}`}
                        style={{
                          width: "100%",
                          height: 160,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                      <button
                        onClick={() => handleDeleteImage(img)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <DeleteIcon sx={{ fontSize: 15, color: "#ef4444" }} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <UploadIcon sx={{ fontSize: 36, color: "#cbd5e1", mb: 1 }} />
                  <span className="text-sm text-slate-400 font-medium">
                    Chưa có ảnh CCCD
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhanVienDetail;
