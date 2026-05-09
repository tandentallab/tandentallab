import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button,
    Radio, RadioGroup, FormControlLabel, Switch, Divider, Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';

const TIME_OPTIONS = [
    'Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này',
    'Trong vòng 7 ngày', 'Trong vòng 10 ngày', 'Trong vòng 30 ngày'
];

export const ChartFilterModal = ({ open, onClose, chartTitle, initialConfig, onSave }) => {
    const [config, setConfig] = useState(initialConfig);

    // Sync state nếu initialConfig đổi
    useEffect(() => { setConfig(initialConfig); }, [initialConfig]);

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleRestore = () => {
        setConfig({
            timeRange: 'Trong vòng 7 ngày',
            groupBy: 'day',
            showDataLabels: false,
            showLegend: true
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            {/* Header màu xanh blue giống ảnh */}
            <DialogTitle className="bg-[#0ea5e9] text-white flex justify-between items-center p-3">
                <span className="font-semibold text-lg">Thiết lập - {chartTitle}</span>
                <IconButton onClick={onClose} size="small" className="text-white hover:bg-white/20">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-md border border-gray-200 mb-6 shadow-sm">
                    {/* Cột Thời gian */}
                    <div>
                        <Typography variant="subtitle1" className="font-bold mb-2">Thời gian</Typography>
                        <RadioGroup
                            value={config.timeRange}
                            onChange={(e) => handleChange('timeRange', e.target.value)}
                        >
                            {TIME_OPTIONS.map(opt => (
                                <FormControlLabel
                                    key={opt} value={opt}
                                    control={<Radio size="small" color="success" />}
                                    label={<span className="text-sm">{opt}</span>}
                                    className="mb-[-5px]" // Thu gọn khoảng cách giống ảnh
                                />
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Cột Nhóm theo */}
                    <div className="border-l border-gray-100 pl-6">
                        <Typography variant="subtitle1" className="font-bold mb-2">Nhóm theo</Typography>
                        <RadioGroup
                            value={config.groupBy}
                            onChange={(e) => handleChange('groupBy', e.target.value)}
                        >
                            <FormControlLabel value="day" control={<Radio size="small" color="success" />} label={<span className="text-sm">Ngày</span>} className="mb-[-5px]" />
                            <FormControlLabel value="week" control={<Radio size="small" color="success" />} label={<span className="text-sm">Tuần</span>} className="mb-[-5px]" />
                        </RadioGroup>
                    </div>
                </div>

                <Typography variant="subtitle2" className="text-gray-500 mb-4">Biểu đồ</Typography>

                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Hiển thị số liệu trên biểu đồ</span>
                    <Switch
                        checked={config.showDataLabels}
                        onChange={(e) => handleChange('showDataLabels', e.target.checked)}
                        color="success"
                    />
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Hiển thị chú thích</span>
                    <Switch
                        checked={config.showLegend}
                        onChange={(e) => handleChange('showLegend', e.target.checked)}
                        color="success"
                    />
                </div>
            </DialogContent>

            <DialogActions className="p-4 bg-gray-50 flex justify-between border-t border-gray-200">
                <Button startIcon={<RestoreIcon />} onClick={handleRestore} className="text-gray-700 normal-case font-semibold">
                    Khôi phục mặc định
                </Button>
                <Button
                    variant="contained" startIcon={<SaveIcon />} onClick={() => onSave(config)}
                    className="bg-[#0ea5e9] hover:bg-blue-600 normal-case rounded-full px-6"
                >
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};