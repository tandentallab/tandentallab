import React, { useState } from 'react';
import {
    Box, Paper, TextField, Select, MenuItem,
    InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Note as NoteIcon } from '@mui/icons-material';
import MoneyInput from './MoneyInput';

const ChiPhiForm = ({ isLoading, onAdd }) => {
    const [formData, setFormData] = useState({
        tenChiPhi: '',
        loaiChiPhi: '',
        gia: '',
        ghiChu: '',
    });

    const handleChangeForm = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.tenChiPhi || !formData.loaiChiPhi || !formData.gia) {
            alert('Vui lòng nhập đầy đủ Tên, Loại và Giá chi phí!');
            return;
        }
        onAdd({ ...formData, gia: Number(formData.gia) });
        setFormData({ tenChiPhi: '', loaiChiPhi: '', gia: '', ghiChu: '' });
    };

    return (
        <Paper elevation={0} className="rounded-xl border border-slate-200 overflow-hidden">
            <Box
                component="form"
                onSubmit={handleSubmit}
                className="px-5 py-4 flex flex-wrap gap-3 items-end"
            >
                <TextField
                    size="small"
                    name="tenChiPhi"
                    label="Tên chi phí"
                    value={formData.tenChiPhi}
                    onChange={handleChangeForm}
                    required
                    sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />

                <Select
                    size="small"
                    name="loaiChiPhi"
                    value={formData.loaiChiPhi}
                    onChange={handleChangeForm}
                    displayEmpty
                    required
                    sx={{ minWidth: 140, borderRadius: '8px' }}
                    renderValue={(v) => v || <span className="text-slate-400">Loại chi phí</span>}
                >
                    <MenuItem value="Điện nước">Điện nước</MenuItem>
                    <MenuItem value="Sửa chữa">Sửa chữa</MenuItem>
                    <MenuItem value="Khác">Khác</MenuItem>
                </Select>

                <MoneyInput
                    value={formData.gia}
                    onValueChange={(val) => setFormData((prev) => ({ ...prev, gia: val }))}
                    required
                />

                <TextField
                    size="small"
                    name="ghiChu"
                    label="Ghi chú"
                    value={formData.ghiChu}
                    onChange={handleChangeForm}
                    sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <NoteIcon fontSize="small" className="text-slate-300" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <IconButton
                    type="submit"
                    disabled={isLoading}
                    aria-label="Thêm chi phí"
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: '#22c55e',
                        color: 'white',
                        '&:hover': { bgcolor: '#16a34a' },
                        '&.Mui-disabled': { bgcolor: '#86efac', color: 'white' },
                    }}
                >
                    {isLoading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                </IconButton>
            </Box>
        </Paper>
    );
};

export default ChiPhiForm;