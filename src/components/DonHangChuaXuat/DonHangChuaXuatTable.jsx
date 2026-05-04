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
} from "@mui/material";

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

  const { donHangs = [], loading } = useSelector((state) => state.hoaDon) || {};
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};

  const [discounts, setDiscounts] = useState({});

  /* ================= CALL API ================= */
  useEffect(() => {
    if (selectedClinic) {
      dispatch(fetchDonHangChuaHoaDon(selectedClinic));
      dispatch(fetchBangGiaByNhaKhoa(selectedClinic));
    }
  }, [selectedClinic, dispatch]);

  /* ================= MAP GIÁ ================= */
  const mapGia = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      map[item.sanPhamId?.toString()] = item.donGia;
    });
    return map;
  }, [bangGia]);

  /* ================= MAP TÊN ================= */
  const mapTen = useMemo(() => {
    const map = {};
    bangGia.forEach((item) => {
      map[item.sanPhamId?.toString()] = item.tenSanPham;
    });
    return map;
  }, [bangGia]);

  /* ================= SELECT ================= */
  const toggleOrder = (order) => {
    const exists = selectedOrders.find((o) => o._id === order._id);

    if (exists) {
      setSelectedOrders(selectedOrders.filter((o) => o._id !== order._id));
    } else {
      setSelectedOrders([...selectedOrders, order]);
    }
  };

  const toggleAll = () => {
    if (selectedOrders.length === donHangs.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(donHangs);
    }
  };

  /* ================= TÍNH TIỀN ================= */
  const calcTotal = (order) => {
    let total = order.danhSachSanPham.reduce((sum, sp) => {
      const donGia = mapGia[sp.sanPham?.toString()] || 0;
      return sum + donGia * sp.soLuong;
    }, 0);

    const discount = discounts[order._id];

    if (discount?.type === "%") {
      total -= (total * discount.value) / 100;
    } else if (discount?.type === "VND") {
      total -= discount.value;
    }

    return total < 0 ? 0 : total;
  };

  /* ================= TẠO HÓA ĐƠN ================= */
  const handleCreateHoaDon = () => {
    if (!selectedClinic || selectedOrders.length === 0) {
      alert("Chọn nha khoa và ít nhất 1 đơn hàng");
      return;
    }

    const danhSachDonHang = selectedOrders.map((order) => {
      const discount = discounts[order._id];

      return {
        donHangId: order._id,
        chietKhau: discount?.value || 0,
        loaiChietKhau:
          discount?.type === "%"
            ? "phanTram"
            : discount?.type === "VND"
            ? "tienMat"
            : "phanTram",
      };
    });

    dispatch(
      createHoaDon({
        nhaKhoaId: selectedClinic,
        danhSachDonHang,
      })
    );
  };

  /* ================= TOTAL ================= */
  const totalAll = selectedOrders.reduce(
    (sum, order) => sum + calcTotal(order),
    0
  );

  const navigate = useNavigate();

  return (
    <Paper className="rounded-2xl shadow p-4 space-y-3">
      {/* ===== BUTTON TẠO ===== */}
      <div className="flex justify-between items-center">
        <Typography fontWeight={600}>
          Tổng hóa đơn: {totalAll.toLocaleString()} đ
        </Typography>

        <Button variant="contained" onClick={handleCreateHoaDon}>
          Tạo hóa đơn
        </Button>
      </div>

      <Table>
        {/* ===== HEADER ===== */}
        <TableHead>
          <TableRow className="bg-gray-100">
            <TableCell>
              <Checkbox onChange={toggleAll} />
            </TableCell>
            <TableCell>Đơn hàng</TableCell>
            <TableCell>Bác sĩ</TableCell>
            <TableCell>Sản phẩm</TableCell>
            <TableCell>Thành tiền</TableCell>
            <TableCell>Chiết khấu</TableCell>
          </TableRow>
        </TableHead>

        {/* ===== BODY ===== */}
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}

          {!loading && donHangs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Không có đơn hàng
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            donHangs.map((order) => (
              <TableRow key={order._id} hover>
                {/* CHECKBOX */}
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.some((o) => o._id === order._id)}
                    onChange={() => toggleOrder(order)}
                  />
                </TableCell>

                {/* MÃ */}
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => {
                      navigate(`/donhang/${order._id}/edit`);
                    }}
                  >
                    TAN{order._id.substring(order._id.length - 8).toUpperCase()}
                  </Button>
                  <b></b>
                </TableCell>

                {/* BỆNH NHÂN */}
                <TableCell>{order.bacSi?.hoVaTen || "-"}</TableCell>

                {/* SẢN PHẨM */}
                <TableCell>
                  <Box className="flex flex-col gap-1">
                    {order.danhSachSanPham.map((sp, i) => (
                      <Chip
                        key={i}
                        label={`${
                          mapTen[sp.sanPham?.toString()] || "SP"
                        } | SL: ${sp.soLuong}`}
                        size="small"
                      />
                    ))}
                  </Box>
                </TableCell>

                {/* THÀNH TIỀN */}
                <TableCell>
                  <Typography fontWeight={600}>
                    {calcTotal(order).toLocaleString()} đ
                  </Typography>
                </TableCell>

                {/* CHIẾT KHẤU */}
                <TableCell>
                  <Box className="flex gap-2">
                    <TextField
                      size="small"
                      placeholder="%"
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
                      placeholder="VND"
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
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
