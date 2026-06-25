import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box, Autocomplete, TextField } from '@mui/material';
import { fetchDoanhSoThoiGian, fetchDoanhSoKhachHang } from '../../redux/slices/baoCaoSlice';
import ReportLayout from './shared/ReportLayout';
import DynamicFilterBar from './shared/DynamicFilterBar';
import TimeLineChart from './shared/TimeLineChart';
import DoanhSoThoiGianTable from './DoanhSoThoiGianTable';



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

const DoanhSoThoiGianPage = () => {
    const dispatch = useDispatch();
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [customDates, setCustomDates] = useState({ start: dayjs().format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') });

    // 🔥 1. THÊM STATE ĐỂ LƯU NHA KHOA ĐƯỢC CHỌN LỌC
    const [selectedNhaKhoa, setSelectedNhaKhoa] = useState("");

    // 🔥 Kéo thêm doanhSoKhachHangData (API 4) từ Redux ra
    const { doanhSoThoiGianData, doanhSoThoiGianLoading, doanhSoKhachHangData } = useSelector((state) => state.baoCao);

    // 🔥 Danh sách Dropdown giờ sẽ là những nha khoa CÓ DOANH SỐ từ API 4
    const danhSachNhaKhoaActive = doanhSoKhachHangData?.data || [];

    const draftDates = useMemo(() => computeDateRange(selectedFilter, customDates), [selectedFilter, customDates]);

    // 🔥 TUYỆT CHIÊU: Mỗi khi người dùng đổi ngày trên bộ lọc, tự động gọi API 4 để "hứng" danh sách nha khoa có số liệu!
    useEffect(() => {
        dispatch(fetchDoanhSoKhachHang({
            startDate: draftDates.startDate,
            endDate: draftDates.endDate
        }));
        // Reset Dropdown về "Tất cả" để tránh lỗi đang chọn nha khoa A mà qua tháng sau nha khoa A không có data
    }, [dispatch, draftDates]);


    const isMonthly = useMemo(() => {
        const diffDays = dayjs(draftDates.endDate).diff(dayjs(draftDates.startDate), 'day');
        return diffDays >= 60;
    }, [draftDates]);

    const handleView = () => {
        setHasSearched(true);
        // 🔥 GỬI KÈM PARAM nhaKhoa XUỐNG API (Nếu rỗng thì API tự bỏ qua lọc)
        dispatch(fetchDoanhSoThoiGian({
            startDate: draftDates.startDate,
            endDate: draftDates.endDate,
            nhaKhoa: selectedNhaKhoa
        }));
    };

    const processedChartData = useMemo(() => {
        const rawData = doanhSoThoiGianData?.data || [];
        if (rawData.length === 0) return [];

        if (!isMonthly) {
            return rawData.map(item => ({
                timeLabel: dayjs(item.thoiGian).format('DD/MM'),
                doanhSo: item.tongDoanhSo
            }));
        } else {
            const grouped = {};
            rawData.forEach(item => {
                // Vẫn giữ gom nhóm theo 'MM/YYYY' để lỡ bạn chọn qua năm khác nó không cộng dồn sai
                const monthKey = dayjs(item.thoiGian).format('MM/YYYY');
                if (!grouped[monthKey]) grouped[monthKey] = 0;
                grouped[monthKey] += item.tongDoanhSo;
            });

            return Object.keys(grouped).map(key => {
                // 🔥 CẮT BỎ NĂM Ở ĐÂY: Biến "06/2026" thành "06"
                const monthOnly = key.split('/')[0];

                return {
                    timeLabel: `Tháng ${monthOnly}`, // Chỉ hiển thị "Tháng 06"
                    doanhSo: grouped[key]
                };
            });
        }
    }, [doanhSoThoiGianData, isMonthly]);

    const selectedOption = useMemo(
        () => danhSachNhaKhoaActive.find(nk => nk.nhaKhoaId === selectedNhaKhoa) || null,
        [danhSachNhaKhoaActive, selectedNhaKhoa]
    );
    return (
        <ReportLayout title="Doanh Số Theo Thời Gian">
            <Box className="w-full">
                <DynamicFilterBar
                    selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                    customDates={customDates} setCustomDates={setCustomDates}
                    onView={handleView}
                    showPrintButton={false}
                    // 🔥 2. TRUYỀN DROPDOWN NHA KHOA VÀO ĐÂY LÀ NÓ HIỆN LÊN
                    extraFilterLabel="Khách hàng"
                    extraFilters={
                        <Autocomplete
                            options={danhSachNhaKhoaActive}
                            getOptionLabel={(option) => option.tenNhaKhoa || ""}
                            value={selectedOption}
                            // Khi chọn hoặc xóa, sẽ set lại ID tương ứng (nếu xóa hết thì set rỗng "")
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
                                            fontSize: '16px',
                                            fontWeight: 500,
                                            color: '#111827',
                                            pb: 0.5,
                                            // 🔥 Kẻ viền gạch chân xám như form chọn ngày
                                            '&:before': { borderBottom: '2px solid #9ca3af' },
                                            // Chớp xanh khi hover chuột
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
                        <div className="w-full">
                            <TimeLineChart data={processedChartData} loading={doanhSoThoiGianLoading} />
                        </div>
                        <div className="w-full">
                            <DoanhSoThoiGianTable data={processedChartData} loading={doanhSoThoiGianLoading} />
                        </div>
                    </div>
                )}
            </Box>
        </ReportLayout>
    );
};

export default DoanhSoThoiGianPage;