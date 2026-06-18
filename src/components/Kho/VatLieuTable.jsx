// pages/Kho/VatLieuTable.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
  Divider,
  Popper,
  Paper as MuiPaper,
  ClickAwayListener,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// =====================================================
// SelectWithAdd — dropdown có thể chọn hoặc thêm mới
// =====================================================
function SelectWithAdd({
  label,
  value,
  onChange,
  options,
  onAddNew,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newVal, setNewVal] = useState("");
  const anchorRef = useRef(null);
  const inputRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  const handleClose = () => {
    setOpen(false);
    setAddingNew(false);
    setNewVal("");
  };

  const handleSelect = (val) => {
    onChange(val);
    handleClose();
  };

  const handleConfirmAdd = () => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    onAddNew(trimmed); // thêm vào danh sách options ngoài
    onChange(trimmed); // chọn luôn giá trị vừa thêm
    handleClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConfirmAdd();
    if (e.key === "Escape") handleClose();
  };

  useEffect(() => {
    if (addingNew && inputRef.current) inputRef.current.focus();
  }, [addingNew]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: "relative", width: "100%" }}>
        {/* Trigger field */}
        <Box
          ref={anchorRef}
          onClick={() => setOpen((v) => !v)}
          sx={{
            border: "1px solid",
            borderColor: open ? "#1976d2" : "#c4c4c4",
            borderRadius: "4px",
            px: 1.5,
            py: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 40,
            backgroundColor: "#fff",
            "&:hover": { borderColor: "#000" },
            transition: "border-color 0.15s",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: open ? "#1976d2" : "#757575",
                fontSize: 11,
                lineHeight: 1,
                mb: 0.3,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: value ? "#1a1a1a" : "#9ca3af",
                lineHeight: 1.3,
              }}
            >
              {value || placeholder || "— Chọn hoặc thêm mới —"}
            </Typography>
          </Box>
          <KeyboardArrowDownIcon
            sx={{
              fontSize: 18,
              color: "#9ca3af",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </Box>

        {/* Dropdown panel */}
        {open && (
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 1400,
              backgroundColor: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Danh sách options */}
            <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
              {options.length === 0 && (
                <Box sx={{ px: 2, py: 1.5, color: "#9ca3af", fontSize: 13 }}>
                  Chưa có lựa chọn nào
                </Box>
              )}
              {options.map((opt) => (
                <Box
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  sx={{
                    px: 2,
                    py: 1.2,
                    fontSize: 14,
                    cursor: "pointer",
                    backgroundColor: value === opt ? "#e3f2fd" : "transparent",
                    color: value === opt ? "#1976d2" : "#1a1a1a",
                    fontWeight: value === opt ? 600 : 400,
                    "&:hover": {
                      backgroundColor: value === opt ? "#e3f2fd" : "#f5f5f5",
                    },
                  }}
                >
                  {opt}
                </Box>
              ))}
            </Box>

            {/* Divider */}
            <Box sx={{ borderTop: "1px solid #f0f0f0" }} />

            {/* Thêm mới */}
            {addingNew ? (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <input
                  ref={inputRef}
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tên mới..."
                  style={{
                    flex: 1,
                    border: "1px solid #1976d2",
                    borderRadius: 4,
                    padding: "5px 10px",
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  onClick={handleConfirmAdd}
                  style={{
                    background: "#1976d2",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    padding: "5px 12px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  Thêm
                </button>
                <button
                  onClick={() => {
                    setAddingNew(false);
                    setNewVal("");
                  }}
                  style={{
                    background: "transparent",
                    color: "#9ca3af",
                    border: "none",
                    padding: "5px 6px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Hủy
                </button>
              </Box>
            ) : (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  setAddingNew(true);
                }}
                sx={{
                  px: 2,
                  py: 1.2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  color: "#2e7d32",
                  fontWeight: 600,
                  fontSize: 14,
                  "&:hover": { backgroundColor: "#f1f8e9" },
                }}
              >
                <AddIcon sx={{ fontSize: 17 }} />
                Thêm mới
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}

// =====================================================
// CONSTANTS — danh sách mặc định, người dùng có thể thêm
// =====================================================
const DEFAULT_LOAI = ["Aidite HT", "Aidite ST", "Nước Màu", "Nước Quét Màu"];
const DEFAULT_NHOM = [
  "Cadcam",
  "Mài sứ",
  "Phôi Aidite",
  "Sáp",
  "Sứ",
  "Sườn",
  "Tổng hợp",
];
const DEFAULT_FORM_RANG = [];
const DEFAULT_MAU_RANG = [];

const EMPTY_FORM = {
  maVatLieu: "",
  tenVatLieu: "",
  nhaCungCap: "",
  soLuong: 0,
  tonKhoToiThieu: 0,
  tonKhoToiDa: 0,
  loaiVatLieu: "",
  nhomVatLieu: "",
  formRang: "",
  mauRang: "",
  giaMua: 0,
  donViTinh: "",
  ghiChu: "",
};

export default function VatLieuTable() {
  const dispatch = useDispatch();
  const { vatLieu, nhaCungCap, loading } = useSelector((state) => state.kho);

  const [search, setSearch] = useState("");
  const [filterNCC, setFilterNCC] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [filterNhom, setFilterNhom] = useState("");

  // Modal thêm/sửa
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Modal xóa
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Danh sách options cho các SelectWithAdd — mở rộng được trong session
  const [optLoai, setOptLoai] = useState(DEFAULT_LOAI);
  const [optNhom, setOptNhom] = useState(DEFAULT_NHOM);
  const [optFormRang, setOptFormRang] = useState(DEFAULT_FORM_RANG);
  const [optMauRang, setOptMauRang] = useState(DEFAULT_MAU_RANG);

  // Merge options từ data thực tế (khi load)
  useEffect(() => {
    if (!vatLieu?.length) return;
    const mergeUniq = (base, vals) => {
      const s = new Set([...base, ...vals.filter(Boolean)]);
      return [...s].sort();
    };
    setOptLoai((b) =>
      mergeUniq(
        b,
        vatLieu.map((v) => v.loaiVatLieu)
      )
    );
    setOptNhom((b) =>
      mergeUniq(
        b,
        vatLieu.map((v) => v.nhomVatLieu)
      )
    );
    setOptFormRang((b) =>
      mergeUniq(
        b,
        vatLieu.map((v) => v.formRang)
      )
    );
    setOptMauRang((b) =>
      mergeUniq(
        b,
        vatLieu.map((v) => v.mauRang)
      )
    );
  }, [vatLieu]);

  // Danh sách nhóm vật liệu unique để lọc filter bar
  const danhSachNhom = useMemo(() => {
    const set = new Set(
      (vatLieu || []).map((vl) => vl.nhomVatLieu).filter(Boolean)
    );
    return [...set].sort();
  }, [vatLieu]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return (vatLieu || []).filter((vl) => {
      const kw = search.toLowerCase();
      const matchSearch =
        vl.maVatLieu?.toLowerCase().includes(kw) ||
        vl.tenVatLieu?.toLowerCase().includes(kw) ||
        vl.nhaCungCap?.ten?.toLowerCase().includes(kw) ||
        vl.donViTinh?.toLowerCase().includes(kw) ||
        vl.loaiVatLieu?.toLowerCase().includes(kw) ||
        vl.nhomVatLieu?.toLowerCase().includes(kw) ||
        vl.formRang?.toLowerCase().includes(kw) ||
        vl.mauRang?.toLowerCase().includes(kw);

      const matchNCC = filterNCC ? vl.nhaCungCap?._id === filterNCC : true;
      const matchNhom = filterNhom ? vl.nhomVatLieu === filterNhom : true;

      const thieuHang = (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0);
      const matchTT =
        filterTrangThai === "thieu"
          ? thieuHang
          : filterTrangThai === "du"
          ? !thieuHang
          : true;

      return matchSearch && matchNCC && matchTT && matchNhom;
    });
  }, [vatLieu, search, filterNCC, filterTrangThai, filterNhom]);

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
      tonKhoToiDa: vl.tonKhoToiDa ?? 0,
      loaiVatLieu: vl.loaiVatLieu || "",
      nhomVatLieu: vl.nhomVatLieu || "",
      formRang: vl.formRang || "",
      mauRang: vl.mauRang || "",
      giaMua: vl.giaMua ?? 0,
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
        tonKhoToiDa: Number(form.tonKhoToiDa),
        giaMua: Number(form.giaMua),
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

  const addOpt = useCallback(
    (setter) => (val) => {
      setter((prev) => {
        if (prev.includes(val)) return prev;
        return [...prev, val].sort();
      });
    },
    []
  );

  // ===== NHACUNGCAP options cho SelectWithAdd =====
  const nccOptions = useMemo(
    () => (nhaCungCap || []).map((n) => n.ten),
    [nhaCungCap]
  );
  const nccIdByTen = useMemo(() => {
    const map = {};
    (nhaCungCap || []).forEach((n) => {
      map[n.ten] = n._id;
    });
    return map;
  }, [nhaCungCap]);

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
          <TextField
            select
            size="small"
            label="Nhà cung cấp"
            value={filterNCC}
            onChange={(e) => setFilterNCC(e.target.value)}
            sx={{ minWidth: 160 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {(nhaCungCap || []).map((ncc) => (
              <MenuItem key={ncc._id} value={ncc._id}>
                {ncc.ten}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Nhóm vật liệu"
            value={filterNhom}
            onChange={(e) => setFilterNhom(e.target.value)}
            sx={{ minWidth: 150 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {danhSachNhom.map((nhom) => (
              <MenuItem key={nhom} value={nhom}>
                {nhom}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Tồn kho"
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            sx={{ minWidth: 140 }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="du">Đủ hàng</MenuItem>
            <MenuItem value="thieu">Thiếu hàng</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(fetchVatLieu())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <button
            onClick={() => exportDanhSachVatLieuToExcel(filteredData)}
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
                "Nhóm / Loại",
                "Form răng",
                "Màu răng",
                "Nhà cung cấp",
                "Tồn kho",
                "Tối thiểu",
                "Tối đa",
                "Giá mua",
                "ĐVT",
                "Ghi chú",
                "",
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{ fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={14}
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
                      "&:hover": { backgroundColor: "#e3f2fd40" },
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
                    <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>
                      {vl.tenVatLieu}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, minWidth: 120 }}>
                      {vl.nhomVatLieu && (
                        <div className="text-xs font-medium text-blue-700">
                          {vl.nhomVatLieu}
                        </div>
                      )}
                      {vl.loaiVatLieu && (
                        <div className="text-xs text-gray-500">
                          {vl.loaiVatLieu}
                        </div>
                      )}
                      {!vl.nhomVatLieu && !vl.loaiVatLieu && (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#555" }}>
                      {vl.formRang || <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: "#555" }}>
                      {vl.mauRang || <span className="text-gray-300">—</span>}
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
                    <TableCell
                      align="center"
                      sx={{ color: "#555", fontSize: 13 }}
                    >
                      {vl.tonKhoToiThieu ?? 0}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ color: "#555", fontSize: 13 }}
                    >
                      {vl.tonKhoToiDa > 0 ? (
                        vl.tonKhoToiDa
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: 13, whiteSpace: "nowrap" }}
                    >
                      {vl.giaMua > 0 ? (
                        <span className="text-green-700 font-medium">
                          {vl.giaMua.toLocaleString("vi-VN")}₫
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: "#6b7280", fontSize: 13 }}>
                      {vl.donViTinh || "—"}
                    </TableCell>
                    <TableCell
                      sx={{ color: "#9ca3af", fontSize: 12, maxWidth: 120 }}
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
              <TableCell colSpan={14} align="right">
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
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingId ? "Cập nhật vật liệu" : "Thêm vật liệu mới"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {/* Thông tin cơ bản */}
            <Typography
              variant="caption"
              sx={{
                color: "#1976d2",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Thông tin cơ bản
            </Typography>
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

            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <SelectWithAdd
                  label="Loại vật liệu"
                  value={form.loaiVatLieu}
                  onChange={(v) => onChange("loaiVatLieu", v)}
                  options={optLoai}
                  onAddNew={addOpt(setOptLoai)}
                  placeholder="Chọn loại vật liệu..."
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SelectWithAdd
                  label="Nhóm vật liệu"
                  value={form.nhomVatLieu}
                  onChange={(v) => onChange("nhomVatLieu", v)}
                  options={optNhom}
                  onAddNew={addOpt(setOptNhom)}
                  placeholder="Chọn nhóm vật liệu..."
                />
              </Box>
            </Box>

            {/* Thông tin răng */}
            <Divider />
            <Typography
              variant="caption"
              sx={{
                color: "#1976d2",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Thông tin răng
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <SelectWithAdd
                  label="Form răng"
                  value={form.formRang}
                  onChange={(v) => onChange("formRang", v)}
                  options={optFormRang}
                  onAddNew={addOpt(setOptFormRang)}
                  placeholder="Chọn form răng..."
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <SelectWithAdd
                  label="Màu răng"
                  value={form.mauRang}
                  onChange={(v) => onChange("mauRang", v)}
                  options={optMauRang}
                  onAddNew={addOpt(setOptMauRang)}
                  placeholder="Chọn màu răng..."
                />
              </Box>
            </Box>

            {/* Tồn kho & giá */}
            <Divider />
            <Typography
              variant="caption"
              sx={{
                color: "#1976d2",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Tồn kho & Giá
            </Typography>

            <SelectWithAdd
              label="Nhà cung cấp"
              value={
                (nhaCungCap || []).find((n) => n._id === form.nhaCungCap)
                  ?.ten || ""
              }
              onChange={(ten) => onChange("nhaCungCap", nccIdByTen[ten] || "")}
              options={nccOptions}
              onAddNew={() =>
                toast.info("Vui lòng thêm nhà cung cấp trong tab Nhà cung cấp")
              }
              placeholder="Chọn nhà cung cấp..."
            />

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
              <TextField
                label="Tồn kho tối đa"
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 0 }}
                value={form.tonKhoToiDa}
                onChange={(e) => onChange("tonKhoToiDa", e.target.value)}
              />
            </Box>

            <TextField
              label="Giá mua (VNĐ)"
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              value={form.giaMua}
              onChange={(e) => onChange("giaMua", e.target.value)}
            />

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
