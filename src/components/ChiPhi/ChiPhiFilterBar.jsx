import React from 'react';
import { Paper, Select, MenuItem } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';

const SO_NAM_VE_TRUOC = 0;
const SO_NAM_VE_SAU = 1;

const ChiPhiFilterBar = ({ filter, setFilter }) => {
    const namHienTai = new Date().getFullYear();
    const danhSachNam = Array.from(
        { length: SO_NAM_VE_TRUOC + SO_NAM_VE_SAU + 1 },
        (_, i) => namHienTai + SO_NAM_VE_SAU - i
    );

    return (
        <Paper
            elevation={0}
            className="flex flex-wrap items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-slate-50"
        >
            <DateRangeIcon fontSize="small" className="text-slate-400" />

            <Select
                size="small"
                value={filter.thang}
                onChange={(e) => setFilter((prev) => ({ ...prev, thang: Number(e.target.value) }))}
                sx={{ minWidth: 110, borderRadius: '8px', bgcolor: 'white' }}
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                    <MenuItem key={t} value={t}>Tháng {t}</MenuItem>
                ))}
            </Select>

            <Select
                size="small"
                value={filter.nam}
                onChange={(e) => setFilter((prev) => ({ ...prev, nam: Number(e.target.value) }))}
                sx={{ minWidth: 100, borderRadius: '8px', bgcolor: 'white' }}
            >
                {danhSachNam.map((nam) => (
                    <MenuItem key={nam} value={nam}>Năm {nam}</MenuItem>
                ))}
            </Select>
        </Paper>
    );
};

export default ChiPhiFilterBar;