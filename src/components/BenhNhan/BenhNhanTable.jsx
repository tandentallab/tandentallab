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
  IconButton,
  Chip,
  Box,
  InputAdornment,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Divider,
  Stack,
  Avatar,
  Drawer,
  Button,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import WcIcon from "@mui/icons-material/Wc";
import CampaignIcon from "@mui/icons-material/Campaign";
import BusinessIcon from "@mui/icons-material/Business";
import FolderIcon from "@mui/icons-material/Folder";

import { useDispatch, useSelector } from "react-redux";
import { fetchBenhNhan } from "../../redux/slices/benhNhanSlice";
import BenhNhanModal from "./BenhNhanModal";
import BenhNhanUpdateModal from "./BenhNhanUpdateModal";
import { exportDanhSachBenhNhanToExcel } from "../../utils/exportToExcel";

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
// BenhNhanDetailDrawer — drawer bên phải hiển thị chi tiết bệnh nhân
// =====================================================
function BenhNhanDetailDrawer({ open, onClose, benhNhan, onEdit }) {
  if (!benhNhan) return null;
  const ten = benhNhan.hoVaTen || "—";

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
                Số hồ sơ: {benhNhan.soHoSo || "—"}
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
            Thông tin cá nhân
          </Typography>
          <DetailRow
            icon={<BadgeIcon fontSize="small" />}
            label="CCCD"
            value={benhNhan.CCCD}
          />
          <DetailRow
            icon={<WcIcon fontSize="small" />}
            label="Giới tính"
            value={benhNhan.gioiTinh}
          />
          <DetailRow
            icon={<CalendarMonthIcon fontSize="small" />}
            label="Ngày sinh"
            value={
              benhNhan.ngaySinh
                ? new Date(benhNhan.ngaySinh).toLocaleDateString("vi-VN")
                : benhNhan.namSinh
            }
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Liên hệ
          </Typography>
          <DetailRow
            icon={<PhoneIcon fontSize="small" />}
            label="Số điện thoại"
            value={benhNhan.soDienThoai}
          />
          <DetailRow
            icon={<EmailIcon fontSize="small" />}
            label="Email"
            value={benhNhan.email}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Địa chỉ
          </Typography>
          <DetailRow
            icon={<LocationOnIcon fontSize="small" />}
            label="Địa chỉ cụ thể"
            value={benhNhan.diaChiCuThe}
          />
          <DetailRow
            icon={<LocationOnIcon fontSize="small" />}
            label="Quận/Huyện"
            value={benhNhan.quanHuyen}
          />
          <DetailRow
            icon={<LocationOnIcon fontSize="small" />}
            label="Tỉnh/Thành"
            value={benhNhan.tinh}
          />
          <DetailRow
            icon={<LocationOnIcon fontSize="small" />}
            label="Quốc gia"
            value={benhNhan.quocGia}
          />

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="overline"
            sx={{ color: ACCENT, fontWeight: 700 }}
          >
            Thông tin khác
          </Typography>
          <DetailRow
            icon={<CampaignIcon fontSize="small" />}
            label="Nguồn"
            value={benhNhan.nguon}
          />
          <DetailRow
            icon={<BusinessIcon fontSize="small" />}
            label="Nha khoa"
            value={benhNhan.nhaKhoa?.hoVaTen}
          />
          <DetailRow
            icon={<CalendarMonthIcon fontSize="small" />}
            label="Ngày tạo"
            value={
              benhNhan.createdAt
                ? new Date(benhNhan.createdAt).toLocaleDateString("vi-VN")
                : "—"
            }
          />
        </Box>

        {/* FOOTER ACTIONS */}
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #eef0f2" }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(benhNhan)}
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

export default function BenhNhanTable() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.benhNhan);

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    dispatch(fetchBenhNhan());
  }, [dispatch]);

  // ===== DANH SÁCH NHA KHOA =====
  const clinicList = useMemo(() => {
    return [...new Set(data?.map((i) => i.nhaKhoa?.hoVaTen).filter(Boolean))];
  }, [data]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(search.toLowerCase()) ||
        item.soHoSo?.toLowerCase().includes(search.toLowerCase());

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

  // ===== EDIT =====
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
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            width: { xs: "100%", md: "auto" },
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm liên hệ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: { xs: "100%", sm: 250 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          <BenhNhanModal />

          <Tooltip title="Xuất excel danh sách">
            <IconButton
              onClick={() => exportDanhSachBenhNhanToExcel(filteredData)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(fetchBenhNhan())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

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
              Tổng số {data?.length || 0} bệnh nhân
            </Typography>
          </Box>

          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Bệnh nhân
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Giới tính
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#334155" }}>
                  Nha khoa
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
                  const isFav = favorites.includes(item._id);
                  const ten = item.hoVaTen || "—";

                  return (
                    <TableRow
                      key={item._id}
                      hover
                      onClick={() => handleOpenDetail(item)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor: isFav ? "#fffbeb" : "inherit",
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >
                      {/* TÊN */}
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
                              Hồ sơ: {item.soHoSo || item._id.slice(-6)}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* GIỚI TÍNH */}
                      <TableCell>
                        <Chip
                          label={item.gioiTinh || "—"}
                          size="small"
                          sx={{
                            backgroundColor:
                              item.gioiTinh === "Nữ" ? "#fce7f3" : "#e0f2fe",
                            color:
                              item.gioiTinh === "Nữ" ? "#be185d" : "#0369a1",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      {/* NHA KHOA */}
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography
                          noWrap
                          sx={{ fontWeight: 600, color: "#1e293b" }}
                        >
                          {item.nhaKhoa?.hoVaTen || "-"}
                        </Typography>
                      </TableCell>

                      {/* NGÀY TẠO */}
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

                      {/* EDIT */}
                      <TableCell
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                          >
                            <EditIcon sx={{ fontSize: 18, color: ACCENT }} />
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
              Tổng số {data?.length || 0} bệnh nhân
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

        {error && (
          <Paper
            className="p-5 text-center text-red-500"
            sx={{ borderRadius: "16px" }}
          >
            {error}
          </Paper>
        )}

        {!loading && filteredData.length === 0 && (
          <Paper className="p-5 text-center" sx={{ borderRadius: "16px" }}>
            Không có dữ liệu
          </Paper>
        )}

        {!loading &&
          filteredData.map((item) => {
            const isFav = favorites.includes(item._id);
            const ten = item.hoVaTen || "—";

            return (
              <Card
                key={item._id}
                sx={{
                  borderRadius: "18px",
                  boxShadow: 3,
                  backgroundColor: isFav ? "#FEFCE8" : "#fff",
                  cursor: "pointer",
                }}
                onClick={() => handleOpenDetail(item)}
              >
                <CardContent>
                  {/* HEADER */}
                  <Box className="flex justify-between items-start">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: getAvatarColor(ten),
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        {getInitials(ten)}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700}>{ten}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Hồ sơ: {item.soHoSo || item._id.slice(-6)}
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
                      {isFav ? (
                        <StarIcon sx={{ color: "#facc15" }} />
                      ) : (
                        <StarBorderIcon sx={{ color: "#9ca3af" }} />
                      )}
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* GIỚI TÍNH */}
                  <Box
                    mb={1.5}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Giới tính
                    </Typography>
                    <Chip
                      label={item.gioiTinh || "—"}
                      size="small"
                      sx={{
                        backgroundColor:
                          item.gioiTinh === "Nữ" ? "#fce7f3" : "#e0f2fe",
                        color: item.gioiTinh === "Nữ" ? "#be185d" : "#0369a1",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  {/* NHA KHOA */}
                  <Box
                    mb={1}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Nha khoa
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.nhaKhoa?.hoVaTen || "-"}
                    </Typography>
                  </Box>

                  {/* ACTION */}
                  <Box
                    className="flex justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditIcon sx={{ color: ACCENT }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Box>

      {/* ===== DRAWER CHI TIẾT ===== */}
      <BenhNhanDetailDrawer
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        benhNhan={detailTarget}
        onEdit={handleEdit}
      />

      {/* ===== UPDATE MODAL ===== */}
      <BenhNhanUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />
    </Box>
  );
}
