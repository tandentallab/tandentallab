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
  TablePagination,
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

import { fetchAllHoaDonAdmin } from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import ThongKeCongNo from "./ThongKeCongNo";
import HoaDonFilterDrawer from "./HoaDonFilterDrawer";
import HoaDonTable from "./HoaDonTable";
import ExportDateSelector from "../common/ExportDateSelector";
import { exportHoaDonListToExcel } from "../../utils/exportToExcel";
import { api } from "../../config/api";
import {
  EMPTY_EXPORT_DATE_FILTER,
  toISODateRange,
  isValidExportDateFilter,
} from "../../utils/exportDatePresets";

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
  { key: "last_week", label: "Tuần trước" },
  { key: "last_month", label: "Tháng trước" },
  { key: "last_year", label: "Năm trước" },
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

  // =====================================================================
  // KHAI BÁO STATE TỪ SESSION STORAGE (GIỮ BỘ LỌC CỨNG KHI CHUYỂN TRANG)
  // =====================================================================
  const [page, setPage] = useState(
    () => Number(sessionStorage.getItem("hd_page")) || 0
  );
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [appliedNgayXuat, setAppliedNgayXuat] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedNgayXuat");
    return saved ? JSON.parse(saved) : EMPTY_DATE;
  });

  // 🔥 Kéo chạm đáy thì tăng giới hạn lên lấy thêm 50 dòng nữa
  const handleLoadMore = () => {
    if (!loading && danhSachHoaDon.length < (pagination?.total || 0)) {
      setRowsPerPage((prev) => prev + 50);
    }
  };

  const [appliedNhaKhoa, setAppliedNhaKhoa] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedNhaKhoa");
    return saved ? JSON.parse(saved) : null;
  });

  const [appliedTrangThai, setAppliedTrangThai] = useState(() => {
    const saved = sessionStorage.getItem("hd_appliedTrangThai");
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState(
    () => sessionStorage.getItem("hd_searchTerm") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // 🔥 LƯU TRẠNG THÁI VÀO SESSION KHI CÓ THAY ĐỔI
  useEffect(() => {
    sessionStorage.setItem("hd_page", page.toString());
  }, [page]);
  useEffect(() => {
    sessionStorage.setItem(
      "hd_appliedNgayXuat",
      JSON.stringify(appliedNgayXuat)
    );
  }, [appliedNgayXuat]);
  useEffect(() => {
    sessionStorage.setItem("hd_appliedNhaKhoa", JSON.stringify(appliedNhaKhoa));
  }, [appliedNhaKhoa]);
  useEffect(() => {
    sessionStorage.setItem(
      "hd_appliedTrangThai",
      JSON.stringify(appliedTrangThai)
    );
  }, [appliedTrangThai]);
  useEffect(() => {
    sessionStorage.setItem("hd_searchTerm", searchTerm);
  }, [searchTerm]);
  // =====================================================================
  const [openFilter, setOpenFilter] = useState(false);
  const filterContainerRef = useRef(null);

  const [openExport, setOpenExport] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState(
    EMPTY_EXPORT_DATE_FILTER
  );
  const [exportNhaKhoa, setExportNhaKhoa] = useState("");
  const [exportTrangThai, setExportTrangThai] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

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
  ]);

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

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async () => {
    const hasManualDateRange = exportFrom && exportTo;
    const hasPresetDateRange = isValidExportDateFilter(exportDateFilter);

    if (!hasManualDateRange && !hasPresetDateRange) {
      toast.error(
        "Vui lòng chọn khoảng thời gian (thủ công hoặc từ danh sách)."
      );
      return;
    }

    try {
      setExporting(true);

      let fromISO, toISO;
      if (hasManualDateRange) {
        fromISO = new Date(exportFrom).toISOString();
        toISO = new Date(`${exportTo}T23:59:59`).toISOString();
      } else {
        const dateRange = toISODateRange(exportDateFilter);
        fromISO = dateRange.fromISO;
        toISO = dateRange.toISO;
      }

      const res = await api.get("/hoa-don/all", {
        params: {
          page: 1,
          limit: 5000,
          fromDate: fromISO,
          toDate: toISO,
          nhaKhoaId: exportNhaKhoa || "",
        },
      });

      let data = res.data?.data || [];
      if (exportTrangThai.length > 0) {
        data = data.filter((hd) => exportTrangThai.includes(hd.trangThai));
      }

      const selectedNk = (nhaKhoa?.data || []).find(
        (nk) => nk._id === exportNhaKhoa
      );
      await exportHoaDonListToExcel(data, {
        fromDate: fromISO,
        toDate: toISO,
        nhaKhoaName: selectedNk?.hoVaTen || selectedNk?.tenGiaoDich || "Tất cả",
      });
      setOpenExport(false);
    } catch (err) {
      toast.error(
        `Xuất Excel thất bại: ${err?.response?.data?.message || err.message}`
      );
    } finally {
      setExporting(false);
    }
  };

  const isFiltered =
    !!appliedNgayXuat.preset || !!appliedNhaKhoa || appliedTrangThai.length > 0;

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
                    background-color: #ffffff;
                }
                `}
      </style>

      {/* DÒNG 1: THỐNG KÊ */}
      <div className="shrink-0">
        <ThongKeCongNo
          onCardClick={(type) => {
            // Nếu bấm vào ô "Còn nợ" (màu xanh lá bên trái)
            if (type === "conNo") {
              // Cập nhật state bộ lọc bằng đúng 2 trạng thái nợ trong DB
              setAppliedTrangThai(["Chưa thanh toán", "Thanh toán một phần"]);
              setPage(0); // Reset về trang 1
            }

            // (Tùy chọn) Sau này nếu sếp thích bấm ô "Quá hạn" hay "Chưa đến hạn"
            // thì bạn có thể code thêm logic lọc ngày ở đây rất dễ dàng
          }}
        />
      </div>

      {/* DÒNG 2: TOOLBAR & BỘ LỌC (HIỂN THỊ NGANG TRÊN 1 DÒNG) */}
      <div className="shrink-0 rounded-t-lg bg-white shadow-sm relative z-30 border-b border-gray-100">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 px-4 py-2 min-h-[56px]">
          {/* BÊN TRÁI: NÚT LỌC VÀ CÁC THẺ LỌC GOM NHÓM */}
          <div className="flex flex-wrap items-center gap-3 flex-1 w-full xl:w-auto">
            <div className="relative" ref={filterContainerRef}>
              <Tooltip title="Bộ lọc">
                <IconButton
                  onClick={() => setOpenFilter(!openFilter)}
                  size="small"
                  className={`transition-colors ${
                    openFilter ? "bg-blue-50" : ""
                  }`}
                  sx={{
                    color: isFiltered ? "#1976d2" : "#555",
                    p: "8px",
                    position: "relative",
                  }}
                >
                  <FilterListIcon fontSize="small" />
                  {isFiltered && (
                    <span
                      className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 border border-white"
                      style={{ pointerEvents: "none" }}
                    />
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
                  setPage(0);
                }}
              />
            </div>

            {/* HIỂN THỊ CÁC BỘ LỌC ĐÃ CHỌN (NẰM NGANG VÀ GOM NHÓM) */}
            {isFiltered && (
              <div className="flex flex-wrap items-center gap-3 border-l-2 border-gray-100 pl-3">
                {/* 1. NHÓM LỌC: THỜI GIAN */}
                {appliedNgayXuat.preset && (
                  <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-800">
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      {appliedNgayXuat.preset === "custom"
                        ? `${appliedNgayXuat.customFrom || "?"} → ${
                            appliedNgayXuat.customTo || "?"
                          }`
                        : DATE_PRESETS.find(
                            (p) => p.key === appliedNgayXuat.preset
                          )?.label || appliedNgayXuat.preset}
                    </div>
                    <button
                      onClick={() => {
                        setAppliedNgayXuat(EMPTY_DATE);
                        setPage(0);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-blue-200 text-blue-500 hover:text-red-600 transition-colors"
                      title="Xóa bộ lọc ngày"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}

                {/* 2. NHÓM LỌC: NHA KHOA */}
                {appliedNhaKhoa && (
                  <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm">
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-indigo-800">
                      <StoreIcon sx={{ fontSize: 16 }} />
                      {appliedNhaKhoa.name}
                    </div>
                    <button
                      onClick={() => {
                        setAppliedNhaKhoa(null);
                        setPage(0);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-indigo-200 text-indigo-500 hover:text-red-600 transition-colors"
                      title="Xóa bộ lọc nha khoa"
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </button>
                  </div>
                )}

                {/* 3. NHÓM LỌC: TRẠNG THÁI (Gom các trạng thái vào 1 div) */}
                {appliedTrangThai.length > 0 && (
                  <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm">
                    <span className="text-[13px] font-semibold text-emerald-800 mr-1">
                      Trạng thái:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {appliedTrangThai.map((tt) => (
                        <span
                          key={tt}
                          className="flex items-center bg-white border border-emerald-200 rounded-md pl-2.5 text-[12px] font-medium text-emerald-700 shadow-sm overflow-hidden"
                        >
                          {tt}
                          <button
                            onClick={() => {
                              setAppliedTrangThai((prev) =>
                                prev.filter((x) => x !== tt)
                              );
                              setPage(0);
                            }}
                            className="w-6 h-6 ml-2 flex items-center justify-center bg-emerald-50 hover:bg-red-100 hover:text-red-600 text-emerald-600 transition-colors border-l border-emerald-100"
                            title={`Bỏ chọn ${tt}`}
                          >
                            <CloseIcon sx={{ fontSize: 14 }} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BÊN PHẢI: TÌM KIẾM & CÁC NÚT ACTION */}
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
            <TextField
              size="small"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                width: 220,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "#f5f5f5",
                  fontSize: "0.85rem",
                  "& fieldset": { border: "none" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={15} style={{ color: "#9e9e9e" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Tạo hóa đơn">
              <IconButton
                onClick={() => navigate("/cho-xuat-hoa-don")}
                className="bg-[#4CAF50] text-white w-8 h-8 hover:bg-[#388E3C] flex items-center justify-center rounded-full"
              >
                <AddIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xuất Excel">
              <IconButton onClick={() => setOpenExport(true)} size="small">
                <ExcelIcon sx={{ fontSize: 22, color: "#1b7a34" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Làm mới">
              <IconButton
                onClick={() => dispatch(fetchAllHoaDonAdmin())}
                size="small"
                sx={{ color: "#555" }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton size="small" sx={{ color: "#555" }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* DÒNG 3: BẢNG DỮ LIỆU & PHÂN TRANG */}
      {/* ĐÃ SỬA: Xóa thuộc tính style chứa calc() đi, chỉ giữ lại flex-1 min-h-0 */}
      <div className="flex-1 min-h-0 bg-white rounded-b-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden custom-scrollbar table-wrapper">
        {/* Khu vực bảng dữ liệu: Sẽ tự động lấy hết khoảng trống bên trong và cuộn */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <HoaDonTable
            danhSachHoaDon={danhSachHoaDon}
            loading={loading}
            onLoadMore={handleLoadMore}
          />
        </div>

        {/* Khu vực trạng thái dòng: Đóng đinh cứng ở dưới đáy */}
        <div className="border-t border-gray-200 bg-gray-50/80 backdrop-blur-sm shrink-0 z-10 relative px-5 py-2.5 flex items-center justify-end text-[13px] text-gray-600">
          <div>
            {danhSachHoaDon.length < (pagination?.total || 0) ? (
              <span>
                Số dòng:{" "}
                <span className="font-bold text-gray-900">
                  {danhSachHoaDon.length}
                </span>{" "}
                / {pagination?.total}
                <span className=" text-gray-500 ml-1.5">
                  (cuộn để tải thêm)
                </span>
              </span>
            ) : (
              <span>
                Số dòng:{" "}
                <span className="font-bold text-gray-900">
                  {danhSachHoaDon.length}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MODAL XUẤT EXCEL GIỮ NGUYÊN */}
      <Modal open={openExport} onClose={() => setOpenExport(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] max-w-[500px] bg-white shadow-xl p-6 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2">
            <ExcelIcon sx={{ fontSize: 24, color: "#1b7a34" }} />
            Xuất Excel Hóa Đơn
          </h3>
          <hr className="mb-4 border-gray-100" />

          <div className="flex flex-col gap-5">
            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">
                Khoảng thời gian
              </p>
              <div className="flex gap-3 mb-2">
                <div className="w-full">
                  <span className="text-xs text-gray-500 mb-1 block">
                    Từ ngày
                  </span>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={exportFrom}
                    onChange={(e) => setExportFrom(e.target.value)}
                  />
                </div>
                <div className="w-full">
                  <span className="text-xs text-gray-500 mb-1 block">
                    Đến ngày
                  </span>
                  <TextField
                    type="date"
                    fullWidth
                    size="small"
                    value={exportTo}
                    onChange={(e) => setExportTo(e.target.value)}
                  />
                </div>
              </div>
              <ExportDateSelector
                title="Ngày xuất hóa đơn"
                value={exportDateFilter}
                onChange={setExportDateFilter}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">
                Nha khoa
              </p>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={exportNhaKhoa}
                  onChange={(e) => setExportNhaKhoa(e.target.value)}
                >
                  <MenuItem value="">-- Tất cả nha khoa --</MenuItem>
                  {Array.isArray(nhaKhoa?.data) &&
                    nhaKhoa.data.map((nk) => (
                      <MenuItem key={nk._id} value={nk._id}>
                        {nk.hoVaTen || nk.tenGiaoDich}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2 text-gray-800">
                Trạng thái (chọn nhiều)
              </p>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  displayEmpty
                  value={exportTrangThai}
                  onChange={(e) => setExportTrangThai(e.target.value)}
                  renderValue={(selected) => {
                    if (selected.length === 0)
                      return (
                        <span className="text-gray-400">
                          -- Tất cả trạng thái --
                        </span>
                      );
                    return (
                      <div className="flex flex-wrap gap-1">
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={value}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </div>
                    );
                  }}
                >
                  <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
                  <MenuItem value="Thanh toán một phần">
                    Thanh toán một phần
                  </MenuItem>
                  <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setOpenExport(false);
                setExportDateFilter(EMPTY_EXPORT_DATE_FILTER);
                setExportNhaKhoa("");
                setExportTrangThai([]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1b7a34] rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
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
