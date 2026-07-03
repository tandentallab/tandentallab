import React from 'react';
import { Box, Typography, Popover, FormGroup, FormControlLabel, Checkbox, Divider } from '@mui/material';

const CategoryFilterPopover = ({ anchorEl, onClose, dsLoaiUnique, selectedLoai, onToggleLoai, onClear }) => {
    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
            <Box sx={{ p: 1.5, minWidth: 200 }}>
                <Box className="flex items-center justify-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
                        Lọc phân loại
                    </Typography>
                    {selectedLoai.length > 0 && (
                        <Typography
                            variant="caption"
                            onClick={onClear}
                            sx={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                        >
                            Bỏ chọn
                        </Typography>
                    )}
                </Box>
                <Divider sx={{ mb: 0.5 }} />
                {dsLoaiUnique.length > 0 ? (
                    <FormGroup>
                        {dsLoaiUnique.map((loai) => (
                            <FormControlLabel
                                key={loai}
                                control={<Checkbox size="small" checked={selectedLoai.includes(loai)} onChange={() => onToggleLoai(loai)} />}
                                label={<Typography variant="body2" sx={{ fontSize: '0.82rem', fontWeight: 500 }}>{loai}</Typography>}
                            />
                        ))}
                    </FormGroup>
                ) : (
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#94a3b8', py: 1 }}>Không có phân loại nào</Typography>
                )}
            </Box>
        </Popover>
    );
};
export default CategoryFilterPopover;