import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ icon, title, value, themeColors }) => {
    return (
        // Đã xóa flex-1, thay bằng w-full md:w-auto và thêm min-w để các card trông đều nhau
        <Paper elevation={0} className={`w-full md:w-auto md:min-w-[180px] px-5 py-2 rounded-xl border flex items-center gap-4 ${themeColors.wrapper}`}>
            <Box className={`p-3 rounded-full ${themeColors.iconBg} ${themeColors.iconColor}`}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" className={`block uppercase font-semibold ${themeColors.textColor}`}>
                    {title}
                </Typography>
                <Typography variant="h6" className={`font-bold ${themeColors.valueColor}`}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
};
export default StatCard;