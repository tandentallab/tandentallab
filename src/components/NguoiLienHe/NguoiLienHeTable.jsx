import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Box,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Avatar,
  Drawer,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
  Close as CloseIcon,
  Phone,
  Email as EmailIcon,
  Notes,
  CalendarMonth,
  Business,
  Title as TitleIcon,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { fetchNguoiLienHe } from "../../redux/slices/nguoiLienHeSlice";
import NguoiLienHeModal from "./NguoiLienHeModal";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import NguoiLienHeUpdateModal from "./NguoiLienHeUpdateModal";
import { exportDanhSachNguoiLienHeToExcel } from "../../utils/exportToExcel";

// =====================================================
// GIAO DIỆN — cùng bảng màu với trang Nha khoa
// =====================================================
const ACCENT = "#0f766e";
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
// DetailRow — một dòng thông tin trong Drawer chi tiết
// =====================================================
function DetailRow({ icon, label, value, valueColor }) {
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
      </Box>
    </Box>
  );
}

// =====================================================
// NguoiLienHeDetailDrawer — drawer bên phải hiển thị chi tiết liên hệ
// =====================================================
function NguoiLienHeDetailDrawer({ open, onClose, nguoiLienHe, onEdit }) {
  if (!nguoiLienHe) return null;
  const ten = nguoiLienHe.hoVaTen || "—";

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
                ID: {nguoiLienHe._id}
              </Typography>
            </Box>
          </Stack>
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
            label="Số điện thoại"
            value={nguoiLienHe.soDienThoai}
          />
          <DetailRow
            icon={<EmailIcon fontSize="small" />}
            label="Email"
            value={nguoiLienHe.email}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Nội dung liên hệ
          </Typography>
          <DetailRow
            icon={<TitleIcon fontSize="small" />}
            label="Tiêu đề"
            value={nguoiLienHe.tieuDe}
          />
          <DetailRow
            icon={<Notes fontSize="small" />}
            label="Mô tả"
            value={nguoiLienHe.moTa}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Thông tin khác
          </Typography>
          <DetailRow
            icon={<Business fontSize="small" />}
            label="Nha khoa"
            value={nguoiLienHe.nhaKhoa?.hoVaTen}
          />
          <DetailRow
            icon={<CalendarMonth fontSize="small" />}
            label="Ngày tạo"
            value={
              nguoiLienHe.createdAt
                ? new Date(nguoiLienHe.createdAt).toLocaleDateString("vi-VN")
                : "—"
            }
          />
        </Box>

        {/* FOOTER ACTIONS */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #eef0f2" }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit(nguoiLienHe)}
            sx={{
              borderColor: ACCENT,
              color: ACCENT,
              "&:hover": { borderColor: ACCENT, backgroundColor: ACCENT_SOFT },
            }}
          >
            Chỉnh sửa
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

export default function NguoiLienHeTable() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.nguoiLienHe);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [favorites, setFavorites] = useState([]);

  const clinicList = useMemo(() => {
    return [...new Set(data?.map((i) => i.nhaKhoa?.hoVaTen).filter(Boolean))];
  }, [data]);

  useEffect(() => {
    dispatch(fetchNguoiLienHe());
  }, [dispatch]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.soDienThoai?.includes(search);

      const matchClinic = selectedClinic
        ? item.nhaKhoa?.hoVaTen === selectedClinic
        : true;

      return matchSearch && matchClinic;
    });
  }, [data, search, selectedClinic]);

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ===== UPDATE =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEdit = (item) => {
    setSelectedRow(item);
    setOpenEdit(true);
    setOpenDetail(false);
  };

  // ===== DRAWER CHI TIẾT =====
  const [detailTarget, setDetailTarget] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const handleOpenDetail = (item) => {
    setDetailTarget(item);
    setOpenDetail(true);
  };

  return (
    <Box>
      {/* ===== HEADER ===== */}
      <Box
        className="mb-4"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
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
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {selectedClinic && (
            <Chip
              label={`Khách hàng: ${selectedClinic}`}
              onDelete={() => setSelectedClinic("")}
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
            label="Nha khoa"
            size="small"
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {clinicList.map((c, index) => (
              <MenuItem key={index} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", md: "auto" },
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm liên hệ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isMobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          <NguoiLienHeModal />

          <Tooltip title="Xuất excel danh sách">
            <IconButton
              onClick={() => exportDanhSachNguoiLienHeToExcel(filteredData)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(fetchNguoiLienHe())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ height: 16 }} />

      {/* ===== MOBILE VIEW ===== */}
      {isMobile ? (
        <Box className="flex flex-col gap-3">
          {loading && (
            <Box className="flex justify-center py-10">
              <CircularProgress sx={{ color: ACCENT }} />
            </Box>
          )}

          {error && (
            <Card sx={{ borderRadius: "16px" }}>
              <CardContent>
                <Typography color="error">{error}</Typography>
              </CardContent>
            </Card>
          )}

          {!loading && filteredData.length === 0 && (
            <Card sx={{ borderRadius: "16px" }}>
              <CardContent>
                <Typography align="center">Không có dữ liệu</Typography>
              </CardContent>
            </Card>
          )}

          {!loading &&
            filteredData.map((item) => {
              const ten = item.hoVaTen || "—";
              return (
                <Card
                  key={item._id}
                  sx={{ borderRadius: "16px", boxShadow: 2, cursor: "pointer" }}
                  onClick={() => handleOpenDetail(item)}
                >
                  <CardContent>
                    <Box className="flex justify-between items-start">
                      <Stack direction="row" spacing={1.5} alignItems="center">
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
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {ten}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {item._id.slice(-6)}
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item._id);
                        }}
                      >
                        {favorites.includes(item._id) ? (
                          <Star className="text-yellow-400" />
                        ) : (
                          <StarBorder className="text-gray-400" />
                        )}
                      </IconButton>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box className="space-y-1">
                      <Typography variant="body2">
                        <b>Nha khoa:</b> {item.nhaKhoa?.hoVaTen || "-"}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        <b>Mô tả:</b> {item.moTa || "-"}
                      </Typography>
                    </Box>

                    <Box
                      className="flex justify-end mt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit sx={{ color: ACCENT }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
        </Box>
      ) : (
        /* ===== DESKTOP TABLE ===== */
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
              Tổng số {data?.length || 0} người liên hệ
            </Typography>
          </Box>

          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Người liên hệ
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Nha khoa
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Mô tả
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#334155", width: 90 }}
                  align="center"
                >
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: ACCENT }} />
                  </TableCell>
                </TableRow>
              )}

              {error && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    className="text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 6, color: "text.secondary" }}
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filteredData.map((item) => {
                  const ten = item.hoVaTen || "—";
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
                      <TableCell sx={{ maxWidth: 240 }}>
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
                              {item.email ||
                                item.soDienThoai ||
                                `ID: ${item._id.slice(-6)}`}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          noWrap
                          sx={{ fontWeight: 600, color: "#1e293b" }}
                        >
                          {item.nhaKhoa?.hoVaTen || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography
                          noWrap
                          variant="body2"
                          color="text.secondary"
                        >
                          {item.moTa || "—"}
                        </Typography>
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
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit sx={{ fontSize: 18, color: ACCENT }} />
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
              Tổng số {data?.length || 0} người liên hệ
            </Typography>
          </Box>
        </TableContainer>
      )}

      {/* ===== DRAWER CHI TIẾT ===== */}
      <NguoiLienHeDetailDrawer
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        nguoiLienHe={detailTarget}
        onEdit={handleEdit}
      />

      {/* ===== MODAL UPDATE ===== */}
      <NguoiLienHeUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />
    </Box>
  );
}
