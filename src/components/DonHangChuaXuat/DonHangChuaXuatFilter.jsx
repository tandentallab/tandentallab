import React, { useEffect, useMemo } from "react";

import { TextField, MenuItem, Chip, Box, Typography } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";

import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

import { fetchCountDonHangChuaXuat } from "../../redux/slices/hoaDonSlice";

export default function DonHangChuaXuatFilter({
  selectedClinic,
  setSelectedClinic,
}) {
  const dispatch = useDispatch();

  const { data = [] } = useSelector((state) => state.nhaKhoa);

  const { countDonHangChuaXuat = [] } = useSelector((state) => state.hoaDon);

  useEffect(() => {
    dispatch(fetchNhaKhoa());

    dispatch(fetchCountDonHangChuaXuat());
  }, [dispatch]);

  /* ================= MAP DATA ================= */

  const infoMap = useMemo(() => {
    const map = {};

    countDonHangChuaXuat.forEach((item) => {
      map[item.nhaKhoaId] = {
        count: item.soDonHangChuaXuatHoaDon || 0,

        ngayXuatHoaDonCuoi: item.ngayXuatHoaDonCuoi || null,
      };
    });

    return map;
  }, [countDonHangChuaXuat]);

  /* ================= FORMAT DATE ================= */

  const formatDate = (date) => {
    if (!date) return "Chưa xuất";

    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <TextField
      select
      label="Chọn nha khoa"
      value={selectedClinic}
      onChange={(e) => setSelectedClinic(e.target.value)}
      className="w-96"
      size="small"
    >
      {data.map((nk) => {
        const info = infoMap[nk._id] || {
          count: 0,
          ngayXuatHoaDonCuoi: null,
        };

        return (
          <MenuItem key={nk._id} value={nk._id}>
            <Box className="flex items-center justify-between w-full gap-3">
              {/* LEFT */}
              <Box className="flex flex-col">
                <Typography fontSize={14} fontWeight={600}>
                  {nk.hoVaTen}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Xuất Hóa Đơn cuối: {formatDate(info.ngayXuatHoaDonCuoi)}
                </Typography>
              </Box>

              {/* RIGHT */}
              <Chip
                size="small"
                color={info.count > 0 ? "warning" : "success"}
                variant={info.count > 0 ? "filled" : "outlined"}
                label={`${info.count} đơn`}
              />
            </Box>
          </MenuItem>
        );
      })}
    </TextField>
  );
}
