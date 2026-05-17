import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../config/api";
import { exportBangGiaRiengToExcel } from "../../utils/exportToExcel";
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
    return data.filter((item) => {
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

      const selectedNhaKhoaInfo = data.find(nk => nk._id === selectedExportNhaKhoa);

      const response = await api.get(`/bang-gia/nha-khoa/${selectedExportNhaKhoa}`);
      const bangGiaData = response.data; // Mảng chứa [{ tenSanPham, donGia, laGiaRieng... }]

      await exportBangGiaRiengToExcel(selectedNhaKhoaInfo, bangGiaData); // Hoặc truyền chiXuatGiaRieng

      setOpenExport(false);
      setSelectedExportNhaKhoa("");
    } catch (error) {
      console.error("Lỗi khi xuất bảng giá:", error);
      alert("Đã xảy ra lỗi khi lấy dữ liệu bảng giá. Vui lòng thử lại!");
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

          {/* NÚT XUẤT EXCEL */}
          <button
            onClick={() => setOpenExport(true)}
            title="Xuất excel bảng giá riêng"
            className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            <span className="hidden sm:inline">Xuất excel</span>
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
              <TableRow className="bg-gray-100">
                <TableCell></TableCell>
                <TableCell><b>Tên</b></TableCell>
                <TableCell><b>Liên hệ</b></TableCell>
                <TableCell><b>Địa chỉ</b></TableCell>
                <TableCell><b>Website</b></TableCell>
                <TableCell><b>Mô tả</b></TableCell>
                <TableCell><b>Ngày tạo</b></TableCell>
                <TableCell align="center"><b>Hành động</b></TableCell>
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

              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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
            <Card
              key={item._id}
              sx={{
                borderRadius: "18px",
                boxShadow: 3,
              }}
            >
              <CardContent>
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography fontWeight={700}>{item.hoVaTen}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {item._id.slice(-6)}
                    </Typography>
                  </Box>

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
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={600}>Liên hệ</Typography>
                  <Typography variant="body2">{item.soDienThoai}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#1976d2", wordBreak: "break-word" }}
                  >
                    {item.email}
                  </Typography>
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={600}>Địa chỉ</Typography>
                  <Typography variant="body2">{item.diaChiCuThe}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.tinh}, {item.quocGia}
                  </Typography>
                </Box>

                <Box mb={1}>
                  <Typography variant="body2" fontWeight={600}>Website</Typography>
                  <a
                    href={`https://${item.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 break-all"
                  >
                    {item.website}
                  </a>
                </Box>

                <Box mb={2}>
                  <Typography variant="body2" fontWeight={600}>Mô tả</Typography>
                  <Typography variant="body2">
                    {item.moTa || "Không có mô tả"}
                  </Typography>
                </Box>

                <Box className="flex justify-between items-center flex-wrap gap-2">
                  <Chip
                    label={new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    color="success"
                    size="small"
                  />

                  <Box className="flex items-center">
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
                  </Box>
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
              {data && data.map((nk) => (
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