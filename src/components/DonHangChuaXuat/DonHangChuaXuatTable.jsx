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
import {
  fetchBangGiaByNhaKhoa,
  fetchAllBangGia,
} from "../../redux/slices/bangGiaSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { buildProductNameMap } from "../../utils/hoaDonUtils";

export default function DonHangChuaXuatTable({
  selectedClinic,
  selectedOrders,
  setSelectedOrders,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

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

  /* ================= MAP DATA SẢN PHẨM ================= */
  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  /* ================= TRẢI PHẲNG (FLATTEN) DỮ LIỆU ĐỂ HIỂN THỊ TỪNG DÒNG ================= */
  const flattenedData = useMemo(() => {
    let result = [];
    filteredDonHangs.forEach((order) => {
      (order.danhSachSanPham || []).forEach((sp, index) => {
        result.push({
          rowId: `${order._id}_${index}`,
          orderId: order._id,
          rawOrder: order, // Giữ lại object gốc để xử lý select
          maDonHang: order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`,
          ngayNhan: order.ngayNhan,
          bacSi: order.bacSi?.hoVaTen,
          benhNhan: order.benhNhan?.hoVaTen,
          ghiChu: order.ghiChuChung || "", // Theo yêu cầu: ghi chú trong đơn hàng
          sanPham: mapTen[sp.sanPham?.toString()] || "SP",
          loai: sp.loaiDon || "Mới",
          soLuong: sp.soLuong || 1,
        });
      });
    });
    return result;
  }, [filteredDonHangs, mapTen]);

  /* ================= HELPERS ================= */
  const getFirstName = (fullName) => {
    if (!fullName) return "-";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1]; // Lấy chữ cuối làm Tên
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

  /* ================= ACTIONS ================= */
  // Khi tick vào 1 sản phẩm -> Chọn luôn cả đơn hàng chứa nó
  const toggleOrder = (orderId, rawOrder) => {
    const exists = selectedOrders.some((o) => o._id === orderId);
    if (exists) {
      setSelectedOrders(selectedOrders.filter((o) => o._id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, rawOrder]);
    }
  };

  const toggleAll = () => {
    if (selectedOrders.length === filteredDonHangs.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredDonHangs);
    }
  };

  const handleCreateHoaDon = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng");
      return;
    }

    let nhaKhoaId = selectedClinic;

    // Validate chung 1 nha khoa
    if (selectedClinic === "all") {
      const uniqueClinicIds = new Set(
        selectedOrders.map((o) => o.nhaKhoa?._id || o.nhaKhoa)
      );

      if (uniqueClinicIds.size > 1) {
        toast.error("Các đơn hàng phải từ cùng 1 nha khoa. Vui lòng chọn lại!");
        return;
      }

      nhaKhoaId = selectedOrders[0].nhaKhoa?._id || selectedOrders[0].nhaKhoa;
      if (!nhaKhoaId) {
        toast.error("Không xác định được nha khoa của đơn hàng");
        return;
      }
    }

    // Payload chuẩn khớp với backend mới
    const danhSachDonHangIds = selectedOrders.map((order) => order._id);

    try {
      const result = await dispatch(
        createHoaDon({ nhaKhoaId, danhSachDonHangIds })
      ).unwrap();

      toast.success(`Tạo hóa đơn thành công!`);
      // Chuyển hướng sang trang chi tiết để chỉnh sửa thuế, CK, xem bảng
      navigate(`/hoa-don/${result.data?._id}/edit`);

      setSelectedOrders([]);
    } catch (err) {
      toast.error(err?.message || "Tạo hóa đơn thất bại");
    }
  };

  return (
    <Paper className="rounded-2xl shadow p-3 sm:p-4 space-y-4 overflow-hidden">
      {/* ===== TOOLBAR ===== */}
      <Box className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4">
        {/* LEFT */}
        <Box className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 240 } }}>
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
            </Select>
          </FormControl>

          {dateFilter === "custom" && (
            <Box className="flex flex-col sm:flex-row gap-3">
              <TextField
                label="Từ ngày"
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 210, bgcolor: "#fff" }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 210, bgcolor: "#fff" }}
              />
            </Box>
          )}

          <Typography color="textSecondary" variant="body2">
            Hiển thị: <b>{filteredDonHangs.length}</b> đơn / <b>{flattenedData.length}</b> sản phẩm
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="contained"
            onClick={handleCreateHoaDon}
            disabled={selectedOrders.length === 0}
            className="whitespace-nowrap"
          >
            Tạo hóa đơn ({selectedOrders.length} đơn)
          </Button>
        </Box>
      </Box>

      {/* ===== TABLE CHUẨN ===== */}
      <Box className="overflow-x-auto border rounded-xl">
        <Table className="min-w-[1000px]">
          <TableHead>
            <TableRow className="bg-gray-50">
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
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Mã đơn hàng</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Nhận lúc</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Bác sĩ</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Bệnh nhân</TableCell>
              <TableCell className="font-bold text-[13px] min-w-[200px]">Ghi chú</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Sản phẩm</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap">Loại</TableCell>
              <TableCell className="font-bold text-[13px] whitespace-nowrap text-center">Số lượng</TableCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y divide-gray-100">
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" className="py-10">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : flattenedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" className="py-10 text-gray-500">
                  Không có sản phẩm nào trong khoảng thời gian này
                </TableCell>
              </TableRow>
            ) : (
              flattenedData.map((row, index) => {
                const isSelected = selectedOrders.some((o) => o._id === row.orderId);

                return (
                  <TableRow
                    key={row.rowId}
                    hover
                    className={isSelected ? "bg-blue-50/30" : ""}
                  >
                    {/* CHECKBOX */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleOrder(row.orderId, row.rawOrder)}
                      />
                    </TableCell>

                    {/* MÃ ĐƠN HÀNG */}
                    <TableCell className="whitespace-nowrap">
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: "pointer", fontWeight: 'bold' }}
                        onClick={() => navigate(`/donhang/${row.orderId}/edit`)}
                      >
                        {row.maDonHang}
                      </Typography>
                    </TableCell>

                    {/* NHẬN LÚC */}
                    <TableCell className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(row.ngayNhan)}
                    </TableCell>

                    {/* BÁC SĨ (Lấy Tên) */}
                    <TableCell className="whitespace-nowrap font-medium text-sm">
                      {getFirstName(row.bacSi)}
                    </TableCell>

                    {/* BỆNH NHÂN */}
                    <TableCell className="whitespace-nowrap text-sm">
                      {row.benhNhan || "-"}
                    </TableCell>

                    {/* GHI CHÚ */}
                    <TableCell className="text-xs text-gray-500 max-w-[200px] truncate">
                      {row.ghiChu || "-"}
                    </TableCell>

                    {/* SẢN PHẨM */}
                    <TableCell className="whitespace-nowrap font-bold text-sm text-gray-800">
                      {row.sanPham}
                    </TableCell>

                    {/* LOẠI */}
                    <TableCell className="whitespace-nowrap text-xs">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {row.loai}
                      </span>
                    </TableCell>

                    {/* SỐ LƯỢNG */}
                    <TableCell className="whitespace-nowrap text-center font-bold">
                      {row.soLuong}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}