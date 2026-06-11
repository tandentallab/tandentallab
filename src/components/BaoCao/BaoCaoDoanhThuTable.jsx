import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    Box, Paper, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    useMediaQuery, useTheme
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useDispatch } from 'react-redux';
import { upsertGhiChu } from '../../redux/slices/baoCaoSlice';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '0' : new Intl.NumberFormat('vi-VN').format(Math.abs(n));
const fmtStrict = (n) => n == null ? '0' : new Intl.NumberFormat('vi-VN').format(Math.abs(n));

// ─── Styles ─────────────────────────────────────────────────────────────────
const FONT = "'Cambria', 'serif'";
const headerSx = { backgroundColor: '#1a237e', color: '#fff', fontWeight: 700, fontSize: '0.76rem', fontFamily: FONT, letterSpacing: '0.04em', whiteSpace: 'nowrap', py: 1.4, border: '1px solid #283593', textTransform: 'uppercase' };
const sumRowSx = { backgroundColor: '#e8eaf6', fontWeight: 700, fontFamily: FONT };
const cellSx = { fontSize: '0.82rem', fontFamily: FONT, py: 1, px: 1.5, border: '1px solid #eeeeee' };
const totalCellSx = { ...cellSx, fontWeight: 900, fontSize: "sm" };

const SORT_COLS = [
    { label: 'Nợ Đầu Kỳ', key: 'noDauKy' },
    { label: 'Phát Sinh', key: 'phatSinh' },
    { label: 'Thanh Toán', key: 'thanhToan' },
    { label: 'Còn Nợ', key: 'conNo' },
];

// ─── Memoized Desktop Row ────────────────────────────────────────────────────
const MemoizedTableRow = memo(function MemoizedTableRow({ row, rowNote, onOpenNote }) {
    const hasDebt = row.conNo > 0;

    // Nền: Có nợ -> Đỏ nhạt | Hết nợ -> Trắng
    const rowBg = hasDebt ? '#fff5f5' : '#ffffff';
    const conNoColor = hasDebt ? '#d32f2f' : '#2e7d32';

    return (
        <TableRow sx={{ bgcolor: rowBg, '&:hover': { bgcolor: '#f5f5f5' }, transition: 'background 0.15s' }}>
            <TableCell align="center" sx={{ ...cellSx, color: '#9e9e9e', width: 44 }}>{row.stt}</TableCell>

            <TableCell sx={{ ...cellSx, fontWeight: 600, minWidth: 150, maxWidth: 180, color: '#212121' }}>
                {row.tenNhaKhoa}
            </TableCell>

            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}>{fmtStrict(row.noDauKy)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}>{fmt(row.phatSinh)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: '#424242' }}>{fmt(row.thanhToan)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: hasDebt ? 800 : 700, fontSize: '0.85rem', color: conNoColor }}>{fmtStrict(row.conNo)}</TableCell>

            <TableCell
                onClick={() => onOpenNote(row)}
                title={rowNote || 'Nhấn để thêm ghi chú'}
                sx={{ ...cellSx, minWidth: 180, maxWidth: 260, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: '#f0f0f0' } }}
            >
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: rowNote ? '#455a64' : '#b0bec5', fontStyle: rowNote ? 'normal' : 'italic' }}>
                    {rowNote || ''}
                </span>
            </TableCell>
        </TableRow>
    );
});

// ─── StatCell (dùng trong MobileCard và MobileSummary) ──────────────────────
function StatCell({ label, value, valueColor }) {
    return (
        <Box sx={{ px: 1.5, py: 0.8 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', fontWeight: 700, color: 'inherit', opacity: 0.65, mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {label}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '1.05rem', color: valueColor || 'inherit', fontWeight: 800 }}>
                {value}
            </Typography>
        </Box>
    );
}

// ─── Mobile Card Row ─────────────────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ row, rowNote, onOpenNote }) {
    const hasDebt = row.conNo > 0;
    const isZeroDebt = row.conNo === 0;

    // Phối màu Mobile: Xanh lá 300 cho hết nợ, Đỏ nhạt cho có nợ
    const cardBg = isZeroDebt ? '#c2fcc5' : '#ffebee';

    // Đảm bảo tương phản text: Xanh lục đậm nếu nền xanh lá, xám đen nếu nền đỏ nhạt
    const textColor = isZeroDebt ? '#144a18' : '#212121';
    const conNoColor = hasDebt ? '#c62828' : '#0d3b11';

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: cardBg, color: textColor, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #999' }}>

            {/* Header ko có viền phân cách */}
            <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, opacity: 0.7, minWidth: 20 }}>
                    {row.stt}
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', flex: 1, lineHeight: 1.3 }}>
                    {row.tenNhaKhoa}
                </Typography>
            </Box>

            {/* Body 4 chỉ số ko có viền kẻ */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, pb: 0.5 }}>
                <StatCell label="Nợ Đầu Kỳ" value={fmtStrict(row.noDauKy)} />
                <StatCell label="Phát Sinh" value={fmt(row.phatSinh)} />
                <StatCell label="Thanh Toán" value={fmt(row.thanhToan)} />
                <StatCell label="Còn Nợ" value={fmtStrict(row.conNo)} valueColor={conNoColor} />
            </Box>

            {/* Footer màu trắng tách biệt */}
            <Box
                onClick={() => onOpenNote(row)}
                sx={{
                    px: 1.5, py: 1,
                    display: 'flex', alignItems: 'center', gap: 0.8,
                    cursor: 'pointer',
                    bgcolor: '#ffffff',
                    '&:active': { bgcolor: '#f0f0f0' },
                }}
            >
                <EditNoteIcon sx={{ fontSize: '1.1rem', color: rowNote ? '#2e7d32' : '#b0bec5', flexShrink: 0 }} />
                <Typography sx={{
                    fontFamily: FONT, fontSize: '0.85rem',
                    color: rowNote ? '#424242' : '#9e9e9e',
                    fontStyle: rowNote ? 'normal' : 'italic', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {rowNote || 'Nhấn để thêm ghi chú...'}
                </Typography>
            </Box>
        </Paper>
    );
});

// ─── Mobile Summary Bar ──────────────────────────────────────────────────────
function MobileSummaryBar({ tongHop, thang, nam, count }) {
    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#fff', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Tổng Cộng
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.75rem', color: '#c5cae9', fontWeight: 600 }}>
                    {count} nha khoa · T{String(thang).padStart(2, '0')}/{nam}
                </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, bgcolor: '#ffffff', color: '#212121', pt: 0.5, pb: 0.5 }}>
                <StatCell label="Nợ Đầu Kỳ" value={fmtStrict(tongHop.noDauKy)} />
                <StatCell label="Phát Sinh" value={fmtStrict(tongHop.phatSinh)} />
                <StatCell label="Thanh Toán" value={fmtStrict(tongHop.thanhToan)} />
                <StatCell label="Còn Nợ" value={fmtStrict(tongHop.conNo)} valueColor="#d32f2f" />
            </Box>
        </Paper>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BaoCaoDoanhThuTable({ data, notes, setNotes, thang, nam, searchTerm = '' }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [sortConfig, setSortConfig] = useState({ key: null, dir: null });
    const [noteModal, setNoteModal] = useState(null);
    const [noteInput, setNoteInput] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [noteError, setNoteError] = useState('');

    // ── Filter Data ───────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        if (!data?.chiTiet) return [];
        if (!searchTerm.trim()) return data.chiTiet;
        const lowerQuery = searchTerm.toLowerCase();
        return data.chiTiet.filter(row => row.tenNhaKhoa?.toLowerCase().includes(lowerQuery));
    }, [data, searchTerm]);

    // ── Sort ──────────────────────────────────────────────────────────────────
    const handleSort = useCallback((key) => {
        setSortConfig(prev => {
            if (prev.key !== key) return { key, dir: 'desc' };
            if (prev.dir === 'desc') return { key, dir: 'asc' };
            return { key: null, dir: null };
        });
    }, []);

    const sortedData = useMemo(() => {
        if (!filteredData.length) return [];
        if (!sortConfig.key || !sortConfig.dir) return filteredData;
        return [...filteredData].sort((a, b) => {
            const va = a[sortConfig.key] ?? 0;
            const vb = b[sortConfig.key] ?? 0;
            return sortConfig.dir === 'asc' ? va - vb : vb - va;
        });
    }, [filteredData, sortConfig]);

    // ── Dynamic Totals ────────────────────────────────────────────────────────
    const dynamicTongHop = useMemo(() => {
        if (!searchTerm.trim() || !filteredData.length) return data.tongHop;
        return filteredData.reduce((acc, row) => ({
            noDauKy: acc.noDauKy + (row.noDauKy || 0),
            phatSinh: acc.phatSinh + (row.phatSinh || 0),
            thanhToan: acc.thanhToan + (row.thanhToan || 0),
            conNo: acc.conNo + (row.conNo || 0),
        }), { noDauKy: 0, phatSinh: 0, thanhToan: 0, conNo: 0 });
    }, [filteredData, data.tongHop, searchTerm]);

    // ── Note modal ────────────────────────────────────────────────────────────
    const handleOpenNote = useCallback((row) => {
        setNoteModal({ nhaKhoaId: row.nhaKhoaId, tenNhaKhoa: row.tenNhaKhoa });
        setNoteInput(notes[row.nhaKhoaId] || '');
        setNoteError('');
    }, [notes]);

    const handleCancelNote = () => {
        if (savingNote) return;
        setNoteModal(null);
        setNoteInput('');
        setNoteError('');
    };

    const handleSaveNote = async () => {
        if (!noteModal) return;
        setSavingNote(true);
        setNoteError('');
        try {
            await dispatch(upsertGhiChu({ id: noteModal.nhaKhoaId, thang, nam, noiDung: noteInput.trim() })).unwrap();
            setNotes(prev => ({ ...prev, [noteModal.nhaKhoaId]: noteInput.trim() }));
            setNoteModal(null);
        } catch (err) {
            setNoteError(err || 'Lưu thất bại, thử lại.');
        } finally {
            setSavingNote(false);
        }
    };

    if (!data?.chiTiet || !data?.tongHop) return null;

    // ── Mobile View ───────────────────────────────────────────────────────────
    if (isMobile) {
        return (
            <>
                <Box sx={{
                    overflowY: 'auto', overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch', flex: 1, minHeight: 0, px: 0.5,
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>
                        <MobileSummaryBar tongHop={dynamicTongHop} thang={thang} nam={nam} count={filteredData.length} />

                        {sortedData.map((row) => (
                            <MobileCard
                                key={row.nhaKhoaId}
                                row={row}
                                rowNote={notes[row.nhaKhoaId]}
                                onOpenNote={handleOpenNote}
                            />
                        ))}
                    </Box>
                </Box>

                <NoteDialog
                    noteModal={noteModal} noteInput={noteInput} setNoteInput={setNoteInput}
                    noteError={noteError} savingNote={savingNote}
                    onCancel={handleCancelNote} onSave={handleSaveNote}
                />
            </>
        );
    }

    // ── Desktop View ──────────────────────────────────────────────────────────
    return (
        <>
            <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid #e0e4f0', overflow: 'hidden', flex: 1, minHeight: 0 }}>
                <TableContainer sx={{ overflow: 'auto', overscrollBehavior: 'contain', maxHeight: 'calc(100vh - 70px - 56px - 20px)' }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={headerSx}>STT</TableCell>
                                <TableCell align="left" sx={headerSx}>Tên Nha Khoa</TableCell>
                                {SORT_COLS.map(({ label, key }) => {
                                    const isActive = sortConfig.key === key;
                                    const SortIcon = isActive ? (sortConfig.dir === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon) : UnfoldMoreIcon;
                                    return (
                                        <TableCell key={key} align="right" onClick={() => handleSort(key)} sx={{ ...headerSx, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: '#283593' } }}>
                                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                                                {label}
                                                <SortIcon sx={{ fontSize: '0.9rem', opacity: isActive ? 1 : 0.5 }} />
                                            </Box>
                                        </TableCell>
                                    );
                                })}
                                <TableCell align="left" sx={{ ...headerSx, minWidth: 180 }}>Ghi Chú</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedData.map((row) => (
                                <MemoizedTableRow
                                    key={row.nhaKhoaId}
                                    row={row}
                                    rowNote={notes[row.nhaKhoaId]}
                                    onOpenNote={handleOpenNote}
                                />
                            ))}

                            {filteredData.length > 0 && (
                                <TableRow sx={sumRowSx}>
                                    <TableCell colSpan={2} align="center" sx={{ ...totalCellSx, color: "#1a237e", letterSpacing: "0.05em" }}>TỔNG CỘNG</TableCell>
                                    <TableCell align="right" sx={{ ...totalCellSx, color: "#424242" }}>{fmtStrict(dynamicTongHop.noDauKy)}</TableCell>
                                    <TableCell align="right" sx={{ ...totalCellSx, color: "#424242" }}>{fmtStrict(dynamicTongHop.phatSinh)}</TableCell>
                                    <TableCell align="right" sx={{ ...totalCellSx, color: "#424242" }}>{fmtStrict(dynamicTongHop.thanhToan)}</TableCell>
                                    <TableCell align="right" sx={{ ...totalCellSx, color: "#d32f2f" }}>{fmtStrict(dynamicTongHop.conNo)}</TableCell>
                                    <TableCell sx={{ ...totalCellSx }}></TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#fafbff', borderTop: '1px solid #e0e4f0', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>
                        {filteredData.length} nha khoa &nbsp;·&nbsp; Tháng {String(thang).padStart(2, '0')}/{nam}
                    </Typography>
                </Box>
            </Paper>

            <NoteDialog
                noteModal={noteModal} noteInput={noteInput} setNoteInput={setNoteInput}
                noteError={noteError} savingNote={savingNote}
                onCancel={handleCancelNote} onSave={handleSaveNote}
            />
        </>
    );
}

// ─── Shared NoteDialog ────────────────────────────────────────────────────────
function NoteDialog({ noteModal, noteInput, setNoteInput, noteError, savingNote, onCancel, onSave }) {
    return (
        <Dialog open={!!noteModal} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, fontFamily: FONT } }}>
            <DialogTitle sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '1rem', pb: 1 }}>
                📝 Ghi chú — {noteModal?.tenNhaKhoa}
            </DialogTitle>
            <DialogContent sx={{ pt: '8px !important' }}>
                <TextField
                    autoFocus multiline minRows={3} maxRows={6} fullWidth
                    placeholder="Nhập ghi chú..."
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    disabled={savingNote}
                    size="small"
                    sx={{ '& .MuiInputBase-root': { fontFamily: FONT, fontSize: '0.85rem' } }}
                />
                {noteError && <Typography sx={{ color: '#c62828', fontSize: '0.78rem', mt: 0.8, fontFamily: FONT }}>{noteError}</Typography>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onCancel} disabled={savingNote} size="small" sx={{ fontFamily: FONT, color: '#757575', '&:hover': { bgcolor: '#f5f5f5' } }}>Hủy</Button>
                <Button onClick={onSave} variant="contained" size="small" disabled={savingNote} sx={{ fontFamily: FONT, fontWeight: 600, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' }, borderRadius: 1.5 }}>
                    {savingNote ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}