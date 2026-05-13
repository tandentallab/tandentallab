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
  fetchDonHangChuaHoaDonAll,
  createHoaDon,
} from "../../redux/slices/hoaDonSlice";
import { fetchBangGiaByNhaKhoa, fetchAllBangGia } from "../../redux/slices/bangGiaSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  buildPriceMap,
  buildProductNameMap,
  calcOrderTongTien,
} from "../../utils/hoaDonUtils";

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

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  /* ================= CALL API ================= */
  useEffect(() => {
    if (selectedClinic === "all") {
      dispatch(fetchDonHangChuaHoaDonAll());
      dispatch(fetchAllBangGia());
    } else if (selectedClinic) {
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
      case "custom":
        if (!fromDate || !toDate) return donHangs;

        start = startOfDay(new Date(fromDate));
        end = endOfDay(new Date(toDate));
        break;
      default:
        return donHangs;
    }

    return donHangs.filter((order) => {
      const orderDate = new Date(order.ngayNhan);
      return isWithinInterval(orderDate, { start, end });
    });
  }, [donHangs, dateFilter, fromDate, toDate]);

  /* ================= MAP DATA ================= */
  const mapGia = useMemo(() => buildPriceMap(bangGia), [bangGia]);

  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  /* ================= LOGIC TÍNH TOÁN ================= */
  const calcTotal = (order) => {
    const currentDiscount = discounts?.[order._id];

    let discount = null;

    if (currentDiscount?.type === "%") {
      discount = {
        loaiChiecKhau: "phanTram",
        chiecKhau: currentDiscount.value,
      };
    }

    if (currentDiscount?.type === "VND") {
      discount = {
        loaiChiecKhau: "tienMat",
        chiecKhau: currentDiscount.value,
      };
    }

    return calcOrderTongTien(order, mapGia, discount);
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

  const handleCreateHoaDon = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng");
      return;
    }

    let nhaKhoaId = selectedClinic;

    // Nếu chọn "Tất cả nha khoa", validate tất cả order từ cùng 1 nha khoa
    if (selectedClinic === "all") {
      const uniqueClinicIds = new Set(
        selectedOrders.map((o) => o.nhaKhoa?._id || o.nhaKhoa)
      );

      if (uniqueClinicIds.size > 1) {
        toast.error(
          "Các đơn hàng phải từ cùng 1 nha khoa. Vui lòng chọn lại!"
        );
        return;
      }

      nhaKhoaId = selectedOrders[0].nhaKhoa?._id || selectedOrders[0].nhaKhoa;

      if (!nhaKhoaId) {
        toast.error("Không xác định được nha khoa của đơn hàng");
        return;
      }
    }

    const danhSachDonHang = selectedOrders.map((order) => ({
      donHangId: order._id,
      chietKhau: discounts[order._id]?.value || 0,
      loaiChietKhau:
        discounts[order._id]?.type === "VND" ? "tienMat" : "phanTram",
    }));

    try {
      const result = await dispatch(
        createHoaDon({ nhaKhoaId, danhSachDonHang })
      ).unwrap();

      toast.success(`Tạo hóa đơn thành công! Mã: ${result.data?.soHoaDon}`);

      // Refetch dữ liệu
      if (selectedClinic === "all") {
        dispatch(fetchDonHangChuaHoaDonAll());
      } else {
        dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      }

      setSelectedOrders([]);
      setDiscounts({});
    } catch (err) {
      toast.error(err?.message || "Tạo hóa đơn thất bại");
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
    <Paper className="rounded-2xl shadow p-3 sm:p-4 space-y-4 overflow-hidden">
      {/* ===== TOOLBAR ===== */}
      <Box className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        {/* LEFT */}
        <Box className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <FormControl
            size="small"
            sx={{
              minWidth: {
                xs: "100%",
                sm: 240,
              },
            }}
          >
            <InputLabel>Lọc theo ngày nhận</InputLabel>

            <Select
              value={dateFilter}
              label="Lọc theo ngày nhận"
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <MenuItem value="all">Tất cả đơn hàng</MenuItem>
              <hr />

              <MenuItem value="custom">Chọn khoảng ngày</MenuItem>

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
          {dateFilter === "custom" && (
            <Box className="flex flex-col sm:flex-row gap-3">
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                variant="outlined"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 210,
                  backgroundColor: "#fff",
                }}
              />

              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                variant="outlined"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  minWidth: 210,
                  backgroundColor: "#fff",
                }}
              />
            </Box>
          )}

          <Typography
            color="textSecondary"
            variant="body2"
            className="whitespace-nowrap"
          >
            Hiển thị: <b>{filteredDonHangs.length}</b> đơn hàng
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full xl:w-auto">
          <Typography
            fontWeight={600}
            color="primary"
            className="whitespace-nowrap"
          >
            Tổng chọn: {totalAll.toLocaleString()} đ
          </Typography>

          <Button
            variant="contained"
            onClick={handleCreateHoaDon}
            disabled={selectedOrders.length === 0}
            className="whitespace-nowrap"
          >
            Tạo hóa đơn ({selectedOrders.length})
          </Button>
        </Box>
      </Box>

      {/* ===== TABLE ===== */}
      <Box className="overflow-x-auto">
        <Table className="min-w-[1100px]">
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

              <TableCell className="whitespace-nowrap">Đơn hàng</TableCell>

              <TableCell className="whitespace-nowrap">Nhận lúc</TableCell>

              <TableCell className="whitespace-nowrap">Bác sĩ</TableCell>

              <TableCell className="whitespace-nowrap">Sản phẩm</TableCell>

              <TableCell className="whitespace-nowrap">Thành tiền</TableCell>

              <TableCell className="whitespace-nowrap">Chiết khấu</TableCell>
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
                  {/* CHECKBOX */}
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedOrders.some((o) => o._id === order._id)}
                      onChange={() => toggleOrder(order)}
                    />
                  </TableCell>

                  {/* ĐƠN HÀNG */}
                  <TableCell className="whitespace-nowrap">
                    <Button
                      size="small"
                      onClick={() => navigate(`/donhang/${order._id}/edit`)}
                    >
                      {order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`}
                    </Button>
                  </TableCell>

                  {/* NGÀY */}
                  <TableCell className="whitespace-nowrap">
                    {formatDate(order?.ngayNhan)}
                  </TableCell>

                  {/* BÁC SĨ */}
                  <TableCell className="min-w-[160px]">
                    <div className="break-words">
                      {order.bacSi?.hoVaTen || "-"}
                    </div>
                  </TableCell>

                  {/* SẢN PHẨM */}
                  <TableCell className="min-w-[260px]">
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

                  {/* THÀNH TIỀN */}
                  <TableCell className="whitespace-nowrap">
                    <Typography fontWeight={600}>
                      {calcTotal(order).toLocaleString()} đ
                    </Typography>
                  </TableCell>

                  {/* CHIẾT KHẤU */}
                  <TableCell>
                    <Box className="flex flex-col sm:flex-row gap-2">
                      <TextField
                        size="small"
                        placeholder="%"
                        type="number"
                        sx={{
                          width: {
                            xs: "100%",
                            sm: 70,
                          },
                        }}
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
                        sx={{
                          width: {
                            xs: "100%",
                            sm: 100,
                          },
                        }}
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
      </Box>
    </Paper>
  );
}
