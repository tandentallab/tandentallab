import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
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
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PrintIcon from "@mui/icons-material/Print";
import { api } from "../../config/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import ExportDateSelector from "../common/ExportDateSelector";
import { toISODateRange } from "../../utils/exportDatePresets";
import WarrantyCardPrint from "../DonHang/WarrantyCardPrint";
import PhieuBaoHanhModal from "../DonHang/PhieuBaoHanhModal";

// Helper functions (Giữ nguyên logic gốc)

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

  // Mở modal edit
  const handleOpenEdit = (phieu) => {
    setEditingPhieu(phieu);
    setIsEditModalOpen(true);
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
    <div className="p-4 bg-gray-100">
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {/* Hàng trên: Chọn ngày tạo & Tất cả nha khoa */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="w-full sm:w-auto">
            <ExportDateSelector
              placeholder="Chọn ngày tạo"
              value={dateFilter}
              onChange={(dates) => {
                setDateFilter(dates);
                setPage(0);
              }}
            />
          </div>
          <TextField
            select
            size="small"
            value={nhaKhoaFilter}
            onChange={(e) => {
              setNhaKhoaFilter(e.target.value);
              setPage(0);
            }}
            className="w-full sm:w-64 bg-slate-50/50 rounded-lg"
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

        {/* Hàng dưới: Thanh tìm kiếm & Nút làm mới */}
        <div className="flex items-center gap-3 w-full">
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
          <IconButton
            onClick={loadPhieuList}
            disabled={loading}
            title="Làm mới dữ liệu"
            className="text-slate-600 hover:bg-slate-100 transition-all shadow-sm shrink-0"
            sx={{ width: 40, height: 40, borderRadius: "10px" }}
          >
            <RefreshIcon />
          </IconButton>
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
                          {item.tenSanPhamBaoHanh || item.sanPham?.tenSanPham || item.sanPham || "---"}
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

      {/* Unified Edit Modal */}
      {isEditModalOpen && editingPhieu && (
        <PhieuBaoHanhModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPhieu(null);
          }}
          warranty={editingPhieu}
          onSuccess={() => {
            loadPhieuList();
          }}
        />
      )}

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
