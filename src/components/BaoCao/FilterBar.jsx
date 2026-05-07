import React from 'react';
import { Print, Download } from '@mui/icons-material';

const TIME_FILTERS = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'this_week', label: 'Tuần này' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'last_month', label: 'Tháng trước' },
    { id: 'last_7_days', label: '7 ngày qua' },
    { id: 'last_30_days', label: '30 ngày qua' },
    { id: 'custom', label: 'Chọn trên lịch' },
];

/**
 * FilterBar — Thanh bộ lọc nằm giữa Chart và Table.
 *
 * Props:
 *   dateType        {string}   — 'ngayNhan' | 'henGiao'
 *   setDateType     {fn}
 *   selectedFilter  {string}   — id trong TIME_FILTERS
 *   setSelectedFilter {fn}
 *   customDates     {{ start, end }}
 *   setCustomDates  {fn}
 *   onPrint         {fn}       — mở modal xem trước
 *   onExport        {fn}       — xuất Excel
 */
const FilterBar = ({
    dateType,
    setDateType,
    selectedFilter,
    setSelectedFilter,
    customDates,
    setCustomDates,
    onPrint,
    onExport,
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center my-8 p-5 bg-white rounded-2xl shadow-sm border border-gray-100 gap-4">

            {/* ── BỘ LỌC BÊN TRÁI ── */}
            <div className="flex flex-wrap items-center gap-4">

                {/* Toggle: Ngày nhận / Hẹn giao */}
                <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
                    {['ngayNhan', 'henGiao'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setDateType(type)}
                            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${dateType === type
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {type === 'ngayNhan' ? 'NGÀY NHẬN' : 'HẸN GIAO'}
                        </button>
                    ))}
                </div>

                {/* Dropdown khoảng thời gian */}
                <select
                    className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 outline-none cursor-pointer"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                >
                    {TIME_FILTERS.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                </select>

                {/* Chọn ngày tuỳ chỉnh */}
                {selectedFilter === 'custom' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-200 animate-fade-in">
                        <input
                            type="date"
                            className="text-xs font-medium outline-none"
                            value={customDates.start}
                            onChange={(e) =>
                                setCustomDates({ ...customDates, start: e.target.value })
                            }
                        />
                        <span className="text-gray-300">→</span>
                        <input
                            type="date"
                            className="text-xs font-medium outline-none"
                            value={customDates.end}
                            onChange={(e) =>
                                setCustomDates({ ...customDates, end: e.target.value })
                            }
                        />
                    </div>
                )}
            </div>

            {/* ── NÚT HÀNH ĐỘNG BÊN PHẢI ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onPrint}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                    <Print fontSize="small" /> IN
                </button>

                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                    <Download fontSize="small" /> XUẤT EXCEL
                </button>
            </div>
        </div>
    );
};

export default FilterBar;