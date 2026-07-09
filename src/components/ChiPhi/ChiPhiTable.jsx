import React, { useState, useMemo } from 'react';
import {
    Box, IconButton, Stack, TableRow, TableCell, Tooltip, Typography,
    CircularProgress, Popover, FormGroup, FormControlLabel, Checkbox, Badge, Divider, Button
} from '@mui/material';
import { Delete as DeleteIcon, Print as PrintIcon, Money as MoneyIcon, Edit as EditIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { formatVND } from '../../utils/chiPhiUtils';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import BaseTable from './common/BaseTable';

const ChiPhiTable = ({ danhSachChiPhi, isLoading, onPrintTable, onEdit, onDelete, isViewOnly = false }) => {
    const user = useSelector((state) => state.auth?.user);
    const isDieuPhoi = user?.quyenSuDung?.ten === "Điều phối";

    // 1. Tách State cho bộ lọc
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [appliedSelectedLoai, setAppliedSelectedLoai] = useState([]); // State quyết định render bảng
    const [tempSelectedLoai, setTempSelectedLoai] = useState([]);       // State tạm thời trong Popover

    // 2. State cho Lazy Loading
    const [visibleCount, setVisibleCount] = useState(20); // Render ban đầu 20 dòng

    const dataTheoQuyen = isDieuPhoi ? danhSachChiPhi.filter((item) => item._id !== "auto_luong_nhan_vien") : danhSachChiPhi;
    const dsLoaiUnique = useMemo(() => Array.from(new Set(dataTheoQuyen.map((i) => i.loaiChiPhi).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi')), [dataTheoQuyen]);

    // Dùng appliedSelectedLoai để lọc data hiển thị
    const dataHienThi = appliedSelectedLoai.length > 0
        ? dataTheoQuyen.filter((item) => appliedSelectedLoai.includes(item.loaiChiPhi))
        : dataTheoQuyen;

    const coDuLieu = dataHienThi.length > 0;
    const tongChiPhi = dataHienThi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    // --- CÁC HÀM XỬ LÝ LỌC ---
    const handleOpenFilter = (e) => {
        setTempSelectedLoai(appliedSelectedLoai); // Mở lên thì copy trạng thái đã áp dụng vào state tạm
        setFilterAnchorEl(e.currentTarget);
    };

    const handleCloseFilter = () => setFilterAnchorEl(null);

    const handleToggleTempLoai = (loai) => {
        setTempSelectedLoai((prev) => prev.includes(loai) ? prev.filter((l) => l !== loai) : [...prev, loai]);
    };

    const handleApplyFilter = () => {
        setAppliedSelectedLoai(tempSelectedLoai); // Click OK mới đưa vào state chính
        setVisibleCount(20); // Reset lại số dòng hiển thị khi lọc mới
        handleCloseFilter();
    };

    const handleClearFilter = () => {
        setTempSelectedLoai([]);
        setAppliedSelectedLoai([]);
        setVisibleCount(20);
        handleCloseFilter();
    };

    // --- HÀM XỬ LÝ SCROLL (LAZY LOAD) ---
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        // Kiểm tra nếu cuộn cách đáy khoảng 10px thì load thêm
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            if (visibleCount < dataHienThi.length) {
                setVisibleCount(prev => prev + 20);
            }
        }
    };

    const columns = [
        { label: 'Ngày', width: 100 },
        { label: 'Tên chi phí', width: 'auto' },
        {
            width: 150, sx: { whiteSpace: 'nowrap' },
            label: (
                <Box className="flex items-center gap-1" onClick={handleOpenFilter} sx={{ cursor: 'pointer', width: 'fit-content' }}>
                    Phân loại
                    <Tooltip title="Lọc theo phân loại" arrow>
                        <IconButton size="small" sx={{ p: 0.4, color: appliedSelectedLoai.length > 0 ? '#0284c7' : '#0369a1' }}>
                            <Badge badgeContent={appliedSelectedLoai.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}>
                                <FilterListIcon sx={{ fontSize: 16 }} />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        },
        { label: 'Số tiền', width: 140 },
        { label: 'Ghi chú', width: 'auto' },
        {
            width: 90, align: 'right',
            label: coDuLieu && (
                <Tooltip title="In bảng này" arrow>
                    <IconButton size="small" onClick={() => onPrintTable(dataHienThi)} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '10px', '&:hover': { bgcolor: '#7dd3fc' } }}>
                        <PrintIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            )
        }
    ];

    const topBar = (
        <>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                <Box onClick={handleOpenFilter} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#0284c7', bgcolor: '#e0f2fe', px: 2, py: 1, borderRadius: '8px', fontWeight: 600 }}>
                    <Badge badgeContent={appliedSelectedLoai.length} color="primary">
                        <FilterListIcon sx={{ fontSize: 18 }} />
                    </Badge>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PHÂN LOẠI</Typography>
                </Box>
            </Box>

            <Popover open={Boolean(filterAnchorEl)} anchorEl={filterAnchorEl} onClose={handleCloseFilter} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Box sx={{ p: 2, minWidth: 220 }}>
                    <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                        {dsLoaiUnique.length > 0 ? (
                            <FormGroup>
                                {dsLoaiUnique.map((loai) => (
                                    <FormControlLabel
                                        key={loai}
                                        control={<Checkbox size="small" checked={tempSelectedLoai.includes(loai)} onChange={() => handleToggleTempLoai(loai)} />}
                                        label={<Typography variant="body2">{loai}</Typography>}
                                    />
                                ))}
                            </FormGroup>
                        ) : <Typography variant="body2">Không có phân loại nào</Typography>}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />
                    <Box className="flex justify-between items-center">
                        <Button size="small" color="inherit" onClick={handleClearFilter} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>Bỏ chọn</Button>
                        <Button size="small" variant="contained" onClick={handleApplyFilter} sx={{ textTransform: 'none', borderRadius: '8px', px: 2 }}>Áp dụng</Button>
                    </Box>
                </Box>
            </Popover>
        </>
    );

    return (
        <BaseTable
            columns={columns}
            tongTien={coDuLieu ? tongChiPhi : undefined}
            topBar={topBar}
            onScroll={handleScroll}
        >
            {isLoading && !coDuLieu ? (
                <TableRow className="empty-row">
                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                        <CircularProgress size={24} />
                    </TableCell>
                </TableRow>
            ) : coDuLieu ? (
                // Lấy data đã lọc cắt ra theo số lượng visibleCount để Lazy Load
                dataHienThi.slice(0, visibleCount).map((item, idx) => (
                    <TableRow
                        key={item._id}
                        sx={{
                            bgcolor: idx % 2 === 0 ? '#ffffff' : '#f0f7fc',
                            '&:hover': { bgcolor: '#dceef7' },
                            transition: 'background 0.12s',
                            '& td': { borderBottom: '1px solid #e0f2fe' }
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
                            <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>
                                {item.loaiChiPhi}
                            </Typography>
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
                                    <Tooltip>
                                        <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#f59e0b', borderRadius: '6px', '&:hover': { bgcolor: '#fef3c7' } }}>
                                            <EditIcon sx={{ fontSize: 17 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip>
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
                    <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                        <Box className="flex flex-col items-center gap-2">
                            <MoneyIcon sx={{ fontSize: 36, color: '#bae6fd' }} />
                            <Typography variant="body2" sx={{ color: '#7dd3fc' }}>
                                Không có dữ liệu
                            </Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            )}
        </BaseTable>
    );
};

export default ChiPhiTable;