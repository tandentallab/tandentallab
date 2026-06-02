import React, { useState, useRef } from 'react';
import { Print, CalendarMonth } from '@mui/icons-material';
import dayjs from 'dayjs';
// Sếp nhớ chỉnh lại đường dẫn import cho đúng vị trí sếp lưu component nhé!
import CustomDateRangePicker from '../common/CustomDateRangePicker';

const TIME_FILTERS = [
    { id: 'custom', label: 'Chọn trên lịch' },
    { id: 'today', label: 'Hôm nay' },
    { id: 'yesterday', label: 'Hôm qua' },
    { id: 'this_week', label: 'Tuần này' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'last_month', label: 'Tháng trước' },
    { id: 'last_7_days', label: '7 ngày qua' },
    { id: 'last_30_days', label: '30 ngày qua' },

];

const FilterBar = ({
    dateType,
    setDateType,
    selectedFilter,
    setSelectedFilter,
    customDates,
    setCustomDates,
    onPrint,
}) => {
    const filterContainerRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSelectChange = (e) => {
        const val = e.target.value;
        setSelectedFilter(val);
        if (val === 'custom') {
            setAnchorEl(filterContainerRef.current);
        } else {
            setAnchorEl(null);
        }
    };

    return (
        <div className="my-6">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">

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

                <div className="h-7 w-px bg-gray-200 shrink-0" />

                <div className="flex items-center gap-2" ref={filterContainerRef}>
                    <select
                        value={selectedFilter}
                        onChange={handleSelectChange}
                        className="h-9 px-3 pr-8 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none cursor-pointer hover:border-blue-300 focus:border-blue-400 transition-colors appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                    >
                        {TIME_FILTERS.map((f) => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                        ))}
                    </select>

                    {selectedFilter === 'custom' && (
                        <button
                            onClick={() => setAnchorEl(filterContainerRef.current)}
                            className="h-9 px-3 flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                        >
                            <CalendarMonth sx={{ fontSize: 18 }} />
                            {customDates.start && customDates.end
                                ? `${dayjs(customDates.start).format('DD/MM/YYYY')} - ${dayjs(customDates.end).format('DD/MM/YYYY')}`
                                : "Chưa chọn ngày..."}
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                    <button
                        onClick={onPrint}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                    >
                        <Print sx={{ fontSize: 15 }} /> In
                    </button>
                </div>
            </div>

            {/* Gọi Component Lịch xịn xò đã đóng gói */}
            <CustomDateRangePicker
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                initialDates={customDates}
                onApply={(dates) => {
                    setCustomDates(dates); // Cập nhật state ngày ở cha
                    setAnchorEl(null);     // Tự động đóng Pop-up
                }}
            />
        </div>
    );
};

export default FilterBar;