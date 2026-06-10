import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    Box, Paper, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    useMediaQuery, useTheme, Divider,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useDispatch } from 'react-redux';
import { upsertGhiChu } from '../../redux/slices/baoCaoSlice';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? '0' : new Intl.NumberFormat('vi-VN').format(n);
const fmtStrict = (n) => n == null ? '0' : new Intl.NumberFormat('vi-VN').format(n);

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
const MemoizedTableRow = memo(function MemoizedTableRow({ row, i, rowNote, onOpenNote }) {
    const hasDebt = row.conNo > 0;
    const isZeroDebt = row.conNo === 0;
    const rowBg = hasDebt ? '#fff5f5' : isZeroDebt ? '#dcedc8' : (i % 2 === 0 ? '#fff' : '#f8f9fc');
    return (
        <TableRow
            sx={{ bgcolor: rowBg, '&:hover': { bgcolor: '#e8eaf6' }, transition: 'background 0.15s' }}
        >
            <TableCell align="center" sx={{ ...cellSx, color: '#9e9e9e', width: 44 }}>{row.stt}</TableCell>

            <TableCell sx={{ ...cellSx, fontWeight: 600, minWidth: 150, maxWidth: 180, color: '#212121' }}>
                {row.tenNhaKhoa}
            </TableCell>

            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: row.noDauKy < 0 ? '#c62828' : '#455a64' }}>{fmtStrict(row.noDauKy)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: '#2e7d32' }}>{fmt(row.phatSinh)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: 600, fontSize: '0.85rem', color: '#6a1b9a' }}>{fmt(row.thanhToan)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: hasDebt ? 800 : 600, fontSize: '0.85rem', color: hasDebt ? '#c62828' : row.conNo < 0 ? '#1565c0' : '#546e7a' }}>{fmtStrict(row.conNo)}</TableCell>

            <TableCell
                onClick={() => onOpenNote(row)}
                title={rowNote || 'Nhấn để thêm ghi chú'}
                sx={{ ...cellSx, minWidth: 180, maxWidth: 260, cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: '#e3f2fd' } }}
            >
                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: rowNote ? '#455a64' : '#b0bec5', fontStyle: rowNote ? 'normal' : 'italic' }}>
                    {rowNote || ''}
                </span>
            </TableCell>
        </TableRow>
    );
});

// ─── Mobile Card Row ─────────────────────────────────────────────────────────
const MobileCard = memo(function MobileCard({ row, i, rowNote, onOpenNote }) {
    const hasDebt = row.conNo > 0;
    const isZeroDebt = row.conNo === 0;

    const borderColor = hasDebt ? '#ffcdd2' : isZeroDebt ? '#81c784' : '#e0e4f0';
    const bgCard = hasDebt ? '#fff5f5' : isZeroDebt ? '#dcedc8' : '#fff';
    const bgHeader = hasDebt ? '#fff0f0' : isZeroDebt ? '#c5e1a5' : '#f5f7ff';

    return (
        <Paper
            elevation={0}
            sx={{
                border: `1px solid ${borderColor}`,
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: bgCard,
            }}
        >
            {/* Header card: STT + tên */}
            <Box sx={{
                px: 1.5, py: 1,
                bgcolor: bgHeader,
                borderBottom: `1px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', gap: 1,
            }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.7rem', color: '#9e9e9e', minWidth: 20 }}>
                    {row.stt}
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: '#1a237e', flex: 1 }}>
                    {row.tenNhaKhoa}
                </Typography>
            </Box>

            {/* Body: 4 chỉ số dạng 2x2 grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <StatCell
                    label="Nợ Đầu Kỳ"
                    value={fmtStrict(row.noDauKy)}
                    borderRight
                    borderBottom
                />
                <StatCell
                    label="Phát Sinh"
                    value={fmt(row.phatSinh)}
                    borderBottom
                />
                <StatCell
                    label="Thanh Toán"
                    value={fmt(row.thanhToan)}
                    borderRight
                />
                <StatCell
                    label="Còn Nợ"
                    value={fmtStrict(row.conNo)}
                    bold={hasDebt}
                />
            </Box>

            {/* Footer: ghi chú */}
            <Box
                onClick={() => onOpenNote(row)}
                sx={{
                    px: 1.5, py: 0.8,
                    borderTop: `1px solid ${borderColor}`,
                    display: 'flex', alignItems: 'center', gap: 0.8,
                    cursor: 'pointer',
                    bgcolor: bgHeader,
                    '&:active': { bgcolor: '#e3f2fd' },
                }}
            >
                <EditNoteIcon sx={{ fontSize: '0.95rem', color: '#b0bec5', flexShrink: 0 }} />
                <Typography sx={{
                    fontFamily: FONT,
                    fontSize: '0.78rem',
                    color: rowNote ? '#455a64' : '#b0bec5',
                    fontStyle: rowNote ? 'normal' : 'italic',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {rowNote || 'Thêm ghi chú...'}
                </Typography>
            </Box>
        </Paper>
    );
});

// ─── StatCell (dùng trong MobileCard) ───────────────────────────────────────
function StatCell({ label, value, borderRight, borderBottom, bold }) {
    return (
        <Box sx={{
            px: 1.5, py: 0.9,
            borderRight: borderRight ? '1px solid #e0e0e0' : 'none',
            borderBottom: borderBottom ? '1px solid #e0e0e0' : 'none',
        }}>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.65rem', color: '#9e9e9e', mb: 0.2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {label}
            </Typography>
            <Typography sx={{ fontFamily: FONT, fontSize: '0.85rem', color: '#212121', fontWeight: bold ? 800 : 600 }}>
                {value}
            </Typography>
        </Box>
    );
}

// ─── Mobile Summary Bar ──────────────────────────────────────────────────────
function MobileSummaryBar({ tongHop, thang, nam, count }) {
    return (
        <Paper elevation={0} sx={{ border: '1px solid #c5cae9', borderRadius: 2, overflow: 'hidden', bgcolor: '#e8eaf6' }}>
            <Box sx={{ px: 1.5, py: 0.8, bgcolor: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.72rem', color: '#c5cae9', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Tổng Cộng
                </Typography>
                <Typography sx={{ fontFamily: FONT, fontSize: '0.68rem', color: '#9fa8da' }}>
                    {count} nha khoa · T{String(thang).padStart(2, '0')}/{nam}
                </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <StatCell label="Nợ Đầu Kỳ" value={fmtStrict(tongHop.noDauKy)} borderRight borderBottom />
                <StatCell label="Phát Sinh" value={fmtStrict(tongHop.phatSinh)} borderBottom />
                <StatCell label="Thanh Toán" value={fmtStrict(tongHop.thanhToan)} borderRight />
                <StatCell label="Còn Nợ" value={fmtStrict(tongHop.conNo)} bold />
            </Box>
        </Paper>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BaoCaoDoanhThuTable({ data, notes, setNotes, thang, nam }) {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [sortConfig, setSortConfig] = useState({ key: null, dir: null });
    const [noteModal, setNoteModal] = useState(null);
    const [noteInput, setNoteInput] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [noteError, setNoteError] = useState('');

    // ── Sort ──────────────────────────────────────────────────────────────────
    const handleSort = useCallback((key) => {
        setSortConfig(prev => {
            if (prev.key !== key) return { key, dir: 'desc' };
            if (prev.dir === 'desc') return { key, dir: 'asc' };
            return { key: null, dir: null };
        });
    }, []);

    const sortedData = useMemo(() => {
        if (!data?.chiTiet) return [];
        if (!sortConfig.key || !sortConfig.dir) return data.chiTiet;
        return [...data.chiTiet].sort((a, b) => {
            const va = a[sortConfig.key] ?? 0;
            const vb = b[sortConfig.key] ?? 0;
            return sortConfig.dir === 'asc' ? va - vb : vb - va;
        });
    }, [data, sortConfig]);

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
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    flex: 1,
                    minHeight: 0,
                    px: 0.5,
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 3 }}>
                        {/* Summary đặt trên cùng */}
                        <MobileSummaryBar tongHop={data.tongHop} thang={thang} nam={nam} count={data.chiTiet.length} />

                        {/* Danh sách card */}
                        {sortedData.map((row, i) => (
                            <MobileCard
                                key={row.nhaKhoaId}
                                row={row}
                                i={i}
                                rowNote={notes[row.nhaKhoaId]}
                                onOpenNote={handleOpenNote}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Modal ghi chú — dùng chung */}
                <NoteDialog
                    noteModal={noteModal}
                    noteInput={noteInput}
                    setNoteInput={setNoteInput}
                    noteError={noteError}
                    savingNote={savingNote}
                    onCancel={handleCancelNote}
                    onSave={handleSaveNote}
                />
            </>
        );
    }

    // ── Desktop View ──────────────────────────────────────────────────────────
    return (
        <>
            <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 2, border: '1px solid #e0e4f0', overflow: 'hidden', flex: 1, minHeight: 0 }}>
                <TableContainer
                    sx={{ overflow: 'auto', overscrollBehavior: 'contain', maxHeight: 'calc(100vh - 70px - 56px - 20px)' }}
                >
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={headerSx}>STT</TableCell>
                                <TableCell align="left" sx={headerSx}>Tên Nha Khoa</TableCell>
                                {SORT_COLS.map(({ label, key }) => {
                                    const isActive = sortConfig.key === key;
                                    const SortIcon = isActive
                                        ? (sortConfig.dir === 'asc' ? ArrowUpwardIcon : ArrowDownwardIcon)
                                        : UnfoldMoreIcon;
                                    return (
                                        <TableCell key={key} align="right"
                                            onClick={() => handleSort(key)}
                                            sx={{ ...headerSx, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: '#283593' } }}
                                        >
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
                            {sortedData.map((row, i) => (
                                <MemoizedTableRow
                                    key={row.nhaKhoaId}
                                    row={row}
                                    i={i}
                                    rowNote={notes[row.nhaKhoaId]}
                                    onOpenNote={handleOpenNote}
                                />
                            ))}

                            <TableRow sx={sumRowSx}>
                                <TableCell colSpan={2} align="center" sx={{ ...totalCellSx, color: "#1a237e", letterSpacing: "0.05em" }}>TỔNG CỘNG</TableCell>
                                <TableCell align="right" sx={{ ...totalCellSx, color: "#1565c0" }}>{fmtStrict(data.tongHop.noDauKy)}</TableCell>
                                <TableCell align="right" sx={{ ...totalCellSx, color: "#2e7d32" }}>{fmtStrict(data.tongHop.phatSinh)}</TableCell>
                                <TableCell align="right" sx={{ ...totalCellSx, color: "#6a1b9a" }}>{fmtStrict(data.tongHop.thanhToan)}</TableCell>
                                <TableCell align="right" sx={{ ...totalCellSx, color: "#c62828" }}>{fmtStrict(data.tongHop.conNo)}</TableCell>
                                <TableCell sx={{ ...totalCellSx }}></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ px: 2.5, py: 1.2, bgcolor: '#fafbff', borderTop: '1px solid #e0e4f0', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT }}>
                        {data.chiTiet.length} nha khoa &nbsp;·&nbsp; Tháng {String(thang).padStart(2, '0')}/{nam}
                    </Typography>
                </Box>
            </Paper>

            <NoteDialog
                noteModal={noteModal}
                noteInput={noteInput}
                setNoteInput={setNoteInput}
                noteError={noteError}
                savingNote={savingNote}
                onCancel={handleCancelNote}
                onSave={handleSaveNote}
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