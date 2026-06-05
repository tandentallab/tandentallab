import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Modal,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { SearchIcon } from "lucide-react";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CloseIcon from "@mui/icons-material/Close";
import StoreIcon from "@mui/icons-material/Store";
import { toast } from "sonner";
import DownloadIcon from "@mui/icons-material/Download";
import SvgIcon from "@mui/material/SvgIcon";
import dayjs from "dayjs";

import { fetchAllHoaDonAdmin } from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import ThongKeCongNo from "./ThongKeCongNo";
import HoaDonFilterDrawer from "./HoaDonFilterDrawer";
import HoaDonTable from "./HoaDonTable";
import { exportHoaDonListToExcel } from "../../utils/exportToExcel";
import { api } from "../../config/api";
import CustomDateRangePicker from "../common/CustomDateRangePicker";

function ExcelIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="18" rx="2" ry="2" fill="#1b7a34" />
      <path d="M6 7h12v2H6z" fill="#fff" />
      <path
        d="M7.2 15.5l1.6-2.3 1.6 2.3 1.6-2.3 1.6 2.3"
        stroke="#fff"
        strokeWidth="0.9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

const DATE_PRESETS = [
  { key: "custom", label: "Chọn trên Lịch", isCalendar: true },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "this_week", label: "Tuần này" },
  { key: "this_month", label: "Tháng này" },
  { key: "this_year", label: "Năm nay" },
  { key: "last_7", label: "Trong vòng 7 ngày" },
  { key: "last_10", label: "Trong vòng 10 ngày" },
  { key: "last_30", label: "Trong vòng 30 ngày" },
];

const EMPTY_DATE = { preset: null, customFrom: "", customTo: "" };

const _getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );
  switch (preset) {
    case "today":
      return { from: today, to: tomorrow };
    case "yesterday": {
      const f = new Date(today);
      f.setDate(f.getDate() - 1);
      return { from: f, to: today };
    }
    case "this_week": {
      const d = today.getDay();
      const f = new Date(today);
      f.setDate(today.getDate() - (d === 0 ? 6 : d - 1));
      return { from: f, to: tomorrow };
    }
    case "this_month":
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: tomorrow,
      };
    case "this_year":
      return { from: new Date(today.getFullYear(), 0, 1), to: tomorrow };
    case "last_7": {
      const f = new Date(today);
      f.setDate(f.getDate() - 7);
      return { from: f, to: tomorrow };
    }
    case "last_10": {
      const f = new Date(today);
      f.setDate(f.getDate() - 10);
      return { from: f, to: tomorrow };
    }
    case "last_30": {
      const f = new Date(today);
      f.setDate(f.getDate() - 30);
      return { from: f, to: tomorrow };
    }
    default:
      return { from: null, to: null };
  }
};

const computeDateRange = (filter) => {
  if (!filter?.preset) return { fromDate: "", toDate: "" };
  if (filter.preset === "custom") {
    return {
      fromDate: filter.customFrom
        ? new Date(filter.customFrom).toISOString()
        : "",
      toDate: filter.customTo
        ? new Date(filter.customTo + "T23:59:59").toISOString()
        : "",
    };
  }
  const { from, to } = _getDateRange(filter.preset);
  return {
    fromDate: from ? from.toISOString() : "",
    toDate: to ? to.toISOString() : "",
  };
};

const HoaDonPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    danhSachHoaDon = [],
    pagination = {},
    loading = false,
  } = useSelector((state) => state.hoaDon);
  const nhaKhoa = useSelector((state) => state.nhaKhoa);

  const [page, setPage] = useState(() => Number(sessionStorage.getItem("hd_page")) || 0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [activeTabThongKe, setActiveTabThongKe] = useState(() => sessionStorage.getItem("hd_activeTabThongKe") || "");

  const [appliedNgayXuat, setAppliedNgayXuat] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedNgayXuat_v2");
    return saved ? JSON.parse(saved) : EMPTY_DATE;
  });
  const [appliedNhaKhoa, setAppliedNhaKhoa] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedNhaKhoa");
    return saved ? JSON.parse(saved) : null;
  });
  const [appliedTrangThai, setAppliedTrangThai] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedTrangThai_v2");
    return saved ? JSON.parse(saved) : ["Lưu tạm", "Chưa thanh toán", "Thanh toán một phần"];
  });
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem("hd_searchTerm") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [openFilter, setOpenFilter] = useState(false);
  const filterContainerRef = useRef(null);

  // STATES CHO MODAL XUẤT EXCEL
  const [openExport, setOpenExport] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState(EMPTY_DATE);
  const [exportTrangThai, setExportTrangThai] = useState([]);
  const [exporting, setExporting] = useState(false);

  // STATES CHO DROPDOWN NHA KHOA MỚI (MODAL XUẤT)
  const [exportNhaKhoaObj, setExportNhaKhoaObj] = useState(null);
  const [openExportNhaKhoaDropdown, setOpenExportNhaKhoaDropdown] = useState(false);
  const [exportNhaKhoaSearch, setExportNhaKhoaSearch] = useState("");
  const exportNhaKhoaRef = useRef(null);

  // STATES CHO DROPDOWN NGÀY (MODAL XUẤT)
  const [openExportDateDropdown, setOpenExportDateDropdown] = useState(false);
  const [exportDateAnchorEl, setExportDateAnchorEl] = useState(null);
  const exportDateRef = useRef(null);

  useEffect(() => { sessionStorage.setItem("hd_activeTabThongKe", activeTabThongKe); }, [activeTabThongKe]);
  useEffect(() => { sessionStorage.setItem("hd_page", page.toString()); }, [page]);
  useEffect(() => { sessionStorage.setItem("hd_appliedNgayXuat_v2", JSON.stringify(appliedNgayXuat)); }, [appliedNgayXuat]);
  useEffect(() => { sessionStorage.setItem("hd_appliedNhaKhoa", JSON.stringify(appliedNhaKhoa)); }, [appliedNhaKhoa]);
  useEffect(() => { sessionStorage.setItem("hd_appliedTrangThai_v2", JSON.stringify(appliedTrangThai)); }, [appliedTrangThai]);
  useEffect(() => { sessionStorage.setItem("hd_searchTerm", searchTerm); }, [searchTerm]);

  // Khi rời trang: nếu KHÔNG phải sang HoaDonDetail thì reset trangThai về default
  useEffect(() => {
    return () => {
      const nextPath = window.location.pathname;
      const isGoingToDetail = nextPath.startsWith("/hoa-don/") && nextPath.includes("/edit");
      if (!isGoingToDetail) {
        sessionStorage.removeItem("hd_appliedTrangThai_v2");
      }
    };
  }, []);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const { fromDate, toDate } = computeDateRange(appliedNgayXuat);
    dispatch(
      fetchAllHoaDonAdmin({
        page: page + 1,
        limit: rowsPerPage,
        nhaKhoaId: appliedNhaKhoa?._id || "",
        trangThai: appliedTrangThai.join(","),
        fromDate,
        toDate,
        search: debouncedSearch,
        loaiHan: activeTabThongKe,
      })
    );
  }, [
    dispatch,
    page,
    rowsPerPage,
    appliedNhaKhoa,
    appliedTrangThai,
    appliedNgayXuat,
    debouncedSearch,
    activeTabThongKe
  ]);

  // Lắng nghe click ra ngoài Form Filter
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target)
      ) {
        if (
          event.target.closest?.(
            ".MuiPopover-root, .MuiMenu-root, .MuiModal-root"
          )
        )
          return;
        setOpenFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lắng nghe click ra ngoài Dropdown Nha Khoa & Ngày (Modal Xuất)
  useEffect(() => {
    const handleClickOutsideDropdown = (event) => {
      if (exportNhaKhoaRef.current && !exportNhaKhoaRef.current.contains(event.target)) {
        setOpenExportNhaKhoaDropdown(false);
      }
      if (exportDateRef.current && !exportDateRef.current.contains(event.target)) {
        setOpenExportDateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideDropdown);
    return () => document.removeEventListener("mousedown", handleClickOutsideDropdown);
  }, []);

  const handleLoadMore = () => {
    if (!loading && danhSachHoaDon.length < (pagination?.total || 0)) {
      setRowsPerPage((prev) => prev + 50);
    }
  };

  const handleExport = async () => {
    const { fromDate: fromISO, toDate: toISO } = computeDateRange(exportDateFilter);

    if (!fromISO || !toISO) {
      toast.error("Vui lòng chọn khoảng thời gian xuất Excel.");
      return;
    }

    try {
      setExporting(true);

      const res = await api.get("/hoa-don/all", {
        params: {
          page: 1,
          limit: 5000,
          fromDate: fromISO,
          toDate: toISO,
          nhaKhoaId: exportNhaKhoaObj?._id || "",
        },
      });

      let data = res.data?.data || [];
      if (exportTrangThai.length > 0) {
        data = data.filter((hd) => exportTrangThai.includes(hd.trangThai));
      }

      await exportHoaDonListToExcel(data, {
        fromDate: fromISO,
        toDate: toISO,
        nhaKhoaName: exportNhaKhoaObj?.name || "Tất cả",
      });
      setOpenExport(false);
    } catch (err) {
      toast.error(`Xuất Excel thất bại: ${err?.response?.data?.message || err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const isFiltered = !!appliedNgayXuat.preset || !!appliedNhaKhoa || appliedTrangThai.length > 0;

  const filteredExportNhaKhoaOpts = (nhaKhoa?.data || [])
    .map((nk) => ({ _id: nk._id, name: nk.tenGiaoDich || nk.hoVaTen || "" }))
    .filter((nk) => !exportNhaKhoaSearch.trim() || nk.name.toLowerCase().includes(exportNhaKhoaSearch.toLowerCase()));

  return (
    <div className="bg-gray-50 flex-1 h-full flex flex-col overflow-hidden">
      <style>
        {`
                .custom-scrollbar .MuiTableContainer-root {
                    -webkit-overflow-scrolling: touch;
                    scroll-behavior: smooth;
                }
                .custom-scrollbar *::-webkit-scrollbar {
                    height: 14px; 
                    width: 14px;
                }
                .custom-scrollbar *::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .custom-scrollbar *::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1; 
                    border-radius: 10px;
                    border: 3px solid #ffffff; 
                }
                .custom-scrollbar *::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8; 
                }

                .table-wrapper .MuiTableContainer-root {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto !important; 
                }
                .table-wrapper .MuiTableHead-root .MuiTableCell-root {
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background-color: #e6f7ff;
                }
                `}
      </style>

      <div className="shrink-0">
        <ThongKeCongNo
          activeTab={activeTabThongKe}
          onCardClick={(type) => {
            if (activeTabThongKe === type) {
              setActiveTabThongKe("");
            } else {
              setActiveTabThongKe(type);
            }
            setPage(0);
          }}
        />
      </div>

      <div className="shrink-0 rounded-t-lg bg-white shadow-sm relative z-30 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 px-4 py-2 min-h-[56px]">
          <div className="flex flex-wrap items-center gap-3 flex-1 w-full xl:w-auto">
            <div className="relative" ref={filterContainerRef}>
              <Tooltip title="Bộ lọc">
                <IconButton
                  onClick={() => setOpenFilter(!openFilter)}
                  size="small"
                  className={`transition-colors ${openFilter ? "bg-blue-50" : ""}`}
                  sx={{ color: isFiltered ? "#1976d2" : "#555", p: "8px", position: "relative" }}
                >
                  <FilterListIcon fontSize="small" />
                  {isFiltered && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-white" style={{ pointerEvents: "none" }} />
                  )}
                </IconButton>
              </Tooltip>

              <HoaDonFilterDrawer
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                appliedNgayXuat={appliedNgayXuat}
                appliedNhaKhoa={appliedNhaKhoa}
                appliedTrangThai={appliedTrangThai}
                nhaKhoaList={Array.isArray(nhaKhoa?.data) ? nhaKhoa.data : []}
                onApply={(ngayXuat, nhaKhoa, trangThai) => {
                  setAppliedNgayXuat(ngayXuat);
                  setAppliedNhaKhoa(nhaKhoa);
                  setAppliedTrangThai(trangThai);
                  setPage(0);
                }}
                onReset={() => {
                  setAppliedNgayXuat(EMPTY_DATE);
                  setAppliedNhaKhoa(null);
                  setAppliedTrangThai([]);
                  setActiveTabThongKe("");
                  setPage(0);
                }}
              />
            </div>

            {isFiltered && (
              <div className="flex flex-wrap items-center gap-3 border-l-2 border-gray-100 pl-3">
                {appliedNgayXuat.preset && (
                  <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-800">
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      {appliedNgayXuat.preset === "custom"
                        ? `${appliedNgayXuat.customFrom || "?"} → ${appliedNgayXuat.customTo || "?"}`
                        : DATE_PRESETS.find((p) => p.key === appliedNgayXuat.preset)?.label || appliedNgayXuat.preset}
                    </div>
                    <button onClick={() => { setAppliedNgayXuat(EMPTY_DATE); setPage(0); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-200 text-blue-500 hover:text-red-600 transition-colors" title="Xóa bộ lọc ngày">
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}

                {appliedNhaKhoa && (
                  <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-800">
                      <StoreIcon sx={{ fontSize: 16 }} />
                      {appliedNhaKhoa.name}
                    </div>
                    <button onClick={() => { setAppliedNhaKhoa(null); setPage(0); }} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-indigo-200 text-indigo-500 hover:text-red-600 transition-colors" title="Xóa bộ lọc nha khoa">
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}

                {appliedTrangThai.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full pl-3 pr-1 py-1 shadow-sm">
                    <span className="text-[13px] text-gray-700">
                      <span className="font-semibold">Trạng thái:</span> {appliedTrangThai.join(", ")}
                    </span>
                    <button onClick={() => { setAppliedTrangThai([]); setActiveTabThongKe(""); setPage(0); }} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-500 hover:text-gray-700 transition-colors ml-1" title="Xóa bộ lọc trạng thái">
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            <TextField size="small" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={{ width: 220, "& .MuiOutlinedInput-root": { borderRadius: "20px", bgcolor: "#f5f5f5", fontSize: "0.85rem", "& fieldset": { border: "none" } } }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon size={15} style={{ color: "#9e9e9e" }} /></InputAdornment>), endAdornment: searchTerm && (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm("")}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment>) }} />
            <Tooltip title="Tạo hóa đơn"><IconButton onClick={() => navigate("/cho-xuat-hoa-don")} className="bg-[#4CAF50] text-white w-8 h-8 hover:bg-[#388E3C] flex items-center justify-center rounded-full"><AddIcon sx={{ fontSize: 20 }} /></IconButton></Tooltip>
            <Tooltip title="Xuất Excel"><IconButton onClick={() => setOpenExport(true)} size="small"><ExcelIcon sx={{ fontSize: 22, color: "#1b7a34" }} /></IconButton></Tooltip>
            <Tooltip title="Làm mới"><IconButton onClick={() => dispatch(fetchAllHoaDonAdmin())} size="small" sx={{ color: "#555" }}><RefreshIcon fontSize="small" /></IconButton></Tooltip>
            <IconButton size="small" sx={{ color: "#555" }}><MoreVertIcon fontSize="small" /></IconButton>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-b-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden custom-scrollbar table-wrapper">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <HoaDonTable danhSachHoaDon={danhSachHoaDon} loading={loading} onLoadMore={handleLoadMore} />
        </div>
        <div className="border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm shrink-0 z-10 relative px-5 py-2.5 flex items-center justify-end text-[13px] text-gray-600">
          <div>
            {danhSachHoaDon.length < (pagination?.total || 0) ? (
              <span>Số dòng: <span className="font-bold text-gray-900">{danhSachHoaDon.length}</span> / {pagination?.total}<span className=" text-gray-500 ml-1.5">(cuộn để tải thêm)</span></span>
            ) : (
              <span>Số dòng: <span className="font-bold text-gray-900">{danhSachHoaDon.length}</span></span>
            )}
          </div>
        </div>
      </div>

      {/* MODAL XUẤT EXCEL */}
      <Modal open={openExport} onClose={() => setOpenExport(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] max-w-[500px] bg-white shadow-xl p-6 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
            <ExcelIcon sx={{ fontSize: 24, color: "#1b7a34" }} />
            Xuất Excel Hóa Đơn
          </h3>
          <hr className="mb-4 border-gray-100" />

          <div className="flex flex-col gap-5">

            {/* CUSTOM DROPDOWN CHỌN NGÀY XUẤT EXCEL */}
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">Chọn ngày xuất</p>
              <div className="relative" ref={exportDateRef}>
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition text-sm text-left shadow-sm"
                  onClick={() => setOpenExportDateDropdown(!openExportDateDropdown)}
                >
                  <span className={exportDateFilter?.preset ? "text-blue-700 font-medium truncate" : "text-gray-500"}>
                    {exportDateFilter?.preset === "custom" && exportDateFilter.customFrom
                      ? `${dayjs(exportDateFilter.customFrom).format('DD/MM/YYYY')} - ${dayjs(exportDateFilter.customTo).format('DD/MM/YYYY')}`
                      : DATE_PRESETS.find(p => p.key === exportDateFilter?.preset)?.label || "-- Chọn thời gian --"}
                  </span>
                  <CalendarTodayIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                </button>

                {openExportDateDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-[1300] w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    {DATE_PRESETS.map((p) => (
                      <div key={p.key}>
                        <button
                          type="button"
                          onClick={() => {
                            setExportDateFilter(prev => ({ ...prev, preset: p.key }));
                            if (!p.isCalendar) {
                              setOpenExportDateDropdown(false);
                            } else {
                              // 🔥 SỬA Ở ĐÂY: Dùng exportDateRef.current thay vì e.currentTarget
                              // Mỏ neo giờ đây là cái khung to bên ngoài, cực kỳ ổn định
                              setExportDateAnchorEl(exportDateRef.current);
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 border-b border-gray-100 transition ${exportDateFilter?.preset === p.key ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {p.isCalendar && <CalendarTodayIcon sx={{ fontSize: 14 }} />}
                          {p.label}
                        </button>

                        {/* 🔥 BỔ SUNG LẠI KHỐI SUB-BUTTON (Giống hệt bên FilterDrawer) */}
                        {p.isCalendar && exportDateFilter?.preset === "custom" && (
                          <div className="px-4 py-3 bg-blue-50/30 border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setExportDateAnchorEl(exportDateRef.current)}
                              className="w-full h-9 px-2 flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            >
                              {exportDateFilter.customFrom && exportDateFilter.customTo
                                ? `${dayjs(exportDateFilter.customFrom).format('DD/MM/YYYY')} - ${dayjs(exportDateFilter.customTo).format('DD/MM/YYYY')}`
                                : "📅 Bấm để chọn ngày..."}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* POP-UP LỊCH CHO EXCEL */}
                <CustomDateRangePicker
                  open={Boolean(exportDateAnchorEl)}
                  anchorEl={exportDateAnchorEl}
                  onClose={() => setExportDateAnchorEl(null)}
                  initialDates={{
                    start: exportDateFilter?.customFrom || "",
                    end: exportDateFilter?.customTo || "",
                  }}
                  onApply={(dates) => {
                    setExportDateFilter({
                      preset: "custom",
                      customFrom: dates.start,
                      customTo: dates.end,
                    });
                    setExportDateAnchorEl(null);
                    setOpenExportDateDropdown(false);
                  }}
                />
              </div>
            </div>

            {/* CUSTOM DROPDOWN NHA KHOA */}
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">Nha khoa</p>
              <div ref={exportNhaKhoaRef} className="relative">
                {openExportNhaKhoaDropdown ? (
                  <div className="border border-blue-400 rounded bg-white px-3 py-2 shadow-sm">
                    <input
                      type="text"
                      value={exportNhaKhoaSearch}
                      onChange={(e) => setExportNhaKhoaSearch(e.target.value)}
                      placeholder="Tìm nha khoa..."
                      autoFocus
                      className="w-full border-b border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition text-sm text-left shadow-sm"
                    onClick={() => { setExportNhaKhoaSearch(""); setOpenExportNhaKhoaDropdown(true); }}
                  >
                    <span className={exportNhaKhoaObj ? "text-blue-700 font-medium truncate" : "text-gray-500"}>
                      {exportNhaKhoaObj ? exportNhaKhoaObj.name : "-- Tất cả nha khoa --"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}

                {openExportNhaKhoaDropdown && (
                  <div className="absolute left-0 top-full mt-1 z-[1300] w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-56 overflow-y-auto">
                    {exportNhaKhoaObj && (
                      <button
                        type="button"
                        onClick={() => { setExportNhaKhoaObj(null); setOpenExportNhaKhoaDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 border-b border-gray-100 transition"
                      >
                        Bỏ chọn (Tất cả nha khoa)
                      </button>
                    )}
                    {filteredExportNhaKhoaOpts.map((item) => (
                      <button
                        type="button"
                        key={item._id}
                        onClick={() => { setExportNhaKhoaObj(item); setOpenExportNhaKhoaDropdown(false); }}
                        className={`w-full text-left px-4 py-2 text-sm border-b border-gray-50 transition ${exportNhaKhoaObj?._id === item._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {item.name}
                      </button>
                    ))}
                    {filteredExportNhaKhoaOpts.length === 0 && (
                      <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">Trạng thái (chọn nhiều)</p>
              <FormControl fullWidth size="small">
                <Select
                  multiple displayEmpty value={exportTrangThai} onChange={(e) => setExportTrangThai(e.target.value)}
                  renderValue={(selected) => {
                    if (selected.length === 0) return <span className="text-gray-400">-- Tất cả trạng thái --</span>;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {selected.map((value) => <Chip key={value} label={value} size="small" color="primary" variant="outlined" />)}
                      </div>
                    );
                  }}
                >
                  <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
                  <MenuItem value="Thanh toán một phần">Thanh toán một phần</MenuItem>
                  <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setOpenExport(false);
                setExportDateFilter(EMPTY_DATE);
                setExportNhaKhoaObj(null);
                setExportTrangThai([]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button onClick={handleExport} disabled={exporting} className="px-4 py-2 text-sm font-medium text-white bg-[#1b7a34] rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50">
              <DownloadIcon fontSize="small" />
              {exporting ? "Đang xuất..." : "Tải xuống"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HoaDonPage;