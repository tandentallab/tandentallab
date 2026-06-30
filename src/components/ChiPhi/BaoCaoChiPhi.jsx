import React, { useState } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow,
    Typography, Dialog, DialogTitle, DialogContent, IconButton, Tooltip,
    Popover, FormGroup, FormControlLabel, Checkbox, Badge, Divider
} from '@mui/material';
import {
    Close as CloseIcon, Visibility as VisibilityIcon,
    Print as PrintIcon, FilterList as FilterListIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import ChiPhiTable from './ChiPhiTable';
import PrintPreviewModal from './PrintPreviewModal';
import { formatVND } from './chiPhiUtils';

const THEAD_SX = {
    fontWeight: 700, fontSize: '0.86rem', color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.25, borderBottom: 'none'
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

const BaoCaoChiPhi = ({ danhSachChiPhi, filter, isLoading, onDelete }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedLuong, setSelectedLuong] = useState(null);
    const [printData, setPrintData] = useState(null);

    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [selectedLoai, setSelectedLoai] = useState([]);

    const filteredByDate = danhSachChiPhi.filter(item => {
        if (item.isAuto) return true;
        if (filter.ngay && filter.ngay > 0) {
            const ngayTao = dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').date();
            return ngayTao === filter.ngay;
        }
        return true;
    });

    const dsLoaiUnique = Array.from(new Set(filteredByDate.map(i => i.loaiChiPhi).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));

    const filteredData = selectedLoai.length > 0
        ? filteredByDate.filter(item => selectedLoai.includes(item.loaiChiPhi))
        : filteredByDate;

    const autoItems = filteredData.filter(item => item.isAuto);
    const manualItems = filteredData.filter(item => !item.isAuto);

    const groupedData = manualItems.reduce((acc, item) => {
        const dateStr = dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        if (!acc[dateStr]) {
            acc[dateStr] = { isGroup: true, dateStr, ngayTao: item.ngayTao, tongTien: 0, items: [] };
        }
        acc[dateStr].tongTien += item.gia || 0;
        acc[dateStr].items.push(item);
        return acc;
    }, {});

    const groupedArray = Object.values(groupedData).sort((a, b) => dayjs(b.ngayTao).valueOf() - dayjs(a.ngayTao).valueOf());
    const tableData = [...autoItems, ...groupedArray];
    const tongChiPhi = filteredData.reduce((sum, item) => sum + (item.gia ?? 0), 0);

    const handlePrintTongQuat = () => {
        const isThang = filter.ngay === 0;
        const type = isThang ? 'month' : 'day';

        const pad = (num) => String(num).padStart(2, '0');
        const subtitle = isThang
            ? `Phiếu chi phí tháng ${pad(filter.thang)}/${filter.nam}`
            : `Phiếu chi phí ngày ${pad(filter.ngay)}/${pad(filter.thang)}/${filter.nam}`;

        let mappedItems = tableData.map(item => {
            if (item.isGroup) {
                return {
                    tenChiPhi: `Chi phí ngày ${item.dateStr}`,
                    loaiChiPhi: 'Tổng hợp',
                    gia: item.tongTien,
                    ngay: item.ngayTao,
                    ghiChu: `Bao gồm ${item.items.length} giao dịch`
                };
            } else {
                return { ...item, ngay: item.ngayTao };
            }
        });

        if (isThang) {
            mappedItems.sort((a, b) => dayjs(a.ngay).valueOf() - dayjs(b.ngay).valueOf());
        }

        setPrintData({ items: mappedItems, subtitle, type });
    };

    return (
        <Box className="space-y-5">
            <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden', border: { xs: 'none', md: '1px solid #bae6fd' }, bgcolor: { xs: 'transparent', md: '#fff' } }}>

                {/* THANH CÔNG CỤ TRÊN MOBILE (Ẩn trên Desktop) */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 0.5 }}>
                    <Box onClick={(e) => setFilterAnchorEl(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', color: '#0284c7', bgcolor: '#e0f2fe', px: 2, py: 1, borderRadius: '8px', fontWeight: 600 }}>
                        <Badge badgeContent={selectedLoai.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}>
                            <FilterListIcon sx={{ fontSize: 18 }} />
                        </Badge>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PHÂN LOẠI</Typography>
                    </Box>
                    {tableData.length > 0 && (
                        <IconButton size="small" onClick={handlePrintTongQuat} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '8px', px: 1.5, py: 1, '&:hover': { bgcolor: '#7dd3fc' } }}>
                            <PrintIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    )}
                </Box>

                {/* POPOVER LỌC PHÂN LOẠI (Dùng chung cho cả Mobile và PC) */}
                <Popover
                    open={Boolean(filterAnchorEl)}
                    anchorEl={filterAnchorEl}
                    onClose={() => setFilterAnchorEl(null)}
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
                                    onClick={() => setSelectedLoai([])}
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
                                                onChange={() => setSelectedLoai(prev => prev.includes(loai) ? prev.filter(l => l !== loai) : [...prev, loai])}
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
                                <TableCell sx={{ ...THEAD_SX, width: 100 }}>Ngày</TableCell>
                                <TableCell sx={{ ...THEAD_SX, width: 'auto' }}>Tên chi phí</TableCell>
                                <TableCell sx={{ ...THEAD_SX, width: 130, whiteSpace: 'nowrap' }}>
                                    <Box className="flex items-center gap-1" onClick={(e) => setFilterAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', width: 'fit-content' }}>
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
                                <TableCell sx={{ ...THEAD_SX, width: 140 }}>Số tiền</TableCell>
                                <TableCell sx={{ ...THEAD_SX, width: 'auto' }}>Ghi chú</TableCell>
                                <TableCell align="right" sx={{ ...THEAD_SX, width: 80, pr: 1.5 }}>
                                    {tableData.length > 0 && (
                                        <Tooltip title="In bảng này" arrow>
                                            <IconButton size="small" onClick={handlePrintTongQuat} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '10px', '&:hover': { bgcolor: '#7dd3fc' } }}>
                                                <PrintIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {tableData.map((row, idx) => {
                                if (row.isAuto) {
                                    const isLuong = row._id === "auto_luong_nhan_vien";
                                    return (
                                        <TableRow
                                            key={row._id}
                                            onClick={() => isLuong && setSelectedLuong(row)}
                                            sx={{
                                                bgcolor: idx % 2 === 0 ? '#ffffff' : '#e0f2fe',
                                                cursor: isLuong ? 'pointer' : 'default',
                                                '&:hover': isLuong ? { bgcolor: '#bae6fd' } : {},
                                                '& td': { borderBottom: '1px solid #e0f2fe' }
                                            }}
                                        >
                                            <TableCell data-label="Ngày" sx={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', py: 0.75 }}>
                                                {dayjs(row.ngayTao).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
                                            </TableCell>
                                            <TableCell data-label="Tên chi phí" sx={{ py: 0.75 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.88rem' }}>{row.tenChiPhi}</Typography>
                                            </TableCell>
                                            <TableCell data-label="Phân loại" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>{row.loaiChiPhi}</Typography></TableCell>
                                            <TableCell data-label="Số tiền" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontWeight: 800, color: '#0369a1', fontVariantNumeric: 'tabular-nums', fontSize: '0.92rem' }}>{formatVND(row.gia)}</Typography></TableCell>
                                            <TableCell data-label="Ghi chú" sx={{ color: '#0369a1', fontSize: '0.82rem', py: 0.75 }}>{row.ghiChu || ''}</TableCell>
                                            <TableCell data-label="Thao tác" align="right" sx={{ pr: 1.5, py: 0.75, display: isLuong ? { xs: 'flex', md: 'table-cell' } : { xs: 'none', md: 'table-cell' } }}>
                                                {isLuong && (
                                                    <Tooltip title="Xem chi tiết lương" arrow>
                                                        <IconButton size="small" sx={{ color: '#0284c7', borderRadius: '6px', '&:hover': { bgcolor: '#e0f2fe' } }}>
                                                            <VisibilityIcon sx={{ fontSize: 17 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                return (
                                    <TableRow
                                        key={row.dateStr}
                                        onClick={() => setSelectedGroup(row)}
                                        sx={{ bgcolor: idx % 2 === 0 ? '#ffffff' : '#e0f2fe', cursor: 'pointer', '&:hover': { bgcolor: '#bae6fd' }, '& td': { borderBottom: '1px solid #e0f2fe' } }}
                                    >
                                        <TableCell data-label="Ngày" sx={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 500, py: 0.75 }}>{row.dateStr}</TableCell>
                                        <TableCell data-label="Tên chi phí" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.88rem' }}>Chi phí ngày {row.dateStr}</Typography></TableCell>
                                        <TableCell data-label="Phân loại" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>Tổng hợp</Typography></TableCell>
                                        <TableCell data-label="Số tiền" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', fontVariantNumeric: 'tabular-nums', fontSize: '0.92rem' }}>{formatVND(row.tongTien)}</Typography></TableCell>
                                        <TableCell data-label="Ghi chú" sx={{ color: '#0369a1', fontSize: '0.82rem', py: 0.75 }}>Gồm {row.items.length} dòng</TableCell>
                                        <TableCell data-label="Thao tác" align="right" sx={{ pr: 1.5, py: 0.75 }}>
                                            <Tooltip title="Xem chi tiết" arrow>
                                                <IconButton size="small" sx={{ color: '#0284c7', borderRadius: '6px', '&:hover': { bgcolor: '#e0f2fe' } }}>
                                                    <VisibilityIcon sx={{ fontSize: 17 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {tableData.length === 0 && <TableRow className="empty-row"><TableCell colSpan={6} align="center" sx={{ py: 5, color: '#7dd3fc' }}>Không có dữ liệu trong tháng này</TableCell></TableRow>}
                        </TableBody>

                        {tableData.length > 0 && (
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

            <Dialog open={!!selectedGroup} onClose={() => setSelectedGroup(null)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0f9ff', color: '#0c4a6e' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Chi tiết chi phí ngày {selectedGroup?.dateStr}</Typography>
                    <IconButton onClick={() => setSelectedGroup(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 3 } }}>
                    {selectedGroup && (
                        <ChiPhiTable
                            danhSachChiPhi={selectedGroup.items}
                            isLoading={isLoading}
                            isViewOnly={true}
                            onPrintTable={(data) => {
                                const mappedData = data.map(item => ({ ...item, ngay: item.ngayTao }));
                                setPrintData({
                                    items: mappedData,
                                    subtitle: `Phiếu chi phí ngày ${selectedGroup.dateStr}`,
                                    type: 'day'
                                });
                            }}
                            onEdit={() => { }}
                            onDelete={(id) => { onDelete(id); setSelectedGroup(null); }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedLuong} onClose={() => setSelectedLuong(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0f9ff', color: '#0c4a6e' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Chi tiết bảng lương tháng {filter?.thang}/{filter?.nam}</Typography>
                    <IconButton onClick={() => setSelectedLuong(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#ffffff', p: 0 }}>
                    <TableContainer sx={{ ...tableCardSx, p: { xs: 2, md: 0 } }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#e0f2fe' }}>
                                    <TableCell sx={THEAD_SX}>STT</TableCell>
                                    <TableCell sx={THEAD_SX}>Tên nhân viên</TableCell>
                                    <TableCell sx={THEAD_SX}>Lương cơ bản</TableCell>
                                    <TableCell sx={THEAD_SX}>Ứng trước</TableCell>
                                    <TableCell sx={THEAD_SX}>Thực nhận</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedLuong?.chiTiet && selectedLuong.chiTiet.length > 0 ? (
                                    selectedLuong.chiTiet.map((item, index) => (
                                        <TableRow key={item._id || index} sx={{ '&:hover': { bgcolor: '#f0f9ff' }, '& td': { borderBottom: '1px solid #e0f2fe', py: 0.75 } }}>
                                            <TableCell data-label="STT" sx={{ color: '#0284c7', fontWeight: 600, textAlign: { xs: 'right', md: 'center' } }}>{index + 1}</TableCell>
                                            <TableCell data-label="Tên nhân viên" sx={{ fontWeight: 600, color: '#0c4a6e' }}>
                                                {item.nhanVien?.hoVaTen || 'Không xác định'}
                                            </TableCell>
                                            <TableCell data-label="Lương cơ bản" sx={{ color: '#0369a1', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatVND(Math.round((item.luongCanBan || 0) / 1000) * 1000)}
                                            </TableCell>
                                            <TableCell data-label="Ứng trước" sx={{ color: '#0369a1', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatVND(Math.round((item.ungTruoc || 0) / 1000) * 1000)}
                                            </TableCell>
                                            <TableCell data-label="Thực nhận" sx={{ fontWeight: 700, color: '#0369a1', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatVND(Math.round((item.thucNhan || 0) / 1000) * 1000)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="empty-row">
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#7dd3fc' }}>Chưa có dữ liệu bảng lương chi tiết</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            <PrintPreviewModal isOpen={!!printData} data={printData} onClose={() => setPrintData(null)} />
        </Box>
    );
};

export default BaoCaoChiPhi;