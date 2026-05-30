import React, { useState, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel, Alert, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { api } from '../../config/api';
import SoDuDauKyDialog from './SoDuDauKyDialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
    n == null ? '0' : new Intl.NumberFormat('vi-VN').format(n);

const fmtStrict = (n) =>
    n == null ? '0' : new Intl.NumberFormat('vi-VN').format(n);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const BASE_YEAR = 2026;
const BASE_MONTH = 5;
const NAM_LIST = Array.from(
    { length: currentYear - BASE_YEAR + 1 },
    (_, i) => BASE_YEAR + i
).reverse();

// ─── Excel Icon ──────────────────────────────────────────────────────────────

const ExcelSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="3" fill="#217346" />
        <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z" fill="#185C37" />
        <path d="M14 3v4h4" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
        <text x="4" y="18" fill="white" fontSize="8" fontWeight="bold" fontFamily="Segoe UI,serif">XLS</text>
    </svg>
);

// ─── Styles ─────────────────────────────────────────────────────────────────

const FONT = "'Segoe UI', 'serif'";

const headerSx = {
    backgroundColor: '#1a237e',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.76rem',
    fontFamily: FONT,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    py: 1.4,
    border: '1px solid #283593',
    textTransform: 'uppercase',
};

const sumRowSx = {
    backgroundColor: '#e8eaf6',
    fontWeight: 700,
    fontFamily: FONT,
};

const cellSx = {
    fontSize: '0.82rem',
    fontFamily: FONT,
    py: 1,
    px: 1.5,
    border: '1px solid #eeeeee',
};

// ─── Excel export ────────────────────────────────────────────────────────────

async function exportToExcel(data, thang, nam) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`THANG ${String(thang).padStart(2, '0')} ${nam}`);

    const COLS = 7;
    ws.getColumn(1).width = 5;
    ws.getColumn(2).width = 35;
    ws.getColumn(3).width = 18;
    ws.getColumn(4).width = 18;
    ws.getColumn(5).width = 18;
    ws.getColumn(6).width = 18;
    ws.getColumn(7).width = 50;

    const numFmt = '#,##0;(#,##0);0';

    ws.mergeCells(1, 1, 1, COLS);
    const titleCell = ws.getCell('A1');
    titleCell.value = `THÁNG ${String(thang).padStart(2, '0')} NĂM ${nam}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1A237E' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    const { noDauKy, phatSinh, thanhToan, conNo } = data.tongHop;
    const sumRow = ws.addRow(['', '', noDauKy, phatSinh, thanhToan, conNo, '']);
    sumRow.eachCell((cell, col) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAF6' } };
        cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' },
        };
        if (col >= 3 && col <= 6) cell.numFmt = numFmt;
        cell.alignment = { horizontal: col >= 3 && col <= 6 ? 'right' : 'left', vertical: 'middle' };
    });
    ws.getRow(2).height = 22;

    const headers = ['STT', 'TÊN NHA KHOA', 'NỢ ĐẦU KỲ', 'PHÁT SINH', 'THANH TOÁN', 'CÒN NỢ', 'GHI CHÚ'];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A237E' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF283593' } },
            bottom: { style: 'thin', color: { argb: 'FF283593' } },
            left: { style: 'thin', color: { argb: 'FF283593' } },
            right: { style: 'thin', color: { argb: 'FF283593' } },
        };
    });
    ws.getRow(3).height = 24;

    data.chiTiet.forEach((row, i) => {
        const isOdd = i % 2 === 0;
        const hasDebt = row.conNo > 0;
        const bgArgb = hasDebt ? 'FFFFF3E0' : isOdd ? 'FFFFFFFF' : 'FFF5F5F5';

        const dataRow = ws.addRow([
            row.stt, row.tenNhaKhoa,
            row.noDauKy ?? 0, row.phatSinh ?? 0, row.thanhToan ?? 0, row.conNo ?? 0,
            '',
        ]);

        dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
            cell.border = {
                top: { style: 'hair' }, bottom: { style: 'hair' },
                left: { style: 'thin' }, right: { style: 'thin' },
            };
            cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : col === 1 ? 'center' : 'right' };
            cell.font = { size: 10, bold: col === 6 && hasDebt };
            if (col >= 3 && col <= 6) cell.numFmt = numFmt;
        });

        ws.getRow(3 + i + 1).height = 20;
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `DOANH_THU_T${String(thang).padStart(2, '0')}_${nam}.xlsx`
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BaoCaoDoanhThuPage() {
    const [nam, setNam] = useState(currentYear);
    const [thang, setThang] = useState(currentMonth);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ── Số dư đầu kỳ ─────────────────────────────────────────────────────────
    const [dialogOpen, setDialogOpen] = useState(false);

    // ── Báo cáo ───────────────────────────────────────────────────────────────
    let startMonth = 1;
    let endMonth = 12;

    // 1. Chặn biên dưới: Nếu đang xem năm bắt đầu (2024), thì tháng nhỏ nhất phải là BASE_MONTH
    if (nam === BASE_YEAR) {
        startMonth = BASE_MONTH;
    }

    // 2. Chặn biên trên: Nếu đang xem năm hiện tại, thì tháng lớn nhất chỉ tới (Tháng hiện tại + 1)
    if (nam === currentYear) {
        endMonth = Math.min(currentMonth + 1, 12);
    }

    // 3. Sinh ra mảng tháng dựa trên biên đã tính
    const availableMonths = Array.from(
        { length: endMonth - startMonth + 1 },
        (_, i) => startMonth + i
    );
    const handleNamChange = (e) => {
        const selectedNam = Number(e.target.value);
        setNam(selectedNam);
        if (selectedNam === currentYear && thang > currentMonth + 1) {
            setThang(currentMonth + 1);
        }
    };

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setError('');
        setData(null);
        try {
            const res = await api.get('/baocao/doanh-thu-thang', { params: { thang, nam } });
            if (res.data.success) setData(res.data);
            else setError('Không lấy được dữ liệu.');
        } catch {
            setError('Lỗi kết nối server.');
        } finally {
            setLoading(false);
        }
    }, [thang, nam]);

    const handleExport = () => {
        if (data) exportToExcel(data, thang, nam);
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f0f2f8', minHeight: '100vh', fontFamily: FONT }}>

            {/* ── Header ── */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{
                            fontFamily: FONT,
                            background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.3px',
                        }}
                    >
                        Báo Cáo Doanh Thu Theo Tháng
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>
                        Tháng {String(thang).padStart(2, '0')}/{nam}
                    </Typography>
                </Box>

                {data && (
                    <Button
                        variant="contained"
                        startIcon={<ExcelSvgIcon />}
                        onClick={handleExport}
                        size="small"
                        sx={{
                            bgcolor: '#217346',
                            '&:hover': { bgcolor: '#185C37' },
                            fontFamily: FONT,
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            borderRadius: 1.5,
                            px: 2,
                            boxShadow: '0 2px 8px rgba(33,115,70,0.3)',
                        }}
                    >
                        Xuất Excel
                    </Button>
                )}

                <Tooltip title="Nhập số dư nợ đầu kỳ tháng 6/2026 từ hệ thống cũ">
                    <Button
                        variant="outlined"
                        startIcon={<EditNoteIcon fontSize="small" />}
                        onClick={() => setDialogOpen(true)}
                        size="small"
                        sx={{
                            fontFamily: FONT,
                            fontWeight: 600,
                            borderRadius: 1.5,
                            borderColor: '#1a237e',
                            color: '#1a237e',
                            '&:hover': { bgcolor: '#e8eaf6', borderColor: '#1a237e' },
                            px: 2,
                        }}
                    >
                        Số dư đầu kỳ
                    </Button>
                </Tooltip>
            </Box>

            <SoDuDauKyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

            {/* ── Filter ── */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    border: '1px solid #e0e4f0',
                    borderRadius: 2,
                    bgcolor: '#fff',
                }}
            >
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel sx={{ fontFamily: FONT }}>Năm</InputLabel>
                    <Select
                        value={nam}
                        label="Năm"
                        onChange={handleNamChange}
                        sx={{ fontFamily: FONT }}
                    >
                        {NAM_LIST.map(y => (
                            <MenuItem key={y} value={y} sx={{ fontFamily: FONT }}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel sx={{ fontFamily: FONT }}>Tháng</InputLabel>
                    <Select
                        value={thang}
                        label="Tháng"
                        onChange={e => setThang(Number(e.target.value))}
                        sx={{ fontFamily: FONT }}
                    >
                        {availableMonths.map(t => (
                            <MenuItem key={t} value={t} sx={{ fontFamily: FONT }}>Tháng {t}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <SearchIcon fontSize="small" />}
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{
                        fontFamily: FONT,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        borderRadius: 1.5,
                        bgcolor: '#1a237e',
                        '&:hover': { bgcolor: '#283593' },
                        px: 2.5,
                        boxShadow: '0 2px 8px rgba(26,35,126,0.25)',
                    }}
                >
                    Xem báo cáo
                </Button>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2, fontFamily: FONT }}>{error}</Alert>}

            {/* ── Loading ── */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress sx={{ color: '#1a237e' }} />
                </Box>
            )}

            {/* ── Table ── */}
            {data && !loading && (
                <Paper
                    elevation={0}
                    sx={{
                        overflow: 'hidden',
                        borderRadius: 2,
                        border: '1px solid #e0e4f0',
                    }}
                >
                    <TableContainer sx={{ maxHeight: { xs: '60vh', md: '68vh' }, overflowX: 'auto' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {[
                                        { label: 'STT', align: 'center' },
                                        { label: 'Tên Nha Khoa', align: 'left' },
                                        { label: 'Nợ Đầu Kỳ', align: 'right' },
                                        { label: 'Phát Sinh', align: 'right' },
                                        { label: 'Thanh Toán', align: 'right' },
                                        { label: 'Còn Nợ', align: 'right' },
                                    ].map(({ label, align }) => (
                                        <TableCell key={label} align={align} sx={headerSx}>
                                            {label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.chiTiet.map((row, i) => {
                                    const hasDebt = row.conNo > 0;
                                    return (
                                        <TableRow
                                            key={row.nhaKhoaId}
                                            sx={{
                                                bgcolor: hasDebt
                                                    ? '#fff8e1'
                                                    : i % 2 === 0 ? '#fff' : '#f8f9fc',
                                                '&:hover': { bgcolor: '#e8eaf6' },
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            <TableCell align="center" sx={{ ...cellSx, color: '#9e9e9e', width: 44 }}>
                                                {row.stt}
                                            </TableCell>
                                            <TableCell sx={{ ...cellSx, fontWeight: 600, minWidth: 220, color: '#212121' }}>
                                                {row.tenNhaKhoa}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                ...cellSx, minWidth: 130,
                                                color: row.noDauKy < 0 ? '#c62828' : '#455a64',
                                            }}>
                                                {fmtStrict(row.noDauKy)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                ...cellSx, minWidth: 130,
                                                color: '#2e7d32',
                                                fontWeight: 500,
                                            }}>
                                                {fmt(row.phatSinh)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                ...cellSx, minWidth: 130,
                                                color: '#6a1b9a',
                                            }}>
                                                {fmt(row.thanhToan)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                ...cellSx, minWidth: 130,
                                                fontWeight: hasDebt ? 700 : 400,
                                                color: hasDebt ? '#c62828' : row.conNo < 0 ? '#1565c0' : '#546e7a',
                                            }}>
                                                {fmtStrict(row.conNo)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {/* Footer total */}
                                <TableRow sx={sumRowSx}>
                                    <TableCell
                                        colSpan={2}
                                        align="center"
                                        sx={{
                                            ...cellSx,
                                            fontWeight: 800,
                                            fontFamily: FONT,
                                            color: '#1a237e',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.78rem',
                                        }}
                                    >
                                        TỔNG CỘNG
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#1565c0', fontWeight: 700 }}>
                                        {fmtStrict(data.tongHop.noDauKy)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#2e7d32', fontWeight: 700 }}>
                                        {fmtStrict(data.tongHop.phatSinh)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#6a1b9a', fontWeight: 700 }}>
                                        {fmtStrict(data.tongHop.thanhToan)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#c62828', fontWeight: 700 }}>
                                        {fmtStrict(data.tongHop.conNo)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Footer info */}
                    <Box sx={{
                        px: 2.5, py: 1.2,
                        bgcolor: '#fafbff',
                        borderTop: '1px solid #e0e4f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>
                            {data.chiTiet.length} nha khoa
                            &nbsp;·&nbsp;
                            Tháng {String(thang).padStart(2, '0')}/{nam}
                        </Typography>
                    </Box>
                </Paper>
            )}
        </Box>
    );
}


// SAU NÀY CÓ ĐỔI SANG THÁNG 6
// Dòng 1: đổi tháng mặc định
// const [activeThang, setActiveThang] = useState(5);  // → useState(6)

// Dòng 2: đổi danh sách tab
// const THANG_LIST = [5, 6];  // → [6]