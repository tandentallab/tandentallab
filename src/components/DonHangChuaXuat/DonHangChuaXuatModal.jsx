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
  Chip,
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
import {
  fetchDonHangChuaHoaDon,
  createHoaDon,
} from "../../redux/slices/hoaDonSlice";
import { fetchBangGiaByNhaKhoa } from "../../redux/slices/bangGiaSlice";
import { useNavigate } from "react-router-dom";
import { fetchDonHangById } from "../../redux/slices/donHangSlice";

export default function DonHangChuaXuatModal({
  open,
  onClose,
  selectedClinic,
  selectedOrders,
  setSelectedOrders,
  onAddOrders, // ✅ thêm
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Clinic: ", selectedClinic);
  }, [selectedClinic]);

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  const [discounts, setDiscounts] = useState({});
  const [dateFilter, setDateFilter] = useState("all");

  /* ================= CALL API ================= */
  useEffect(() => {
    if (open && selectedClinic) {
      dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
    }
  }, [open, selectedClinic, dispatch]);

  /* ================= XỬ LÝ LỌC NGÀY ================= */
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
      case "thisYear":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case "lastYear":
        const ly = subYears(now, 1);
        start = startOfYear(ly);
        end = endOfYear(ly);
        break;
      case "7days":
        start = subDays(now, 7);
        end = now;
        break;
      case "10days":
        start = subDays(now, 10);
        end = now;
        break;
      case "30days":
        start = subDays(now, 30);
        end = now;
        break;
      default:
        return donHangs;
    }

    return donHangs.filter((order) => {
      const orderDate = new Date(order.ngayNhan);
      return isWithinInterval(orderDate, { start, end });
    });
  }, [donHangs, dateFilter]);

  /* ================= MAP DATA ================= */
  const mapGia = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      map[item.sanPhamId?.toString()] = item.donGia;
    });
    return map;
  }, [bangGia]);

  const mapTen = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      map[item.sanPhamId?.toString()] = item.tenSanPham;
    });
    return map;
  }, [bangGia]);

  /* ================= LOGIC TÍNH TOÁN ================= */
  const calcTotal = (order) => {
    let total = order.danhSachSanPham.reduce((sum, sp) => {
      const donGia = mapGia[sp.sanPham?.toString()] || 0;
      return sum + donGia * sp.soLuong;
    }, 0);

    const discount = discounts[order._id];
    if (discount?.loaiChiecKhau === "phanTram") {
      total -= (total * (discount.chiecKhau || 0)) / 100;
    } else if (discount?.loaiChiecKhau === "tienMat") {
      total -= discount.chiecKhau || 0;
    }

    return total < 0 ? 0 : total;
  };

  const buildOrderInvoiceItem = (order) => {
    console.log("Bảng giá: ", mapGia);
    console.log("Data bang giá: ", bangGia);
    console.log("Danh sách sản phẩm: ", order.danhSachSanPham);
    const tongTien = order.danhSachSanPham.reduce((sum, sp) => {
      console.log("Sản phẩm id: ", sp.sanPham._id.toString());
      const donGia = mapGia[sp.sanPham._id.toString()] || 0;
      console.log("Đơn giá của sp ", sp.sanPham._id.toString(), " = ", donGia);
      return sum + donGia * sp.soLuong;
    }, 0);

    const discount = discounts?.[order._id];

    let thanhTienSauCK = tongTien;

    if (discount?.loaiChiecKhau === "phanTram") {
      thanhTienSauCK = tongTien - (tongTien * (discount.chiecKhau || 0)) / 100;
    } else if (discount?.loaiChiecKhau === "tienMat") {
      thanhTienSauCK = tongTien - (discount.chiecKhau || 0);
    }

    return {
      donHang: order,
      tongTien,
      chietKhau: discount?.chiecKhau || 0,
      loaiChietKhau:
        discount?.loaiChiecKhau === "tienMat" ? "tienMat" : "phanTram",
      thanhTienSauCK: Math.max(thanhTienSauCK, 0),
    };
  };

  const totalAll = selectedOrders.reduce(
    (sum, order) => sum + calcTotal(order),
    0
  );

  /* ================= ACTIONS ================= */
  const toggleOrder = async (order) => {
    const exists = selectedOrders.some((o) => o._id === order._id);

    // Nếu đã tồn tại => bỏ chọn
    if (exists) {
      setSelectedOrders((prev) => prev.filter((o) => o._id !== order._id));
      return;
    }

    try {
      // Lấy chi tiết đầy đủ đơn hàng
      const fullOrder = await dispatch(fetchDonHangById(order._id)).unwrap();

      setSelectedOrders((prev) => [...prev, fullOrder]);
    } catch (err) {
      console.error("Lỗi lấy chi tiết đơn hàng:", err);
    }
  };

  const toggleAll = async () => {
    // Nếu đã chọn hết => bỏ chọn hết
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
      console.error("Lỗi lấy danh sách đơn hàng:", err);
    }
  };
  const handleCreateHoaDon = async () => {
    if (!selectedClinic || selectedOrders.length === 0) {
      alert("Chọn nha khoa và ít nhất 1 đơn hàng");
      return;
    }
    const danhSachDonHang = selectedOrders.map((order) => ({
      donHangId: order._id,
      chietKhau: discounts[order._id]?.value || 0,
      loaiChietKhau:
        discounts[order._id]?.type === "VND" ? "tienMat" : "phanTram",
    }));

    const result = await dispatch(
      createHoaDon({ nhaKhoaId: selectedClinic, danhSachDonHang })
    );
    if (result.meta.requestStatus === "fulfilled") {
      onClose(); // Đóng modal sau khi tạo thành công
    }
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
    >
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
        {/* ===== TOOLBAR TRONG MODAL ===== */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box className="flex items-center gap-4">
            <FormControl size="small" sx={{ minWidth: 200 }}>
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
                <MenuItem value="7days">7 ngày gần đây</MenuItem>
                <MenuItem value="30days">30 ngày gần đây</MenuItem>
              </Select>
            </FormControl>

            <Typography color="textSecondary" variant="body2">
              Hiển thị: <b>{filteredDonHangs.length}</b> đơn hàng
            </Typography>
          </Box>

          <Typography fontWeight={600} color="primary" variant="h6">
            Tổng chọn: {totalAll.toLocaleString()} đ
          </Typography>
        </Box>

        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: "#f5f5f5" }}>
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
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Đơn hàng
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Nhận lúc
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Bác sĩ
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Sản phẩm
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Thành tiền
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
                Chiết khấu
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredDonHangs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  Không có đơn hàng nào trong khoảng thời gian này
                </TableCell>
              </TableRow>
            ) : (
              filteredDonHangs.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.some((o) => o._id === order._id)}
                      onChange={() => toggleOrder(order)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => {
                        onClose();
                        navigate(`/donhang/${order._id}/edit`);
                      }}
                    >
                      TAN{order._id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(order?.ngayNhan)}</TableCell>
                  <TableCell>{order.bacSi?.hoVaTen || "-"}</TableCell>
                  <TableCell>
                    <Box
                      className="flex flex-wrap gap-1"
                      sx={{ maxWidth: 250 }}
                    >
                      {order.danhSachSanPham.map((sp, i) => (
                        <Chip
                          key={i}
                          label={`${mapTen[sp.sanPham?.toString()] || "SP"} x${
                            sp.soLuong
                          }`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>
                      {calcTotal(order).toLocaleString()} đ
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex gap-1">
                      <TextField
                        size="small"
                        placeholder="%"
                        type="number"
                        sx={{ width: 65 }}
                        onChange={(e) =>
                          setDiscounts({
                            ...discounts,
                            [order._id]: {
                              loaiChiecKhau: "phanTram",
                              chiecKhau: Number(e.target.value),
                            },
                          })
                        }
                      />
                      <TextField
                        size="small"
                        placeholder="VNĐ"
                        type="number"
                        sx={{ width: 90 }}
                        onChange={(e) =>
                          setDiscounts({
                            ...discounts,
                            [order._id]: {
                              loaiChiecKhau: "tienMat",
                              chiecKhau: Number(e.target.value),
                            },
                          })
                        }
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f9f9f9" }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Hủy bỏ
        </Button>

        {/* ✅ NÚT MỚI */}
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            const mappedOrders = selectedOrders.map(buildOrderInvoiceItem);

            onAddOrders(mappedOrders);

            setSelectedOrders([]);
            onClose();
          }}
          disabled={selectedOrders.length === 0}
        >
          Thêm vào hóa đơn ({selectedOrders.length})
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateHoaDon}
          disabled={selectedOrders.length === 0 || loading}
        >
          Tạo hóa đơn
        </Button>
      </DialogActions>
    </Dialog>
  );
}
