import React from "react";

import { TableRow, TableCell, TextField, Button } from "@mui/material";

import { tinhLuong } from "../../utils/tinhLuong";
import { useNavigate } from "react-router-dom";

const BangLuongRow = ({ item, onChange }) => {
  // 🔥 Tính lương realtime
  const { luongNgay, thanhTienCong, tongPhuCap, thucNhan } = tinhLuong({
    luongCoBan: item.luongCanBan,

    soNgayCong: item.soNgayCong,

    com: item.com,

    dienThoai: item.dienThoai,

    thuong: item.thuong,

    ungTruoc: item.ungTruoc,
  });

  const smallInputStyle = {
    width: 70,
    transition: "0.2s",

    "& .MuiInputBase-input": {
      textAlign: "center",
      py: 1,
    },

    "&:focus-within": {
      width: 110,
    },
  };

  const largeInputStyle = {
    width: 110,

    "& .MuiInputBase-input": {
      textAlign: "center",
      py: 1,
    },
  };

  const navigate = useNavigate();

  return (
    <TableRow hover>
      {/* Tên */}
      <TableCell>
        <Button
          variant="text"
          onClick={() => {
            navigate(`/nhan-vien/${item._id}`);
          }}
        >
          {item.hoVaTen}
        </Button>
      </TableCell>

      {/* Lương cơ bản */}
      <TableCell align="right">
        {Number(item.luongCanBan || 0).toLocaleString("vi-VN")}
      </TableCell>

      {/* Lương ngày */}
      <TableCell align="right">
        {Number(luongNgay || 0).toLocaleString("vi-VN")}
      </TableCell>

      {/* Ngày công */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={largeInputStyle}
          value={item.soNgayCong || 0}
          onChange={(e) =>
            onChange(item._id, "soNgayCong", Number(e.target.value))
          }
        />
      </TableCell>

      {/* Thành tiền công */}
      <TableCell align="right">
        {Number(thanhTienCong || 0).toLocaleString("vi-VN")}
      </TableCell>

      {/* Cơm */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={smallInputStyle}
          value={item.com || 0}
          onChange={(e) => onChange(item._id, "com", Number(e.target.value))}
        />
      </TableCell>

      {/* Điện thoại */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={smallInputStyle}
          value={item.dienThoai || 0}
          onChange={(e) =>
            onChange(item._id, "dienThoai", Number(e.target.value))
          }
        />
      </TableCell>

      {/* Thưởng */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={smallInputStyle}
          value={item.thuong || 0}
          onChange={(e) => onChange(item._id, "thuong", Number(e.target.value))}
        />
      </TableCell>

      {/* Phạt */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={smallInputStyle}
          value={item.phat || 0}
          onChange={(e) => onChange(item._id, "phat", Number(e.target.value))}
        />
      </TableCell>

      {/* Ứng trước */}
      <TableCell>
        <TextField
          size="small"
          type="number"
          sx={largeInputStyle}
          value={item.ungTruoc || 0}
          onChange={(e) =>
            onChange(item._id, "ungTruoc", Number(e.target.value))
          }
        />
      </TableCell>

      {/* Tổng phụ cấp */}
      <TableCell align="right">
        {Number(tongPhuCap || 0).toLocaleString("vi-VN")}
      </TableCell>

      {/* Thực nhận */}
      <TableCell
        align="right"
        sx={{
          fontWeight: 700,
          color: "green",
        }}
      >
        {Number(thucNhan || 0).toLocaleString("vi-VN")}
      </TableCell>
    </TableRow>
  );
};

export default BangLuongRow;
