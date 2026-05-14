import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
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

// ─── Date range helper (giữ nguyên logic cũ) ────────────────────────────────
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
            <Box sx={{
                borderBottom: '1px solid #e0e0e0',
                bgcolor: '#fff',
                px: { xs: 2, md: 4 },
                pt: 2,
                display: 'flex',
                gap: 1,
            }}>
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

// ─── Panel: Sản lượng (giữ nguyên logic cũ, chỉ tách ra component) ───────────
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

    const handleExportExcel = () => {
        if (!detailedData || detailedData.length === 0) { alert('Không có dữ liệu để xuất!'); return; }
        const totals = detailedData.reduce(
            (acc, curr) => ({ m: acc.m + (curr.t_moi || 0), s: acc.s + (curr.t_sua || 0), b: acc.b + (curr.t_bh || 0), l: acc.l + (curr.t_ll || 0), t: acc.t + (curr.t_tong || 0) }),
            { m: 0, s: 0, b: 0, l: 0, t: 0 }
        );
        const fullDateRange = `${dayjs(startDate).format('DD/MM/YYYY')} - ${dayjs(endDate).format('DD/MM/YYYY')}`;
        const rows = [
            ['Công ty TNHH Tấn Dental'],
            ['Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ'],
            ['Điện thoại: 0842312828'],
            [],
            ['BÁO CÁO SẢN LƯỢNG THEO THỜI GIAN'],
            [`Thời gian: ${fullDateRange}`, '', '', '', '', `Ngày lập: ${dayjs().format('DD/MM/YYYY')}`],
            [],
            ['SẢN PHẨM / NHÓM', 'Mới', 'Sửa', 'Bảo hành', 'Làm lại', 'Tổng cộng'],
        ];
        detailedData.forEach((type) => {
            rows.push([(type._id || 'KHÁC').toUpperCase(), type.t_moi || 0, type.t_sua || 0, type.t_bh || 0, type.t_ll || 0, type.t_tong || 0]);
            (type.groups || []).forEach((group) => {
                rows.push([`  ${group.tenNhom}`, group.moi || 0, group.sua || 0, group.baoHanh || 0, group.lamLai || 0, group.tong || 0]);
                (group.products || []).forEach((p) => {
                    rows.push([`      ${p.ten}`, p.moi || 0, p.sua || 0, p.baoHanh || 0, p.lamLai || 0, p.tong || 0]);
                });
            });
        });
        rows.push(['TỔNG CỘNG HỆ THỐNG', totals.m, totals.s, totals.b, totals.l, totals.t]);
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        worksheet['!cols'] = [{ wch: 45 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 14 }];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản lượng');
        XLSX.writeFile(workbook, `Bao_cao_san_luong_${dayjs().format('DD-MM-YYYY')}.xlsx`);
    };

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
                    onPrint={() => setOpenPreview(true)} onExport={handleExportExcel}
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

            <style>{`
                .print-only { display: none; }
                @media print {
                    .no-print   { display: none !important; }
                    .print-only { display: block !important; font-family: Arial, sans-serif !important; }
                    header, nav, aside, .sidebar { display: none !important; }
                    @page { size: A4 portrait; margin: 15mm; }
                    body  { background: white !important; margin: 0 !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default BaoCaoPage;