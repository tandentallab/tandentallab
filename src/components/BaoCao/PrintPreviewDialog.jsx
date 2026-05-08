import React from 'react';
import {
    Dialog, DialogContent, DialogActions, Button,
    Box, IconButton, Typography,
} from '@mui/material';
import { Print, Close, CheckCircleOutlined } from '@mui/icons-material';

import PrintTemplate from './PrintTemplate';

/**
 * PrintPreviewDialog — Modal xem trước bản in A4.
 *
 * Props:
 *   open          {boolean}
 *   onClose       {fn}
 *   onConfirmPrint {fn}
 *   detailedData  {array}
 *   startDate     {string}  — 'YYYY-MM-DD'
 *   endDate       {string}  — 'YYYY-MM-DD'
 */
const PrintPreviewDialog = ({
    open,
    onClose,
    onConfirmPrint,
    detailedData,
    startDate,
    endDate,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: { borderRadius: '24px', height: '95vh', bgcolor: '#f1f5f9' },
            }}
        >
            {/* Header */}
            <Box className="flex justify-between items-center p-4 bg-white border-b">
                <Typography className="font-bold text-blue-700 flex items-center gap-2">
                    <CheckCircleOutlined /> KIỂM TRA BÁO CÁO TRƯỚC KHI IN
                </Typography>
                <IconButton onClick={onClose}><Close /></IconButton>
            </Box>

            {/* Nội dung xem trước — mô phỏng tờ A4 */}
            <DialogContent sx={{ p: 5, overflowY: 'auto' }}>
                <Box
                    sx={{
                        bgcolor: 'white',
                        width: '210mm',
                        minHeight: '297mm',
                        mx: 'auto',
                        p: '15mm',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    }}
                >
                    <PrintTemplate
                        data={detailedData}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Box>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ p: 3, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    sx={{ fontWeight: 'bold' }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    onClick={onConfirmPrint}
                    variant="contained"
                    startIcon={<Print />}
                    sx={{ borderRadius: '12px', px: 5, fontWeight: 'bold' }}
                >
                    XÁC NHẬN IN
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PrintPreviewDialog;