import React, { useState, useCallback } from 'react';
import {
    Box, Paper, Typography, Button, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel, Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { api } from '../../config/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) =>
    n === 0 || n == null
        ? '—'
        : new Intl.NumberFormat('vi-VN').format(n);

const fmtStrict = (n) =>
    n == null ? '—' : new Intl.NumberFormat('vi-VN').format(n);

const THANG_LIST = Array.from({ length: 12 }, (_, i) => i + 1);
const NAM_LIST = [2024, 2025, 2026, 2027];

const now = new Date();

// ─── Styles ─────────────────────────────────────────────────────────────────

const headerSx = {
    backgroundColor: '#1565c0',
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.78rem',
    whiteSpace: 'nowrap',
    py: 1.2,
    border: '1px solid #1976d2',
};

const sumRowSx = {
    backgroundColor: '#e3f2fd',
    fontWeight: 700,
};

const cellSx = {
    fontSize: '0.82rem',
    py: 0.9,
    px: 1.2,
    border: '1px solid #e0e0e0',
};

// ─── Excel export ────────────────────────────────────────────────────────────

async function exportToExcel(data, thang, nam) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(`THANG ${String(thang).padStart(2, '0')} ${nam}`);

    const COLS = 10; // A-J

    // Column widths
    ws.getColumn(1).width = 5;   // STT
    ws.getColumn(2).width = 35;  // TÊN NHA KHOA
    ws.getColumn(3).width = 18;  // NỢ ĐẦU KỲ
    ws.getColumn(4).width = 18;  // PHÁT SINH
    ws.getColumn(5).width = 18;  // THANH TOÁN
    ws.getColumn(6).width = 18;  // CÒN NỢ
    ws.getColumn(7).width = 10;  // A
    ws.getColumn(8).width = 22;  // B
    ws.getColumn(9).width = 14;  // C
    ws.getColumn(10).width = 35;  // NOTE

    const numFmt = '#,##0;(#,##0);"-"';

    // ── Row 1: Title ──────────────────────────────────────────────────────
    ws.mergeCells(1, 1, 1, COLS);
    const titleCell = ws.getCell('A1');
    titleCell.value = `THÁNG ${String(thang).padStart(2, '0')} NĂM ${nam}`;
    titleCell.font = { bold: true, size: 14, color: { argb: 'FF1565C0' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 28;

    // ── Row 2: Summary ────────────────────────────────────────────────────
    const { noDauKy, phatSinh, thanhToan, conNo } = data.tongHop;
    const sumRow = ws.addRow(['', '', noDauKy, phatSinh, thanhToan, conNo, '', '', '', '']);
    sumRow.eachCell((cell, col) => {
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } };
        cell.border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' },
        };
        if (col >= 3 && col <= 6) cell.numFmt = numFmt;
        cell.alignment = { horizontal: col >= 3 && col <= 6 ? 'right' : 'left', vertical: 'middle' };
    });
    ws.getRow(2).height = 22;

    // ── Row 3: Headers ────────────────────────────────────────────────────
    const headers = ['STT', 'TÊN NHA KHOA', 'NỢ ĐẦU KỲ', 'PHÁT SINH', 'THANH TOÁN', 'CÒN NỢ', 'A', 'B', 'C', 'NOTE'];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF1976D2' } },
            bottom: { style: 'thin', color: { argb: 'FF1976D2' } },
            left: { style: 'thin', color: { argb: 'FF1976D2' } },
            right: { style: 'thin', color: { argb: 'FF1976D2' } },
        };
    });
    ws.getRow(3).height = 24;

    // ── Data rows ─────────────────────────────────────────────────────────
    data.chiTiet.forEach((row, i) => {
        const isOdd = i % 2 === 0;
        const hasDebt = row.conNo > 0;
        const bgArgb = hasDebt ? 'FFFFF3E0' : isOdd ? 'FFFFFFFF' : 'FFF5F5F5';

        const dataRow = ws.addRow([
            row.stt,
            row.tenNhaKhoa,
            row.noDauKy || null,
            row.phatSinh || null,
            row.thanhToan || null,
            row.conNo || null,
            '', '', '', '',
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

    // ── Download ──────────────────────────────────────────────────────────
    const buf = await wb.xlsx.writeBuffer();
    saveAs(
        new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `DOANH_THU_T${String(thang).padStart(2, '0')}_${nam}.xlsx`
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BaoCaoDoanhThuPage() {
    const [thang, setThang] = useState(now.getMonth() + 1);
    const [nam, setNam] = useState(now.getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>

            {/* ── Header ── */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight={700} color="primary.dark" sx={{ flexGrow: 1 }}>
                    Báo Cáo Doanh Thu Theo Tháng
                </Typography>
                {data && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        size="small"
                    >
                        Xuất Excel
                    </Button>
                )}
            </Box>

            {/* ── Filter ── */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 110 }}>
                    <InputLabel>Tháng</InputLabel>
                    <Select value={thang} label="Tháng" onChange={e => setThang(e.target.value)}>
                        {THANG_LIST.map(t => (
                            <MenuItem key={t} value={t}>Tháng {t}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Năm</InputLabel>
                    <Select value={nam} label="Năm" onChange={e => setNam(e.target.value)}>
                        {NAM_LIST.map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Xem báo cáo
                </Button>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ── Table ── */}
            {data && (
                <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>

                    {/* Summary row */}
                    <Box sx={{
                        px: 2, py: 1.5, bgcolor: '#e3f2fd',
                        display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap',
                        borderBottom: '2px solid #1565c0',
                    }}>
                        <SumItem label="Nợ đầu kỳ" value={data.tongHop.noDauKy} color="#1565c0" />
                        <SumItem label="Phát sinh" value={data.tongHop.phatSinh} color="#2e7d32" />
                        <SumItem label="Thanh toán" value={data.tongHop.thanhToan} color="#6a1b9a" />
                        <SumItem label="Còn nợ" value={data.tongHop.conNo} color="#c62828" />
                    </Box>

                    <TableContainer sx={{ maxHeight: { xs: '60vh', md: '65vh' }, overflowX: 'auto' }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {['STT', 'Tên Nha Khoa', 'Nợ Đầu Kỳ', 'Phát Sinh', 'Thanh Toán', 'Còn Nợ'].map((h, i) => (
                                        <TableCell
                                            key={h}
                                            align={i >= 2 ? 'right' : i === 0 ? 'center' : 'left'}
                                            sx={headerSx}
                                        >
                                            {h}
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
                                                    : i % 2 === 0 ? '#fff' : '#fafafa',
                                                '&:hover': { bgcolor: '#e8f4fd' },
                                            }}
                                        >
                                            <TableCell align="center" sx={{ ...cellSx, color: '#666', width: 40 }}>
                                                {row.stt}
                                            </TableCell>
                                            <TableCell sx={{ ...cellSx, fontWeight: 500, minWidth: 220 }}>
                                                {row.tenNhaKhoa}
                                            </TableCell>
                                            <TableCell align="right" sx={{ ...cellSx, minWidth: 130, color: row.noDauKy < 0 ? '#c62828' : 'inherit' }}>
                                                {fmtStrict(row.noDauKy)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ ...cellSx, minWidth: 130, color: '#2e7d32', fontWeight: 500 }}>
                                                {fmt(row.phatSinh)}
                                            </TableCell>
                                            <TableCell align="right" sx={{ ...cellSx, minWidth: 130, color: '#6a1b9a' }}>
                                                {fmt(row.thanhToan)}
                                            </TableCell>
                                            <TableCell align="right" sx={{
                                                ...cellSx, minWidth: 130,
                                                fontWeight: hasDebt ? 700 : 400,
                                                color: hasDebt ? '#c62828' : row.conNo < 0 ? '#1565c0' : '#333',
                                            }}>
                                                {fmtStrict(row.conNo)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {/* Footer total */}
                                <TableRow sx={sumRowSx}>
                                    <TableCell colSpan={2} align="center" sx={{ ...cellSx, fontWeight: 700 }}>
                                        TỔNG CỘNG
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#1565c0' }}>
                                        {fmtStrict(data.tongHop.noDauKy)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#2e7d32' }}>
                                        {fmtStrict(data.tongHop.phatSinh)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#6a1b9a' }}>
                                        {fmtStrict(data.tongHop.thanhToan)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, color: '#c62828' }}>
                                        {fmtStrict(data.tongHop.conNo)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ px: 2, py: 1, bgcolor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" color="text.secondary">
                            {data.chiTiet.length} nha khoa &nbsp;·&nbsp;
                            Tháng {String(thang).padStart(2, '0')}/{nam} &nbsp;·&nbsp;
                            <span style={{ color: '#ff8f00' }}>🟡 Nền vàng = còn nợ</span>
                        </Typography>
                    </Box>
                </Paper>
            )}

            {loading && !data && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
}

// ─── Helper sub-component ────────────────────────────────────────────────────

function SumItem({ label, value, color }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={700} sx={{ color }}>
                {new Intl.NumberFormat('vi-VN').format(value)} đ
            </Typography>
        </Box>
    );
}