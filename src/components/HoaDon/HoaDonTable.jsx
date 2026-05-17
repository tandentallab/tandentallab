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
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ThongKeCongNo from "./ThongKeCongNo";
import DownloadIcon from "@mui/icons-material/Download";
import { exportHoaDonListToExcel } from "../../utils/exportToExcel";
import { api } from "../../config/api";
import SvgIcon from "@mui/material/SvgIcon";
import ExportDateSelector from "../common/ExportDateSelector";
import {
  EMPTY_EXPORT_DATE_FILTER,
  toISODateRange,
  isValidExportDateFilter,
} from "../../utils/exportDatePresets";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "96%", md: "90%" },
  maxWidth: 1000,
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

function ExcelIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="#1b7a34" />
      <path d="M6 7h12v2H6z" fill="#fff" />
      <path
        d="M7.2 15.5l1.6-2.3 1.6 2.3 1.6-2.3 1.6 2.3"
        stroke="#fff"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

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

  const [columnWidths, setColumnWidths] = useState({
    soHoaDon: 70,
    nhaKhoa: 70,
    tongTien: 60,
    tongChietKhau: 60,
    thanhTien: 60,
    daThanhToan: 60,
    conLai: 60,
    ngayTao: 60,
    trangThai: 60,
    thaoTac: 60,
  });

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
    console.log("Lọc theo: ", {
      page: page + 1,
      limit: rowsPerPage,
      nhaKhoaId: filterNhaKhoa,
      trangThai: filterTrangThai,
      search: debouncedSearch, // Gửi từ khóa tìm kiếm lên server
    });
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

  const handleConfirmUpdate = async () => {
    await dispatch(
      updateHoaDon({ id: selectedHD._id, data: { trangThai: statusUpdate } })
    );
    setOpenUpdate(false);
  };

  const handleDeleteHoaDon = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa hóa đơn?")) {
      dispatch(deleteHoaDon(String(id)));
    }
  };

  // Export modal state
  const [openExport, setOpenExport] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState(
    EMPTY_EXPORT_DATE_FILTER
  );
  const [exportNhaKhoa, setExportNhaKhoa] = useState("");
  const [exportTrangThai, setExportTrangThai] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const handleExport = async () => {
    // Kiểm tra ngày
    if (!exportFrom || !exportTo) {
      alert("Vui lòng chọn khoảng thời gian để xuất.");
      return;
    }

    // Kiểm tra preset/filter ngày
    if (!isValidExportDateFilter(exportDateFilter)) {
      alert("Vui lòng chọn thời gian bằng preset hoặc Chọn trên lịch.");
      return;
    }

    try {
      setExporting(true);

      const fromDate = new Date(exportFrom).toISOString();
      const toDate = new Date(`${exportTo}T23:59:59`).toISOString();

      const { fromISO, toISO } = toISODateRange(exportDateFilter);

      const res = await api.get("/hoa-don/all", {
        params: {
          page: 1,
          limit: 5000,
          fromDate: fromISO || fromDate,
          toDate: toISO || toDate,
          nhaKhoaId: exportNhaKhoa || "",
        },
      });

      let data = res.data?.data || [];

      // Filter trạng thái
      if (exportTrangThai.length > 0) {
        data = data.filter((hd) => exportTrangThai.includes(hd.trangThai));
      }

      const selectedNk = (nhaKhoa?.data || []).find(
        (nk) => nk._id === exportNhaKhoa
      );

      await exportHoaDonListToExcel(data, {
        fromDate: fromISO || fromDate,
        toDate: toISO || toDate,
        nhaKhoaName: selectedNk?.hoVaTen || selectedNk?.tenGiaoDich || "Tất cả",
      });

      setOpenExport(false);
    } catch (err) {
      alert(
        `Xuất Excel thất bại: ${err?.response?.data?.message || err.message}`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleResize = (columnKey, e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = columnWidths[columnKey];

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);

      setColumnWidths((prev) => ({
        ...prev,
        [columnKey]: Math.max(newWidth, 80), // width tối thiểu
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const ResizableHeaderCell = ({ label, columnKey }) => {
    return (
      <TableCell
        sx={{
          width: columnWidths[columnKey],
          minWidth: columnWidths[columnKey],
          maxWidth: columnWidths[columnKey],
          position: "relative",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        {label}

        {/* Thanh resize */}
        <Box
          onMouseDown={(e) => handleResize(columnKey, e)}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "12px",
            height: "100%",
            cursor: "col-resize",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",

            "&:hover": {
              backgroundColor: "#e3f2fd",
            },

            // Thanh dọc
            "&::before": {
              content: '""',
              position: "absolute",
              width: "2px",
              height: "70%",
              backgroundColor: "#b0b0b0",
              borderRadius: "2px",
            },
          }}
        />
      </TableCell>
    );
  };

  const getTrangThaiColor = (trangThai) => {
    switch (trangThai) {
      case "Chưa thanh toán":
        return {
          bg: "#fee2e2",
          color: "#dc2626",
          border: "#fecaca",
        };

      case "Thanh toán một phần":
        return {
          bg: "#fef3c7",
          color: "#d97706",
          border: "#fde68a",
        };

      case "Đã thanh toán":
        return {
          bg: "#dcfce7",
          color: "#16a34a",
          border: "#bbf7d0",
        };

      default:
        return {
          bg: "#f3f4f6",
          color: "#374151",
          border: "#d1d5db",
        };
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Hóa Đơn</h2>
      <ThongKeCongNo></ThongKeCongNo>
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
                    <MenuItem sx={{ color: "#ef4444" }} value="Chưa thanh toán">
                      Chưa thanh toán
                    </MenuItem>
                    <MenuItem
                      sx={{ color: "#f59e0b" }}
                      value="Thanh toán một phần"
                    >
                      Thanh toán một phần
                    </MenuItem>
                    <MenuItem sx={{ color: "#22c55e" }} value="Đã thanh toán">
                      Đã thanh toán
                    </MenuItem>
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
                  <button
                    onClick={() => setOpenExport(true)}
                    title="Xuất excel"
                    className="px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1"
                  >
                    Xuất excel
                  </button>
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </div>
        </div>
      </Paper>

      <TableContainer
        component={Paper}
        className="shadow-lg"
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          maxWidth: "100%",
        }}
      >
        <Table
          sx={{
            tableLayout: "fixed",
            minWidth: "max-content",
          }}
        >
          <TableHead>
            <TableRow className="bg-gray-100">
              <ResizableHeaderCell label="Số hóa đơn" columnKey="soHoaDon" />
              <ResizableHeaderCell label="Nha Khoa" columnKey="nhaKhoa" />
              <ResizableHeaderCell label="Tổng Tiền" columnKey="tongTien" />
              <ResizableHeaderCell
                label="Tổng Chiếc Khấu"
                columnKey="tongChietKhau"
              />
              <ResizableHeaderCell
                label="Phải thanh toán"
                columnKey="thanhTien"
              />
              <ResizableHeaderCell
                label="Đã Thanh Toán"
                columnKey="daThanhToan"
              />
              <ResizableHeaderCell label="Còn lại" columnKey="conLai" />
              <ResizableHeaderCell label="Ngày Tạo" columnKey="ngayTao" />
              <ResizableHeaderCell label="Trạng thái" columnKey="trangThai" />
              <ResizableHeaderCell
                label="Thao Tác"
                columnKey="thaoTac"
                sticky
              />
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
                <TableRow
                  key={hd._id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/hoa-don/${hd._id}/edit`);
                  }}
                >
                  <TableCell
                    sx={{
                      width: columnWidths.soHoaDon,
                      minWidth: columnWidths.soHoaDon,
                      maxWidth: columnWidths.soHoaDon,
                    }}
                  >
                    <Chip
                      variant="text"
                      label={hd?.soHoaDon}
                      sx={{
                        fontWeight: 700,
                        textTransform: "none",
                        color: "#fff",

                        bgcolor:
                          hd.trangThai === "Chưa thanh toán"
                            ? "#ef4444" // đỏ
                            : hd.trangThai === "Thanh toán một phần"
                            ? "#f59e0b" // vàng
                            : hd.trangThai === "Đã thanh toán"
                            ? "#22c55e" // xanh lá
                            : "#374151",
                      }}
                    ></Chip>
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.nhaKhoa,
                      minWidth: columnWidths.nhaKhoa,
                      maxWidth: columnWidths.nhaKhoa,
                    }}
                  >
                    <b>{hd.nhaKhoa?.hoVaTen}</b>
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.tongTien,
                      minWidth: columnWidths.tongTien,
                      maxWidth: columnWidths.tongTien,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.tongTien?.toLocaleString()}đ
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.tongChietKhau,
                      minWidth: columnWidths.tongChietKhau,
                      maxWidth: columnWidths.tongChietKhau,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.tongChietKhau?.toLocaleString()}đ
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.thanhTien,
                      minWidth: columnWidths.thanhTien,
                      maxWidth: columnWidths.thanhTien,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.thanhTien?.toLocaleString()}đ
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.daThanhToan,
                      minWidth: columnWidths.daThanhToan,
                      maxWidth: columnWidths.daThanhToan,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.daThanhToan?.toLocaleString()}đ
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.conLai,
                      minWidth: columnWidths.conLai,
                      maxWidth: columnWidths.conLai,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.conLai?.toLocaleString()}đ
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.ngayTao,
                      minWidth: columnWidths.ngayTao,
                      maxWidth: columnWidths.ngayTao,
                    }}
                  >
                    {new Date(hd.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.trangThai,
                      minWidth: columnWidths.trangThai,
                      maxWidth: columnWidths.trangThai,
                    }}
                    className="text-blue-600 font-medium"
                  >
                    {hd.trangThai}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: columnWidths.thaoTac,
                      minWidth: columnWidths.thaoTac,
                      maxWidth: columnWidths.thaoTac,
                    }}
                    align="center"
                  >
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="In hóa đơn">
                        <IconButton
                          onClick={() => {
                            navigate(`/hoa-don/${hd._id}/print`);
                          }}
                          sx={{
                            color: "#1b7a34",
                          }}
                        >
                          <ExcelIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa hóa đơn">
                        <IconButton
                          onClick={() => {
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

      {/* MODAL XUẤT EXCEL */}
      <Modal open={openExport} onClose={() => setOpenExport(false)}>
        <Box sx={{ ...modalStyle, maxWidth: 500 }}>
          <Typography
            variant="h6"
            component="h2"
            className="font-bold mb-2 text-blue-700 flex items-center gap-2"
          >
            <ExcelIcon sx={{ fontSize: 24, color: "#1b7a34" }} />
            Xuất Excel Hóa Đơn
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={3}>
            {/* Hàng 1: Khoảng thời gian */}
            <Box>
              <Typography
                variant="subtitle2"
                className="font-semibold mb-2 text-gray-800"
              >
                Khoảng thời gian
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box className="w-full">
                  <Typography
                    variant="caption"
                    className="text-gray-600 mb-1 block"
                  >
                    Từ ngày
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={exportFrom}
                    onChange={(e) => setExportFrom(e.target.value)}
                  />
                </Box>
                <Box className="w-full">
                  <Typography
                    variant="caption"
                    className="text-gray-600 mb-1 block"
                  >
                    Đến ngày
                  </Typography>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={exportTo}
                    onChange={(e) => setExportTo(e.target.value)}
                  />
                </Box>
              </Stack>
              <ExportDateSelector
                title="Ngày xuất hóa đơn"
                value={exportDateFilter}
                onChange={setExportDateFilter}
              />
            </Box>

            {/* Hàng 2: Nha khoa */}
            <Box>
              <Typography
                variant="subtitle2"
                className="font-semibold mb-2 text-gray-800"
              >
                Nha khoa
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={exportNhaKhoa}
                  onChange={(e) => setExportNhaKhoa(e.target.value)}
                >
                  <MenuItem value="">-- Tất cả nha khoa --</MenuItem>
                  {Array?.isArray(nhaKhoa?.data) &&
                    nhaKhoa?.data?.map((nk) => (
                      <MenuItem key={nk._id} value={nk._id}>
                        {nk.hoVaTen || nk.tenGiaoDich}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* Hàng 3: Trạng thái */}
            <Box>
              <Typography
                variant="subtitle2"
                className="font-semibold mb-2 text-gray-800"
              >
                Trạng thái (chọn nhiều)
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  displayEmpty
                  value={exportTrangThai}
                  onChange={(e) => setExportTrangThai(e.target.value)}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return (
                        <span className="text-gray-500">
                          -- Tất cả trạng thái --
                        </span>
                      );
                    }
                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
                  <MenuItem value="Thanh toán một phần">
                    Thanh toán một phần
                  </MenuItem>
                  <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>

          {/* Hàng 4: Buttons */}
          <Box className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setOpenExport(false);
                setExportDateFilter(EMPTY_EXPORT_DATE_FILTER);
                setExportNhaKhoa("");
                setExportTrangThai([]);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExport}
              disabled={exporting}
              startIcon={<DownloadIcon />}
            >
              {exporting ? "Đang xuất..." : "Tải xuống"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default HoaDonTable;
