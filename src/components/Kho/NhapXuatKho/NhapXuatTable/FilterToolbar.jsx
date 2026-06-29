import { useRef, useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import SearchableDropdown from "./SearchableDropdown";
import { MONTH_OPTIONS } from "./constants";

const NHAP_STATUSES = ["Chưa nhận", "Đã nhận"];
const XUAT_STATUSES = ["Chưa xuất", "Đã xuất"];

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
                className="h-9 min-w-[140px] px-3 text-sm text-left bg-white border border-gray-300 rounded flex items-center justify-between gap-2 hover:border-gray-400 transition"
            >
                <span className={count ? "text-slate-700" : "text-gray-400"}>
                    {count ? `Trạng thái (${count})` : "Trạng thái"}
                </span>
                <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-50 left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1">
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
        <div className="mb-3 flex justify-between items-start md:items-center rounded">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
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
