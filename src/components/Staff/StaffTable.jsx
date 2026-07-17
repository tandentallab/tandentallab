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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  InputAdornment,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaff,
  deleteStaff,
  updateStaff,
} from "../../redux/slices/staffSlice";

import { APP_ROLES, resolveAppRoleFromUser } from "../../config/permissions";



import { api } from "../../config/api";

/* ================= MAIN TABLE ================= */
export default function StaffTable() {
  const dispatch = useDispatch();

  const {
    data = [],
    loading = false,
    error = null,
  } = useSelector((state) => state.staff);

  const { user } = useSelector((state) => state.auth);

  const isAdmin = resolveAppRoleFromUser(user) === APP_ROLES.ADMIN;

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteStaff(selectedId)).unwrap();
      setOpenDelete(false);
      setSelectedId(null);
      dispatch(fetchStaff());
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (id) => {
    setEditingId(id);
    setShowEditModal(true);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "-";

  const getStatusText = (status) => (status === 1 ? "Hoạt động" : "Bị khoá");

  const getStatusColor = (status) => (status === 1 ? "success" : "error");

  return (
    <>
      {/* DESKTOP TABLE */}
      <TableContainer component={Paper} className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <b>Mã</b>
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
                <b>Quyền</b>
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

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {error && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              data.map((item) => (
                <TableRow
                  key={item._id}
                  hover
                  onClick={() => handleEditClick(item._id)}
                >
                  <TableCell>{item.MSNV || "-"}</TableCell>
                  <TableCell>{item.HoTenNV}</TableCell>
                  <TableCell>{item.Email}</TableCell>
                  <TableCell>{item.DienThoai || "-"}</TableCell>
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
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(item._id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {loading && (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        )}

        {error && (
          <Typography color="error" className="text-center py-4">
            {error}
          </Typography>
        )}

        {!loading && data.length === 0 && (
          <Typography className="text-center py-4 text-gray-500">
            Không có dữ liệu
          </Typography>
        )}

        {!loading &&
          data.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditClick(item._id)}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{item.HoTenNV}</h3>
                  <p className="text-xs text-gray-500">{item.MSNV || "-"}</p>
                </div>
                <Chip
                  label={getStatusText(item.Status)}
                  color={getStatusColor(item.Status)}
                  size="small"
                />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-700 mb-3">
                <div>
                  <span className="font-semibold">Email:</span> {item.Email}
                </div>
                <div>
                  <span className="font-semibold">Điện thoại:</span>{" "}
                  {item.DienThoai || "-"}
                </div>
                <div>
                  <span className="font-semibold">Quyền:</span>{" "}
                  {item.quyenSuDung?.ten || "-"}
                </div>
                <div>
                  <span className="font-semibold">Ngày tạo:</span>{" "}
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* Actions */}
              {isAdmin && (
                <div className="pt-2 border-t border-gray-100">
                  <IconButton
                    fullWidth
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(item._id);
                    }}
                  >
                    <DeleteIcon fontSize="small" /> Xóa
                  </IconButton>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* DELETE DIALOG */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xóa nhân viên</DialogTitle>
        <DialogContent>Xác nhận xóa nhân viên này?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DRAWER */}
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

/* ================= EDIT MODAL ================= */
function StaffEditModal({ staffId, onClose }) {
  const dispatch = useDispatch();
  const { data = [] } = useSelector((state) => state.staff);

  const staff = data.find((s) => s._id === staffId);

  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [quyens, setQuyens] = useState([]);
  const [loadingQuyens, setLoadingQuyens] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  /* LOAD STAFF */
  useEffect(() => {
    if (staff) {
      setForm({
        MSNV: staff.MSNV || "",
        HoTenNV: staff.HoTenNV || "",
        Email: staff.Email || "",
        Password: staff.plainPassword || "",
        quyenSuDung: staff.quyenSuDung?._id || staff.quyenSuDung || "",
        DienThoai: staff.DienThoai || "",
        DiaChi: staff.DiaChi || "",
        GioiThieu: staff.GioiThieu || "",
        Status: staff.Status !== undefined ? staff.Status : 1,
      });
    }
  }, [staff]);

  /* FETCH ROLES */
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

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const isEditingSelf = currentUser._id === staffId;
      const hasPasswordChanged = !!form.Password && form.Password !== staff?.plainPassword;

      await dispatch(updateStaff({ id: staffId, data: form })).unwrap();

      if (isEditingSelf && hasPasswordChanged) {
        alert("Mật khẩu của bạn đã thay đổi. Vui lòng đăng nhập lại với mật khẩu mới!");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "/login";
        return;
      }

      await dispatch(fetchStaff());

      setOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
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
        zIndex: 1200, 
        '& .MuiDrawer-paper': { 
          top: { xs: 64, sm: 70 }, 
          height: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 70px)' } 
        } 
      }}
    >
      <Box sx={{ width: { xs: "100vw", sm: 450 } }} className="flex flex-col h-full bg-white">
        {/* Header giống trang đơn hàng */}
        <div className="bg-[#4fc3f7] border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div 
              onClick={() => {
                setOpen(false);
                onClose();
              }} 
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:cursor-pointer transition-all duration-100"
            >
              <ArrowForwardIcon sx={{ fontSize: 22 }} />
            </div>
            <span className="text-xl">Chỉnh sửa: {form.MSNV || form.HoTenNV}</span>
          </div>
        </div>

        <Box className="flex-grow space-y-4 overflow-y-auto p-4 pr-3">
          <TextField
            fullWidth
            label="Mã NV"
            value={form.MSNV}
            onChange={(e) => handleChange("MSNV", e.target.value)}
          />

          <TextField
            fullWidth
            label="Tên"
            value={form.HoTenNV}
            onChange={(e) => handleChange("HoTenNV", e.target.value)}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={form.Email}
            onChange={(e) => handleChange("Email", e.target.value)}
          />

          <TextField
            fullWidth
            label="Điện thoại"
            value={form.DienThoai}
            onChange={(e) => handleChange("DienThoai", e.target.value)}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            value={form.Password}
            onChange={(e) => handleChange("Password", e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Quyền sử dụng</InputLabel>
            <Select
              label="Quyền sử dụng"
              value={form.quyenSuDung}
              onChange={(e) => handleChange("quyenSuDung", e.target.value)}
            >
              {loadingQuyens ? (
                <MenuItem disabled>Đang tải...</MenuItem>
              ) : (
                quyens.map((q) => (
                  <MenuItem key={q._id} value={q._id}>
                    {q.ten}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              label="Trạng thái"
              value={form.Status}
              onChange={(e) => handleChange("Status", e.target.value)}
            >
              <MenuItem value={1}>Hoạt động</MenuItem>
              <MenuItem value={0}>Bị khoá</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Địa chỉ"
            value={form.DiaChi}
            onChange={(e) => handleChange("DiaChi", e.target.value)}
            multiline
            rows={2}
          />

          <TextField
            fullWidth
            label="Giới thiệu"
            value={form.GioiThieu}
            onChange={(e) => handleChange("GioiThieu", e.target.value)}
            multiline
            rows={3}
          />
        </Box>

        {/* Footer có nút Lưu */}
        <div className="border-t bg-white px-3 py-2.5 flex gap-2 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg font-medium text-sm bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center gap-1.5 uppercase"
          >
            Lưu thay đổi
          </button>
        </div>
      </Box>
    </Drawer>
  );
}
