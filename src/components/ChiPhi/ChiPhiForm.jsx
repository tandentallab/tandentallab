import React, { useState } from 'react';
import {
    Box, Paper, TextField, InputAdornment, IconButton, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { Add as AddIcon, Note as NoteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { themLoaiChiPhiLocal } from '../../redux/slices/chiPhiSlice';
import MoneyInput from './MoneyInput';

const ChiPhiForm = ({ isLoading, onAdd }) => {
    const dispatch = useDispatch();
    const danhSachLoaiChiPhi = useSelector((state) => state.chiPhi.danhSachLoaiChiPhi);

    // State cho Modal thêm loại chi phí
    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
    const [newTypeValue, setNewTypeValue] = useState('');

    const [formData, setFormData] = useState({
        tenChiPhi: '',
        loaiChiPhi: '',
        gia: '',
        ghiChu: '',
    });

    const handleChangeForm = (e) => {
        const { name, value } = e.target;

        // Mở Modal nếu user bấm "+ Thêm loại mới"
        if (name === 'loaiChiPhi' && value === 'ADD_NEW') {
            setNewTypeValue('');
            setIsAddTypeModalOpen(true);
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddNewType = () => {
        const trimmedType = newTypeValue.trim();
        if (trimmedType) {
            // Chèn vào UI lập tức thông qua action đồng bộ
            dispatch(themLoaiChiPhiLocal(trimmedType));
            // Cập nhật formData
            setFormData(prev => ({ ...prev, loaiChiPhi: trimmedType }));
        }
        setIsAddTypeModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenChiPhi || !formData.loaiChiPhi || !formData.gia) {
            alert('Vui lòng nhập đầy đủ Tên, Loại và Giá chi phí!');
            return;
        }

        // Gọi hàm onAdd truyền từ component cha
        onAdd({ ...formData, gia: Number(formData.gia) });

        // Reset form sau khi thêm thành công
        setFormData({ tenChiPhi: '', loaiChiPhi: '', gia: '', ghiChu: '' });
    };

    return (
        <Paper elevation={0} className="rounded-xl border border-slate-200 overflow-hidden w-full">
            <Box component="form" onSubmit={handleSubmit} className="px-5 py-4 flex flex-wrap gap-3 items-end w-full">
                <TextField
                    size="small"
                    name="tenChiPhi"
                    label="Tên chi phí"
                    value={formData.tenChiPhi}
                    onChange={handleChangeForm}
                    required
                    sx={{
                        flex: '1 1 180px',
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& input': {
                                fontSize: '16px',
                            },
                        },
                    }}
                />

                <FormControl size="small" required sx={{ minWidth: 180, width: { xs: '100%', sm: 160 } }}>
                    <InputLabel id="loai-chi-phi-label">Loại chi phí</InputLabel>
                    <Select
                        labelId="loai-chi-phi-label"
                        name="loaiChiPhi"
                        value={formData.loaiChiPhi}
                        onChange={handleChangeForm}
                        label="Loại chi phí"
                        required
                        sx={{ borderRadius: '8px' }}
                    >
                        <MenuItem value="ADD_NEW" sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: '1px solid #e2e8f0', mb: 1 }}>
                            + Thêm loại mới
                        </MenuItem>
                        {danhSachLoaiChiPhi.map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
                    <MoneyInput
                        value={formData.gia}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, gia: val }))}
                        required
                    />
                </Box>

                <TextField
                    size="small"
                    name="ghiChu"
                    label="Ghi chú"
                    value={formData.ghiChu}
                    onChange={handleChangeForm}
                    sx={{ flex: '1 1 180px', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    slotProps={{ input: { startAdornment: (<InputAdornment position="start"><NoteIcon fontSize="small" className="text-slate-300" /></InputAdornment>) } }}
                />

                <IconButton
                    type="submit"
                    disabled={isLoading}
                    aria-label="Thêm chi phí"
                    sx={{
                        width: 40, height: 40, borderRadius: '50%', bgcolor: '#22c55e', color: 'white',
                        '&:hover': { bgcolor: '#16a34a' }, '&.Mui-disabled': { bgcolor: '#86efac', color: 'white' },
                        alignSelf: { xs: 'flex-end', sm: 'auto' }
                    }}
                >
                    {isLoading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                </IconButton>
            </Box>

            {/* Modal Thêm Loại Chi Phí Mới */}
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
        </Paper>
    );
};

export default ChiPhiForm;