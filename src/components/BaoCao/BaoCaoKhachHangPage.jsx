import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box, FormControl, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';

import ReportLayout from './shared/ReportLayout';
import DynamicFilterBar from './shared/DynamicFilterBar';
import Top10BarChart from './shared/Top10BarChart';
import BaoCaoKhachHangTable from './BaoCaoKhachHangTable';

import { fetchSanLuongKhachHang } from '../../redux/slices/baoCaoSlice';

const LOAI_DON_OPTIONS = ["Mới", "Hàng sửa", "Hàng làm lại", "Hàng bảo hành"];

const computeDateRange = (filter, customDates) => {
    if (filter === 'custom') return { startDate: customDates.start, endDate: customDates.end };
    const now = dayjs();
    let start = now, end = now;
    switch (filter) {
        case 'today': break;
        case 'yesterday': start = now.subtract(1, 'day'); end = now.subtract(1, 'day'); break;
        case 'this_week': start = now.startOf('week').add(1, 'day'); break;
        case 'last_month': start = now.subtract(1, 'month').startOf('month'); end = now.subtract(1, 'month').endOf('month'); break;
        case 'last_7_days': start = now.subtract(6, 'day'); break;
        case 'last_30_days': start = now.subtract(29, 'day'); break;
        case 'this_month': default: start = now.startOf('month'); break;
    }
    return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') };
};

const BaoCaoKhachHangPage = () => {
    const dispatch = useDispatch();

    const [hasSearched, setHasSearched] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [customDates, setCustomDates] = useState({ start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });
    const [loaiDon, setLoaiDon] = useState(["Mới"]);

    const { sanLuongKhachHangData, sanLuongKhachHangLoading, sanLuongKhachHangError } = useSelector((state) => state.baoCao);

    const draftDates = useMemo(() => computeDateRange(selectedFilter, customDates), [selectedFilter, customDates]);

    const handleView = () => {
        if (!draftDates.startDate || !draftDates.endDate) return;
        setHasSearched(true); // Đánh dấu đã ấn xem
        dispatch(fetchSanLuongKhachHang({
            startDate: draftDates.startDate,
            endDate: draftDates.endDate,
            loaiDon: loaiDon.join(',')
        }));
    };

    const top10ChartData = useMemo(() => {
        if (!sanLuongKhachHangData?.data) return [];
        return sanLuongKhachHangData.data.slice(0, 10).map((item, index) => {
            const validName = item.tenNhaKhoa ? item.tenNhaKhoa : `Không xác định (STT: ${index + 1})`;
            return { name: validName, quantity: item.tongSanLuong };
        });
    }, [sanLuongKhachHangData]);

    const handleLoaiDonChange = (event) => {
        const { target: { value } } = event;
        setLoaiDon(typeof value === 'string' ? value.split(',') : value);
    };

    const filterLoaiSanPham = (
        <FormControl
            variant="standard"
            size="small"
            sx={{
                minWidth: 180,
                width: 'max-content',
                flexShrink: 0,
            }}
        >
            <Select
                multiple
                displayEmpty
                value={loaiDon}
                onChange={handleLoaiDonChange}
                autoWidth
                MenuProps={{
                    PaperProps: { sx: { minWidth: 180 } },
                }}
                renderValue={(selected) => (
                    <Box
                        sx={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: '#111',
                            whiteSpace: 'nowrap',
                            width: 'max-content',
                        }}
                    >
                        {selected.join(', ')}
                    </Box>
                )}
                sx={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#111',
                    '& .MuiSelect-select': {
                        whiteSpace: 'nowrap',
                        overflow: 'visible',
                        textOverflow: 'unset',
                    },
                    '&:before': { borderBottomColor: '#9ca3af' },
                    '&:hover:not(.Mui-disabled):before': {
                        borderBottomColor: '#374151',
                    },
                }}
            >
                {LOAI_DON_OPTIONS.map((name) => (
                    <MenuItem key={name} value={name} sx={{ py: 0 }}>
                        <Checkbox
                            checked={loaiDon.indexOf(name) > -1}
                            size="small"
                            sx={{ p: 0.5, mr: 1 }}
                        />
                        <ListItemText
                            primary={name}
                            primaryTypographyProps={{
                                fontSize: '15px',
                                fontWeight: 500,
                            }}
                        />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    return (
        <ReportLayout title="Sản Lượng Theo Khách Hàng">
            <Box className="w-full">
                <div className="no-print">

                    <DynamicFilterBar
                        selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                        customDates={customDates} setCustomDates={setCustomDates}
                        onView={handleView}
                        showPrintButton={false}
                        extraFilters={filterLoaiSanPham}
                        extraFilterLabel="Loại:"
                    />

                    {!hasSearched ? (
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                            <span className="text-gray-400 font-medium italic text-sm">Vui lòng chọn thời gian, loại đơn và bấm "Xem" để hiển thị dữ liệu khách hàng.</span>
                        </div>
                    ) : (
                        <div className="mt-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Dòng 1: Biểu đồ */}
                            <Top10BarChart
                                title="Top 10 Khách Hàng Nổi Bật"
                                subTitle="Dựa trên ngày nhận đơn hàng"
                                data={top10ChartData}
                                loading={sanLuongKhachHangLoading}
                                error={sanLuongKhachHangError}
                            />

                            {/* Dòng 2: Bảng dữ liệu */}
                            <BaoCaoKhachHangTable />

                        </div>
                    )}
                </div>
            </Box>
        </ReportLayout>
    );
};

export default BaoCaoKhachHangPage;