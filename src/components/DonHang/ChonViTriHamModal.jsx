import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const OPTIONS = {
    "Bán hàm": ["Bán hàm 1", "Bán hàm 2", "Bán hàm 3", "Bán hàm 4"],
    Hàm: ["Hàm trên dưới", "Hàm trên", "Hàm dưới"],
};

export default function ChonViTriHamModal({ open, onClose, onSave, loaiTinh, initialValue = "" }) {
    const isMulti = loaiTinh === "Bán hàm";

    // Always store as array; single-select just uses first element
    const [selected, setSelected] = useState([]);

    useEffect(() => {
        if (open) {
            setSelected(initialValue ? initialValue.split(", ").filter(Boolean) : []);
        }
    }, [open, initialValue]);

    if (!open) return null;

    const options = OPTIONS[loaiTinh] || [];

    const toggleMulti = (opt) => {
        setSelected((prev) =>
            prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
        );
    };

    const toggleSingle = (opt) => {
        setSelected((prev) => (prev[0] === opt ? [] : [opt]));
    };

    const handleSave = () => {
        onSave(selected.join(", "));
        onClose();
    };

    const displayText = selected.join(", ");

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl w-80 max-w-[95vw] overflow-hidden">
                {/* Header */}
                <div className="bg-[#00a8ff] text-white px-5 py-3 flex items-center justify-between">
                    <span className="font-semibold text-base">Chọn vị trí – {loaiTinh}</span>
                    <button onClick={onClose} className="text-2xl font-bold leading-none hover:opacity-80">
                        &times;
                    </button>
                </div>

                {/* Options */}
                <div className="px-6 py-5 flex flex-col gap-3">
                    {options.map((opt) => {
                        const isChecked = selected.includes(opt);
                        return (
                            <label
                                key={opt}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition select-none ${isChecked
                                    ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                    }`}
                            >
                                <input
                                    type={isMulti ? "checkbox" : "radio"}
                                    name="viTriHam"
                                    checked={isChecked}
                                    onChange={() => isMulti ? toggleMulti(opt) : toggleSingle(opt)}
                                    className="accent-blue-500 w-4 h-4 shrink-0"
                                />
                                {opt}
                            </label>
                        );
                    })}

                    {displayText && (
                        <div className="mt-1 text-xs text-gray-500 italic">
                            Đã chọn: <span className="font-medium text-gray-700">{displayText}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 pb-5">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-1.5 text-sm rounded-full bg-[#00a8ff] text-white font-bold hover:bg-blue-500 shadow-md transition"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
