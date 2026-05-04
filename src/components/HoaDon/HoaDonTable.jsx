import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  Chip,
  Modal,
  Box,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  deleteHoaDon,
  fetchAllHoaDonAdmin,
  updateHoaDon,
} from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import ClearIcon from "@mui/icons-material/Clear";
import { SearchIcon, TrashIcon } from "lucide-react";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", md: 650 },
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const HoaDonTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Lấy dữ liệu từ Redux
  const { danhSachHoaDon, pagination, loading } = useSelector(
    (state) => state.hoaDon
  );
  const nhaKhoa = useSelector((state) => state.nhaKhoa);

  // State quản lý Modal
  const [selectedHD, setSelectedHD] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  // State cho phân trang và bộ lọc
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterNhaKhoa, setFilterNhaKhoa] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");

  // State xử lý Tìm kiếm (Search)
  const [searchTerm, setSearchTerm] = useState(""); // Giá trị gõ tức thời
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Giá trị dùng để gọi API

  // Lấy danh sách nha khoa khi component mount
  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // Xử lý Debounce cho ô tìm kiếm: Đợi người dùng ngừng gõ 500ms mới set search chính
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset về trang 1 khi bắt đầu tìm kiếm mới
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Gọi API lấy hóa đơn khi các tham số thay đổi
  useEffect(() => {
    dispatch(
      fetchAllHoaDonAdmin({
        page: page + 1,
        limit: rowsPerPage,
        nhaKhoaId: filterNhaKhoa,
        trangThai: filterTrangThai,
        search: debouncedSearch, // Gửi từ khóa tìm kiếm lên server
      })
    );
  }, [
    dispatch,
    page,
    rowsPerPage,
    filterNhaKhoa,
    filterTrangThai,
    debouncedSearch,
  ]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetail = (hd) => {
    setSelectedHD(hd);
    setOpenDetail(true);
  };

  const handleOpenUpdate = (hd) => {
    setSelectedHD(hd);
    setStatusUpdate(hd.trangThai);
    setOpenUpdate(true);
  };

  const handleConfirmUpdate = async () => {
    await dispatch(
      updateHoaDon({ id: selectedHD._id, data: { trangThai: statusUpdate } })
    );
    setOpenUpdate(false);
  };

  const handleResetFilters = () => {
    setFilterNhaKhoa("");
    setFilterTrangThai("");
    setSearchTerm("");
    setPage(0);
  };

  const handleDeleteHoaDon = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn?")) {
      dispatch(deleteHoaDon(String(id)));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Hóa Đơn</h2>

      {/* BỘ LỌC (FILTERS) */}
      <Paper className="p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <Grid container spacing={2} alignItems="center">
              {/* ===== Nha khoa ===== */}
              <Grid item xs={12} md>
                <FormControl fullWidth size="small" sx={{ minWidth: 220 }}>
                  <InputLabel sx={{ whiteSpace: "nowrap" }}>
                    Lọc theo Nha Khoa
                  </InputLabel>
                  <Select
                    value={filterNhaKhoa}
                    label="Lọc theo Nha Khoa"
                    onChange={(e) => {
                      console.log("Lọc theo nha khoa: ", e.target.value);
                      setFilterNhaKhoa(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">Tất cả nha khoa</MenuItem>
                    {Array?.isArray(nhaKhoa?.data) &&
                      nhaKhoa?.data?.map((nk) => (
                        <MenuItem key={nk._id} value={nk._id}>
                          {nk.hoVaTen}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* ===== Trạng thái ===== */}
              <Grid item xs={12} md>
                <FormControl fullWidth size="small" sx={{ minWidth: 180 }}>
                  <InputLabel sx={{ whiteSpace: "nowrap" }}>
                    Trạng thái
                  </InputLabel>
                  <Select
                    value={filterTrangThai}
                    label="Trạng thái"
                    onChange={(e) => {
                      setFilterTrangThai(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">Tất cả trạng thái</MenuItem>
                    <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
                    <MenuItem value="Thanh toán một phần">
                      Thanh toán một phần
                    </MenuItem>
                    <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* ===== Button Xóa lọc ===== */}
              <Grid item xs={12} md="auto">
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  sx={{
                    height: "40px",
                    whiteSpace: "nowrap",
                    px: 2,
                  }}
                  onClick={() => {
                    setFilterNhaKhoa("");
                    setFilterTrangThai("");
                    setPage(0);
                  }}
                >
                  Xóa lọc
                </Button>
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container spacing={2} alignItems="center">
              {/* Cột Tìm kiếm */}
              <Grid item xs={12} lg={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm theo số hóa đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon size={18} className="text-gray-400" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm("")}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Cột Nút Thao Tác */}
              <Grid item xs={12} lg={3.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={{ xs: "flex-start", lg: "flex-end" }}
                >
                  <Tooltip title="Tạo hóa đơn">
                    <IconButton onClick={() => navigate("/cho-xuat-hoa-don")}>
                      <AddIcon />
                    </IconButton>
                  </Tooltip>

                  <IconButton onClick={() => dispatch(fetchAllHoaDonAdmin())}>
                    <RefreshIcon />
                  </IconButton>

                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </div>
        </div>
      </Paper>

      {/* BẢNG DỮ LIỆU */}
      <TableContainer component={Paper} className="shadow-lg overflow-hidden">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell className="font-bold">Số Hóa Đơn</TableCell>
              <TableCell className="font-bold">Nha Khoa</TableCell>
              <TableCell className="font-bold">Tổng Tiền</TableCell>
              <TableCell className="font-bold">Tổng Chiếc Khấu</TableCell>
              <TableCell className="font-bold">Phải thanh toán</TableCell>
              <TableCell className="font-bold">Đã Thanh Toán</TableCell>
              <TableCell className="font-bold">Còn lại</TableCell>
              <TableCell className="font-bold">Ngày Tạo</TableCell>
              <TableCell align="center" className="font-bold">
                Thao Tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={30} className="my-10" />
                </TableCell>
              </TableRow>
            ) : danhSachHoaDon?.length > 0 ? (
              danhSachHoaDon.map((hd) => (
                <TableRow key={hd._id} hover>
                  <TableCell className="font-semibold text-gray-700">
                    <b>
                      TAN{hd._id.substring(hd._id.length - 8).toUpperCase()}
                    </b>
                  </TableCell>
                  <TableCell>{hd.nhaKhoa?.hoVaTen}</TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {hd.tongTien?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {hd.tongChietKhau?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {hd.thanhTien?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {hd.daThanhToan?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {hd.conLai?.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    {new Date(hd.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Chi tiết & Chăm sóc">
                        <IconButton
                          onClick={() => {
                            navigate(`/hoa-don/${hd._id}/edit`);
                          }}
                          sx={{
                            color: "#10b981",
                          }}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa hóa đơn">
                        <IconButton
                          onClick={() => {
                            console.log("HD ID: ", hd._id);
                            handleDeleteHoaDon(hd._id);
                          }}
                        >
                          <TrashIcon></TrashIcon>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  className="py-20 text-gray-500"
                >
                  Không tìm thấy dữ liệu hóa đơn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={pagination.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang"
        />
      </TableContainer>

      {/* MODAL CHI TIẾT */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" className="font-bold mb-4 text-blue-700">
            Chi Tiết Hóa Đơn: {selectedHD?.soHoaDon}
          </Typography>
          <Divider className="mb-4" />
          <Grid container spacing={2} className="mb-6">
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Nha khoa
              </Typography>
              <Typography className="font-medium text-gray-800">
                {selectedHD?.nhaKhoa?.hoVaTen}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Trạng thái
              </Typography>
              <Box>
                <Chip label={selectedHD?.trangThai} size="small" color="info" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">
                Tổng tiền chưa CK
              </Typography>
              <Typography className="font-medium">
                {selectedHD?.tongTien?.toLocaleString()}đ
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="caption"
                color="secondary"
                className="text-red-500"
              >
                Thực thu (Sau CK)
              </Typography>
              <Typography className="text-lg font-bold text-red-600">
                {selectedHD?.thanhTien?.toLocaleString()}đ
              </Typography>
            </Grid>
          </Grid>
          <Typography className="font-semibold mb-2 text-sm uppercase text-gray-500">
            Danh sách đơn hàng
          </Typography>
          <Box className="max-h-60 overflow-y-auto bg-gray-50 rounded border p-2">
            {selectedHD?.danhSachDonHang.map((item, idx) => (
              <Box key={idx} className="mb-3 pb-2 border-b last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <Button
                    variant="text"
                    onClick={() => {
                      navigate(`/donhang/${item.donHang?._id}/edit`);
                    }}
                  >
                    ID: {item.donHang?._id}
                  </Button>
                  <Typography
                    variant="body2"
                    className="font-semibold text-blue-700"
                  >
                    {item.thanhTienSauCK?.toLocaleString()}đ
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {item.donHang?.danhSachSanPham?.map((spObj, i) => (
                    <Chip
                      key={i}
                      label={spObj.sanPham?.tenSanPham || "Sản phẩm"}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
          <Box className="flex justify-end mt-6">
            <Button onClick={() => setOpenDetail(false)} variant="outlined">
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* MODAL CẬP NHẬT TRẠNG THÁI */}
      <Modal open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" className="font-bold mb-6 text-center">
            Cập Nhật Trạng Thái
          </Typography>
          <FormControl fullWidth className="mb-6">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusUpdate}
              label="Trạng thái"
              onChange={(e) => setStatusUpdate(e.target.value)}
            >
              <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
              <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => setOpenUpdate(false)}>Hủy</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmUpdate}
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
};

export default HoaDonTable;
