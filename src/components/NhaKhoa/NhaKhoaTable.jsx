import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../config/api";
import {
  exportBangGiaRiengToExcel,
  exportDanhSachNhaKhoaToExcel,
} from "../../utils/exportToExcel";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Box,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Drawer,
  Stack,
  Avatar,
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
  Delete,
  Close as CloseIcon,
  Phone,
  Smartphone,
  Email,
  Language,
  LocationOn,
  Notes,
  Payments,
  CalendarMonth,
  Badge,
} from "@mui/icons-material";

import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";

import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa, deleteNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaModal from "./NhaKhoaModal";
import NhaKhoaUpdateModal from "./NhaKhoaUpdateModal";
import NhaKhoaDetailModal from "./NhaKhoaDetailModal";

// =====================================================
// GIAO DIỆN — bảng màu dùng chung cho toàn bộ component
// =====================================================
const ACCENT = "#0f766e"; // teal - màu chủ đạo
const ACCENT_SOFT = "#e6f4f2";
const AVATAR_PALETTE = [
  "#0f766e",
  "#0369a1",
  "#7c3aed",
  "#c2410c",
  "#be123c",
  "#4d7c0f",
  "#0891b2",
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

const getInitials = (name = "?") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// =====================================================
// FilterBar — thanh lọc tách riêng khỏi bảng chính.
// Ô nhập/select dùng state CỤC BỘ của component này, nên gõ phím
// chỉ khiến FilterBar re-render, KHÔNG kéo theo re-render toàn bộ
// bảng dữ liệu (vốn có thể rất nặng khi nhiều dòng). Chỉ khi bấm
// "Lọc" / nhấn Enter / xóa chip tỉnh thì mới báo lên component cha
// (qua onApply / onClearProvince) để thực sự lọc lại bảng.
// =====================================================
const FilterBar = React.memo(function FilterBar({
  provinces,
  appliedProvince,
  onApply,
  onClearProvince,
  onExportList,
  onOpenExportPrice,
  onRefresh,
}) {
  const [searchDraft, setSearchDraft] = useState("");
  const [provinceDraft, setProvinceDraft] = useState("");

  const handleApply = () => {
    onApply(searchDraft, provinceDraft);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  const handleClear = () => {
    setProvinceDraft("");
    onClearProvince();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "stretch", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 2,
        mb: 3,
        p: 2,
        borderRadius: "16px",
        backgroundColor: "#fff",
        border: "1px solid #eef0f2",
      }}
    >
      {/* LEFT */}
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          width: { xs: "100%", md: "auto" },
        }}
      >
        {appliedProvince && (
          <Chip
            label={`Tỉnh/Thành: ${appliedProvince}`}
            onDelete={handleClear}
            sx={{
              backgroundColor: ACCENT_SOFT,
              color: ACCENT,
              fontWeight: 600,
              "& .MuiChip-deleteIcon": { color: ACCENT },
            }}
          />
        )}

        <TextField
          select
          label="Tỉnh/Thành"
          size="small"
          value={provinceDraft}
          onChange={(e) => setProvinceDraft(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 220 } }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          {provinces.map((province, index) => (
            <MenuItem key={index} value={province}>
              {province}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* RIGHT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          width: { xs: "100%", md: "auto" },
        }}
      >
        <TextField
          size="small"
          placeholder="Tìm nha khoa..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, minWidth: { xs: "100%", sm: 250 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />

        <button
          onClick={handleApply}
          title="Lọc theo từ khóa và tỉnh/thành đã chọn"
          className="px-2 sm:px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition"
          style={{ backgroundColor: ACCENT }}
        >
          <SearchIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Lọc</span>
        </button>

        <button
          onClick={onExportList}
          title="Xuất excel danh sách nha khoa"
          className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium flex items-center gap-1 transition"
        >
          <DownloadIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Xuất danh sách</span>
        </button>

        <button
          onClick={onOpenExportPrice}
          title="Xuất excel bảng giá riêng"
          className="px-2 sm:px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium flex items-center gap-1 transition"
        >
          <DownloadIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Xuất bảng giá</span>
        </button>

        <NhaKhoaModal />

        <Tooltip title="Làm mới">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>

        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

// =====================================================
// DetailRow — một dòng thông tin trong Drawer chi tiết
// =====================================================
function DetailRow({ icon, label, value, valueColor, href }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.1 }}>
      <Box sx={{ color: "#94a3b8", mt: "2px", flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {label}
        </Typography>
        {href ? (
          <Typography
            component="a"
            href={href}
            target="_blank"
            rel="noreferrer"
            variant="body2"
            sx={{ color: ACCENT, fontWeight: 600, wordBreak: "break-word" }}
          >
            {value}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: valueColor || "text.primary",
              wordBreak: "break-word",
            }}
          >
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// =====================================================
// NhaKhoaDetailDrawer — drawer bên phải hiển thị chi tiết nha khoa
// =====================================================
function NhaKhoaDetailDrawer({ open, onClose, nhaKhoa, onEdit, onDelete }) {
  if (!nhaKhoa) return null;
  const ten = nhaKhoa.hoVaTen || nhaKhoa.tenGiaoDich || "—";
  const coNo = (nhaKhoa.tongCongNo ?? 0) > 0;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: "100vw", sm: 420 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          mt: "55px",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, #134e4a 100%)`,
            color: "#fff",
            px: 3,
            pt: 3,
            pb: 3,
            position: "relative",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 12, right: 12, color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "rgba(255,255,255,0.18)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {getInitials(ten)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ lineHeight: 1.25 }}
              >
                {ten}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                ID: {nhaKhoa._id}
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 2 }}>
            <Chip
              label={
                coNo
                  ? `Công nợ: ${nhaKhoa.tongCongNo.toLocaleString("vi-VN")}đ`
                  : "Không có công nợ"
              }
              size="small"
              sx={{
                backgroundColor: coNo ? "#fef2f2" : "rgba(255,255,255,0.18)",
                color: coNo ? "#ef4444" : "#fff",
                fontWeight: 700,
              }}
            />
          </Box>
        </Box>

        {/* NỘI DUNG */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Liên hệ
          </Typography>
          <DetailRow
            icon={<Phone fontSize="small" />}
            label="Điện thoại"
            value={nhaKhoa.soDienThoai}
          />
          <DetailRow
            icon={<Smartphone fontSize="small" />}
            label="Số di động"
            value={nhaKhoa.soDiDong}
          />
          <DetailRow
            icon={<Email fontSize="small" />}
            label="Email"
            value={nhaKhoa.email}
          />
          <DetailRow
            icon={<Language fontSize="small" />}
            label="Website"
            value={nhaKhoa.website}
            href={nhaKhoa.website ? `https://${nhaKhoa.website}` : undefined}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Địa chỉ
          </Typography>
          <DetailRow
            icon={<LocationOn fontSize="small" />}
            label="Địa chỉ cụ thể"
            value={nhaKhoa.diaChiCuThe}
          />
          <DetailRow
            icon={<LocationOn fontSize="small" />}
            label="Quận/Huyện"
            value={nhaKhoa.quanHuyen}
          />
          <DetailRow
            icon={<LocationOn fontSize="small" />}
            label="Tỉnh/Thành"
            value={nhaKhoa.tinh}
          />
          <DetailRow
            icon={<LocationOn fontSize="small" />}
            label="Quốc gia"
            value={nhaKhoa.quocGia}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Thông tin khác
          </Typography>
          <DetailRow
            icon={<Notes fontSize="small" />}
            label="Mô tả"
            value={nhaKhoa.moTa}
          />
          <DetailRow
            icon={<Payments fontSize="small" />}
            label="Công nợ"
            value={
              coNo ? `${nhaKhoa.tongCongNo.toLocaleString("vi-VN")}đ` : "0đ"
            }
            valueColor={coNo ? "#ef4444" : undefined}
          />
          <DetailRow
            icon={<Badge fontSize="small" />}
            label="Tiền tệ"
            value={nhaKhoa.tienTe || "VND"}
          />
          <DetailRow
            icon={<CalendarMonth fontSize="small" />}
            label="Ngày tạo"
            value={
              nhaKhoa.createdAt
                ? new Date(nhaKhoa.createdAt).toLocaleDateString("vi-VN")
                : "—"
            }
          />
        </Box>

        {/* FOOTER ACTIONS */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #eef0f2",
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit(nhaKhoa)}
            sx={{
              borderColor: ACCENT,
              color: ACCENT,
              "&:hover": { borderColor: ACCENT, backgroundColor: ACCENT_SOFT },
            }}
          >
            Chỉnh sửa
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => onDelete(nhaKhoa)}
          >
            Xóa
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default function NhaKhoaTable() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.nhaKhoa);

  // ===== STATE =====
  // Giá trị THỰC SỰ dùng để lọc bảng — chỉ được cập nhật khi người dùng
  // bấm nút "Lọc" / nhấn Enter trong FilterBar (component con, xem phía trên).
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedProvince, setAppliedProvince] = useState("");
  const [favorites, setFavorites] = useState([]);

  // State quản lý Modal Xuất Excel
  const [openExport, setOpenExport] = useState(false);
  const [selectedExportNhaKhoa, setSelectedExportNhaKhoa] = useState("");

  // ===== DRAWER CHI TIẾT =====
  const [detailTarget, setDetailTarget] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const handleOpenDetail = (item) => {
    setDetailTarget(item);
    setOpenDetail(true);
  };

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // ===== DANH SÁCH TỈNH THÀNH =====
  const provinces = useMemo(() => {
    return [...new Set(data?.map((i) => i.tinh).filter(Boolean))];
  }, [data]);

  // ===== FILTER =====
  // Bỏ dấu tiếng Việt để search không phân biệt có dấu / không dấu
  const chuanHoa = (str) =>
    (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase();

  const filteredData = useMemo(() => {
    const keyword = chuanHoa(appliedSearch.trim());

    return (data || []).filter((item) => {
      const matchSearch =
        keyword === "" ||
        [
          item.hoVaTen,
          item.tenGiaoDich,
          item.email,
          item.soDienThoai,
          item.diaChiCuThe,
          item.quanHuyen,
          item.tinh,
          item.website,
        ].some((field) => field && chuanHoa(field).includes(keyword));

      const matchProvince = appliedProvince
        ? item.tinh === appliedProvince
        : true;

      return matchSearch && matchProvince;
    });
  }, [data, appliedSearch, appliedProvince]);

  // Áp dụng bộ lọc — được gọi từ FilterBar khi bấm nút "Lọc" hoặc nhấn Enter
  const handleApplyFilter = (searchValue, provinceValue) => {
    setAppliedSearch(searchValue);
    setAppliedProvince(provinceValue);
  };

  // Xóa điều kiện lọc theo tỉnh/thành đã áp dụng
  const handleClearProvince = () => {
    setAppliedProvince("");
  };

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ===== UPDATE =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleOpenEdit = (item) => {
    setSelectedRow(item);
    setOpenEdit(true);
    setOpenDetail(false);
  };

  // ===== DELETE =====
  const [deleteTarget, setDeleteTarget] = useState(null); // item đang chờ xác nhận xóa
  const [deletingId, setDeletingId] = useState(null); // id đang trong quá trình xóa (hiện loading)

  const handleAskDelete = (item) => {
    setDeleteTarget(item);
    setOpenDetail(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeletingId(deleteTarget._id);
    try {
      const result = await dispatch(deleteNhaKhoa(deleteTarget._id));
      if (deleteNhaKhoa.fulfilled.match(result)) {
        toast.success("Đã xóa nha khoa thành công");
      } else {
        toast.error(result.payload || "Xóa thất bại");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa nha khoa");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // Hàm xử lý khi bấm nút Xuất trong Modal
  const handleExportSubmit = async () => {
    try {
      if (!selectedExportNhaKhoa) return;

      const selectedNhaKhoaInfo = data.find(
        (nk) => nk._id === selectedExportNhaKhoa
      );

      const response = await api.get(
        `/bang-gia/nha-khoa/${selectedExportNhaKhoa}`
      );
      const bangGiaData = response.data; // Mảng chứa [{ tenSanPham, donGia, laGiaRieng... }]

      await exportBangGiaRiengToExcel(selectedNhaKhoaInfo, bangGiaData);

      setOpenExport(false);
      setSelectedExportNhaKhoa("");
    } catch (error) {
      console.error("Lỗi khi xuất bảng giá:", error);
      toast.error("Đã xảy ra lỗi khi lấy dữ liệu bảng giá. Vui lòng thử lại!");
    }
  };

  return (
    <Box>
      {/* ===== FILTER BAR ===== */}
      <FilterBar
        provinces={provinces}
        appliedProvince={appliedProvince}
        onApply={handleApplyFilter}
        onClearProvince={handleClearProvince}
        onExportList={() => exportDanhSachNhaKhoaToExcel(filteredData)}
        onOpenExportPrice={() => setOpenExport(true)}
        onRefresh={() => dispatch(fetchNhaKhoa())}
      />

      {/* ===== DESKTOP TABLE ===== */}
      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "18px",
            boxShadow:
              "0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.05)",
            border: "1px solid #eef0f2",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 1.5,
              borderBottom: "1px solid #eef0f2",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              Tổng số {data?.length || 0} nha khoa
            </Typography>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Nha khoa
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Địa chỉ
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Mô tả
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#334155" }}
                  align="right"
                >
                  Công nợ
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#334155", width: 130 }}
                  align="center"
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: ACCENT }} />
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredData.map((item) => {
                  const ten = item.hoVaTen || item.tenGiaoDich || "—";
                  const coNo = (item.tongCongNo ?? 0) > 0;
                  return (
                    <TableRow
                      key={item._id}
                      hover
                      onClick={() => handleOpenDetail(item)}
                      sx={{
                        cursor: "pointer",
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: getAvatarColor(ten),
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {getInitials(ten)}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              noWrap
                              sx={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {ten}
                            </Typography>
                            <Typography
                              noWrap
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {item._id?.slice(-6)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography noWrap variant="body2">
                          {item.diaChiCuThe || "—"}
                        </Typography>
                        <Typography
                          noWrap
                          variant="caption"
                          color="text.secondary"
                        >
                          {[item.quanHuyen, item.tinh]
                            .filter(Boolean)
                            .join(", ")}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography
                          noWrap
                          variant="body2"
                          color="text.secondary"
                        >
                          {item.moTa || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {coNo ? (
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: "#ef4444",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.tongCongNo.toLocaleString("vi-VN")}đ
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={
                            item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "—"
                          }
                          size="small"
                          sx={{
                            backgroundColor: ACCENT_SOFT,
                            color: ACCENT,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <NhaKhoaDetailModal nhaKhoaData={item} />
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit sx={{ fontSize: 18, color: ACCENT }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Delete sx={{ fontSize: 18, color: "#ef4444" }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderTop: "1px solid #eef0f2",
              textAlign: "right",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Tổng số {data?.length || 0} nha khoa
            </Typography>
          </Box>
        </TableContainer>
      </Box>

      {/* ===== MOBILE CARD ===== */}
      <Box
        sx={{
          display: { xs: "flex", lg: "none" },
          flexDirection: "column",
          gap: 2,
        }}
      >
        {loading && (
          <Box className="flex justify-center py-10">
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        )}

        {!loading && filteredData.length === 0 && (
          <Paper className="p-5 text-center" sx={{ borderRadius: "16px" }}>
            Không có dữ liệu
          </Paper>
        )}

        {!loading &&
          filteredData.map((item) => {
            const ten = item.hoVaTen || item.tenGiaoDich || "—";
            return (
              <Card
                key={item._id}
                sx={{ borderRadius: "16px", boxShadow: 2, cursor: "pointer" }}
                onClick={() => handleOpenDetail(item)}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  {/* HEADER */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      pt: 1.5,
                      pb: 1,
                      gap: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: getAvatarColor(ten),
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {getInitials(ten)}
                    </Avatar>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        fontWeight={700}
                        fontSize={14}
                        lineHeight={1.3}
                        noWrap
                      >
                        {ten}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item._id);
                      }}
                    >
                      {favorites.includes(item._id) ? (
                        <Star sx={{ fontSize: 20, color: "#facc15" }} />
                      ) : (
                        <StarBorder sx={{ fontSize: 20, color: "#9ca3af" }} />
                      )}
                    </IconButton>
                  </Box>

                  <Divider />

                  {/* ROWS */}
                  {[
                    { label: "Địa chỉ", value: item.diaChiCuThe || "" },
                    { label: "Quận/Huyện", value: item.quanHuyen || "" },
                    { label: "Tỉnh", value: item.tinh || "" },
                    {
                      label: "Công nợ",
                      value:
                        (item.tongCongNo ?? 0) > 0
                          ? `${item.tongCongNo.toLocaleString("vi-VN")}đ`
                          : "0đ",
                      valueColor:
                        (item.tongCongNo ?? 0) > 0 ? "#ef4444" : undefined,
                    },
                    {
                      label: "Ngày tạo",
                      value: item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                        : "",
                    },
                  ].map((row, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 0.9,
                        borderBottom: "1px solid #f3f4f6",
                        "&:last-of-type": { borderBottom: "none" },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ minWidth: 100 }}
                      >
                        {row.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={row.valueColor ? 700 : 500}
                        sx={{
                          color: row.valueColor || "text.primary",
                          textAlign: "right",
                        }}
                      >
                        {row.value}
                      </Typography>
                    </Box>
                  ))}

                  {/* FOOTER ACTIONS */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      px: 1,
                      py: 0.5,
                      borderTop: "1px solid #f3f4f6",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <NhaKhoaDetailModal nhaKhoaData={item} />
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit sx={{ fontSize: 18, color: ACCENT }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(item)}
                      >
                        <Delete sx={{ fontSize: 18, color: "#ef4444" }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Box>

      {/* ===== DRAWER CHI TIẾT NHA KHOA ===== */}
      <NhaKhoaDetailDrawer
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        nhaKhoa={detailTarget}
        onEdit={handleOpenEdit}
        onDelete={handleAskDelete}
      />

      {/* ===== UPDATE MODAL ===== */}
      <NhaKhoaUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />

      {/* ===== DIALOG XÁC NHẬN XÓA NHA KHOA ===== */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => (deletingId ? null : setDeleteTarget(null))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa nha khoa{" "}
            <b>{deleteTarget?.hoVaTen || deleteTarget?.tenGiaoDich}</b>? Hành
            động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            color="inherit"
            disabled={!!deletingId}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={!!deletingId}
            startIcon={
              deletingId ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Delete />
              )
            }
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL CHỌN NHA KHOA ĐỂ XUẤT EXCEL ===== */}
      <Dialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Xuất Bảng Giá Riêng Ra Excel
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Vui lòng chọn Nha khoa để xuất file Bảng giá tương ứng.
            </Typography>
            <TextField
              select
              fullWidth
              label="Chọn Nha Khoa"
              value={selectedExportNhaKhoa}
              onChange={(e) => setSelectedExportNhaKhoa(e.target.value)}
            >
              <MenuItem value="" disabled>
                -- Chọn Nha Khoa --
              </MenuItem>
              {data &&
                data.map((nk) => (
                  <MenuItem key={nk._id} value={nk._id}>
                    {nk.hoVaTen || nk.tenGiaoDich}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenExport(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            disabled={!selectedExportNhaKhoa}
            onClick={handleExportSubmit}
            startIcon={<DownloadIcon />}
            sx={{
              backgroundColor: ACCENT,
              "&:hover": { backgroundColor: "#0d6560" },
            }}
          >
            Tiến hành xuất
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
