import React, { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useDispatch, useSelector } from "react-redux";

import { fetchNhanVien } from "../../redux/slices/nhanVienSlice";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DownloadIcon from "@mui/icons-material/Download";

import {
  createBangLuong,
  fetchBangLuong,
  deleteBangLuong,
  deleteBangLuongByMonthYear,
} from "../../redux/slices/bangLuongSlice";

import DeleteIcon from "@mui/icons-material/Delete";

import BangLuongRow from "./BangLuongRow";

import { tinhLuong } from "../../utils/tinhLuong";
import { exportBangLuongToExcel } from "../../utils/exportToExcel";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const BangLuongPage = () => {
  const dispatch = useDispatch();

  const { data: nhanVienData } = useSelector((state) => state.nhanVien);

  const { data: bangLuongData } = useSelector((state) => state.bangLuong);

  const [thang, setThang] = useState(new Date().getMonth() + 1);

  const [nam, setNam] = useState(new Date().getFullYear());

  const [salaryData, setSalaryData] = useState([]);

  // load data
  useEffect(() => {
    dispatch(fetchNhanVien());

    dispatch(
      fetchBangLuong({
        thang,
        nam,
      })
    );
  }, [dispatch, thang, nam]);

  // nếu đã có bảng lương
  useEffect(() => {
    if (Array.isArray(bangLuongData) && bangLuongData.length > 0) {
      const rows = bangLuongData.map((item) => ({
        _id: item.nhanVien?._id,

        bangLuongId: item._id,

        hoVaTen: item.nhanVien?.hoVaTen,

        luongCanBan: item.luongCanBan,

        soNgayCong: item.soNgayCong,

        com: item.phuCapCom,

        dienThoai: item.phuCapDienThoai,

        thuong: item.thuong,

        phat: item.phat,

        ungTruoc: item.ungTruoc,

        tongLuong: item.tongLuong,

        thucNhan: item.thucNhan,
      }));

      setSalaryData(rows);
    }

    // chưa có => tạo mới
    else if (nhanVienData?.length > 0) {
      const rows = nhanVienData.map((nv) => {
        const result = tinhLuong({
          luongCoBan: nv.luongCanBan,

          soNgayCong: 0,
        });

        return {
          ...nv,

          soNgayCong: 0,

          com: 0,
          dienThoai: 0,
          thuong: 0,
          phat: 0,
          ungTruoc: 0,

          ...result,
        };
      });

      setSalaryData(rows);
    }
  }, [bangLuongData, nhanVienData]);

  const handleChange = (id, field, value) => {
    const updated = salaryData.map((item) => {
      if (item._id !== id) return item;

      const newItem = {
        ...item,
        [field]: Number(value),
      };

      const result = tinhLuong({
        luongCoBan: newItem.luongCanBan,

        soNgayCong: newItem.soNgayCong,

        com: newItem.com,

        dienThoai: newItem.dienThoai,

        thuong: newItem.thuong,

        phat: newItem.phat,

        ungTruoc: newItem.ungTruoc,
      });

      return {
        ...newItem,
        ...result,
      };
    });

    setSalaryData(updated);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa bảng lương này?"
    );

    if (!confirmDelete) return;

    try {
      await dispatch(deleteBangLuong(id)).unwrap();

      setSalaryData((prev) => prev.filter((item) => item.bangLuongId !== id));

      alert("Xóa bảng lương thành công");
    } catch (err) {
      console.log(err);

      alert(err);
    }
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm(
      `Xóa toàn bộ bảng lương tháng ${thang}/${nam}?`
    );

    if (!confirmDelete) return;

    try {
      await dispatch(
        deleteBangLuongByMonthYear({
          thang,
          nam,
        })
      ).unwrap();

      setSalaryData([]);

      dispatch(
        fetchBangLuong({
          thang,
          nam,
        })
      );

      alert("Đã xóa toàn bộ bảng lương");
    } catch (err) {
      console.log(err);

      alert(err);
    }
  };

  const tongLuong = useMemo(() => {
    return salaryData.reduce(
      (sum, item) => sum + Number(item.thucNhan || 0),
      0
    );
  }, [salaryData]);

  const chartData = salaryData.map((item) => ({
    name: item.hoVaTen,
    luong: item.thucNhan || 0,
  }));

  const handleSave = async () => {
    try {
      for (const item of salaryData) {
        await dispatch(
          createBangLuong({
            thang,
            nam,

            nhanVien: item._id,

            soNgayCong: item.soNgayCong,

            phuCapCom: item.com,

            phuCapDienThoai: item.dienThoai,

            thuong: item.thuong,

            phat: item.phat,

            ungTruoc: item.ungTruoc,
          })
        ).unwrap();
      }

      alert("Lưu bảng lương thành công");

      dispatch(
        fetchBangLuong({
          thang,
          nam,
        })
      );
    } catch (err) {
      console.log(err);

      alert(err);
    }
  };

  const handleExport = async () => {
    try {
      await exportBangLuongToExcel(salaryData, thang, nam);
    } catch (err) {
      console.log("Export error:", err);
      alert("Xuất Excel thất bại");
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const navigate = useNavigate();

  return (
    <div className="pt-20 fixed inset-0 z-[1200] bg-[#f0f2f5] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14  flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => {
              navigate(-1);
            }}
          >
            <ChevronLeftIcon></ChevronLeftIcon>
          </IconButton>
          <h2 className="text-lg font-bold">BẢNG LƯƠNG</h2>

          {bangLuongData?.length > 0 ? (
            <Chip size="small" color="success" label="Đã có bảng lương" />
          ) : (
            <Chip size="small" color="warning" label="Chưa tạo bảng lương" />
          )}
        </div>

        <div className="flex gap-3 items-center">
          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              background: "#fff",
              borderRadius: 1,
            }}
          >
            <InputLabel>Tháng</InputLabel>

            <Select
              value={thang}
              label="Tháng"
              onChange={(e) => setThang(e.target.value)}
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  Tháng {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 120,
              background: "#fff",
              borderRadius: 1,
            }}
          >
            <InputLabel>Năm</InputLabel>

            <Select
              value={nam}
              label="Năm"
              onChange={(e) => setNam(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="flex gap-2">
            <Button variant="contained" onClick={handleSave}>
              {bangLuongData?.length > 0
                ? "Cập nhật bảng lương"
                : "Tạo bảng lương"}
            </Button>

            {salaryData?.length > 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleExport}
                startIcon={<DownloadIcon />}
              >
                Xuất Excel
              </Button>
            )}

            {bangLuongData?.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAll}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <TableContainer
          component={Paper}
          sx={{
            height: "100%",
            borderRadius: 2,
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#1976d2",
                }}
              >
                {[
                  "Nhân viên",
                  "LCB",
                  "Lương/ngày",
                  "Công",
                  "Thành tiền",
                  "Cơm",
                  "Điện thoại",
                  "Thưởng",
                  "Phạt",
                  "Ứng trước",
                  "Tổng phụ cấp",
                  "Thực nhận",
                ].map((head) => (
                  <TableCell
                    key={head}
                    sx={{
                      color: "#fff",
                      fontWeight: 700,
                      backgroundColor: "#1976d2",
                    }}
                  >
                    {head}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {salaryData.map((item) => (
                <BangLuongRow
                  key={item._id}
                  item={item}
                  onChange={handleChange}
                />
              ))}

              <TableRow>
                <TableCell
                  colSpan={11}
                  align="right"
                  sx={{ fontWeight: "bold" }}
                >
                  Tổng quỹ lương
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: "bold",
                    color: "green",
                  }}
                >
                  {Number(tongLuong).toLocaleString("vi-VN")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            mb: 3,
            p: 3,
            borderRadius: 4,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
            border: "1px solid #e3f2fd",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-700">
                Biểu đồ lương nhân viên
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Thống kê lương thực nhận theo nhân viên
              </p>
            </div>

            <Chip
              sx={{
                fontWeight: 700,
                fontSize: 14,
                px: 1,
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "#fff",
              }}
              label={`Tổng quỹ lương: ${Number(tongLuong).toLocaleString(
                "vi-VN"
              )}đ`}
            />
          </div>

          <div
            style={{
              width: "100%",
              height: 360,
            }}
          >
            <ResponsiveContainer>
              <BarChart data={chartData} barCategoryGap={25}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  angle={-8}
                  textAnchor="end"
                  height={70}
                  tick={{
                    fill: "#475569",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}tr`}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [
                    `${Number(value).toLocaleString("vi-VN")} đ`,
                    "Lương",
                  ]}
                />

                <Bar
                  dataKey="luong"
                  radius={[10, 10, 0, 0]}
                  barSize={28}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default BangLuongPage;
