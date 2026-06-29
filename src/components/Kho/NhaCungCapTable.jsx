// pages/Kho/NhaCungCapTable.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNhaCungCap,
  setNhaCungCapFilters,
  resetNhaCungCapFilters,
} from "../../redux/slices/khoSlice";
import { api } from "../../config/api";
import { toast } from "sonner";
import { exportDanhSachNhaCungCapToExcel } from "./exportKhoToExcel";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EMPTY_FORM = {
  ten: "",
  diaChi: "",
  soDienThoai: "",
  email: "",
  ghiChu: "",
};

export default function NhaCungCapTable() {
  const dispatch = useDispatch();
  const { nhaCungCap, loading, nhaCungCapFilters } = useSelector(
    (state) => state.kho
  );
  const { search } = nhaCungCapFilters;

  // Wrapper setter — ghi vào Redux để giữ lại khi unmount
  const setSearch = (v) => dispatch(setNhaCungCapFilters({ search: v }));

  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    const kw = search.toLowerCase();
    return (nhaCungCap || []).filter(
      (ncc) =>
        ncc.ten?.toLowerCase().includes(kw) ||
        ncc.soDienThoai?.includes(kw) ||
        ncc.email?.toLowerCase().includes(kw) ||
        ncc.diaChi?.toLowerCase().includes(kw)
    );
  }, [nhaCungCap, search]);

  const onChange = useCallback((field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpenModal(true);
  };

  const openEdit = (ncc) => {
    setEditingId(ncc._id);
    setForm({
      ten: ncc.ten || "",
      diaChi: ncc.diaChi || "",
      soDienThoai: ncc.soDienThoai || "",
      email: ncc.email || "",
      ghiChu: ncc.ghiChu || "",
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.ten.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/kho/nha-cung-cap/${editingId}`, form);
        toast.success("Đã cập nhật nhà cung cấp");
      } else {
        await api.post("/kho/nha-cung-cap", form);
        toast.success("Đã thêm nhà cung cấp mới");
      }
      dispatch(fetchNhaCungCap());
      setOpenModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/kho/nha-cung-cap/${deleteId}`);
      toast.success("Đã xóa nhà cung cấp");
      dispatch(fetchNhaCungCap());
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* ===== FILTER BAR ===== */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm nhà cung cấp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(fetchNhaCungCap())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <button
            onClick={() => exportDanhSachNhaCungCapToExcel(filteredData)}
            title="Xuất Excel danh sách nhà cung cấp"
            className="px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={openAdd}
            className="px-3 py-1.5 rounded-lg bg-[#388e3c] hover:bg-[#2e7d32] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <AddIcon sx={{ fontSize: 17 }} />
            <span className="hidden xs:inline">Thêm</span>
            <span className="hidden sm:inline"> Thêm nhà cung cấp</span>
          </button>
        </Box>
      </Box>

      {/* ===== TABLE (ẩn trên mobile) ===== */}
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, boxShadow: 1 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                {[
                  "STT",
                  "Tên nhà cung cấp",
                  "Địa chỉ",
                  "Số điện thoại",
                  "Email",
                  "Ghi chú",
                  "",
                ].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 13 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 4, color: "#9ca3af" }}
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredData.map((ncc, idx) => (
                  <TableRow
                    key={ncc._id}
                    sx={{
                      backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                      "&:hover": { backgroundColor: "#e8f5e920" },
                    }}
                  >
                    <TableCell sx={{ color: "#9ca3af", fontSize: 12 }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{ncc.ten}</TableCell>
                    <TableCell sx={{ color: "#555", fontSize: 13 }}>
                      {ncc.diaChi || "—"}
                    </TableCell>
                    <TableCell>{ncc.soDienThoai || "—"}</TableCell>
                    <TableCell sx={{ color: "#1976d2", fontSize: 13 }}>
                      {ncc.email ? (
                        <a href={`mailto:${ncc.email}`}>{ncc.email}</a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell
                      sx={{ color: "#9ca3af", fontSize: 12, maxWidth: 160 }}
                    >
                      <span className="line-clamp-1">{ncc.ghiChu || ""}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center gap-1 justify-end">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(ncc)}
                          >
                            <EditIcon sx={{ fontSize: 17, color: "#3b82f6" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(ncc._id)}
                          >
                            <DeleteIcon
                              sx={{ fontSize: 17, color: "#ef4444" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow>
                <TableCell colSpan={7} align="right">
                  <Typography variant="caption" color="text.secondary">
                    Tổng {nhaCungCap?.length ?? 0} nhà cung cấp
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ===== CARD LIST (chỉ hiện trên mobile) ===== */}
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {loading && (
          <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!loading && filteredData.length === 0 && (
          <Box sx={{ py: 4, textAlign: "center", color: "#9ca3af" }}>
            Không có dữ liệu
          </Box>
        )}
        {!loading &&
          filteredData.map((ncc) => (
            <Paper key={ncc._id} sx={{ borderRadius: 2, p: 2, boxShadow: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, fontSize: 15, flex: 1, pr: 1 }}
                >
                  {ncc.ten}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                  <IconButton size="small" onClick={() => openEdit(ncc)}>
                    <EditIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => setDeleteId(ncc._id)}>
                    <DeleteIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                  </IconButton>
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                {ncc.diaChi && (
                  <Typography sx={{ fontSize: 13, color: "#555" }}>
                    📍 {ncc.diaChi}
                  </Typography>
                )}
                {ncc.soDienThoai && (
                  <Typography sx={{ fontSize: 13 }}>
                    📞{" "}
                    <a
                      href={`tel:${ncc.soDienThoai}`}
                      style={{ color: "inherit" }}
                    >
                      {ncc.soDienThoai}
                    </a>
                  </Typography>
                )}
                {ncc.email && (
                  <Typography sx={{ fontSize: 13, color: "#1976d2" }}>
                    ✉️ <a href={`mailto:${ncc.email}`}>{ncc.email}</a>
                  </Typography>
                )}
                {ncc.ghiChu && (
                  <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 0.5 }}>
                    {ncc.ghiChu}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "right", display: "block" }}
        >
          Tổng {nhaCungCap?.length ?? 0} nhà cung cấp
        </Typography>
      </Box>

      {/* ===== MODAL THÊM / SỬA ===== */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingId ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Tên nhà cung cấp *"
              size="small"
              fullWidth
              value={form.ten}
              onChange={(e) => onChange("ten", e.target.value)}
            />
            <TextField
              label="Địa chỉ"
              size="small"
              fullWidth
              value={form.diaChi}
              onChange={(e) => onChange("diaChi", e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Số điện thoại"
                size="small"
                fullWidth
                value={form.soDienThoai}
                onChange={(e) => onChange("soDienThoai", e.target.value)}
              />
              <TextField
                label="Email"
                size="small"
                fullWidth
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
              />
            </Box>
            <TextField
              label="Ghi chú"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={form.ghiChu}
              onChange={(e) => onChange("ghiChu", e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={14} color="inherit" /> : null
            }
          >
            {editingId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL XÓA ===== */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#ef4444" }}>
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa nhà cung cấp này không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={14} color="inherit" /> : null
            }
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
