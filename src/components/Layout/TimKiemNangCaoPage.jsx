import React, { useState, useEffect } from 'react';
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

const TimKiemNangCaoPage = ({ onClose }) => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        tuKhoa: '',
        khachHang: '',
        bacSi: '',
        benhNhan: '',
    });

    // Khóa thanh cuộn trang gốc khi mở màn hình này lên
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Lấy dữ liệu đơn hàng thật từ server
    useEffect(() => {
        const fetchRealOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get('/donhang', { params: { page: 1, limit: 1000 } });
                const data = res.data?.data || res.data || [];
                setOrders(data);
                setFilteredOrders(data);
            } catch (error) {
                console.error("Lỗi tải danh sách đơn hàng thật:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRealOrders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý lọc dữ liệu khi bấm nút Tìm kiếm
    const handleSearch = () => {
        const { tuKhoa, khachHang, bacSi, benhNhan } = filters;

        const result = orders.filter(dh => {
            const matchTuKhoa = !tuKhoa.trim() ||
                (dh.maDonHang && dh.maDonHang.toLowerCase().includes(tuKhoa.toLowerCase().trim()));

            const matchKhachHang = !khachHang.trim() ||
                (dh.nhaKhoa && (
                    (dh.nhaKhoa.hoVaTen && dh.nhaKhoa.hoVaTen.toLowerCase().includes(khachHang.toLowerCase().trim())) ||
                    (dh.nhaKhoa.tenGiaoDich && dh.nhaKhoa.tenGiaoDich.toLowerCase().includes(khachHang.toLowerCase().trim()))
                ));

            const matchBacSi = !bacSi.trim() ||
                (dh.bacSi && dh.bacSi.hoVaTen && dh.bacSi.hoVaTen.toLowerCase().includes(bacSi.toLowerCase().trim()));

            const matchBenhNhan = !benhNhan.trim() ||
                (dh.benhNhan && dh.benhNhan.hoVaTen && dh.benhNhan.hoVaTen.toLowerCase().includes(benhNhan.toLowerCase().trim()));

            return matchTuKhoa && matchKhachHang && matchBacSi && matchBenhNhan;
        });

        setFilteredOrders(result);
    };

    const DateFilterMock = ({ label, value }) => (
        <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>{label}</Typography>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #ccc',
                    pb: 0.5,
                    cursor: 'pointer',
                    '&:hover': { borderBottomColor: '#03a9f4' }
                }}
                onClick={() => alert(`Mở popup chọn ngày cho: ${label}`)}
            >
                <Typography sx={{ fontSize: '14px', color: value ? '#333' : '#aaa' }}>
                    {value || 'Từ – Đến'}
                </Typography>
                <CalendarTodayIcon sx={{ fontSize: 18, color: '#666' }} />
            </Box>
        </Box>
    );

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
                flexShrink: 0
            }}>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                    Đơn hàng
                </Typography>
                <IconButton color="inherit" size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* --- MAIN CONTAINER --- */}
            {/* 👉 Trên mobile (xs) cho phép cuộn dọc toàn màn hình (overflow: 'auto') để Bộ lọc và Danh sách đi liền mạch */}
            <Box sx={{
                display: 'flex',
                flex: 1,
                overflow: { xs: 'auto', sm: 'hidden' },
                flexDirection: { xs: 'column', sm: 'row' }
            }}>

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* [1] GIAO DIỆN BỘ LỌC (HIỂN THỊ ĐẦU TIÊN)                        */}
                {/* ═════════════════════════════════════════════════════════════ */}
                <Box sx={{
                    width: { xs: '100%', sm: '300px' },
                    bgcolor: '#f5f6fa',
                    p: { xs: 2, sm: 3 },
                    borderRight: { sm: '1px solid #e0e0e0' },
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    overflowY: { xs: 'visible', sm: 'auto' } // Mobile không tạo khung cuộn con để tránh kẹt tay
                }}>
                    {/* Thẻ trắng bo tròn chứa bộ lọc giống hệt Ảnh 1 */}
                    <Box sx={{ bgcolor: 'white', p: 3, borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
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

                        <DateFilterMock label="Ngày nhận" value="08/4/2026 - 07/5/2026" />
                        <DateFilterMock label="Hẹn giao" value="" />
                        <DateFilterMock label="Đã hoàn thành" value="" />

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
                                    '&:hover': { bgcolor: '#0097e6' }
                                }}
                            >
                                Tìm kiếm
                            </Button>
                        </Box>

                        <IconButton sx={{ position: 'absolute', bottom: 12, right: 12, color: '#333' }}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* ═════════════════════════════════════════════════════════════ */}
                {/* [2] GIAO DIỆN DANH SÁCH ĐƠN HÀNG (NẰM NGAY PHÍA DƯỚI TRÊN MOBILE) */}
                {/* ═════════════════════════════════════════════════════════════ */}
                <Box sx={{
                    flex: 1,
                    p: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: { xs: 'visible', sm: 'hidden' } // Mobile để tràn tự nhiên xuôi dòng
                }}>

                    {/* Header thông số dòng trên PC */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'flex-end', mb: 1 }}>
                        <IconButton size="small">
                            <MoreVertIcon />
                        </IconButton>
                    </Box>

                    {/* ── BẢN PC: HIỂN THỊ DẠNG TABLE NGANG CHUẨN ── */}
                    <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', sm: 'block' }, flex: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress size={40} sx={{ color: '#00a8ff' }} />
                            </Box>
                        ) : (
                            <Table stickyHeader size="small">
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
                                        <TableRow key={row._id || index} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
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

                    {/* ── BẢN MOBILE: HIỂN THỊ DẠNG DANH SÁCH CARD XẾP DỌC NGAY PHÍA DƯỚI (ẢNH 2) ── */}
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
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: '12px',
                                        p: 2,
                                        mb: 1.5,
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                        border: '1px solid #eef0f5'
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
                                            <Typography sx={{ fontSize: '13px', color: '#888888' }}>
                                                {item.label}
                                            </Typography>
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

                    {/* Bộ đếm số dòng ở cuối trang */}
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