import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Box, Tabs, Tab, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material'; // Thêm icon Edit

import ConfirmModal from './ConfirmModal';
import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiHangNgay from './ChiPhiHangNgay';
import BaoCaoChiPhi from './BaoCaoChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi';

import { fetchChiPhi, addChiPhi, deleteChiPhi, fetchLoaiChiPhi, fetchQuyChiPhi, napQuyChiPhi, updateChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const ChiPhiPage = () => {
    const dispatch = useDispatch();
    const { danhSachChiPhi, isLoading } = useSelector(getChiPhiSelector);
    const thongTinQuy = useSelector((state) => state.chiPhi.thongTinQuy);

    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.quyenSuDung?.ten?.toLowerCase() === "admin" || user?.appRole?.toLowerCase() === "admin";

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const [filter, setFilter] = useState({
        ngay: 0,
        thang: now.month() + 1,
        nam: now.year(),
    });

    const [currentTab, setCurrentTab] = useState(0);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [isNapQuyOpen, setIsNapQuyOpen] = useState(false);
    const [soTienNap, setSoTienNap] = useState('');

    // State mới cho việc Edit lần nạp cuối
    const [isEditQuyOpen, setIsEditQuyOpen] = useState(false);
    const [editQuyTien, setEditQuyTien] = useState('');

    useEffect(() => {
        dispatch(fetchChiPhi(filter));
        dispatch(fetchLoaiChiPhi());
        dispatch(fetchQuyChiPhi());
    }, [dispatch, filter]);

    const handleAddChiPhi = (data) => { dispatch(addChiPhi(data)); };

    const handleDeleteChiPhi = (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) dispatch(deleteChiPhi(itemToDelete));
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleXacNhanNapQuy = () => {
        const tien = Number(soTienNap);
        if (tien > 0) {
            dispatch(napQuyChiPhi(tien));
            setIsNapQuyOpen(false);
            setSoTienNap('');
        }
    };

    // Hàm mở modal Edit và nạp sẵn số tiền cũ
    const handleOpenEditQuy = () => {
        setEditQuyTien(String(thongTinQuy?.soTienNapCuoi || ''));
        setIsEditQuyOpen(true);
    };

    // Hàm submit Edit cập nhật lại lần nạp cuối
    const handleXacNhanEditQuy = () => {
        const tien = Number(editQuyTien);
        if (tien > 0 && thongTinQuy?.idNapCuoi) {
            dispatch(updateChiPhi({
                id: thongTinQuy.idNapCuoi,
                data: {
                    tenChiPhi: "Nạp tiền quỹ chi phí",
                    loaiChiPhi: "Nạp quỹ",
                    gia: tien
                }
            }));
            setIsEditQuyOpen(false);
        }
    };

    const QuyChiPhiWidget = () => (
        <Box className="flex flex-col items-end bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm" sx={{ minWidth: 260 }}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" textTransform="uppercase">
                Tồn quỹ hiện tại
            </Typography>

            <Typography variant="h6" sx={{ color: thongTinQuy?.soDu < 0 ? '#ef4444' : '#10b981', fontWeight: 700, lineHeight: 1.2 }}>
                {new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soDu || 0)} đ
            </Typography>

            <Box className="flex flex-col items-end mt-1">


                {thongTinQuy?.lanNapCuoi && (
                    <Box className="flex items-center gap-1">
                        <Typography variant="caption" color="textSecondary">
                            Lần cuối: <span style={{ fontWeight: 600 }}>+{new Intl.NumberFormat('vi-VN').format(thongTinQuy?.soTienNapCuoi || 0)}đ</span> ({dayjs(thongTinQuy.lanNapCuoi).format('DD/MM/YY')})
                        </Typography>
                        {/* Icon Edit cập nhật lần nạp cuối */}
                        <IconButton size="small" onClick={handleOpenEditQuy} sx={{ padding: '2px' }}>
                            <EditIcon sx={{ fontSize: 14, color: '#64748b' }} />
                        </IconButton>
                    </Box>
                )}
            </Box>

            <Button
                size="small"
                variant="contained"
                sx={{ mt: 1, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, borderRadius: '8px', textTransform: 'none', px: 2, width: '100%' }}
                onClick={() => setIsNapQuyOpen(true)}
            >
                + Nộp chi phí
            </Button>
        </Box>
    );

    return (
        <Box className="bg-slate-50 px-2 mb-2 relative flex flex-col" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {isAdmin ? (
                currentTab === 1 ? (
                    <Box
                        className="mt-3 mb-4 gap-4"
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gridTemplateRows: '4fr 6fr',
                            gridTemplateAreas: { xs: `"tabs" "filter" "report"`, md: `"tabs report" "filter report"` },
                        }}
                    >
                        <Box sx={{ gridArea: 'tabs', display: 'flex' }}>
                            <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }, '& .Mui-selected': { color: '#0284c7' } }}>
                                <Tab label="CHI PHÍ HẰNG NGÀY" />
                                <Tab label="BÁO CÁO TỔNG HỢP" />
                            </Tabs>
                        </Box>
                        <Box sx={{ gridArea: 'filter', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                            <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                        </Box>
                        <Box sx={{ gridArea: 'report', display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{ width: '100%' }}><BaoCaoThuChi filter={filter} /></Box>
                        </Box>
                    </Box>
                ) : (
                    <Box className="flex flex-col mt-3 gap-4">
                        <Box className="flex justify-between items-start w-full">
                            <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }, '& .Mui-selected': { color: '#0284c7' } }}>
                                <Tab label="CHI PHÍ HẰNG NGÀY" />
                                <Tab label="BÁO CÁO TỔNG HỢP" />
                            </Tabs>
                            <QuyChiPhiWidget />
                        </Box>
                        <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    </Box>
                )
            ) : (
                <Box className="flex justify-between items-start mt-3 w-full">
                    <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    <QuyChiPhiWidget />
                </Box>
            )}

            {isAdmin ? (
                <>
                    {currentTab === 0 && <ChiPhiHangNgay danhSachChiPhi={danhSachChiPhi} isLoading={isLoading} filter={filter} onAdd={handleAddChiPhi} onDelete={handleDeleteChiPhi} />}
                    {currentTab === 1 && <BaoCaoChiPhi danhSachChiPhi={danhSachChiPhi} filter={filter} isLoading={isLoading} onDelete={handleDeleteChiPhi} />}
                </>
            ) : (
                <ChiPhiHangNgay danhSachChiPhi={danhSachChiPhi} isLoading={isLoading} filter={filter} onAdd={handleAddChiPhi} onDelete={handleDeleteChiPhi} />
            )}

            {isConfirmOpen && (
                <ConfirmModal isOpen={isConfirmOpen} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa chi phí này không?" onCancel={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} />
            )}

            {/* MODAL NỘP CHI PHÍ MỚI */}
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

            {/* MODAL EDIT SỐ TIỀN NẠP LẦN CUỐI */}
            <Dialog open={isEditQuyOpen} onClose={() => setIsEditQuyOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Sửa tiền nạp lần cuối</DialogTitle>
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
        </Box>
    );
};

export default ChiPhiPage;