import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import BaoCaoSanLuongChart from './BaoCaoSanLuongChart';
import BaoCaoChiTietTable from './BaoCaoChiTietTable';
import PrintTemplate from './PrintTemplate';
import FilterBar from './FilterBar';
import PrintPreviewDialog from './PrintPreviewDialog';

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH: Tính startDate / endDate duy nhất tại đây,
// truyền xuống cho cả Chart, Table và PrintTemplate qua props.
// Format: 'YYYY-MM-DD' — Backend sẽ tự chuẩn hóa 00:00:00 / 23:59:59.
// ─────────────────────────────────────────────────────────────────────────────
const computeDateRange = (filter, customDates) => {
    if (filter === 'custom') {
        return {
            startDate: customDates.start,
            endDate: customDates.end,
        };
    }

    const now = dayjs();
    let start = now;
    let end = now;

    switch (filter) {
        case 'today':
            start = now.startOf('day');
            end = now;
            break;
        case 'yesterday':
            start = now.subtract(1, 'day').startOf('day');
            end = now.subtract(1, 'day');
            break;
        case 'this_week':
            // Tuần bắt đầu Thứ Hai (add 1 ngày so với startOf('week') = CN)
            start = now.startOf('week').add(1, 'day');
            end = now;
            break;
        case 'last_week':
            start = now.subtract(1, 'week').startOf('week').add(1, 'day');
            end = now.subtract(1, 'week').endOf('week').add(1, 'day');
            break;
        case 'last_7_days':
            start = now.subtract(7, 'day').startOf('day');
            end = now;
            break;
        case 'last_10_days':
            start = now.subtract(10, 'day').startOf('day');
            end = now;
            break;
        case 'this_month':
            start = now.startOf('month');
            end = now;
            break;
        case 'last_month':
            start = now.subtract(1, 'month').startOf('month');
            end = now.subtract(1, 'month').endOf('month');
            break;
        case 'last_30_days':
            start = now.subtract(30, 'day').startOf('day');
            end = now;
            break;
        default:
            start = now.startOf('month');
            end = now;
    }

    return {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
    };
};

// ─────────────────────────────────────────────────────────────────────────────

const BaoCaoSanLuongPage = () => {
    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [dateType, setDateType] = useState('ngayNhan');
    const [openPreview, setOpenPreview] = useState(false);
    const [customDates, setCustomDates] = useState({
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
    });

    const { detailedData } = useSelector((state) => state.baoCao);

    // ── SINGLE SOURCE OF TRUTH ───────────────────────────────────────────
    // Mọi component con đều dùng cặp {startDate, endDate} này.
    const { startDate, endDate } = useMemo(
        () => computeDateRange(selectedFilter, customDates),
        [selectedFilter, customDates]
    );

    // ── XUẤT EXCEL ───────────────────────────────────────────────────────
    const handleExportExcel = () => {
        if (!detailedData || detailedData.length === 0) {
            alert('Không có dữ liệu để xuất!');
            return;
        }

        const totals = detailedData.reduce(
            (acc, curr) => ({
                m: acc.m + (curr.t_moi || 0),
                s: acc.s + (curr.t_sua || 0),
                b: acc.b + (curr.t_bh || 0),
                l: acc.l + (curr.t_ll || 0),
                t: acc.t + (curr.t_tong || 0),
            }),
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
        worksheet['!cols'] = [
            { wch: 45 }, { wch: 10 }, { wch: 10 },
            { wch: 12 }, { wch: 10 }, { wch: 14 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản lượng');
        XLSX.writeFile(workbook, `Bao_cao_san_luong_${dayjs().format('DD-MM-YYYY')}.xlsx`);
    };

    // ── IN ───────────────────────────────────────────────────────────────
    const handlePrintAction = () => {
        setOpenPreview(false);
        setTimeout(() => window.print(), 300);
    };

    // ── RENDER ───────────────────────────────────────────────────────────
    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full">

            {/* ════ GIAO DIỆN WEB ════ */}
            <div className="no-print">

                {/* 1. Biểu đồ — nhận startDate / endDate đã tính sẵn */}
                <div className="mb-6">
                    <BaoCaoSanLuongChart
                        startDate={startDate}
                        endDate={endDate}
                        dateType={dateType}
                    />
                </div>

                {/* 2. Thanh bộ lọc */}
                <FilterBar
                    dateType={dateType}
                    setDateType={setDateType}
                    selectedFilter={selectedFilter}
                    setSelectedFilter={setSelectedFilter}
                    customDates={customDates}
                    setCustomDates={setCustomDates}
                    onPrint={() => setOpenPreview(true)}
                    onExport={handleExportExcel}
                />

                {/* 3. Bảng chi tiết — nhận startDate / endDate đã tính sẵn */}
                <BaoCaoChiTietTable
                    startDate={startDate}
                    endDate={endDate}
                    dateType={dateType}
                />
            </div>

            {/* ════ MODAL XEM TRƯỚC ════ */}
            <div className="no-print">
                <PrintPreviewDialog
                    open={openPreview}
                    onClose={() => setOpenPreview(false)}
                    onConfirmPrint={handlePrintAction}
                    detailedData={detailedData}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* ════ VÙNG IN — dùng startDate/endDate để hiển thị "Từ ngày... đến ngày..." ════ */}
            <div className="print-only">
                <PrintTemplate
                    data={detailedData}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            <style>{`
                .print-only { display: none; }

                @media print {
                    .no-print  { display: none !important; }
                    .print-only {
                        display: block !important;
                        font-family: Arial, sans-serif !important;
                    }
                    header, nav, aside, .sidebar { display: none !important; }
                    @page { size: A4 portrait; margin: 15mm; }
                    body { background: white !important; margin: 0 !important; padding: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default BaoCaoSanLuongPage;