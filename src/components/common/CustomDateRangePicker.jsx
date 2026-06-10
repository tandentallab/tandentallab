import React, { useState, useMemo, useEffect } from 'react';
import { Popover, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs from 'dayjs';

const CustomDateRangePicker = ({ open, anchorEl, onClose, initialDates, onApply }) => {
    const [tempDates, setTempDates] = useState({ start: '', end: '' });
    const [selectingMode, setSelectingMode] = useState('start');
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    // Mỗi khi mở Popover, đồng bộ lại dữ liệu ngày đã chọn từ component cha truyền vào
    useEffect(() => {
        if (open) {
            const initial = initialDates || { start: '', end: '' };
            setTempDates(initial);
            setSelectingMode('start');
            if (initial.start) {
                setCurrentMonth(dayjs(initial.start));
            } else {
                setCurrentMonth(dayjs());
            }
        }
    }, [open, initialDates]);

    const handleClear = () => {
        setTempDates({ start: '', end: '' });
        setSelectingMode('start');
    };

    const handleApplyInternal = () => {
        if (onApply) {
            onApply(tempDates);
        }
    };

    const daysInMonth = useMemo(() => {
        const start = currentMonth.startOf('month').startOf('week');
        const days = [];
        let d = start;

        // Cố định luôn tạo ra 42 ngày (6 dòng x 7 cột) để chống giật UI
        for (let i = 0; i < 42; i++) {
            days.push(d);
            d = d.add(1, 'day');
        }

        return days;
    }, [currentMonth]);

    const isMondayFirst = currentMonth.startOf('week').day() === 1;
    const dayLabels = isMondayFirst
        ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const handleDateClick = (date) => {
        const formatted = date.format('YYYY-MM-DD');
        if (selectingMode === 'start') {
            setTempDates(prev => ({ ...prev, start: formatted }));
            if (tempDates.end && date.isAfter(dayjs(tempDates.end))) {
                setTempDates(prev => ({ start: formatted, end: '' }));
            }
            setSelectingMode('end');
        } else {
            if (tempDates.start && date.isBefore(dayjs(tempDates.start))) {
                setTempDates(prev => ({ ...prev, start: formatted }));
                setSelectingMode('end');
            } else {
                setTempDates(prev => ({ ...prev, end: formatted }));
            }
        }
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
                sx: { mt: 1, borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }
            }}
        >
            <div className="p-4 w-[320px] select-none">
                <div className="flex justify-between items-center mb-4">
                    <IconButton size="small" onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}>
                        <ChevronLeft />
                    </IconButton>
                    <div className="font-bold text-gray-800">Tháng {currentMonth.format('M/YYYY')}</div>
                    <IconButton size="small" onClick={() => setCurrentMonth(m => m.add(1, 'month'))}>
                        <ChevronRight />
                    </IconButton>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {dayLabels.map(d => (
                        <div key={d} className="text-[11px] font-bold text-gray-400">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center text-sm mb-4 relative z-0">
                    {daysInMonth.map((d, i) => {
                        const isCurrentMonth = d.isSame(currentMonth, 'month');
                        const isStart = tempDates.start && d.isSame(dayjs(tempDates.start), 'day');
                        const isEnd = tempDates.end && d.isSame(dayjs(tempDates.end), 'day');
                        const isBetween = tempDates.start && tempDates.end && d.isAfter(dayjs(tempDates.start), 'day') && d.isBefore(dayjs(tempDates.end), 'day');
                        const isToday = d.isSame(dayjs(), 'day');

                        // Ẩn các ngày không thuộc tháng hiện tại nhưng vẫn giữ khung layout
                        if (!isCurrentMonth) {
                            return <div key={i} className="p-0.5 h-[36px]" />; // Thêm h-[36px] tương đương chiều cao của wrapClass bên dưới để giữ nguyên height
                        }

                        let bgClass = "bg-transparent hover:bg-gray-100 text-gray-800 rounded-lg cursor-pointer";
                        let wrapClass = "p-0.5 h-[36px]"; // Gắn chiều cao cố định để không bị lệch với các ô rỗng

                        if (isStart) {
                            bgClass = "bg-blue-600 text-white font-bold rounded-lg cursor-pointer shadow-md";
                            if (tempDates.end) wrapClass += " bg-blue-50 rounded-l-lg";
                        } else if (isEnd) {
                            bgClass = "bg-blue-600 text-white font-bold rounded-lg cursor-pointer shadow-md";
                            if (tempDates.start) wrapClass += " bg-blue-50 rounded-r-lg";
                        } else if (isBetween) {
                            bgClass = "text-blue-800 font-medium cursor-pointer";
                            wrapClass = "py-0.5 bg-blue-50 h-[36px]";
                        } else if (isToday && !isStart && !isEnd) {
                            bgClass = "text-blue-600 font-bold bg-blue-50 rounded-lg cursor-pointer";
                        }

                        return (
                            <div key={i} className={wrapClass} onClick={() => handleDateClick(d)}>
                                <div className={`h-8 w-8 mx-auto flex items-center justify-center transition-all ${bgClass}`}>
                                    {d.date()}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <hr className="my-3 border-gray-100" />

                <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                        onClick={() => setSelectingMode('start')}
                        className={`flex flex-col items-start p-2 rounded-xl border text-xs transition-colors ${selectingMode === 'start' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                    >
                        <span className={`font-semibold mb-0.5 ${selectingMode === 'start' ? 'text-blue-600' : 'text-gray-500'}`}>Từ ngày</span>
                        <span className={`font-bold ${tempDates.start ? 'text-gray-900' : 'text-gray-400'}`}>
                            {tempDates.start ? dayjs(tempDates.start).format('DD/MM/YYYY') : '--/--/----'}
                        </span>
                    </button>
                    <button
                        onClick={() => setSelectingMode('end')}
                        className={`flex flex-col items-start p-2 rounded-xl border text-xs transition-colors ${selectingMode === 'end' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                    >
                        <span className={`font-semibold mb-0.5 ${selectingMode === 'end' ? 'text-blue-600' : 'text-gray-500'}`}>Đến ngày</span>
                        <span className={`font-bold ${tempDates.end ? 'text-gray-900' : 'text-gray-400'}`}>
                            {tempDates.end ? dayjs(tempDates.end).format('DD/MM/YYYY') : '--/--/----'}
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleClear} className="py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                        Xóa
                    </button>
                    <button onClick={handleApplyInternal} className="py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors active:scale-95">
                        Áp dụng
                    </button>
                </div>
            </div>
        </Popover>
    );
};

export default CustomDateRangePicker;