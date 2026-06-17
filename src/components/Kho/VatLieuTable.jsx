// pages/Kho/VatLieuTable.jsx
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu } from "../../redux/slices/khoSlice";
import { api } from "../../config/api";
import { toast } from "sonner";
import { exportDanhSachVatLieuToExcel } from "./exportKhoToExcel";

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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const EMPTY_FORM = {
  maVatLieu: "",
  tenVatLieu: "",
  nhaCungCap: "",
  soLuong: 0,
  tonKhoToiThieu: 0,
  donViTinh: "",
  ghiChu: "",
};

export default function VatLieuTable() {
  const dispatch = useDispatch();
  const { vatLieu, nhaCungCap, loading } = useSelector((state) => state.kho);

  const [search, setSearch] = useState("");
  const [filterNCC, setFilterNCC] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");

  // Modal thêm/sửa
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Modal xóa
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return (vatLieu || []).filter((vl) => {
      const kw = search.toLowerCase();
      const matchSearch =
        vl.maVatLieu?.toLowerCase().includes(kw) ||
        vl.tenVatLieu?.toLowerCase().includes(kw) ||
        vl.nhaCungCap?.ten?.toLowerCase().includes(kw) ||
        vl.donViTinh?.toLowerCase().includes(kw);

      const matchNCC = filterNCC ? vl.nhaCungCap?._id === filterNCC : true;

      const thieuHang = (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0);
      const matchTT =
        filterTrangThai === "thieu"
          ? thieuHang
          : filterTrangThai === "du"
          ? !thieuHang
          : true;

      return matchSearch && matchNCC && matchTT;
    });
  }, [vatLieu, search, filterNCC, filterTrangThai]);

  // ===== HANDLERS =====
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpenModal(true);
  };

  const openEdit = (vl) => {
    setEditingId(vl._id);
    setForm({
      maVatLieu: vl.maVatLieu || "",
      tenVatLieu: vl.tenVatLieu || "",
      nhaCungCap: vl.nhaCungCap?._id || "",
      soLuong: vl.soLuong ?? 0,
      tonKhoToiThieu: vl.tonKhoToiThieu ?? 0,
      donViTinh: vl.donViTinh || "",
      ghiChu: vl.ghiChu || "",
    });
    setOpenModal(true);
  };

  const handleSave = async () => {
    if (!form.maVatLieu.trim() || !form.tenVatLieu.trim()) {
      toast.error("Vui lòng nhập mã và tên vật liệu");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        nhaCungCap: form.nhaCungCap || null,
        soLuong: Number(form.soLuong),
        tonKhoToiThieu: Number(form.tonKhoToiThieu),
      };
      if (editingId) {
        await api.put(`/kho/vat-lieu/${editingId}`, payload);
        toast.success("Đã cập nhật vật liệu");
      } else {
        await api.post("/kho/vat-lieu", payload);
        toast.success("Đã thêm vật liệu mới");
      }
      dispatch(fetchVatLieu());
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
      await api.delete(`/kho/vat-lieu/${deleteId}`);
      toast.success("Đã xóa vật liệu");
      dispatch(fetchVatLieu());
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setDeleting(false);
    }
  };

  const onChange = useCallback((field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  }, []);

  // ===== RENDER =====
  return (
    <Box>
      {/* ===== FILTER BAR ===== */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Tìm vật liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter nhà cung cấp */}
          <TextField
            select
            size="small"
            label="Nhà cung cấp"
            value={filterNCC}
            onChange={(e) => setFilterNCC(e.target.value)}
            sx={{ minWidth: 180 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {(nhaCungCap || []).map((ncc) => (
              <MenuItem key={ncc._id} value={ncc._id}>
                {ncc.ten}
              </MenuItem>
            ))}
          </TextField>

          {/* Filter trạng thái tồn kho */}
          <TextField
            select
            size="small"
            label="Tồn kho"
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="du">Đủ hàng</MenuItem>
            <MenuItem value="thieu">Thiếu hàng</MenuItem>
          </TextField>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(fetchVatLieu())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <button
            onClick={() => exportDanhSachVatLieuToExcel(filteredData)}
            title="Xuất Excel danh sách vật liệu"
            className="px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={openAdd}
            className="px-3 py-1.5 rounded-lg bg-[#1976d2] hover:bg-[#1565c0] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <AddIcon sx={{ fontSize: 17 }} />
            <span>Thêm vật liệu</span>
          </button>
        </Box>
      </Box>

      {/* ===== TABLE ===== */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
              {[
                "STT",
                "Mã VL",
                "Tên vật liệu",
                "Nhà cung cấp",
                "Số lượng tồn",
                "Tồn tối thiểu",
                "Đơn vị",
                "Ghi chú",
                "",
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 4, color: "#9ca3af" }}
                >
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              filteredData.map((vl, idx) => {
                const thieuHang = (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0);
                return (
                  <TableRow
                    key={vl._id}
                    sx={{
                      backgroundColor: thieuHang
                        ? "#fff3e0"
                        : idx % 2 === 0
                        ? "#fff"
                        : "#fafafa",
                      "&:hover": { backgroundColor: "#e3f2fd20" },
                    }}
                  >
                    <TableCell sx={{ color: "#9ca3af", fontSize: 12 }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {vl.maVatLieu}
                      </span>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {vl.tenVatLieu}
                    </TableCell>
                    <TableCell sx={{ color: "#555", fontSize: 13 }}>
                      {vl.nhaCungCap?.ten || (
                        <span className="text-gray-400 italic text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          justifyContent: "center",
                        }}
                      >
                        {thieuHang && (
                          <WarningAmberIcon
                            sx={{ fontSize: 15, color: "#ef4444" }}
                          />
                        )}
                        <span
                          style={{
                            fontWeight: 700,
                            color: thieuHang ? "#ef4444" : "#1976d2",
                          }}
                        >
                          {vl.soLuong ?? 0}
                        </span>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: "#555" }}>
                      {vl.tonKhoToiThieu ?? 0}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280", fontSize: 13 }}>
                      {vl.donViTinh || "—"}
                    </TableCell>
                    <TableCell
                      sx={{ color: "#9ca3af", fontSize: 12, maxWidth: 160 }}
                    >
                      <span className="line-clamp-1">{vl.ghiChu || ""}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center gap-1 justify-end">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => openEdit(vl)}>
                            <EditIcon sx={{ fontSize: 17, color: "#3b82f6" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteId(vl._id)}
                          >
                            <DeleteIcon
                              sx={{ fontSize: 17, color: "#ef4444" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            <TableRow>
              <TableCell colSpan={9} align="right">
                <Typography variant="caption" color="text.secondary">
                  Hiển thị {filteredData.length} / {vatLieu?.length ?? 0} vật
                  liệu
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ===== MODAL THÊM / SỬA ===== */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingId ? "Cập nhật vật liệu" : "Thêm vật liệu mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Mã vật liệu *"
                size="small"
                fullWidth
                value={form.maVatLieu}
                onChange={(e) => onChange("maVatLieu", e.target.value)}
                disabled={!!editingId}
                helperText={editingId ? "Không thể đổi mã sau khi tạo" : ""}
              />
              <TextField
                label="Đơn vị tính"
                size="small"
                fullWidth
                value={form.donViTinh}
                onChange={(e) => onChange("donViTinh", e.target.value)}
                placeholder="cái, hộp, lọ..."
              />
            </Box>

            <TextField
              label="Tên vật liệu *"
              size="small"
              fullWidth
              value={form.tenVatLieu}
              onChange={(e) => onChange("tenVatLieu", e.target.value)}
            />

            <TextField
              select
              label="Nhà cung cấp"
              size="small"
              fullWidth
              value={form.nhaCungCap}
              onChange={(e) => onChange("nhaCungCap", e.target.value)}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">— Không chọn —</MenuItem>
              {(nhaCungCap || []).map((ncc) => (
                <MenuItem key={ncc._id} value={ncc._id}>
                  {ncc.ten}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Số lượng tồn kho"
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.soLuong}
                onChange={(e) => onChange("soLuong", e.target.value)}
              />
              <TextField
                label="Tồn kho tối thiểu"
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.tonKhoToiThieu}
                onChange={(e) => onChange("tonKhoToiThieu", e.target.value)}
                helperText="Cảnh báo khi dưới mức này"
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
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} /> : null}
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
            Bạn có chắc chắn muốn xóa vật liệu này không? Hành động không thể
            hoàn tác.
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
