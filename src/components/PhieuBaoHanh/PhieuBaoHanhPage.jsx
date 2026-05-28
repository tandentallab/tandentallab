import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  MenuItem,
  InputAdornment,
  Tooltip,
  TablePagination,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PrintIcon from "@mui/icons-material/Print";
import { api } from "../../config/api";
import { toast } from "sonner";
import FullScreenLoader from "../Loader/FullScreenLoader";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import ExportDateSelector from "../common/ExportDateSelector";
import { toISODateRange } from "../../utils/exportDatePresets";
import WarrantyCardPrint from "../DonHang/WarrantyCardPrint";

// Helper functions (Giữ nguyên logic gốc)
const addYearsToDate = (dateValue, years) => {
  const start = new Date(dateValue);
  const result = new Date(
    start.getFullYear() + years,
    start.getMonth(),
    start.getDate()
  );
  return result.toISOString().slice(0, 10);
};

const formatDateVN = (dateValue) => {
  if (!dateValue) return "---";
  return new Date(dateValue).toLocaleDateString("vi-VN");
};

const PhieuBaoHanhPage = () => {
  const [phieuList, setPhieuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [nhaKhoaFilter, setNhaKhoaFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null });

  const dispatch = useDispatch();
  const nhaKhoaState = useSelector((state) => state.nhaKhoa);
  const nhaKhoaOptions = nhaKhoaState?.data || [];

  const [editingPhieu, setEditingPhieu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    ghiChu: "",
    danhSachBaoHanh: [],
  });
  const [printPhieu, setPrintPhieu] = useState(null);

  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset trang khi search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load danh sách phiếu bảo hành
  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  useEffect(() => {
    loadPhieuList();
  }, [page, rowsPerPage, debouncedSearch, nhaKhoaFilter, dateFilter]);

  const loadPhieuList = async () => {
    try {
      setLoading(true);
      const dateRange = toISODateRange(dateFilter);

      const res = await api.get("/phieu-bao-hanh", {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch,
          nhaKhoaId: nhaKhoaFilter,
          fromDate: dateRange.fromISO,
          toDate: dateRange.toISO,
        }
      });
      if (res.data?.success) {
        setPhieuList(res.data.data || []);
        setTotalCount(res.data.total || 0);
      } else {
        toast.error("Lỗi khi tải danh sách phiếu bảo hành");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  console.log("Danh sách phiếu bảo hành đã tải:", phieuList);

  // Mở modal edit (Giữ nguyên)
  const handleOpenEdit = (phieu) => {
    setEditingPhieu(phieu);

    const enrichedList = (phieu.danhSachBaoHanh || []).map((item) => {
      const startDate = new Date(item.baoHanhTu);
      const endDate = new Date(item.baoHanhDen);
      const yearsDiff = endDate.getFullYear() - startDate.getFullYear();

      const expectedEnd = addYearsToDate(item.baoHanhTu, yearsDiff);
      const actualEndStr = new Date(item.baoHanhDen).toISOString().slice(0, 10);
      const isExactYears = expectedEnd === actualEndStr;

      return {
        ...item,
        selectedYears: isExactYears ? yearsDiff : "",
        customEndDate: isExactYears ? "" : actualEndStr,
      };
    });

    setEditForm({
      ghiChu: phieu.ghiChu || "",
      danhSachBaoHanh: enrichedList,
    });
    setIsEditModalOpen(true);
  };

  // Đồng bộ thông tin từ Đơn hàng hiện tại
  const handleSyncFromOrder = async () => {
    const orderId = editingPhieu.donHang?._id || editingPhieu.donHang;
    if (!orderId) {
      toast.error("Không tìm thấy thông tin đơn hàng tương ứng");
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/donhang/${orderId}`);
      if (res.data?.success) {
        const latestOrder = res.data.data;

        // Hàm format vị trí răng
        const formatViTri = (viTriArr) => {
          if (!viTriArr || viTriArr.length === 0) return "";
          return viTriArr
            .map((v) =>
              v.kieu === "Rời"
                ? v.soRang.join(", ")
                : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
            )
            .join("; ");
        };

        // Chuẩn hóa danh sách sản phẩm từ đơn hàng mới nhất
        const orderProducts = (latestOrder.danhSachSanPham || []).map((sp) => ({
          sanPhamId: sp.sanPham?._id || sp.sanPham,
          tenSanPham: sp.sanPham?.tenSanPham || sp.sanPham?.ten || "Sản phẩm",
          viTriRang: formatViTri(sp.viTri),
          soLuong: Number(sp.soLuong) || 1,
          mau: sp.mau || "",
          baoHanhMacDinh: sp.sanPham?.baoHanhMacDinh || 0,
        }));

        // Chuẩn hóa danh sách sản phẩm hiện tại của phiếu bảo hành
        const currentWarrantyProducts = (editForm.danhSachBaoHanh || []).map((w) => ({
          sanPhamId: w.sanPham?._id || w.sanPham,
          tenSanPham: w.sanPham?.tenSanPham || w.sanPham?.ten || "Sản phẩm",
          viTriRang: w.viTriRang || "",
          soLuong: Number(w.soLuong) || 1,
          mau: w.mau || "",
        }));

        // Sắp xếp để so sánh không phụ thuộc thứ tự phần tử
        const sortFn = (a, b) => {
          const idA = (a.sanPhamId || "").toString();
          const idB = (b.sanPhamId || "").toString();
          if (idA !== idB) return idA.localeCompare(idB);
          return (a.viTriRang || "").localeCompare(b.viTriRang || "");
        };

        const sortedOrder = [...orderProducts].sort(sortFn);
        const sortedCurrent = [...currentWarrantyProducts].sort(sortFn);

        const isSame = sortedOrder.length === sortedCurrent.length &&
          sortedOrder.every((op, idx) => {
            const cwp = sortedCurrent[idx];
            return op.sanPhamId === cwp.sanPhamId &&
              op.viTriRang === cwp.viTriRang &&
              op.soLuong === cwp.soLuong &&
              op.mau === cwp.mau;
          });

        if (isSame) {
          toast.success("Dữ liệu đồng bộ");
        } else {
          // Xây dựng danh sách bảo hành mới dựa trên đơn hàng, bảo lưu ngày tháng của các sản phẩm khớp cũ
          const newList = orderProducts.map((op) => {
            const existingMatch = (editForm.danhSachBaoHanh || []).find((w) => {
              const wId = w.sanPham?._id || w.sanPham;
              return wId === op.sanPhamId && w.viTriRang === op.viTriRang;
            });

            if (existingMatch) {
              return {
                ...existingMatch,
                soLuong: op.soLuong,
                mau: op.mau,
              };
            }

            const newBaoHanhTu = editingPhieu.createdAt
              ? new Date(editingPhieu.createdAt).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10);
            const defaultYears = op.baoHanhMacDinh || 0;
            const newBaoHanhDen = addYearsToDate(newBaoHanhTu, defaultYears);

            return {
              sanPham: {
                _id: op.sanPhamId,
                tenSanPham: op.tenSanPham,
              },
              viTriRang: op.viTriRang,
              soLuong: op.soLuong,
              mau: op.mau,
              baoHanhTu: newBaoHanhTu,
              baoHanhDen: newBaoHanhDen,
              selectedYears: defaultYears > 0 ? defaultYears : "",
              customEndDate: "",
            };
          });

          setEditForm({
            ...editForm,
            danhSachBaoHanh: newList,
          });
          toast.success("Đã đồng bộ thông tin mới từ đơn hàng!");
        }
      } else {
        toast.error(res.data?.message || "Lỗi khi lấy dữ liệu đơn hàng");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lấy dữ liệu đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Lưu chỉnh sửa (Giữ nguyên)
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      const cleanedDanhSach = editForm.danhSachBaoHanh.map(
        ({ selectedYears, customEndDate, ...rest }) => rest
      );

      const res = await api.put(`/phieu-bao-hanh/${editingPhieu._id}`, {
        ghiChu: editForm.ghiChu,
        danhSachBaoHanh: cleanedDanhSach,
      });
      if (res.data?.success) {
        toast.success("Đã cập nhật Phiếu bảo hành");
        setIsEditModalOpen(false);
        loadPhieuList();
      } else {
        toast.error(res.data?.message || "Lỗi khi cập nhật");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  // Xóa phiếu bảo hành (Giữ nguyên)
  const handleDelete = async (phieuId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phiếu bảo hành này?")) return;

    try {
      setLoading(true);
      const res = await api.delete(`/phieu-bao-hanh/${phieuId}`);
      if (res.data?.success) {
        toast.success("Xóa phiếu bảo hành thành công");
        loadPhieuList();
      } else {
        toast.error(res.data?.message || "Lỗi khi xóa");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarMonthIcon className="text-blue-600" /> Quản lý Phiếu Bảo
            Hành
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi, cập nhật và xử lý thông tin bảo hành của bệnh nhân
          </p>
        </div>
        <Button
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<RefreshIcon />}
          onClick={loadPhieuList}
          className="bg-blue-600 hover:bg-blue-700 font-medium px-5 py-2.5 rounded-xl normal-case transition-all"
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-start">
        <TextField
          placeholder="Tìm kiếm nhanh theo mã phiếu, mã đơn hàng, tên bệnh nhân..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-slate-400" />
              </InputAdornment>
            ),
            className: "bg-slate-50/50 rounded-lg text-sm",
          }}
          className="flex-1"
        />
        <div className="flex gap-4 w-full md:w-auto shrink-0 items-start">
          <ExportDateSelector
            placeholder="Chọn ngày tạo"
            value={dateFilter}
            onChange={(dates) => {
              setDateFilter(dates);
              setPage(0);
            }}
          />
          <TextField
            select
            size="small"
            value={nhaKhoaFilter}
            onChange={(e) => {
              setNhaKhoaFilter(e.target.value);
              setPage(0);
            }}
            className="w-full md:w-48 bg-slate-50/50 rounded-lg"
            SelectProps={{
              displayEmpty: true,
            }}
          >
            <MenuItem value="all">
              <span className="text-slate-500">Tất cả nha khoa</span>
            </MenuItem>
            {nhaKhoaOptions.map((nk) => (
              <MenuItem key={nk._id} value={nk._id}>
                {nk.tenNhaKhoa || nk.hoVaTen || "Không tên"}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden md:block">
        <TableContainer
          component={Paper}
          elevation={0}
          className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <Table size="medium" sx={{ minWidth: 1000 }}>
              <TableHead className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Mã BH
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Mã Đơn Hàng
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Bệnh Nhân
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Nha Khoa
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Sản Phẩm
                  </TableCell>
                  <TableCell
                    className="font-semibold text-slate-700 py-4"
                    style={{ width: "320px" }}
                  >
                    Chi Tiết Thời Hạn
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Ghi Chú
                  </TableCell>
                  <TableCell
                    align="center"
                    className="font-semibold text-slate-700 py-4"
                  >
                    Hành Động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {phieuList.length > 0 ? (
                  phieuList.map((phieu) => (
                    <TableRow
                      key={phieu._id}
                      hover
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <TableCell className="font-bold text-blue-600">
                        {phieu.maBaoHanh}
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        <Button
                          variant="text"
                          onClick={() => {
                            if (phieu.donHang?._id)
                              navigate(
                                `/donhang/${phieu.donHang?._id}/edit`
                              );
                          }}
                        >
                          {phieu.donHang?.maDonHang || phieu.maBaoHanh || "---"}
                        </Button>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">
                        {phieu.benhNhan?.hoVaTen || "---"}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {phieu.nhaKhoa?.hoVaTen ||
                          phieu.nhaKhoa?.tenGiaoDich ||
                          "---"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${phieu.danhSachBaoHanh?.length || 0} mục`}
                          color="primary"
                          size="small"
                          variant="soft"
                          className="bg-blue-50 text-blue-700 font-semibold border-none"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 py-1">
                          {phieu.danhSachBaoHanh?.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm"
                            >
                              <div className="font-bold text-slate-800 mb-0.5">
                                {idx + 1}.{" "}
                                {item.sanPham?.tenSanPham ||
                                  item.sanPham ||
                                  "---"}
                              </div>
                              <div className="text-slate-500 font-medium flex flex-wrap gap-x-2 gap-y-0.5">
                                {item.viTriRang && (
                                  <span>Vị trí: {item.viTriRang}</span>
                                )}
                                {item.soLuong && (
                                  <span>| SL: {item.soLuong}</span>
                                )}
                                {item.mau && <span>| Màu: {item.mau}</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-blue-700 font-medium bg-blue-50/50 inline-block px-1.5 py-0.5 rounded">
                                  {formatDateVN(item.baoHanhTu)} →{" "}
                                  {formatDateVN(item.baoHanhDen)}
                                </div>
                                {new Date(item.baoHanhDen) >= new Date() ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">Còn BH</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">Hết BH</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-sm text-slate-500 max-w-xs truncate"
                          title={phieu.ghiChu}
                        >
                          {phieu.ghiChu || "---"}
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        <div className="flex justify-center items-center gap-1">
                          <Tooltip title="Check thẻ bảo hành">
                            <IconButton
                              size="small"
                              className="text-teal-600 hover:bg-teal-50"
                              onClick={() => {
                                const qrCode = phieu.maQR || phieu.maBaoHanh || "";
                                window.open(`${window.location.origin}/tra-cuu-bao-hanh/?qrcode=${qrCode}`, "_blank");
                              }}
                            >
                              <QrCodeScannerIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="In thẻ bảo hành">
                            <IconButton
                              size="small"
                              className="text-purple-600 hover:bg-purple-50"
                              onClick={() => setPrintPhieu(phieu)}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton
                              size="small"
                              className="text-blue-600 hover:bg-blue-50"
                              onClick={() => handleOpenEdit(phieu)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa bỏ">
                            <IconButton
                              size="small"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDelete(phieu._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      className="py-12 text-slate-400 font-medium"
                    >
                      {loading ? "Đang tải dữ liệu..." : "Không tìm thấy dữ liệu phiếu bảo hành phù hợp"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-gray-100 bg-white shrink-0 z-10 relative rounded-b-xl">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang"
            />
          </div>
        </TableContainer>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {phieuList.length > 0 ? (
          phieuList.map((phieu) => (
            <Paper
              key={phieu._id}
              elevation={0}
              className="p-5 border border-slate-200 rounded-xl shadow-sm bg-white relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mã Bảo Hành
                    </span>
                    <span className="font-bold text-base text-blue-600">
                      {phieu.maBaoHanh}
                    </span>
                  </div>
                  <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                    <IconButton
                      size="small"
                      className="text-teal-600"
                      onClick={() => {
                        const qrCode = phieu.maQR || phieu.maBaoHanh || "";
                        window.open(`${window.location.origin}/tra-cuu-bao-hanh/?qrcode=${qrCode}`, "_blank");
                      }}
                    >
                      <QrCodeScannerIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="text-purple-600"
                      onClick={() => setPrintPhieu(phieu)}
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="text-blue-600"
                      onClick={() => handleOpenEdit(phieu)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="text-rose-600"
                      onClick={() => handleDelete(phieu._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mã Đơn Hàng
                    </span>
                    <button
                      onClick={() => {
                        if (phieu.donHang?._id)
                          navigate(`/donhang/${phieu.donHang?._id}/edit`);
                      }}
                      className="font-semibold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {phieu.donHang?.maDonHang || phieu.maBaoHanh || "---"}
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Bệnh Nhân
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {phieu.benhNhan?.hoVaTen || "---"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nha Khoa
                  </span>
                  <span className="font-medium text-slate-700 text-sm">
                    {phieu.nhaKhoa?.hoVaTen ||
                      phieu.nhaKhoa?.tenGiaoDich ||
                      "---"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trạng thái:
                  </span>
                  <Chip
                    label={`${phieu.danhSachBaoHanh?.length || 0} sản phẩm`}
                    color="primary"
                    size="small"
                    variant="soft"
                    className="bg-blue-50 text-blue-700 font-bold text-xs"
                  />
                </div>

                {phieu.danhSachBaoHanh?.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    {phieu.danhSachBaoHanh?.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="font-bold text-slate-800">
                          {idx + 1}.{" "}
                          {item.sanPham?.tenSanPham || item.sanPham || "---"}
                        </div>
                        <div className="text-slate-500 mt-1 flex flex-wrap gap-2">
                          {item.viTriRang && (
                            <span>Vị trí: {item.viTriRang}</span>
                          )}
                          {item.soLuong && <span>SL: {item.soLuong}</span>}
                          {item.mau && <span>Màu: {item.mau}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="text-blue-700 font-semibold bg-white border border-blue-100 inline-block px-2 py-0.5 rounded shadow-xs">
                            {formatDateVN(item.baoHanhTu)} →{" "}
                            {formatDateVN(item.baoHanhDen)}
                          </div>
                          {new Date(item.baoHanhDen) >= new Date() ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">Còn BH</span>
                          ) : (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">Hết BH</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {phieu.ghiChu && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ghi Chú
                    </span>
                    <span className="text-xs text-slate-600 italic mt-0.5 block">
                      {phieu.ghiChu}
                    </span>
                  </div>
                )}
              </div>
            </Paper>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
            {loading ? "Đang tải dữ liệu..." : "Không tìm thấy dữ liệu phiếu bảo hành phù hợp"}
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng"
          />
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ className: "rounded-2xl overflow-hidden shadow-xl" }}
      >
        <DialogTitle className="bg-blue-500 text-white font-bold text-lg flex justify-between items-center px-6 py-4">
          <span>Cập Nhật Phiếu Bảo Hành</span>
          <IconButton
            size="small"
            onClick={() => setIsEditModalOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-6 space-y-6 bg-slate-50/50">
          {editingPhieu && (
            <>
              {/* Thông tin chung */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">
                    Mã Bảo Hành
                  </span>
                  <span className="font-bold text-slate-800">
                    {editingPhieu.maBaoHanh}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">
                    Mã Đơn Hàng
                  </span>
                  <span className="font-semibold text-slate-700">
                    {editingPhieu.donHang?.maDonHang || "---"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">
                    Họ Tên Bệnh Nhân
                  </span>
                  <span className="font-bold text-blue-600">
                    {editingPhieu.benhNhan?.hoVaTen || "---"}
                  </span>
                </div>
              </div>

              {/* Danh sách sản phẩm bảo hành */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
                  Cấu hình thời hạn sản phẩm
                </h3>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 py-1">
                  {editForm.danhSachBaoHanh?.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
                    >
                      <div className="mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        <div className="font-bold text-slate-900 text-sm mb-1">
                          {idx + 1}. {item.sanPham?.tenSanPham || item.sanPham}
                        </div>
                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1 font-medium">
                          {item.viTriRang && (
                            <span>Vị trí: {item.viTriRang}</span>
                          )}
                          {item.soLuong && (
                            <span>Số lượng: {item.soLuong}</span>
                          )}
                          {item.mau && <span>Màu: {item.mau}</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                          Bắt đầu:{" "}
                          <span className="text-slate-600 font-semibold">
                            {formatDateVN(item.baoHanhTu)}
                          </span>{" "}
                          | Hạn hiện tại:{" "}
                          <span className="text-slate-600 font-semibold">
                            {formatDateVN(
                              editingPhieu.danhSachBaoHanh?.[idx]?.baoHanhDen
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Các input thay đổi ngày (Giữ nguyên logic gốc) */}
                      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Theo số năm cố định:
                          </label>
                          <TextField
                            select
                            value={item.selectedYears ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newDanhSach = [...editForm.danhSachBaoHanh];
                              const newEndDateStr =
                                val === ""
                                  ? item.baoHanhTu
                                  : addYearsToDate(item.baoHanhTu, Number(val));
                              newDanhSach[idx] = {
                                ...newDanhSach[idx],
                                selectedYears: val === "" ? "" : Number(val),
                                customEndDate: "",
                                baoHanhDen: new Date(
                                  newEndDateStr
                                ).toISOString(),
                              };
                              setEditForm({
                                ...editForm,
                                danhSachBaoHanh: newDanhSach,
                              });
                            }}
                            fullWidth
                            size="small"
                            InputProps={{
                              className: "rounded-lg text-sm bg-slate-50/30",
                            }}
                          >
                            <MenuItem value="">-- Chọn số năm --</MenuItem>
                            {Array.from({ length: 11 }, (_, i) => i).map(
                              (year) => (
                                <MenuItem key={year} value={year}>
                                  {year} năm bảo hành
                                </MenuItem>
                              )
                            )}
                          </TextField>
                        </div>

                        <div className="md:col-span-1 flex items-center justify-center pt-4 md:pt-0">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                            hoặc
                          </span>
                        </div>

                        <div className="md:col-span-5">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">
                            Chọn ngày tùy chỉnh cụ thể:
                          </label>
                          <TextField
                            type="date"
                            value={item.customEndDate || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newDanhSach = [...editForm.danhSachBaoHanh];
                              newDanhSach[idx] = {
                                ...newDanhSach[idx],
                                customEndDate: val,
                                selectedYears: "",
                                baoHanhDen: val
                                  ? new Date(val).toISOString()
                                  : new Date(item.baoHanhTu).toISOString(),
                              };
                              setEditForm({
                                ...editForm,
                                danhSachBaoHanh: newDanhSach,
                              });
                            }}
                            fullWidth
                            size="small"
                            InputProps={{
                              className: "rounded-lg text-sm bg-slate-50/30",
                            }}
                          />
                        </div>
                      </div>

                      {/* Banner kết quả trực quan hơn */}
                      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-800 uppercase tracking-wide">
                          Thời hạn áp dụng mới:
                        </span>
                        <span className="text-sm font-bold text-emerald-700 bg-white border border-emerald-100 px-3 py-1 rounded shadow-xs">
                          {formatDateVN(item.baoHanhTu)}{" "}
                          <span className="mx-1 text-emerald-400">→</span>{" "}
                          {formatDateVN(item.baoHanhDen)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input ghi chú */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Ghi chú tổng quát
                </label>
                <TextField
                  placeholder="Nhập các ghi chú, lưu ý đặc biệt liên quan tới phiếu bảo hành này..."
                  value={editForm.ghiChu}
                  onChange={(e) =>
                    setEditForm({ ...editForm, ghiChu: e.target.value })
                  }
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  InputProps={{ className: "rounded-xl text-sm bg-white" }}
                />
              </div>
            </>
          )}
        </DialogContent>

        <DialogActions className="p-4 bg-white border-t border-slate-100 gap-2">
          <Button
            onClick={handleSyncFromOrder}
            variant="outlined"
            color="primary"
            disabled={loading}
            style={{ marginRight: "auto" }}
            className="text-blue-600 border-blue-600 font-semibold px-4 py-2 normal-case rounded-lg hover:bg-blue-50"
          >
            Cập nhật phiếu BH
          </Button>
          <Button
            onClick={() => setIsEditModalOpen(false)}
            className="text-slate-500 font-semibold px-4 py-2 normal-case rounded-lg hover:bg-slate-100"
          >
            Hủy thao tác
          </Button>
          <Button
            onClick={handleSaveEdit}
            variant="contained"
            disableElevation
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 normal-case rounded-lg min-w-[100px]"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog in thẻ bảo hành */}
      {printPhieu && (
        <WarrantyCardPrint
          open={!!printPhieu}
          onClose={() => setPrintPhieu(null)}
          warranty={printPhieu}
        />
      )}
    </div>
  );
};

export default PhieuBaoHanhPage;
