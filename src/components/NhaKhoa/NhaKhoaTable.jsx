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
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
} from "@mui/icons-material";

import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download"; // Thêm icon Download

import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaModal from "./NhaKhoaModal";
import NhaKhoaUpdateModal from "./NhaKhoaUpdateModal";
import NhaKhoaDetailModal from "./NhaKhoaDetailModal";

export default function NhaKhoaTable() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.nhaKhoa);

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [favorites, setFavorites] = useState([]);

  // State quản lý Modal Xuất Excel
  const [openExport, setOpenExport] = useState(false);
  const [selectedExportNhaKhoa, setSelectedExportNhaKhoa] = useState("");

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // ===== DANH SÁCH TỈNH THÀNH =====
  const provinces = useMemo(() => {
    return [...new Set(data?.map((i) => i.tinh).filter(Boolean))];
  }, [data]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return (data || []).filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.soDienThoai?.includes(keyword) ||
        item.diaChiCuThe?.toLowerCase().includes(keyword);

      const matchProvince = selectedProvince
        ? item.tinh === selectedProvince
        : true;

      return matchSearch && matchProvince;
    });
  }, [data, search, selectedProvince]);

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ===== UPDATE =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

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

      await exportBangGiaRiengToExcel(selectedNhaKhoaInfo, bangGiaData); // Hoặc truyền chiXuatGiaRieng

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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          {/* CHIP */}
          {selectedProvince && (
            <Chip
              label={`Tỉnh/Thành: ${selectedProvince}`}
              onDelete={() => setSelectedProvince("")}
            />
          )}

          {/* SELECT */}
          <TextField
            select
            label="Tỉnh/Thành"
            size="small"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 220,
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
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
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          {/* SEARCH */}
          <TextField
            size="small"
            placeholder="Tìm nha khoa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: {
                xs: "100%",
                sm: 250,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          {/* NÚT XUẤT DANH SÁCH */}
          <button
            onClick={() => exportDanhSachNhaKhoaToExcel(filteredData)}
            title="Xuất excel danh sách nha khoa"
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            <span className="hidden sm:inline">Xuất danh sách</span>
          </button>

          {/* NÚT XUẤT BẢNG GIÁ RIÊNG */}
          <button
            onClick={() => setOpenExport(true)}
            title="Xuất excel bảng giá riêng"
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            <span className="hidden sm:inline">Xuất bảng giá</span>
          </button>

          <NhaKhoaModal />

          {/* REFRESH */}
          <IconButton onClick={() => dispatch(fetchNhaKhoa())}>
            <RefreshIcon />
          </IconButton>

          {/* MORE */}
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ===== DESKTOP TABLE ===== */}
      <Box
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
        }}
      >
        <TableContainer component={Paper} className="rounded-2xl shadow-lg">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={9} align="left">
                  <Typography variant="caption" color="text.secondary">
                    Tổng số {data?.length} nha khoa
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow className="bg-gray-100">
                <TableCell></TableCell>
                <TableCell>
                  <b>Tên</b>
                </TableCell>
                <TableCell>
                  <b>Liên hệ</b>
                </TableCell>
                <TableCell>
                  <b>Địa chỉ</b>
                </TableCell>
                <TableCell>
                  <b>Website</b>
                </TableCell>
                <TableCell>
                  <b>Mô tả</b>
                </TableCell>
                <TableCell>
                  <b>Công nợ</b>
                </TableCell>
                <TableCell>
                  <b>Ngày tạo</b>
                </TableCell>
                <TableCell align="center">
                  <b>Hành động</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {filteredData.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(item._id)}
                    >
                      {favorites.includes(item._id) ? (
                        <Star className="text-yellow-400" />
                      ) : (
                        <StarBorder className="text-gray-400" />
                      )}
                    </IconButton>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-gray-800">
                      {item.hoVaTen}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {item._id.slice(-6)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>{item.soDienThoai}</div>
                    <div className="text-xs text-blue-500">{item.email}</div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">{item.diaChiCuThe}</div>
                    <div className="text-xs text-gray-500">
                      {item.tinh}, {item.quocGia}
                    </div>
                  </TableCell>

                  <TableCell>
                    <a
                      href={`https://${item.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {item.website}
                    </a>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[200px] truncate">{item.moTa}</div>
                  </TableCell>

                  <TableCell>
                    {(item.tongCongNo ?? 0) > 0 ? (
                      <span className="font-semibold text-red-500">
                        {item.tongCongNo.toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={new Date(item.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                      color="success"
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <div className="flex items-center justify-center">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRow(item);
                            setOpenEdit(true);
                          }}
                        >
                          <Edit className="text-blue-500" />
                        </IconButton>
                      </Tooltip>

                      <NhaKhoaDetailModal nhaKhoaData={item} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={9} align="right">
                  <Typography variant="caption" color="text.secondary">
                    Tổng số {data?.length} nha khoa
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ===== MOBILE CARD ===== */}
      <Box
        sx={{
          display: {
            xs: "flex",
            lg: "none",
          },
          flexDirection: "column",
          gap: 2,
        }}
      >
        {loading && (
          <Box className="flex justify-center py-10">
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredData.length === 0 && (
          <Paper className="p-5 text-center">Không có dữ liệu</Paper>
        )}

        {!loading &&
          filteredData.map((item) => (
            <Card key={item._id} sx={{ borderRadius: "16px", boxShadow: 2 }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {/* HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    px: 2,
                    pt: 1.5,
                    pb: 1,
                  }}
                >
                  {/* Avatar chữ cái */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#9e9e9e",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {(item.hoVaTen || item.tenGiaoDich || "?")
                        .split(" ")
                        .slice(-2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </Box>
                  </Box>

                  {/* Tên nha khoa + favorite */}
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    <Typography fontWeight={700} fontSize={14} lineHeight={1.3}>
                      {item.hoVaTen || item.tenGiaoDich}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(item._id)}
                    sx={{ ml: 0.5, mt: -0.5 }}
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
                  { label: "CLINIC", value: item.hoVaTen || item.tenGiaoDich },
                  { label: "Địa chỉ", value: item.diaChiCuThe || "" },
                  { label: "Quận/Huyện", value: item.quanHuyen || "" },
                  { label: "Tỉnh", value: item.tinh || "" },
                  { label: "Điện thoại", value: item.soDienThoai || "" },
                  {
                    label: "Số di động",
                    value: item.soDiDong || item.soDienThoai || "",
                  },
                  {
                    label: "Công nợ",
                    value:
                      (item.tongCongNo ?? 0) > 0
                        ? item.tongCongNo.toLocaleString("vi-VN")
                        : "0",
                    valueColor:
                      (item.tongCongNo ?? 0) > 0 ? "#ef4444" : undefined,
                  },
                  { label: "Tiền tệ", value: item.tienTe || "VND" },
                  { label: "Email", value: item.email || "" },
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
                      fontWeight={row.valueColor ? 600 : 400}
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
                >
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRow(item);
                        setOpenEdit(true);
                      }}
                    >
                      <Edit sx={{ fontSize: 18, color: "#3b82f6" }} />
                    </IconButton>
                  </Tooltip>
                  <NhaKhoaDetailModal nhaKhoaData={item} />
                </Box>
              </CardContent>
            </Card>
          ))}
      </Box>

      {/* ===== UPDATE MODAL ===== */}
      <NhaKhoaUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />

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
            color="info"
            disabled={!selectedExportNhaKhoa}
            onClick={handleExportSubmit}
            startIcon={<DownloadIcon />}
          >
            Tiến hành xuất
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
