import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Typography,
  Drawer,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StaffModal from "./StaffModal";
import { api } from "../../config/api";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaff,
  deleteStaff,
  updateStaff,
} from "../../redux/slices/staffSlice";

export default function StaffTable() {
  const dispatch = useDispatch();

  const { data, loading, error } = useSelector((state) => state.staff);
  const { user } = useSelector((state) => state.auth);

  // Kiểm tra xem user là Admin không
  const isAdmin = user?.ChucVu === "Sở hữu";

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  /* ================= HANDLE DELETE ================= */
  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteStaff(selectedId)).unwrap();
      setOpenDelete(false);
      setSelectedId(null);
      // Refetch dữ liệu sau khi xóa
      dispatch(fetchStaff());
    } catch (err) {
      console.log("Lỗi:", err);
    }
  };

  /* ================= HANDLE EDIT ================= */
  const handleEditClick = (id) => {
    setEditingId(id);
    setShowEditModal(true);
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  /* ================= GET STATUS TEXT ================= */
  const getStatusText = (status) => {
    return status === 1 ? "Hoạt động" : "Bị khoá";
  };

  const getStatusColor = (status) => {
    return status === 1 ? "success" : "error";
  };

  /* ================= GET ROLE COLOR ================= */
  const getRoleColor = (role) => {
    switch (role) {
      case "Sở hữu":
        return "error";
      case "Quản lý":
        return "warning";
      case "Thành viên":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <>
      <TableContainer component={Paper} className="rounded-2xl shadow-lg">
        <Table>
          {/* HEADER */}
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell>
                <b>Mã (Code)</b>
              </TableCell>
              <TableCell>
                <b>Tên</b>
              </TableCell>
              <TableCell>
                <b>Email</b>
              </TableCell>
              <TableCell>
                <b>Điện thoại</b>
              </TableCell>
              <TableCell>
                <b>Vai trò</b>
              </TableCell>
              <TableCell>
                <b>Quyền sử dụng</b>
              </TableCell>
              <TableCell>
                <b>Trạng thái</b>
              </TableCell>
              <TableCell>
                <b>Ngày tạo</b>
              </TableCell>
              {isAdmin && (
                <TableCell align="center">
                  <b>Hành động</b>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          {/* BODY */}
          <TableBody>
            {/* 🔥 LOADING */}
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {/* ❌ ERROR */}
            {error && (
              <TableRow>
                <TableCell colSpan={9} align="center" className="text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {/* 📭 EMPTY */}
            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}

            {/* ✅ DATA */}
            {!loading &&
              data.map((item) => (
                <TableRow 
                  key={item._id} 
                  hover
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEditClick(item._id)}
                >
                  <TableCell>{item.MSNV || "-"}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{item.HoTenNV}</div>
                  </TableCell>
                  <TableCell>{item.Email}</TableCell>
                  <TableCell>{item.DienThoai || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.ChucVu}
                      color={getRoleColor(item.ChucVu)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.quyenSuDung?.ten || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(item.Status)}
                      color={getStatusColor(item.Status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  {isAdmin && (
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(item._id)}
                        title="Xóa"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOG XÓA */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>Bạn chắc chắn muốn xóa nhân viên này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL CHỈNH SỬA */}
      {showEditModal && (
        <StaffEditModal
          staffId={editingId}
          onClose={() => {
            setShowEditModal(false);
            setEditingId(null);
          }}
        />
      )}
    </>
  );
}

// Modal chỉnh sửa
function StaffEditModal({ staffId, onClose }) {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.staff);
  const [loading, setLoading] = React.useState(false);
  const [loadingQuyens, setLoadingQuyens] = React.useState(false);
  const [quyens, setQuyens] = React.useState([]);

  const [open, setOpen] = React.useState(true);

  const staff = data.find((s) => s._id === staffId);
  
  console.log("🔵 Staff object từ Redux:", staff);

  const [form, setForm] = React.useState({
    MSNV: staff?.MSNV || "",
    HoTenNV: staff?.HoTenNV || "",
    Email: staff?.Email || "",
    ChucVu: staff?.ChucVu || "Thành viên",
    quyenSuDung: staff?.quyenSuDung?._id || staff?.quyenSuDung || "",
    DienThoai: staff?.DienThoai || "",
    DiaChi: staff?.DiaChi || "",
    GioiThieu: staff?.GioiThieu || "",
    Status: staff?.Status !== undefined ? staff.Status : 1,
  });
  
  console.log("🔵 Form state initialized:", form);

  const [errors, setErrors] = React.useState({});

  // 📌 Fetch Quyền sử dụng
  React.useEffect(() => {
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

  // 📌 Update form khi staff object thay đổi
  React.useEffect(() => {
    if (staff) {
      console.log("🔄 Updating form from staff object:", staff);
      setForm({
        MSNV: staff.MSNV || "",
        HoTenNV: staff.HoTenNV || "",
        Email: staff.Email || "",
        ChucVu: staff.ChucVu || "Thành viên",
        quyenSuDung: staff.quyenSuDung?._id || staff.quyenSuDung || "",
        DienThoai: staff.DienThoai || "",
        DiaChi: staff.DiaChi || "",
        GioiThieu: staff.GioiThieu || "",
        Status: staff.Status !== undefined ? staff.Status : 1,
      });
    }
  }, [staff]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.HoTenNV || !form.HoTenNV.trim()) {
      newErrors.HoTenNV = "Tên nhân viên là bắt buộc";
    }

    if (!form.Email || !form.Email.trim()) {
      newErrors.Email = "Email là bắt buộc";
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.Email)) {
      newErrors.Email = "Email không hợp lệ";
    }

    console.log("🔍 Validation result:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleSubmit = async () => {
    console.log("🔵 Form data:", form);
    
    if (!validateForm()) {
      console.log("❌ Validation failed:", errors);
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Gửi update request:", { id: staffId, data: form });
      
      const result = await dispatch(updateStaff({ id: staffId, data: form })).unwrap();
      console.log("✅ Cập nhật thành công:", result);

      // Refetch dữ liệu sau khi update thành công
      await dispatch(fetchStaff());
      console.log("✅ Refetch dữ liệu thành công");

      setOpen(false);
      onClose();
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Lỗi cập nhật nhân viên";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
      <Drawer
      anchor="right"
      open={open}
      onClose={() => {
        setOpen(false);
        onClose();
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        "& .MuiDrawer-paper": {
          width: 384,
          top: "66px",
          height: "calc(100% - 66px)",
        },
      }}
    >
      <div className="w-96 flex flex-col h-full">
        {/* HEADER */}
        <div className="bg-[#0091ea] px-4 py-3 text-white flex items-center gap-3 shrink-0">
          <IconButton
            size="small"
            onClick={() => {
              setOpen(false);
              onClose();
            }}
            className="text-white hover:bg-blue-600"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="font-medium text-[16px]">
            Chỉnh Sửa Nhân Viên
          </Typography>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {/* ❌ ERROR MESSAGE */}
            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Mã nhân viên</label>
                <input
                  type="text"
                  placeholder="Mã nhân viên (Code)"
                  value={form.MSNV}
                  onChange={(e) => handleChange("MSNV", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tên nhân viên *</label>
                <input
                  type="text"
                  placeholder="Tên nhân viên"
                  value={form.HoTenNV}
                  onChange={(e) => handleChange("HoTenNV", e.target.value)}
                  className={`border rounded px-3 py-2 w-full text-sm ${errors.HoTenNV ? "border-red-500" : ""}`}
                />
                {errors.HoTenNV && <span className="text-red-500 text-xs">{errors.HoTenNV}</span>}
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.Email}
                  onChange={(e) => handleChange("Email", e.target.value)}
                  className={`border rounded px-3 py-2 w-full text-sm ${errors.Email ? "border-red-500" : ""}`}
                />
                {errors.Email && <span className="text-red-500 text-xs">{errors.Email}</span>}
              </div>

              <div>
                <label className="text-sm font-medium">Điện thoại</label>
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={form.DienThoai}
                  onChange={(e) => handleChange("DienThoai", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Địa chỉ</label>
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={form.DiaChi}
                  onChange={(e) => handleChange("DiaChi", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Giới thiệu</label>
                <textarea
                  placeholder="Giới thiệu bản thân"
                  value={form.GioiThieu}
                  onChange={(e) => handleChange("GioiThieu", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                  rows="3"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Vai trò</label>
                <select
                  value={form.ChucVu}
                  onChange={(e) => handleChange("ChucVu", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                >
                  <option value="Sở hữu">Sở hữu (Admin)</option>
                  <option value="Quản lý">Quản lý</option>
                  <option value="Thành viên">Thành viên</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Quyền sử dụng</label>
                <select
                  value={form.quyenSuDung}
                  onChange={(e) => handleChange("quyenSuDung", e.target.value)}
                  className="border rounded px-3 py-2 w-full text-sm"
                  disabled={loadingQuyens}
                >
                  <option value="">-- Chọn quyền sử dụng --</option>
                  {quyens.map((quyen) => (
                    <option key={quyen._id} value={quyen._id}>
                      {quyen.ten}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                  value={form.Status}
                  onChange={(e) => handleChange("Status", parseInt(e.target.value))}
                  className="border rounded px-3 py-2 w-full text-sm"
                >
                  <option value="1">Hoạt động</option>
                  <option value="0">Bị khoá</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - ACTION BUTTONS */}
        <div className="border-t px-4 py-3 flex gap-2 shrink-0 bg-gray-50">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpen(false);
              onClose();
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Lưu"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
