import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPhieuThu } from "../../redux/slices/phieuThuSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import PhieuThuModal from "./PhieuThuModal";
import PhieuThuDetailPanel from "./PhieuThuDetailPanel";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StoreIcon from "@mui/icons-material/Store";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from "@mui/icons-material/Download";
import { api } from "../../config/api";
import { exportPhieuThuToExcel } from "../../utils/exportToExcel";
import ExportDateSelector from "../common/ExportDateSelector";
import CustomDateRangePicker from "../common/CustomDateRangePicker"; // 🔥 IMPORT LỊCH XỊN
import dayjs from "dayjs"; // 🔥 IMPORT DAYJS
import {
    EMPTY_EXPORT_DATE_FILTER,
    toISODateRange,
    isValidExportDateFilter
} from "../../utils/exportDatePresets";
import { toast } from "sonner";

const formatCurrency = (value) =>
    (value || 0).toLocaleString('vi-VN');

const formatSoPhieu = (id) =>
    id ? "TAN" + id.toString().slice(-8).toUpperCase() : "-";

const formatDateTime = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
};

// 🔥 ĐÃ DỌN DẸP PRESETS THỪA
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
        case "last_7": { const f = new Date(today); f.setDate(f.getDate() - 7); return { from: f, to: tomorrow }; }
        case "last_10": { const f = new Date(today); f.setDate(f.getDate() - 10); return { from: f, to: tomorrow }; }
        case "last_30": { const f = new Date(today); f.setDate(f.getDate() - 30); return { from: f, to: tomorrow }; }
        default: return { from: null, to: null };
    }
};

const ROWS_PER_PAGE = 20;
const EMPTY_DATE = { preset: null, customFrom: "", customTo: "" };

export default function PhieuThuPage() {
    const dispatch = useDispatch();
    const { danhSach, pagination, loading } = useSelector((s) => s.phieuThu);
    const nhaKhoaList = useSelector((s) => s.nhaKhoa.data) ?? [];

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedPhieuThu, setSelectedPhieuThu] = useState(null);

    // Applied filter (drives API calls)
    const [appliedNgayThu, setAppliedNgayThu] = useState(EMPTY_DATE);
    const [appliedNhaKhoa, setAppliedNhaKhoa] = useState(null); // { _id, name }

    // Filter panel UI
    const [showFilter, setShowFilter] = useState(false);
    const [draftNgayThu, setDraftNgayThu] = useState(EMPTY_DATE);
    const [draftNhaKhoa, setDraftNhaKhoa] = useState(null);
    const [openDateModal, setOpenDateModal] = useState(null);
    const [openPickerModal, setOpenPickerModal] = useState(null);
    const [nhaKhoaSearch, setNhaKhoaSearch] = useState("");
    const filterRef = useRef(null);

    // Export UI
    const [openExport, setOpenExport] = useState(false);
    const [exportDateFilter, setExportDateFilter] = useState(EMPTY_EXPORT_DATE_FILTER);
    const [exportNhaKhoa, setExportNhaKhoa] = useState("");
    const [exporting, setExporting] = useState(false);

    // 🔥 STATE ĐỂ NEO TỜ LỊCH CUSTOM TRONG MENU LỌC BẢNG
    const [anchorElCustomDate, setAnchorElCustomDate] = useState(null);

    useEffect(() => { dispatch(fetchNhaKhoa()); }, [dispatch]);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    useEffect(() => {
        const handleClick = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                if (e.target.closest?.('.MuiPopover-root, .MuiMenu-root, .MuiModal-root')) return;
                setShowFilter(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleOpenFilter = () => {
        setDraftNgayThu(appliedNgayThu);
        setDraftNhaKhoa(appliedNhaKhoa);
        setOpenDateModal(null);
        setOpenPickerModal(null);
        setNhaKhoaSearch("");
        setShowFilter(true);
    };

    const getApiDates = useCallback((preset, from, to) => {
        if (!preset) return { dateFrom: "", dateTo: "" };
        if (preset === "custom") {
            return {
                dateFrom: from ? new Date(from).toISOString() : "",
                dateTo: to ? new Date(to + "T23:59:59").toISOString() : "",
            };
        }
        const { from: f, to: t } = getDateRange(preset);
        return { dateFrom: f ? f.toISOString() : "", dateTo: t ? t.toISOString() : "" };
    }, []);

    const loadData = useCallback(() => {
        const { dateFrom, dateTo } = getApiDates(appliedNgayThu.preset, appliedNgayThu.customFrom, appliedNgayThu.customTo);
        dispatch(fetchAllPhieuThu({
            page, limit: ROWS_PER_PAGE, search: debouncedSearch,
            nhaKhoaId: appliedNhaKhoa?._id || "",
            dateFrom, dateTo,
        }));
    }, [dispatch, page, debouncedSearch, appliedNgayThu, appliedNhaKhoa, getApiDates]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleRefresh = () => {
        setSearchTerm(""); setDebouncedSearch("");
        setAppliedNgayThu(EMPTY_DATE); setAppliedNhaKhoa(null);
        setPage(1);
    };

    const handleApplyFilters = () => {
        setAppliedNgayThu(draftNgayThu);
        setAppliedNhaKhoa(draftNhaKhoa);
        setPage(1);
        setOpenDateModal(null);
        setOpenPickerModal(null);
        setShowFilter(false);
    };

    const handleResetDraft = () => {
        setDraftNgayThu(EMPTY_DATE); setDraftNhaKhoa(null);
    };

    const handleRowClick = (pt) => setSelectedPhieuThu((prev) => (prev?._id === pt._id ? null : pt));

    const handlePanelUpdated = (updated) => {
        if (updated) setSelectedPhieuThu((prev) => prev ? { ...prev, ...updated } : prev);
        loadData();
    };

    const handleExportExcel = async () => {
        const isPreset = exportDateFilter?.preset && exportDateFilter.preset !== "custom";
        const isCustom = exportDateFilter?.preset === "custom" && exportDateFilter?.startDate && exportDateFilter?.endDate;

        if (!isPreset && !isCustom) {
            toast.error("Vui lòng chọn khoảng thời gian xuất Excel.");
            return;
        }

        try {
            setExporting(true);

            let fromISO, toISO;
            if (isCustom) {
                fromISO = new Date(exportDateFilter.startDate).toISOString();
                toISO = new Date(`${exportDateFilter.endDate}T23:59:59`).toISOString();
            } else {
                const dateRange = toISODateRange(exportDateFilter);
                fromISO = dateRange.fromISO;
                toISO = dateRange.toISO;
            }

            const res = await api.get("/phieu-thu", {
                params: {
                    page: 1,
                    limit: 5000,
                    search: "",
                    nhaKhoaId: exportNhaKhoa || "",
                    dateFrom: fromISO,
                    dateTo: toISO,
                },
            });

            const data = res.data?.data || [];
            const selectedNk = nhaKhoaList.find((nk) => nk._id === exportNhaKhoa);

            await exportPhieuThuToExcel(data, {
                fromDate: fromISO,
                toDate: toISO,
                nhaKhoaName: selectedNk?.hoVaTen || selectedNk?.tenGiaoDich || "Tất cả",
            });

            setOpenExport(false);
        } catch (err) {
            toast.error(`Xuất Excel thất bại: ${err?.response?.data?.message || err.message}`);
        } finally {
            setExporting(false);
        }
    };

    const filteredNhaKhoaOpts = nhaKhoaList
        .map((nk) => ({ _id: nk._id, name: nk.tenGiaoDich || nk.hoVaTen || "" }))
        .filter((nk) => !nhaKhoaSearch.trim() || nk.name.toLowerCase().includes(nhaKhoaSearch.toLowerCase()));

    const getDateLabel = (f) => DATE_PRESETS.find((p) => p.key === f.preset)?.label || "";
    const isFiltered = !!appliedNgayThu.preset || !!appliedNhaKhoa;
    const totalPages = pagination.totalPages || 1;

    // 🔥 GIAO DIỆN LỌC NGÀY ĐÃ ĐƯỢC CẬP NHẬT GIỐNG HOÁ ĐƠN
    const renderDateDropdown = (cf, scf) => (
        <div className="absolute left-2 top-full z-[100] w-[90%] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {DATE_PRESETS.map((p) => (
                <div key={p.key}>
                    <button
                        onClick={(e) => {
                            scf((prev) => ({ ...prev, preset: prev.preset === p.key ? null : p.key }));
                            if (!p.isCalendar) {
                                setOpenDateModal(null);
                            } else {
                                if (cf.preset !== p.key) {
                                    setAnchorElCustomDate(e.currentTarget);
                                }
                            }
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 border-b border-gray-100 transition ${cf.preset === p.key ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                        {p.isCalendar && <CalendarTodayIcon sx={{ fontSize: 14 }} />}
                        {p.label}
                    </button>
                    {p.isCalendar && cf.preset === "custom" && (
                        <div className="px-4 py-3 bg-blue-50/30 border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={(e) => setAnchorElCustomDate(e.currentTarget)}
                                className="w-full h-9 px-2 flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                {cf.customFrom && cf.customTo
                                    ? `${dayjs(cf.customFrom).format('DD/MM/YYYY')} - ${dayjs(cf.customTo).format('DD/MM/YYYY')}`
                                    : "📅 Bấm để chọn ngày..."}
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* LẮP POP-UP LỊCH VÀ BẬT LOGIC "BẤM PHÁT ĂN LUÔN" */}
            <CustomDateRangePicker
                open={Boolean(anchorElCustomDate)}
                anchorEl={anchorElCustomDate}
                onClose={() => setAnchorElCustomDate(null)}
                initialDates={{
                    start: cf.customFrom,
                    end: cf.customTo,
                }}
                onApply={(dates) => {
                    const newNgayThu = {
                        preset: "custom",
                        customFrom: dates.start,
                        customTo: dates.end,
                    };

                    // Cập nhật State đóng lịch
                    setAnchorElCustomDate(null);
                    scf(newNgayThu);

                    // 🔥 BÙM! Lọc bảng & Tắt menu ngay lập tức
                    setAppliedNgayThu(newNgayThu);
                    setAppliedNhaKhoa(draftNhaKhoa);
                    setPage(1);
                    setOpenDateModal(null);
                    setOpenPickerModal(null);
                    setShowFilter(false);
                }}
            />
        </div>
    );

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Toolbar */}
            <div className="mb-4 bg-white rounded shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3">

                    {/* Left: filter icon + title */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={handleOpenFilter}
                                title="Bộ lọc"
                                className={`relative p-1.5 rounded transition ${isFiltered ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-500 hover:bg-gray-100"}`}
                            >
                                <FilterAltIcon sx={{ fontSize: 20 }} />

                                {isFiltered && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
                            </button>

                            {/* Filter dropdown */}
                            {showFilter && (
                                <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-200" onClick={() => { setOpenDateModal(null); setOpenPickerModal(null); }}>

                                    {/* Ngày thu */}
                                    <div className="relative border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm"
                                            onClick={() => { setOpenPickerModal(null); setOpenDateModal(openDateModal === "ngayThu" ? null : "ngayThu"); }}
                                        >
                                            <span className={draftNgayThu.preset ? "text-blue-600 font-medium" : "text-gray-600"}>
                                                {draftNgayThu.preset ? getDateLabel(draftNgayThu) : "Ngày thu"}
                                            </span>
                                            <CalendarTodayIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                                        </button>
                                        {openDateModal === "ngayThu" && renderDateDropdown(draftNgayThu, setDraftNgayThu)}
                                    </div>

                                    {/* Nha khoa */}
                                    <div className="relative border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
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
                                                onClick={() => { setOpenDateModal(null); setNhaKhoaSearch(""); setOpenPickerModal("nhaKhoa"); }}
                                            >
                                                <span className={draftNhaKhoa ? "text-blue-600 font-medium truncate" : "text-gray-400"}>
                                                    {draftNhaKhoa ? draftNhaKhoa.name : "Nha khoa"}
                                                </span>
                                            </button>
                                        )}
                                        {openPickerModal === "nhaKhoa" && (
                                            <div className="absolute left-2 top-full z-[100] w-[90%] bg-white rounded-xl shadow-xl border border-gray-200 max-h-56 overflow-y-auto">
                                                {draftNhaKhoa && (
                                                    <button onClick={() => { setDraftNhaKhoa(null); setOpenPickerModal(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 border-b border-gray-100 transition">
                                                        Bỏ chọn
                                                    </button>
                                                )}
                                                {filteredNhaKhoaOpts.map((item) => (
                                                    <button key={item._id} onClick={() => { setDraftNhaKhoa(item); setOpenPickerModal(null); }}
                                                        className={`w-full text-left px-4 py-2 text-sm border-b border-gray-50 transition ${draftNhaKhoa?._id === item._id ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
                                                        {item.name}
                                                    </button>
                                                ))}
                                                {filteredNhaKhoaOpts.length === 0 && <p className="text-center text-xs text-gray-400 py-4">Không tìm thấy</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom buttons */}
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <button onClick={handleResetDraft} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition" title="Reset lọc">
                                            <RefreshIcon sx={{ fontSize: 20 }} />
                                        </button>
                                        <button onClick={handleApplyFilters} className="flex items-center gap-1 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition shadow-sm">
                                            ✓ Lưu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <h2 className="text-base font-semibold text-gray-700">Phiếu Thu</h2>
                    </div>

                    {/* Right: search + add + refresh */}
                    <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
                        <div className="relative flex items-center flex-1 sm:flex-none">
                            <span className="absolute left-2.5 text-gray-400 flex items-center pointer-events-none">
                                <SearchIcon sx={{ fontSize: 16 }} />
                            </span>
                            <input
                                type="text"
                                placeholder="Tìm phiếu thu, khách hàng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border bg-gray-50 pl-8 pr-8 py-1.5 rounded-full w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm("")} className="absolute right-2.5 text-gray-400 hover:text-gray-600 flex items-center">
                                    <CloseIcon sx={{ fontSize: 15 }} />
                                </button>
                            )}
                        </div>
                        <button onClick={() => setOpenModal(true)} title="Thêm phiếu thu"
                            className="bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-8 h-8 shadow-sm">
                            <AddIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            onClick={() => setOpenExport(true)}
                            title="Xuất Excel"
                            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition"
                        >
                            <DownloadIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button onClick={handleRefresh} title="Tải lại" className="text-gray-600 hover:bg-gray-100 p-1.5 rounded">
                            <RefreshIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>

                {/* Active filter chips */}
                {isFiltered && (
                    <div className="flex items-center gap-2 px-3 pb-2.5 flex-wrap">
                        {appliedNgayThu.preset && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                                {getDateLabel(appliedNgayThu)}
                                {appliedNgayThu.preset === "custom" && appliedNgayThu.customFrom && ` ${dayjs(appliedNgayThu.customFrom).format('DD/MM/YYYY')}`}
                                {appliedNgayThu.preset === "custom" && appliedNgayThu.customTo && ` → ${dayjs(appliedNgayThu.customTo).format('DD/MM/YYYY')}`}
                                <button
                                    onClick={() => { setAppliedNgayThu(EMPTY_DATE); setPage(1); }}
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
                                    onClick={() => { setAppliedNhaKhoa(null); setPage(1); }}
                                    className="ml-0.5 hover:text-blue-900 flex items-center"
                                >
                                    <CloseIcon sx={{ fontSize: 12 }} />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow-sm overflow-hidden border">
                {/* ── MOBILE: Card list (hidden sm+) ── */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {loading ? (
                        <p className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu...</p>
                    ) : danhSach.length === 0 ? (
                        <p className="text-center py-10 text-gray-400 text-sm">Không có dữ liệu</p>
                    ) : (
                        danhSach.map((pt) => (
                            <div
                                key={pt._id}
                                onClick={() => handleRowClick(pt)}
                                className={`px-4 py-3 cursor-pointer transition-colors ${selectedPhieuThu?._id === pt._id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                            >
                                {/* Row 1: số phiếu + số tiền */}
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-blue-700 text-sm">
                                        {pt.soPhieuThu || formatSoPhieu(pt._id)}
                                    </span>
                                    <span className="font-semibold text-green-700 text-sm">
                                        {formatCurrency(pt.soTienThu)}
                                    </span>
                                </div>
                                {/* Row 2: khách hàng */}
                                <p className="text-sm text-gray-800 font-medium truncate">
                                    {pt.nhaKhoaInfo?.hoVaTen || pt.nhaKhoaInfo?.tenGiaoDich || "—"}
                                </p>
                                {/* Row 3: ngày thu · phương thức */}
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-400">{formatDateTime(pt.ngayThu)}</span>
                                    {pt.phuongThucThanhToan && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pt.phuongThucThanhToan === "Chuyển khoản" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                            {pt.phuongThucThanhToan}
                                        </span>
                                    )}
                                </div>
                                {/* Row 4: nội dung (nếu có) */}
                                {pt.noiDung && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{pt.noiDung}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* ── DESKTOP: Table (hidden on mobile) ── */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm text-left whitespace-nowrap">
                        <thead className="bg-blue-50 text-blue-600 font-medium border-b sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-base ">Số phiếu</th>
                                <th className="px-4 py-3 text-base ">Khách hàng</th>
                                <th className="px-4 py-3 text-base ">Ngày thu</th>
                                <th className="px-4 py-3 text-base text-right">Số tiền thu</th>
                                <th className="px-4 py-3 text-base  hidden md:table-cell">Nội dung thu</th>
                                <th className="px-4 py-3 text-base  hidden sm:table-cell">Phương thức</th>
                                <th className="px-4 py-3 text-base  hidden lg:table-cell">Người tạo</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                            ) : danhSach.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không có dữ liệu</td></tr>
                            ) : (
                                danhSach.map((pt) => (
                                    <tr
                                        key={pt._id}
                                        onClick={() => handleRowClick(pt)}
                                        className={`border-b cursor-pointer transition-colors ${selectedPhieuThu?._id === pt._id ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50"}`}
                                    >
                                        <td className="px-4 py-3 text-base  font-semibold text-blue-700">{pt.soPhieuThu || formatSoPhieu(pt._id)}</td>
                                        <td className="px-4 py-3 text-base ">{pt.nhaKhoaInfo?.hoVaTen || pt.nhaKhoaInfo?.tenGiaoDich || "-"}</td>
                                        <td className="px-4 py-3 text-base ">{formatDateTime(pt.ngayThu)}</td>
                                        <td className="px-4 py-3 text-base  text-right font-semibold text-green-700">{formatCurrency(pt.soTienThu)}</td>
                                        <td className="px-4 py-3 text-base  max-w-[200px] truncate hidden md:table-cell" title={pt.noiDung}>{pt.noiDung || " "}</td>
                                        <td className="px-4 py-3 text-base  hidden sm:table-cell">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pt.phuongThucThanhToan === "Chuyển khoản" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                                {pt.phuongThucThanhToan || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">{pt.nguoiTaoInfo?.HoTenNV || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 border-t p-3 flex justify-between items-center text-sm text-gray-600">
                    <span>Tổng: {pagination.total || 0} phiếu thu</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">← Trước</button>
                        <span className="text-xs">Trang {page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Sau →</button>
                    </div>
                </div>
            </div>

            <PhieuThuModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={loadData} />

            <PhieuThuDetailPanel
                phieuThu={selectedPhieuThu}
                onClose={() => setSelectedPhieuThu(null)}
                onUpdated={handlePanelUpdated}
            />

            {openExport && (
                <div className="fixed inset-0 z-[1200] flex items-start justify-center pt-24">
                    <div className="fixed inset-0 bg-black/40" onClick={() => setOpenExport(false)} />
                    <div className="relative w-full max-w-3xl bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-visible">
                        <div className="bg-[#1ea4e8] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white text-base font-semibold">Xuất excel</h3>
                            <button className="text-white" onClick={() => setOpenExport(false)}>
                                <CloseIcon sx={{ fontSize: 28 }} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-6 mb-6">
                                <div>
                                    <ExportDateSelector
                                        title="Chọn ngày xuất"
                                        value={exportDateFilter}
                                        onChange={setExportDateFilter}
                                    />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Nha khoa</p>
                                    <select
                                        value={exportNhaKhoa}
                                        onChange={(e) => setExportNhaKhoa(e.target.value)}
                                        className="w-full border-b border-gray-300 bg-transparent py-2 outline-none"
                                    >
                                        <option value="">Tất cả nha khoa</option>
                                        {nhaKhoaList.map((nk) => (
                                            <option key={nk._id} value={nk._id}>
                                                {nk.hoVaTen || nk.tenGiaoDich}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-end">
                                <button
                                    onClick={handleExportExcel}
                                    disabled={exporting}
                                    className="px-6 py-2.5 bg-[#1ea4e8] hover:bg-[#039be5] text-white rounded-full font-semibold shadow disabled:opacity-60"
                                >
                                    {exporting ? "Đang xuất..." : "Tải xuống"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}