import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { updateChiPhi, themLoaiChiPhiLocal, fetchTonQuyNgay } from '../../redux/slices/chiPhiSlice';
import PrintPreviewModal from './PrintPreviewModal';
import ChiPhiForm from './ChiPhiForm';
import ChiPhiTable from './ChiPhiTable';
import EditExpenseModal from './EditExpenseModal'; // Import Component Edit

const ChiPhiHangNgay = ({ danhSachChiPhi, isLoading, filter, onAdd, onDelete }) => {
    const dispatch = useDispatch();
    const danhSachLoaiChiPhi = useSelector(state => state.chiPhi?.danhSachLoaiChiPhi || []);

    const [printData, setPrintData] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [editFormData, setEditFormData] = useState({ tenChiPhi: '', loaiChiPhi: '', gia: '', ghiChu: '' });

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

    const handlePrintTable = async (data) => {
        const isThang = filter.ngay === 0;
        const type = isThang ? 'month' : 'day';

        const pad = (num) => String(num).padStart(2, '0');
        const subtitle = isThang
            ? `Phiếu chi phí tháng ${pad(filter.thang)}/${filter.nam}`
            : `Phiếu chi phí ngày ${pad(filter.ngay)}/${pad(filter.thang)}/${filter.nam}`;

        let mappedData = data.map(item => ({ ...item, ngay: item.ngayTao }));

        if (isThang) {
            mappedData.sort((a, b) => dayjs(a.ngayTao).valueOf() - dayjs(b.ngayTao).valueOf());
        }

        let tonQuyData = null;

        if (type === 'day') {
            const formattedDate = `${filter.nam}-${pad(filter.thang)}-${pad(filter.ngay)}`;
            try {
                const res = await dispatch(fetchTonQuyNgay(formattedDate)).unwrap();
                const quyHienTai = res.tonDauNgay + res.phatSinhNapTrongNgay;
                if (quyHienTai > 0 || res.tonDauNgay !== 0) {
                    tonQuyData = { quyHienTai };
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin quỹ để in:", error);
            }
        }

        setPrintData({ items: mappedData, subtitle, type, tonQuyData });
    };

    const handleOpenEdit = (item) => {
        setEditItem(item);
        setEditFormData({ tenChiPhi: item.tenChiPhi, loaiChiPhi: item.loaiChiPhi, gia: item.gia, ghiChu: item.ghiChu || '' });
    };

    const handleSaveEdit = () => {
        if (!editFormData.tenChiPhi || !editFormData.loaiChiPhi || !editFormData.gia) {
            alert('Vui lòng nhập đầy đủ thông tin!'); return;
        }
        dispatch(updateChiPhi({ id: editItem._id, data: { ...editFormData, gia: Number(editFormData.gia) } }));
        setEditItem(null);
    };

    const handleAddNewType = (trimmedType) => {
        dispatch(themLoaiChiPhiLocal(trimmedType));
        setEditFormData(prev => ({ ...prev, loaiChiPhi: trimmedType }));
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0, mb: 2 }}>
                <ChiPhiForm isLoading={isLoading} onAdd={onAdd} />
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <ChiPhiTable
                    danhSachChiPhi={dailyData}
                    isLoading={isLoading}
                    onPrintTable={handlePrintTable}
                    onEdit={handleOpenEdit}
                    onDelete={onDelete}
                    topContent={<ChiPhiForm isLoading={isLoading} onAdd={onAdd} />}
                />
            </Box>

            <PrintPreviewModal isOpen={!!printData} data={printData} onClose={() => setPrintData(null)} />

            <EditExpenseModal
                editItem={editItem}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                danhSachLoaiChiPhi={danhSachLoaiChiPhi}
                onSave={handleSaveEdit}
                onClose={() => setEditItem(null)}
                onAddNewType={handleAddNewType}
            />
        </Box>
    );
};

export default ChiPhiHangNgay;