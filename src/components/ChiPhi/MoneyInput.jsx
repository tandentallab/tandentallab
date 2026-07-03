import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { formatVND, parseVNDInput } from '../../utils/chiPhiUtils';

/**
 * Input số tiền: hiển thị giá trị đã format VND (1.234.567) ngay khi người dùng gõ,
 * nhưng giá trị trả ra ngoài qua onValueChange luôn là number thuần (chưa format).
 */
const MoneyInput = ({
    value,
    onValueChange,
    label = 'Số tiền',
    size = 'small',
    required = false,
    sx,
}) => {
    const handleChange = (e) => {
        onValueChange(parseVNDInput(e.target.value));
    };

    return (
        <TextField
            size={size}
            label={label}
            value={value ? formatVND(value) : ''}
            onChange={handleChange}
            required={required}
            slotProps={{
                input: {
                    inputMode: 'numeric',
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                },
            }}
            sx={{ width: 160, '& .MuiOutlinedInput-root': { borderRadius: '8px' }, ...sx }}
        />
    );
};

export default MoneyInput;