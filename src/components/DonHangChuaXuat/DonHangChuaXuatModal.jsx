import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  isWithinInterval,
} from "date-fns";

import { useDispatch, useSelector } from "react-redux";
import { fetchDonHangChuaHoaDon } from "../../redux/slices/hoaDonSlice";
import { fetchBangGiaByNhaKhoa } from "../../redux/slices/bangGiaSlice";
import { useNavigate } from "react-router-dom";
import { fetchDonHangById } from "../../redux/slices/donHangSlice";
import { buildProductNameMap } from "../../utils/hoaDonUtils";

export default function DonHangChuaXuatModal({
  open,
  onClose,
  selectedClinic,
  onAddOrders,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Khai báo state quản lý cục bộ tại đây
  const [selectedOrders, setSelectedOrders] = useState([]);

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (open) {
      // Tự động clear danh sách đã chọn khi mở modal
      setSelectedOrders([]);

      if (selectedClinic) {
        dispatch(fetchDonHangChuaHoaDon(selectedClinic));
        dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
      }
    }
  }, [open, selectedClinic, dispatch]);

  /* ================= BỘ LỌC THỜI GIAN ================= */
  const filteredDonHangs = useMemo(() => {
    if (dateFilter === "all") return donHangs;

    const now = new Date();
    let start, end;

    switch (dateFilter) {
      case "today":
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case "yesterday":
        const yesterday = subDays(now, 1);
        start = startOfDay(yesterday);
        end = endOfDay(yesterday);
        break;
      case "thisWeek":
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "lastWeek":
        const lw = subWeeks(now, 1);
        start = startOfWeek(lw, { weekStartsOn: 1 });
        end = endOfWeek(lw, { weekStartsOn: 1 });
        break;
      case "thisMonth":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case "lastMonth":
        const lm = subMonths(now, 1);
        start = startOfMonth(lm);
        end = endOfMonth(lm);
        break;
      default:
        return donHangs;
    }

    return donHangs.filter((order) => {
      const orderDate = new Date(order.ngayNhan);
      return isWithinInterval(orderDate, { start, end });
    });
  }, [donHangs, dateFilter]);

  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  /* ================= TRẢI PHẲNG (FLATTEN) ĐỂ HIỂN THỊ TỪNG DÒNG SẢN PHẨM ================= */
  const flattenedData = useMemo(() => {
    let result = [];
    filteredDonHangs.forEach((order) => {
      (order.danhSachSanPham || []).forEach((sp, index) => {
        result.push({
          rowId: `${order._id}_${index}`,
          orderId: order._id,
          rawOrder: order,
          maDonHang: order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`,
          ngayNhan: order.ngayNhan,
          bacSi: order.bacSi?.hoVaTen || "-",
          benhNhan: order.benhNhan?.hoVaTen || "-",
          ghiChu: order.ghiChuChung || "",
          sanPham: mapTen[sp.sanPham?.toString()] || "SP",
          loai: sp.loaiDon || "Mới",
          soLuong: sp.soLuong || 1,
        });
      });
    });
    return result;
  }, [filteredDonHangs, mapTen]);

  /* ================= HELPERS TỐI ƯU ================= */
  const getFirstName = (fullName) => {
    if (!fullName || fullName === "-") return "-";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= XỬ LÝ CHỌN HÀNG ================= */
  const toggleOrder = async (order) => {
    const exists = selectedOrders.some((o) => o._id === order._id);

    if (exists) {
      setSelectedOrders((prev) => prev.filter((o) => o._id !== order._id));
      return;
    }

    try {
      const fullOrder = await dispatch(fetchDonHangById(order._id)).unwrap();
      setSelectedOrders((prev) => [...prev, fullOrder]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAll = async () => {
    if (selectedOrders.length === filteredDonHangs.length) {
      setSelectedOrders([]);
      return;
    }

    try {
      const fullOrders = await Promise.all(
        filteredDonHangs.map((order) =>
          dispatch(fetchDonHangById(order._id)).unwrap()
        )
      );
      setSelectedOrders(fullOrders);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Danh sách đơn hàng chưa xuất hóa đơn
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box className="flex items-center gap-4">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Lọc theo ngày nhận</InputLabel>
              <Select
                value={dateFilter}
                label="Lọc theo ngày nhận"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả đơn hàng</MenuItem>
                <MenuItem value="today">Hôm nay</MenuItem>
                <MenuItem value="yesterday">Hôm qua</MenuItem>
                <MenuItem value="thisWeek">Tuần này</MenuItem>
                <MenuItem value="lastWeek">Tuần trước</MenuItem>
                <MenuItem value="thisMonth">Tháng này</MenuItem>
                <MenuItem value="lastMonth">Tháng trước</MenuItem>
              </Select>
            </FormControl>

            <Typography color="textSecondary" variant="body2">
              Hiển thị: <b>{filteredDonHangs.length}</b> đơn / <b>{flattenedData.length}</b> dòng sản phẩm
            </Typography>
          </Box>
        </Box>

        <Box className="overflow-x-auto border rounded-xl">
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ bgcolor: "#f8f9fa" }}>
                  <Checkbox
                    indeterminate={
                      selectedOrders.length > 0 &&
                      selectedOrders.length < filteredDonHangs.length
                    }
                    checked={
                      filteredDonHangs.length > 0 &&
                      selectedOrders.length === filteredDonHangs.length
                    }
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Mã đơn hàng</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Nhận lúc</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Bác sĩ</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Bệnh nhân</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px", minWidth: "180px" }}>Ghi chú</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Sản phẩm</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }}>Loại</TableCell>
                <TableCell sx={{ bgcolor: "#f8f9fa", fontWeight: "bold", fontSize: "13px" }} align="center">Số lượng</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : flattenedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    Không có sản phẩm nào trong khoảng thời gian này
                  </TableCell>
                </TableRow>
              ) : (
                flattenedData.map((row) => {
                  const isSelected = selectedOrders.some((o) => o._id === row.orderId);
                  return (
                    <TableRow key={row.rowId} hover selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOrder(row.rawOrder)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{ cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                          onClick={() => {
                            onClose();
                            navigate(`/donhang/${row.orderId}/edit`);
                          }}
                        >
                          {row.maDonHang}
                        </Typography>
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(row.ngayNhan)}</TableCell>
                      <TableCell className="font-medium">{getFirstName(row.bacSi)}</TableCell>
                      <TableCell>{row.benhNhan}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "12px" }}>
                        {row.ghiChu || "-"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "text.primary" }}>{row.sanPham}</TableCell>
                      <TableCell>
                        <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: "action.hover", borderRadius: 1, fontSize: "11px" }}>
                          {row.loai}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>{row.soLuong}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f8f9fa" }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Hủy bỏ
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            // Trả trực tiếp danh sách mảng Đơn hàng đầy đủ về cho giao diện chi tiết hóa đơn xử lý liên kết mẫu mã
            onAddOrders(selectedOrders);
            setSelectedOrders([]);
            onClose();
          }}
          disabled={selectedOrders.length === 0}
        >
          Thêm vào hóa đơn ({selectedOrders.length} đơn)
        </Button>
      </DialogActions>
    </Dialog>
  );
}