import { useEffect, useRef, useState } from "react";

/**
 * Combobox chọn nhà cung cấp với tìm kiếm + nút thêm mới.
 *
 * Props:
 *  value       – _id đang chọn (string)
 *  onChange    – (id: string) => void
 *  options     – [{ _id, ten }]
 *  disabled    – boolean
 *  onAddNew    – (inputText: string) => void   ← mở modal thêm NCC, truyền text đã nhập
 */
export default function NccCombobox({ value, onChange, options = [], disabled, onAddNew }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Lọc bỏ phần tử undefined/null phòng trường hợp state chưa kịp sync
    const safeOptions = options.filter(Boolean);

    // Tên hiển thị của giá trị đang chọn
    const selectedLabel = safeOptions.find((o) => o._id === value)?.ten || "";

    // Khi value thay đổi từ ngoài (ví dụ sau khi thêm NCC mới) → cập nhật query
    useEffect(() => {
        if (!open) setQuery(selectedLabel);
    }, [selectedLabel, open]);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                // Nếu người dùng bỏ focus mà không chọn → khôi phục text về tên đã chọn
                setQuery(selectedLabel);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [selectedLabel]);

    const filtered = query.trim()
        ? safeOptions.filter((o) => o.ten.toLowerCase().includes(query.trim().toLowerCase()))
        : safeOptions;

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        setOpen(true);
    };

    const handleSelect = (opt) => {
        onChange(opt._id);
        setQuery(opt.ten);
        setOpen(false);
    };

    const handleClear = () => {
        onChange("");
        setQuery("");
        inputRef.current?.focus();
        setOpen(true);
    };

    const handleAddNew = () => {
        onAddNew(query.trim());
        setOpen(false);
    };

    if (disabled) {
        return (
            <div className="border rounded px-2 py-1.5 text-sm bg-gray-100 text-gray-400 cursor-not-allowed">
                {selectedLabel || "—"}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Input */}
            <div className="flex items-center border rounded bg-white focus-within:ring-1 focus-within:ring-green-500">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder="Tìm NCC..."
                    onChange={handleInputChange}
                    onFocus={() => setOpen(true)}
                    className="flex-1 px-2 py-1.5 text-sm bg-transparent outline-none min-w-0"
                />
                {/* Nút xóa lựa chọn */}
                {value && (
                    <button type="button" onClick={handleClear}
                        className="px-1 text-gray-400 hover:text-gray-600 text-xs shrink-0"
                        title="Bỏ chọn">
                        ✕
                    </button>
                )}
                {/* Chevron */}
                <button type="button" onClick={() => { setOpen((p) => !p); inputRef.current?.focus(); }}
                    className="px-1.5 text-gray-400 hover:text-gray-600 shrink-0">
                    <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg overflow-hidden">
                    {/* Danh sách NCC */}
                    <ul className="max-h-44 overflow-y-auto divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400 italic">
                                Không tìm thấy "{query}"
                            </li>
                        ) : (
                            filtered.map((opt) => (
                                <li key={opt._id}
                                    onMouseDown={() => handleSelect(opt)}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-green-50 transition-colors ${opt._id === value ? "bg-green-50 font-medium text-green-700" : "text-gray-700"}`}>
                                    {opt.ten}
                                </li>
                            ))
                        )}
                    </ul>

                    {/* Nút thêm mới — luôn hiển thị */}
                    <div className="border-t bg-gray-50">
                        <button type="button" onMouseDown={handleAddNew}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium">
                            <span className="text-base leading-none">＋</span>
                            Thêm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}