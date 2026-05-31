import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    Box, Paper, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tooltip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
} from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
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

const SORT_COLS = [
    { label: 'Nợ Đầu Kỳ', key: 'noDauKy' },
    { label: 'Phát Sinh', key: 'phatSinh' },
    { label: 'Thanh Toán', key: 'thanhToan' },
    { label: 'Còn Nợ', key: 'conNo' },
];

// ─── Memoized Row ────────────────────────────────────────────────────────────
const MemoizedTableRow = memo(function MemoizedTableRow({ row, i, isHovered, rowNote, onMouseEnter, onMouseLeave, onOpenNote }) {
    const hasDebt = row.conNo > 0;
    return (
        <TableRow
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            sx={{ bgcolor: hasDebt ? '#fff8e1' : i % 2 === 0 ? '#fff' : '#f8f9fc', '&:hover': { bgcolor: '#e8eaf6' }, transition: 'background 0.15s' }}
        >
            <TableCell align="center" sx={{ ...cellSx, color: '#9e9e9e', width: 44 }}>{row.stt}</TableCell>

            <TableCell sx={{ ...cellSx, fontWeight: 600, minWidth: 360, width: 360, color: '#212121', position: 'relative' }}>
                <Tooltip
                    open={isHovered && !!rowNote}
                    title={rowNote ? `Ghi chú: ${rowNote}` : ''}
                    placement="bottom-start"
                    arrow
                    componentsProps={{
                        tooltip: { sx: { bgcolor: '#fffae6', color: '#5d4037', boxShadow: '0px 4px 14px rgba(0,0,0,0.2)', fontSize: '0.85rem', fontFamily: FONT, border: '1px solid #ffe082', padding: '8px 14px', maxWidth: 350, zIndex: 9999 } },
                        arrow: { sx: { color: '#fffae6', '&::before': { border: '1px solid #ffe082' } } },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', cursor: rowNote ? 'help' : 'default', pr: 3.5, overflow: 'hidden' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.tenNhaKhoa}</span>
                    </Box>
                </Tooltip>
                <Tooltip title={rowNote ? 'Sửa ghi chú' : 'Thêm ghi chú'}>
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); onOpenNote(row); }}
                        sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', p: 0.3, color: rowNote ? '#5c6bc0' : '#9e9e9e', opacity: isHovered ? 1 : 0, transition: 'opacity 0.15s', pointerEvents: isHovered ? 'auto' : 'none' }}
                    >
                        <AddCircleOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>

            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, color: row.noDauKy < 0 ? '#c62828' : '#455a64' }}>{fmtStrict(row.noDauKy)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, color: '#2e7d32', fontWeight: 500 }}>{fmt(row.phatSinh)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, color: '#6a1b9a' }}>{fmt(row.thanhToan)}</TableCell>
            <TableCell align="right" sx={{ ...cellSx, minWidth: 110, fontWeight: hasDebt ? 700 : 400, color: hasDebt ? '#c62828' : row.conNo < 0 ? '#1565c0' : '#546e7a' }}>{fmtStrict(row.conNo)}</TableCell>
        </TableRow>
    );
});

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BaoCaoDoanhThuTable({ data, notes, setNotes, thang, nam }) {
    const dispatch = useDispatch();

    const [hoveredRow, setHoveredRow] = useState(null);
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
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedData.map((row, i) => (
                                <MemoizedTableRow
                                    key={row.nhaKhoaId}
                                    row={row}
                                    i={i}
                                    isHovered={hoveredRow === row.nhaKhoaId}
                                    rowNote={notes[row.nhaKhoaId]}
                                    onMouseEnter={() => setHoveredRow(row.nhaKhoaId)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onOpenNote={handleOpenNote}
                                />
                            ))}

                            <TableRow sx={sumRowSx}>
                                <TableCell colSpan={2} align="center" sx={{ ...cellSx, fontWeight: 800, color: '#1a237e', letterSpacing: '0.05em' }}>TỔNG CỘNG</TableCell>
                                <TableCell align="right" sx={{ ...cellSx, color: '#1565c0', fontWeight: 700 }}>{fmtStrict(data.tongHop.noDauKy)}</TableCell>
                                <TableCell align="right" sx={{ ...cellSx, color: '#2e7d32', fontWeight: 700 }}>{fmtStrict(data.tongHop.phatSinh)}</TableCell>
                                <TableCell align="right" sx={{ ...cellSx, color: '#6a1b9a', fontWeight: 700 }}>{fmtStrict(data.tongHop.thanhToan)}</TableCell>
                                <TableCell align="right" sx={{ ...cellSx, color: '#c62828', fontWeight: 700 }}>{fmtStrict(data.tongHop.conNo)}</TableCell>
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

            {/* ── Modal ghi chú ── */}
            <Dialog open={!!noteModal} onClose={handleCancelNote} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2, fontFamily: FONT } }}>
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
                    <Button onClick={handleCancelNote} disabled={savingNote} size="small" sx={{ fontFamily: FONT, color: '#757575', '&:hover': { bgcolor: '#f5f5f5' } }}>Hủy</Button>
                    <Button onClick={handleSaveNote} variant="contained" size="small" disabled={savingNote} sx={{ fontFamily: FONT, fontWeight: 600, bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' }, borderRadius: 1.5 }}>
                        {savingNote ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}