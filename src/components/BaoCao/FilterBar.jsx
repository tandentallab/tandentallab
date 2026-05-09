import React from 'react';
import { Print, Download, CalendarMonth } from '@mui/icons-material';

const TIME_FILTERS = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'this_week', label: 'Tuần này' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'last_month', label: 'Tháng trước' },
    { id: 'last_7_days', label: '7 ngày qua' },
    { id: 'last_30_days', label: '30 ngày qua' },
    { id: 'custom', label: 'Tuỳ chọn' },
];

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
        <div className="my-6 space-y-3">

            {/* ══════════════════════════════════════════════════════════════
                HÀNG 1: Toggle ngày nhận/hẹn giao + Pills bộ lọc + Nút hành động
            ══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">

                {/* Toggle: Ngày nhận / Hẹn giao */}
                <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
                    {[
                        { value: 'ngayNhan', label: 'Ngày nhận' },
                        { value: 'henGiao', label: 'Hẹn giao' },
                    ].map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setDateType(value)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${dateType === value
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Divider dọc */}
                <div className="h-7 w-px bg-gray-200 shrink-0" />

                {/* Pills bộ lọc thời gian */}
                <div className="flex flex-wrap gap-1.5 flex-1">
                    {TIME_FILTERS.map((f) => {
                        const isActive = selectedFilter === f.id;
                        const isCustom = f.id === 'custom';
                        return (
                            <button
                                key={f.id}
                                onClick={() => setSelectedFilter(f.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap border ${isActive
                                        ? isCustom
                                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                                            : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                    }`}
                            >
                                {isCustom && <CalendarMonth sx={{ fontSize: 13 }} />}
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Nút hành động */}
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                        onClick={onPrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                    >
                        <Print sx={{ fontSize: 15 }} /> In
                    </button>
                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
                    >
                        <Download sx={{ fontSize: 15 }} /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                HÀNG 2 (chỉ hiện khi chọn "Tuỳ chọn"): Date range picker
            ══════════════════════════════════════════════════════════════ */}
            {selectedFilter === 'custom' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-4 bg-violet-50 border border-violet-200 rounded-2xl shadow-sm">

                    <div className="flex items-center gap-2 shrink-0">
                        <CalendarMonth sx={{ fontSize: 20, color: '#7c3aed' }} />
                        <span className="text-sm font-bold text-violet-700">Chọn khoảng ngày</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">

                        {/* Ngày bắt đầu */}
                        <div className="flex flex-col gap-1 flex-1 w-full">
                            <label className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={customDates.start}
                                max={customDates.end}
                                onChange={(e) =>
                                    setCustomDates((prev) => ({ ...prev, start: e.target.value }))
                                }
                                className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 bg-white border-2 border-violet-200 rounded-xl outline-none focus:border-violet-500 transition-colors cursor-pointer"
                            />
                        </div>

                        {/* Arrow */}
                        <div className="text-violet-300 font-bold text-xl mt-4 hidden sm:block">→</div>

                        {/* Ngày kết thúc */}
                        <div className="flex flex-col gap-1 flex-1 w-full">
                            <label className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={customDates.end}
                                min={customDates.start}
                                onChange={(e) =>
                                    setCustomDates((prev) => ({ ...prev, end: e.target.value }))
                                }
                                className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 bg-white border-2 border-violet-200 rounded-xl outline-none focus:border-violet-500 transition-colors cursor-pointer"
                            />
                        </div>

                        {/* Hiển thị khoảng đã chọn */}
                        {customDates.start && customDates.end && (
                            <div className="shrink-0 px-4 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl whitespace-nowrap mt-4 sm:mt-0 self-end">
                                {(() => {
                                    const s = new Date(customDates.start);
                                    const e = new Date(customDates.end);
                                    const days = Math.round((e - s) / 86400000) + 1;
                                    return `${days} ngày`;
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;