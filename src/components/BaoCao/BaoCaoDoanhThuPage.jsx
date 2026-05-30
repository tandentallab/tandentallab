import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SoDuDauKyDialog from './SoDuDauKyDialog';
import { fetchBaoCaoDoanhThuThang } from '../../redux/slices/baoCaoSlice';
import BaoCaoDoanhThuTable from './BaoCaoDoanhThuTable';

// ─── Helpers ────────────────────────────────────────────────────────────────
const FONT = "'Cambria', 'serif'";
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const BASE_YEAR = 2026;
const BASE_MONTH = 4;
const NAM_LIST = Array.from({ length: currentYear - BASE_YEAR + 1 }, (_, i) => BASE_YEAR + i).reverse();

// ─── Excel Icon ──────────────────────────────────────────────────────────────
const ExcelSvgIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="3" fill="#217346" />
        <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4z" fill="#185C37" />
        <path d="M14 3v4h4" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
        <text x="4" y="18" fill="white" fontSize="8" fontWeight="bold" fontFamily="Cambria,serif">XLS</text>
    </svg>
);

// ─── Excel export ─────────────────────────────────────────────────────────────
async function exportToExcel(data, notes, thang, nam) {
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
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
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
        cell.border = { top: { style: 'thin', color: { argb: 'FF283593' } }, bottom: { style: 'thin', color: { argb: 'FF283593' } }, left: { style: 'thin', color: { argb: 'FF283593' } }, right: { style: 'thin', color: { argb: 'FF283593' } } };
    });
    ws.getRow(3).height = 24;

    data.chiTiet.forEach((row, i) => {
        const isOdd = i % 2 === 0;
        const hasDebt = row.conNo > 0;
        const bgArgb = hasDebt ? 'FFFFF3E0' : isOdd ? 'FFFFFFFF' : 'FFF5F5F5';
        const rowNote = notes[row.nhaKhoaId] || row.ghiChu || '';

        const dataRow = ws.addRow([
            row.stt, row.tenNhaKhoa,
            row.noDauKy ?? 0, row.phatSinh ?? 0, row.thanhToan ?? 0, row.conNo ?? 0,
            rowNote,
        ]);
        dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
            cell.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: col === 2 || col === 7 ? 'left' : col === 1 ? 'center' : 'right', wrapText: col === 7 };
            cell.font = { size: 10, bold: col === 6 && hasDebt };
            if (col >= 3 && col <= 6) cell.numFmt = numFmt;
        });
        ws.getRow(3 + i + 1).height = 20;
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `DOANH_THU_T${String(thang).padStart(2, '0')}_${nam}.xlsx`);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BaoCaoDoanhThuPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { doanhThuData: data, doanhThuLoading: loading, doanhThuError: error } = useSelector((state) => state.baoCao);

    const [nam, setNam] = useState(currentYear);
    const [thang, setThang] = useState(currentMonth);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [notes, setNotes] = useState({});

    // Sync notes từ API khi data thay đổi
    useEffect(() => {
        if (data?.chiTiet) {
            const initNotes = {};
            data.chiTiet.forEach(row => { if (row.ghiChu) initNotes[row.nhaKhoaId] = row.ghiChu; });
            setNotes(initNotes);
        } else {
            setNotes({});
        }
    }, [data]);

    let startMonth = 1;
    let endMonth = 12;
    if (nam === BASE_YEAR) startMonth = BASE_MONTH;
    if (nam === currentYear) endMonth = Math.min(currentMonth + 1, 12);
    const availableMonths = Array.from({ length: endMonth - startMonth + 1 }, (_, i) => startMonth + i);

    const handleNamChange = (e) => {
        const y = Number(e.target.value);
        setNam(y);
        if (y === currentYear && thang > currentMonth + 1) setThang(currentMonth + 1);
    };

    const handleSearch = useCallback(async () => {
        try { await dispatch(fetchBaoCaoDoanhThuThang({ thang, nam })).unwrap(); }
        catch (err) { console.error(err); }
    }, [dispatch, thang, nam]);

    const handleExport = () => { if (data) exportToExcel(data, notes, thang, nam); };

    return (
        <div className="bg-[#f0f2f8] flex flex-col overflow-hidden" style={{ fontFamily: FONT, height: 'calc(100vh - 70px)' }}>

            {/* ── Header + Filter (1 dòng) ── */}
            <div className="shrink-0 mx-4 mt-3 mb-3">
                <Paper elevation={0} sx={{ px: 2, py: 1.2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, border: '1px solid #e0e4f0', borderRadius: 2 }}>
                    {/* LEFT: filter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button
                            startIcon={<ArrowBackIcon fontSize="small" />}
                            onClick={() => navigate('/bao-cao')}
                            size="small"
                            sx={{ fontFamily: FONT, fontWeight: 600, borderRadius: 1.5, color: '#555', '&:hover': { bgcolor: '#e8eaf6' }, px: 1.5, whiteSpace: 'nowrap' }}
                        >
                            Quay lại
                        </Button>
                        <FormControl size="small" sx={{ minWidth: 90 }}>
                            <InputLabel sx={{ fontFamily: FONT }}>Năm</InputLabel>
                            <Select value={nam} label="Năm" onChange={handleNamChange} sx={{ fontFamily: FONT }}>
                                {NAM_LIST.map(y => <MenuItem key={y} value={y} sx={{ fontFamily: FONT }}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 105 }}>
                            <InputLabel sx={{ fontFamily: FONT }}>Tháng</InputLabel>
                            <Select value={thang} label="Tháng" onChange={e => setThang(Number(e.target.value))} sx={{ fontFamily: FONT }}>
                                {availableMonths.map(t => <MenuItem key={t} value={t} sx={{ fontFamily: FONT }}>Tháng {t}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button variant="contained"
                            startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <SearchIcon fontSize="small" />}
                            onClick={handleSearch} disabled={loading}
                            sx={{ fontFamily: FONT, fontWeight: 600, borderRadius: 1.5, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' }, px: 2 }}
                        >
                            Xem báo cáo
                        </Button>
                    </Box>

                    {/* CENTER: tiêu đề */}
                    <Typography fontWeight={800} sx={{ flexGrow: 1, textAlign: 'center', fontFamily: FONT, fontSize: { xs: '0.85rem', sm: '1rem' }, background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        BÁO CÁO DOANH THU THÁNG {String(thang).padStart(2, '0')}/{nam}
                    </Typography>

                    {/* RIGHT: action buttons */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" startIcon={<EditNoteIcon fontSize="small" />} onClick={() => setDialogOpen(true)} size="small"
                            sx={{ fontFamily: FONT, fontWeight: 600, borderRadius: 1.5, borderColor: '#1a237e', color: '#1a237e', '&:hover': { bgcolor: '#e8eaf6', borderColor: '#1a237e' }, px: 1.5, whiteSpace: 'nowrap' }}>
                            Số dư đầu kỳ
                        </Button>
                        {data?.chiTiet && (
                            <Button variant="contained" startIcon={<ExcelSvgIcon />} onClick={handleExport} size="small"
                                sx={{ bgcolor: '#217346', '&:hover': { bgcolor: '#185C37' }, fontFamily: FONT, fontWeight: 600, borderRadius: 1.5, px: 1.5, whiteSpace: 'nowrap' }}>
                                Xuất Excel
                            </Button>
                        )}
                    </Box>
                </Paper>
            </div>

            <SoDuDauKyDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

            {error && <Alert severity="error" sx={{ mb: 2, mx: 4, fontFamily: FONT }}>{error}</Alert>}

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <CircularProgress sx={{ color: '#1a237e' }} />
                </div>
            )}

            {data && !loading && data.chiTiet && data.tongHop && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 pb-4">
                    <BaoCaoDoanhThuTable
                        data={data}
                        notes={notes}
                        setNotes={setNotes}
                        thang={thang}
                        nam={nam}
                    />
                </div>
            )}
        </div>
    );
}