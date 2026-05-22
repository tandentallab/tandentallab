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

// Màu header theo hình
const HEADER_COLOR = "#1565c0"; // xanh đậm

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
    if (!selectedClinic) return; // Chưa chọn clinic thì không call
    if (selectedClinic === "all") {
      dispatch(fetchDonHangChuaHoaDonAll());
      dispatch(fetchAllBangGia());
    } else {
      dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
    }
  }, [selectedClinic, dispatch]);

  /* ================= LỌC NGÀY ================= */
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
      case "custom":
        if (!fromDate || !toDate) return donHangs;
        start = startOfDay(new Date(fromDate));
        end = endOfDay(new Date(toDate));
        break;
      default:
        return donHangs;
    }
    return donHangs.filter((order) =>
      isWithinInterval(new Date(order.ngayNhan), { start, end })
    );
  }, [donHangs, dateFilter, fromDate, toDate]);

  /* ================= MAP SẢN PHẨM ================= */
  const mapTen = useMemo(() => buildProductNameMap(bangGia), [bangGia]);

  /* ================= FLATTEN ================= */
  const flattenedData = useMemo(() => {
    let result = [];
    filteredDonHangs.forEach((order) => {
      (order.danhSachSanPham || []).forEach((sp, index) => {
        result.push({
          rowId: `${order._id}_${index}`,
          orderId: order._id,
          rawOrder: order,
          maDonHang:
            order.maDonHang || `TAN${order._id.slice(-8).toUpperCase()}`,
          ngayNhan: order.ngayNhan,
          bacSi: order.bacSi?.hoVaTen,
          benhNhan: order.benhNhan?.hoVaTen,
          ghiChu: order.ghiChuChung || "",
          sanPham: mapTen[sp.sanPham?.toString()] || "SP",
          // Mã = loại viết tắt (KL, UNC, ...)
          ma:
            sp.maSanPham ||
            mapTen[sp.sanPham?.toString()]?.slice(0, 3).toUpperCase() ||
            "KL",
          viTri: sp.viTri,
          loai: sp.loaiDon || "Mới",
          soLuong: sp.soLuong || 1,
        });
      });
    });
    return result;
  }, [filteredDonHangs, mapTen]);

  useEffect(() => {
    console.log("Dữ liệu: ", flattenedData);
  }, [flattenedData]);

  /* ================= HELPERS ================= */
  const getFirstName = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
  };

  const formatDateShort = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* ================= SELECT ================= */
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

  /* ================= TẠO HÓA ĐƠN ================= */
  const handleCreateHoaDon = async () => {
    if (selectedOrders.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 đơn hàng");
      return;
    }
    let nhaKhoaId = selectedClinic;
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
    const danhSachDonHangIds = selectedOrders.map((order) => order._id);
    try {
      const result = await dispatch(
        createHoaDon({ nhaKhoaId, danhSachDonHangIds })
      ).unwrap();
      toast.success("Tạo hóa đơn thành công!");
      navigate(`/hoa-don/${result.data?._id}/edit`);
      setSelectedOrders([]);
    } catch (err) {
      toast.error(err?.message || "Tạo hóa đơn thất bại");
    }
  };

  /* ================= EMPTY STATE ================= */
  if (!selectedClinic) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 9h18M9 21V9M3 3h18v18H3z" />
        </svg>
        <Typography color="text.secondary">
          Chọn nha khoa ở bên trái để xem đơn hàng
        </Typography>
      </div>
    );
  }

  const renderViTriText = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "";
    return viTriArr
      .map((v) =>
        v.kieu === "Rời"
          ? v.soRang.join(", ")
          : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
      )
      .join("; ");
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ===== TOOLBAR ===== */}
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-white flex-shrink-0">
        {/* Filter ngày */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Lọc theo ngày nhận</InputLabel>
          <Select
            value={dateFilter}
            label="Lọc theo ngày nhận"
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <MenuItem value="all">Tất cả đơn hàng</MenuItem>
            <MenuItem value="custom">Chọn khoảng ngày</MenuItem>
            <MenuItem value="today">Hôm nay</MenuItem>
            <MenuItem value="yesterday">Hôm qua</MenuItem>
            <MenuItem value="thisWeek">Tuần này</MenuItem>
            <MenuItem value="lastWeek">Tuần trước</MenuItem>
            <MenuItem value="thisMonth">Tháng này</MenuItem>
            <MenuItem value="lastMonth">Tháng trước</MenuItem>
          </Select>
        </FormControl>

        {dateFilter === "custom" && (
          <>
            <TextField
              label="Từ ngày"
              type="date"
              size="small"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
            <TextField
              label="Đến ngày"
              type="date"
              size="small"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />
          </>
        )}

        <div className="flex-1" />

        {selectedOrders.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCreateHoaDon}
          >
            Tạo hóa đơn ({selectedOrders.length} đơn)
          </Button>
        )}
      </div>

      {/* ===== TABLE ===== */}
      <div className="flex-1 overflow-auto">
        <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell
                padding="checkbox"
                sx={{
                  bgcolor: "white",
                  borderBottom: "2px solid #e0e0e0",
                  width: 40,
                }}
              >
                <Checkbox
                  size="small"
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
              {[
                "Số",
                "Nhận lúc",
                "Bác sĩ",
                "Bệnh nhân",
                "Sản phẩm",
                "Mã",
                "Vị trí",
                "Loại",
              ].map((label) => (
                <TableCell
                  key={label}
                  sx={{
                    bgcolor: "white",
                    borderBottom: "2px solid #e0e0e0",
                    color: HEADER_COLOR,
                    fontWeight: 700,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    py: 1,
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : flattenedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  align="center"
                  sx={{ py: 8, color: "text.secondary" }}
                >
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              flattenedData.map((row) => {
                const isSelected = selectedOrders.some(
                  (o) => o._id === row.orderId
                );
                return (
                  <TableRow
                    key={row.rowId}
                    hover
                    sx={{
                      bgcolor: isSelected ? "#e3f2fd" : "white",
                      "&:hover": {
                        bgcolor: isSelected ? "#e3f2fd" : "#fafafa",
                      },
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* CHECKBOX */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => toggleOrder(row.orderId, row.rawOrder)}
                      />
                    </TableCell>

                    {/* SỐ (mã đơn) */}
                    <TableCell sx={{ py: 0.8 }}>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 13,
                        }}
                        onClick={() => navigate(`/donhang/${row.orderId}/edit`)}
                      >
                        {row.maDonHang}
                      </Typography>
                    </TableCell>

                    {/* NHẬN LÚC */}
                    <TableCell
                      sx={{
                        fontSize: 13,
                        color: "#555",
                        whiteSpace: "nowrap",
                        py: 0.8,
                      }}
                    >
                      {formatDateShort(row.ngayNhan)}
                    </TableCell>

                    {/* BÁC SĨ */}
                    <TableCell sx={{ fontSize: 13, py: 0.8 }}>
                      {getFirstName(row.bacSi)}
                    </TableCell>

                    {/* BỆNH NHÂN */}
                    <TableCell sx={{ fontSize: 13, py: 0.8 }}>
                      {row.benhNhan
                        ? row.benhNhan.length > 15
                          ? row.benhNhan.slice(0, 13) + "…"
                          : row.benhNhan
                        : "-"}
                    </TableCell>

                    {/* SẢN PHẨM */}
                    <TableCell sx={{ fontSize: 13, fontWeight: 500, py: 0.8 }}>
                      {row.sanPham}
                    </TableCell>

                    {/* MÃ */}
                    <TableCell
                      sx={{ fontSize: 13, py: 0.8, whiteSpace: "nowrap" }}
                    >
                      {row.ma}
                    </TableCell>

                    {/* VỊ TRÍ */}
                    <TableCell
                      sx={{
                        fontSize: 12,
                        color: "#888",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        py: 0.8,
                      }}
                    >
                      {renderViTriText(row.viTri) || ""}
                    </TableCell>

                    {/* LOẠI */}
                    <TableCell
                      sx={{ fontSize: 13, py: 0.8, whiteSpace: "nowrap" }}
                    >
                      {row.loai}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-4 py-2 border-t bg-white flex-shrink-0 flex justify-end">
        <Typography variant="caption" color="text.secondary" fontSize={12}>
          {flattenedData.length} Trong số {flattenedData.length}
        </Typography>
      </div>
    </div>
  );
}
