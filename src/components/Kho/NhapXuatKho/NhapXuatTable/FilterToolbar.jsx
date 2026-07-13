import { useRef, useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import SearchableDropdown from "./SearchableDropdown";
import { MONTH_OPTIONS } from "./constants";

const NHAP_STATUSES = ["Chưa nhận", "Đã nhận"];
const NHAP_THANHTOAN_STATUSES = ["Chưa thanh toán", "Đã thanh toán"];
const XUAT_STATUSES = ["Chưa xuất", "Đã xuất"];
const VAT_STATUSES = ["Có VAT", "Không VAT"];

const PRINT_OPTIONS = [
    { key: "phieuNhap", label: "Phiếu nhập" },
    { key: "phieuXuat", label: "Phiếu xuất" },
    { key: "vatLieuNhap", label: "Vật liệu nhập" },
    { key: "vatLieuXuat", label: "Vật liệu xuất" },
];

function StatusMultiSelect({ selectedTrangThai, onToggle }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const count = selectedTrangThai.length;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="h-9 min-w-[170px] px-3 text-sm text-left bg-white border border-gray-300 rounded flex items-center justify-between gap-2 hover:border-gray-400 transition"
            >
                <span className={count ? "text-slate-700" : "text-gray-400"}>
                    {count ? `Trạng thái (${count})` : "Trạng thái"}
                </span>
                <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 left-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg py-1">
                    <div className="px-3 py-1 text-xs font-semibold text-sky-600 uppercase tracking-wide">Nhập kho</div>
                    {NHAP_STATUSES.map((s) => (
                        <label key={s} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTrangThai.includes(s)}
                                onChange={() => onToggle(s)}
                                className="w-3.5 h-3.5 accent-sky-500"
                            />
                            {s}
                        </label>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-3 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wide">Thanh toán</div>
                    {NHAP_THANHTOAN_STATUSES.map((s) => (
                        <label key={s} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTrangThai.includes(s)}
                                onChange={() => onToggle(s)}
                                className="w-3.5 h-3.5 accent-blue-500"
                            />
                            {s}
                        </label>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-3 py-1 text-xs font-semibold text-green-600 uppercase tracking-wide">Xuất kho</div>
                    {XUAT_STATUSES.map((s) => (
                        <label key={s} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTrangThai.includes(s)}
                                onChange={() => onToggle(s)}
                                className="w-3.5 h-3.5 accent-green-500"
                            />
                            {s}
                        </label>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <div className="px-3 py-1 text-xs font-semibold text-purple-600 uppercase tracking-wide">VAT</div>
                    {VAT_STATUSES.map((s) => (
                        <label key={s} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedTrangThai.includes(s)}
                                onChange={() => onToggle(s)}
                                className="w-3.5 h-3.5 accent-purple-500"
                            />
                            {s}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function PrintMenu({ printSelection, onTogglePrintSelection, onPrintConfirm }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const hasSelection = Object.values(printSelection).some(Boolean);

    return (
        <div ref={ref} className="relative">
            <button
                title="In danh sách"
                onClick={() => setOpen((o) => !o)}
                className="text-white rounded-full h-10 w-10 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition"
            >
                <LocalPrintshopIcon sx={{ fontSize: 20 }} />
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-lg z-50 p-2">
                    <p className="text-xs text-gray-400 px-2 pb-1">Chọn nội dung in</p>
                    {PRINT_OPTIONS.map((opt) => (
                        <label
                            key={opt.key}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 rounded hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={printSelection[opt.key]}
                                onChange={() => onTogglePrintSelection(opt.key)}
                                className="w-3.5 h-3.5 accent-sky-500"
                            />
                            {opt.label}
                        </label>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-2 px-2 pb-1">
                        <button
                            onClick={() => {
                                onPrintConfirm();
                                setOpen(false);
                            }}
                            disabled={!hasSelection}
                            className="w-full text-sm bg-sky-500 text-white rounded py-1.5 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            In
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FilterToolbar({
    // filter state
    selectedMonth, setSelectedMonth,
    selectedNCC, setSelectedNCC,
    selectedBoPhan, setSelectedBoPhan,
    selectedTrangThai, onToggleTrangThai,
    nccOptions,
    boPhanList,
    isFiltered,
    onClearFilter,
    // toolbar actions
    isLoading,
    onRefresh,
    onExport,
    isExporting,
    onOpenNhapModal,
    onOpenXuatModal,
    addMenuOpen,
    setAddMenuOpen,
    // print
    printSelection,
    onTogglePrintSelection,
    onPrintConfirm,
}) {
    const addMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
                setAddMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setAddMenuOpen]);

    // Helpers để đồng bộ SearchableDropdown tháng (hiển thị label, lưu value)
    const monthLabel = MONTH_OPTIONS.find((o) => o.value === selectedMonth)?.label || "";
    const monthLabels = MONTH_OPTIONS.map((o) => o.label);
    function handleMonthChange(label) {
        const found = MONTH_OPTIONS.find((o) => o.label === label);
        setSelectedMonth(found ? found.value : "");
    }

    return (
        <div className="mb-3 flex flex-wrap-reverse justify-end gap-3 md:flex-nowrap md:gap-0 md:justify-between md:items-center">
            <div className="flex justify-center items-center flex-wrap gap-2">
                <SearchableDropdown
                    options={monthLabels}
                    value={monthLabel}
                    onChange={handleMonthChange}
                    placeholder="Tháng"
                />

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

                <StatusMultiSelect
                    selectedTrangThai={selectedTrangThai}
                    onToggle={onToggleTrangThai}
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Add button với dropdown */}
                <div ref={addMenuRef} className="relative">
                    <button
                        title="Tạo phiếu nhập/xuất"
                        onClick={() => setAddMenuOpen((o) => !o)}
                        className="text-white rounded-full h-10 w-10 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition"
                    >
                        <AddIcon sx={{ fontSize: 20 }} />
                    </button>
                    {addMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                            <button
                                onClick={() => { onOpenNhapModal(); setAddMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition"
                            >
                                Phiếu nhập kho
                            </button>
                            <button
                                onClick={() => { onOpenXuatModal(); setAddMenuOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition"
                            >
                                Phiếu xuất kho
                            </button>
                        </div>
                    )}
                </div>

                {/* Print button với dropdown chọn nội dung */}
                <PrintMenu
                    printSelection={printSelection}
                    onTogglePrintSelection={onTogglePrintSelection}
                    onPrintConfirm={onPrintConfirm}
                />

                <button
                    title="Xuất Excel"
                    onClick={onExport}
                    disabled={isExporting || isLoading}
                    className="text-white rounded-full h-10 w-10 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition disabled:opacity-50"
                >
                    <div>
                        <DownloadIcon sx={{ fontSize: 20 }} />
                    </div>
                </button>

                <button
                    title="Tải lại"
                    onClick={() => {
                        onClearFilter();
                        onRefresh();
                    }}
                    disabled={isLoading}
                    className="text-white rounded-full h-10 w-10 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition disabled:opacity-50"
                >
                    <div className={isLoading ? "animate-spin" : ""}>
                        <RefreshIcon sx={{ fontSize: 20 }} />
                    </div>
                </button>
            </div>
        </div>
    );
}