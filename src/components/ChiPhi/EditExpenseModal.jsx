import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem } from '@mui/material';

const EditExpenseModal = ({ editItem, editFormData, setEditFormData, danhSachLoaiChiPhi, onSave, onClose, onAddNewType }) => {
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [newTypeValue, setNewTypeValue] = useState('');

    if (!editItem) return null;

    const handleAddType = () => {
        const trimmedType = newTypeValue.trim();
        if (trimmedType) {
            onAddNewType(trimmedType);
        }
        setIsAddTypeModalOpen(false);
        setNewTypeValue('');
    };

    return (
        <>
            <Dialog open={!!editItem} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Chỉnh sửa chi phí</DialogTitle>
                <DialogContent dividers className="space-y-4">
                    <TextField fullWidth size="small" label="Tên chi phí" value={editFormData.tenChiPhi} onChange={(e) => setEditFormData(prev => ({ ...prev, tenChiPhi: e.target.value }))} sx={{ mt: 1 }} />
                    <Select
                        fullWidth
                        size="small"
                        value={editFormData.loaiChiPhi}
                        onChange={(e) => {
                            if (e.target.value === 'ADD_NEW') {
                                setIsAddTypeModalOpen(true);
                            } else {
                                setEditFormData(prev => ({ ...prev, loaiChiPhi: e.target.value }));
                            }
                        }}
                    >
                        <MenuItem value="ADD_NEW" sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: '1px solid #e2e8f0', mb: 1 }}>+ Thêm loại mới</MenuItem>
                        {danhSachLoaiChiPhi.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                    <TextField
                        fullWidth
                        size="small"
                        label="Số tiền (VNĐ)"
                        value={editFormData.gia ? Number(editFormData.gia).toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setEditFormData(prev => ({ ...prev, gia: rawValue }));
                        }}
                    />
                    <TextField fullWidth size="small" label="Ghi chú" value={editFormData.ghiChu} onChange={(e) => setEditFormData(prev => ({ ...prev, ghiChu: e.target.value }))} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">Hủy</Button>
                    <Button onClick={onSave} variant="contained" color="primary">Cập nhật</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isAddTypeModalOpen} onClose={() => setIsAddTypeModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, color: '#0c4a6e' }}>Thêm loại chi phí mới</DialogTitle>
                <DialogContent dividers>
                    <TextField autoFocus fullWidth size="small" label="Tên loại chi phí" value={newTypeValue} onChange={(e) => setNewTypeValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddType(); } }} />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsAddTypeModalOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleAddType} variant="contained" color="primary">Xác nhận</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default EditExpenseModal;