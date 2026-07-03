import React, { useState, useMemo } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { updateChiPhi, themLoaiChiPhiLocal } from '../../redux/slices/chiPhiSlice';
import PrintPreviewModal from './PrintPreviewModal';
import ChiPhiForm from './ChiPhiForm';
import ChiPhiTable from './ChiPhiTable';

const ChiPhiHangNgay = ({ danhSachChiPhi, isLoading, filter, onAdd, onDelete }) => {
    const dispatch = useDispatch();

    // Lấy danh sách loại chi phí từ Redux
    const danhSachLoaiChiPhi = useSelector(state => state.chiPhi.danhSachLoaiChiPhi);

    const [printData, setPrintData] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [editFormData, setEditFormData] = useState({ tenChiPhi: '', loaiChiPhi: '', gia: '', ghiChu: '' });

    // State cho Modal thêm loại chi phí trong lúc Edit
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [newTypeValue, setNewTypeValue] = useState('');

    const dailyData = useMemo(() => {
        return danhSachChiPhi.filter(item => {
            if (item.isAuto) return false;
            if (filter.ngay && filter.ngay > 0) {
                const ngayTao = dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').date();
                return ngayTao === filter.ngay;
            }
            return true;
        });
    }, [danhSachChiPhi, filter.ngay]);

    // HÀM XỬ LÝ IN ĐÃ ĐƯỢC CẬP NHẬT
    const handlePrintTable = (data) => {
        const isThang = filter.ngay === 0;
        const type = isThang ? 'month' : 'day';

        const pad = (num) => String(num).padStart(2, '0');
        const subtitle = isThang
            ? `Phiếu chi phí tháng ${pad(filter.thang)}/${filter.nam}`
            : `Phiếu chi phí ngày ${pad(filter.ngay)}/${pad(filter.thang)}/${filter.nam}`;

        let mappedData = data.map(item => ({ ...item, ngay: item.ngayTao }));

        // Sắp xếp lại thứ tự từ ngày đầu tháng đến cuối tháng nếu in theo tháng
        if (isThang) {
            mappedData.sort((a, b) => dayjs(a.ngayTao).valueOf() - dayjs(b.ngayTao).valueOf());
        }

        setPrintData({ items: mappedData, subtitle, type });
    };
    const handleOpenEdit = (item) => {
        setEditItem(item);
        setEditFormData({
            tenChiPhi: item.tenChiPhi,
            loaiChiPhi: item.loaiChiPhi,
            gia: item.gia,
            ghiChu: item.ghiChu || ''
        });
    };

    const handleSaveEdit = () => {
        if (!editFormData.tenChiPhi || !editFormData.loaiChiPhi || !editFormData.gia) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        dispatch(updateChiPhi({ id: editItem._id, data: { ...editFormData, gia: Number(editFormData.gia) } }));
        setEditItem(null);
    };

    const handleAddNewType = () => {
        const trimmedType = newTypeValue.trim();
        if (trimmedType) {
            // Chèn vào Redux ngay lập tức để đồng bộ UI
            dispatch(themLoaiChiPhiLocal(trimmedType));
            setEditFormData(prev => ({ ...prev, loaiChiPhi: trimmedType }));
        }
        setIsAddTypeModalOpen(false);
    };

    return (
        <Box className="flex flex-col flex-1 overflow-hidden space-y-5 mt-4" sx={{ height: '100%' }}>
            <ChiPhiForm isLoading={isLoading} onAdd={onAdd} />

            <ChiPhiTable
                danhSachChiPhi={dailyData}
                isLoading={isLoading}
                onPrintTable={handlePrintTable}
                onEdit={handleOpenEdit}
                onDelete={onDelete}
            />

            <PrintPreviewModal isOpen={!!printData} data={printData} onClose={() => setPrintData(null)} />

            {/* Modal Chỉnh Sửa Chi Phí */}
            <Dialog open={!!editItem} onClose={() => setEditItem(null)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Chỉnh sửa chi phí</DialogTitle>
                <DialogContent dividers className="space-y-4">
                    <TextField fullWidth size="small" label="Tên chi phí" value={editFormData.tenChiPhi} onChange={(e) => setEditFormData(prev => ({ ...prev, tenChiPhi: e.target.value }))} sx={{ mt: 1 }} />

                    <Select
                        fullWidth
                        size="small"
                        value={editFormData.loaiChiPhi}
                        onChange={(e) => {
                            if (e.target.value === 'ADD_NEW') {
                                setNewTypeValue('');
                                setIsAddTypeModalOpen(true);
                            } else {
                                setEditFormData(prev => ({ ...prev, loaiChiPhi: e.target.value }));
                            }
                        }}
                    >
                        <MenuItem value="ADD_NEW" sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: '1px solid #e2e8f0', mb: 1 }}>+ Thêm loại mới</MenuItem>
                        {danhSachLoaiChiPhi.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>

                    <TextField fullWidth size="small" type="number" label="Số tiền" value={editFormData.gia} onChange={(e) => setEditFormData(prev => ({ ...prev, gia: e.target.value }))} />
                    <TextField fullWidth size="small" label="Ghi chú" value={editFormData.ghiChu} onChange={(e) => setEditFormData(prev => ({ ...prev, ghiChu: e.target.value }))} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditItem(null)} color="inherit">Hủy</Button>
                    <Button onClick={handleSaveEdit} variant="contained" color="primary">Cập nhật</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Thêm Loại Chi Phí Mới (Dùng chung trong lúc Edit) */}
            <Dialog open={isAddTypeModalOpen} onClose={() => setIsAddTypeModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Thêm loại chi phí mới</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Tên loại chi phí"
                        value={newTypeValue}
                        onChange={(e) => setNewTypeValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewType();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsAddTypeModalOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleAddNewType} variant="contained" color="primary">Xác nhận</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChiPhiHangNgay;