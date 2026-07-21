import { useRef, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';

const NHAN_STATUSES = ["Chưa nhận", "Đã nhận"];
const TRA_STATUSES = ["Chưa trả", "Đã trả"];

function StatusCheckboxGroup({ selectedTrangThai, onToggle }) {
    return (
        <div>
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Nhận</div>
            <div className="grid grid-cols-2 gap-1 mb-2">
                {NHAN_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedTrangThai.includes(s)}
                            onChange={() => onToggle(s)}
                            className="w-3.5 h-3.5 accent-sky-500"
                        />
                        {s}
                    </label>
                ))}
            </div>

            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Trả</div>
            <div className="grid grid-cols-2 gap-1">
                {TRA_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-gray-50 rounded cursor-pointer">
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
        </div>
    );
}

function FilterModal({
    open,
    onClose,
    // filter thật (đã áp dụng)
    selectedMonth, setSelectedMonth,
    selectedTrangThai, onToggleTrangThai,
    monthOptions,
    isFiltered,
    onClearFilter,
}) {
    const modalRef = useRef(null);

    // State nháp — chỉ đẩy xuống filter thật khi bấm "Áp dụng"
    const [draftMonth, setDraftMonth] = useState(selectedMonth);
    const [draftTrangThai, setDraftTrangThai] = useState(selectedTrangThai);

    // Mỗi khi mở modal, đồng bộ lại state nháp theo filter thật hiện tại
    useEffect(() => {
        if (open) {
            setDraftMonth(selectedMonth);
            setDraftTrangThai(selectedTrangThai);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    const toggleDraftTrangThai = (s) => {
        setDraftTrangThai((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    };

    const handleApply = () => {
        setSelectedMonth(draftMonth);

        // Đồng bộ trạng thái đã chọn xuống filter thật bằng cách toggle
        // đúng những mục khác nhau giữa draft và filter thật hiện tại
        const toToggle = [
            ...draftTrangThai.filter((s) => !selectedTrangThai.includes(s)),
            ...selectedTrangThai.filter((s) => !draftTrangThai.includes(s)),
        ];
        toToggle.forEach((s) => onToggleTrangThai(s));

        onClose();
    };

    const handleClearAll = () => {
        onClearFilter();
        setDraftMonth("");
        setDraftTrangThai([]);
        onClose();
    };

    const selectClass =
        "h-8 w-full text-xs bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-sky-400 transition text-slate-700";

    return (
        <div className="absolute top-2 left-12 z-50 flex items-start justify-center">
            <div ref={modalRef} className="w-[280px] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-xl">

                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-slate-800">Bộ lọc</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                <div className="p-3 space-y-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ngày tạo</label>
                        <select
                            value={draftMonth}
                            onChange={(e) => setDraftMonth(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Tất cả các tháng</option>
                            {monthOptions.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Trạng thái</label>
                        <StatusCheckboxGroup
                            selectedTrangThai={draftTrangThai}
                            onToggle={toggleDraftTrangThai}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between px-3 py-1 border-t border-gray-100">
                    <button
                        onClick={handleClearAll}
                        disabled={!isFiltered}
                        className="text-sm text-gray-500 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                        Xóa bộ lọc
                    </button>
                    <button
                        onClick={handleApply}
                        className="text-sm bg-sky-500 text-white rounded px-4 py-1.5 hover:bg-sky-600 transition"
                    >
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}

// Ô search chung — debounce, tìm đồng thời số phiếu / đối tác / vật liệu
function GlobalSearchInput({ value, onChange, delay = 400 }) {
    const [localValue, setLocalValue] = useState(value || "");

    useEffect(() => {
        setLocalValue(value || "");
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== (value || "")) onChange(localValue);
        }, delay);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue]);

    return (
        <div className="relative">
            <SearchIcon
                sx={{ fontSize: 18 }}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="Nhập Số phiếu/Đối tác/Vật liệu"
                className="h-10 w-[240px] pl-8 pr-3 text-sm bg-white shadow rounded-full outline-none hover:border-gray-400 focus:border-sky-400 transition"
            />
        </div>
    );
}

export default function PhieuMuonFilterToolbar({
    selectedMonth, setSelectedMonth,
    selectedTrangThai, onToggleTrangThai,
    selectedTimKiem, setSelectedTimKiem,
    monthOptions,
    onClearFilter,
}) {
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Tự tính isFiltered từ chính các giá trị filter thật
    const isFiltered = Boolean(
        selectedMonth ||
        (selectedTrangThai && selectedTrangThai.length > 0)
    );

    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <button
                    title="Lọc"
                    onClick={() => setFilterModalOpen((o) => !o)}
                    className="text-white rounded-full h-10 w-10 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition"
                >
                    <FilterAltIcon sx={{ fontSize: 20 }} />
                </button>
                {isFiltered && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
                )}

                <FilterModal
                    open={filterModalOpen}
                    onClose={() => setFilterModalOpen(false)}
                    selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                    selectedTrangThai={selectedTrangThai} onToggleTrangThai={onToggleTrangThai}
                    monthOptions={monthOptions}
                    isFiltered={isFiltered}
                    onClearFilter={onClearFilter}
                />
            </div>

            {/* Search chung — số phiếu / đối tác / vật liệu, áp dụng ngay khi gõ (debounce) */}
            <GlobalSearchInput value={selectedTimKiem} onChange={setSelectedTimKiem} />
        </div>
    );
}