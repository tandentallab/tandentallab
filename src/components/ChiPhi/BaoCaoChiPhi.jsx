import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box, TableRow, TableCell, Typography, Dialog, DialogTitle,
    DialogContent, IconButton, Tooltip, Popover, FormGroup, FormControlLabel, Checkbox, Badge, Divider, Button
} from '@mui/material';
import {
    Close as CloseIcon, Visibility as VisibilityIcon,
    Print as PrintIcon, FilterList as FilterListIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

// Import các component tái sử dụng
import ChiPhiTable from './ChiPhiTable';
import PrintPreviewModal from './PrintPreviewModal';
import BaseTable from './common/BaseTable';
import SalaryDetailModal from './SalaryDetailModal';
import ChiPhiForm from './ChiPhiForm';

// Redux & Utils
import { addChiPhiPhatSinh, fetchChiPhi } from '../../redux/slices/chiPhiSlice';
import { formatVND } from '../../utils/chiPhiUtils';

const BaoCaoChiPhi = ({ danhSachChiPhi, filter, isLoading, onDelete }) => {
    const dispatch = useDispatch();

    // States cho các modal hiển thị chi tiết
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedLuong, setSelectedLuong] = useState(null);
    const [selectedPhatSinh, setSelectedPhatSinh] = useState(null);
    const [printData, setPrintData] = useState(null);

    // States cho Filter Phân Loại
    const [filterAnchorEl, setFilterAnchorEl] = useState(null);
    const [appliedSelectedLoai, setAppliedSelectedLoai] = useState([]);
    const [tempSelectedLoai, setTempSelectedLoai] = useState([]);
    const [visibleCount, setVisibleCount] = useState(20);

    // --- XỬ LÝ DATA BẢNG ---
    const filteredByDate = danhSachChiPhi.filter(item => {
        if (item.isAuto) return true;
        if (filter.ngay && filter.ngay > 0) return dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').date() === filter.ngay;
        return true;
    });

    const dsLoaiUnique = Array.from(new Set(filteredByDate.map(i => i.loaiChiPhi).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));

    const filteredData = appliedSelectedLoai.length > 0
        ? filteredByDate.filter(item => appliedSelectedLoai.includes(item.loaiChiPhi))
        : filteredByDate;

    const autoItems = filteredData.filter(item => item.isAuto);
    const groupedData = filteredData.filter(item => !item.isAuto).reduce((acc, item) => {
        const dateStr = dayjs(item.ngayTao).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY');
        if (!acc[dateStr]) acc[dateStr] = { isGroup: true, dateStr, ngayTao: item.ngayTao, tongTien: 0, items: [] };
        acc[dateStr].tongTien += item.gia || 0;
        acc[dateStr].items.push(item);
        return acc;
    }, {});

    const tableData = [...autoItems, ...Object.values(groupedData).sort((a, b) => dayjs(b.ngayTao).valueOf() - dayjs(a.ngayTao).valueOf())];
    const tongChiPhi = filteredData.reduce((sum, item) => sum + (item.gia ?? 0), 0);
    const coDuLieu = tableData.length > 0;

    // --- CÁC HÀM XỬ LÝ LỌC & IN ---
    const handleOpenFilter = (e) => { setTempSelectedLoai(appliedSelectedLoai); setFilterAnchorEl(e.currentTarget); };
    const handleCloseFilter = () => setFilterAnchorEl(null);
    const handleToggleTempLoai = (loai) => setTempSelectedLoai((prev) => prev.includes(loai) ? prev.filter((l) => l !== loai) : [...prev, loai]);
    const handleApplyFilter = () => { setAppliedSelectedLoai(tempSelectedLoai); setVisibleCount(20); handleCloseFilter(); };
    const handleClearFilter = () => { setTempSelectedLoai([]); setAppliedSelectedLoai([]); setVisibleCount(20); handleCloseFilter(); };

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 10 && visibleCount < tableData.length) {
            setVisibleCount(prev => prev + 20);
        }
    };

    const handlePrintTongQuat = () => {
        const isThang = filter.ngay === 0;
        const type = isThang ? 'month' : 'day';
        const pad = (num) => String(num).padStart(2, '0');
        const subtitle = isThang
            ? `Phiếu chi phí tháng ${pad(filter.thang)}/${filter.nam}`
            : `Phiếu chi phí ngày ${pad(filter.ngay)}/${pad(filter.thang)}/${filter.nam}`;

        let mappedItems = tableData.map(item => {
            if (item.isGroup) {
                return { tenChiPhi: `Chi phí ngày ${item.dateStr}`, loaiChiPhi: 'Tổng hợp', gia: item.tongTien, ngay: item.ngayTao, ghiChu: `Bao gồm ${item.items.length} giao dịch` };
            } else {
                return { ...item, ngay: item.ngayTao };
            }
        });

        if (isThang) mappedItems.sort((a, b) => dayjs(a.ngay).valueOf() - dayjs(b.ngay).valueOf());
        setPrintData({ items: mappedItems, subtitle, type });
    };

    // --- HÀM SUBMIT FORM PHÁT SINH ---
    const handleAddPhatSinh = async (formData) => {
        try {
            await dispatch(addChiPhiPhatSinh(formData)).unwrap();
            dispatch(fetchChiPhi(filter)); // Refresh để bảng cập nhật lại tổng dòng Phát sinh
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error);
        }
    };

    const columns = [
        { label: 'Ngày', width: 100, className: 'hide-on-mobile-card' },
        { label: 'Tên chi phí', width: 'auto' },
        {
            width: 130, sx: { whiteSpace: 'nowrap' },
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
        { label: 'Số tiền', width: 140, className: 'hide-on-mobile-card' },
        { label: 'Ghi chú', width: 'auto' },
        {
            width: 80, align: 'right', className: 'hide-on-mobile-card',
            label: coDuLieu && (
                <Tooltip title="In bảng này" arrow>
                    <IconButton size="small" onClick={handlePrintTongQuat} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '10px', '&:hover': { bgcolor: '#7dd3fc' } }}>
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
                    <Badge badgeContent={appliedSelectedLoai.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 15, minWidth: 15 } }}>
                        <FilterListIcon sx={{ fontSize: 18 }} />
                    </Badge>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>PHÂN LOẠI</Typography>
                </Box>

                {coDuLieu && (
                    <IconButton size="small" onClick={handlePrintTongQuat} sx={{ color: '#0284c7', bgcolor: '#bae6fd', borderRadius: '8px', px: 1.5, py: 1, '&:hover': { bgcolor: '#7dd3fc' } }}>
                        <PrintIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                )}
            </Box>

            <Popover open={Boolean(filterAnchorEl)} anchorEl={filterAnchorEl} onClose={handleCloseFilter} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Box sx={{ p: 2, minWidth: 220 }}>
                    <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                        {dsLoaiUnique.length > 0 ? (
                            <FormGroup>
                                {dsLoaiUnique.map((loai) => (
                                    <FormControlLabel key={loai} control={<Checkbox size="small" checked={tempSelectedLoai.includes(loai)} onChange={() => handleToggleTempLoai(loai)} />} label={<Typography variant="body2">{loai}</Typography>} />
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
        <Box className="flex flex-col flex-1 overflow-hidden" sx={{ height: '100%' }}>
            {/* Form thêm chi phí hiển thị mặc định */}
            <Box sx={{ mb: 2, flexShrink: 0 }}>
                <ChiPhiForm isLoading={isLoading} onAdd={handleAddPhatSinh} />
            </Box>

            <BaseTable columns={columns} tongTien={coDuLieu ? tongChiPhi : undefined} topBar={topBar} onScroll={handleScroll}>
                {tableData.slice(0, visibleCount).map((row, idx) => {
                    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f0f7fc';

                    if (row.isAuto) {
                        const isLuong = row._id === "auto_luong_nhan_vien";
                        const isPhatSinh = row._id === "auto_chi_phi_phat_sinh";
                        const isClickable = isLuong || isPhatSinh;

                        return (
                            <TableRow
                                key={row._id}
                                onClick={() => {
                                    if (isLuong) setSelectedLuong(row);
                                    if (isPhatSinh) setSelectedPhatSinh(row);
                                }}
                                sx={{
                                    bgcolor: rowBg,
                                    cursor: isClickable ? 'pointer' : 'default',
                                    '&:hover': isClickable ? { bgcolor: '#bae6fd' } : {},
                                    '& td': { borderBottom: '1px solid #e0f2fe' }
                                }}
                            >
                                <TableCell className="mobile-card-header" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>
                                            {/* Sửa format ở đây (Mobile) */}
                                            {dayjs(row.ngayTao).tz('Asia/Ho_Chi_Minh').format('MM/YYYY')}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0369a1', fontSize: '0.95rem' }}>
                                            {formatVND(row.gia)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        {isClickable && (
                                            <IconButton size="small" sx={{ color: '#0284c7', p: 0.5 }}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>
                                </TableCell>

                                <TableCell className="hide-on-mobile-card" data-label="Ngày" sx={{ color: '#c2410c', fontSize: '0.82rem', fontWeight: 500, py: 0.75 }}>
                                    {/* Sửa format ở đây (Desktop) */}
                                    {dayjs(row.ngayTao).tz('Asia/Ho_Chi_Minh').format('MM/YYYY')}
                                </TableCell>
                                <TableCell data-label="Tên chi phí" sx={{ py: 0.75 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#c2410c', fontSize: '0.88rem' }}>{row.tenChiPhi}</Typography>
                                </TableCell>
                                <TableCell data-label="Phân loại" sx={{ py: 0.75 }}>
                                    <Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>{row.loaiChiPhi}</Typography>
                                </TableCell>
                                <TableCell className="hide-on-mobile-card" data-label="Số tiền" sx={{ py: 0.75 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#0369a1', fontVariantNumeric: 'tabular-nums', fontSize: '0.92rem' }}>{formatVND(row.gia)}</Typography>
                                </TableCell>
                                <TableCell data-label="Ghi chú" sx={{ color: '#0369a1', fontSize: '0.82rem', py: 0.75 }}>{row.ghiChu || ''}</TableCell>
                                <TableCell className="hide-on-mobile-card" align="right" sx={{ pr: 1.5, py: 0.75 }}>
                                    {isClickable && (
                                        <Tooltip title="Xem chi tiết">
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
                            sx={{
                                bgcolor: rowBg, cursor: 'pointer',
                                '&:hover': { bgcolor: '#bae6fd' },
                                '& td': { borderBottom: '1px solid #e0f2fe' }
                            }}
                        >
                            <TableCell className="mobile-card-header" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box sx={{ flex: 1, textAlign: 'left' }}><Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>{row.dateStr}</Typography></Box>
                                <Box sx={{ flex: 1, textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', fontSize: '0.95rem' }}>{formatVND(row.tongTien)}</Typography></Box>
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}><IconButton size="small" sx={{ color: '#0284c7', p: 0.5 }}><VisibilityIcon fontSize="small" /></IconButton></Box>
                            </TableCell>

                            <TableCell className="hide-on-mobile-card" data-label="Ngày" sx={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 500, py: 0.75 }}>{row.dateStr}</TableCell>
                            <TableCell data-label="Tên chi phí" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontWeight: 600, color: '#0c4a6e', fontSize: '0.88rem' }}>Chi phí ngày {row.dateStr}</Typography></TableCell>
                            <TableCell data-label="Phân loại" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0c4a6e' }}>Tổng hợp</Typography></TableCell>
                            <TableCell className="hide-on-mobile-card" data-label="Số tiền" sx={{ py: 0.75 }}><Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', fontVariantNumeric: 'tabular-nums', fontSize: '0.92rem' }}>{formatVND(row.tongTien)}</Typography></TableCell>
                            <TableCell data-label="Ghi chú" sx={{ color: '#0369a1', fontSize: '0.82rem', py: 0.75 }}>Gồm {row.items.length} dòng</TableCell>
                            <TableCell className="hide-on-mobile-card" align="right" sx={{ pr: 1.5, py: 0.75 }}>
                                <Tooltip title="Xem chi tiết">
                                    <IconButton size="small" sx={{ color: '#0284c7', borderRadius: '6px', '&:hover': { bgcolor: '#e0f2fe' } }}><VisibilityIcon sx={{ fontSize: 17 }} /></IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {!coDuLieu && (
                    <TableRow className="empty-row"><TableCell colSpan={6} align="center" sx={{ py: 5, color: '#7dd3fc' }}>Không có dữ liệu trong tháng này</TableCell></TableRow>
                )}
            </BaseTable>

            {/* MODAL CHI TIẾT NHÓM NGÀY */}
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
                                setPrintData({ items: data.map(item => ({ ...item, ngay: item.ngayTao })), subtitle: `Phiếu chi phí ngày ${selectedGroup.dateStr}`, type: 'day' });
                            }}
                            onEdit={() => { }}
                            onDelete={(id) => { onDelete(id); setSelectedGroup(null); }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* MODAL CHI TIẾT PHÁT SINH */}
            <Dialog open={!!selectedPhatSinh} onClose={() => setSelectedPhatSinh(null)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0f9ff', color: '#0c4a6e' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Chi tiết phát sinh tháng {filter.thang}/{filter.nam}</Typography>
                    <IconButton onClick={() => setSelectedPhatSinh(null)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 3 } }}>
                    {selectedPhatSinh && selectedPhatSinh.chiTiet && (
                        <ChiPhiTable
                            danhSachChiPhi={selectedPhatSinh.chiTiet}
                            isLoading={isLoading}
                            isViewOnly={true}
                            onPrintTable={(data) => {
                                setPrintData({ items: data.map(item => ({ ...item, ngay: item.ngayTao })), subtitle: `Phiếu chi phí phát sinh tháng ${filter.thang}`, type: 'month' });
                            }}
                            onEdit={() => { }}
                            onDelete={(id) => { onDelete(id); setSelectedPhatSinh(null); }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {selectedLuong && <SalaryDetailModal selectedLuong={selectedLuong} filter={filter} onClose={() => setSelectedLuong(null)} />}
            <PrintPreviewModal isOpen={!!printData} data={printData} onClose={() => setPrintData(null)} />
        </Box>
    );
};

export default BaoCaoChiPhi;