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
import SaveIcon from "@mui/icons-material/Save";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import {
  createBangLuong,
  fetchBangLuong,
  deleteBangLuong,
  deleteBangLuongByMonthYear,
} from "../../redux/slices/bangLuongSlice";
import BangLuongRow from "./BangLuongRow";
import { tinhLuong } from "../../utils/tinhLuong";
import { exportBangLuongToExcel } from "../../utils/exportToExcel";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
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
];

const BangLuongPage = () => {
  const dispatch = useDispatch();
  const { data: nhanVienData } = useSelector((state) => state.nhanVien);
  const { data: bangLuongData } = useSelector((state) => state.bangLuong);

  const [thang, setThang] = useState(new Date().getMonth() + 1);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [salaryData, setSalaryData] = useState([]);

  useEffect(() => {
    dispatch(fetchNhanVien());
    dispatch(fetchBangLuong({ thang, nam }));
  }, [dispatch, thang, nam]);

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
    } else if (nhanVienData?.length > 0) {
      const activeNhanVien = nhanVienData.filter(
        (nv) => nv?.trangThai?.trim() === "Đang làm"
      );
      const rows = activeNhanVien.map((nv) => {
        const result = tinhLuong({ luongCoBan: nv.luongCanBan, soNgayCong: 0 });
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
      const newItem = { ...item, [field]: Number(value) };
      const result = tinhLuong({
        luongCoBan: newItem.luongCanBan,
        soNgayCong: newItem.soNgayCong,
        com: newItem.com,
        dienThoai: newItem.dienThoai,
        thuong: newItem.thuong,
        phat: newItem.phat,
        ungTruoc: newItem.ungTruoc,
      });
      return { ...newItem, ...result };
    });
    setSalaryData(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa bảng lương này?")) return;
    try {
      await dispatch(deleteBangLuong(id)).unwrap();
      setSalaryData((prev) => prev.filter((item) => item.bangLuongId !== id));
      alert("Xóa bảng lương thành công");
    } catch (err) {
      alert(err);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Xóa toàn bộ bảng lương tháng ${thang}/${nam}?`))
      return;
    try {
      await dispatch(deleteBangLuongByMonthYear({ thang, nam })).unwrap();
      setSalaryData([]);
      dispatch(fetchBangLuong({ thang, nam }));
      alert("Đã xóa toàn bộ bảng lương");
    } catch (err) {
      alert(err);
    }
  };

  const tongLuong = useMemo(
    () => salaryData.reduce((sum, item) => sum + Number(item.thucNhan || 0), 0),
    [salaryData]
  );

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
      dispatch(fetchBangLuong({ thang, nam }));
    } catch (err) {
      alert(err);
    }
  };

  const handleExport = async () => {
    try {
      await exportBangLuongToExcel(salaryData, thang, nam);
    } catch (err) {
      alert("Xuất Excel thất bại");
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const navigate = useNavigate();
  const hasData = bangLuongData?.length > 0;

  return (
    <div
      className="fixed h-full w-full inset-0 z-[1299] flex flex-col overflow-hidden"
      style={{ background: "#f1f5f9" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="shrink-0 flex flex-col md:flex-row md:items-center justify-between px-4 py-4 md:px-5 md:py-3 shadow-md gap-4 md:gap-2"
        style={{
          background: "linear-gradient(90deg, #0f172a 0%, #1e3a5f 100%)",
          minHeight: 60,
        }}
      >
        {/* Left Section */}
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <IconButton
              size="small"
              onClick={() => navigate(-1)}
              sx={{
                color: "#94a3b8",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <div>
              <div
                className="text-white font-bold text-sm sm:text-base tracking-wide"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: 2,
                }}
              >
                BẢNG LƯƠNG
              </div>
              <div className="text-slate-400 text-xs">
                Tháng {thang} / {nam}
              </div>
            </div>
          </div>

          <span
            className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={
              hasData
                ? {
                    background: "#166534",
                    color: "#86efac",
                    border: "1px solid #166534",
                  }
                : {
                    background: "#78350f",
                    color: "#fde68a",
                    border: "1px solid #78350f",
                  }
            }
          >
            {hasData ? "✓ Đã có bảng lương" : "⚠ Chưa tạo bảng lương"}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Month / Year selects wrapped together */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {[
              {
                label: "Tháng",
                value: thang,
                setter: setThang,
                items: months.map((m) => ({ val: m, label: `Tháng ${m}` })),
              },
              {
                label: "Năm",
                value: nam,
                setter: setNam,
                items: years.map((y) => ({ val: y, label: `${y}` })),
              },
            ].map(({ label, value, setter, items }) => (
              <FormControl
                key={label}
                size="small"
                className="flex-1 sm:flex-none"
                sx={{ minWidth: { xs: 0, sm: 110 } }}
              >
                <Select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  sx={{
                    background: "rgba(255,255,255,0.07)",
                    color: "#e2e8f0",
                    borderRadius: 1.5,
                    fontSize: 13,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255,255,255,0.35)",
                    },
                    "& .MuiSvgIcon-root": { color: "#94a3b8" },
                  }}
                >
                  {items.map(({ val, label: lbl }) => (
                    <MenuItem key={val} value={val}>
                      {lbl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </div>

          {/* Vertical Divider - Hidden on Mobile/Tablet stack layout */}
          <div
            className="hidden lg:block"
            style={{
              width: 1,
              height: 28,
              background: "rgba(255,255,255,0.12)",
              margin: "0 4px",
            }}
          />

          {/* Actions Buttons Group */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Save */}
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1d4ed8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2563eb")
              }
            >
              <SaveIcon sx={{ fontSize: 16 }} />
              <span className="whitespace-nowrap">
                {hasData ? "Cập nhật" : "Tạo bảng lương"}
              </span>
            </button>

            {/* Staff */}
            <button
              onClick={() => navigate("/nhan-vien")}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                border: "1px solid rgba(255,255,255,0.13)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              <PeopleAltIcon sx={{ fontSize: 16 }} />
              <span className="whitespace-nowrap">Nhân viên</span>
            </button>

            {/* Export */}
            {salaryData?.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
                style={{
                  background: "#065f46",
                  color: "#6ee7b7",
                  border: "1px solid #065f46",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#047857")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#065f46")
                }
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
                <span className="whitespace-nowrap">Xuất Excel</span>
              </button>
            )}

            {/* Delete all */}
            {hasData && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto col-span-2 sm:col-span-1"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.25)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(239,68,68,0.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(239,68,68,0.1)")
                }
              >
                <DeleteSweepIcon sx={{ fontSize: 16 }} />
                <span className="whitespace-nowrap">Xóa tất cả</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Summary strip */}
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: "Số nhân viên",
              value: salaryData.length,
              accent: "#3b82f6",
            },
            {
              label: "Tổng quỹ lương",
              value: `${Number(tongLuong).toLocaleString("vi-VN")} đ`,
              accent: "#10b981",
            },
            {
              label: "Lương TB/người",
              value: salaryData.length
                ? `${Math.round(tongLuong / salaryData.length).toLocaleString(
                    "vi-VN"
                  )} đ`
                : "—",
              accent: "#f59e0b",
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="flex-1 min-w-[180px] rounded-xl px-5 py-3 flex flex-col gap-0.5 shadow-sm"
              style={{ background: "#fff", borderLeft: `4px solid ${accent}` }}
            >
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {label}
              </span>
              <span
                className="text-xl font-extrabold"
                style={{ color: accent }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* ── TABLE ── */}
        <div
          className="rounded-xl shadow overflow-hidden"
          style={{ background: "#fff" }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ borderCollapse: "collapse", minWidth: 1100 }}
            >
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left whitespace-nowrap text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: "#94a3b8",
                        borderBottom: "2px solid #1e293b",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaryData.map((item, idx) => (
                  <BangLuongRow
                    key={item._id}
                    item={item}
                    onChange={handleChange}
                    isEven={idx % 2 === 0}
                  />
                ))}

                {/* Total row */}
                <tr
                  style={{
                    background: "#f0fdf4",
                    borderTop: "2px solid #d1fae5",
                  }}
                >
                  <td
                    colSpan={11}
                    className="px-4 py-3 text-right text-sm font-bold text-gray-600"
                  >
                    Tổng quỹ lương
                  </td>
                  <td
                    className="px-4 py-3 text-right text-base font-extrabold"
                    style={{ color: "#059669" }}
                  >
                    {Number(tongLuong).toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CHART ── */}
        <div className="rounded-xl shadow p-5" style={{ background: "#fff" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-700">
                Biểu đồ lương nhân viên
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Lương thực nhận — Tháng {thang}/{nam}
              </p>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                background: "linear-gradient(90deg,#0f172a,#1e3a5f)",
                color: "#93c5fd",
              }}
            >
              Tổng: {Number(tongLuong).toLocaleString("vi-VN")} đ
            </span>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barCategoryGap={25}>
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                angle={-8}
                textAnchor="end"
                height={64}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}tr`}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  fontSize: 13,
                }}
                formatter={(v) => [
                  `${Number(v).toLocaleString("vi-VN")} đ`,
                  "Thực nhận",
                ]}
              />
              <Bar
                dataKey="luong"
                radius={[8, 8, 0, 0]}
                barSize={26}
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default BangLuongPage;
