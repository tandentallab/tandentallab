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
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchStaff,
  deleteStaff,
  updateStaff,
} from "../../redux/slices/staffSlice";

import { APP_ROLES, resolveAppRoleFromUser } from "../../config/permissions";

import { api } from "../../config/api";
import { Box } from "lucide-react";

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
      <TableContainer component={Paper}>
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

  const [form, setForm] = useState({
    MSNV: "",
    HoTenNV: "",
    Email: "",
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

      await dispatch(updateStaff({ id: staffId, data: form })).unwrap();

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
    >
      <Box p={2} width={350}>
        <Typography variant="h6">Chỉnh sửa nhân viên</Typography>

        {/* form simplified */}
        <TextField
          fullWidth
          label="Tên"
          value={form.HoTenNV}
          onChange={(e) => handleChange("HoTenNV", e.target.value)}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          Lưu
        </Button>
      </Box>
    </Drawer>
  );
}
