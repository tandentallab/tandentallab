import React, { useState, useRef } from 'react';
import { Print, CalendarMonth } from '@mui/icons-material';
import dayjs from 'dayjs';
import CustomDateRangePicker from '../../common/CustomDateRangePicker';

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

/* Field kiểu MUI standard — label trên, underline dưới */
const FieldWrapper = ({ label, children }) => (
    <div className="flex flex-col gap-1 min-w-0">
        <span className="text-sm text-gray-500 leading-none">{label}</span>
        <div className="flex items-center border-b-2 border-gray-400 pb-1">
            {children}
        </div>
    </div>
);

const DynamicFilterBar = ({
    selectedFilter, setSelectedFilter,
    customDates, setCustomDates,
    onView,
    showPrintButton,
    onPrint,
    extraFilters,
    extraFilterLabel
}) => {
    const filterContainerRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleSelectChange = (e) => {
        const val = e.target.value;
        setSelectedFilter(val);
        if (val === 'custom') setAnchorEl(filterContainerRef.current);
        else setAnchorEl(null);
    };

    return (
        <div className="mb-2" ref={filterContainerRef}>
            <div className="flex flex-wrap items-end gap-4 px-4">

                {/* 1. THỜI GIAN */}
                <FieldWrapper label="Thời gian">
                    <select
                        value={selectedFilter}
                        onChange={handleSelectChange}
                        className="text-base font-medium text-gray-900 bg-transparent outline-none cursor-pointer appearance-none pr-7"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 2px center',
                        }}
                    >
                        {TIME_FILTERS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>

                    {/* Nút chọn ngày khi custom — icon calendar + nút clear */}
                    {selectedFilter === 'custom' && (
                        <>
                            <button
                                onClick={() => setAnchorEl(filterContainerRef.current)}
                                className="flex items-center gap-1.5 text-base font-medium text-gray-900 ml-2 hover:text-blue-600 transition-colors"
                            >
                                <CalendarMonth sx={{ fontSize: 20, color: '#6b7280' }} />
                                <span>
                                    {customDates.start && customDates.end
                                        ? `${dayjs(customDates.start).format('DD/MM/YYYY')} - ${dayjs(customDates.end).format('DD/MM/YYYY')}`
                                        : 'Chưa chọn...'}
                                </span>
                            </button>
                            <button
                                onClick={() => setAnchorEl(null)}
                                className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors leading-none text-lg"
                            >
                                ×
                            </button>
                        </>
                    )}
                </FieldWrapper>

                {/* 2. BỘ LỌC LOẠI */}
                {extraFilters && (
                    <div className="flex flex-col gap-1" style={{ minWidth: 180 }}>
                        <span className="text-sm text-gray-500 leading-none">{extraFilterLabel || 'Loại'}</span>
                        <div className="text-base font-medium text-gray-900">
                            {extraFilters}
                        </div>
                    </div>
                )}

                {/* 3. NÚT XEM */}
                <button
                    onClick={onView}
                    className="px-8 py-2 bg-green-600 text-white text-base font-bold rounded-full hover:bg-green-700 transition-all shadow-sm active:scale-95 shrink-0"
                >
                    Xem
                </button>

                {/* 4. NÚT IN */}
                {showPrintButton && (
                    <div className="ml-auto shrink-0">
                        <button
                            onClick={onPrint}
                            className="flex items-center gap-2 px-4 py-1.5 text-gray-700 text-base font-semibold border-b-2 border-gray-400 hover:text-blue-600 hover:border-blue-400 transition-all active:scale-95"
                        >
                            <Print sx={{ fontSize: 18 }} /> In
                        </button>
                    </div>
                )}
            </div>

            <CustomDateRangePicker
                open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
                initialDates={customDates}
                onApply={(dates) => { setCustomDates(dates); setAnchorEl(null); }}
            />
        </div>
    );
};

export default DynamicFilterBar;