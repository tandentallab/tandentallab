import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';

// ==========================================
// BÁO CÁO THU / CHI
// ==========================================
const BaoCaoThuChi = () => {
    return (
        <Box className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <BarChartIcon sx={{ fontSize: 48, color: '#e2e8f0' }} />
            <Typography variant="body2" className="text-slate-400">
                Biểu đồ & bảng tổng hợp dòng tiền sẽ hiển thị ở đây.
            </Typography>
        </Box>
    );
};

export default BaoCaoThuChi;