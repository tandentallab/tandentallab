import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import {
    Box, Typography, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton,
    Table, TableBody, TableCell, TableHead, TableRow,
    TableContainer, TablePagination, Select, MenuItem, FormControl
} from '@mui/material';
import { Edit as EditIcon, ZoomIn as ZoomInIcon } from '@mui/icons-material';

import { napQuyChiPhi, updateChiPhi, fetchLichSuNapQuy } from '../../redux/slices/chiPhiSlice';

const QuyChiPhiWidget = () => {
    const dispatch = useDispatch();
    const thongTinQuy = useSelector((state) => state.chiPhi.thongTinQuy);
    const lichSuNapQuy = useSelector((state) => state.chiPhi.lichSuNapQuy);

    // --- STATE MODALS ---
    const [isNapQuyOpen, setIsNapQuyOpen] = useState(false);
    const [soTienNap, setSoTienNap] = useState('');

    const [isEditQuyOpen, setIsEditQuyOpen] = useState(false);
    const [editQuyTien, setEditQuyTien] = useState('');

    const [isLichSuOpen, setIsLichSuOpen] = useState(false);

    // --- STATE BỘ LỌC LỊCH SỬ ---
    const [filterThang, setFilterThang] = useState(dayjs().month() + 1);
    const [filterNam, setFilterNam] = useState(dayjs().year());

    // --- STATE PHÂN TRANG LỊCH SỬ ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- LOGIC DANH SÁCH THÁNG/NĂM ---
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;

    const years = [];
    for (let y = 2026; y <= currentYear; y++) years.push(y);

    const months = [];
    for (let m = 1; m <= 12; m++) {
        if (filterNam === 2026 && m < 7) continue;
        if (filterNam === currentYear && m > currentMonth) continue;
        months.push(m);
    }

    // --- LOGIC LỌC DỮ LIỆU ---
    const filteredLichSu = lichSuNapQuy.filter(row => {
        const date = dayjs(row.ngayTao);
        return date.month() + 1 === filterThang && date.year() === filterNam;
    });

    // --- HANDLERS ---
    const handleXacNhanNapQuy = () => {
        const tien = Number(soTienNap);
        if (tien > 0) {
            dispatch(napQuyChiPhi(tien));
            setIsNapQuyOpen(false);
            setSoTienNap('');
        }
    };

    const handleOpenEditQuy = () => {
        setEditQuyTien(String(thongTinQuy?.soTienNapCuoi || ''));
        setIsEditQuyOpen(true);
    };

    const handleXacNhanEditQuy = () => {
        const tien = Number(editQuyTien);
        if (tien > 0 && thongTinQuy?.idNapCuoi) {
            dispatch(updateChiPhi({
                id: thongTinQuy.idNapCuoi,
                data: { tenChiPhi: "Nạp tiền quỹ chi phí", loaiChiPhi: "Nạp quỹ", gia: tien }
            }));
            setIsEditQuyOpen(false);
        }
    };

    const handleOpenLichSu = () => {
        dispatch(fetchLichSuNapQuy());
        setIsLichSuOpen(true);
        setPage(0);
    };

    const handleThangChange = (e) => {
        setFilterThang(e.target.value);
        setPage(0);
    };

    const handleNamChange = (e) => {
        setFilterNam(e.target.value);
        setPage(0);
        if (e.target.value === 2026 && filterThang < 7) {
            setFilterThang(7);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- STYLE CUSTOM CHO SELECT ---
    const selectStyles = {
        borderRadius: '8px',
        bgcolor: 'white',
        fontWeight: 600,
        color: '#0c4a6e',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0ea5e9' }
    };

    return (
        <>
            {/* GIAO DIỆN WIDGET CHÍNH */}
            <Box
                className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-1 md:gap-2 bg-white px-3 py-2 md:px-4 rounded-xl border border-slate-200 shadow-sm transition-all"
                sx={{ minWidth: { xs: '100%', md: 650 } }}
            >
                {/* Mobile: grid 10 cột (2 - 5 - 3), 1 dòng, căn giữa */}
                <Box className="w-full grid grid-cols-10 gap-2 items-center md:hidden">
                    {/* Cột 1 - 2: icon kính lúp bên trái */}
                    <Box className="col-span-2 flex items-center justify-start">
                        <ZoomInIcon
                            onClick={handleOpenLichSu}
                            sx={{ fontSize: 40, color: '#0284c7', cursor: 'pointer' }}
                        />
                    </Box>

                    {/* Cột 2 - 5: tồn quỹ + số tiền, căn giữa */}
                    <Box className="col-span-5 flex flex-col items-center justify-center text-center gap-0.5">
                        <Typography noWrap sx={{ fontSize: '1.05rem' }}>
                            <span className="font-bold">Tồn quỹ:</span>{' '}
                            <span
                                style={{
                                    color: thongTinQuy?.soDu < 0 ? '#ef4444' : '#10b981',
                                    fontWeight: 700
                                }}
                            >
                                {new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soDu || 0)} đ
                            </span>
                        </Typography>

                        {thongTinQuy?.lanNapCuoi && (
                            <Typography color="textSecondary" noWrap sx={{ fontSize: '0.9rem' }}>
                                +{new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soTienNapCuoi || 0)}đ ({dayjs(thongTinQuy.lanNapCuoi).format('DD/MM')})
                            </Typography>
                        )}
                    </Box>

                    {/* Cột 3 - 3: 2 icon còn lại bên phải */}
                    <Box className="col-span-3 flex items-center justify-end gap-1.5">
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => setIsNapQuyOpen(true)}
                            sx={{
                                bgcolor: '#0284c7',
                                '&:hover': { bgcolor: '#0369a1' },
                                borderRadius: '100%',
                                textTransform: 'none',
                                minWidth: 'auto',
                                px: 2.25,
                                py: 0.6,
                                fontSize: '1.2rem'
                            }}
                        >
                            +
                        </Button>

                        <IconButton size="small" onClick={handleOpenEditQuy} sx={{ p: 0.5 }}>
                            <EditIcon sx={{ fontSize: 30, color: '#64748b' }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Desktop */}
                <Box className="hidden md:flex md:flex-row md:items-center gap-12 w-full">
                    <IconButton
                        size="small"
                        onClick={handleOpenLichSu}
                        sx={{ bgcolor: 'rgba(241,245,249,.8)', '&:hover': { bgcolor: '#e2e8f0' } }}
                    >
                        <ZoomInIcon sx={{ fontSize: 30, color: '#0284c7' }} />
                    </IconButton>

                    <Box className="flex items-center gap-2">
                        <Typography variant="body1" whiteSpace="nowrap">
                            <b>Tồn quỹ hiện tại:</b>
                        </Typography>

                        <Typography
                            sx={{
                                color: thongTinQuy?.soDu < 0 ? '#ef4444' : '#10b981',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                fontSize: '1.375rem'
                            }}
                        >
                            {new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soDu || 0)} đ
                        </Typography>

                        {thongTinQuy?.lanNapCuoi && (
                            <Typography variant="body1" color="textSecondary" whiteSpace="nowrap">
                                (Lần cuối: <span style={{ fontWeight: 600 }}>
                                    +{new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soTienNapCuoi || 0)}đ
                                </span> - {dayjs(thongTinQuy.lanNapCuoi).format('DD/MM/YY')})
                            </Typography>
                        )}
                    </Box>

                    <Box className="flex-1 flex items-center justify-end gap-1">
                        <Button
                            size="small"
                            variant="contained"
                            sx={{
                                bgcolor: '#0284c7',
                                '&:hover': { bgcolor: '#0369a1' },
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1rem'
                            }}
                            onClick={() => setIsNapQuyOpen(true)}
                        >
                            + Nộp quỹ
                        </Button>

                        <IconButton size="small" onClick={handleOpenEditQuy}>
                            <EditIcon sx={{ fontSize: 24, color: '#64748b' }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>


            {/* MODAL NỘP CHI PHÍ */}
            <Dialog open={isNapQuyOpen} onClose={() => setIsNapQuyOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Nộp tiền vào quỹ</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus fullWidth size="small" label="Số tiền nạp (VNĐ)"
                        value={soTienNap ? new Intl.NumberFormat('vi-VN').format(soTienNap) : ''}
                        onChange={(e) => setSoTienNap(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleXacNhanNapQuy(); } }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsNapQuyOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleXacNhanNapQuy} variant="contained" color="primary" disabled={!soTienNap || soTienNap <= 0}>Xác nhận</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL SỬA TIỀN NẠP LẦN CUỐI */}
            <Dialog open={isEditQuyOpen} onClose={() => setIsEditQuyOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Sửa tiền nộp lần cuối</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus fullWidth size="small" label="Số tiền nạp (VNĐ)"
                        value={editQuyTien ? new Intl.NumberFormat('vi-VN').format(editQuyTien) : ''}
                        onChange={(e) => setEditQuyTien(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleXacNhanEditQuy(); } }}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsEditQuyOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleXacNhanEditQuy} variant="contained" color="primary" disabled={!editQuyTien || editQuyTien <= 0}>Cập nhật</Button>
                </DialogActions>
            </Dialog>

            {/* MODAL HIỂN THỊ LỊCH SỬ NẠP QUỸ */}
            <Dialog open={isLichSuOpen} onClose={() => setIsLichSuOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
                <DialogTitle sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, bgcolor: '#f8fafc', py: 1.5 }}>
                    <Typography sx={{ fontWeight: 700, color: '#0c4a6e', fontSize: '1.1rem' }}>Lịch sử nạp quỹ</Typography>

                    {/* KHU VỰC BỘ LỌC */}
                    <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                        <FormControl size="small" sx={{ flex: { xs: 1, sm: 'none' } }}>
                            <Select value={filterThang} onChange={handleThangChange} sx={selectStyles}>
                                {months.map(m => (
                                    <MenuItem key={m} value={m}>Tháng {m}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ flex: { xs: 1, sm: 'none' } }}>
                            <Select value={filterNam} onChange={handleNamChange} sx={selectStyles}>
                                {years.map(y => (
                                    <MenuItem key={y} value={y}>Năm {y}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 0 }}>
                    <TableContainer sx={{ maxHeight: { xs: '65vh', md: '70vh' } }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>STT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Thời gian nạp</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f1f5f9' }}>Số tiền (VNĐ)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLichSu.length > 0 ? (
                                    filteredLichSu
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow key={row._id} hover>
                                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                                <TableCell>{dayjs(row.ngayTao).format('DD/MM/YYYY HH:mm')}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: '#10b981' }}>
                                                    +{new Intl.NumberFormat('vi-VN').format(row.gia)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#64748b' }}>
                                            Chưa có lịch sử nạp quỹ trong tháng {filterThang}/{filterNam}.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>

                <DialogActions sx={{ p: 1, px: 2, justifyContent: 'space-between', bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    {filteredLichSu.length > 10 ? (
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={filteredLichSu.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            labelRowsPerPage="Số dòng:"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
                            sx={{ borderBottom: 'none', p: 0 }}
                        />
                    ) : (
                        <Box />
                    )}
                    <Button
                        onClick={() => setIsLichSuOpen(false)}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 'bold' }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default QuyChiPhiWidget;