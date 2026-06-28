import { useDispatch, useSelector } from "react-redux";
import { useState, useRef, useEffect, useMemo } from "react";
import {
    fetchAllPhieuNhapKho,
    clearSelected,
} from "../../../redux/slices/phieuNhapKhoSlice";
import {
    fetchAllPhieuXuatKho,
    clearSelectedXuat,
    fetchXuatKhoOptions,
} from "../../../redux/slices/phieuXuatKhoSlice";
import { fetchNhaCungCap, fetchVatLieu } from "../../../redux/slices/khoSlice";

import NhapKhoModal from "./NhapKhoModal";
import XuatKhoModal from "./XuatKhoModal";
import NhapKhoDetailPanel from "./NhapKhoDetailPanel";
import XuatKhoDetailPanel from "./XuatKhoDetailPanel";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const rowBase = "py-2 ps-2 text-slate-700";
const borderBottom = "border-b border-gray-200";
const imBg = 'bg-sky-100';
const exBg = 'bg-green-100';

const scrollbarStyle = `
    .table-scroll::-webkit-scrollbar { width: 4px; }
    .table-scroll::-webkit-scrollbar-track { background: #ccc; }
    .table-scroll::-webkit-scrollbar-thumb { background: #777; border-radius: 12px; }
    .table-scroll::-webkit-scrollbar-thumb:hover { background: #64748b; }
`;

function genMonthOptions() {
    const options = [{ label: "Tất cả tháng", value: "" }];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
        const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        options.push({ label, value });
    }
    return options;
}

const MONTH_OPTIONS = genMonthOptions();

// Format ISO date string → "HH:MM DD/MM/YYYY"
function formatNgay(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
}

// Chuyển "YYYY-MM" → { tuNgay, denNgay } để gửi API
function monthToDateRange(month) {
    if (!month) return {};
    const [year, mon] = month.split("-").map(Number);
    const tuNgay = new Date(year, mon - 1, 1).toISOString().split("T")[0];
    const denNgay = new Date(year, mon, 0).toISOString().split("T")[0];
    return { tuNgay, denNgay };
}

// Tổng hợp vật liệu từ danh sách phiếu
function aggregateVatLieu(phieuList) {
    const map = {};
    phieuList.forEach((phieu) => {
        (phieu.danhSachVatLieu || []).forEach((item) => {
            const tenVatLieu = item.vatLieu?.tenVatLieu || "Không xác định";
            if (!map[tenVatLieu]) map[tenVatLieu] = { tenVatLieu, soLuong: 0 };
            map[tenVatLieu].soLuong += item.soLuong || 0;
        });
    });
    return Object.values(map);
}

function SearchableDropdown({ options, value, onChange, placeholder = "Tìm kiếm..." }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef(null);

    const filtered = options.filter((o) =>
        o.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="h-9 min-w-[160px] px-3 text-sm text-left bg-white border border-gray-300 rounded flex items-center justify-between gap-2 hover:border-gray-400 transition"
            >
                <span className={value ? "text-slate-700" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} className="text-gray-400 shrink-0" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full min-w-[200px] bg-white border border-gray-200 rounded shadow-lg">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Tìm ${placeholder.toLowerCase()}...`}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded outline-none focus:border-sky-400"
                        />
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                        <li
                            onClick={() => { onChange(""); setSearch(""); setOpen(false); }}
                            className="px-3 py-1.5 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer"
                        >
                            Tất cả
                        </li>
                        {filtered.length > 0 ? filtered.map((opt) => (
                            <li
                                key={opt}
                                onClick={() => { onChange(opt); setSearch(""); setOpen(false); }}
                                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-sky-50 hover:text-sky-700 ${value === opt ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700"}`}
                            >
                                {opt}
                            </li>
                        )) : (
                            <li className="px-3 py-2 text-sm text-gray-400 text-center">Không tìm thấy</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

function PhieuNhapTable({ data, selectedId, onRowClick }) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[500px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${imBg}`}>Ngày nhập</th>
                            <th className={`${rowBase} ${imBg}`}>Số phiếu</th>
                            <th className={`${rowBase} ${imBg}`}>Nhà cung cấp</th>
                            <th className={`${rowBase} ${imBg}`}>Thành tiền</th>
                            <th className={`${rowBase} ${imBg}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td className={`${rowBase} text-gray-400`} colSpan={5}>Không có dữ liệu</td></tr>
                        ) : data.map((row) => {
                            const nccDaiDien = row.danhSachVatLieu?.[0]?.nhaCungCap?.ten || "—";
                            const nccSet = new Set((row.danhSachVatLieu || []).map(v => v.nhaCungCap?.ten).filter(Boolean));
                            const coNhieuNCC = nccSet.size > 1;
                            const isSelected = row._id === selectedId;
                            return (
                                <tr
                                    key={row._id}
                                    onClick={() => onRowClick(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-sky-50 border-l-2 border-sky-400" : "hover:bg-gray-50"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{formatNgay(row.ngayTao)}</td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{row.soPhieu}</td>
                                    <td className={`${rowBase} ${borderBottom} max-w-32 truncate`}>
                                        {nccDaiDien}{coNhieuNCC && <span className="text-gray-400 text-xs ml-1">+{nccSet.size - 1}</span>}
                                    </td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>
                                        {(row.tongTien || 0).toLocaleString("vi-VN")}
                                    </td>
                                    <td className={`${rowBase} ${borderBottom}`}>
                                        <span className={`text-sm text-white font-medium px-2.5 py-0.5 ${row.trangThai === "Đã nhận"
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                            }`}>
                                            {row.trangThai}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${imBg} font-medium`} colSpan={3}>Tổng</td>
                                <td className={`${rowBase} ${imBg} font-medium`} colSpan={2}>
                                    {data.reduce((s, r) => s + (r.tongTien || 0), 0).toLocaleString("vi-VN")}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

function PhieuXuatTable({ data, selectedId, onRowClick }) {
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[500px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${exBg}`}>Ngày xuất</th>
                            <th className={`${rowBase} ${exBg}`}>Số phiếu</th>
                            <th className={`${rowBase} ${exBg}`}>Bộ phận</th>
                            <th className={`${rowBase} ${exBg}`}>Nhân viên</th>
                            <th className={`${rowBase} ${exBg}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td className={`${rowBase} text-gray-400`} colSpan={5}>Không có dữ liệu</td></tr>
                        ) : data.map((row) => {
                            const isSelected = row._id === selectedId;
                            return (
                                <tr
                                    key={row._id}
                                    onClick={() => onRowClick(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-green-50 border-l-2 border-green-500" : "hover:bg-gray-50"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{formatNgay(row.ngayTao)}</td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{row.soPhieu}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.boPhan}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.nhanVien}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>
                                        <span className={`text-sm text-white font-medium px-2.5 py-0.5 ${row.trangThai === "Đã xuất"
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                            }`}>
                                            {row.trangThai}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VatLieuNhapTable({ data }) {
    const tongSoLuong = data.reduce((s, r) => s + r.soLuong, 0);
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[300px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${imBg}`}>Tên vật liệu</th>
                            <th className={`${rowBase} ${imBg}`}>Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td className={`${rowBase} text-gray-400`} colSpan={2}>Không có dữ liệu</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-100">
                                <td className={`${rowBase} ${borderBottom}`}>{row.tenVatLieu}</td>
                                <td className={`${rowBase} ${borderBottom}`}>{row.soLuong}</td>
                            </tr>
                        ))}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${imBg} font-medium`}>Tổng</td>
                                <td className={`${rowBase} ${imBg} font-medium`}>{tongSoLuong}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

function VatLieuXuatTable({ data }) {
    const tongSoLuong = data.reduce((s, r) => s + r.soLuong, 0);
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[300px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${exBg}`}>Tên vật liệu</th>
                            <th className={`${rowBase} ${exBg}`}>Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td className={`${rowBase} text-gray-400`} colSpan={2}>Không có dữ liệu</td></tr>
                        ) : data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-100">
                                <td className={`${rowBase} ${borderBottom}`}>{row.tenVatLieu}</td>
                                <td className={`${rowBase} ${borderBottom}`}>{row.soLuong}</td>
                            </tr>
                        ))}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${exBg} font-medium`}>Tổng</td>
                                <td className={`${rowBase} ${exBg} font-medium`}>{tongSoLuong}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}

export default function NhapXuatTable() {
    const dispatch = useDispatch();

    const { phieuNhapKhos, loading: loadingNhap } = useSelector((state) => state.phieuNhapKho);
    const { phieuXuatKhos, loading: loadingXuat, boPhanList } = useSelector((state) => state.phieuXuatKho);
    const { nhaCungCap: nhaCungCapList } = useSelector((state) => state.kho);

    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedNCC, setSelectedNCC] = useState("");
    const [selectedBoPhan, setSelectedBoPhan] = useState("");
    const [appliedMonth, setAppliedMonth] = useState("");
    const [appliedNCC, setAppliedNCC] = useState("");
    const [appliedBoPhan, setAppliedBoPhan] = useState("");

    const [showNhapModal, setShowNhapModal] = useState(false);
    const [showXuatModal, setShowXuatModal] = useState(false);
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const addMenuRef = useRef(null);

    const [selectedNhap, setSelectedNhap] = useState(null);
    const [selectedXuat, setSelectedXuat] = useState(null);

    const isFiltered = appliedNCC !== "" || appliedMonth !== "" || appliedBoPhan !== "";
    const isLoading = loadingNhap || loadingXuat;

    // Fetch NCC list for filter dropdown on mount
    useEffect(() => {
        dispatch(fetchNhaCungCap());
        dispatch(fetchXuatKhoOptions());
    }, [dispatch]);

    // Fetch data whenever applied filters change (also runs on mount with empty filters)
    useEffect(() => {
        const dateRange = monthToDateRange(appliedMonth);
        dispatch(fetchAllPhieuNhapKho({ limit: 200, ...dateRange }));
        dispatch(fetchAllPhieuXuatKho({
            limit: 200,
            ...dateRange,
            ...(appliedBoPhan ? { boPhan: appliedBoPhan } : {}),
        }));
    }, [appliedMonth, appliedBoPhan, dispatch]);

    // Close add menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
                setAddMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleApplyFilter() {
        setAppliedMonth(selectedMonth);
        setAppliedNCC(selectedNCC);
        setAppliedBoPhan(selectedBoPhan);
    }

    function handleClearFilter() {
        setSelectedMonth("");
        setSelectedNCC("");
        setSelectedBoPhan("");
        setAppliedMonth("");
        setAppliedNCC("");
        setAppliedBoPhan("");
    }

    function handleRefresh() {
        const dateRange = monthToDateRange(appliedMonth);
        dispatch(fetchAllPhieuNhapKho({ limit: 200, ...dateRange }));
        dispatch(fetchAllPhieuXuatKho({
            limit: 200,
            ...dateRange,
            ...(appliedBoPhan ? { boPhan: appliedBoPhan } : {}),
        }));
        dispatch(fetchVatLieu());
    }

    function handleNhapModalClose() {
        setShowNhapModal(false);
        dispatch(clearSelected());
        handleRefresh();
    }

    function handleXuatModalClose() {
        setShowXuatModal(false);
        dispatch(clearSelectedXuat());
        dispatch(fetchXuatKhoOptions());
        handleRefresh();
    }

    function handleNhapRowClick(row) {
        setSelectedXuat(null);
        setSelectedNhap((prev) => (prev?._id === row._id ? null : row));
    }

    function handleXuatRowClick(row) {
        setSelectedNhap(null);
        setSelectedXuat((prev) => (prev?._id === row._id ? null : row));
    }

    // NCC filter is client-side (backend doesn't filter by supplier inside danhSachVatLieu)
    const filteredImportData = useMemo(() => {
        if (!appliedNCC) return phieuNhapKhos;
        return phieuNhapKhos.filter((r) =>
            (r.danhSachVatLieu || []).some((v) => v.nhaCungCap?.ten === appliedNCC)
        );
    }, [phieuNhapKhos, appliedNCC]);



    // boPhan filter is server-side; phieuXuatKhos already filtered
    const filteredExportData = phieuXuatKhos;

    const vatLieuNhap = useMemo(() => aggregateVatLieu(filteredImportData), [filteredImportData]);
    const vatLieuXuat = useMemo(() => aggregateVatLieu(filteredExportData), [filteredExportData]);

    const nccOptions = useMemo(() => nhaCungCapList.map((n) => n.ten), [nhaCungCapList]);

    return (
        <div>
            <style>{scrollbarStyle}</style>

            {/* Toolbar */}
            <div className="mb-3 flex justify-between items-center rounded">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="h-9 px-3 text-sm text-slate-700 bg-white border border-gray-300 rounded hover:border-gray-400 outline-none focus:border-sky-400 transition cursor-pointer"
                    >
                        {MONTH_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    <SearchableDropdown
                        options={nccOptions}
                        value={selectedNCC}
                        onChange={setSelectedNCC}
                        placeholder="Nhà cung cấp"
                    />

                    <SearchableDropdown
                        options={boPhanList}
                        value={selectedBoPhan}
                        onChange={setSelectedBoPhan}
                        placeholder="Bộ phận"
                    />

                    <button
                        onClick={handleApplyFilter}
                        className="h-9 px-4 text-sm font-medium text-white bg-sky-500 rounded hover:bg-sky-600 active:bg-sky-700 transition"
                    >
                        Áp dụng
                    </button>

                    {isFiltered && (
                        <button
                            onClick={handleClearFilter}
                            className="h-9 px-4 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 transition"
                        >
                            Xóa lọc
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* <button title="Xuất Excel" className="text-gray-700 rounded-full h-10 w-10 flex items-center justify-center bg-white shadow hover:bg-gray-50 transition">
                        <DownloadIcon sx={{ fontSize: 20 }} />
                    </button> */}

                    {/* Add button with dropdown */}
                    <div ref={addMenuRef} className="relative">
                        <button
                            title="Tạo phiếu nhập/xuất"
                            onClick={() => setAddMenuOpen((o) => !o)}
                            className="text-gray-700 rounded-full h-10 w-10 flex items-center justify-center bg-white shadow hover:bg-gray-50 transition"
                        >
                            <AddIcon sx={{ fontSize: 20 }} />
                        </button>
                        {addMenuOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                                <button
                                    onClick={() => { setShowNhapModal(true); setAddMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                                >
                                    Phiếu nhập kho
                                </button>
                                <button
                                    onClick={() => { setShowXuatModal(true); setAddMenuOpen(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
                                >
                                    Phiếu xuất kho
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        title="Tải lại"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="text-gray-700 rounded-full h-10 w-10 flex items-center justify-center bg-white shadow hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        <div className={isLoading ? "animate-spin" : ""}>
                            <RefreshIcon sx={{ fontSize: 20 }} />
                        </div>
                    </button>
                </div>
            </div>

            <p className="mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">Phiếu nhập/xuất</p>

            <div className="flex w-full gap-0 border border-gray-200 rounded">
                <PhieuNhapTable
                    data={filteredImportData}
                    selectedId={selectedNhap?._id}
                    onRowClick={handleNhapRowClick}
                />
                <div className="w-px bg-gray-300 self-stretch" />
                <PhieuXuatTable
                    data={filteredExportData}
                    selectedId={selectedXuat?._id}
                    onRowClick={handleXuatRowClick}
                />
            </div>

            <p className="mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">Vật liệu</p>

            <div className="flex w-full gap-0 border border-gray-200 rounded">
                <VatLieuNhapTable data={vatLieuNhap} />
                <div className="w-px bg-gray-300 self-stretch" />
                <VatLieuXuatTable data={vatLieuXuat} />
            </div>

            {/* Create modals */}
            <NhapKhoModal
                open={showNhapModal}
                onClose={handleNhapModalClose}
                editData={null}
            />
            <XuatKhoModal
                open={showXuatModal}
                onClose={handleXuatModalClose}
                editData={null}
            />

            {/* Detail panels */}
            <NhapKhoDetailPanel
                phieu={selectedNhap}
                onClose={() => setSelectedNhap(null)}
                onUpdated={handleRefresh}
            />
            <XuatKhoDetailPanel
                phieu={selectedXuat}
                onClose={() => setSelectedXuat(null)}
                onUpdated={handleRefresh}
            />
        </div>
    );
}