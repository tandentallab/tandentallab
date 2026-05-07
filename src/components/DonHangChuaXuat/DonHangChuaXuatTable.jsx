import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  Paper,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
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

export default function DonHangChuaXuatTable({
  selectedClinic,
  selectedOrders,
  setSelectedOrders,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  const [discounts, setDiscounts] = useState({});
  const [dateFilter, setDateFilter] = useState("all");

  /* ================= CALL API ================= */
  useEffect(() => {
    if (selectedClinic) {
      dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
    }
  }, [selectedClinic, dispatch]);

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
    if (discount?.type === "%") total -= (total * discount.value) / 100;
    else if (discount?.type === "VND") total -= discount.value;

    return total < 0 ? 0 : total;
  };

  const totalAll = selectedOrders.reduce(
    (sum, order) => sum + calcTotal(order),
    0
  );

  /* ================= ACTIONS ================= */
  const toggleOrder = (order) => {
    const exists = selectedOrders.find((o) => o._id === order._id);
    if (exists)
      setSelectedOrders(selectedOrders.filter((o) => o._id !== order._id));
    else setSelectedOrders([...selectedOrders, order]);
  };

  const toggleAll = () => {
    if (selectedOrders.length === filteredDonHangs.length)
      setSelectedOrders([]);
    else setSelectedOrders(filteredDonHangs);
  };

  const handleCreateHoaDon = () => {
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

    dispatch(createHoaDon({ nhaKhoaId: selectedClinic, danhSachDonHang }));
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
    <Paper className="rounded-2xl shadow p-4 space-y-4">
      {/* ===== TOOLBAR ===== */}
      <Box className="flex flex-wrap justify-between items-center gap-4">
        <Box className="flex items-center gap-4">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo ngày nhận</InputLabel>
            <Select
              value={dateFilter}
              label="Lọc theo ngày nhận"
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả đơn hàng</MenuItem>
              <hr />
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="yesterday">Hôm qua</MenuItem>
              <hr />
              <MenuItem value="thisWeek">Tuần này</MenuItem>
              <MenuItem value="lastWeek">Tuần trước</MenuItem>
              <hr />
              <MenuItem value="thisMonth">Tháng này</MenuItem>
              <MenuItem value="lastMonth">Tháng trước</MenuItem>
              <hr />
              <MenuItem value="thisYear">Năm này</MenuItem>
              <MenuItem value="lastYear">Năm trước</MenuItem>
              <hr />
              <MenuItem value="7days">7 ngày gần đây</MenuItem>
              <MenuItem value="10days">10 ngày gần đây</MenuItem>
              <MenuItem value="30days">30 ngày gần đây</MenuItem>
            </Select>
          </FormControl>

          <Typography color="textSecondary" variant="body2">
            Hiển thị: <b>{filteredDonHangs.length}</b> đơn hàng
          </Typography>
        </Box>

        <Box className="flex items-center gap-4">
          <Typography fontWeight={600} color="primary">
            Tổng chọn: {totalAll.toLocaleString()} đ
          </Typography>
          <Button
            variant="contained"
            onClick={handleCreateHoaDon}
            disabled={selectedOrders.length === 0}
          >
            Tạo hóa đơn ({selectedOrders.length})
          </Button>
        </Box>
      </Box>

      <Table>
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableCell padding="checkbox">
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
            <TableCell>Đơn hàng</TableCell>
            <TableCell>Nhận lúc</TableCell>
            <TableCell>Bác sĩ</TableCell>
            <TableCell>Sản phẩm</TableCell>
            <TableCell>Thành tiền</TableCell>
            <TableCell>Chiết khấu</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <CircularProgress size={24} />
              </TableCell>
            </TableRow>
          ) : filteredDonHangs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
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
                  <Button
                    size="small"
                    onClick={() => navigate(`/donhang/${order._id}/edit`)}
                  >
                    TAN{order._id.slice(-8).toUpperCase()}
                  </Button>
                </TableCell>
                <TableCell>{formatDate(order?.ngayNhan)}</TableCell>
                <TableCell>{order.bacSi?.hoVaTen || "-"}</TableCell>
                <TableCell>
                  <Box className="flex flex-col gap-1">
                    {order.danhSachSanPham.map((sp, i) => (
                      <Chip
                        key={i}
                        label={`${
                          mapTen[sp.sanPham?.toString()] || "SP"
                        } | SL: ${sp.soLuong}`}
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
                      sx={{ width: 70 }}
                      onChange={(e) =>
                        setDiscounts({
                          ...discounts,
                          [order._id]: {
                            type: "%",
                            value: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <TextField
                      size="small"
                      placeholder="đ"
                      type="number"
                      sx={{ width: 100 }}
                      onChange={(e) =>
                        setDiscounts({
                          ...discounts,
                          [order._id]: {
                            type: "VND",
                            value: Number(e.target.value),
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
    </Paper>
  );
}
