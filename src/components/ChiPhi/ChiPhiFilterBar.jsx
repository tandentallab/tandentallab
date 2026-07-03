import React, { useEffect } from 'react';
import { Select, MenuItem, Box } from '@mui/material';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const SO_NAM_VE_TRUOC = 0;
const SO_NAM_VE_SAU = 1;

const selectSx = {
    minWidth: 100,
    bgcolor: 'rgba(100, 116, 139, 0.08)',
    borderRadius: '9999px',
    "& fieldset": { border: "1px solid rgba(100, 116, 139, 0.3)" },
};

const ChiPhiFilterBar = ({ filter, setFilter }) => {
    const namHienTai = dayjs().tz('Asia/Ho_Chi_Minh').year();
    const danhSachNam = Array.from(
        { length: SO_NAM_VE_TRUOC + SO_NAM_VE_SAU + 1 },
        (_, i) => namHienTai + SO_NAM_VE_SAU - i
    );
    const soNgayTrongThang = dayjs(`${filter.nam}-${filter.thang}-01`).tz('Asia/Ho_Chi_Minh').daysInMonth();

    useEffect(() => {
        if (filter.ngay > soNgayTrongThang) {
            setFilter((prev) => ({ ...prev, ngay: 0 }));
        }
    }, [filter.thang, filter.nam, filter.ngay, soNgayTrongThang, setFilter]);

    return (
        <Box className="flex flex-nowrap items-center justify-start gap-2 h-[30px]">
            <Select
                size="small"
                value={filter.ngay !== undefined ? filter.ngay : 0}
                onChange={(e) => setFilter((prev) => ({ ...prev, ngay: Number(e.target.value) }))}
                sx={{ ...selectSx, minWidth: 100 }}
            >
                <MenuItem value={0}>Tất cả ngày</MenuItem>
                {Array.from({ length: soNgayTrongThang }, (_, i) => i + 1).map((d) => (
                    <MenuItem key={d} value={d}>Ngày {d}</MenuItem>
                ))}
            </Select>

            <Select
                size="small"
                value={filter.thang}
                onChange={(e) => setFilter((prev) => ({ ...prev, thang: Number(e.target.value) }))}
                sx={{ ...selectSx, minWidth: 100 }}
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => (
                    <MenuItem key={t} value={t}>Tháng {t}</MenuItem>
                ))}
            </Select>

            <Select
                size="small"
                value={filter.nam}
                onChange={(e) => setFilter((prev) => ({ ...prev, nam: Number(e.target.value) }))}
                sx={{ ...selectSx, minWidth: 90 }}
            >
                {danhSachNam.map((nam) => (
                    <MenuItem key={nam} value={nam}>Năm {nam}</MenuItem>
                ))}
            </Select>
        </Box>
    );
};

export default ChiPhiFilterBar;