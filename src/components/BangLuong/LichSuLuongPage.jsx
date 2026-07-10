import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { fetchLichSuLuong } from "../../redux/slices/bangLuongSlice";
import { exportLichSuLuongToExcel } from "./exportLichSuLuongToExcel";

/* ── Helpers quy đổi tháng/năm <-> số nguyên để cộng trừ dễ dàng ── */
const toKey = (thang, nam) => nam * 12 + thang;
const fromKey = (key) => {
  const nam = Math.floor((key - 1) / 12);
  const thang = key - nam * 12;
  return { thang, nam };
};

// Mặc định: 12 tháng tính đến hết tháng trước (tháng hiện tại không tính vào,
// vì tháng hiện tại thường chưa chốt bảng lương). VD đang ở tháng 7 -> hiển thị
// 12 tháng từ tháng 7 năm trước đến tháng 6 năm nay.
const getDefaultRange = () => {
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const endMonth = curMonth === 1 ? 12 : curMonth - 1;
  const endYear = curMonth === 1 ? curYear - 1 : curYear;

  const endKey = toKey(endMonth, endYear);
  const start = fromKey(endKey - 11);

  return {
    tuThang: start.thang,
    tuNam: start.nam,
    denThang: endMonth,
    denNam: endYear,
  };
};

const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
const yearOptions = (() => {
  const y = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => y - 6 + i);
})();

const periodKey = (thang, nam) => `${thang}-${nam}`;
const periodLabel = (thang, nam) => `Tháng ${thang}/${nam}`;

const selectSx = {
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
  "& .MuiSvgIcon-root": { color: "#bae6fd" },
};

const LichSuLuongPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lichSuData, lichSuPeriods, lichSuLoading, lichSuError } = useSelector(
    (state) => state.bangLuong
  );

  const defaultRange = useMemo(() => getDefaultRange(), []);
  const [tuThang, setTuThang] = useState(defaultRange.tuThang);
  const [tuNam, setTuNam] = useState(defaultRange.tuNam);
  const [denThang, setDenThang] = useState(defaultRange.denThang);
  const [denNam, setDenNam] = useState(defaultRange.denNam);
  const [searchTen, setSearchTen] = useState("");

  const rangeInvalid = toKey(tuThang, tuNam) > toKey(denThang, denNam);

  const loadData = () => {
    if (rangeInvalid) return;
    dispatch(fetchLichSuLuong({ tuThang, tuNam, denThang, denNam }));
  };

  // Tự tải khi mở trang (dùng khoảng mặc định)
  useEffect(() => {
    dispatch(
      fetchLichSuLuong({
        tuThang: defaultRange.tuThang,
        tuNam: defaultRange.tuNam,
        denThang: defaultRange.denThang,
        denNam: defaultRange.denNam,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Chỉ giữ lại những THÁNG đã thực sự có bảng lương (bất kỳ nhân viên nào) ── */
  const columns = useMemo(() => {
    const set = new Map();
    (lichSuData || []).forEach((item) => {
      const key = periodKey(item.thang, item.nam);
      if (!set.has(key)) {
        set.set(key, {
          key,
          thang: item.thang,
          nam: item.nam,
          label: periodLabel(item.thang, item.nam),
        });
      }
    });
    return Array.from(set.values()).sort(
      (a, b) => toKey(a.thang, a.nam) - toKey(b.thang, b.nam)
    );
  }, [lichSuData]);

  /* ── Pivot: hàng = nhân viên, cột = tháng, giá trị = lương căn bản ── */
  const rows = useMemo(() => {
    const map = new Map();
    (lichSuData || []).forEach((item) => {
      const nv = item.nhanVien;
      if (!nv?._id) return;
      const key = periodKey(item.thang, item.nam);
      if (!map.has(nv._id)) {
        map.set(nv._id, {
          _id: nv._id,
          hoVaTen: nv.hoVaTen,
          values: {},
        });
      }
      map.get(nv._id).values[key] = item.luongCanBan;
    });

    const list = Array.from(map.values()).sort((a, b) =>
      (a.hoVaTen || "").localeCompare(b.hoVaTen || "", "vi")
    );

    return list.map((r, idx) => ({ ...r, stt: idx + 1 }));
  }, [lichSuData]);

  const displayRows = useMemo(() => {
    if (!searchTen.trim()) return rows;
    const q = searchTen.toLowerCase().trim();
    return rows.filter((r) => (r.hoVaTen || "").toLowerCase().includes(q));
  }, [rows, searchTen]);

  const rangeLabel = `${periodLabel(tuThang, tuNam)} - ${periodLabel(
    denThang,
    denNam
  )}`;

  const handleExport = async () => {
    if (!rows.length || !columns.length) return;
    try {
      await exportLichSuLuongToExcel(displayRows, columns, rangeLabel);
    } catch (err) {
      console.error("Xuất Excel thất bại", err);
    }
  };

  const fmt = (n) =>
    n === undefined || n === null
      ? "—"
      : (Math.round(n / 1000) * 1000).toLocaleString("vi-VN");

  return (
    <div
      className="fixed h-full w-full inset-0 z-[1299] flex flex-col overflow-hidden"
      style={{ background: "#f1f5f9" }}
    >
      {/* ── TOP BAR ── */}
      <div
        className="shrink-0 flex flex-col md:flex-row md:items-center justify-between px-4 py-4 md:px-5 md:py-3 shadow-md gap-4 md:gap-2"
        style={{
          background: "linear-gradient(90deg, #0284c7 0%, #0ea5e9 100%)",
          minHeight: 60,
        }}
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          <IconButton
            size="small"
            onClick={() => navigate(-1)}
            sx={{
              color: "#bae6fd",
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
              className="text-white font-bold text-sm sm:text-base tracking-wide flex items-center gap-2"
              style={{ letterSpacing: 2 }}
            >
              <HistoryIcon sx={{ fontSize: 18 }} />
              LỊCH SỬ LƯƠNG CĂN BẢN
            </div>
            <div className="text-sky-200 text-xs">{rangeLabel}</div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={searchTen}
            onChange={(e) => setSearchTen(e.target.value)}
            className="text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 focus:outline-none focus:border-sky-400 flex-1"
            style={{ minWidth: 160, maxWidth: 260 }}
          />
          {/* Từ tháng/năm */}
          <div className="flex items-center gap-1.5">
            <span className="text-sky-100 text-xs font-medium">Từ</span>
            <FormControl size="small" sx={{ minWidth: 88 }}>
              <Select
                value={tuThang}
                onChange={(e) => setTuThang(e.target.value)}
                sx={selectSx}
              >
                {monthOptions.map((m) => (
                  <MenuItem key={m} value={m}>
                    Tháng {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 84 }}>
              <Select
                value={tuNam}
                onChange={(e) => setTuNam(e.target.value)}
                sx={selectSx}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Đến tháng/năm */}
          <div className="flex items-center gap-1.5">
            <span className="text-sky-100 text-xs font-medium">Đến</span>
            <FormControl size="small" sx={{ minWidth: 88 }}>
              <Select
                value={denThang}
                onChange={(e) => setDenThang(e.target.value)}
                sx={selectSx}
              >
                {monthOptions.map((m) => (
                  <MenuItem key={m} value={m}>
                    Tháng {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 84 }}>
              <Select
                value={denNam}
                onChange={(e) => setDenNam(e.target.value)}
                sx={selectSx}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div
            className="hidden lg:block"
            style={{
              width: 1,
              height: 28,
              background: "rgba(255,255,255,0.12)",
              margin: "0 4px",
            }}
          />
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadData}
              disabled={rangeInvalid || lichSuLoading}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto"
              style={{
                background: rangeInvalid ? "rgba(255,255,255,0.08)" : "#0284c7",
                color: rangeInvalid ? "#94a3b8" : "#fff",
                border: rangeInvalid
                  ? "1px solid rgba(255,255,255,0.13)"
                  : "none",
                cursor:
                  rangeInvalid || lichSuLoading ? "not-allowed" : "pointer",
                opacity: lichSuLoading ? 0.75 : 1,
              }}
            >
              <RefreshIcon
                sx={{
                  fontSize: 16,
                  animation: lichSuLoading
                    ? "spin 0.8s linear infinite"
                    : "none",
                }}
              />
              <span className="whitespace-nowrap">Xem lịch sử</span>
            </button>

            {rows.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all w-full sm:w-auto"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#e0f2fe",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.18)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                }
              >
                <DownloadIcon sx={{ fontSize: 16 }} />
                <span className="whitespace-nowrap">Xuất Excel</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── CONTENT ── */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col gap-2">
        {rangeInvalid && (
          <div
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            Khoảng thời gian không hợp lệ: "Từ tháng" phải trước hoặc bằng "Đến
            tháng".
          </div>
        )}

        {lichSuError && (
          <div
            className="rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
            }}
          >
            {lichSuError}
          </div>
        )}

        {/* Table */}
        <div
          className="flex-1 min-h-0 rounded-xl shadow overflow-hidden flex flex-col"
          style={{ background: "#fff" }}
        >
          {lichSuLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              Đang tải dữ liệu…
            </div>
          ) : columns.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              Không có bảng lương nào trong khoảng thời gian đã chọn.
            </div>
          ) : (
            <>
              {/* Desktop / tablet: bảng pivot đầy đủ */}
              <div className="flex-1 min-h-0 overflow-auto hidden md:block">
                <table
                  className="text-sm"
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    minWidth: "100%",
                    tableLayout: "auto",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#0284c7",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <th
                        className="px-4 py-3 text-left whitespace-nowrap text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: "#e0f2fe",
                          borderBottom: "2px solid #0369a1",
                          background: "#0284c7",
                          position: "sticky",
                          left: 0,
                          zIndex: 12,
                          minWidth: 60,
                        }}
                      >
                        STT
                      </th>
                      <th
                        className="px-4 py-3 text-left whitespace-nowrap text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: "#e0f2fe",
                          borderBottom: "2px solid #0369a1",
                          background: "#0284c7",
                          position: "sticky",
                          left: 60,
                          zIndex: 12,
                          minWidth: 200,
                        }}
                      >
                        Tên nhân viên
                      </th>
                      {columns.map((c) => (
                        <th
                          key={c.key}
                          className="px-4 py-3 text-right whitespace-nowrap text-xs font-bold uppercase tracking-wider"
                          style={{
                            color: "#e0f2fe",
                            borderBottom: "2px solid #0369a1",
                            background: "#0284c7",
                            minWidth: 130,
                          }}
                        >
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((r, idx) => {
                      const rowBg = idx % 2 === 0 ? "#fff" : "#f8fafc";
                      return (
                        <tr key={r._id} style={{ background: rowBg }}>
                          <td
                            className="px-4 py-2 text-sm text-slate-500"
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              position: "sticky",
                              left: 0,
                              background: rowBg,
                            }}
                          >
                            {r.stt}
                          </td>
                          <td
                            className="px-4 py-2 text-sm font-semibold text-slate-700 whitespace-nowrap"
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              position: "sticky",
                              left: 60,
                              background: rowBg,
                            }}
                          >
                            {r.hoVaTen}
                          </td>
                          {columns.map((c) => {
                            const val = r.values[c.key];
                            return (
                              <td
                                key={c.key}
                                className="px-4 py-2 text-right text-sm whitespace-nowrap"
                                style={{
                                  borderBottom: "1px solid #f1f5f9",
                                  color:
                                    val === undefined ? "#cbd5e1" : "#334155",
                                }}
                              >
                                {val === undefined ? "—" : `${fmt(val)} đ`}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: dạng card gọn cho từng nhân viên */}
              <div className="md:hidden flex-1 min-h-0 overflow-auto divide-y divide-slate-100">
                {displayRows.map((r) => (
                  <div key={r._id} className="p-3">
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {r.stt}. {r.hoVaTen}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {columns.map((c) => {
                        const val = r.values[c.key];
                        return (
                          <div
                            key={c.key}
                            className="flex items-center justify-between rounded-md px-2 py-1 text-xs"
                            style={{ background: "#f8fafc" }}
                          >
                            <span className="text-slate-400">{c.label}</span>
                            <span
                              className={
                                val === undefined ? "italic" : "font-semibold"
                              }
                              style={{
                                color:
                                  val === undefined ? "#cbd5e1" : "#334155",
                              }}
                            >
                              {val === undefined ? "—" : `${fmt(val)} đ`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LichSuLuongPage;
