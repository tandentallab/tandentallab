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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../../config/api";
import { toast } from "sonner";
import FullScreenLoader from "../Loader/FullScreenLoader";

// Helper functions
const addYearsToDate = (dateValue, years) => {
  const start = new Date(dateValue);
  const result = new Date(start.getFullYear() + years, start.getMonth(), start.getDate());
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
  const [editingPhieu, setEditingPhieu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    ghiChu: "",
    danhSachBaoHanh: [],
  });


  // Load danh sách phiếu bảo hành
  useEffect(() => {
    loadPhieuList();
  }, []);

  const loadPhieuList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/phieu-bao-hanh");
      if (res.data?.success) {
        setPhieuList(res.data.data || []);
      } else {
        toast.error("Lỗi khi tải danh sách phiếu bảo hành");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // Filter danh sách
  const filteredPhieu = phieuList.filter((phieu) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      phieu.maBaoHanh?.toLowerCase().includes(searchLower) ||
      phieu.donHang?.maDonHang?.toLowerCase().includes(searchLower) ||
      phieu.benhNhan?.hoVaTen?.toLowerCase().includes(searchLower)
    );
  });

  // Mở modal edit
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



  // Lưu chỉnh sửa
  const handleSaveEdit = async () => {
    try {
      setLoading(true);
      
      const cleanedDanhSach = editForm.danhSachBaoHanh.map(({ selectedYears, customEndDate, ...rest }) => rest);
      
      const res = await api.put(`/phieu-bao-hanh/${editingPhieu._id}`, {
        ghiChu: editForm.ghiChu,
        danhSachBaoHanh: cleanedDanhSach,
      });
      if (res.data?.success) {
        toast.success("Cập nhật phiếu bảo hành thành công");
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

  // Xóa phiếu bảo hành
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

  if (loading && phieuList.length === 0) return <FullScreenLoader />;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Phiếu Bảo Hành</h1>
        <Button variant="contained" color="primary" onClick={loadPhieuList}>
          Làm mới
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <TextField
          label="Tìm kiếm theo mã phiếu, mã đơn hàng, tên bệnh nhân..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          variant="outlined"
        />
      </div>

      {/* Desktop: Table, Mobile: Cards */}
      <div className="hidden md:block">
        <div style={{ WebkitOverflowScrolling: "touch" }} className="overflow-x-auto">
          <TableContainer component={Paper} sx={{ minWidth: 900 }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead className="bg-gray-100">
                <TableRow>
                  <TableCell className="font-bold">Mã BH</TableCell>
                  <TableCell className="font-bold">Mã Đơn Hàng</TableCell>
                  <TableCell className="font-bold">Bệnh Nhân</TableCell>
                  <TableCell className="font-bold">Nha Khoa</TableCell>
                  <TableCell className="font-bold">Số Sản Phẩm</TableCell>
                  <TableCell className="font-bold">Danh Sách Sản Phẩm</TableCell>
                  <TableCell className="font-bold">Ghi Chú</TableCell>
                  <TableCell align="center" className="font-bold">Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPhieu.length > 0 ? (
                  filteredPhieu.map((phieu) => (
                    <TableRow key={phieu._id} hover>
                      <TableCell className="font-medium">{phieu.maBaoHanh}</TableCell>
                      <TableCell>{phieu.donHang?.maDonHang || phieu.maBaoHanh || "---"}</TableCell>
                      <TableCell>{phieu.benhNhan?.hoVaTen || "---"}</TableCell>
                      <TableCell>{phieu.nhaKhoa?.hoVaTen || phieu.nhaKhoa?.tenGiaoDich || "---"}</TableCell>
                      <TableCell>
                        <Chip label={`${phieu.danhSachBaoHanh?.length || 0} sản phẩm`} color="primary" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          {phieu.danhSachBaoHanh?.map((item, idx) => (
                            <div key={idx} className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="font-medium">{idx + 1}. {item.sanPham?.tenSanPham || item.sanPham || "---"}</div>
                              <div className="text-xs text-gray-600">
                                {item.viTriRang && `Vị trí: ${item.viTriRang}`}
                                {item.soLuong && ` | SL: ${item.soLuong}`}
                                {item.mau && ` | Màu: ${item.mau}`}
                              </div>
                              <div className="text-xs text-gray-500">BH: {new Date(item.baoHanhTu).toLocaleDateString("vi-VN")} → {new Date(item.baoHanhDen).toLocaleDateString("vi-VN")}</div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">{phieu.ghiChu || "---"}</div>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(phieu)} title="Sửa"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(phieu._id)} title="Xóa"><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="8" align="center" className="py-8 text-gray-500">Không tìm thấy phiếu bảo hành nào</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      {/* Mobile: Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredPhieu.length > 0 ? (
          filteredPhieu.map((phieu) => (
            <Paper key={phieu._id} className="p-4 border-l-4 border-blue-500">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Mã BH</div>
                    <div className="font-bold text-lg text-blue-700">{phieu.maBaoHanh}</div>
                  </div>
                  <div className="flex gap-1">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(phieu)}><EditIcon /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(phieu._id)}><DeleteIcon /></IconButton>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Mã Đơn Hàng</div>
                    <div className="font-semibold text-gray-800">{phieu.donHang?.maDonHang || phieu.maBaoHanh || "---"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Bệnh Nhân</div>
                    <div className="font-semibold text-gray-800">{phieu.benhNhan?.hoVaTen || "---"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 uppercase">Nha Khoa</div>
                  <div className="font-semibold text-gray-800">{phieu.nhaKhoa?.hoVaTen || phieu.nhaKhoa?.tenGiaoDich || "---"}</div>
                </div>

                <Chip label={`${phieu.danhSachBaoHanh?.length || 0} sản phẩm`} color="primary" size="small" variant="outlined" className="w-fit" />

                {phieu.danhSachBaoHanh?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    {phieu.danhSachBaoHanh?.map((item, idx) => (
                      <div key={idx} className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="font-medium">{idx + 1}. {item.sanPham?.tenSanPham || item.sanPham || "---"}</div>
                        {item.viTriRang && <div className="text-xs text-gray-600">Vị trí: {item.viTriRang}</div>}
                        {item.soLuong && <div className="text-xs text-gray-600">SL: {item.soLuong}</div>}
                        {item.mau && <div className="text-xs text-gray-600">Màu: {item.mau}</div>}
                        <div className="text-xs text-gray-500 mt-1">BH: {new Date(item.baoHanhTu).toLocaleDateString("vi-VN")} → {new Date(item.baoHanhDen).toLocaleDateString("vi-VN")}</div>
                      </div>
                    ))}
                  </div>
                )}

                {phieu.ghiChu && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500 uppercase">Ghi Chú</div>
                    <div className="text-sm text-gray-700">{phieu.ghiChu}</div>
                  </div>
                )}
              </div>
            </Paper>
          ))
        ) : (
          <Paper className="p-8 text-center text-gray-500">Không tìm thấy phiếu bảo hành nào</Paper>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="bg-blue-600 text-white font-bold">Sửa Phiếu Bảo Hành</DialogTitle>
        <DialogContent className="pt-6 space-y-4">
          {editingPhieu && (
            <>
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 shadow-sm">
                <div className="text-base space-y-2">
                  <div>
                    <span className="font-bold text-blue-900">Mã BH:</span> <span className="font-semibold text-gray-800">{editingPhieu.maBaoHanh}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Đơn Hàng:</span> <span className="font-semibold text-gray-800">{editingPhieu.donHang?.maDonHang}</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Bệnh Nhân:</span> <span className="font-bold text-blue-700">{editingPhieu.benhNhan?.hoVaTen}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Danh Sách Sản Phẩm & Năm Bảo Hành:</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {editForm.danhSachBaoHanh?.map((item, idx) => (
                    <div key={idx} className="p-4 bg-blue-50/30 rounded-lg border border-blue-200 mb-4 shadow-sm">
                      <div className="mb-4 flex flex-col gap-1">
                        <div className="font-bold text-base text-blue-800">
                          {idx + 1}. {item.sanPham?.tenSanPham || item.sanPham}
                        </div>
                        {item.viTriRang && <div className="text-gray-700 text-sm">Vị trí: {item.viTriRang}</div>}
                        {item.soLuong && <div className="text-gray-700 text-sm">SL: {item.soLuong}</div>}
                        {item.mau && <div className="text-gray-700 text-sm">Màu: {item.mau}</div>}
                        <div className="text-gray-600 text-sm mt-1">
                          Ngày bắt đầu: {formatDateVN(item.baoHanhTu)} | Hạn BH hiện tại: <span className="font-semibold text-gray-800">{formatDateVN(editingPhieu.danhSachBaoHanh?.[idx]?.baoHanhDen)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn năm bảo hành:</label>
                          <TextField
                            select
                            value={item.selectedYears ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newDanhSach = [...editForm.danhSachBaoHanh];
                              const newEndDateStr = val === "" ? item.baoHanhTu : addYearsToDate(item.baoHanhTu, Number(val));
                              newDanhSach[idx] = {
                                ...newDanhSach[idx],
                                selectedYears: val === "" ? "" : Number(val),
                                customEndDate: "",
                                baoHanhDen: new Date(newEndDateStr).toISOString()
                              };
                              setEditForm({ ...editForm, danhSachBaoHanh: newDanhSach });
                            }}
                            fullWidth
                            size="small"
                            inputProps={{ style: { fontSize: '14px' } }}
                          >
                            <MenuItem value="">-- Chọn năm --</MenuItem>
                            {Array.from({ length: 11 }, (_, i) => i).map((year) => (
                              <MenuItem key={year} value={year}>
                                {year} năm
                              </MenuItem>
                            ))}
                          </TextField>
                        </div>

                        <div className="col-span-2 flex items-center justify-center mt-4">
                          <span className="text-gray-400 text-xs font-medium">hoặc</span>
                        </div>

                        <div className="col-span-5">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn ngày bảo hành đến:</label>
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
                                baoHanhDen: val ? new Date(val).toISOString() : new Date(item.baoHanhTu).toISOString()
                              };
                              setEditForm({ ...editForm, danhSachBaoHanh: newDanhSach });
                            }}
                            fullWidth
                            size="small"
                            inputProps={{ style: { fontSize: '14px' } }}
                          />
                        </div>

                        <div className="mt-2 pt-3 border-t border-green-200 bg-green-50 rounded px-3 py-2 flex items-center gap-2">
                          <span className="font-semibold text-sm text-green-900">Kết quả:</span>
                          <span className="text-sm text-green-800">
                            {formatDateVN(item.baoHanhTu)} → {formatDateVN(item.baoHanhDen)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <TextField
                label="Ghi chú"
                value={editForm.ghiChu}
                onChange={(e) => setEditForm({ ...editForm, ghiChu: e.target.value })}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </>
          )}
        </DialogContent>
        <DialogActions className="p-4">
          <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PhieuBaoHanhPage;
