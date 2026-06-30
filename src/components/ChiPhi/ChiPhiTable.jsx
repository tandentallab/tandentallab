import React, { useState, useMemo } from 'react';
import {
    Box, IconButton, Paper, Stack, Table, TableBody,
    TableCell, TableContainer, TableFooter, TableHead, TableRow,
    Tooltip, Typography, CircularProgress, Popover, FormGroup,
    FormControlLabel, Checkbox, Badge, Divider,
} from '@mui/material';
import {
    Delete as DeleteIcon, Print as PrintIcon,
    Money as MoneyIcon, Edit as EditIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { formatVND } from './chiPhiUtils';
import { useSelector } from 'react-redux';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const THEAD_SX = {
    fontWeight: 700, fontSize: '0.86rem', color: '#0c4a6e',
    textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.25, borderBottom: 'none',
};

const tableCardSx = {
    '& .MuiTable-root': { borderCollapse: 'collapse' },
    '& .MuiTableHead-root': { display: { xs: 'none', md: 'table-header-group' } },
    '& .MuiTableBody-root .MuiTableRow-root': {
        display: { xs: 'block', md: 'table-row' },
        mb: { xs: 2, md: 0 },
        boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.08)', md: 'none' },
        borderRadius: { xs: '12px', md: 0 },
        border: { xs: '1px solid #bae6fd', md: 'none' },
        overflow: 'hidden'
    },
    '& .MuiTableBody-root .MuiTableCell-root': {
        display: { xs: 'flex', md: 'table-cell' },
        justifyContent: { xs: 'space-between', md: 'flex-start' },
        alignItems: 'center',
        textAlign: { xs: 'right', md: 'left' },
        py: { xs: 0.75, md: 0.75 },
        px: { xs: 2, md: 2 },
        '&::before': {
            content: 'attr(data-label)',
            fontWeight: 600,
            color: '#64748b',
            display: { xs: 'block', md: 'none' },
            marginRight: '16px',
            textAlign: 'left'
        }
    },
    '& .MuiTableFooter-root .MuiTableRow-root': {
        display: { xs: 'flex', md: 'table-row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        px: { xs: 2, md: 0 },
        py: { xs: 1.25, md: 0 },
        bgcolor: '#5ab5e6',
        borderRadius: { xs: '12px', md: 0 },
        mt: { xs: 2, md: 0 }
    },
    '& .MuiTableFooter-root .MuiTableCell-root': {
        display: { xs: 'block', md: 'table-cell' },
        border: 'none',
        p: { xs: 0, md: 1.25 },
        color: '#fff',
        '&::before': { display: 'none' }
    },
    '& .hide-on-mobile': { display: { xs: 'none', md: 'table-cell' } },
    '& .empty-row .MuiTableCell-root': {
        justifyContent: 'center',
        '&::before': { display: 'none' }
    }
};

const ChiPhiTable = ({ danhSachChiPhi, isLoading, onPrintTable, onEdit, onDelete, isViewOnly = false }) => {
    const user = useSelector((state) => state.auth?.user);
    const isDieuPhoi = user?.quyenSuDung?.ten === "Điều phối";

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [selectedLoai, setSelectedLoai] = useState([]);

    const dataTheoQuyen = isDieuPhoi
        ? danhSachChiPhi.filter((item) => item._id !== "auto_luong_nhan_vien")
        : danhSachChiPhi;

    const dsLoaiUnique = useMemo(() => {
        const set = new Set(dataTheoQuyen.map((i) => i.loaiChiPhi).filter(Boolean));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi'));
    }, [dataTheoQuyen]);

    const dataHienThi = selectedLoai.length > 0
        ? dataTheoQuyen.filter((item) => selectedLoai.includes(item.loaiChiPhi))
        : dataTheoQuyen;

    const handleOpenFilter = (e) => setFilterAnchorEl(e.currentTarget);
    const handleCloseFilter = () => setFilterAnchorEl(null);
    const handleToggleLoai = (loai) => {
        setSelectedLoai((prev) =>
            prev.includes(loai) ? prev.filter((l) => l !== loai) : [...prev, loai]
        );
    };
    const handleClearFilter = () => setSelectedLoai([]);

    const coDuLieu = dataHienThi.length > 0;
    const tongChiPhi = dataHienThi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    return (
        <Box>
            <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: { xs: 'none', md: '1px solid #bae6fd' }, bgcolor: { xs: 'transparent', md: '#fff' } }}>

                {/* THANH CÔNG CỤ TRÊN MOBILE (Ẩn trên Desktop) */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                    <Box onClick={(e) => setFilterAnchorEl(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#0284c7', bgcolor: '#e0f2fe', px: 2, py: 1, borderRadius: '8px', fontWeight: 600 }}>
                        <Badge badgeContent={selectedLoai.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}>
                            <FilterListIcon sx={{ fontSize: 18 }} />
                        </Badge>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PHÂN LOẠI</Typography>
                    </Box>
                    {coDuLieu && (
                        <IconButton size="small" onClick={() => onPrintTable(dataHienThi)} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '8px', px: 1.5, py: 1, '&:hover': { bgcolor: '#7dd3fc' } }}>
                            <PrintIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    )}
                </Box>

                {/* POPOVER LỌC PHÂN LOẠI (Dùng chung cho cả Mobile và PC) */}
                <Popover
                    open={Boolean(filterAnchorEl)}
                    anchorEl={filterAnchorEl}
                    onClose={handleCloseFilter}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <Box sx={{ p: 1.5, minWidth: 200 }}>
                        <Box className="flex items-center justify-between" sx={{ mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'none' }}>
                                Lọc phân loại
                            </Typography>
                            {selectedLoai.length > 0 && (
                                <Typography
                                    variant="caption"
                                    onClick={handleClearFilter}
                                    sx={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600, textTransform: 'none', '&:hover': { textDecoration: 'underline' } }}
                                >
                                    Bỏ chọn
                                </Typography>
                            )}
                        </Box>
                        <Divider sx={{ mb: 0.5 }} />
                        {dsLoaiUnique.length > 0 ? (
                            <FormGroup>
                                {dsLoaiUnique.map((loai) => (
                                    <FormControlLabel
                                        key={loai}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={selectedLoai.includes(loai)}
                                                onChange={() => handleToggleLoai(loai)}
                                            />
                                        }
                                        label={<Typography variant="body2" sx={{ fontSize: '0.82rem', textTransform: 'none', fontWeight: 500 }}>{loai}</Typography>}
                                    />
                                ))}
                            </FormGroup>
                        ) : (
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'none', py: 1 }}>
                                Không có phân loại nào
                            </Typography>
                        )}
                    </Box>
                </Popover>

                <TableContainer sx={tableCardSx}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#e0f2fe', borderBottom: '1px solid #7dd3fc' }}>
                                {[
                                    { label: 'Ngày', w: 100 },
                                    { label: 'Tên chi phí', w: 'auto' },
                                ].map(({ label, w }) => (
                                    <TableCell key={label} sx={{ ...THEAD_SX, width: w !== 'auto' ? w : undefined }}>
                                        {label}
                                    </TableCell>
                                ))}

                                <TableCell sx={{ ...THEAD_SX, width: 150, whiteSpace: 'nowrap' }}>
                                    <Box
                                        className="flex items-center gap-1"
                                        onClick={handleOpenFilter}
                                        sx={{ whiteSpace: 'nowrap', cursor: 'pointer', width: 'fit-content' }}
                                    >
                                        Phân loại
                                        <Tooltip title="Lọc theo phân loại" arrow>
                                            <IconButton size="small" sx={{ p: 0.4, color: selectedLoai.length > 0 ? '#0284c7' : '#0369a1' }}>
                                                <Badge badgeContent={selectedLoai.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}>
                                                    <FilterListIcon sx={{ fontSize: 16 }} />
                                                </Badge>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                {[
                                    { label: 'Số tiền', w: 140 },
                                    { label: 'Ghi chú', w: 'auto' }
                                ].map(({ label, w }) => (
                                    <TableCell key={label} sx={{ ...THEAD_SX, width: w !== 'auto' ? w : undefined }}>
                                        {label}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ ...THEAD_SX, width: 90 }}>
                                    {coDuLieu && (
                                        <Tooltip title="In bảng này" arrow>
                                            <IconButton
                                                size="small"
                                                onClick={() => onPrintTable(dataHienThi)}
                                                sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '10px', '&:hover': { bgcolor: '#7dd3fc' } }}
                                            >
                                                <PrintIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {isLoading && !coDuLieu ? (
                                <TableRow className="empty-row">
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
                                            '&:hover': { bgcolor: '#bae6fd' },
                                            transition: 'background 0.12s',
                                            '& td': { borderBottom: '1px solid #e0f2fe' },
                                        }}
                                    >
                                        <TableCell data-label="Ngày" sx={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', py: 0.75 }}>
                                            {dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
                                        </TableCell>

                                        <TableCell data-label="Tên chi phí" sx={{ py: 0.75 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.88rem' }}>
                                                {item.tenChiPhi}
                                            </Typography>
                                        </TableCell>

                                        <TableCell data-label="Phân loại" sx={{ py: 0.75 }}>
                                            <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>{item.loaiChiPhi}</Typography>
                                        </TableCell>

                                        <TableCell data-label="Số tiền" sx={{ py: 0.75 }}>
                                            <Typography variant="body2" sx={{ fontWeight: item.isAuto ? 800 : 700, color: '#0369a1', fontVariantNumeric: 'tabular-nums', fontSize: '0.92rem' }}>
                                                {formatVND(item.gia)}
                                            </Typography>
                                        </TableCell>

                                        <TableCell data-label="Ghi chú" sx={{ color: '#0369a1', fontSize: '0.82rem', py: 0.75, fontStyle: item.ghiChu ? 'normal' : 'italic' }}>
                                            {item.ghiChu || ''}
                                        </TableCell>

                                        <TableCell
                                            data-label="Thao tác"
                                            align="right"
                                            sx={{
                                                pr: 1.5,
                                                py: 0.75,
                                                display: (!item.isAuto && !isViewOnly) ? { xs: 'flex', md: 'table-cell' } : { xs: 'none', md: 'table-cell' }
                                            }}
                                        >
                                            {!item.isAuto && !isViewOnly && (
                                                <Stack direction="row" spacing={0.5} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                                    <Tooltip title="Chỉnh sửa" arrow>
                                                        <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#f59e0b', borderRadius: '6px', '&:hover': { bgcolor: '#fef3c7' } }}>
                                                            <EditIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa" arrow>
                                                        <IconButton size="small" onClick={() => onDelete(item._id)} sx={{ color: '#ef4444', borderRadius: '6px', '&:hover': { bgcolor: '#fef2f2' } }}>
                                                            <DeleteIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="empty-row">
                                    <TableCell colSpan={6} align="center" sx={{ py: 7, bgcolor: '#f0f9ff' }}>
                                        <Box className="flex flex-col items-center gap-2">
                                            <MoneyIcon sx={{ fontSize: 36, color: '#bae6fd' }} />
                                            <Typography variant="body2" sx={{ color: '#7dd3fc' }}>
                                                {selectedLoai.length > 0
                                                    ? 'Không có chi phí phù hợp với bộ lọc'
                                                    : 'Không có chi phí nào trong tháng này'}
                                            </Typography>
                                            {selectedLoai.length > 0 && (
                                                <Typography
                                                    variant="caption"
                                                    onClick={handleClearFilter}
                                                    sx={{ color: '#0284c7', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                                                >
                                                    Xóa bộ lọc
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {coDuLieu && (
                            <TableFooter>
                                <TableRow sx={{ background: '#5ab5e6' }}>
                                    <TableCell colSpan={3} sx={{ fontWeight: 700, color: '#ffffff', borderTop: 'none', fontSize: '0.8rem', textTransform: 'uppercase', py: 1.25 }}>Tổng cộng</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#ffffff', borderTop: 'none', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
                                        {formatVND(tongChiPhi)}
                                    </TableCell>
                                    <TableCell colSpan={2} className="hide-on-mobile" sx={{ borderTop: 'none' }} />
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