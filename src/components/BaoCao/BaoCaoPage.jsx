import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

import BaoCaoSanLuongChart from './BaoCaoSanLuongChart';
import BaoCaoChiTietTable from './BaoCaoChiTietTable';
import PrintTemplate from './PrintTemplate';
import FilterBar from './FilterBar';
import PrintPreviewDialog from './PrintPreviewDialog';

const BaoCaoSanLuongPage = () => {
    const [selectedFilter, setSelectedFilter] = useState('this_month');
    const [dateType, setDateType] = useState('ngayNhan');
    const [openPreview, setOpenPreview] = useState(false);
    const [customDates, setCustomDates] = useState({
        start: dayjs().format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD'),
    });

    const { detailedData } = useSelector((state) => state.baoCao);

    // ── TÍNH KHOẢNG NGÀY THEO BỘ LỌC ────────────────────────────────────
    const dateRange = useMemo(() => {
        if (selectedFilter === 'custom') {
            return { start: customDates.start, end: customDates.end };
        }

        let start = dayjs();
        let end = dayjs();

        switch (selectedFilter) {
            case 'today':
                start = dayjs().startOf('day');
                break;
            case 'yesterday':
                start = dayjs().subtract(1, 'day').startOf('day');
                end = dayjs().subtract(1, 'day').endOf('day');
                break;
            case 'this_week':
                start = dayjs().startOf('week');
                break;
            case 'this_month':
                start = dayjs().startOf('month');
                break;
            case 'last_month':
                start = dayjs().subtract(1, 'month').startOf('month');
                end = dayjs().subtract(1, 'month').endOf('month');
                break;
            case 'last_7_days':
                start = dayjs().subtract(7, 'days');
                break;
            case 'last_30_days':
                start = dayjs().subtract(30, 'days');
                break;
            default:
                break;
        }

        return {
            start: start.format('YYYY-MM-DD'),
            end: end.format('YYYY-MM-DD'),
        };
    }, [selectedFilter, customDates]);

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

        const fullDateRange = `${dayjs(dateRange.start).format('DD/MM/YYYY')} - ${dayjs(dateRange.end).format('DD/MM/YYYY')}`;

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
        // Đợi modal đóng hoàn toàn rồi mới gọi print
        // → tránh modal bị capture vào bản in
        setTimeout(() => window.print(), 300);
    };

    // ── RENDER ───────────────────────────────────────────────────────────
    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full">

            {/* ════ GIAO DIỆN WEB (class no-print → ẩn hoàn toàn khi in) ════ */}
            <div className="no-print">

                {/* 1. Biểu đồ sản lượng */}
                <div className="mb-6">
                    <BaoCaoSanLuongChart
                        timeRange={selectedFilter}
                        dateType={dateType}
                        customStart={dateRange.start}
                        customEnd={dateRange.end}
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

                {/* 3. Bảng dữ liệu chi tiết */}
                <BaoCaoChiTietTable
                    timeRange={selectedFilter}
                    dateType={dateType}
                    customStart={dateRange.start}
                    customEnd={dateRange.end}
                />
            </div>

            {/* ════ MODAL XEM TRƯỚC (bọc no-print → không bị in) ════ */}
            <div className="no-print">
                <PrintPreviewDialog
                    open={openPreview}
                    onClose={() => setOpenPreview(false)}
                    onConfirmPrint={handlePrintAction}
                    detailedData={detailedData}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                />
            </div>

            {/* ════ VÙNG IN — chỉ hiển thị khi @media print ════
                FIX TRANG TRẮNG:
                - Dùng display:none / display:block thay vì visibility:hidden
                  → phần tử bị xoá khỏi luồng layout, không tạo trang trắng thừa.
                - Bỏ position:absolute → nội dung chảy tự nhiên từ đầu trang.
            ════ */}
            <div className="print-only">
                <PrintTemplate
                    data={detailedData}
                    startDate={dateRange.start}
                    endDate={dateRange.end}
                />
            </div>

            <style>{`
                /* Mặc định (màn hình): ẩn vùng in */
                .print-only { display: none; }

                @media print {
                    /* Ẩn giao diện web bằng display:none
                       → xoá hẳn khỏi luồng, không để lại trang trắng */
                    .no-print { display: none !important; }

                    /* Hiện vùng in, chảy tự nhiên từ đầu trang */
                    .print-only {
                        display: block !important;
                        font-family: Arial, sans-serif !important;
                    }

                    /* Ẩn sidebar / nav của app */
                    header, nav, aside, .sidebar { display: none !important; }

                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }

                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BaoCaoSanLuongPage;