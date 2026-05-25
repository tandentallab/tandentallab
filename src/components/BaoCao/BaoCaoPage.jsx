import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import BaoCaoSanLuongChart from './BaoCaoSanLuongChart';
import BaoCaoChiTietTable from './BaoCaoChiTietTable';
import PrintTemplate from './PrintTemplate';
import FilterBar from './FilterBar';
import PrintPreviewDialog from './PrintPreviewDialog';
import BaoCaoDoanhThuPage from '../BaoCao/BaoCaoDoanhThuPage';

// ─── Date range helper ──────────────────────────────────────────────────────
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

// ─── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
    { id: 'san-luong', label: 'Sản lượng theo thời gian', Icon: BarChartIcon },
    { id: 'doanh-thu', label: 'Doanh thu', Icon: AttachMoneyIcon },
];

// ─── Main component ──────────────────────────────────────────────────────────
const BaoCaoPage = () => {
    const [activeTab, setActiveTab] = useState('san-luong');

    return (
        <div className="bg-gray-50 min-h-screen w-full">

            {/* ══ Tab selector ══════════════════════════════════════════════ */}
            <Box
                className="no-print"
                sx={{
                    borderBottom: '1px solid #e0e0e0',
                    bgcolor: '#fff',
                    px: { xs: 2, md: 4 },
                    pt: 2,
                    display: 'flex',
                    gap: 1,
                }}
            >
                {TABS.map(({ id, label, Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '10px 20px',
                                border: 'none',
                                borderBottom: active ? '3px solid #1565c0' : '3px solid transparent',
                                background: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px 4px 0 0',
                                backgroundColor: active ? '#e3f2fd' : 'transparent',
                                transition: 'all 0.15s',
                                marginBottom: -1,
                            }}
                        >
                            <Icon sx={{ fontSize: 18, color: active ? '#1565c0' : '#757575' }} />
                            <Typography
                                variant="body2"
                                fontWeight={active ? 700 : 400}
                                sx={{ color: active ? '#1565c0' : '#555', whiteSpace: 'nowrap' }}
                            >
                                {label}
                            </Typography>
                        </button>
                    );
                })}
            </Box>

            {/* ══ Tab content ═══════════════════════════════════════════════ */}
            {activeTab === 'san-luong' && <SanLuongPanel />}
            {activeTab === 'doanh-thu' && <BaoCaoDoanhThuPage />}
        </div>
    );
};

// ─── Panel: Sản lượng ────────────────────────────────────────────────────────
const SanLuongPanel = () => {
    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [dateType, setDateType] = useState('ngayNhan');
    const [openPreview, setOpenPreview] = useState(false);
    const [customDates, setCustomDates] = useState({
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
    });

    const { detailedData } = useSelector((state) => state.baoCao);

    const { startDate, endDate } = useMemo(
        () => computeDateRange(selectedFilter, customDates),
        [selectedFilter, customDates]
    );

    const handlePrintAction = () => { setOpenPreview(false); setTimeout(() => window.print(), 300); };

    return (
        <div className="p-6 w-full">

            <div className="no-print">
                <div className="mb-6">
                    <BaoCaoSanLuongChart startDate={startDate} endDate={endDate} dateType={dateType} />
                </div>
                <FilterBar
                    dateType={dateType} setDateType={setDateType}
                    selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                    customDates={customDates} setCustomDates={setCustomDates}
                    onPrint={() => setOpenPreview(true)}
                />
                <BaoCaoChiTietTable startDate={startDate} endDate={endDate} dateType={dateType} />
            </div>

            <div className="no-print">
                <PrintPreviewDialog
                    open={openPreview} onClose={() => setOpenPreview(false)}
                    onConfirmPrint={handlePrintAction}
                    detailedData={detailedData} startDate={startDate} endDate={endDate}
                />
            </div>

            <div className="print-only">
                <PrintTemplate data={detailedData} startDate={startDate} endDate={endDate} />
            </div>

            {/* ══ ĐOẠN CSS IN ĐÃ ĐƯỢC FIX LỖI SIDEBAR ══ */}
            <style>{`
                .print-only { display: none; }
                
                @media print {
                    /* 1. Ẩn tất cả những thành phần được đánh dấu no-print */
                    .no-print { display: none !important; }
                    
                    /* 2. QUÉT SẠCH VÀ ÉP ẨN TUYỆT ĐỐI SIDEBAR/HEADER/NAV (KỂ CẢ MUI DRAWER HOẶC TAILWIND SIDEBAR) */
                    header, nav, aside, footer, [role="navigation"], [role="menubar"],
                    .sidebar, #sidebar, .sidebar-wrapper, .main-sidebar,
                    .MuiDrawer-root, .MuiAppBar-root,
                    [class*="sidebar"], [class*="Sidebar"], [class*="drawer"], [class*="Drawer"] { 
                        display: none !important; 
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                        opacity: 0 !important;
                        visibility: hidden !important;
                    }
                    
                    /* 3. Hiện nội dung bản in mẫu A4 */
                    .print-only { 
                        display: block !important; 
                        font-family: Arial, sans-serif !important; 
                    }
                    
                    /* 4. Xóa bỏ hoàn toàn chữ thừa lề của trình duyệt */
                    @page { 
                        size: A4 portrait; 
                        margin: 0 !important; 
                    }
                    
                    /* 5. Thiết lập lề trang giấy nội dung */
                    body { 
                        background: white !important; 
                        margin: 0 !important; 
                        padding: 15mm 20mm !important; 
                        height: auto !important;
                    }

                    /* 6. CHỈ CẤU HÌNH KHUNG TRỤC CHÍNH (Tránh dùng thẻ div đại trà làm hỏng thuộc tính ẩn của Sidebar) */
                    html, body, #root, main, .main-content, .content-wrapper {
                        position: static !important;
                        overflow: visible !important;
                        height: auto !important;
                        max-height: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BaoCaoPage;