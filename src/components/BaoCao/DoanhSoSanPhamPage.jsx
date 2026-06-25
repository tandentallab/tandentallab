import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box, Autocomplete, TextField } from '@mui/material';

import ReportLayout from './shared/ReportLayout';
import DynamicFilterBar from './shared/DynamicFilterBar';
import Top10BarChart from './shared/Top10BarChart';
import DoanhSoSanPhamTable from './DoanhSoSanPhamTable';

import { fetchDoanhSoSanPham, fetchDoanhSoKhachHang } from '../../redux/slices/baoCaoSlice';

const computeDateRange = (filter, customDates) => {
    if (filter === 'custom') return { startDate: customDates.start, endDate: customDates.end };
    const now = dayjs();
    let start = now, end = now;
    switch (filter) {
        case 'today': break;
        case 'yesterday': start = now.subtract(1, 'day'); end = now.subtract(1, 'day'); break;
        case 'this_week': start = now.startOf('week').add(1, 'day'); break;
        case 'last_week': start = now.subtract(1, 'week').startOf('week').add(1, 'day'); end = now.subtract(1, 'week').endOf('week').add(1, 'day'); break;
        case 'last_7_days': start = now.subtract(6, 'day'); break;
        case 'last_10_days': start = now.subtract(9, 'day'); break;
        case 'this_month': start = now.startOf('month'); break;
        case 'last_month': start = now.subtract(1, 'month').startOf('month'); end = now.subtract(1, 'month').endOf('month'); break;
        case 'last_30_days': start = now.subtract(29, 'day'); break;
        default: start = now.startOf('month');
    }
    return { startDate: start.format('YYYY-MM-DD'), endDate: end.format('YYYY-MM-DD') };
};

const DoanhSoSanPhamPage = () => {
    const dispatch = useDispatch();
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [customDates, setCustomDates] = useState({ start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });

    // State quản lý bộ lọc nha khoa
    const [selectedNhaKhoa, setSelectedNhaKhoa] = useState("");

    const { doanhSoSanPhamData, doanhSoSanPhamLoading, doanhSoSanPhamError, doanhSoKhachHangData } = useSelector((state) => state.baoCao);

    const draftDates = useMemo(() => computeDateRange(selectedFilter, customDates), [selectedFilter, customDates]);

    // Data dropdown: Lấy từ API 4 những nha khoa có doanh số thực tế
    const danhSachNhaKhoaActive = doanhSoKhachHangData?.data || [];
    const selectedOption = useMemo(
        () => danhSachNhaKhoaActive.find(nk => nk.nhaKhoaId === selectedNhaKhoa) || null,
        [danhSachNhaKhoaActive, selectedNhaKhoa]
    );

    // Tự động kéo list nha khoa có doanh số khi đổi khoảng thời gian
    useEffect(() => {
        dispatch(fetchDoanhSoKhachHang({
            startDate: draftDates.startDate,
            endDate: draftDates.endDate
        }));
    }, [dispatch, draftDates]);

    const handleView = () => {
        setHasSearched(true);
        dispatch(fetchDoanhSoSanPham({
            startDate: draftDates.startDate,
            endDate: draftDates.endDate,
            nhaKhoa: selectedNhaKhoa
        }));
    };

    // Top 10 cho chart
    const top10ChartData = useMemo(() => {
        if (!doanhSoSanPhamData?.data) return [];
        return doanhSoSanPhamData.data.slice(0, 10).map((item, index) => ({
            name: item.tenSanPham || `Không xác định (${index})`,
            quantity: item.tongDoanhSo
        }));
    }, [doanhSoSanPhamData]);

    return (
        <ReportLayout title="Doanh Số Theo Sản Phẩm">
            <Box className="w-full">
                <DynamicFilterBar
                    selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                    customDates={customDates} setCustomDates={setCustomDates}
                    onView={handleView}
                    showPrintButton={false}
                    extraFilterLabel="Khách hàng"
                    extraFilters={
                        <Autocomplete
                            options={danhSachNhaKhoaActive}
                            getOptionLabel={(option) => option.tenNhaKhoa || ""}
                            value={selectedOption}
                            onChange={(e, newValue) => setSelectedNhaKhoa(newValue ? newValue.nhaKhoaId : "")}
                            isOptionEqualToValue={(option, value) => option.nhaKhoaId === value.nhaKhoaId}
                            noOptionsText="Không có số liệu"
                            sx={{ minWidth: 220 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Nha khoa"
                                    variant="standard"
                                    sx={{
                                        '& .MuiInput-root': {
                                            fontSize: '16px', fontWeight: 500, color: '#111827', pb: 0.5,
                                            '&:before': { borderBottom: '2px solid #9ca3af' },
                                            '&:hover:not(.Mui-disabled, .Mui-error):before': { borderBottom: '2px solid #3b82f6' },
                                        }
                                    }}
                                />
                            )}
                        />
                    }
                />

                {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                        <span className="text-gray-400 font-medium italic text-sm">Vui lòng chọn thời gian và bấm "Xem" để hiển thị doanh số.</span>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Biểu đồ */}
                        <div className="w-full">
                            <Top10BarChart
                                title="Top 10 Sản Phẩm Doanh Số Cao Nhất"
                                subTitle="Dựa trên sản phẩm 'Mới'"
                                data={top10ChartData}
                                loading={doanhSoSanPhamLoading}
                                error={doanhSoSanPhamError}
                                isCurrency={true}
                            />
                        </div>

                        {/* Bảng */}
                        <div className="w-full">
                            <DoanhSoSanPhamTable data={doanhSoSanPhamData?.data || []} loading={doanhSoSanPhamLoading} />
                        </div>

                    </div>
                )}
            </Box>
        </ReportLayout>
    );
};

export default DoanhSoSanPhamPage;