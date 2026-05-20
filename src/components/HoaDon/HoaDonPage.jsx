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
            <path d="M7.2 15.5l1.6-2.3 1.6 2.3 1.6-2.3 1.6 2.3" stroke="#fff" strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </SvgIcon>
    );
}

const HoaDonPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { danhSachHoaDon = [], pagination = {}, loading = false } = useSelector((state) => state.hoaDon);
    const nhaKhoa = useSelector((state) => state.nhaKhoa);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filterNgayXuat, setFilterNgayXuat] = useState("");
    const [filterNhaKhoa, setFilterNhaKhoa] = useState("");
    const [filterTrangThai, setFilterTrangThai] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openFilter, setOpenFilter] = useState(false);
    const filterContainerRef = useRef(null);

    const [openExport, setOpenExport] = useState(false);
    const [exportDateFilter, setExportDateFilter] = useState(EMPTY_EXPORT_DATE_FILTER);
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
        dispatch(
            fetchAllHoaDonAdmin({
                page: page + 1,
                limit: rowsPerPage,
                nhaKhoaId: filterNhaKhoa,
                trangThai: filterTrangThai,
                ngayXuat: filterNgayXuat,
                search: debouncedSearch,
            })
        );
    }, [dispatch, page, rowsPerPage, filterNhaKhoa, filterTrangThai, filterNgayXuat, debouncedSearch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterContainerRef.current && !filterContainerRef.current.contains(event.target)) {
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
        if (!exportFrom || !exportTo) return alert("Vui lòng chọn khoảng thời gian để xuất.");
        if (!isValidExportDateFilter(exportDateFilter)) return alert("Vui lòng chọn thời gian bằng preset hoặc Chọn trên lịch.");

        try {
            setExporting(true);
            const fromDate = new Date(exportFrom).toISOString();
            const toDate = new Date(`${exportTo}T23:59:59`).toISOString();
            const { fromISO, toISO } = toISODateRange(exportDateFilter);

            const res = await api.get("/hoa-don/all", {
                params: {
                    page: 1, limit: 5000,
                    fromDate: fromISO || fromDate,
                    toDate: toISO || toDate,
                    nhaKhoaId: exportNhaKhoa || "",
                },
            });

            let data = res.data?.data || [];
            if (exportTrangThai.length > 0) {
                data = data.filter((hd) => exportTrangThai.includes(hd.trangThai));
            }

            const selectedNk = (nhaKhoa?.data || []).find((nk) => nk._id === exportNhaKhoa);
            await exportHoaDonListToExcel(data, {
                fromDate: fromISO || fromDate,
                toDate: toISO || toDate,
                nhaKhoaName: selectedNk?.hoVaTen || selectedNk?.tenGiaoDich || "Tất cả",
            });
            setOpenExport(false);
        } catch (err) {
            alert(`Xuất Excel thất bại: ${err?.response?.data?.message || err.message}`);
        } finally {
            setExporting(false);
        }
    };

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
                <ThongKeCongNo />
            </div>

            {/* DÒNG 2: TOOLBAR */}
            <div className="mt-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-4 rounded-t-lg bg-white p-4 border-b border-gray-100 shadow-sm relative z-30">
                <div className="relative" ref={filterContainerRef}>
                    <Tooltip title="Bộ lọc">
                        <IconButton
                            onClick={() => setOpenFilter(!openFilter)}
                            size="small"
                            className={`transition-colors ${openFilter ? "bg-gray-100" : ""}`}
                            sx={{ color: "#555", p: "8px" }}
                        >
                            <FilterListIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <HoaDonFilterDrawer
                        open={openFilter}
                        onClose={() => setOpenFilter(false)}
                        filterNgayXuat={filterNgayXuat}
                        setFilterNgayXuat={(val) => { setFilterNgayXuat(val); setPage(0); }}
                        filterNhaKhoa={filterNhaKhoa}
                        setFilterNhaKhoa={(val) => { setFilterNhaKhoa(val); setPage(0); }}
                        filterTrangThai={filterTrangThai}
                        setFilterTrangThai={(val) => {
                            const statusString = Array.isArray(val) ? val.join(",") : val;
                            setFilterTrangThai(statusString);
                            setPage(0);
                        }}
                        nhaKhoaList={Array.isArray(nhaKhoa?.data) ? nhaKhoa.data : []}
                        onReset={() => {
                            setFilterNgayXuat("");
                            setFilterNhaKhoa("");
                            setFilterTrangThai("");
                            setPage(0);
                        }}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <TextField
                        size="small"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            width: 220,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "20px", bgcolor: "#f5f5f5", fontSize: "0.85rem", "& fieldset": { border: "none" },
                            },
                        }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon size={15} style={{ color: "#9e9e9e" }} /></InputAdornment>,
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm("")}><ClearIcon sx={{ fontSize: 14 }} /></IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Tooltip title="Tạo hóa đơn">
                        <IconButton onClick={() => navigate("/cho-xuat-hoa-don")} className="bg-[#4CAF50] text-white w-8 h-8 hover:bg-[#388E3C] flex items-center justify-center rounded-full">
                            <AddIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Xuất Excel">
                        <IconButton onClick={() => setOpenExport(true)} size="small">
                            <ExcelIcon sx={{ fontSize: 22, color: "#1b7a34" }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Làm mới">
                        <IconButton onClick={() => dispatch(fetchAllHoaDonAdmin())} size="small" sx={{ color: "#555" }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <IconButton size="small" sx={{ color: "#555" }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </div>
            </div>

            {/* DÒNG 3: BẢNG DỮ LIỆU & PHÂN TRANG */}
            {/* ĐÃ SỬA: Xóa thuộc tính style chứa calc() đi, chỉ giữ lại flex-1 min-h-0 */}
            <div className="flex-1 min-h-0 bg-white rounded-b-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden custom-scrollbar table-wrapper">

                {/* Khu vực bảng dữ liệu: Sẽ tự động lấy hết khoảng trống bên trong và cuộn */}
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    <HoaDonTable danhSachHoaDon={danhSachHoaDon} loading={loading} />
                </div>

                {/* Khu vực phân trang: Đóng đinh cứng ở dưới đáy */}
                <div className="border-t border-gray-100 bg-white shrink-0 z-10 relative">
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={pagination?.total || 0}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Số hàng mỗi trang"
                    />
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
                            <p className="text-sm font-semibold mb-2 text-gray-800">Khoảng thời gian</p>
                            <div className="flex gap-3 mb-2">
                                <div className="w-full">
                                    <span className="text-xs text-gray-500 mb-1 block">Từ ngày</span>
                                    <TextField type="date" fullWidth size="small" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} />
                                </div>
                                <div className="w-full">
                                    <span className="text-xs text-gray-500 mb-1 block">Đến ngày</span>
                                    <TextField type="date" fullWidth size="small" value={exportTo} onChange={(e) => setExportTo(e.target.value)} />
                                </div>
                            </div>
                            <ExportDateSelector title="Ngày xuất hóa đơn" value={exportDateFilter} onChange={setExportDateFilter} />
                        </div>

                        <div>
                            <p className="text-sm font-semibold mb-2 text-gray-800">Nha khoa</p>
                            <FormControl fullWidth size="small">
                                <Select displayEmpty value={exportNhaKhoa} onChange={(e) => setExportNhaKhoa(e.target.value)}>
                                    <MenuItem value="">-- Tất cả nha khoa --</MenuItem>
                                    {Array.isArray(nhaKhoa?.data) && nhaKhoa.data.map((nk) => (
                                        <MenuItem key={nk._id} value={nk._id}>{nk.hoVaTen || nk.tenGiaoDich}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                                                {selected.map((value) => (
                                                    <Chip key={value} label={value} size="small" color="primary" variant="outlined" />
                                                ))}
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
                            onClick={() => { setOpenExport(false); setExportDateFilter(EMPTY_EXPORT_DATE_FILTER); setExportNhaKhoa(""); setExportTrangThai([]); }}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleExport} disabled={exporting}
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