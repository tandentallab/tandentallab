import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDonHang,
  fetchMoreDonHang,
  resetDonHangPageFilter,
  setDonHangPageFilter,
} from "../../redux/slices/donHangSlice";
import { api } from "../../config/api";
import DonHangTable from "./DonHangTable";
import DonHangDetailPanel from "./DonHangDetailPanel";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import { fetchBenhNhan } from "../../redux/slices/benhNhanSlice";
import { toast } from "sonner";
import {
  Modal,
  Box,
  Typography,
  Divider,
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

const TRANG_THAI_OPTIONS = ["Chờ xử lý", "Hoàn thành"];
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
    case "last_week": {
      const d = today.getDay();
      const f = new Date(today);
      f.setDate(today.getDate() - (d === 0 ? 6 : d - 1) - 7);
      const t = new Date(f);
      t.setDate(f.getDate() + 7);
      return { from: f, to: t };
    }
    case "last_month":
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 1),
      };
    case "last_year":
      return {
        from: new Date(today.getFullYear() - 1, 0, 1),
        to: new Date(today.getFullYear(), 0, 1),
      };
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
  const {
    data: donHangs,
    loading,
    loadingMore,
    error,
    pagination,
    stats,
  } = useSelector((state) => state.donHang);
  const nhaKhoaState = useSelector((state) => state.nhaKhoa);
  const benhNhanState = useSelector((state) => state.benhNhan);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDonHangId, setSelectedDonHangId] = useState(null);
  const sentinelRef = useRef(null);

  //
  const { donHangPageFilter } = useSelector((state) => state.donHang);

  // Applied filters
  const appliedNgayNhan = donHangPageFilter.appliedNgayNhan;

  const appliedYcHoanThanh = donHangPageFilter.appliedYcHoanThanh;

  const appliedHenGiao = donHangPageFilter.appliedHenGiao;

  const appliedNhaKhoa = donHangPageFilter.appliedNhaKhoa;

  const appliedBenhNhan = donHangPageFilter.appliedBenhNhan;

  const appliedTrangThai = donHangPageFilter.appliedTrangThai;

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
  const [openDateModal, setOpenDateModal] = useState(null); // 'ngayNhan' | 'ycHoanThanh' | 'henGiao'
  const [openPickerModal, setOpenPickerModal] = useState(null); // 'nhaKhoa' | 'benhNhan'

  // Export state
  const [openExport, setOpenExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportNgayNhan, setExportNgayNhan] = useState(
    EMPTY_EXPORT_DATE_FILTER
  );
  const [exportYeuCauGiao, setExportYeuCauGiao] = useState(
    EMPTY_EXPORT_DATE_FILTER
  );
  const [exportNgayHoanThanh, setExportNgayHoanThanh] = useState(
    EMPTY_EXPORT_DATE_FILTER
  );
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
    if (appliedTrangThai.length > 0)
      params.trangThai = appliedTrangThai.join(",");
    Object.assign(
      params,
      getFilterParams(appliedNgayNhan, "ngayNhanFrom", "ngayNhanTo")
    );
    Object.assign(
      params,
      getFilterParams(appliedYcHoanThanh, "ycHoanThanhFrom", "ycHoanThanhTo")
    );
    Object.assign(
      params,
      getFilterParams(appliedHenGiao, "henGiaoFrom", "henGiaoTo")
    );
    if (page === 1) {
      dispatch(fetchDonHang(params));
    } else {
      dispatch(fetchMoreDonHang(params));
    }
  }, [
    dispatch,
    page,
    debouncedSearch,
    appliedNhaKhoa,
    appliedBenhNhan,
    appliedTrangThai,
    appliedNgayNhan,
    appliedYcHoanThanh,
    appliedHenGiao,
    getFilterParams,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Infinite scroll: khi sentinel vào viewport thì tải trang tiếp theo
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          page < (pagination?.totalPages || 1) &&
          !loadingMore &&
          !loading
        ) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, pagination?.totalPages, loadingMore, loading]);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        // Don't close when clicking inside MUI portals (Select dropdown, Popover, etc.)
        if (
          e.target.closest?.(".MuiPopover-root, .MuiMenu-root, .MuiModal-root")
        )
          return;
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nhaKhoaOptions = useMemo(() => {
    const data = nhaKhoaState?.data || [];
    return Array.isArray(data)
      ? data
        .map((nk) => ({
          _id: nk._id,
          name: nk.tenGiaoDich || nk.hoVaTen || "",
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [nhaKhoaState?.data]);

  const benhNhanOptions = useMemo(() => {
    const data = benhNhanState?.data || [];
    return Array.isArray(data)
      ? data
        .map((bn) => ({
          _id: bn._id,
          name: bn.hoVaTen || "",
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      : [];
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
    setDraftNgayNhan(donHangPageFilter.appliedNgayNhan);

    setDraftYcHoanThanh(donHangPageFilter.appliedYcHoanThanh);

    setDraftHenGiao(donHangPageFilter.appliedHenGiao);

    setDraftNhaKhoa(donHangPageFilter.appliedNhaKhoa);

    setDraftBenhNhan(donHangPageFilter.appliedBenhNhan);

    setDraftTrangThai([...donHangPageFilter.appliedTrangThai]);

    setShowFilter(true);
  };

  const handleApplyFilters = () => {
    dispatch(
      setDonHangPageFilter({
        appliedNgayNhan: draftNgayNhan,
        appliedYcHoanThanh: draftYcHoanThanh,
        appliedHenGiao: draftHenGiao,
        appliedNhaKhoa: draftNhaKhoa,
        appliedBenhNhan: draftBenhNhan,
        appliedTrangThai: draftTrangThai,
      })
    );
    setPage(1);
    setOpenDateModal(null);
    setOpenPickerModal(null);
    setShowFilter(false);
  };

  const handleResetDraft = () => {
    setDraftNgayNhan(EMPTY_DATE);
    setDraftYcHoanThanh(EMPTY_DATE);
    setDraftHenGiao(EMPTY_DATE);
    setDraftNhaKhoa(null);
    setDraftBenhNhan(null);
    setDraftTrangThai([]);
  };

  const handleRefresh = () => {
    setSearchTerm("");
    dispatch(resetDonHangPageFilter());
    setPage(1);
  };

  const handleOpenAdd = () => navigate("/donhang/create");

  const handleRowClick = (donHang) => {
    setSelectedDonHangId((prev) => (prev === donHang._id ? null : donHang._id));
  };

  const toggleDraftTrangThai = (status) => {
    setDraftTrangThai((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
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
      toast.error(
        "Vui lòng nhập ít nhất 1 trong 3 nhóm ngày: Ngày nhận đơn, Ngày yêu cầu giao hoặc Ngày hoàn thành."
      );
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
      if (yeuCauGiaoRange.fromISO)
        apiParams.ycHoanThanhFrom = yeuCauGiaoRange.fromISO;
      if (yeuCauGiaoRange.toISO)
        apiParams.ycHoanThanhTo = yeuCauGiaoRange.toISO;
      if (exportNhaKhoa) apiParams.nhaKhoa = exportNhaKhoa;
      if (exportBenhNhan) apiParams.benhNhan = exportBenhNhan;
      if (exportTrangThai.length > 0)
        apiParams.trangThai = exportTrangThai.join(",");

      const res = await api.get("/donhang", { params: apiParams });
      let data = res.data.data || [];

      // Apply ngayHoanThanh filter client-side (based on updatedAt)
      if (isValidExportDateFilter(exportNgayHoanThanh)) {
        data = data.filter((dh) => {
          const completedStatus =
            dh.trangThai === "Hoàn thành" || dh.trangThai === "Đã giao";
          if (!completedStatus) return false;
          return isDateInRangeForExport(
            dh.updatedAt,
            ngayHoanThanhRange.fromISO,
            ngayHoanThanhRange.toISO
          );
        });
      }

      const selectedNhaKhoa = nhaKhoaOptions.find(
        (nk) => nk._id === exportNhaKhoa
      );
      const selectedBenhNhan = benhNhanOptions.find(
        (bn) => bn._id === exportBenhNhan
      );

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
      toast.error(
        `Xuất Excel thất bại: ${err?.message || "Lỗi không xác định"}`
      );
    } finally {
      setExporting(false);
    }
  };

  const filteredDonHangs = useMemo(() => {
    return donHangs.filter((dh) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const ma = (
          dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8)}`
        ).toLowerCase();
        const nk = (
          dh.nhaKhoa?.tenGiaoDich ||
          dh.nhaKhoa?.hoVaTen ||
          ""
        ).toLowerCase();
        const bs = (dh.bacSi?.hoVaTen || "").toLowerCase();
        const bn = (dh.benhNhan?.hoVaTen || "").toLowerCase();
        if (
          !ma.includes(term) &&
          !nk.includes(term) &&
          !bs.includes(term) &&
          !bn.includes(term)
        )
          return false;
      }
      if (!isDateInRange(dh.ngayNhan, appliedNgayNhan)) return false;
      if (!isDateInRange(dh.yeuCauHoanThanh, appliedYcHoanThanh)) return false;
      if (!isDateInRange(dh.henGiao, appliedHenGiao)) return false;
      if (appliedNhaKhoa && dh.nhaKhoa?._id !== appliedNhaKhoa._id)
        return false;
      if (appliedBenhNhan && dh.benhNhan?._id !== appliedBenhNhan._id)
        return false;
      if (
        appliedTrangThai.length > 0 &&
        !appliedTrangThai.includes(dh.trangThai)
      )
        return false;
      return true;
    });
  }, [
    donHangs,
    searchTerm,
    appliedNgayNhan,
    appliedYcHoanThanh,
    appliedHenGiao,
    appliedNhaKhoa,
    appliedBenhNhan,
    appliedTrangThai,
  ]);

  const selectedDonHang =
    donHangs.find((dh) => dh._id === selectedDonHangId) || null;

  const choXuLy = stats?.["Chờ xử lý"] || 0;
  const dangSanXuat = stats?.["Đang sản xuất"] || 0;
  const treHen = stats?.treHen || 0;

  const isFiltered = !!(
    appliedNgayNhan.preset ||
    appliedYcHoanThanh.preset ||
    appliedHenGiao.preset ||
    appliedNhaKhoa ||
    appliedBenhNhan ||
    appliedTrangThai.length > 0
  );
  const getDateLabel = (f) =>
    DATE_PRESETS.find((p) => p.key === f.preset)?.label || "";

  const renderDateDropdown = (cf, scf) => (
    <div className="absolute left-5 top-full z-[100] w-[80%] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
      {DATE_PRESETS.map((p) => (
        <div key={p.key}>
          <button
            onClick={() => {
              scf((prev) => ({
                ...prev,
                preset: prev.preset === p.key ? null : p.key,
              }));
              if (!p.isCalendar) setOpenDateModal(null);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 border-b border-gray-100 transition ${cf.preset === p.key
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            {p.isCalendar && <CalendarTodayIcon sx={{ fontSize: 14 }} />}
            {p.label}
          </button>
          {p.isCalendar && cf.preset === "custom" && (
            <div
              className="px-4 py-3 space-y-2 bg-blue-50/30 border-b border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8 shrink-0">Từ</span>
                <input
                  type="date"
                  value={cf.customFrom}
                  onChange={(e) =>
                    scf((prev) => ({ ...prev, customFrom: e.target.value }))
                  }
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8 shrink-0">Đến</span>
                <input
                  type="date"
                  value={cf.customTo}
                  onChange={(e) =>
                    scf((prev) => ({ ...prev, customTo: e.target.value }))
                  }
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 bg-gray-100">
      <div className="mb-4 bg-white rounded shadow-sm border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3">
          {/* Left: status badges & filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative" ref={filterRef}>
              <button
                onClick={handleOpenFilter}
                title="Bộ lọc"
                className={`relative p-1.5 rounded transition ${isFiltered
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-500 hover:bg-gray-100"
                  }`}
              >
                <FilterAltIcon sx={{ fontSize: 20 }} />
                {isFiltered && (
                  <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>

              {showFilter && (
                <div
                  className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-200"
                  onClick={() => {
                    setOpenDateModal(null);
                    setOpenPickerModal(null);
                  }}
                >
                  {/* Ngày nhận */}
                  <div
                    className="relative border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => {
                        setOpenPickerModal(null);
                        setOpenDateModal(
                          openDateModal === "ngayNhan" ? null : "ngayNhan"
                        );
                      }}
                    >
                      <span
                        className={
                          draftNgayNhan.preset
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {draftNgayNhan.preset
                          ? getDateLabel(draftNgayNhan)
                          : "Ngày nhận"}
                      </span>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "#9ca3af" }}
                      />
                    </button>
                    {openDateModal === "ngayNhan" &&
                      renderDateDropdown(draftNgayNhan, setDraftNgayNhan)}
                  </div>
                  {/* Y/c hoàn thành */}
                  <div
                    className="relative border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => {
                        setOpenPickerModal(null);
                        setOpenDateModal(
                          openDateModal === "ycHoanThanh" ? null : "ycHoanThanh"
                        );
                      }}
                    >
                      <span
                        className={
                          draftYcHoanThanh.preset
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {draftYcHoanThanh.preset
                          ? getDateLabel(draftYcHoanThanh)
                          : "Y/c hoàn thành"}
                      </span>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "#9ca3af" }}
                      />
                    </button>
                    {openDateModal === "ycHoanThanh" &&
                      renderDateDropdown(draftYcHoanThanh, setDraftYcHoanThanh)}
                  </div>
                  {/* Hẹn giao */}
                  <div
                    className="relative border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                      onClick={() => {
                        setOpenPickerModal(null);
                        setOpenDateModal(
                          openDateModal === "henGiao" ? null : "henGiao"
                        );
                      }}
                    >
                      <span
                        className={
                          draftHenGiao.preset
                            ? "text-blue-600 font-medium"
                            : "text-gray-600"
                        }
                      >
                        {draftHenGiao.preset
                          ? getDateLabel(draftHenGiao)
                          : "Hẹn giao"}
                      </span>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, color: "#9ca3af" }}
                      />
                    </button>
                    {openDateModal === "henGiao" &&
                      renderDateDropdown(draftHenGiao, setDraftHenGiao)}
                  </div>
                  {/* Nha khoa */}
                  <div
                    className="relative border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {openPickerModal === "nhaKhoa" ? (
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          value={nhaKhoaSearch}
                          onChange={(e) => setNhaKhoaSearch(e.target.value)}
                          placeholder="Tìm nha khoa..."
                          autoFocus
                          className="w-full border-b border-blue-400 px-3 py-1.5 text-sm focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-start px-4 py-3 hover:bg-gray-50 transition text-sm"
                        onClick={() => {
                          setOpenDateModal(null);
                          setNhaKhoaSearch("");
                          setOpenPickerModal("nhaKhoa");
                        }}
                      >
                        <span
                          className={
                            draftNhaKhoa
                              ? "text-blue-600 font-medium truncate"
                              : "text-gray-400"
                          }
                        >
                          {draftNhaKhoa ? draftNhaKhoa.name : "Nha khoa"}
                        </span>
                      </button>
                    )}
                    {openPickerModal === "nhaKhoa" && (
                      <div className="absolute left-2 top-full z-[100] w-[90%] bg-white rounded shadow-xl border border-t-0 border-gray-200 max-h-56 overflow-y-auto">
                        {draftNhaKhoa && (
                          <button
                            onClick={() => {
                              setDraftNhaKhoa(null);
                              setOpenPickerModal(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 border-b border-gray-100 transition"
                          >
                            Bỏ chọn
                          </button>
                        )}
                        {filteredNhaKhoaOpts.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => {
                              setDraftNhaKhoa(item);
                              setOpenPickerModal(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm border-b border-gray-50 transition ${draftNhaKhoa?._id === item._id
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {item.name}
                          </button>
                        ))}
                        {filteredNhaKhoaOpts.length === 0 && (
                          <p className="text-center text-xs text-gray-400 py-4">
                            Không tìm thấy
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Bệnh nhân */}
                  <div
                    className="relative border-b border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {openPickerModal === "benhNhan" ? (
                      <div className="px-3 py-2">
                        <input
                          type="text"
                          value={benhNhanSearch}
                          onChange={(e) => setBenhNhanSearch(e.target.value)}
                          placeholder="Tìm bệnh nhân..."
                          autoFocus
                          className="w-full border-b border-blue-400 px-3 py-1.5 text-sm focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-start px-4 py-3 hover:bg-gray-50 transition text-sm"
                        onClick={() => {
                          setOpenDateModal(null);
                          setBenhNhanSearch("");
                          setOpenPickerModal("benhNhan");
                        }}
                      >
                        <span
                          className={
                            draftBenhNhan
                              ? "text-blue-600 font-medium truncate"
                              : "text-gray-400"
                          }
                        >
                          {draftBenhNhan ? draftBenhNhan.name : "Bệnh nhân"}
                        </span>
                      </button>
                    )}
                    {openPickerModal === "benhNhan" && (
                      <div className="absolute left-2 top-full z-[100] w-[90%] bg-white rounded shadow-xl border border-t-0 border-gray-200 max-h-56 overflow-y-auto">
                        {draftBenhNhan && (
                          <button
                            onClick={() => {
                              setDraftBenhNhan(null);
                              setOpenPickerModal(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 border-b border-gray-100 transition"
                          >
                            Bỏ chọn
                          </button>
                        )}
                        {filteredBenhNhanOpts.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => {
                              setDraftBenhNhan(item);
                              setOpenPickerModal(null);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm border-b border-gray-50 transition ${draftBenhNhan?._id === item._id
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {item.name}
                          </button>
                        ))}
                        {filteredBenhNhanOpts.length === 0 && (
                          <p className="text-center text-xs text-gray-400 py-4">
                            Không tìm thấy
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Trạng thái */}
                  <div className="border-b border-gray-100 px-3 py-2">
                    <FormControl fullWidth size="small">
                      <Select
                        multiple
                        displayEmpty
                        value={draftTrangThai}
                        onChange={(e) =>
                          setDraftTrangThai(
                            typeof e.target.value === "string"
                              ? e.target.value.split(",")
                              : e.target.value
                          )
                        }
                        renderValue={(selected) => {
                          if (selected.length === 0)
                            return (
                              <em
                                style={{
                                  color: "#9ca3af",
                                  fontStyle: "normal",
                                  fontSize: "0.875rem",
                                }}
                              >
                                Trạng thái
                              </em>
                            );
                          if (selected.length === 1)
                            return (
                              <span style={{ fontSize: "0.875rem" }}>
                                {selected[0]}
                              </span>
                            );
                          return (
                            <span style={{ fontSize: "0.875rem" }}>
                              {selected[0]} (+{selected.length - 1} Khác)
                            </span>
                          );
                        }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#e5e7eb",
                          },
                          "& .MuiSelect-select": { py: "6px" },
                        }}
                      >
                        {TRANG_THAI_OPTIONS.map((status) => (
                          <MenuItem
                            key={status}
                            value={status}
                            dense
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                  {/* Bottom buttons */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={handleResetDraft}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition"
                      title="Reset lọc"
                    >
                      <RefreshIcon sx={{ fontSize: 20 }} />
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex items-center gap-1 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition shadow-sm"
                    >
                      ✓ Lưu
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1 items-center font-medium text-sm">
              <div className="bg-teal-700 text-white px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-2 rounded-l">
                <span>{choXuLy}</span>
                <span className="hidden sm:inline">Chờ sản xuất</span>
              </div>
              <div className="bg-green-600 text-white px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-2">
                <span>{dangSanXuat}</span>
                <span className="hidden sm:inline">Đang sản xuất</span>
              </div>
              <div className="bg-red-500 text-white px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-2 rounded-r">
                <span>{treHen}</span>
                <span className="hidden sm:inline">Trễ giờ hẹn giao</span>
              </div>
            </div>
          </div>

          {/* Right: search + add + refresh */}
          <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
            <div className="relative flex items-center flex-1 sm:flex-none">
              <span className="absolute left-2.5 text-gray-400 flex items-center pointer-events-none">
                <SearchIcon sx={{ fontSize: 16 }} />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm mã, nha khoa, bác sĩ, bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border bg-gray-50 pl-8 pr-8 py-1.5 rounded-full w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
            <button
              onClick={handleOpenAdd}
              className="bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-8 h-8 shadow-sm"
            >
              <AddIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={() => setOpenExport(true)}
              title="Xuất Excel"
              className="p-2 rounded hover:bg-gray-200 text-gray-500 transition"
            >
              <DownloadIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={handleRefresh}
              title="Tải lại"
              className="text-gray-600 hover:bg-gray-100 p-1.5 rounded"
            >
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
                {appliedNgayNhan.preset === "custom" &&
                  appliedNgayNhan.customFrom &&
                  ` ${appliedNgayNhan.customFrom}`}
                {appliedNgayNhan.preset === "custom" &&
                  appliedNgayNhan.customTo &&
                  ` → ${appliedNgayNhan.customTo}`}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedNgayNhan: EMPTY_DATE,
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            )}
            {appliedYcHoanThanh.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Y/C HT: {getDateLabel(appliedYcHoanThanh)}
                {appliedYcHoanThanh.preset === "custom" &&
                  appliedYcHoanThanh.customFrom &&
                  ` ${appliedYcHoanThanh.customFrom}`}
                {appliedYcHoanThanh.preset === "custom" &&
                  appliedYcHoanThanh.customTo &&
                  ` → ${appliedYcHoanThanh.customTo}`}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedYcHoanThanh: EMPTY_DATE,
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            )}
            {appliedHenGiao.preset && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                Hẹn giao: {getDateLabel(appliedHenGiao)}
                {appliedHenGiao.preset === "custom" &&
                  appliedHenGiao.customFrom &&
                  ` ${appliedHenGiao.customFrom}`}
                {appliedHenGiao.preset === "custom" &&
                  appliedHenGiao.customTo &&
                  ` → ${appliedHenGiao.customTo}`}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedHenGiao: EMPTY_DATE,
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            )}
            {appliedNhaKhoa && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <StoreIcon sx={{ fontSize: 11 }} />
                {appliedNhaKhoa.name}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedNhaKhoa: null,
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            )}
            {appliedBenhNhan && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <PersonIcon sx={{ fontSize: 11 }} />
                {appliedBenhNhan.name}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedBenhNhan: null,
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            )}
            {appliedTrangThai.map((status) => (
              <span
                key={status}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {status}
                <button
                  onClick={() => {
                    dispatch(setDonHangPageFilter({
                      appliedTrangThai: appliedTrangThai.filter((s) => s !== status),
                    }));
                    setPage(1);
                  }}
                  className="ml-0.5 hover:text-blue-900 flex items-center"
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-10">Lỗi: {error}</div>
      ) : (
        <>
          <DonHangTable
            data={filteredDonHangs}
            selectedId={selectedDonHangId}
            onRowClick={handleRowClick}
          />
          <div className="bg-gray-50 border-t px-3 py-2 text-xs text-gray-500">
            Hiển thị {filteredDonHangs.length} / {pagination?.total || 0} đơn
            hàng
          </div>
          {loadingMore && (
            <div className="text-center py-3 text-gray-400 text-sm">
              Đang tải thêm...
            </div>
          )}
          <div ref={sentinelRef} className="h-4" />
        </>
      )}

      <DonHangDetailPanel
        donHang={selectedDonHang}
        onClose={() => setSelectedDonHangId(null)}
      />

      <Modal open={openExport} onClose={handleCloseExport}>
        <Box sx={{ ...exportModalStyle, maxWidth: 650 }}>
          <Typography
            variant="h6"
            className="font-bold text-blue-700 mb-2 flex items-center gap-2"
          >
            <DownloadIcon sx={{ fontSize: 24 }} />
            Xuất Excel Đơn Hàng
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Stack spacing={4}>
            {/* KHỐI 1: LỌC THEO THỜI GIAN */}
            <Box>
              <Typography
                variant="subtitle2"
                className="font-semibold text-gray-800 mb-4 border-b pb-1"
              >
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
              <Typography
                variant="subtitle2"
                className="font-semibold text-gray-800 mb-3 border-b pb-1"
              >
                Lọc theo đối tượng / trạng thái
              </Typography>
              <Stack spacing={2.5}>
                {/* Trạng thái */}
                <Box>
                  <Typography
                    variant="caption"
                    className="font-semibold text-gray-700 mb-1 block"
                  >
                    Trạng thái (chọn nhiều)
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      multiple
                      displayEmpty
                      value={exportTrangThai}
                      onChange={(e) => setExportTrangThai(e.target.value)}
                      renderValue={(selected) => {
                        if (!selected || selected.length === 0)
                          return (
                            <span className="text-gray-500">
                              -- Tất cả trạng thái --
                            </span>
                          );
                        return (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {selected.map((item) => {
                              const label =
                                EXPORT_STATUS_OPTIONS.find(
                                  (s) => s.value === item
                                )?.label || item;
                              return (
                                <Chip
                                  key={item}
                                  size="small"
                                  label={label}
                                  color="primary"
                                  variant="outlined"
                                />
                              );
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
                  <Typography
                    variant="caption"
                    className="font-semibold text-gray-700 mb-1 block"
                  >
                    Nha khoa
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={exportNhaKhoa}
                      onChange={(e) => setExportNhaKhoa(e.target.value)}
                      displayEmpty
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 300 } },
                        container:
                          typeof document !== "undefined"
                            ? document.body
                            : undefined,
                      }}
                    >
                      <MenuItem value="">
                        <span className="text-gray-500">
                          -- Tất cả nha khoa --
                        </span>
                      </MenuItem>
                      {nhaKhoaOptions.map((nk) => (
                        <MenuItem key={nk._id} value={nk._id}>
                          {nk.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Bệnh nhân */}
                <Box>
                  <Typography
                    variant="caption"
                    className="font-semibold text-gray-700 mb-1 block"
                  >
                    Bệnh nhân
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={exportBenhNhan}
                      onChange={(e) => setExportBenhNhan(e.target.value)}
                      displayEmpty
                      MenuProps={{
                        PaperProps: { style: { maxHeight: 300 } },
                        container:
                          typeof document !== "undefined"
                            ? document.body
                            : undefined,
                      }}
                    >
                      <MenuItem value="">
                        <span className="text-gray-500">
                          -- Tất cả bệnh nhân --
                        </span>
                      </MenuItem>
                      {benhNhanOptions.map((bn) => (
                        <MenuItem key={bn._id} value={bn._id}>
                          {bn.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </Box>
          </Stack>

          {/* FOOTER: NÚT THAO TÁC */}
          <Box className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseExport}
            >
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
