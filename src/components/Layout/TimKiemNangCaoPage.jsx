import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { api } from '../../config/api';
import dayjs from 'dayjs';
import {
    EXPORT_DATE_PRESETS,
    EMPTY_EXPORT_DATE_FILTER,
    toISODateRange,
    isValidExportDateFilter,
    isCustomRangeTooLong,
} from '../../utils/exportDatePresets';

// ─────────────────────────────────────────
// Helper: format range để hiển thị trên ô
// ─────────────────────────────────────────
const formatDisplayRange = (filter) => {
    if (!filter?.preset) return '';

    if (filter.preset !== 'custom') {
        const found = EXPORT_DATE_PRESETS.find((p) => p.key === filter.preset);
        return found?.label || '';
    }

    // custom
    const from = filter.startDate ? dayjs(filter.startDate).format('DD/MM/YYYY') : '?';
    const to = filter.endDate ? dayjs(filter.endDate).format('DD/MM/YYYY') : '?';
    return `${from} – ${to}`;
};

// ─────────────────────────────────────────
// Component DateFilterField
// ─────────────────────────────────────────
const DateFilterField = ({ label, filterKey, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Đóng khi click ra ngoài
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleSelectPreset = (presetKey) => {
        onChange({ preset: presetKey, startDate: null, endDate: null });
        if (presetKey !== 'custom') setOpen(false);
    };

    const handleCustomDate = (field, raw) => {
        const date = raw ? new Date(raw) : null;
        onChange({ ...value, preset: 'custom', [field]: date });
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(EMPTY_EXPORT_DATE_FILTER);
        setOpen(false);
    };

    const displayText = formatDisplayRange(value);
    const hasValue = Boolean(value?.preset);
    const isCustomTooLong =
        value?.preset === 'custom' &&
        isCustomRangeTooLong(value.startDate, value.endDate, 90);

    return (
        <Box ref={containerRef} sx={{ mt: 3, position: 'relative' }}>
            <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5, userSelect: 'none' }}>
                {label}
            </Typography>

            {/* ── Trigger row ── */}
            <Box
                onClick={() => setOpen((o) => !o)}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `1px solid ${open ? '#03a9f4' : '#ccc'}`,
                    pb: 0.5,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                    '&:hover': { borderBottomColor: '#03a9f4' },
                }}
            >
                <Typography
                    sx={{
                        fontSize: '13px',
                        color: hasValue ? '#1a1a1a' : '#aaa',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {displayText || 'Từ – Đến'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
                    {hasValue && (
                        <Box
                            component="span"
                            onClick={handleClear}
                            sx={{
                                fontSize: '14px',
                                color: '#aaa',
                                lineHeight: 1,
                                cursor: 'pointer',
                                '&:hover': { color: '#f44336' },
                                px: 0.25,
                            }}
                        >
                            ✕
                        </Box>
                    )}
                    <CalendarTodayIcon
                        sx={{ fontSize: 16, color: open ? '#03a9f4' : '#888', transition: 'color 0.15s' }}
                    />
                </Box>
            </Box>

            {/* ── Dropdown panel ── */}
            {open && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 999,
                        mt: 0.5,
                        bgcolor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid #e8eaf0',
                        overflow: 'hidden',
                    }}
                >
                    {/* Danh sách preset */}
                    {EXPORT_DATE_PRESETS.map((preset) => {
                        const selected = value?.preset === preset.key;
                        return (
                            <Box
                                key={preset.key}
                                onClick={() => handleSelectPreset(preset.key)}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: selected ? '#e8f6ff' : 'transparent',
                                    color: selected ? '#03a9f4' : '#333',
                                    fontWeight: selected ? 600 : 400,
                                    borderLeft: selected ? '3px solid #03a9f4' : '3px solid transparent',
                                    transition: 'background 0.1s',
                                    '&:hover': { bgcolor: selected ? '#e8f6ff' : '#f5f6fa' },
                                }}
                            >
                                {preset.label}
                            </Box>
                        );
                    })}

                    {/* Custom date inputs — chỉ hiện khi chọn "Chọn trên Lịch" */}
                    {value?.preset === 'custom' && (
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <input
                                    type="date"
                                    value={value.startDate ? dayjs(value.startDate).format('YYYY-MM-DD') : ''}
                                    onChange={(e) => handleCustomDate('startDate', e.target.value)}
                                    style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        border: 'none',
                                        borderBottom: '1px solid #ccc',
                                        outline: 'none',
                                        padding: '2px 0',
                                        background: 'transparent',
                                        color: '#333',
                                    }}
                                />
                                <Typography sx={{ fontSize: '12px', color: '#999' }}>–</Typography>
                                <input
                                    type="date"
                                    value={value.endDate ? dayjs(value.endDate).format('YYYY-MM-DD') : ''}
                                    onChange={(e) => handleCustomDate('endDate', e.target.value)}
                                    style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        border: 'none',
                                        borderBottom: '1px solid #ccc',
                                        outline: 'none',
                                        padding: '2px 0',
                                        background: 'transparent',
                                        color: '#333',
                                    }}
                                />
                            </Box>

                            {isCustomTooLong && (
                                <Typography sx={{ fontSize: '11px', color: '#f44336' }}>
                                    Khoảng thời gian quá dài (tối đa 90 ngày)
                                </Typography>
                            )}

                            {/* Nút Áp dụng */}
                            {value.startDate && value.endDate && !isCustomTooLong && (
                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => setOpen(false)}
                                    sx={{
                                        mt: 0.5,
                                        bgcolor: '#03a9f4',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#0097e6' },
                                    }}
                                >
                                    Áp dụng
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

// ─────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────
const TimKiemNangCaoPage = ({ onClose }) => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        tuKhoa: '',
        khachHang: '',
        bacSi: '',
        benhNhan: '',
    });

    const [dateFilters, setDateFilters] = useState({
        ngayNhan: { ...EMPTY_EXPORT_DATE_FILTER },
        henGiao: { ...EMPTY_EXPORT_DATE_FILTER },
        daHoanThanh: { ...EMPTY_EXPORT_DATE_FILTER },
    });

    const setDateFilter = (key, val) =>
        setDateFilters((prev) => ({ ...prev, [key]: val }));

    // Khóa thanh cuộn trang gốc
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    // Lấy dữ liệu đơn hàng
    useEffect(() => {
        const fetchRealOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get('/donhang', { params: { page: 1, limit: 1000 } });
                const data = res.data?.data || res.data || [];
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error('Lỗi tải danh sách đơn hàng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRealOrders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    // ── Lọc ngày helper ──
    const isInRange = (dateStr, isoFrom, isoTo) => {
        if (!dateStr) return false;
        const d = new Date(dateStr).getTime();
        const from = isoFrom ? new Date(isoFrom).getTime() : null;
        const to = isoTo ? new Date(isoTo).getTime() : null;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
    };

    const handleSearch = () => {
        const { tuKhoa, khachHang, bacSi, benhNhan } = filters;

        // ISO ranges từ preset helpers
        const { fromISO: ngayNhanFrom, toISO: ngayNhanTo } = toISODateRange(dateFilters.ngayNhan);
        const { fromISO: henGiaoFrom, toISO: henGiaoTo } = toISODateRange(dateFilters.henGiao);
        const { fromISO: hoanThanhFrom, toISO: hoanThanhTo } = toISODateRange(dateFilters.daHoanThanh);

        const result = orders.filter((dh) => {
            // Text filters
            const matchTuKhoa = !tuKhoa.trim() ||
                (dh.maDonHang?.toLowerCase().includes(tuKhoa.toLowerCase().trim()));

            const matchKhachHang = !khachHang.trim() ||
                (dh.nhaKhoa && (
                    dh.nhaKhoa.hoVaTen?.toLowerCase().includes(khachHang.toLowerCase().trim()) ||
                    dh.nhaKhoa.tenGiaoDich?.toLowerCase().includes(khachHang.toLowerCase().trim())
                ));

            const matchBacSi = !bacSi.trim() ||
                dh.bacSi?.hoVaTen?.toLowerCase().includes(bacSi.toLowerCase().trim());

            const matchBenhNhan = !benhNhan.trim() ||
                dh.benhNhan?.hoVaTen?.toLowerCase().includes(benhNhan.toLowerCase().trim());

            // Date filters
            const matchNgayNhan = !ngayNhanFrom && !ngayNhanTo
                ? true
                : isInRange(dh.ngayNhan, ngayNhanFrom, ngayNhanTo);

            const matchHenGiao = !henGiaoFrom && !henGiaoTo
                ? true
                : isInRange(dh.henGiao, henGiaoFrom, henGiaoTo);

            const matchHoanThanh = !hoanThanhFrom && !hoanThanhTo
                ? true
                : isInRange(dh.ngayHoanThanh || dh.completedAt, hoanThanhFrom, hoanThanhTo);

            return matchTuKhoa && matchKhachHang && matchBacSi && matchBenhNhan
                && matchNgayNhan && matchHenGiao && matchHoanThanh;
        });

        setFilteredOrders(result);
    };

    // 🔥 HÀM XỬ LÝ KHI CLICK CHUYỂN TRANG
    const handleRowClick = (orderId) => {
        if (!orderId) return;

        // 1. Đóng cái Form tìm kiếm này lại trước
        onClose();

        // 2. Ép nó đợi 100ms để dọn sạch UI cũ, sau đó mới gọi chuyển trang
        setTimeout(() => {
            navigate(`/donhang/${orderId}/edit`);
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-[1299] bg-[#f5f6fa] flex flex-col w-full h-full overflow-hidden">

            {/* --- TOP HEADER BAR --- */}
            <Box sx={{
                bgcolor: '#00a8ff',
                color: 'white',
                px: 2,
                py: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                flexShrink: 0,
            }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Đơn hàng
                </Typography>
                <IconButton color="inherit" size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* --- MAIN CONTAINER --- */}
            <Box sx={{
                display: 'flex',
                flex: 1,
                overflow: { xs: 'auto', sm: 'hidden' },
                flexDirection: { xs: 'column', sm: 'row' },
            }}>

                {/* ═══ [1] BỘ LỌC ═══ */}
                <Box sx={{
                    width: { xs: '100%', sm: '300px' },
                    bgcolor: '#f5f6fa',
                    p: { xs: 2, sm: 3 },
                    borderRight: { sm: '1px solid #e0e0e0' },
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    overflowY: { xs: 'visible', sm: 'auto' },
                }}>
                    <Box sx={{
                        bgcolor: 'white',
                        p: 3,
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}>
                        <TextField
                            name="tuKhoa"
                            placeholder="Nhập mã đơn hàng, từ khóa..."
                            variant="standard"
                            fullWidth
                            value={filters.tuKhoa}
                            onChange={handleChange}
                            InputProps={{ style: { fontSize: '14px', paddingBottom: '4px' } }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            name="khachHang"
                            label="Khách hàng"
                            variant="standard"
                            fullWidth
                            value={filters.khachHang}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true, style: { fontSize: '14px', color: '#666' } }}
                            InputProps={{ style: { fontSize: '14px', paddingBottom: '4px' } }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            name="bacSi"
                            label="Bác sĩ"
                            variant="standard"
                            fullWidth
                            value={filters.bacSi}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true, style: { fontSize: '14px', color: '#666' } }}
                            InputProps={{ style: { fontSize: '14px', paddingBottom: '4px' } }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            name="benhNhan"
                            label="Bệnh nhân"
                            variant="standard"
                            fullWidth
                            value={filters.benhNhan}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true, style: { fontSize: '14px', color: '#666' } }}
                            InputProps={{ style: { fontSize: '14px', paddingBottom: '4px' } }}
                        />

                        <DateFilterField
                            label="Ngày nhận"
                            filterKey="ngayNhan"
                            value={dateFilters.ngayNhan}
                            onChange={(val) => setDateFilter('ngayNhan', val)}
                        />
                        <DateFilterField
                            label="Hẹn giao"
                            filterKey="henGiao"
                            value={dateFilters.henGiao}
                            onChange={(val) => setDateFilter('henGiao', val)}
                        />
                        <DateFilterField
                            label="Đã hoàn thành"
                            filterKey="daHoanThanh"
                            value={dateFilters.daHoanThanh}
                            onChange={(val) => setDateFilter('daHoanThanh', val)}
                        />

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                            <Button
                                variant="contained"
                                onClick={handleSearch}
                                sx={{
                                    bgcolor: '#00a8ff',
                                    borderRadius: '999px',
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1,
                                    fontWeight: 'bold',
                                    '&:hover': { bgcolor: '#0097e6' },
                                }}
                            >
                                Tìm kiếm
                            </Button>
                        </Box>

                    </Box>
                </Box>

                {/* ═══ [2] DANH SÁCH ĐƠN HÀNG ═══ */}
                <Box sx={{
                    flex: 1,
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: { xs: 'visible', sm: 'hidden' },
                }}>
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end', mb: 1 }}>
                        <IconButton size="small"><MoreVertIcon /></IconButton>
                    </Box>

                    {/* PC: Table */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            display: { xs: 'none', sm: 'block' },
                            flex: 1,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            overflowX: 'auto',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': { height: 8, width: 8 },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 8 },
                            '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#94a3b8' },
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress size={40} sx={{ color: '#00a8ff' }} />
                            </Box>
                        ) : (
                            <Table stickyHeader size="small" sx={{ minWidth: 600 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold', py: 1.5 }}>Số</TableCell>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold' }}>Nhận lúc</TableCell>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold' }}>Nha khoa</TableCell>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold' }}>Bác sĩ</TableCell>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold' }}>Bệnh nhân</TableCell>
                                        <TableCell sx={{ color: '#00a8ff', fontWeight: 'bold' }}>Hẹn giao</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredOrders.map((row, index) => (
                                        <TableRow
                                            key={row._id || index}
                                            hover
                                            onClick={() => handleRowClick(row._id)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:nth-of-type(even)': { bgcolor: '#f9f9f9' }
                                            }}
                                        >
                                            <TableCell sx={{ fontSize: '13px', py: 1.5 }}>{row.maDonHang || '---'}</TableCell>
                                            <TableCell sx={{ fontSize: '13px' }}>{row.ngayNhan ? dayjs(row.ngayNhan).format('DD/MM/YYYY HH:mm') : ''}</TableCell>
                                            <TableCell sx={{ fontSize: '13px' }}>{row.nhaKhoa?.hoVaTen || row.nhaKhoa?.tenGiaoDich || ''}</TableCell>
                                            <TableCell sx={{ fontSize: '13px' }}>{row.bacSi?.hoVaTen || ''}</TableCell>
                                            <TableCell sx={{ fontSize: '13px' }}>{row.benhNhan?.hoVaTen || ''}</TableCell>
                                            <TableCell sx={{ fontSize: '13px' }}>{row.henGiao ? dayjs(row.henGiao).format('DD/MM/YYYY HH:mm') : ''}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>

                    {/* Mobile: Card list */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%', mt: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold', mb: 1, pl: 0.5 }}>
                            Kết quả tìm kiếm ({filteredOrders.length} dòng):
                        </Typography>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
                                <CircularProgress size={40} sx={{ color: '#00a8ff' }} />
                            </Box>
                        ) : (
                            filteredOrders.map((row, index) => (
                                <Box
                                    key={row._id || index}
                                    onClick={() => handleRowClick(row._id)}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: '12px',
                                        p: 2,
                                        mb: 1.5,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        border: '1px solid #eef0f5',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        '&:hover': { bgcolor: '#f9fafa' }
                                    }}
                                >
                                    {[
                                        { label: 'Số', val: row.maDonHang, isBold: true },
                                        { label: 'Nhận lúc', val: row.ngayNhan ? dayjs(row.ngayNhan).format('DD/MM/YYYY HH:mm') : '' },
                                        { label: 'Nha Khoa', val: row.nhaKhoa?.hoVaTen || row.nhaKhoa?.tenGiaoDich || '' },
                                        { label: 'Bác Sĩ', val: row.bacSi?.hoVaTen || '' },
                                        { label: 'Bệnh nhân', val: row.benhNhan?.hoVaTen || '' },
                                        { label: 'Hẹn giao', val: row.henGiao ? dayjs(row.henGiao).format('DD/MM/YYYY HH:mm') : '' },
                                    ].map((item, i) => (
                                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6 }}>
                                            <Typography sx={{ fontSize: '13px', color: '#888888' }}>{item.label}</Typography>
                                            <Typography sx={{ fontSize: '13px', color: '#333333', fontWeight: item.isBold ? 'bold' : '500', textAlign: 'right', pl: 2 }}>
                                                {item.val || '---'}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ))
                        )}

                        {!loading && filteredOrders.length === 0 && (
                            <Typography variant="body2" sx={{ textAlign: 'center', color: '#888', py: 4, fontStyle: 'italic' }}>
                                Không tìm thấy đơn hàng nào.
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, pr: 0.5 }}>
                        <Typography sx={{ fontSize: '12px', color: '#666' }}>
                            Số dòng: {filteredOrders.length}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default TimKiemNangCaoPage;