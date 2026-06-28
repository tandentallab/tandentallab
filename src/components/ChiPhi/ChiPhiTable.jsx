import React from 'react';
import {
    Box, Chip, IconButton, Paper, Stack, Table, TableBody,
    TableCell, TableContainer, TableFooter, TableHead, TableRow,
    Tooltip, Typography, CircularProgress,
} from '@mui/material';
import {
    Delete as DeleteIcon, Print as PrintIcon,
    Money as MoneyIcon, Star as StarIcon,
} from '@mui/icons-material';
import { formatVND } from './chiPhiUtils';
import { useSelector } from 'react-redux';

// ─── Ocean palette ───────────────────────────────────────────────
// sky-50  #f0f9ff   row stripe nhạt
// sky-100 #e0f2fe   row stripe đậm hơn
// sky-200 #bae6fd   border thead / divider
// sky-600 #0284c7   icon print, accent
// sky-700 #0369a1   số tiền, footer text
// sky-800 #075985   thead label
// sky-900 #0c4a6e   thead bg gradient anchor
// amber-400 #fbbf24  star auto
// ────────────────────────────────────────────────────────────────

const THEAD_SX = {
    fontWeight: 700,
    fontSize: '0.86rem',
    color: '#0c4a6e',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    py: 1.75,
    borderBottom: 'none',
};

const ChiPhiTable = ({ danhSachChiPhi, isLoading, onPrint, onDelete }) => {

    const user = useSelector((state) => state.auth?.user);
    const isDieuPhoi = user?.quyenSuDung?.ten === "Điều phối";

    const dataHienThi = isDieuPhoi
        ? danhSachChiPhi.filter((item) => item._id !== "auto_luong_nhan_vien")
        : danhSachChiPhi;

    const coDuLieu = dataHienThi.length > 0;
    const tongChiPhi = dataHienThi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    // ── Mobile cards ───────────────────────────────────────────
    const renderMobileCards = () => {
        if (isLoading && !coDuLieu) {
            return (
                <Box className="flex justify-center items-center py-10">
                    <CircularProgress size={28} sx={{ color: '#7dd3fc' }} />
                </Box>
            );
        }

        if (!coDuLieu) {
            return (
                <Paper
                    elevation={0}
                    className="flex flex-col items-center gap-2 py-10 rounded-2xl"
                    sx={{ border: '1px solid #bae6fd', bgcolor: '#f0f9ff', color: '#7dd3fc' }}
                >
                    <MoneyIcon sx={{ fontSize: 40, color: '#bae6fd' }} />
                    <Typography variant="body2" sx={{ color: '#7dd3fc' }}>
                        Không có chi phí nào trong tháng
                    </Typography>
                </Paper>
            );
        }

        return (
            <Box className="flex flex-col gap-3">
                {dataHienThi.map((item, idx) => (
                    <Paper
                        key={item._id}
                        elevation={0}
                        sx={{
                            p: 2,
                            borderRadius: '14px',
                            border: '1px solid #bae6fd',
                            bgcolor: idx % 2 === 0 ? '#ffffff' : '#f0f9ff',
                            transition: 'box-shadow 0.15s',
                            '&:hover': { boxShadow: '0 2px 12px 0 rgba(2,132,199,0.10)' },
                        }}
                    >
                        <Box className="flex justify-between items-start mb-2">
                            <Typography sx={{ color: '#7dd3fc', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                                {new Date(new Date(item.ngayTao).getTime() + 7 * 60 * 60 * 1000)
                                    .toLocaleDateString('vi-VN')}
                            </Typography>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0c4a6e' }}>
                                {item.loaiChiPhi}
                            </Typography>
                        </Box>

                        <Box className="flex items-center gap-1.5 mb-1">
                            <Typography sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.92rem', lineHeight: 1.4 }}>
                                {item.tenChiPhi}
                            </Typography>
                            {item.isAuto && (
                                <Tooltip title="Chi phí tự động đồng bộ" arrow>
                                    <StarIcon sx={{ fontSize: 14, color: '#f59e0b' }} />
                                </Tooltip>
                            )}
                        </Box>

                        <Typography sx={{ color: '#0369a1', fontSize: '0.78rem', mb: 2.5, fontStyle: item.ghiChu ? 'normal' : 'italic' }}>
                            {item.ghiChu || 'Không có ghi chú'}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e0f2fe', pt: 1.5 }}>
                            <Typography sx={{ fontWeight: 800, color: '#0369a1', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                                {formatVND(item.gia)}
                            </Typography>
                            <Stack direction="row" spacing={0.75}>
                                <IconButton
                                    size="small"
                                    onClick={() => onPrint(item)}
                                    sx={{ color: '#0284c7', bgcolor: '#e0f2fe', borderRadius: '8px', '&:hover': { bgcolor: '#bae6fd' } }}
                                >
                                    <PrintIcon fontSize="small" />
                                </IconButton>
                                {!item.isAuto && (
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(item._id)}
                                        sx={{ color: '#ef4444', bgcolor: '#fef2f2', borderRadius: '8px', '&:hover': { bgcolor: '#fee2e2' } }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                )}
                            </Stack>
                        </Box>
                    </Paper>
                ))}

                {/* Footer mobile */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '2px solid #7dd3fc',
                        background: 'linear-gradient(135deg, #075985 0%, #0369a1 100%)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Typography sx={{ fontWeight: 700, color: '#bae6fd', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Tổng cộng
                    </Typography>
                    <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.2rem', fontVariantNumeric: 'tabular-nums' }}>
                        {formatVND(tongChiPhi)}
                    </Typography>
                </Paper>
            </Box>
        );
    };

    // ── Desktop table ──────────────────────────────────────────
    return (
        <Box>
            <Box className="block md:hidden">
                {renderMobileCards()}
            </Box>

            <Paper
                elevation={0}
                className="hidden md:block"
                sx={{ borderRadius: '16px', border: '1px solid #bae6fd', overflow: 'hidden' }}
            >
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: '#e0f2fe',
                                    borderBottom: '2px solid #7dd3fc',
                                }}
                            >
                                {[
                                    { label: 'Ngày', w: 100 },
                                    { label: 'Tên chi phí', w: 'auto' },
                                    { label: 'Phân loại', w: 130 },
                                    { label: 'Số tiền (₫)', w: 140 },
                                    { label: 'Ghi chú', w: 'auto' },
                                    { label: '', w: 80 },
                                ].map(({ label, w }) => (
                                    <TableCell
                                        key={label}
                                        sx={{ ...THEAD_SX, width: w !== 'auto' ? w : undefined }}
                                    >
                                        {label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading && !coDuLieu ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7, bgcolor: '#f0f9ff' }}>
                                        <CircularProgress size={24} sx={{ color: '#7dd3fc' }} />
                                    </TableCell>
                                </TableRow>
                            ) : coDuLieu ? (
                                dataHienThi.map((item, idx) => (
                                    <TableRow
                                        key={item._id}
                                        sx={{
                                            bgcolor: idx % 2 === 0 ? '#ffffff' : '#e0f2fe',
                                            '&:hover': {
                                                bgcolor: '#bae6fd',
                                            },
                                            transition: 'background 0.12s',
                                            '& td': { borderBottom: '1px solid #e0f2fe' },
                                        }}
                                    >
                                        {/* Ngày */}
                                        <TableCell sx={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', py: 1.25 }}>
                                            {new Date(new Date(item.ngayTao).getTime() + 7 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                                        </TableCell>

                                        {/* Tên chi phí */}
                                        <TableCell sx={{ py: 1.25 }}>
                                            <Box className="flex items-center gap-2">
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.88rem' }}>
                                                    {item.tenChiPhi}
                                                </Typography>
                                                {item.isAuto && (
                                                    <Chip
                                                        icon={<StarIcon sx={{ fontSize: '11px !important', color: '#f59e0b !important' }} />}
                                                        label="Tự động"
                                                        size="small"
                                                        sx={{
                                                            height: 19,
                                                            fontSize: '0.66rem',
                                                            fontWeight: 700,
                                                            bgcolor: '#fef3c7',
                                                            color: '#92400e',
                                                            '& .MuiChip-icon': { ml: '5px' },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>

                                        {/* Loại */}
                                        <TableCell sx={{ py: 1.25 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontSize: '0.84rem',
                                                    fontWeight: 600,
                                                    color: '#0c4a6e',
                                                }}
                                            >
                                                {item.loaiChiPhi}
                                            </Typography>
                                        </TableCell>

                                        {/* Số tiền */}
                                        <TableCell sx={{ py: 1.25 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: item.isAuto ? 800 : 700,
                                                    color: '#0369a1',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    fontSize: '0.92rem',
                                                    letterSpacing: '-0.01em',
                                                }}
                                            >
                                                {formatVND(item.gia)}
                                            </Typography>
                                        </TableCell>

                                        {/* Ghi chú */}
                                        <TableCell sx={{ color: '#0369a1', fontSize: '0.82rem', py: 1.25, fontStyle: item.ghiChu ? 'normal' : 'italic' }}>
                                            {item.ghiChu || '—'}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell align="right" sx={{ pr: 1.5, py: 1.25 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                <Tooltip title="In phiếu" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onPrint(item)}
                                                        sx={{
                                                            color: '#0284c7',
                                                            borderRadius: '6px',
                                                            '&:hover': { bgcolor: '#e0f2fe' },
                                                        }}
                                                    >
                                                        <PrintIcon sx={{ fontSize: 17 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {!item.isAuto && (
                                                    <Tooltip title="Xóa" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => onDelete(item._id)}
                                                            sx={{
                                                                color: '#ef4444',
                                                                borderRadius: '6px',
                                                                '&:hover': { bgcolor: '#fef2f2' },
                                                            }}
                                                        >
                                                            <DeleteIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 7, bgcolor: '#f0f9ff' }}>
                                        <Box className="flex flex-col items-center gap-2">
                                            <MoneyIcon sx={{ fontSize: 36, color: '#bae6fd' }} />
                                            <Typography variant="body2" sx={{ color: '#7dd3fc' }}>
                                                Không có chi phí nào trong tháng này
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {coDuLieu && (
                            <TableFooter>
                                <TableRow
                                    sx={{
                                        background: '#5ab5e6',
                                    }}
                                >
                                    <TableCell
                                        colSpan={3}
                                        sx={{
                                            fontWeight: 700,
                                            color: '#ffffff',
                                            borderTop: 'none',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            py: 1.75,
                                        }}
                                    >
                                        Tổng cộng
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontWeight: 800,
                                            color: '#ffffff',
                                            borderTop: 'none',
                                            fontSize: '1.05rem',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {formatVND(tongChiPhi)}
                                    </TableCell>
                                    <TableCell colSpan={2} sx={{ borderTop: 'none' }} />
                                </TableRow>
                            </TableFooter>
                        )}
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default ChiPhiTable;