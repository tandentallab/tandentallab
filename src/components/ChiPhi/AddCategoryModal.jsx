import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AddCategoryModal = ({ isOpen, onClose, onAdd }) => {
    const [newTypeValue, setNewTypeValue] = useState('');

    const handleConfirm = () => {
        onAdd(newTypeValue);
        setNewTypeValue('');
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
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
                            handleConfirm();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Hủy</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">Xác nhận</Button>
            </DialogActions>
        </Dialog>
    );
};
export default AddCategoryModal;