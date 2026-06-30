import React, { useEffect } from 'react';
import { Paper, Select, MenuItem } from '@mui/material';
import { DateRange as DateRangeIcon } from '@mui/icons-material';

// Import dayjs và timezone
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const SO_NAM_VE_TRUOC = 0;
const SO_NAM_VE_SAU = 1;

const ChiPhiFilterBar = ({ filter, setFilter }) => {
    // 1. Lấy năm hiện tại theo chuẩn múi giờ Việt Nam
    const namHienTai = dayjs().tz('Asia/Ho_Chi_Minh').year();
    const danhSachNam = Array.from(
        { length: SO_NAM_VE_TRUOC + SO_NAM_VE_SAU + 1 },
        (_, i) => namHienTai + SO_NAM_VE_SAU - i
    );

    // 2. Lấy số ngày của tháng/năm đang chọn (dayjs có sẵn hàm daysInMonth cực kỳ an toàn)
    const soNgayTrongThang = dayjs(`${filter.nam}-${filter.thang}-01`).tz('Asia/Ho_Chi_Minh').daysInMonth();

    // Reset ngày về 0 (Tất cả ngày) nếu chuyển sang tháng có ít ngày hơn ngày đang chọn
    useEffect(() => {
        if (filter.ngay > soNgayTrongThang) {
            setFilter((prev) => ({ ...prev, ngay: 0 }));
        }
    }, [filter.thang, filter.nam, filter.ngay, soNgayTrongThang, setFilter]);

    return (
        <Paper
            elevation={0}
            className="flex flex-wrap items-center gap-3 px-5 py-4 rounded-xl border border-slate-200 bg-slate-50"
        >
            <DateRangeIcon fontSize="small" className="text-slate-400" />

            {/* Dropdown Ngày */}
            <Select
                size="small"
                value={filter.ngay !== undefined ? filter.ngay : 0}
                onChange={(e) => setFilter((prev) => ({ ...prev, ngay: Number(e.target.value) }))}
                sx={{ minWidth: 110, borderRadius: '8px', bgcolor: 'white' }}
            >
                <MenuItem value={0}>Tất cả ngày</MenuItem>
                {Array.from({ length: soNgayTrongThang }, (_, i) => i + 1).map((d) => (
                    <MenuItem key={d} value={d}>Ngày {d}</MenuItem>
                ))}
            </Select>

            {/* Dropdown Tháng */}
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

            {/* Dropdown Năm */}
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