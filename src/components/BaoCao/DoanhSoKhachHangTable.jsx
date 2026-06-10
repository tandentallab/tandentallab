import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, useMediaQuery, useTheme
} from '@mui/material';

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
// RESIZABLE HEADER — chỉ hoạt động trên desktop
// =======================================================================
const ResizableHeaderCell = ({ children, initialWidth, mobileWidth, minWidth = 60, isLast, isMobile }) => {
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

    // Mobile: dùng % thay px, không render resize handle
    if (isMobile) {
        return (
            <TableCell
                sx={{
                    ...headSx,
                    width: mobileWidth,
                    px: 1,
                    fontSize: '12px',
                    position: 'relative',
                    borderRight: isLast ? 'none' : headSx.borderRight,
                }}
            >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {children}
                </div>
            </TableCell>
        );
    }

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
// BẢNG CHÍNH
// =======================================================================
const DoanhSoKhachHangTable = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px

    const { doanhSoKhachHangData, doanhSoKhachHangLoading } = useSelector((state) => state.baoCao);
    const dataList = doanhSoKhachHangData?.data || [];

    const tongTatCaDoanhSo = dataList.reduce((sum, item) => sum + (item.tongDoanhSo || 0), 0);
    const tongTatCaSoLuong = dataList.reduce((sum, item) => sum + (item.tongSoLuong || 0), 0);

    const mobileCellSx = { ...cellSx, px: 1, fontSize: '12px' };

    return (
        <Box sx={{ width: isMobile ? '100%' : 'fit-content', maxWidth: '100%' }}>
            <TableContainer
                component={Paper}
                className="shadow-sm border border-gray-300 overflow-hidden flex flex-col rounded-md"
                sx={{ maxHeight: 900, overflowY: 'auto', overflowX: isMobile ? 'hidden' : 'auto' }}
            >
                <Table
                    stickyHeader
                    size="small"
                    sx={{
                        tableLayout: 'fixed',
                        width: isMobile ? '100%' : 'fit-content',
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <ResizableHeaderCell
                                initialWidth={170}
                                mobileWidth="55%"
                                isMobile={isMobile}
                            >
                                Khách hàng
                            </ResizableHeaderCell>
                            <ResizableHeaderCell
                                initialWidth={100}
                                mobileWidth="20%"
                                isMobile={isMobile}
                            >
                                {isMobile ? 'SL' : 'Số lượng'}
                            </ResizableHeaderCell>
                            <ResizableHeaderCell
                                initialWidth={110}
                                mobileWidth="25%"
                                isMobile={isMobile}
                                isLast
                            >
                                Doanh số
                            </ResizableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {doanhSoKhachHangLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#60a5fa', fontStyle: 'italic' }}>
                                    Đang tính toán doanh số...
                                </TableCell>
                            </TableRow>
                        ) : dataList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {/* DÒNG TỔNG CỘNG */}
                                <TableRow>
                                    <TableCell sx={{ ...(isMobile ? mobileCellSx : cellSx), fontWeight: 'bold' }}></TableCell>
                                    <TableCell align="center" sx={{ ...(isMobile ? mobileCellSx : cellSx), fontWeight: 'bold', bgcolor: '#fce7f3' }}>
                                        {formatCurrency(tongTatCaSoLuong)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...(isMobile ? mobileCellSx : cellSx), pr: isMobile ? 1 : 2, fontWeight: 'bold', bgcolor: '#fce7f3', borderRight: 'none' }}>
                                        {formatCurrency(tongTatCaDoanhSo)}
                                    </TableCell>
                                </TableRow>

                                {/* DANH SÁCH CHI TIẾT */}
                                {dataList.map((row) => (
                                    <TableRow key={row.nhaKhoaId} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <TableCell sx={isMobile ? mobileCellSx : cellSx}>
                                            {row.tenNhaKhoa}
                                        </TableCell>
                                        <TableCell align="center" sx={isMobile ? mobileCellSx : cellSx}>
                                            {formatCurrency(row.tongSoLuong)}
                                        </TableCell>
                                        <TableCell align="right" sx={{ ...(isMobile ? mobileCellSx : cellSx), pr: isMobile ? 1 : 2, borderRight: 'none' }}>
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

export default DoanhSoKhachHangTable;