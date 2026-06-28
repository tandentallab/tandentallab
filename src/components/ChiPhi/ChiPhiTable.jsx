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
import { formatVND, loaiChiPhiColor } from './chiPhiUtils';

const ChiPhiTable = ({ danhSachChiPhi, isLoading, onPrint, onDelete }) => {
    const coDuLieu = danhSachChiPhi.length > 0;
    const tongChiPhi = danhSachChiPhi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    return (
        <Paper elevation={0} className="rounded-xl border border-slate-200 overflow-hidden">

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                            {['Ngày', 'Tên chi phí', 'Loại', 'Số tiền (₫)', 'Ghi chú', ''].map((h) => (
                                <TableCell
                                    key={h}
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.03em',
                                        borderBottom: '1px solid #e2e8f0',
                                        py: 1.5,
                                    }}
                                >
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {isLoading && !coDuLieu ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} sx={{ color: '#94a3b8' }} />
                                </TableCell>
                            </TableRow>
                        ) : coDuLieu ? (
                            danhSachChiPhi.map((item) => (
                                <TableRow
                                    key={item._id}
                                    sx={{
                                        bgcolor: item.isAuto ? '#fffbeb' : 'white',
                                        '&:hover': { bgcolor: item.isAuto ? '#fef9e0' : '#f8fafc' },
                                        transition: 'background 0.15s',
                                        '& td': { borderBottom: '1px solid #f1f5f9' },
                                    }}
                                >
                                    <TableCell sx={{ color: '#64748b', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                        {new Date(new Date(item.ngayTao).getTime() + 7 * 60 * 60 * 1000)
                                            .toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell>
                                        <Box className="flex items-center gap-2">
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1e293b' }}>
                                                {item.tenChiPhi}
                                            </Typography>
                                            {item.isAuto && (
                                                <Chip
                                                    icon={<StarIcon sx={{ fontSize: '12px !important' }} />}
                                                    label="Tự động"
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.68rem',
                                                        bgcolor: '#fde68a',
                                                        color: '#92400e',
                                                        '& .MuiChip-icon': { color: '#b45309' },
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.loaiChiPhi}
                                            size="small"
                                            sx={{
                                                fontSize: '0.72rem',
                                                height: 22,
                                                bgcolor: loaiChiPhiColor(item.loaiChiPhi).bg,
                                                color: loaiChiPhiColor(item.loaiChiPhi).text,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: item.isAuto ? 700 : 500,
                                                color: '#dc2626',
                                                fontVariantNumeric: 'tabular-nums',
                                            }}
                                        >
                                            {formatVND(item.gia)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                        {item.ghiChu || '—'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 2 }}>
                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                            <Tooltip title="In phiếu" arrow>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onPrint(item)}
                                                    sx={{
                                                        color: '#3b82f6',
                                                        '&:hover': { bgcolor: '#eff6ff' },
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    <PrintIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {!item.isAuto && (
                                                <Tooltip title="Xóa" arrow>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(item._id)}
                                                        sx={{
                                                            color: '#ef4444',
                                                            '&:hover': { bgcolor: '#fef2f2' },
                                                            borderRadius: '6px',
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Box className="flex flex-col items-center gap-2 text-slate-400">
                                        <MoneyIcon sx={{ fontSize: 36, color: '#e2e8f0' }} />
                                        <Typography variant="body2">Không có chi phí nào trong tháng này</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>

                    {coDuLieu && (
                        <TableFooter>
                            <TableRow sx={{ bgcolor: '#fef2f2' }}>
                                <TableCell
                                    colSpan={3}
                                    sx={{ fontWeight: 700, color: '#b91c1c', borderTop: '2px solid #fecaca' }}
                                >
                                    Tổng cộng
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: '#b91c1c',
                                        borderTop: '2px solid #fecaca',
                                    }}
                                >
                                    {formatVND(tongChiPhi)}
                                </TableCell>
                                <TableCell colSpan={2} sx={{ borderTop: '2px solid #fecaca' }} />
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default ChiPhiTable;