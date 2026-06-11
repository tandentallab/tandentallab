import React, { useEffect, useMemo, useState, useCallback } from "react";
import ReactDOM from "react-dom";
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
  Typography,
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
import PrintIcon from "@mui/icons-material/Print";
import InBangLuongModal from "./InBangLuongModal";

const COLUMNS = [
  "Nhân viên",
  "LCB",
  "Ngày công tháng",
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
  "",
];

const BangLuongPage = () => {
  const dispatch = useDispatch();
  const { data: nhanVienData } = useSelector((state) => state.nhanVien);
  const { data: bangLuongData, loading } = useSelector(
    (state) => state.bangLuong
  );

  const _now = new Date();
  const _prevMonth = _now.getMonth() === 0 ? 12 : _now.getMonth(); // getMonth() trả 0-11, tháng trước = getMonth() (chưa +1)
  const _prevYear =
    _now.getMonth() === 0 ? _now.getFullYear() - 1 : _now.getFullYear();
  const [thang, setThang] = useState(_prevMonth);
  const [nam, setNam] = useState(_prevYear);
  const [salaryData, setSalaryData] = useState([]);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [searchTen, setSearchTen] = useState("");
  const [filterChucVu, setFilterChucVu] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  // null | -1 (go back) | string path (navigate to)
  const [pendingNavTarget, setPendingNavTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchNhanVien());
    dispatch(fetchBangLuong({ thang, nam }));
    setIsDirty(false); // reset dirty when period changes
  }, [dispatch, thang, nam]);

  useEffect(() => {
    if (Array.isArray(bangLuongData) && bangLuongData.length > 0) {
      // Dedup: nếu backend trả nhiều bản ghi cùng nhân viên, giữ bản mới nhất
      const seen = new Map();
      for (const item of bangLuongData) {
        const key = item.nhanVien?._id ?? item.nhanVien;
        const existing = seen.get(key);
        if (!existing) {
          seen.set(key, item);
        } else {
          const t1 = existing.updatedAt
            ? new Date(existing.updatedAt).getTime()
            : 0;
          const t2 = item.updatedAt ? new Date(item.updatedAt).getTime() : 1;
          if (t2 > t1) seen.set(key, item);
        }
      }
      const rows = Array.from(seen.values()).map((item) => ({
        _id: item.nhanVien?._id,
        bangLuongId: item._id,
        hoVaTen: item.nhanVien?.hoVaTen,
        luongCanBan: item.luongCanBan,
        ngayCongThang: item.ngayCongThang,
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
      setIsDirty(false); // data came from server, not dirty
    } else if (nhanVienData?.length > 0) {
      const activeNhanVien = nhanVienData.filter(
        (nv) => nv?.trangThai?.trim() === "Đang làm"
      );
      const rows = activeNhanVien.map((nv) => {
        const result = tinhLuong({
          luongCoBan: nv.luongCanBan,
          ngayCongThang: nv.ngayCongThang || 28,
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
      const newItem = { ...item, [field]: Number(value) };
      const result = tinhLuong({
        luongCoBan: newItem.luongCanBan,
        ngayCongThang: newItem.ngayCongThang,
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
    setIsDirty(true);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(`Xóa toàn bộ bảng lương tháng ${thang}/${nam}?`))
      return;
    try {
      await dispatch(deleteBangLuongByMonthYear({ thang, nam })).unwrap();
      setSalaryData([]);
      dispatch(fetchBangLuong({ thang, nam }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRow = async (item) => {
    if (
      !window.confirm(
        `Reset bảng lương của ${item.hoVaTen} về 0 cho tháng ${thang}/${nam}?`
      )
    )
      return;
    try {
      // Reset toàn bộ các trường nhập về 0, lưu lên server (nhân viên vẫn còn trong bảng)
      await dispatch(
        createBangLuong({
          thang,
          nam,
          nhanVien: item._id,
          soNgayCong: 0,
          phuCapCom: 0,
          phuCapDienThoai: 0,
          thuong: 0,
          phat: 0,
          ungTruoc: 0,
          ghiChu: "",
        })
      ).unwrap();
      dispatch(fetchBangLuong({ thang, nam }));
    } catch (err) {
      console.error(err);
    }
  };

  const tongLuong = useMemo(
    () => salaryData.reduce((sum, item) => sum + Number(item.thucNhan || 0), 0),
    [salaryData]
  );

  const colTotals = useMemo(
    () => ({
      luongCanBan: salaryData.reduce(
        (s, i) => s + Number(i.luongCanBan || 0),
        0
      ),
      thanhTienCong: salaryData.reduce((s, i) => {
        const { thanhTienCong } = tinhLuong({
          luongCoBan: i.luongCanBan,
          ngayCongThang: i.ngayCongThang,
          soNgayCong: i.soNgayCong,
          com: i.com,
          dienThoai: i.dienThoai,
          thuong: i.thuong,
          phat: i.phat,
          ungTruoc: i.ungTruoc,
        });
        return s + (thanhTienCong || 0);
      }, 0),
      com: salaryData.reduce((s, i) => s + Number(i.com || 0), 0),
      dienThoai: salaryData.reduce((s, i) => s + Number(i.dienThoai || 0), 0),
      thuong: salaryData.reduce((s, i) => s + Number(i.thuong || 0), 0),
      ungTruoc: salaryData.reduce((s, i) => s + Number(i.ungTruoc || 0), 0),
      thucNhan: tongLuong,
    }),
    [salaryData, tongLuong]
  );

  const chucVuList = useMemo(() => {
    const set = new Set();
    (nhanVienData || []).forEach((nv) => {
      if (nv?.chucVu) set.add(nv.chucVu.trim());
    });
    return Array.from(set).sort();
  }, [nhanVienData]);

  // Map nhanVien._id -> chucVu để tra nhanh
  const chucVuMap = useMemo(() => {
    const map = {};
    (nhanVienData || []).forEach((nv) => {
      if (nv?._id) map[nv._id] = nv.chucVu?.trim() || "";
    });
    return map;
  }, [nhanVienData]);

  const displayData = useMemo(() => {
    return salaryData.filter((item) => {
      const matchTen =
        !searchTen ||
        (item.hoVaTen || "")
          .toLowerCase()
          .includes(searchTen.toLowerCase().trim());
      const matchChucVu =
        filterChucVu === "all" || (chucVuMap[item._id] || "") === filterChucVu;
      return matchTen && matchChucVu;
    });
  }, [salaryData, searchTen, filterChucVu, chucVuMap]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
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
      dispatch(fetchBangLuong({ thang, nam }));
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportBangLuongToExcel(salaryData, thang, nam);
    } catch (err) {
      console.error("Xuất Excel thất bại", err);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const navigate = useNavigate();
  const hasData = bangLuongData?.length > 0;

  // ── Guard navigation when dirty ──
  const safeNavigate = useCallback(
    (target) => {
      if (isDirty) {
        setPendingNavTarget(target);
        setShowUnsavedWarning(true);
      } else {
        if (target === -1) navigate(-1);
        else navigate(target);
      }
    },
    [isDirty, navigate]
  );

  const handleConfirmLeave = () => {
    setShowUnsavedWarning(false);
    setIsDirty(false);
    if (pendingNavTarget === -1) navigate(-1);
    else navigate(pendingNavTarget);
    setPendingNavTarget(null);
  };

  const handleCancelLeave = () => {
    setShowUnsavedWarning(false);
    setPendingNavTarget(null);
  };

  // Warn on browser tab close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // ── Employee detail drawer rendered via portal so it escapes any stacking context ──
  const drawerPortal =
    selectedEmployee &&
    (() => {
      const emp = selectedEmployee;
      const fmt = (n) =>
        (Math.round((n || 0) / 1000) * 1000).toLocaleString("vi-VN") + " đ";
      const { thanhTienCong, luongNgay, tongPhuCap } = tinhLuong({
        luongCoBan: emp.luongCanBan,
        ngayCongThang: emp.ngayCongThang,
        soNgayCong: emp.soNgayCong,
        com: emp.com,
        dienThoai: emp.dienThoai,
        thuong: emp.thuong,
        phat: emp.phat,
        ungTruoc: emp.ungTruoc,
      });
      const rows = [
        {
          label: "Lương căn bản",
          value: fmt(emp.luongCanBan),
          color: "#3b82f6",
        },
        {
          label: "Ngày công / tháng",
          value: `${emp.soNgayCong} / ${emp.ngayCongThang} ngày`,
          color: "#64748b",
        },
        { label: "Lương / ngày", value: fmt(luongNgay), color: "#64748b" },
        {
          label: "Thành tiền công",
          value: fmt(thanhTienCong),
          color: "#1d4ed8",
        },
        { label: "Phụ cấp cơm", value: fmt(emp.com), color: "#0891b2" },
        {
          label: "Phụ cấp điện thoại",
          value: fmt(emp.dienThoai),
          color: "#0891b2",
        },
        { label: "Thưởng", value: fmt(emp.thuong), color: "#16a34a" },
        { label: "Phạt", value: fmt(emp.phat), color: "#dc2626" },
        { label: "Ứng trước", value: fmt(emp.ungTruoc), color: "#b91c1c" },
        {
          label: "Tổng phụ cấp",
          value: fmt(
            tongPhuCap ||
              (emp.com || 0) +
                (emp.dienThoai || 0) +
                (emp.thuong || 0) -
                (emp.phat || 0) -
                (emp.ungTruoc || 0)
          ),
          color: "#7c3aed",
        },
      ];
      return ReactDOM.createPortal(
        <>
          <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(0,0,0,0.35)",
            }}
            onClick={() => setSelectedEmployee(null)}
          />
          {/* Drawer */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100%",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              width: "min(400px, 100vw)",
              background: "#fff",
              animation: "slideInRight 0.25s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                  {emp.hoVaTen}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>
                  Bảng lương tháng {thang}/{nam}
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  fontSize: 20,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                ×
              </button>
            </div>
            {/* Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {rows.map(({ label, value, color }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#f8fafc",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div
              style={{
                flexShrink: 0,
                padding: "16px 20px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#f0fdf4",
                  borderRadius: 12,
                  padding: "12px 16px",
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "#065f46",
                  }}
                >
                  THỰC NHẬN
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#059669",
                  }}
                >
                  {fmt(emp.thucNhan)}
                </span>
              </div>
            </div>
          </div>
        </>,
        document.body
      );
    })();

  // ── Unsaved-changes warning modal rendered via portal ──
  const unsavedWarningPortal =
    showUnsavedWarning &&
    ReactDOM.createPortal(
      <>
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "28px 28px 24px",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              animation: "slideInRight 0.2s ease",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              ⚠️
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "#0f172a",
                marginBottom: 8,
              }}
            >
              Dữ liệu chưa được lưu
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.6,
                marginBottom: 24,
              }}
            >
              Bạn đã nhập dữ liệu bảng lương nhưng chưa nhấn{" "}
              <strong style={{ color: "#2563eb" }}>
                {hasData ? "Cập nhật" : "Tạo bảng lương"}
              </strong>
              . Nếu thoát, dữ liệu sẽ mất.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleCancelLeave}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#334155",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ở lại
              </button>
              <button
                onClick={handleConfirmLeave}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Thoát không lưu
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    );

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
              onClick={() => safeNavigate(-1)}
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
              disabled={isSaving || !isDirty}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto"
              style={{
                background: isSaving
                  ? "#1e40af"
                  : !isDirty
                  ? "#334155"
                  : "#2563eb",
                color: !isDirty ? "#64748b" : "#fff",
                border: "none",
                cursor: isSaving || !isDirty ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.75 : !isDirty ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSaving && isDirty)
                  e.currentTarget.style.background = "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                if (!isSaving && isDirty)
                  e.currentTarget.style.background = "#2563eb";
              }}
            >
              {isSaving ? (
                <>
                  <svg
                    style={{
                      animation: "spin 0.8s linear infinite",
                      flexShrink: 0,
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="whitespace-nowrap">Đang lưu…</span>
                </>
              ) : (
                <>
                  <SaveIcon sx={{ fontSize: 16 }} />
                  <span className="whitespace-nowrap">
                    {hasData ? "Cập nhật" : "Tạo bảng lương"}
                  </span>
                </>
              )}
            </button>

            {/* Staff */}
            <button
              onClick={() => safeNavigate("/nhan-vien")}
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

            {/* Print */}
            {salaryData?.length > 0 && (
              <button
                onClick={() => setOpenPrintModal(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
                style={{
                  background: "#14b8a6",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#0d9488")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#14b8a6")
                }
              >
                <PrintIcon sx={{ fontSize: 16 }} />
                <span className="whitespace-nowrap">In bảng lương</span>
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
              value: `${(Math.round(tongLuong / 1000) * 1000).toLocaleString(
                "vi-VN"
              )}`,
              accent: "#10b981",
            },
            {
              label: "Lương TB/người",
              value: salaryData.length
                ? `${(
                    Math.round(
                      Math.round(tongLuong / salaryData.length) / 1000
                    ) * 1000
                  ).toLocaleString("vi-VN")}`
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

        {/* ── SEARCH & FILTER BAR ── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search theo tên */}
          <div className="relative flex-1 min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên…"
              value={searchTen}
              onChange={(e) => setSearchTen(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
              style={{ color: "#1e293b" }}
            />
            {searchTen && (
              <button
                onClick={() => setSearchTen("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter theo chức vụ */}
          <div className="relative">
            <select
              value={filterChucVu}
              onChange={(e) => setFilterChucVu(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer"
              style={{ color: filterChucVu === "all" ? "#94a3b8" : "#1e293b" }}
            >
              <option value="all">Tất cả chức vụ</option>
              {chucVuList.map((cv) => (
                <option key={cv} value={cv}>
                  {cv}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Result count when filtering */}
          {(searchTen || filterChucVu !== "all") && (
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {displayData.length} / {salaryData.length} nhân viên
            </span>
          )}
        </div>

        {/* ── TABLE ── */}
        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {displayData.map((item, idx) => {
            const fmt = (n) =>
              (Math.round((n || 0) / 1000) * 1000).toLocaleString("vi-VN") +
              " đ";
            const { thanhTienCong, tongPhuCap } = tinhLuong({
              luongCoBan: item.luongCanBan,
              ngayCongThang: item.ngayCongThang,
              soNgayCong: item.soNgayCong,
              com: item.com,
              dienThoai: item.dienThoai,
              thuong: item.thuong,
              phat: item.phat,
              ungTruoc: item.ungTruoc,
            });
            return (
              <div
                key={item._id}
                className="rounded-xl shadow p-4 cursor-pointer"
                style={{ background: "#fff", borderLeft: "4px solid #3b82f6" }}
                onClick={() => setSelectedEmployee(item)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 text-sm">
                    {item.hoVaTen}
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#dcfce7", color: "#166534" }}
                  >
                    {fmt(item.thucNhan)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <span className="font-medium text-slate-600">LCB:</span>{" "}
                    {fmt(item.luongCanBan)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Công:</span>{" "}
                    {item.soNgayCong}/{item.ngayCongThang}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">
                      Thành tiền:
                    </span>{" "}
                    {fmt(thanhTienCong)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Thưởng:</span>{" "}
                    {fmt(item.thuong)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Phạt:</span>{" "}
                    {fmt(item.phat)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">
                      Ứng trước:
                    </span>{" "}
                    {fmt(item.ungTruoc)}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Mobile total card */}
          {salaryData.length > 0 && (
            <div
              className="rounded-xl shadow p-4"
              style={{ background: "#f0fdf4", borderLeft: "4px solid #10b981" }}
            >
              <div className="font-bold text-emerald-700 mb-2 text-sm">
                Tổng ({salaryData.length} NV)
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-slate-600">Tổng LCB:</span>{" "}
                  <span className="font-bold text-blue-700">
                    {(
                      Math.round((colTotals.luongCanBan || 0) / 1000) * 1000
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-600">Thực nhận:</span>{" "}
                  <span className="font-bold text-emerald-700">
                    {(
                      Math.round((colTotals.thucNhan || 0) / 1000) * 1000
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div
          className="hidden md:block rounded-xl shadow overflow-hidden"
          style={{ background: "#fff" }}
        >
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "72vh", overflowY: "auto" }}
          >
            <table
              className="w-full text-sm"
              style={{ borderCollapse: "collapse", minWidth: 1100 }}
            >
              <thead>
                <tr
                  style={{
                    background: "#0f172a",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left whitespace-nowrap text-xs font-bold uppercase tracking-wider"
                      style={{
                        color: "#94a3b8",
                        borderBottom: "2px solid #1e293b",
                        background: "#0f172a",
                        ...(col === "Nhân viên" && {
                          position: "sticky",
                          left: 0,
                          zIndex: 12,
                        }),
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
                {/* Sticky Total Row — right below header */}
                {salaryData.length > 0 &&
                  (() => {
                    const fmt = (n) =>
                      (Math.round((n || 0) / 1000) * 1000).toLocaleString(
                        "vi-VN"
                      ) + " đ";
                    return (
                      <tr
                        style={{
                          background: "#f0fdf4",
                          borderBottom: "2px solid #d1fae5",
                          position: "sticky",
                          top: 41,
                          zIndex: 9,
                        }}
                      >
                        {/* Nhân viên */}
                        <td
                          className="px-4 py-2 text-xs font-bold text-emerald-700 whitespace-nowrap"
                          style={{
                            position: "sticky",
                            left: 0,
                            background: "#f0fdf4",
                            zIndex: 8,
                          }}
                        >
                          Tổng ({salaryData.length} NV)
                        </td>
                        {/* LCB */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#1d4ed8" }}
                        >
                          {fmt(colTotals.luongCanBan)}
                        </td>
                        {/* Ngày công tháng */}
                        <td className="px-4 py-2" />
                        {/* Lương/ngày */}
                        <td className="px-4 py-2" />
                        {/* Công */}
                        <td className="px-4 py-2" />
                        {/* Thành tiền */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#1d4ed8" }}
                        >
                          {fmt(colTotals.thanhTienCong)}
                        </td>
                        {/* Cơm */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#1d4ed8" }}
                        >
                          {fmt(colTotals.com)}
                        </td>
                        {/* Điện thoại */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#1d4ed8" }}
                        >
                          {fmt(colTotals.dienThoai)}
                        </td>
                        {/* Thưởng */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#1d4ed8" }}
                        >
                          {fmt(colTotals.thuong)}
                        </td>
                        {/* Phạt */}
                        <td className="px-4 py-2" />
                        {/* Ứng trước */}
                        <td
                          className="px-4 py-2 text-right text-xs font-bold whitespace-nowrap"
                          style={{ color: "#b91c1c" }}
                        >
                          {fmt(colTotals.ungTruoc)}
                        </td>
                        {/* Tổng phụ cấp */}
                        <td className="px-4 py-2" />
                        {/* Thực nhận */}
                        <td
                          className="px-4 py-2 text-right text-sm font-extrabold whitespace-nowrap"
                          style={{ color: "#059669" }}
                        >
                          {fmt(colTotals.thucNhan)}
                        </td>
                      </tr>
                    );
                  })()}
              </thead>
              <tbody>
                {displayData.map((item, idx) => (
                  <BangLuongRow
                    key={item._id}
                    item={item}
                    onChange={handleChange}
                    isEven={idx % 2 === 0}
                    onRowClick={() => setSelectedEmployee(item)}
                    onDelete={handleDeleteRow}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── EMPLOYEE DETAIL DRAWER (portal) ── */}
        {drawerPortal}
      </div>

      {/* UNSAVED CHANGES WARNING (portal) */}
      {unsavedWarningPortal}

      {/* MODAL IN BẢNG LƯƠNG */}
      <InBangLuongModal
        open={openPrintModal}
        onClose={() => setOpenPrintModal(false)}
        salaryData={salaryData}
        thang={thang}
        nam={nam}
      />
    </div>
  );
};

export default BangLuongPage;
