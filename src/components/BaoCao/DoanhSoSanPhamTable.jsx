import React, { useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

// CSS KIỂU EXCEL CHO HEADER
const headSx = {
    bgcolor: '#f1f5f9',
    color: '#1e293b',
    fontWeight: 'bold',
    py: 0.75,
    px: 1.5,
    fontSize: '13px',
    borderRight: '1px solid #cbd5e1',
    borderBottom: '1px solid #cbd5e1',
};

// CSS KIỂU EXCEL CHO CÁC Ô DỮ LIỆU
const cellSx = {
    py: 0.5,
    px: 1.5,
    fontSize: '13px',
    color: '#333',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

// =======================================================================
// COMPONENT KÉO DÃN CỘT
// =======================================================================
const ResizableHeaderCell = ({ children, initialWidth, minWidth = 60, isLast }) => {
    const [width, setWidth] = useState(initialWidth);
    const startX = useRef(null);
    const startWidth = useRef(null);

    const handleMouseDown = (e) => {
        startX.current = e.clientX;
        startWidth.current = width;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (startX.current !== null) {
            const newWidth = Math.max(minWidth, startWidth.current + (e.clientX - startX.current));
            setWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        startX.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <TableCell
            sx={{
                ...headSx,
                width: width,
                minWidth: width,
                maxWidth: width,
                position: 'relative',
                borderRight: isLast ? 'none' : headSx.borderRight
            }}
        >
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {children}
            </div>

            {!isLast && (
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: -3,
                        bottom: 0,
                        width: '6px',
                        cursor: 'col-resize',
                        zIndex: 10,
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                />
            )}
        </TableCell>
    );
};

// =======================================================================
// BẢNG CHÍNH — nhận data + loading qua props (vì filter ở Page)
// =======================================================================
const DoanhSoSanPhamTable = ({ data = [], loading = false }) => {
    const tongTatCaDoanhSo = data.reduce((sum, item) => sum + (item.tongDoanhSo || 0), 0);
    const tongTatCaSoLuong = data.reduce((sum, item) => sum + (item.tongSoLuong || 0), 0);

    return (
        <Box sx={{ width: 'fit-content', maxWidth: '100%' }}>
            <TableContainer
                component={Paper}
                className="shadow-sm border border-gray-300 overflow-hidden flex flex-col rounded-md"
                sx={{ maxHeight: 900, overflowY: 'auto', overflowX: 'auto' }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'fit-content' }}>

                    <TableHead>
                        <TableRow>
                            <ResizableHeaderCell initialWidth={220}>
                                Sản phẩm
                            </ResizableHeaderCell>
                            <ResizableHeaderCell initialWidth={100}>
                                Số lượng
                            </ResizableHeaderCell>
                            <ResizableHeaderCell initialWidth={130} isLast={true}>
                                Doanh số
                            </ResizableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#60a5fa', fontStyle: 'italic' }}>
                                    Đang tính toán doanh số...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {/* DÒNG TỔNG CỘNG */}
                                <TableRow>
                                    <TableCell sx={{ ...cellSx, fontWeight: 'bold' }}></TableCell>
                                    <TableCell align="center" sx={{ ...cellSx, fontWeight: 'bold', bgcolor: '#fce7f3' }}>
                                        {formatCurrency(tongTatCaSoLuong)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, pr: 2, fontWeight: 'bold', bgcolor: '#fce7f3', borderRight: 'none' }}>
                                        {formatCurrency(tongTatCaDoanhSo)}
                                    </TableCell>
                                </TableRow>

                                {/* DANH SÁCH CHI TIẾT */}
                                {data.map((row, index) => (
                                    <TableRow key={row.sanPhamId || index} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <TableCell sx={{ ...cellSx }}>
                                            {row.tenSanPham}
                                        </TableCell>
                                        <TableCell align="center" sx={{ ...cellSx }}>
                                            {formatCurrency(row.tongSoLuong)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ ...cellSx, pr: 2, borderRight: 'none' }}>
                                            {formatCurrency(row.tongDoanhSo)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DoanhSoSanPhamTable;