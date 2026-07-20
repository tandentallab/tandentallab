import { useRef, useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import CloseIcon from '@mui/icons-material/Close';
import { MONTH_OPTIONS } from "./constants";

const NHAP_STATUSES = ["Chưa nhận", "Đã nhận"];
const NHAP_THANHTOAN_STATUSES = ["Chưa thanh toán", "Đã thanh toán"];
const XUAT_STATUSES = ["Chưa xuất", "Đã xuất"];
const VAT_STATUSES = ["Có VAT", "Không VAT"];

const PRINT_OPTIONS = [
    { key: "vatLieuNhap", label: "Vật liệu nhập" },
    { key: "vatLieuXuat", label: "Vật liệu xuất" },
];

function StatusCheckboxGroup({ selectedTrangThai, onToggle }) {
    return (
        <div>
            <div className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Nhập kho</div>
            <div className="grid grid-cols-2 gap-1 mb-2">
                {NHAP_STATUSES.map((s) => (
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

            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Thanh toán</div>
            <div className="grid grid-cols-2 gap-1 mb-2">
                {NHAP_THANHTOAN_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedTrangThai.includes(s)}
                            onChange={() => onToggle(s)}
                            className="w-3.5 h-3.5 accent-blue-500"
                        />
                        {s}
                    </label>
                ))}
            </div>

            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Xuất kho</div>
            <div className="grid grid-cols-2 gap-1 mb-2">
                {XUAT_STATUSES.map((s) => (
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

            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">VAT</div>
            <div className="grid grid-cols-2 gap-1">
                {VAT_STATUSES.map((s) => (
                    <label key={s} className="flex items-center gap-2 px-1 py-1.5 text-xs text-slate-700 hover:bg-gray-50 rounded cursor-pointer">
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
        </div>
    );
}

function FilterModal({
    open,
    onClose,
    // filter thật (đã áp dụng)
    selectedMonth, setSelectedMonth,
    selectedNCC, setSelectedNCC,
    selectedBoPhan, setSelectedBoPhan,
    selectedNhanVien, setSelectedNhanVien,
    selectedTrangThai, onToggleTrangThai,
    nccOptions,
    boPhanList,
    nhanVienList,
    isFiltered,
    onClearFilter,
}) {
    const modalRef = useRef(null);

    // State nháp — chỉ đẩy xuống filter thật khi bấm "Áp dụng"
    const [draftMonth, setDraftMonth] = useState(selectedMonth);
    const [draftNCC, setDraftNCC] = useState(selectedNCC);
    const [draftBoPhan, setDraftBoPhan] = useState(selectedBoPhan);
    const [draftNhanVien, setDraftNhanVien] = useState(selectedNhanVien);
    const [draftTrangThai, setDraftTrangThai] = useState(selectedTrangThai);

    // Mỗi khi mở modal, đồng bộ lại state nháp theo filter thật hiện tại
    useEffect(() => {
        if (open) {
            setDraftMonth(selectedMonth);
            setDraftNCC(selectedNCC);
            setDraftBoPhan(selectedBoPhan);
            setDraftNhanVien(selectedNhanVien);
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
        setSelectedNCC(draftNCC);
        setSelectedBoPhan(draftBoPhan);
        setSelectedNhanVien(draftNhanVien);

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
        setDraftNCC("");
        setDraftBoPhan("");
        setDraftNhanVien("");
        setDraftTrangThai([]);
        onClose();
    };

    const selectClass =
        "h-8 w-full text-xs bg-white border border-gray-300 rounded outline-none hover:border-gray-400 focus:border-sky-400 transition text-slate-700";

    return (
        <div className="absolute top-2 left-12 z-50 flex items-start justify-center">
            <div ref={modalRef} className="w-[300px] overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-xl">

                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-slate-800">Bộ lọc</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </button>
                </div>

                <div className="p-3 space-y-2">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tháng</label>
                        <select
                            value={draftMonth}
                            onChange={(e) => setDraftMonth(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Tất cả</option>
                            {MONTH_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nhà cung cấp</label>
                        <select
                            value={draftNCC}
                            onChange={(e) => setDraftNCC(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Tất cả</option>
                            {nccOptions.map((ten) => (
                                <option key={ten} value={ten}>{ten}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Bộ phận</label>
                        <select
                            value={draftBoPhan}
                            onChange={(e) => setDraftBoPhan(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Tất cả</option>
                            {(boPhanList || []).map((bp) => (
                                <option key={bp} value={bp}>{bp}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nhân viên</label>
                        <select
                            value={draftNhanVien}
                            onChange={(e) => setDraftNhanVien(e.target.value)}
                            className={selectClass}
                        >
                            <option value="">Tất cả</option>
                            {(nhanVienList || []).map((nv) => (
                                <option key={nv} value={nv}>{nv}</option>
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

// In vật liệu nhập/xuất — theo bộ lọc hiện tại
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

// Ô search tên vật liệu — debounce, nằm ngoài modal, cạnh icon Lọc
function VatLieuSearchInput({ value, onChange, delay = 400 }) {
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
                placeholder="Nhập tên vật liệu"
                className="h-10 w-[240px] pl-8 pr-3 text-sm bg-white shadow rounded-full outline-none hover:border-gray-400 focus:border-sky-400 transition"
            />
        </div>
    );
}

export default function VatLieuFilterToolbar({
    selectedMonth, setSelectedMonth,
    selectedNCC, setSelectedNCC,
    selectedBoPhan, setSelectedBoPhan,
    selectedNhanVien, setSelectedNhanVien,
    selectedTenVatLieu, setSelectedTenVatLieu,
    selectedTrangThai, onToggleTrangThai,
    nccOptions,
    boPhanList,
    nhanVienList,
    onClearFilter,
    // print
    printSelection,
    onTogglePrintSelection,
    onPrintConfirm,
}) {
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Tự tính isFiltered từ chính các giá trị filter thật
    const isFiltered = Boolean(
        selectedMonth ||
        selectedNCC ||
        selectedBoPhan ||
        selectedNhanVien ||
        selectedTenVatLieu ||
        (selectedTrangThai && selectedTrangThai.length > 0)
    );

    return (
        <div className="flex justify-between items-center">
            <div className="flex gap-2">
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
                        selectedNCC={selectedNCC} setSelectedNCC={setSelectedNCC}
                        selectedBoPhan={selectedBoPhan} setSelectedBoPhan={setSelectedBoPhan}
                        selectedNhanVien={selectedNhanVien} setSelectedNhanVien={setSelectedNhanVien}
                        selectedTrangThai={selectedTrangThai} onToggleTrangThai={onToggleTrangThai}
                        nccOptions={nccOptions}
                        boPhanList={boPhanList}
                        nhanVienList={nhanVienList}
                        isFiltered={isFiltered}
                        onClearFilter={onClearFilter}
                    />
                </div>

                {/* Search tên vật liệu — ngoài modal, áp dụng ngay khi gõ (debounce) */}
                <VatLieuSearchInput
                    value={selectedTenVatLieu}
                    onChange={setSelectedTenVatLieu}
                />
            </div>

            {/* In vật liệu nhập/xuất — theo bộ lọc hiện tại */}
            <PrintMenu
                printSelection={printSelection}
                onTogglePrintSelection={onTogglePrintSelection}
                onPrintConfirm={onPrintConfirm}
            />
        </div>
    );
}