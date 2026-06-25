import React, { useState, useMemo, useEffect } from 'react';
import { Popover, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, ArrowBack } from '@mui/icons-material';
import { CalendarMonth } from '@mui/icons-material';
import dayjs from 'dayjs';

const CustomDateRangePicker = ({ open, anchorEl, onClose, initialDates, onApply }) => {
    const [view, setView] = useState('presets');
    const [tempDates, setTempDates] = useState({ start: '', end: '' });
    const [selectingMode, setSelectingMode] = useState('start');
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    useEffect(() => {
        if (open) {
            const initial = initialDates || { start: '', end: '' };
            setTempDates(initial);
            setSelectingMode('start');
            setView('presets');
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

    const handleApplyInternal = (dates) => {
        if (onApply) {
            onApply(dates);
        }
        onClose();
    };

    const presets = useMemo(() => {
        const today = dayjs();
        const dayOfWeek = today.day();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        const startOfThisWeek = today.add(diffToMonday, 'day');
        const endOfThisWeek = startOfThisWeek.add(6, 'day');

        const startOfLastWeek = startOfThisWeek.subtract(7, 'day');
        const endOfLastWeek = startOfLastWeek.add(6, 'day');

        return [
            { label: 'Chọn trên lịch', value: 'custom', icon: <CalendarMonth style={{ fontSize: 18 }} /> },
            { label: 'Hôm nay', getDates: () => ({ start: today.format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }) },
            { label: 'Hôm qua', getDates: () => ({ start: today.subtract(1, 'day').format('YYYY-MM-DD'), end: today.subtract(1, 'day').format('YYYY-MM-DD') }) },
            { label: 'Tuần này', getDates: () => ({ start: startOfThisWeek.format('YYYY-MM-DD'), end: endOfThisWeek.format('YYYY-MM-DD') }) },
            { label: 'Tuần trước', getDates: () => ({ start: startOfLastWeek.format('YYYY-MM-DD'), end: endOfLastWeek.format('YYYY-MM-DD') }) },
            { label: 'Tháng này', getDates: () => ({ start: today.startOf('month').format('YYYY-MM-DD'), end: today.endOf('month').format('YYYY-MM-DD') }) },
            { label: 'Tháng trước', getDates: () => ({ start: today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), end: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD') }) },
            { label: 'Trong vòng 7 ngày', getDates: () => ({ start: today.subtract(6, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }) },
            { label: 'Trong vòng 30 ngày', getDates: () => ({ start: today.subtract(29, 'day').format('YYYY-MM-DD'), end: today.format('YYYY-MM-DD') }) },
        ];
    }, []);

    const handlePresetClick = (preset) => {
        if (preset.value === 'custom') {
            setView('calendar');
        } else {
            // SỬA Ở ĐÂY: Bắn kèm label ra ngoài
            handleApplyInternal({ ...preset.getDates(), label: preset.label });
        }
    };

    const daysInMonth = useMemo(() => {
        const start = currentMonth.startOf('month').startOf('week');
        const days = [];
        let d = start;
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
                sx: { mt: 1, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }
            }}
        >
            {view === 'presets' ? (
                <div style={{ width: '230px', padding: '6px 0', backgroundColor: '#fff' }}>
                    {presets.map((p, idx) => (
                        <div key={idx}>
                            <button
                                onClick={() => handlePresetClick(p)}
                                style={{
                                    width: '100%',
                                    padding: '9px 18px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '13.5px',
                                    color: p.value === 'custom' ? '#055f7d' : '#374151',
                                    fontWeight: p.value === 'custom' ? '600' : '500',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {p.icon}
                                    <span>{p.label}</span>
                                </div>
                            </button>
                            {p.value === 'custom' && (
                                <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="select-none bg-white" style={{ width: '340px', padding: '20px' }}>
                    <div className="flex justify-between items-center mb-4">
                        <IconButton size="small" onClick={() => setView('presets')} title="Quay lại danh sách">
                            <ArrowBack style={{ fontSize: '18px' }} />
                        </IconButton>
                        <div className="font-bold text-gray-800 flex-1 text-center" style={{ fontSize: '15px', marginRight: '28px' }}>
                            Tháng {currentMonth.format('M/YYYY')}
                        </div>
                        <div className="flex gap-0.5">
                            <IconButton size="small" onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}>
                                <ChevronLeft />
                            </IconButton>
                            <IconButton size="small" onClick={() => setCurrentMonth(m => m.add(1, 'month'))}>
                                <ChevronRight />
                            </IconButton>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {dayLabels.map(d => (
                            <div key={d} className="font-bold text-gray-400" style={{ fontSize: '12px' }}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 text-center mb-4 relative z-0" style={{ gap: '6px 0' }}>
                        {daysInMonth.map((d, i) => {
                            const isCurrentMonth = d.isSame(currentMonth, 'month');
                            const isStart = tempDates.start && d.isSame(dayjs(tempDates.start), 'day');
                            const isEnd = tempDates.end && d.isSame(dayjs(tempDates.end), 'day');
                            const isBetween = tempDates.start && tempDates.end && d.isAfter(dayjs(tempDates.start), 'day') && d.isBefore(dayjs(tempDates.end), 'day');
                            const isToday = d.isSame(dayjs(), 'day');

                            if (!isCurrentMonth) {
                                return (
                                    <div key={i} className="relative py-1">
                                        <div style={{ width: '32px', height: '32px', margin: '0 auto' }}></div>
                                    </div>
                                );
                            }

                            let wrapClass = "relative flex justify-center items-center py-1";
                            if (isStart && tempDates.end) wrapClass += " bg-blue-50 rounded-l-full";
                            else if (isEnd && tempDates.start) wrapClass += " bg-blue-50 rounded-r-full";
                            else if (isBetween) wrapClass += " bg-blue-50";

                            let btnClass = "flex items-center justify-center rounded-full cursor-pointer transition-colors";
                            let btnStyle = { width: '32px', height: '32px', fontSize: '14px' };

                            if (isStart || isEnd) {
                                btnClass += " bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700";
                            } else if (isBetween) {
                                btnClass += " text-blue-800 font-medium hover:bg-blue-200";
                            } else if (isToday && !isStart && !isEnd) {
                                btnClass += " text-blue-600 font-bold bg-blue-100 hover:bg-blue-200";
                            } else {
                                btnClass += " text-gray-700 hover:bg-gray-100";
                            }

                            return (
                                <div key={i} className={wrapClass} onClick={() => handleDateClick(d)}>
                                    <div className={btnClass} style={btnStyle}>
                                        {d.date()}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <hr className="border-gray-200" style={{ margin: '16px 0' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setSelectingMode('start')}
                                className={`flex-1 flex flex-col items-start border text-left transition-colors ${selectingMode === 'start' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                                style={{ padding: '8px 12px', borderRadius: '8px' }}
                            >
                                <span className={`font-semibold uppercase mb-1 ${selectingMode === 'start' ? 'text-blue-600' : 'text-gray-500'}`} style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Từ ngày</span>
                                <span className={`font-bold ${tempDates.start ? 'text-gray-900' : 'text-gray-400'}`} style={{ fontSize: '13px' }}>
                                    {tempDates.start ? dayjs(tempDates.start).format('DD/MM/YYYY') : '--/--/----'}
                                </span>
                            </button>
                            <button
                                onClick={() => setSelectingMode('end')}
                                className={`flex-1 flex flex-col items-start border text-left transition-colors ${selectingMode === 'end' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                                style={{ padding: '8px 12px', borderRadius: '8px' }}
                            >
                                <span className={`font-semibold uppercase mb-1 ${selectingMode === 'end' ? 'text-blue-600' : 'text-gray-500'}`} style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Đến ngày</span>
                                <span className={`font-bold ${tempDates.end ? 'text-gray-900' : 'text-gray-400'}`} style={{ fontSize: '13px' }}>
                                    {tempDates.end ? dayjs(tempDates.end).format('DD/MM/YYYY') : '--/--/----'}
                                </span>
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={handleClear} className="flex-1 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors" style={{ padding: '10px 0', borderRadius: '8px', fontSize: '13px' }}>
                                Xóa
                            </button>
                            {/* SỬA Ở ĐÂY: Gắn thêm label khi người dùng tự chọn ngày */}
                            <button onClick={() => handleApplyInternal({ ...tempDates, label: '📅 Chọn trên lịch' })} className="flex-1 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors" style={{ padding: '10px 0', borderRadius: '8px', fontSize: '13px' }}>
                                Áp dụng
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </Popover>
    );
};

export default CustomDateRangePicker;