import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

// 🔥 CSS KIỂU EXCEL CHO HEADER
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

// 🔥 CSS KIỂU EXCEL CHO CÁC Ô DỮ LIỆU
const cellSx = {
    py: 0.5,
    px: 1.5,
    fontSize: '13px',
    color: '#333',
    borderRight: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    // Giúp chữ bị dài quá tự động thêm "..." thay vì đẩy bảng to ra
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
};

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

// =======================================================================
// 🚀 COMPONENT CHUYÊN TRỊ KÉO DÃN CỘT (HOVER VÀO ĐƯỜNG BIÊN)
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
            // Tính toán độ rộng mới khi di chuột
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

            {/* Thanh kéo vô hình nằm ngay trên đường biên */}
            {!isLast && (
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: -3, // Lệch sang phải 3px để nằm đè lên đúng cái đường kẻ
                        bottom: 0,
                        width: '6px',
                        cursor: 'col-resize',
                        zIndex: 10,
                        backgroundColor: 'transparent',
                        transition: 'background-color 0.2s'
                    }}
                    // Hover vào thì sáng viền lên giống Excel/Google Sheets
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
    const { doanhSoKhachHangData, doanhSoKhachHangLoading } = useSelector((state) => state.baoCao);
    const dataList = doanhSoKhachHangData?.data || [];

    const tongTatCaDoanhSo = dataList.reduce((sum, item) => sum + (item.tongDoanhSo || 0), 0);
    const tongTatCaSoLuong = dataList.reduce((sum, item) => sum + (item.tongSoLuong || 0), 0);

    return (
        // 🔥 Đã đổi sang fit-content để bảng không bị giãn full màn hình
        <Box sx={{ width: 'fit-content', maxWidth: '100%' }}>
            <TableContainer
                component={Paper}
                className="shadow-sm border border-gray-300 overflow-hidden flex flex-col rounded-md"
                sx={{ maxHeight: 900, overflowY: 'auto', overflowX: 'auto' }}
            >
                {/* Thêm tableLayout: 'fixed' để bảng tuân thủ tuyệt đối kích thước tự setup */}
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: 'fit-content' }}>

                    <TableHead>
                        <TableRow>
                            {/* Cột khách hàng ban đầu để 250px */}
                            <ResizableHeaderCell initialWidth={200}>
                                Khách hàng
                            </ResizableHeaderCell>

                            {/* Cột số lượng */}
                            <ResizableHeaderCell initialWidth={100}>
                                Số lượng
                            </ResizableHeaderCell>

                            {/* Cột doanh số */}
                            <ResizableHeaderCell initialWidth={130} isLast={true}>
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
                                {/* 🔥 DÒNG TỔNG CỘNG */}
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
                                {dataList.map((row) => (
                                    <TableRow key={row.nhaKhoaId} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <TableCell sx={{ ...cellSx }}>
                                            {row.tenNhaKhoa}
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

export default DoanhSoKhachHangTable;