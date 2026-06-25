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

const formatNumber = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

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
                // 🔥 Đã chỉnh sửa Responsive: Mobile tự động giãn, Desktop giữ nguyên cố định
                width: { xs: 'auto', md: width },
                minWidth: { xs: initialWidth, md: width },
                maxWidth: isLast ? 'none' : { xs: 'none', md: width },
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
                        right: -3,
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
const BaoCaoKhachHangTable = () => {
    const { sanLuongKhachHangData, sanLuongKhachHangLoading } = useSelector((state) => state.baoCao);
    const dataList = sanLuongKhachHangData?.data || [];

    return (
        // 🔥 Đã chỉnh sửa Width: 100% trên Mobile, fit-content trên Desktop
        <Box sx={{ width: { xs: '100%', md: 'fit-content' }, maxWidth: '100%' }}>
            <TableContainer
                component={Paper}
                className="shadow-sm border border-gray-300 overflow-hidden flex flex-col rounded-md"
                sx={{ maxHeight: 900, overflowY: 'auto', overflowX: 'auto' }}
            >
                <Table
                    stickyHeader
                    size="small"
                    // 🔥 Đã chỉnh sửa tableLayout và width cho tương thích với Box bên ngoài
                    sx={{ tableLayout: { xs: 'auto', md: 'fixed' }, width: { xs: '100%', md: 'fit-content' } }}
                >
                    <TableHead>
                        <TableRow>
                            <ResizableHeaderCell initialWidth={250}>
                                Khách hàng
                            </ResizableHeaderCell>

                            <ResizableHeaderCell initialWidth={100} isLast={true}>
                                Số lượng
                            </ResizableHeaderCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {sanLuongKhachHangLoading ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 4, color: '#60a5fa', fontStyle: 'italic' }}>
                                    Đang tổng hợp...
                                </TableCell>
                            </TableRow>
                        ) : dataList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 4, color: '#94a3b8' }}>
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {/* Render danh sách chi tiết (KHÔNG CÓ DÒNG TỔNG CỘNG) */}
                                {dataList.map((row) => (
                                    <TableRow key={row.nhaKhoaId} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                        <TableCell sx={{ ...cellSx }}>
                                            {row.tenNhaKhoa}
                                        </TableCell>
                                        <TableCell align="right" sx={{ ...cellSx, pr: 2, borderRight: 'none', fontWeight: 600, color: '#0369a1' }}>
                                            {formatNumber(row.tongSanLuong)}
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

export default BaoCaoKhachHangTable;