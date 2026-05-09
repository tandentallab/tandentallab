import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDonHang } from "../../redux/slices/donHangSlice";
import DonHangTable from "./DonHangTable";
import DonHangDetailPanel from "./DonHangDetailPanel";
import {
  Modal,
  Box,
  Typography,
  Divider,
  Grid,
  TextField,
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
  const { data: donHangs, loading, error } = useSelector((state) => state.donHang);

  const [searchTerm, setSearchTerm] = useState("");
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
  const [exportNgayNhanFrom, setExportNgayNhanFrom] = useState("");
  const [exportNgayNhanTo, setExportNgayNhanTo] = useState("");
  const [exportYeuCauGiaoFrom, setExportYeuCauGiaoFrom] = useState("");
  const [exportYeuCauGiaoTo, setExportYeuCauGiaoTo] = useState("");
  const [exportDaHoanThanhFrom, setExportDaHoanThanhFrom] = useState("");
  const [exportDaHoanThanhTo, setExportDaHoanThanhTo] = useState("");
  const [exportTrangThai, setExportTrangThai] = useState([]);
  const [exportNhaKhoa, setExportNhaKhoa] = useState("");
  const [exportBenhNhan, setExportBenhNhan] = useState("");

  useEffect(() => { dispatch(fetchDonHang()); }, [dispatch]);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nhaKhoaOptions = useMemo(() => {
    const map = new Map();
    donHangs.forEach((dh) => {
      if (dh.nhaKhoa?._id) map.set(dh.nhaKhoa._id, { _id: dh.nhaKhoa._id, name: dh.nhaKhoa.tenGiaoDich || dh.nhaKhoa.hoVaTen || "" });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [donHangs]);

  const benhNhanOptions = useMemo(() => {
    const map = new Map();
    donHangs.forEach((dh) => {
      if (dh.benhNhan?._id) map.set(dh.benhNhan._id, { _id: dh.benhNhan._id, name: dh.benhNhan.hoVaTen || "" });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [donHangs]);

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
    setShowFilter(false);
  };

  const handleResetDraft = () => {
    setDraftNgayNhan(EMPTY_DATE); setDraftYcHoanThanh(EMPTY_DATE); setDraftHenGiao(EMPTY_DATE);
    setDraftNhaKhoa(null); setDraftBenhNhan(null); setDraftTrangThai([]);
  };

  const handleRefresh = () => {
    dispatch(fetchDonHang());
    setSearchTerm("");
    setAppliedNgayNhan(EMPTY_DATE); setAppliedYcHoanThanh(EMPTY_DATE); setAppliedHenGiao(EMPTY_DATE);
    setAppliedNhaKhoa(null); setAppliedBenhNhan(null); setAppliedTrangThai([]);
  };

  const handleOpenAdd = () => navigate("/donhang/create");

  const handleRowClick = (donHang) => {
    setSelectedDonHangId((prev) => (prev === donHang._id ? null : donHang._id));
  };

  const toggleDraftTrangThai = (status) => {
    setDraftTrangThai((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]);
  };

  const isDateInRangeForExport = (dateValue, from, to) => {
    if (!dateValue) return false;
    const date = new Date(dateValue);
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(`${to}T23:59:59`) : null;

    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;
    return true;
  };

  const handleCloseExport = () => {
    setOpenExport(false);
    setExportNgayNhanFrom("");
    setExportNgayNhanTo("");
    setExportYeuCauGiaoFrom("");
    setExportYeuCauGiaoTo("");
    setExportDaHoanThanhFrom("");
    setExportDaHoanThanhTo("");
    setExportTrangThai([]);
    setExportNhaKhoa("");
    setExportBenhNhan("");
  };

  const handleExportExcel = async () => {
    if (!exportNgayNhanFrom || !exportNgayNhanTo) {
      alert("Vui lòng nhập đầy đủ Ngày nhận đơn (Từ - Đến).");
      return;
    }
    if (!exportYeuCauGiaoFrom || !exportYeuCauGiaoTo) {
      alert("Vui lòng nhập đầy đủ Ngày yêu cầu giao (Từ - Đến).");
      return;
    }

    try {
      setExporting(true);

      const data = donHangs.filter((dh) => {
        if (!isDateInRangeForExport(dh.ngayNhan, exportNgayNhanFrom, exportNgayNhanTo)) {
          return false;
        }

        if (!isDateInRangeForExport(dh.yeuCauHoanThanh, exportYeuCauGiaoFrom, exportYeuCauGiaoTo)) {
          return false;
        }

        if (exportDaHoanThanhFrom || exportDaHoanThanhTo) {
          const completedStatus = dh.trangThai === "Hoàn thành" || dh.trangThai === "Đã giao";
          if (!completedStatus) return false;
          if (!isDateInRangeForExport(dh.updatedAt, exportDaHoanThanhFrom, exportDaHoanThanhTo)) {
            return false;
          }
        }

        if (exportTrangThai.length > 0 && !exportTrangThai.includes(dh.trangThai)) {
          return false;
        }

        if (exportNhaKhoa && dh.nhaKhoa?._id !== exportNhaKhoa) {
          return false;
        }

        if (exportBenhNhan && dh.benhNhan?._id !== exportBenhNhan) {
          return false;
        }

        return true;
      });

      const selectedNhaKhoa = nhaKhoaOptions.find((nk) => nk._id === exportNhaKhoa);
      const selectedBenhNhan = benhNhanOptions.find((bn) => bn._id === exportBenhNhan);

      await exportDonHangListToExcel(data, {
        ngayNhanFrom: new Date(exportNgayNhanFrom).toLocaleDateString("vi-VN"),
        ngayNhanTo: new Date(exportNgayNhanTo).toLocaleDateString("vi-VN"),
        yeuCauGiaoFrom: new Date(exportYeuCauGiaoFrom).toLocaleDateString("vi-VN"),
        yeuCauGiaoTo: new Date(exportYeuCauGiaoTo).toLocaleDateString("vi-VN"),
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
        const ma = `TAN${dh._id.substring(dh._id.length - 8)}`.toLowerCase();
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

  const now = new Date();
  const choXuLy = donHangs.filter((d) => d.trangThai === "Chờ xử lý").length;
  const dangSanXuat = donHangs.filter((d) => d.trangThai === "Đang sản xuất").length;
  const treHen = donHangs.filter((d) => d.henGiao && new Date(d.henGiao) < now && d.trangThai !== "Hoàn thành" && d.trangThai !== "Đã giao").length;

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
        <div className="flex justify-between items-center p-3">
          {/* Left: status badges & filters */}
          <div className="flex gap-3">
            <div className="relative" ref={filterRef}>
              <button onClick={handleOpenFilter} title="Bộ lọc"
                className={`relative p-1.5 rounded transition ${isFiltered ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-500 hover:bg-gray-100"}`}>
                <FilterAltIcon sx={{ fontSize: 20 }} />
                {isFiltered && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
              </button>

              {showFilter && (
                <div className="absolute left-0 top-full mt-1 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200">
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
            <div className="flex gap-1 items-center font-medium text-sm">
              <div className="bg-teal-700 text-white px-3 py-1.5 flex items-center gap-2 rounded-l">
                <span>{choXuLy}</span> Chờ sản xuất
              </div>
              <div className="bg-green-600 text-white px-3 py-1.5 flex items-center gap-2">
                <span>{dangSanXuat}</span> Đang sản xuất
              </div>
              <div className="bg-red-500 text-white px-3 py-1.5 flex items-center gap-2 rounded-r">
                <span>{treHen}</span> Trễ giờ hẹn giao
              </div>
            </div>
          </div>

          {/* Right: search + add + refresh */}
          <div className="flex gap-2 items-center">
            <div className="relative flex items-center">
              <span className="absolute left-2.5 text-gray-400 flex items-center pointer-events-none"><SearchIcon sx={{ fontSize: 16 }} /></span>
              <input type="text" placeholder="Tìm kiếm mã, nha khoa, bác sĩ, bệnh nhân..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="border bg-gray-50 pl-8 pr-8 py-1.5 rounded-full w-72 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 text-gray-400 hover:text-gray-600 flex items-center">
                  <CloseIcon sx={{ fontSize: 15 }} />
                </button>
              )}
            </div>
            <button onClick={handleOpenAdd} className="bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-8 h-8 shadow-sm">
              <AddIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={() => setOpenExport(true)}
              title="Xuất excel"
              className="bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center justify-center w-8 h-8 shadow-sm"
            >
              <DownloadIcon sx={{ fontSize: 18 }} />
            </button>
            <button onClick={handleRefresh} title="Tải lại" className="text-gray-600 hover:bg-gray-100 p-1.5 rounded">
              <RefreshIcon sx={{ fontSize: 20 }} />
            </button>
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
                <button onClick={() => setAppliedNgayNhan(EMPTY_DATE)} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedYcHoanThanh.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Y/C HT: {getDateLabel(appliedYcHoanThanh)}
                {appliedYcHoanThanh.preset === "custom" && appliedYcHoanThanh.customFrom && ` ${appliedYcHoanThanh.customFrom}`}
                {appliedYcHoanThanh.preset === "custom" && appliedYcHoanThanh.customTo && ` → ${appliedYcHoanThanh.customTo}`}
                <button onClick={() => setAppliedYcHoanThanh(EMPTY_DATE)} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedHenGiao.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Hẹn giao: {getDateLabel(appliedHenGiao)}
                {appliedHenGiao.preset === "custom" && appliedHenGiao.customFrom && ` ${appliedHenGiao.customFrom}`}
                {appliedHenGiao.preset === "custom" && appliedHenGiao.customTo && ` → ${appliedHenGiao.customTo}`}
                <button onClick={() => setAppliedHenGiao(EMPTY_DATE)} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedNhaKhoa && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <StoreIcon sx={{ fontSize: 11 }} />
                {appliedNhaKhoa.name}
                <button onClick={() => setAppliedNhaKhoa(null)} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedBenhNhan && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <PersonIcon sx={{ fontSize: 11 }} />
                {appliedBenhNhan.name}
                <button onClick={() => setAppliedBenhNhan(null)} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
              </span>
            )}
            {appliedTrangThai.map((status) => (
              <span key={status} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {status}
                <button onClick={() => setAppliedTrangThai((prev) => prev.filter((s) => s !== status))} className="ml-0.5 hover:text-blue-900 flex items-center"><CloseIcon sx={{ fontSize: 12 }} /></button>
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
        <DonHangTable data={filteredDonHangs} selectedId={selectedDonHangId} onRowClick={handleRowClick} />
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
              <Stack spacing={3}>
                
                {/* Ngày nhận đơn */}
                <Box>
                  <Typography variant="body2" className="font-semibold text-gray-700 mb-2">
                    1. Ngày nhận đơn
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Từ ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportNgayNhanFrom} onChange={(e) => setExportNgayNhanFrom(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Đến ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportNgayNhanTo} onChange={(e) => setExportNgayNhanTo(e.target.value)} />
                    </Grid>
                  </Grid>
                </Box>

                {/* Ngày yêu cầu giao */}
                <Box>
                  <Typography variant="body2" className="font-semibold text-gray-700 mb-2">
                    2. Ngày yêu cầu giao
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Từ ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportYeuCauGiaoFrom} onChange={(e) => setExportYeuCauGiaoFrom(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Đến ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportYeuCauGiaoTo} onChange={(e) => setExportYeuCauGiaoTo(e.target.value)} />
                    </Grid>
                  </Grid>
                </Box>

                {/* Ngày đã hoàn thành */}
                <Box>
                  <Typography variant="body2" className="font-semibold text-gray-700 mb-2">
                    3. Ngày hoàn thành
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Từ ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportDaHoanThanhFrom} onChange={(e) => setExportDaHoanThanhFrom(e.target.value)} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <Typography variant="caption" className="text-gray-500 mb-1 block">Đến ngày</Typography>
                      <TextField type="date" size="small" fullWidth value={exportDaHoanThanhTo} onChange={(e) => setExportDaHoanThanhTo(e.target.value)} />
                    </Grid>
                  </Grid>
                </Box>

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
