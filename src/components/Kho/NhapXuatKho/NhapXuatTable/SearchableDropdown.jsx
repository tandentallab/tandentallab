import { useState, useRef, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function SearchableDropdown({ options, value, onChange, placeholder = "Tìm kiếm..." }) {
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
                className="h-9 min-w-[170px] px-3 text-sm text-left bg-white border border-gray-300 rounded flex items-center justify-between gap-2 hover:border-gray-400 transition"
            >
                <span className={value ? "text-slate-700" : "text-gray-400"}>
                    {value || placeholder}
                </span>
                <KeyboardArrowDownIcon
                    sx={{ fontSize: 20, transition: "transform 0.15s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    className="text-gray-400 shrink-0"
                />
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
                            className="w-full px-2 py-1.5 md:text-sm text-base border border-gray-200 rounded outline-none focus:border-sky-400"
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
                                className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-sky-50 hover:text-sky-700 ${value === opt ? "bg-sky-50 text-sky-700 font-medium" : "text-slate-700"
                                    }`}
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
