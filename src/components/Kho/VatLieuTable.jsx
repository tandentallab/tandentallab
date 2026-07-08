import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVatLieu,
  fetchVatLieuMore,
  fetchNhaCungCap,
  resetVatLieu,
  setVatLieuFilters,
  resetVatLieuFilters,
  deleteVatLieuMany,
} from "../../redux/slices/khoSlice";
import { api } from "../../config/api";
import { toast } from "sonner";
import { exportDanhSachVatLieuToExcel } from "./exportKhoToExcel";
import NhapKhoModal from "./NhapXuatKho/NhapKhoModal";
import XuatKhoModal from "./NhapXuatKho/XuatKhoModal";

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
  Checkbox,
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
  addNewMode = "inline", // "inline" | "modal"
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
                  if (addNewMode === "modal") {
                    onAddNew();
                    setOpen(false);
                  } else {
                    setAddingNew(true);
                  }
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
// NccCombobox — select nhà cung cấp có ô nhập để lọc nhanh
// =====================================================
function NccCombobox({
  label,
  value,
  onChange,
  options,
  onAddNew,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (val) => {
    onChange(val);
    handleClose();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    handleClose();
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
        {/* Trigger */}
        <Box
          onClick={open ? undefined : handleOpen}
          sx={{
            border: "1px solid",
            borderColor: open ? "#1976d2" : "#c4c4c4",
            borderRadius: "4px",
            px: 1.5,
            cursor: open ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            minHeight: 40,
            backgroundColor: "#fff",
            "&:hover": { borderColor: open ? "#1976d2" : "#000" },
            transition: "border-color 0.15s",
            gap: 1,
          }}
        >
          {open ? (
            /* Input tìm kiếm khi mở */
            <>
              <SearchIcon
                sx={{ fontSize: 16, color: "#9ca3af", flexShrink: 0 }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleClose();
                  if (e.key === "Enter" && filtered.length === 1)
                    handleSelect(filtered[0]);
                }}
                placeholder="Nhập để tìm nhà cung cấp..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "inherit",
                  background: "transparent",
                  color: "#1a1a1a",
                  padding: "6px 0",
                }}
              />
              {query && (
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  sx={{
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 14,
                    lineHeight: 1,
                    px: 0.5,
                    "&:hover": { color: "#555" },
                  }}
                >
                  ✕
                </Box>
              )}
            </>
          ) : (
            /* Hiển thị giá trị đã chọn */
            <>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "#757575",
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
                  {value || placeholder || "— Chọn nhà cung cấp —"}
                </Typography>
              </Box>
              {value && (
                <Box
                  onClick={handleClear}
                  sx={{
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontSize: 14,
                    lineHeight: 1,
                    px: 0.5,
                    "&:hover": { color: "#ef4444" },
                  }}
                >
                  ✕
                </Box>
              )}
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
            </>
          )}
        </Box>

        {/* Dropdown */}
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
            <Box sx={{ maxHeight: 240, overflowY: "auto" }}>
              {/* Option xóa chọn */}
              {value && (
                <Box
                  onClick={() => handleSelect("")}
                  sx={{
                    px: 2,
                    py: 1.2,
                    fontSize: 13,
                    cursor: "pointer",
                    color: "#9ca3af",
                    fontStyle: "italic",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  — Bỏ chọn —
                </Box>
              )}

              {filtered.length === 0 && (
                <Box sx={{ px: 2, py: 1.5, color: "#9ca3af", fontSize: 13 }}>
                  {query
                    ? `Không tìm thấy "${query}"`
                    : "Chưa có nhà cung cấp nào"}
                </Box>
              )}

              {filtered.map((opt) => (
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
                  {/* Highlight phần khớp query */}
                  {query
                    ? (() => {
                        const idx = opt
                          .toLowerCase()
                          .indexOf(query.toLowerCase());
                        if (idx === -1) return opt;
                        return (
                          <>
                            {opt.slice(0, idx)}
                            <span
                              style={{
                                backgroundColor: "#fff9c4",
                                borderRadius: 2,
                              }}
                            >
                              {opt.slice(idx, idx + query.length)}
                            </span>
                            {opt.slice(idx + query.length)}
                          </>
                        );
                      })()
                    : opt}
                </Box>
              ))}
            </Box>

            {/* Thêm mới */}
            <Box sx={{ borderTop: "1px solid #f0f0f0" }} />
            <Box
              onClick={() => {
                onAddNew();
                setOpen(false);
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
              Thêm nhà cung cấp mới
            </Box>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}

// =====================================================
// SearchableDropdown — giống NhapXuatTable, dùng cho filter bar
// =====================================================
function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Tìm kiếm...",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 min-w-[150px] px-3 text-sm text-left bg-white border border-gray-300 rounded flex items-center justify-between gap-2 hover:border-gray-400 transition"
      >
        <span className={value ? "text-slate-700" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <KeyboardArrowDownIcon
          sx={{ fontSize: 20 }}
          className="text-gray-400 shrink-0"
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Tìm ${placeholder.toLowerCase()}...`}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-sky-400"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            <li
              onClick={() => {
                onChange("");
                setSearch("");
                setOpen(false);
              }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer"
            >
              Tất cả
            </li>
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setSearch("");
                    setOpen(false);
                  }}
                  className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-sky-50 hover:text-sky-700 ${
                    value === opt
                      ? "bg-sky-50 text-sky-700 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">
                Không tìm thấy
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
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

// Sinh mã vật liệu tự động dạng: VL + yyMMddHHmmss (đảm bảo không trùng
// giữa các lần tạo do dựa trên thời gian hiện tại chính xác đến giây)
function generateMaVatLieu() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `VL${yy}${MM}${dd}${HH}${mm}${ss}`;
}

const EMPTY_FORM = {
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
  const {
    vatLieu,
    nhaCungCap,
    loading,
    loadingMore,
    vatLieuHasMore,
    vatLieuPage,
    vatLieuLimit,
    vatLieuTotal,
  } = useSelector((state) => state.kho);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const isSystemAdmin =
    currentUser.quyenSuDung?.ten?.toLowerCase() === "admin" ||
    currentUser.appRole?.toLowerCase() === "admin";

  // ── Filter state — lấy từ Redux để giữ lại khi unmount ──────────────────
  const { vatLieuFilters } = useSelector((state) => state.kho);
  const { search, filterNCC, filterTrangThai, filterNhom, filterLoai } =
    vatLieuFilters;

  // Wrapper setters — ghi vào Redux thay vì local state
  const setSearch = (v) => dispatch(setVatLieuFilters({ search: v }));
  const setFilterNCC = (v) => dispatch(setVatLieuFilters({ filterNCC: v }));
  const setFilterTrangThai = (v) =>
    dispatch(setVatLieuFilters({ filterTrangThai: v }));
  const setFilterNhom = (v) => dispatch(setVatLieuFilters({ filterNhom: v }));
  const setFilterLoai = (v) => dispatch(setVatLieuFilters({ filterLoai: v }));

  // ===== LAZY LOADING — IntersectionObserver sentinel =====
  const sentinelRef = useRef(null);
  const isFetchingMore = useRef(false);

  // Params hiện tại để dùng khi load thêm
  const currentFilters = useMemo(
    () => ({
      search,
      nhaCungCap: filterNCC,
      nhomVatLieu: filterNhom,
      loaiVatLieu: filterLoai,
      trangThai: filterTrangThai,
    }),
    [search, filterNCC, filterNhom, filterLoai, filterTrangThai]
  );

  // Load trang 1 mỗi khi filter thay đổi (debounce search)
  useEffect(() => {
    const timer = setTimeout(
      () => {
        dispatch(
          fetchVatLieu({ ...currentFilters, limit: vatLieuLimit || 20 })
        );
      },
      search ? 350 : 0
    ); // debounce chỉ khi search bằng text
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterNCC, filterNhom, filterLoai, filterTrangThai]);

  // IntersectionObserver theo dõi sentinel ở cuối bảng
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          vatLieuHasMore &&
          !loadingMore &&
          !isFetchingMore.current
        ) {
          isFetchingMore.current = true;
          dispatch(
            fetchVatLieuMore({
              ...currentFilters,
              page: vatLieuPage + 1,
              limit: vatLieuLimit || 20,
            })
          ).finally(() => {
            isFetchingMore.current = false;
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    vatLieuHasMore,
    loadingMore,
    vatLieuPage,
    vatLieuLimit,
    currentFilters,
    dispatch,
  ]);

  // Modal thêm/sửa
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Modal xóa
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Chọn nhiều vật liệu (checkbox) ───────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteManyOpen, setDeleteManyOpen] = useState(false);
  const [deletingMany, setDeletingMany] = useState(false);

  // ── Modal nhập / xuất từ tab vật liệu ────────────────────────────────────
  const [nhapModalOpen, setNhapModalOpen] = useState(false);
  const [xuatModalOpen, setXuatModalOpen] = useState(false);

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteMany = async () => {
    if (selectedIds.length === 0) return;
    setDeletingMany(true);
    try {
      await dispatch(deleteVatLieuMany(selectedIds)).unwrap();
      toast.success(`Đã xóa ${selectedIds.length} vật liệu`);
      setSelectedIds([]);
      setDeleteManyOpen(false);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Có lỗi xảy ra khi xóa");
    } finally {
      setDeletingMany(false);
    }
  };

  // Modal thêm nhà cung cấp nhanh (từ bên trong modal vật liệu)
  const [openNccModal, setOpenNccModal] = useState(false);
  const [nccForm, setNccForm] = useState({
    ten: "",
    diaChi: "",
    soDienThoai: "",
    email: "",
    ghiChu: "",
  });
  const [savingNcc, setSavingNcc] = useState(false);

  const handleSaveNcc = async () => {
    if (!nccForm.ten.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }
    setSavingNcc(true);
    try {
      const res = await api.post("/kho/nha-cung-cap", nccForm);
      toast.success("Đã thêm nhà cung cấp mới");
      await dispatch(fetchNhaCungCap());
      // Auto-select NCC vừa tạo vào form vật liệu
      onChange("nhaCungCap", res.data._id);
      setOpenNccModal(false);
      setNccForm({
        ten: "",
        diaChi: "",
        soDienThoai: "",
        email: "",
        ghiChu: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSavingNcc(false);
    }
  };

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
  // (lấy từ toàn bộ NhaCungCap + vatLieu đã tải; server trả về unique khi cần)
  const danhSachNhom = useMemo(() => {
    const set = new Set(
      (vatLieu || []).map((vl) => vl.nhomVatLieu).filter(Boolean)
    );
    return [...set].sort();
  }, [vatLieu]);

  // Danh sách loại vật liệu unique để lọc filter bar
  const danhSachLoai = useMemo(() => {
    const set = new Set(
      (vatLieu || []).map((vl) => vl.loaiVatLieu).filter(Boolean)
    );
    return [...set].sort();
  }, [vatLieu]);

  // Dữ liệu bảng = vatLieu từ store (server đã filter, không cần filter client)
  const filteredData = vatLieu || [];

  // ── Tính toán trạng thái chọn tất cả dựa trên dữ liệu đang hiển thị ─────
  const isAllSelected =
    filteredData.length > 0 &&
    filteredData.every((vl) => selectedIds.includes(vl._id));
  const isSomeSelected =
    filteredData.some((vl) => selectedIds.includes(vl._id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Bỏ chọn tất cả vật liệu đang hiển thị
      const visibleIds = new Set(filteredData.map((vl) => vl._id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      // Chọn tất cả vật liệu đang hiển thị (gộp với các lựa chọn cũ)
      const visibleIds = filteredData.map((vl) => vl._id);
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // ===== HANDLERS =====
  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setOpenModal(true);
  };

  const openEdit = (vl) => {
    setEditingId(vl._id);
    setForm({
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
    if (!form.tenVatLieu.trim()) {
      toast.error("Vui lòng nhập tên vật liệu");
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
      if (!editingId) {
        payload.maVatLieu = generateMaVatLieu();
      }
      if (editingId) {
        await api.put(`/kho/vat-lieu/${editingId}`, payload);
        toast.success("Đã cập nhật vật liệu");
      } else {
        await api.post("/kho/vat-lieu", payload);
        toast.success("Đã thêm vật liệu mới");
      }
      dispatch(fetchVatLieu({ ...currentFilters, limit: vatLieuLimit || 20 }));
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
      dispatch(fetchVatLieu({ ...currentFilters, limit: vatLieuLimit || 20 }));
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

  // ===== Đo chiều cao thực tế của Filter Bar (bao gồm cả Action Bar khi có) =====
  // Dùng để định vị chính xác header của bảng khi cuộn, tránh trường hợp
  // header bảng bị đè lên/che khuất do offset cố định không khớp chiều cao thật.
  const filterBarRef = useRef(null);
  useEffect(() => {
    const el = filterBarRef.current;
    if (!el) return;

    const updateFilterBarHeight = () => {
      document.documentElement.style.setProperty(
        "--kho-filter-h",
        `${el.offsetHeight}px`
      );
    };

    updateFilterBarHeight();

    const resizeObserver = new ResizeObserver(updateFilterBarHeight);
    resizeObserver.observe(el);
    window.addEventListener("resize", updateFilterBarHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateFilterBarHeight);
    };
  }, [selectedIds.length, filterNCC, filterNhom, filterLoai, filterTrangThai]);

  // ===== RENDER =====
  return (
    <Box>
      {/* ===== FILTER BAR ===== */}
      <Box
        ref={filterBarRef}
        sx={{
          position: "sticky",
          // Chiều cao khối Header + Tabs + Thống kê được đo động bên KhoPage
          // (vì trên mobile khối thống kê có thể xuống dòng, chiều cao thay đổi)
          // và lưu vào biến CSS --kho-header-h. Fallback 145px nếu chưa có giá trị.
          top: "var(--kho-header-h, 145px)",
          backgroundColor: "#f3f4f6", // Khớp với màu nền xám nhạt của hệ thống để che phần nội dung cuộn lên bên dưới
          zIndex: 9, // Nhỏ hơn zIndex của Tabs (10) nhưng lớn hơn Table
          pt: 1,
          pb: 2, // Khoảng cách dưới bộ lọc
        }}
        // className="flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-col gap-2 py-2">
          {/* Hàng 1: search + action buttons */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <SearchIcon
                sx={{ fontSize: 18 }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Tìm vật liệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-sm border border-gray-300 rounded outline-none focus:border-sky-400 hover:border-gray-400 transition bg-white"
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip title="Làm mới">
                <IconButton
                  size="small"
                  onClick={() =>
                    dispatch(
                      fetchVatLieu({
                        ...currentFilters,
                        limit: vatLieuLimit || 20,
                      })
                    )
                  }
                  disabled={loading}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <button
                onClick={() => exportDanhSachVatLieuToExcel(filteredData)}
                className="h-9 px-3 text-sm font-medium text-white bg-[#29b6f6] hover:bg-[#0091ea] rounded flex items-center gap-1 transition"
              >
                <DownloadIcon sx={{ fontSize: 17 }} />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
              <button
                onClick={openAdd}
                className="h-9 px-3 text-sm font-medium text-white bg-[#1976d2] hover:bg-[#1565c0] rounded flex items-center gap-1 transition"
              >
                <AddIcon sx={{ fontSize: 17 }} />
                <span className="hidden sm:inline">Thêm vật liệu</span>
              </button>
            </div>
          </div>

          {/* Hàng 2: filter dropdowns */}
          <div className="flex flex-wrap gap-2 items-center">
            <SearchableDropdown
              options={(nhaCungCap || []).map((n) => n.ten)}
              value={
                (nhaCungCap || []).find((n) => n._id === filterNCC)?.ten || ""
              }
              onChange={(ten) => {
                const found = (nhaCungCap || []).find((n) => n.ten === ten);
                setFilterNCC(found?._id || "");
              }}
              placeholder="Nhà cung cấp"
            />
            <SearchableDropdown
              options={danhSachNhom}
              value={filterNhom}
              onChange={setFilterNhom}
              placeholder="Nhóm vật liệu"
            />
            <SearchableDropdown
              options={danhSachLoai}
              value={filterLoai}
              onChange={setFilterLoai}
              placeholder="Loại vật liệu"
            />
            <select
              value={filterTrangThai}
              onChange={(e) => setFilterTrangThai(e.target.value)}
              className="h-9 px-3 text-sm text-slate-700 bg-white border border-gray-300 rounded hover:border-gray-400 outline-none focus:border-sky-400 transition cursor-pointer"
            >
              <option value="">Tất cả tồn kho</option>
              <option value="du">Đủ hàng</option>
              <option value="thieu">Thiếu hàng</option>
            </select>

            {(filterNCC || filterNhom || filterLoai || filterTrangThai) && (
              <button
                onClick={() => dispatch(resetVatLieuFilters())}
                className="h-9 px-3 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Đã chọn {selectedIds.length} vật liệu
            </span>
            <div className="flex-1" />
            <button
              onClick={() => setNhapModalOpen(true)}
              className="h-8 px-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded flex items-center gap-1.5 transition"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Tạo phiếu nhập
            </button>
            <button
              onClick={() => setXuatModalOpen(true)}
              className="h-8 px-3 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded flex items-center gap-1.5 transition"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              Tạo phiếu xuất
            </button>
            {isSystemAdmin && (
              <button
                onClick={() => setDeleteManyOpen(true)}
                className="h-8 px-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded flex items-center gap-1.5 transition"
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
                Xóa ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="h-8 px-3 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </Box>

      {/* ===== SELECTION ACTION BAR ===== */}

      {/* ===== TABLE (ẩn trên mobile) ===== */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            overflow: "unset", // 🟢 Bỏ cuộn nội bộ của riêng bảng để cuộn chung với trang
          }}
        >
          {/* Thêm thuộc tính stickyHeader để kích hoạt tính năng sticky của Material UI */}
          <Table stickyHeader aria-label="sticky table">
            <TableHead sx={{ mt: "800px" }}>
              <TableRow
                sx={{
                  "& .MuiTableCell-head": {
                    backgroundColor: "#e3f2fd",
                    fontWeight: "bold",
                    // 🟢 ĐỊNH VỊ STICKY CHO HEADER CỦA BẢNG:
                    // Vị trí nằm dưới: --kho-header-h (Tabs + Thống kê, đo động)
                    // + --kho-filter-h (Filter Bar, đo động — đã tự bao gồm cả
                    // Action Bar khi có checkbox được chọn).
                    position: "sticky",
                    top: "calc(var(--kho-header-h, 145px) + var(--kho-filter-h, 88px))",
                    zIndex: 8, // Nhỏ hơn zIndex của Filter bar (9) và Tabs (10) để cuộn chui xuống dưới
                    transition: "top 0.2s ease-in-out", // Tạo hiệu ứng mượt mà khi thay đổi top
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {[
                  "Tên vật liệu",
                  "Nhóm / Loại",
                  "Nhà cung cấp",
                  "Tồn kho",
                  "Tối thiểu",
                  "Giá mua",
                  "ĐVT",
                  "Ghi chú",
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
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    align="center"
                    sx={{ py: 4, color: "#9ca3af" }}
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                filteredData.map((vl, idx) => {
                  const thieuHang =
                    (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0);
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
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selectedIds.includes(vl._id)}
                          onChange={() => toggleSelectOne(vl._id)}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          minWidth: 180,
                          cursor: "pointer",
                        }}
                        onClick={() => openEdit(vl)}
                      >
                        {vl.tenVatLieu}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: 12, minWidth: 120 }}
                        onClick={() => openEdit(vl)}
                      >
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

                      <TableCell
                        sx={{ color: "#555", fontSize: 13 }}
                        onClick={() => openEdit(vl)}
                      >
                        {vl.nhaCungCap?.ten || (
                          <span className="text-gray-400 italic text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell align="center" onClick={() => openEdit(vl)}>
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
                        onClick={() => openEdit(vl)}
                      >
                        {vl.tonKhoToiThieu ?? 0}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: 13, whiteSpace: "nowrap" }}
                        onClick={() => openEdit(vl)}
                      >
                        {vl.giaMua > 0 ? (
                          <span className="text-green-700 font-medium">
                            {vl.giaMua.toLocaleString("vi-VN")}₫
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#6b7280", fontSize: 13 }}
                        onClick={() => openEdit(vl)}
                      >
                        {vl.donViTinh || "—"}
                      </TableCell>
                      <TableCell
                        sx={{ color: "#9ca3af", fontSize: 12, maxWidth: 120 }}
                        onClick={() => openEdit(vl)}
                      >
                        <span className="line-clamp-1">{vl.ghiChu || ""}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              <TableRow>
                <TableCell colSpan={14} align="right">
                  <Typography variant="caption" color="text.secondary">
                    Hiển thị {filteredData.length} / {vatLieuTotal ?? 0} vật
                    liệu
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
          display: { xs: "flex", md: "none" },
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
          filteredData.map((vl) => {
            const thieuHang = (vl.soLuong ?? 0) < (vl.tonKhoToiThieu ?? 0);
            return (
              <Paper
                key={vl._id}
                sx={{
                  borderRadius: 2,
                  p: 2,
                  boxShadow: 1,
                  borderLeft: "4px solid",
                  borderColor: thieuHang ? "#ef4444" : "#1976d2",
                  backgroundColor: thieuHang ? "#fff8f8" : "#fff",
                }}
              >
                {/* Header: mã + tên + actions */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      flex: 1,
                      pr: 1,
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedIds.includes(vl._id)}
                      onChange={() => toggleSelectOne(vl._id)}
                      sx={{ p: 0.5, mr: 0.5, mt: "-2px" }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        component="span"
                        sx={{ fontWeight: 700, fontSize: 15 }}
                      >
                        {vl.tenVatLieu}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => openEdit(vl)}>
                      <EditIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteId(vl._id)}
                    >
                      <DeleteIcon sx={{ fontSize: 18, color: "#ef4444" }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Tags: nhóm, loại */}
                {(vl.nhomVatLieu || vl.loaiVatLieu) && (
                  <Box
                    sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {vl.nhomVatLieu && (
                      <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {vl.nhomVatLieu}
                      </span>
                    )}
                    {vl.loaiVatLieu && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {vl.loaiVatLieu}
                      </span>
                    )}
                    {vl.formRang && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {vl.formRang}
                      </span>
                    )}
                    {vl.mauRang && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {vl.mauRang}
                      </span>
                    )}
                  </Box>
                )}

                {/* Info grid */}
                <Box
                  sx={{
                    mt: 1.5,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Tồn kho
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {thieuHang && (
                        <WarningAmberIcon
                          sx={{ fontSize: 14, color: "#ef4444" }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: thieuHang ? "#ef4444" : "#1976d2",
                          fontSize: 15,
                        }}
                      >
                        {vl.soLuong ?? 0}
                        {vl.donViTinh && (
                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: 12,
                              color: "#6b7280",
                              marginLeft: 2,
                            }}
                          >
                            {vl.donViTinh}
                          </span>
                        )}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                      Tối thiểu: {vl.tonKhoToiThieu ?? 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#9ca3af",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Giá mua
                    </Typography>
                    <Typography
                      sx={{ fontWeight: 600, fontSize: 14, color: "#16a34a" }}
                    >
                      {vl.giaMua > 0
                        ? `${vl.giaMua.toLocaleString("vi-VN")}₫`
                        : "—"}
                    </Typography>
                  </Box>
                </Box>

                {/* NCC + ghi chú */}
                {(vl.nhaCungCap?.ten || vl.ghiChu) && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid #f0f0f0" }}>
                    {vl.nhaCungCap?.ten && (
                      <Typography sx={{ fontSize: 12, color: "#555" }}>
                        🏭 {vl.nhaCungCap.ten}
                      </Typography>
                    )}
                    {vl.ghiChu && (
                      <Typography
                        sx={{ fontSize: 12, color: "#9ca3af", mt: 0.25 }}
                      >
                        {vl.ghiChu}
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "right", display: "block" }}
        >
          Hiển thị {filteredData.length} / {vatLieuTotal ?? 0} vật liệu
        </Typography>
        {loadingMore && (
          <Box
            sx={{
              py: 2,
              display: "flex",
              justifyContent: "center",
              gap: 1,
              alignItems: "center",
            }}
          >
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Đang tải thêm...
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Sentinel cho IntersectionObserver (lazy load) ── */}
      <Box ref={sentinelRef} sx={{ height: 1 }} />

      {/* Loading thêm */}
      {loadingMore && (
        <Box
          sx={{
            py: 2,
            display: "flex",
            justifyContent: "center",
            gap: 1,
            alignItems: "center",
          }}
        >
          <CircularProgress size={18} />
          <Typography variant="caption" color="text.secondary">
            Đang tải thêm...
          </Typography>
        </Box>
      )}

      {/* Đã tải hết */}
      {!vatLieuHasMore && filteredData.length > 0 && !loading && (
        <Box sx={{ py: 1.5, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            ✓ Đã hiển thị tất cả {vatLieuTotal} vật liệu
          </Typography>
        </Box>
      )}

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

            <TextField
              label="Tên vật liệu *"
              size="small"
              fullWidth
              value={form.tenVatLieu}
              onChange={(e) => onChange("tenVatLieu", e.target.value)}
            />

            <TextField
              label="Đơn vị tính"
              size="small"
              fullWidth
              value={form.donViTinh}
              onChange={(e) => onChange("donViTinh", e.target.value)}
              placeholder="cái, hộp, lọ..."
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

            <NccCombobox
              label="Nhà cung cấp"
              value={
                (nhaCungCap || []).find((n) => n._id === form.nhaCungCap)
                  ?.ten || ""
              }
              onChange={(ten) => onChange("nhaCungCap", nccIdByTen[ten] || "")}
              options={nccOptions}
              onAddNew={() => setOpenNccModal(true)}
              placeholder="Chọn nhà cung cấp..."
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2.5,
                  mt: 1.5,
                  display: "block",
                  fontWeight: 600,
                  color: "#4b5563",
                }}
              >
                TỒN KHO
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <TextField
                  label="Số lượng tồn kho"
                  size="small"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0 }}
                  value={form.soLuong}
                  onChange={(e) => onChange("soLuong", e.target.value)}
                  disabled={editingId && !isSystemAdmin}
                  helperText={
                    editingId && !isSystemAdmin
                      ? "Bạn không có quyền chỉnh sửa số lượng"
                      : ""
                  }
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
            </Box>

            <TextField
              label="Giá mua (VNĐ)"
              size="small"
              fullWidth
              value={
                form.giaMua > 0
                  ? Number(form.giaMua).toLocaleString("vi-VN")
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value
                  .replace(/\./g, "")
                  .replace(/[^0-9]/g, "");
                onChange("giaMua", raw ? Number(raw) : 0);
              }}
              placeholder="0"
              InputProps={{
                endAdornment: <InputAdornment position="end">₫</InputAdornment>,
              }}
              inputProps={{ inputMode: "numeric" }}
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
      {/* ===== MODAL THÊM NHANH NHÀ CUNG CẤP ===== */}
      <Dialog
        open={openNccModal}
        onClose={() => setOpenNccModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: 16 }}>
          Thêm nhà cung cấp mới
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Tên nhà cung cấp *"
              size="small"
              fullWidth
              value={nccForm.ten}
              onChange={(e) =>
                setNccForm((p) => ({ ...p, ten: e.target.value }))
              }
              autoFocus
            />
            <TextField
              label="Địa chỉ"
              size="small"
              fullWidth
              value={nccForm.diaChi}
              onChange={(e) =>
                setNccForm((p) => ({ ...p, diaChi: e.target.value }))
              }
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Số điện thoại"
                size="small"
                fullWidth
                value={nccForm.soDienThoai}
                onChange={(e) =>
                  setNccForm((p) => ({ ...p, soDienThoai: e.target.value }))
                }
              />
              <TextField
                label="Email"
                size="small"
                fullWidth
                value={nccForm.email}
                onChange={(e) =>
                  setNccForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </Box>
            <TextField
              label="Ghi chú"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={nccForm.ghiChu}
              onChange={(e) =>
                setNccForm((p) => ({ ...p, ghiChu: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenNccModal(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveNcc}
            disabled={savingNcc}
            startIcon={
              savingNcc ? <CircularProgress size={14} color="inherit" /> : null
            }
          >
            Thêm nhà cung cấp
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
      {/* ===== MODAL NHẬP KHO TỪ TAB VẬT LIỆU ===== */}
      <NhapKhoModal
        open={nhapModalOpen}
        onClose={() => {
          setNhapModalOpen(false);
          setSelectedIds([]);
        }}
        preSelectedIds={selectedIds}
      />

      {/* ===== MODAL XUẤT KHO TỪ TAB VẬT LIỆU ===== */}
      <XuatKhoModal
        open={xuatModalOpen}
        onClose={() => {
          setXuatModalOpen(false);
          setSelectedIds([]);
        }}
        preSelectedIds={selectedIds}
      />

      {/* ===== MODAL XÓA NHIỀU (BULK DELETE) ===== */}
      <Dialog
        open={deleteManyOpen}
        onClose={() => setDeleteManyOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#ef4444" }}>
          Xác nhận xóa nhiều vật liệu
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa <b>{selectedIds.length}</b> vật liệu đã
            chọn không? Hành động không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteManyOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteMany}
            disabled={deletingMany}
            startIcon={
              deletingMany ? (
                <CircularProgress size={14} color="inherit" />
              ) : null
            }
          >
            Xóa {selectedIds.length} vật liệu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
