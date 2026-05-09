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
    { id: 'custom', label: '📅 Tuỳ chọn...' },
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

            {/* ── HÀNG CHÍNH ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">

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

                {/* Divider */}
                <div className="h-7 w-px bg-gray-200 shrink-0" />

                {/* Dropdown bộ lọc thời gian */}
                <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="h-9 px-3 pr-8 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer hover:border-blue-300 focus:border-blue-400 transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                    {TIME_FILTERS.map((f) => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                </select>

                {/* Nút hành động — đẩy sang phải */}
                <div className="flex items-center gap-2 ml-auto shrink-0">
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

            {/* ── DATE RANGE PICKER (chỉ hiện khi chọn Tuỳ chọn) ────────── */}
            {selectedFilter === 'custom' && (
                <div className="flex flex-col sm:flex-row items-center gap-4 px-5 py-4 bg-violet-50 border border-violet-200 rounded-2xl shadow-sm">

                    <div className="flex items-center gap-2 shrink-0">
                        <CalendarMonth sx={{ fontSize: 20, color: '#7c3aed' }} />
                        <span className="text-sm font-bold text-violet-700">Chọn khoảng ngày</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">

                        {/* Từ ngày */}
                        <div className="flex flex-col gap-1 flex-1 w-full">
                            <label className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={customDates.start}
                                max={customDates.end}
                                onChange={(e) => setCustomDates((p) => ({ ...p, start: e.target.value }))}
                                className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 bg-white border-2 border-violet-200 rounded-xl outline-none focus:border-violet-500 transition-colors cursor-pointer"
                            />
                        </div>

                        <div className="text-violet-300 font-bold text-xl mt-4 hidden sm:block">→</div>

                        {/* Đến ngày */}
                        <div className="flex flex-col gap-1 flex-1 w-full">
                            <label className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={customDates.end}
                                min={customDates.start}
                                onChange={(e) => setCustomDates((p) => ({ ...p, end: e.target.value }))}
                                className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 bg-white border-2 border-violet-200 rounded-xl outline-none focus:border-violet-500 transition-colors cursor-pointer"
                            />
                        </div>

                        {/* Badge số ngày */}
                        {customDates.start && customDates.end && (
                            <div className="shrink-0 px-4 py-2.5 bg-violet-600 text-white text-xs font-bold rounded-xl whitespace-nowrap mt-4 sm:mt-0 self-end">
                                {Math.round((new Date(customDates.end) - new Date(customDates.start)) / 86400000) + 1} ngày
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterBar;