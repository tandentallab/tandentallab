import React, { useState, useCallback, useEffect } from 'react';
import {
    Box, Paper, Typography, Button, CircularProgress,
    Select, MenuItem, FormControl, InputLabel, Alert,
    TextField, InputAdornment
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { fetchBaoCaoDoanhThuThang } from '../../redux/slices/baoCaoSlice';
import BaoCaoDoanhThuTable from './BaoCaoDoanhThuTable';
import { FaFileExcel } from "react-icons/fa6";

// ─── Helpers ────────────────────────────────────────────────────────────────
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const BASE_YEAR = 2026;
const BASE_MONTH = 5;
const NAM_LIST = Array.from({ length: currentYear - BASE_YEAR + 1 }, (_, i) => BASE_YEAR + i).reverse();



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
        const rowNote = notes[row.nhaKhoaId] || row.ghiChu || '';
        const isHetNo = row.conNo === 0;
        const bgArgb = isHetNo ? 'FFE8F5E9' : 'FFFFFFFF';

        const dataRow = ws.addRow([
            row.stt, row.tenNhaKhoa,
            row.noDauKy ?? 0, row.phatSinh ?? 0, row.thanhToan ?? 0, row.conNo ?? 0,
            rowNote,
        ]);

        dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
            cell.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: col === 2 || col === 7 ? 'left' : col === 1 ? 'center' : 'right', wrapText: col === 7 };
            cell.font = { size: 10, bold: isHetNo };
            if (col >= 3 && col <= 6) cell.numFmt = numFmt;
        });
        ws.getRow(3 + i + 1).height = 20;
    });

    const buf = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `DOANH_THU_T${String(thang).padStart(2, '0')}_${nam}.xlsx`);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BaoCaoDoanhThuPage() {
    const dispatch = useDispatch();
    const { doanhThuData: data, doanhThuLoading: loading, doanhThuError: error } = useSelector((state) => state.baoCao);

    const [nam, setNam] = useState(currentYear);
    const [thang, setThang] = useState(currentMonth);
    const [notes, setNotes] = useState({});
    const [showTable, setShowTable] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        setShowTable(false);
    };

    const handleSearch = useCallback(async () => {
        try {
            await dispatch(fetchBaoCaoDoanhThuThang({ thang, nam })).unwrap();
            setShowTable(true);
        }
        catch (err) { console.error(err); }
    }, [dispatch, thang, nam]);

    const handleExport = () => { if (data) exportToExcel(data, notes, thang, nam); };

    const hasData = !!data?.chiTiet;

    return (

        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5, padding: 2 }}
            style={{ maxHeight: 'calc(100vh - 70px)' }}>

            {/* ─── Toolbar ─────────────────────────────────────────────── */}
            <Paper elevation={0} sx={{
                px: { xs: 1.5, sm: 3 },
                py: { xs: 1.25, sm: 1.2 },
                border: '1px solid #e0e4f0',
                borderRadius: 2,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1,
            }}>
                {/* Chọn năm */}
                <FormControl size="small" sx={{ minWidth: 80, flex: { xs: '1 1 0', sm: '0 0 auto' } }}>
                    <InputLabel sx={{}}>Năm</InputLabel>
                    <Select value={nam} label="Năm" onChange={handleNamChange} sx={{}}>
                        {NAM_LIST.map(y => <MenuItem key={y} value={y} sx={{}}>{y}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* Chọn tháng */}
                <FormControl size="small" sx={{ minWidth: 95, flex: { xs: '1 1 0', sm: '0 0 auto' } }}>
                    <InputLabel sx={{}}>Tháng</InputLabel>
                    <Select value={thang} label="Tháng" onChange={e => { setThang(Number(e.target.value)); setShowTable(false); }} sx={{}}>
                        {availableMonths.map(t => <MenuItem key={t} value={t} >Tháng {t}</MenuItem>)}
                    </Select>
                </FormControl>

                {/* Nút Xem */}
                <Button variant="contained"
                    startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <SearchIcon fontSize="small" />}
                    onClick={handleSearch} disabled={loading}
                    sx={{
                        fontWeight: 600, borderRadius: 1.5,
                        bgcolor: '#167b82', '&:hover': { bgcolor: '#42d1db' },
                        px: { xs: 1.5, sm: 2 },
                        height: 40,
                        whiteSpace: 'nowrap',
                        flex: '0 0 auto',
                    }}
                >
                    Xem
                </Button>

                {/* Spacer — đẩy search + excel về bên phải trên desktop */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                {/* Ô tìm kiếm — chỉ hiện khi có data */}
                {hasData && (
                    <TextField
                        size="small"
                        placeholder="Tìm nha khoa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            flex: { xs: '1 1 auto', sm: '0 0 160px' },
                            '& .MuiInputBase-root': { height: 40, fontSize: '0.85rem', borderRadius: 1.5 },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ opacity: 0.6 }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}

                {/* Nút xuất Excel — chỉ hiện khi có data */}
                {hasData && (
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        size="small"
                        title="Xuất Excel"
                        sx={{
                            bgcolor: '#217346',
                            '&:hover': { bgcolor: '#185C37' },
                            borderRadius: 1.5,
                            minWidth: 40,
                            width: 40,
                            height: 40,
                            p: 0,
                        }}
                    >
                        <FaFileExcel size={20} />
                    </Button>
                )}
            </Paper>

            {error && <Alert severity="error" sx={{}}>{error}</Alert>}

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <CircularProgress sx={{ color: '#1a237e' }} />
                </div>
            )}

            {!loading && !showTable && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 pb-20">
                    <SearchIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 500 }}>
                        Vui lòng chọn thời gian và bấm "Xem báo cáo"
                    </Typography>
                </div>
            )}

            {showTable && data && !loading && data.chiTiet && data.tongHop && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-in fade-in duration-300">
                    <BaoCaoDoanhThuTable
                        data={data}
                        notes={notes}
                        setNotes={setNotes}
                        thang={thang}
                        nam={nam}
                        searchTerm={searchTerm}
                    />
                </div>
            )}

        </Box>
    );
}