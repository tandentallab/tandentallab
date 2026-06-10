import React, { useState, useRef } from 'react';
import { Print, CalendarMonth } from '@mui/icons-material';
import { Select, MenuItem } from '@mui/material';
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

/* GIAO DIỆN GẠCH CHÂN */
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
                    <Select
                        value={selectedFilter}
                        onChange={handleSelectChange}
                        variant="standard"
                        disableUnderline
                        sx={{
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#111827',
                            minWidth: '130px',
                            '& .MuiSelect-select': {
                                py: 0,
                                pl: 0,
                                // 🔥 Thêm flex để icon và chữ căn giữa trên thanh gạch chân
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    mt: 1,
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    '& .MuiMenuItem-root': {
                                        fontSize: '15px',
                                        py: 1.5,
                                        px: 2.5,
                                        transition: 'background-color 0.2s',
                                        '&:hover': {
                                            backgroundColor: '#f1f5f9',
                                        },
                                        '&.Mui-selected': {
                                            backgroundColor: '#e0f2fe',
                                            color: '#0369a1',
                                            fontWeight: 600,
                                            '&:hover': {
                                                backgroundColor: '#bae6fd',
                                            }
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        {TIME_FILTERS.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                                {/* 🔥 THÊM ICON LỊCH BÁ CHÁY VÀO ĐÂY */}
                                {f.id === 'custom' && (
                                    <CalendarMonth sx={{ fontSize: 20, mr: 1, color: '#8c857e' }} />
                                )}
                                {f.label}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Nút chọn ngày khi custom */}
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