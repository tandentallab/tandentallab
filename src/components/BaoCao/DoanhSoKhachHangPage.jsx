import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box } from '@mui/material';

import ReportLayout from './shared/ReportLayout';
import DynamicFilterBar from './shared/DynamicFilterBar';
import Top10BarChart from './shared/Top10BarChart';
import DoanhSoKhachHangTable from './DoanhSoKhachHangTable';

import { fetchDoanhSoKhachHang } from '../../redux/slices/baoCaoSlice';

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

const DoanhSoKhachHangPage = () => {
    const dispatch = useDispatch();
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [customDates, setCustomDates] = useState({ start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });

    // Lấy biến loading mà chúng ta đã setup trong Slice
    const { doanhSoKhachHangData, doanhSoKhachHangLoading, doanhSoKhachHangError } = useSelector((state) => state.baoCao);

    const draftDates = useMemo(() => computeDateRange(selectedFilter, customDates), [selectedFilter, customDates]);

    const handleView = () => {
        setHasSearched(true);
        dispatch(fetchDoanhSoKhachHang({ startDate: draftDates.startDate, endDate: draftDates.endDate }));
    };

    // Chuẩn bị data cho Chart (Lấy top 10 và map đúng key)
    const top10ChartData = useMemo(() => {
        if (!doanhSoKhachHangData?.data) return [];
        return doanhSoKhachHangData.data.slice(0, 10).map((item, index) => ({
            name: item.tenNhaKhoa || `Không xác định (${index})`,
            quantity: item.tongDoanhSo // Truyền doanh số vào làm quantity để Chart vẽ
        }));
    }, [doanhSoKhachHangData]);

    return (
        <ReportLayout title="Doanh Số Theo Khách Hàng">
            <Box className="w-full">
                {/* Chỉ giữ lại bộ lọc thời gian và nút Xem */}
                <DynamicFilterBar
                    selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                    customDates={customDates} setCustomDates={setCustomDates}
                    onView={handleView}
                    showPrintButton={false}
                />

                {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-3 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                        <span className="text-gray-400 font-medium italic text-sm">Vui lòng chọn thời gian và bấm "Xem" để hiển thị doanh số.</span>
                    </div>
                ) : (
                    // 🔥 ĐỔI LAYOUT: Dùng flex-col thay vì grid, xếp dọc 2 phần tử
                    <div className="mt-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Dòng 1: Biểu đồ chiếm full chiều ngang */}
                        <div className="w-full">
                            <Top10BarChart
                                title="Top 10 Khách Hàng Doanh Số Cao Nhất"
                                subTitle="Dựa trên sản phẩm 'Mới'"
                                data={top10ChartData}
                                loading={doanhSoKhachHangLoading}
                                error={doanhSoKhachHangError}
                                isCurrency={true} // Bật tính năng format tiền đã code trước đó
                            />
                        </div>

                        {/* Dòng 2: Table nằm ngay bên dưới */}
                        <div className="w-full">
                            <DoanhSoKhachHangTable />
                        </div>

                    </div>
                )}
            </Box>
        </ReportLayout>
    );
};

export default DoanhSoKhachHangPage;