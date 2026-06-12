import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box } from '@mui/material';

import ReportLayout from './shared/ReportLayout';
import DynamicFilterBar from './shared/DynamicFilterBar';
import Top10BarChart from './shared/Top10BarChart';

import BaoCaoChiTietTable from './BaoCaoChiTietTable';
import PrintPreviewDialog from './PrintPreviewDialog';
import PrintTemplate from './PrintTemplate';
import { fetchTopProductsBaoCao } from '../../redux/slices/baoCaoSlice';

import { fetchOrderByMonth } from '../../redux/slices/dashboardSlice';

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

const BaoCaoPage = () => {
    const dispatch = useDispatch();

    // State chặn render lần đầu
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [customDates, setCustomDates] = useState({ start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });
    const [openPreview, setOpenPreview] = useState(false);

    const { detailedData, data: topProducts, loading, error } = useSelector((state) => state.baoCao);
    const { orders } = useSelector((state) => state.dashboard);

    const draftDates = useMemo(() => computeDateRange(selectedFilter, customDates), [selectedFilter, customDates]);

    // 🔥 Gắn chết mặc định dateType là 'ngayNhan' luôn
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: draftDates.startDate,
        endDate: draftDates.endDate,
        dateType: 'ngayNhan'
    });

    console.log('Applied Filters:', appliedFilters);

    const formatDate = (from, to) => {
        if (from === to) {
            return `${dayjs(from).format('DD/MM/YY')}`;
        }
        return `${dayjs(from).format('DD/MM/YY')} - ${dayjs(to).format('DD/MM/YY')}`;
    };

    const handleView = () => {
        const newFilters = {
            startDate: draftDates.startDate,
            endDate: draftDates.endDate,
            dateType: 'ngayNhan' // 🔥 Bắn cứng 'ngayNhan' xuống API
        };
        setAppliedFilters(newFilters);
        setHasSearched(true);
        dispatch(fetchTopProductsBaoCao(newFilters));
        dispatch(fetchOrderByMonth(newFilters));
    };

    const handlePrintAction = () => { setOpenPreview(false); setTimeout(() => window.print(), 300); };

    const mapOrderType = (type) => {
        switch (type) {
            case 'Mới': return 'Mới';
            case 'Hàng sửa': return 'Sửa';
            case 'Hàng làm lại': return 'Làm lại';
            case 'Hàng bảo hành': return 'Bảo hành';
            default: return type;
        }
    };

    return (
        <ReportLayout title="Sản lượng theo thời gian">
            <Box className="w-full">
                <div className="no-print">

                    {/* Đã xóa props extraFilters và extraFilterLabel khỏi đây */}
                    <DynamicFilterBar
                        selectedFilter={selectedFilter}
                        setSelectedFilter={setSelectedFilter}
                        customDates={customDates}
                        setCustomDates={setCustomDates}
                        onView={handleView}
                        showPrintButton={true}
                        onPrint={() => setOpenPreview(true)}
                    />

                    {/* Chỉ hiện dữ liệu khi đã bấm XEM */}
                    {!hasSearched ? (
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3 py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
                            <span className="text-gray-400 font-medium italic text-sm">Vui lòng chọn thời gian và bấm "Xem" để hiển thị dữ liệu báo cáo.</span>
                        </div>
                    ) : (
                        <div className="mt-6 animate-in fade-in duration-500">
                            <div className="mb-6">
                                <Top10BarChart title="Sản lượng theo thời gian" subTitle="Top 10 sản phẩm" data={topProducts} loading={loading} error={error} />
                            </div>
                            <BaoCaoChiTietTable startDate={appliedFilters.startDate} endDate={appliedFilters.endDate} dateType={appliedFilters.dateType} />
                        </div>
                    )}
                </div>

                <div className="no-print">
                    <PrintPreviewDialog open={openPreview} onClose={() => setOpenPreview(false)} onConfirmPrint={handlePrintAction} detailedData={detailedData} startDate={appliedFilters.startDate} endDate={appliedFilters.endDate} />
                </div>
                <div className="print-only">
                    <PrintTemplate data={detailedData} startDate={appliedFilters.startDate} endDate={appliedFilters.endDate} />
                </div>

                {hasSearched && <div className='p-4 mt-6 flex flex-col gap-4 justify-between bg-sky-900 text-white rounded-lg shadow'>
                    <div className='flex flex-wrap items-center gap-3'>
                        <p className='font-bold tracking-wide'>TỈ LỆ ĐƠN HÀNG</p>
                        <p className='text-gray-200'>({formatDate(appliedFilters.startDate, appliedFilters.endDate)})</p>
                    </div>

                    <div>
                        {orders?.loading && <p>Đang tải đơn hàng...</p>}
                        {orders?.error && <p className="text-red-500">Lỗi: {orders.error}</p>}
                        {!orders?.loading && !orders?.error && (
                            <div>
                                {Object.entries(orders?.data?.donHang || {}).map(([label, value]) => (
                                    <div key={label} className="flex">
                                        <p className='w-28'>{mapOrderType(label)}</p>
                                        <p className='font-bold'>{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>}
            </Box >
        </ReportLayout >
    );
};

export default BaoCaoPage;