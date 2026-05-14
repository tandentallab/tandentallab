import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDonHang } from "../../redux/slices/donHangSlice";
import { api } from "../../config/api";
import DonHangTable from "./DonHangTable";
import DonHangDetailPanel from "./DonHangDetailPanel";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import { fetchBenhNhan } from "../../redux/slices/benhNhanSlice";
import {
  Modal,
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StoreIcon from "@mui/icons-material/Store";
import PersonIcon from "@mui/icons-material/Person";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DownloadIcon from "@mui/icons-material/Download";
import { exportDonHangListToExcel } from "../../utils/exportToExcel";
import ExportDateSelector from "../common/ExportDateSelector";
import {
  EMPTY_EXPORT_DATE_FILTER,
  toISODateRange,
  isValidExportDateFilter,
} from "../../utils/exportDatePresets";

const DATE_PRESETS = [
  { key: "custom", label: "Chọn trên Lịch", isCalendar: true },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "this_week", label: "Tuần này" },
  { key: "this_month", label: "Tháng này" },
  { key: "this_year", label: "Năm nay" },
  { key: "last_week", label: "Tuần trước" },
  { key: "last_month", label: "Tháng trước" },
  { key: "last_year", label: "Năm trước" },
  { key: "last_7", label: "Trong vòng 7 ngày" },
  { key: "last_10", label: "Trong vòng 10 ngày" },
  { key: "last_30", label: "Trong vòng 30 ngày" },
];

const TRANG_THAI_OPTIONS = ["Chờ xử lý", "Đang sản xuất", "Hoàn thành", "Đã giao"];
const ROWS_PER_PAGE = 20;

const EMPTY_DATE = { preset: null, customFrom: "", customTo: "" };
const EXPORT_STATUS_OPTIONS = [
  { value: "Chờ xử lý", label: "Chờ sản xuất" },
  { value: "Đang sản xuất", label: "Đang sản xuất" },
];

const exportModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "96%", md: 900 },
  maxWidth: 980,
  maxHeight: "92vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

const getDateRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  switch (preset) {
    case "today": return { from: today, to: tomorrow };
    case "yesterday": { const f = new Date(today); f.setDate(f.getDate() - 1); return { from: f, to: today }; }
    case "this_week": { const d = today.getDay(); const f = new Date(today); f.setDate(today.getDate() - (d === 0 ? 6 : d - 1)); return { from: f, to: tomorrow }; }
    case "this_month": return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: tomorrow };
    case "this_year": return { from: new Date(today.getFullYear(), 0, 1), to: tomorrow };
    case "last_week": { const d = today.getDay(); const f = new Date(today); f.setDate(today.getDate() - (d === 0 ? 6 : d - 1) - 7); const t = new Date(f); t.setDate(f.getDate() + 7); return { from: f, to: t }; }
    case "last_month": return { from: new Date(today.getFullYear(), today.getMonth() - 1, 1), to: new Date(today.getFullYear(), today.getMonth(), 1) };
    case "last_year": return { from: new Date(today.getFullYear() - 1, 0, 1), to: new Date(today.getFullYear(), 0, 1) };
    case "last_7": { const f = new Date(today); f.setDate(f.getDate() - 7); return { from: f, to: tomorrow }; }
    case "last_10": { const f = new Date(today); f.setDate(f.getDate() - 10); return { from: f, to: tomorrow }; }
    case "last_30": { const f = new Date(today); f.setDate(f.getDate() - 30); return { from: f, to: tomorrow }; }
    default: return { from: null, to: null };
  }
};

const isDateInRange = (dateValue, filter) => {
  if (!filter.preset) return true;
  if (!dateValue) return false;
  const d = new Date(dateValue);
  let from, to;
  if (filter.preset === "custom") {
    from = filter.customFrom ? new Date(filter.customFrom) : null;
    to = filter.customTo ? new Date(filter.customTo + "T23:59:59") : null;
  } else {
    const range = getDateRange(filter.preset);
    from = range.from;
    to = range.to;
  }
  if (from && d < from) return false;
  if (to && d >= to) return false;
  return true;
};

const DonHangPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: donHangs, loading, error, pagination, stats } = useSelector((state) => state.donHang);
  const nhaKhoaState = useSelector((state) => state.nhaKhoa);
  const benhNhanState = useSelector((state) => state.benhNhan);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDonHangId, setSelectedDonHangId] = useState(null);

  // Applied filters
  const [appliedNgayNhan, setAppliedNgayNhan] = useState(EMPTY_DATE);
  const [appliedYcHoanThanh, setAppliedYcHoanThanh] = useState(EMPTY_DATE);
  const [appliedHenGiao, setAppliedHenGiao] = useState(EMPTY_DATE);
  const [appliedNhaKhoa, setAppliedNhaKhoa] = useState(null);
  const [appliedBenhNhan, setAppliedBenhNhan] = useState(null);
  const [appliedTrangThai, setAppliedTrangThai] = useState([]);

  // Draft filters
  const [draftNgayNhan, setDraftNgayNhan] = useState(EMPTY_DATE);
  const [draftYcHoanThanh, setDraftYcHoanThanh] = useState(EMPTY_DATE);
  const [draftHenGiao, setDraftHenGiao] = useState(EMPTY_DATE);
  const [draftNhaKhoa, setDraftNhaKhoa] = useState(null);
  const [draftBenhNhan, setDraftBenhNhan] = useState(null);
  const [draftTrangThai, setDraftTrangThai] = useState([]);

  // UI state
  const [showFilter, setShowFilter] = useState(false);
  const [openSection, setOpenSection] = useState(null);
  const [nhaKhoaSearch, setNhaKhoaSearch] = useState("");
  const [benhNhanSearch, setBenhNhanSearch] = useState("");
  const filterRef = useRef(null);

  // Export state
  const [openExport, setOpenExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNgayNhan, setExportNgayNhan] = useState(EMPTY_EXPORT_DATE_FILTER);
  const [exportYeuCauGiao, setExportYeuCauGiao] = useState(EMPTY_EXPORT_DATE_FILTER);
  const [exportNgayHoanThanh, setExportNgayHoanThanh] = useState(EMPTY_EXPORT_DATE_FILTER);
  const [exportTrangThai, setExportTrangThai] = useState([]);
  const [exportNhaKhoa, setExportNhaKhoa] = useState("");
  const [exportBenhNhan, setExportBenhNhan] = useState("");

  useEffect(() => {
    dispatch(fetchNhaKhoa());
    dispatch(fetchBenhNhan());
  }, [dispatch]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Helper: convert filter preset to ISO date range params
  const getFilterParams = useCallback((filter, fromKey, toKey) => {
    if (!filter.preset) return {};
    let from, to;
    if (filter.preset === "custom") {
      from = filter.customFrom ? new Date(filter.customFrom) : null;
      to = filter.customTo ? new Date(filter.customTo + "T23:59:59.999") : null;
    } else {
      const range = getDateRange(filter.preset);
      from = range.from;
      to = range.to;
    }
    const result = {};
    if (from) result[fromKey] = from.toISOString();
    if (to) result[toKey] = to.toISOString();
    return result;
  }, []);

  const loadData = useCallback(() => {
    const params = { page, limit: ROWS_PER_PAGE };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (appliedNhaKhoa) params.nhaKhoa = appliedNhaKhoa._id;
    if (appliedBenhNhan) params.benhNhan = appliedBenhNhan._id;
    if (appliedTrangThai.length > 0) params.trangThai = appliedTrangThai.join(",");
    Object.assign(params, getFilterParams(appliedNgayNhan, "ngayNhanFrom", "ngayNhanTo"));
    Object.assign(params, getFilterParams(appliedYcHoanThanh, "ycHoanThanhFrom", "ycHoanThanhTo"));
    Object.assign(params, getFilterParams(appliedHenGiao, "henGiaoFrom", "henGiaoTo"));
    dispatch(fetchDonHang(params));
  }, [dispatch, page, debouncedSearch, appliedNhaKhoa, appliedBenhNhan, appliedTrangThai, appliedNgayNhan, appliedYcHoanThanh, appliedHenGiao, getFilterParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nhaKhoaOptions = useMemo(() => {
    const data = nhaKhoaState?.data || [];
    return Array.isArray(data) ? data.map(nk => ({
      _id: nk._id,
      name: nk.tenGiaoDich || nk.hoVaTen || ""
    })).sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [nhaKhoaState?.data]);

  const benhNhanOptions = useMemo(() => {
    const data = benhNhanState?.data || [];
    return Array.isArray(data) ? data.map(bn => ({
      _id: bn._id,
      name: bn.hoVaTen || ""
    })).sort((a, b) => a.name.localeCompare(b.name)) : [];
  }, [benhNhanState?.data]);

  const filteredNhaKhoaOpts = useMemo(() => {
    if (!nhaKhoaSearch.trim()) return nhaKhoaOptions;
    const s = nhaKhoaSearch.toLowerCase();
    return nhaKhoaOptions.filter((nk) => nk.name.toLowerCase().includes(s));
  }, [nhaKhoaOptions, nhaKhoaSearch]);

  const filteredBenhNhanOpts = useMemo(() => {
    if (!benhNhanSearch.trim()) return benhNhanOptions;
    const s = benhNhanSearch.toLowerCase();
    return benhNhanOptions.filter((bn) => bn.name.toLowerCase().includes(s));
  }, [benhNhanOptions, benhNhanSearch]);

  const handleOpenFilter = () => {
    setDraftNgayNhan(appliedNgayNhan);
    setDraftYcHoanThanh(appliedYcHoanThanh);
    setDraftHenGiao(appliedHenGiao);
    setDraftNhaKhoa(appliedNhaKhoa);
    setDraftBenhNhan(appliedBenhNhan);
    setDraftTrangThai([...appliedTrangThai]);
    setOpenSection(null);
    setNhaKhoaSearch(""); setBenhNhanSearch("");
    setShowFilter(true);
  };

  const handleApplyFilters = () => {
    setAppliedNgayNhan(draftNgayNhan);
    setAppliedYcHoanThanh(draftYcHoanThanh);
    setAppliedHenGiao(draftHenGiao);
    setAppliedNhaKhoa(draftNhaKhoa);
    setAppliedBenhNhan(draftBenhNhan);
    setAppliedTrangThai([...draftTrangThai]);
    setPage(1);
    setShowFilter(false);
  };

  const handleResetDraft = () => {
    setDraftNgayNhan(EMPTY_DATE); setDraftYcHoanThanh(EMPTY_DATE); setDraftHenGiao(EMPTY_DATE);
    setDraftNhaKhoa(null); setDraftBenhNhan(null); setDraftTrangThai([]);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setAppliedNgayNhan(EMPTY_DATE); setAppliedYcHoanThanh(EMPTY_DATE); setAppliedHenGiao(EMPTY_DATE);
    setAppliedNhaKhoa(null); setAppliedBenhNhan(null); setAppliedTrangThai([]);
    setPage(1);
  };

  const handleOpenAdd = () => navigate("/donhang/create");

  const handleRowClick = (donHang) => {
    setSelectedDonHangId((prev) => (prev === donHang._id ? null : donHang._id));
  };

  const toggleDraftTrangThai = (status) => {
    setDraftTrangThai((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]);
  };

  const hasExportDateValue = () =>
    [exportNgayNhan, exportYeuCauGiao, exportNgayHoanThanh].some((item) =>
      isValidExportDateFilter(item)
    );

  const isDateInRangeForExport = (dateValue, fromISO, toISO) => {
    if (!fromISO && !toISO) return true;
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const fromDate = fromISO ? new Date(fromISO) : null;
    const toDate = toISO ? new Date(toISO) : null;

    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  };

  const handleCloseExport = () => {
    setOpenExport(false);
    setExportNgayNhan(EMPTY_EXPORT_DATE_FILTER);
    setExportYeuCauGiao(EMPTY_EXPORT_DATE_FILTER);
    setExportNgayHoanThanh(EMPTY_EXPORT_DATE_FILTER);
    setExportTrangThai([]);
    setExportNhaKhoa("");
    setExportBenhNhan("");
  };

  const handleExportExcel = async () => {
    if (!hasExportDateValue()) {
      alert("Vui lòng nhập ít nhất 1 trong 3 nhóm ngày: Ngày nhận đơn, Ngày yêu cầu giao hoặc Ngày hoàn thành.");
      return;
    }

    try {
      setExporting(true);

      const ngayNhanRange = toISODateRange(exportNgayNhan);
      const yeuCauGiaoRange = toISODateRange(exportYeuCauGiao);
      const ngayHoanThanhRange = toISODateRange(exportNgayHoanThanh);

      // Fetch all matching data from server
      const apiParams = { page: 1, limit: 5000 };
      if (ngayNhanRange.fromISO) apiParams.ngayNhanFrom = ngayNhanRange.fromISO;
      if (ngayNhanRange.toISO) apiParams.ngayNhanTo = ngayNhanRange.toISO;
      if (yeuCauGiaoRange.fromISO) apiParams.ycHoanThanhFrom = yeuCauGiaoRange.fromISO;
      if (yeuCauGiaoRange.toISO) apiParams.ycHoanThanhTo = yeuCauGiaoRange.toISO;
      if (exportNhaKhoa) apiParams.nhaKhoa = exportNhaKhoa;
      if (exportBenhNhan) apiParams.benhNhan = exportBenhNhan;
      if (exportTrangThai.length > 0) apiParams.trangThai = exportTrangThai.join(",");

      const res = await api.get("/donhang", { params: apiParams });
      let data = res.data.data || [];

      // Apply ngayHoanThanh filter client-side (based on updatedAt)
      if (isValidExportDateFilter(exportNgayHoanThanh)) {
        data = data.filter((dh) => {
          const completedStatus = dh.trangThai === "Hoàn thành" || dh.trangThai === "Đã giao";
          if (!completedStatus) return false;
          return isDateInRangeForExport(dh.updatedAt, ngayHoanThanhRange.fromISO, ngayHoanThanhRange.toISO);
        });
      }

      const selectedNhaKhoa = nhaKhoaOptions.find((nk) => nk._id === exportNhaKhoa);
      const selectedBenhNhan = benhNhanOptions.find((bn) => bn._id === exportBenhNhan);

      await exportDonHangListToExcel(data, {
        ngayNhanFrom: ngayNhanRange.fromISO,
        ngayNhanTo: ngayNhanRange.toISO,
        yeuCauGiaoFrom: yeuCauGiaoRange.fromISO,
        yeuCauGiaoTo: yeuCauGiaoRange.toISO,
        daHoanThanhFrom: ngayHoanThanhRange.fromISO,
        daHoanThanhTo: ngayHoanThanhRange.toISO,
        nhaKhoaName: selectedNhaKhoa?.name || "Tất cả",
        benhNhanName: selectedBenhNhan?.name || "Tất cả",
      });

      handleCloseExport();
    } catch (err) {
      alert(`Xuất Excel thất bại: ${err?.message || "Lỗi không xác định"}`);
    } finally {
      setExporting(false);
    }
  };

  const filteredDonHangs = useMemo(() => {
    return donHangs.filter((dh) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const ma = (dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8)}`).toLowerCase();
        const nk = (dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen || "").toLowerCase();
        const bs = (dh.bacSi?.hoVaTen || "").toLowerCase();
        const bn = (dh.benhNhan?.hoVaTen || "").toLowerCase();
        if (!ma.includes(term) && !nk.includes(term) && !bs.includes(term) && !bn.includes(term)) return false;
      }
      if (!isDateInRange(dh.ngayNhan, appliedNgayNhan)) return false;
      if (!isDateInRange(dh.yeuCauHoanThanh, appliedYcHoanThanh)) return false;
      if (!isDateInRange(dh.henGiao, appliedHenGiao)) return false;
      if (appliedNhaKhoa && dh.nhaKhoa?._id !== appliedNhaKhoa._id) return false;
      if (appliedBenhNhan && dh.benhNhan?._id !== appliedBenhNhan._id) return false;
      if (appliedTrangThai.length > 0 && !appliedTrangThai.includes(dh.trangThai)) return false;
      return true;
    });
  }, [donHangs, searchTerm, appliedNgayNhan, appliedYcHoanThanh, appliedHenGiao, appliedNhaKhoa, appliedBenhNhan, appliedTrangThai]);

  const selectedDonHang = donHangs.find((dh) => dh._id === selectedDonHangId) || null;

  const choXuLy = stats?.["Chờ xử lý"] || 0;
  const dangSanXuat = stats?.["Đang sản xuất"] || 0;
  const treHen = stats?.treHen || 0;

  const totalPages = pagination?.totalPages || 1;

  const isFiltered = !!(appliedNgayNhan.preset || appliedYcHoanThanh.preset || appliedHenGiao.preset || appliedNhaKhoa || appliedBenhNhan || appliedTrangThai.length > 0);
  const getDateLabel = (f) => DATE_PRESETS.find((p) => p.key === f.preset)?.label || "";

  const renderDateSection = (label, sectionKey, draftFilter, setDraftFilter) => {
    const isOpen = openSection === sectionKey;
    return (
      <div className="border-b border-gray-100">
        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
          onClick={() => setOpenSection((v) => v === sectionKey ? null : sectionKey)}>
          <div className="flex items-center gap-2">
            <CalendarTodayIcon sx={{ fontSize: 15, color: "#6b7280" }} />
            <span className="text-gray-700 font-medium">{label}</span>
            {draftFilter.preset && <span className="text-blue-600 text-xs font-semibold">{DATE_PRESETS.find((p) => p.key === draftFilter.preset)?.label}</span>}
          </div>
          <ExpandMoreIcon sx={{ fontSize: 18, color: "#9ca3af", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
        </button>
        {isOpen && (
          <div className="border-t border-gray-100 max-h-56 overflow-y-auto pb-1">
            {DATE_PRESETS.map((p) => (
              <div key={p.key}>
                <button onClick={() => setDraftFilter((prev) => ({ ...prev, preset: prev.preset === p.key ? null : p.key }))}
                  className={`w-full text-left px-6 py-2 text-sm flex items-center gap-2 transition ${draftFilter.preset === p.key ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                  {p.isCalendar && <CalendarTodayIcon sx={{ fontSize: 13 }} />}
                  {p.label}
                </button>
                {p.isCalendar && draftFilter.preset === "custom" && (
                  <div className="px-6 pb-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8 shrink-0">Từ</span>
                      <input type="date" value={draftFilter.customFrom}
                        onChange={(e) => setDraftFilter((prev) => ({ ...prev, customFrom: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8 shrink-0">Đến</span>
                      <input type="date" value={draftFilter.customTo}
                        onChange={(e) => setDraftFilter((prev) => ({ ...prev, customTo: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-4 bg-white rounded shadow-sm border">
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-3 overflow-hidden rounded-md text-white text-sm font-semibold">
            <div className="bg-teal-700 px-2 py-2 leading-tight">
              <div className="text-2xl font-bold">{choXuLy}</div>
              <div>Chờ sản xuất</div>
            </div>
            <div className="bg-green-600 px-2 py-2 leading-tight">
              <div className="text-2xl font-bold">{dangSanXuat}</div>
              <div>Đang sản xuất</div>
            </div>
            <div className="bg-red-500 px-2 py-2 leading-tight">
              <div className="text-2xl font-bold">{treHen}</div>
              <div>Trễ giờ hẹn giao</div>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 md:flex-1">
              <div className="relative" ref={filterRef}>
              <button
                onClick={handleOpenFilter}
                title="Bộ lọc"
                className={`relative p-2 rounded-md transition ${isFiltered ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <FilterAltIcon sx={{ fontSize: 20 }} />
                {isFiltered && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
              </button>

              {showFilter && (
                <div className="absolute left-0 top-full mt-1 z-50 w-80 max-w-[92vw] bg-white rounded-xl shadow-2xl border border-gray-200">
                  {renderDateSection("Ngày nhận", "ngayNhan", draftNgayNhan, setDraftNgayNhan)}
                  {renderDateSection("Y/C Hoàn thành", "ycHoanThanh", draftYcHoanThanh, setDraftYcHoanThanh)}
                  {renderDateSection("Hẹn giao", "henGiao", draftHenGiao, setDraftHenGiao)}

                  {/* Nha khoa */}
                  <div className="border-b border-gray-100">
                    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => setOpenSection((v) => v === "nhaKhoa" ? null : "nhaKhoa")}>
                      <div className="flex items-center gap-2">
                        <StoreIcon sx={{ fontSize: 15, color: "#6b7280" }} />
                        <span className="text-gray-700 font-medium">Nha khoa</span>
                        {draftNhaKhoa && <span className="text-blue-600 text-xs font-semibold truncate max-w-[130px]">{draftNhaKhoa.name}</span>}
                      </div>
                      <ExpandMoreIcon sx={{ fontSize: 18, color: "#9ca3af", transform: openSection === "nhaKhoa" ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                    </button>
                    {openSection === "nhaKhoa" && (
                      <div className="border-t border-gray-100">
                        <div className="px-4 py-2">
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-gray-400 flex items-center"><SearchIcon sx={{ fontSize: 15 }} /></span>
                            <input type="text" value={nhaKhoaSearch} onChange={(e) => setNhaKhoaSearch(e.target.value)}
                              placeholder="Tìm nha khoa..." className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                          </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto pb-1">
                          {filteredNhaKhoaOpts.map((nk) => (
                            <button key={nk._id} onClick={() => setDraftNhaKhoa(draftNhaKhoa?._id === nk._id ? null : nk)}
                              className={`w-full text-left px-4 py-2 text-sm transition ${draftNhaKhoa?._id === nk._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                              {nk.name}
                            </button>
                          ))}
                          {filteredNhaKhoaOpts.length === 0 && <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bệnh nhân */}
                  <div className="border-b border-gray-100">
                    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => setOpenSection((v) => v === "benhNhan" ? null : "benhNhan")}>
                      <div className="flex items-center gap-2">
                        <PersonIcon sx={{ fontSize: 15, color: "#6b7280" }} />
                        <span className="text-gray-700 font-medium">Bệnh nhân</span>
                        {draftBenhNhan && <span className="text-blue-600 text-xs font-semibold truncate max-w-[130px]">{draftBenhNhan.name}</span>}
                      </div>
                      <ExpandMoreIcon sx={{ fontSize: 18, color: "#9ca3af", transform: openSection === "benhNhan" ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                    </button>
                    {openSection === "benhNhan" && (
                      <div className="border-t border-gray-100">
                        <div className="px-4 py-2">
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-gray-400 flex items-center"><SearchIcon sx={{ fontSize: 15 }} /></span>
                            <input type="text" value={benhNhanSearch} onChange={(e) => setBenhNhanSearch(e.target.value)}
                              placeholder="Tìm bệnh nhân..." className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
                          </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto pb-1">
                          {filteredBenhNhanOpts.map((bn) => (
                            <button key={bn._id} onClick={() => setDraftBenhNhan(draftBenhNhan?._id === bn._id ? null : bn)}
                              className={`w-full text-left px-4 py-2 text-sm transition ${draftBenhNhan?._id === bn._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                              {bn.name}
                            </button>
                          ))}
                          {filteredBenhNhanOpts.length === 0 && <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trạng thái */}
                  <div className="border-b border-gray-100">
                    <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => setOpenSection((v) => v === "trangThai" ? null : "trangThai")}>
                      <div className="flex items-center gap-2">
                        <AssignmentTurnedInIcon sx={{ fontSize: 15, color: "#6b7280" }} />
                        <span className="text-gray-700 font-medium">Trạng thái</span>
                        {draftTrangThai.length > 0 && <span className="text-blue-600 text-xs font-semibold">{draftTrangThai.length} đã chọn</span>}
                      </div>
                      <ExpandMoreIcon sx={{ fontSize: 18, color: "#9ca3af", transform: openSection === "trangThai" ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                    </button>
                    {openSection === "trangThai" && (
                      <div className="border-t border-gray-100 pb-1">
                        {TRANG_THAI_OPTIONS.map((status) => (
                          <button key={status} onClick={() => toggleDraftTrangThai(status)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition ${draftTrangThai.includes(status) ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                            <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${draftTrangThai.includes(status) ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}>
                              {draftTrangThai.includes(status) && (
                                <svg viewBox="0 0 12 12" className="w-3 h-3 fill-white"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              )}
                            </span>
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom buttons */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button onClick={handleResetDraft} className="text-sm text-gray-500 hover:text-red-500 transition font-medium">Reset lọc</button>
                    <button onClick={handleApplyFilters} className="px-4 py-1.5 bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-semibold rounded-lg transition shadow-sm">Lưu lọc</button>
                  </div>
                </div>
              )}
              </div>

              <div className="relative flex-1 md:flex-none md:w-[220px] flex items-center">
                <span className="absolute left-2.5 text-gray-400 flex items-center pointer-events-none">
                  <SearchIcon sx={{ fontSize: 16 }} />
                </span>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border bg-gray-50 pl-8 pr-8 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 text-gray-400 hover:text-gray-600 flex items-center"
                  >
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleOpenAdd} className="bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-11 h-11 shadow-sm shrink-0">
              <AddIcon sx={{ fontSize: 20 }} />
              </button>
              <button
                onClick={() => setOpenExport(true)}
                title="Xuất excel"
                className="px-3 py-2 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1.5"
              >
                <DownloadIcon sx={{ fontSize: 17 }} />
                Xuất excel
              </button>
              <button onClick={handleRefresh} title="Tải lại" className="text-gray-600 hover:bg-gray-100 p-2 rounded-md border border-gray-200 bg-white">
                <RefreshIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {isFiltered && (
          <div className="flex items-center gap-2 px-3 pb-2.5 flex-wrap">
            {appliedNgayNhan.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Nhận: {getDateLabel(appliedNgayNhan)}
                {appliedNgayNhan.preset === "custom" && appliedNgayNhan.customFrom && ` ${appliedNgayNhan.customFrom}`}
                {appliedNgayNhan.preset === "custom" && appliedNgayNhan.customTo && ` → ${appliedNgayNhan.customTo}`}
                <button onClick={() => { setAppliedNgayNhan(EMPTY_DATE); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedYcHoanThanh.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Y/C HT: {getDateLabel(appliedYcHoanThanh)}
                {appliedYcHoanThanh.preset === "custom" && appliedYcHoanThanh.customFrom && ` ${appliedYcHoanThanh.customFrom}`}
                {appliedYcHoanThanh.preset === "custom" && appliedYcHoanThanh.customTo && ` → ${appliedYcHoanThanh.customTo}`}
                <button onClick={() => { setAppliedYcHoanThanh(EMPTY_DATE); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedHenGiao.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Hẹn giao: {getDateLabel(appliedHenGiao)}
                {appliedHenGiao.preset === "custom" && appliedHenGiao.customFrom && ` ${appliedHenGiao.customFrom}`}
                {appliedHenGiao.preset === "custom" && appliedHenGiao.customTo && ` → ${appliedHenGiao.customTo}`}
                <button onClick={() => { setAppliedHenGiao(EMPTY_DATE); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedNhaKhoa && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <StoreIcon sx={{ fontSize: 11 }} />
                {appliedNhaKhoa.name}
                <button onClick={() => { setAppliedNhaKhoa(null); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedBenhNhan && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <PersonIcon sx={{ fontSize: 11 }} />
                {appliedBenhNhan.name}
                <button onClick={() => { setAppliedBenhNhan(null); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedTrangThai.map((status) => (
              <span key={status} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {status}
                <button onClick={() => { setAppliedTrangThai((prev) => prev.filter((s) => s !== status)); setPage(1); }} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
      ) : (
        <>
          <DonHangTable data={donHangs} selectedId={selectedDonHangId} onRowClick={handleRowClick} />
          <div className="bg-gray-50 border-t p-3 flex justify-between items-center text-sm text-gray-600">
            <span>Tổng: {pagination?.total || 0} đơn hàng</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >← Trước</button>
              <span className="text-xs">Trang {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >Sau →</button>
            </div>
          </div>
        </>
      )}

      <DonHangDetailPanel donHang={selectedDonHang} onClose={() => setSelectedDonHangId(null)} />

      <Modal open={openExport} onClose={handleCloseExport}>
        <Box sx={{ ...exportModalStyle, maxWidth: 650 }}>
          <Typography variant="h6" className="font-bold text-blue-700 mb-2 flex items-center gap-2">
            <DownloadIcon sx={{ fontSize: 24 }} />
            Xuất Excel Đơn Hàng
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={4}>
            {/* KHỐI 1: LỌC THEO THỜI GIAN */}
            <Box>
              <Typography variant="subtitle2" className="font-semibold text-gray-800 mb-4 border-b pb-1">
                Lọc theo khoảng thời gian
              </Typography>
              <Stack spacing={2.5}>
                <ExportDateSelector
                  title="1. Ngày nhận đơn"
                  value={exportNgayNhan}
                  onChange={setExportNgayNhan}
                />
                <ExportDateSelector
                  title="2. Ngày yêu cầu giao"
                  value={exportYeuCauGiao}
                  onChange={setExportYeuCauGiao}
                />
                <ExportDateSelector
                  title="3. Ngày hoàn thành"
                  value={exportNgayHoanThanh}
                  onChange={setExportNgayHoanThanh}
                />
              </Stack>
            </Box>

            {/* KHỐI 2: LỌC THEO THUỘC TÍNH */}
            <Box>
              <Typography variant="subtitle2" className="font-semibold text-gray-800 mb-3 border-b pb-1">
                Lọc theo đối tượng / trạng thái
              </Typography>
              <Stack spacing={2.5}>
                {/* Trạng thái */}
                <Box>
                  <Typography variant="caption" className="font-semibold text-gray-700 mb-1 block">Trạng thái (chọn nhiều)</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      multiple
                      displayEmpty
                      value={exportTrangThai}
                      onChange={(e) => setExportTrangThai(e.target.value)}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0) return <span className="text-gray-500">-- Tất cả trạng thái --</span>;
                        return (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selected.map((item) => {
                              const label = EXPORT_STATUS_OPTIONS.find((s) => s.value === item)?.label || item;
                              return <Chip key={item} size="small" label={label} color="primary" variant="outlined" />;
                            })}
                          </Box>
                        );
                      }}
                    >
                      {EXPORT_STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Nha khoa */}
                <Box>
                  <Typography variant="caption" className="font-semibold text-gray-700 mb-1 block">Nha khoa</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={exportNhaKhoa}
                      onChange={(e) => setExportNhaKhoa(e.target.value)}
                      displayEmpty
                      MenuProps={{ PaperProps: { style: { maxHeight: 300 } }, container: typeof document !== 'undefined' ? document.body : undefined }}
                    >
                      <MenuItem value=""><span className="text-gray-500">-- Tất cả nha khoa --</span></MenuItem>
                      {nhaKhoaOptions.map((nk) => (
                        <MenuItem key={nk._id} value={nk._id}>{nk.name}</MenuItem>
                      ))}

                    </Select>
                  </FormControl>
                </Box>

                {/* Bệnh nhân */}
                <Box>
                  <Typography variant="caption" className="font-semibold text-gray-700 mb-1 block">Bệnh nhân</Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={exportBenhNhan}
                      onChange={(e) => setExportBenhNhan(e.target.value)}
                      displayEmpty
                      MenuProps={{ PaperProps: { style: { maxHeight: 300 } }, container: typeof document !== 'undefined' ? document.body : undefined }}
                    >
                      <MenuItem value=""><span className="text-gray-500">-- Tất cả bệnh nhân --</span></MenuItem>
                      {benhNhanOptions.map((bn) => (
                        <MenuItem key={bn._id} value={bn._id}>{bn.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>
          </Stack>

          {/* FOOTER: NÚT THAO TÁC */}
          <Box className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button variant="outlined" color="inherit" onClick={handleCloseExport}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportExcel}
              disabled={exporting}
              startIcon={<DownloadIcon />}
            >
              {exporting ? "Đang xuất..." : "Tải xuống"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default DonHangPage;
