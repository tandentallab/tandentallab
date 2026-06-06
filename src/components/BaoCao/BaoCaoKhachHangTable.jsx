import React from 'react';
import { useSelector } from 'react-redux';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box
} from '@mui/material';

const headSx = {
    bgcolor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 'bold',
    py: 1.5,
    fontSize: '13px'
};

const cellSx = {
    py: 1.2,
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #f1f5f9'
};

const BaoCaoKhachHangTable = () => {
    const { sanLuongKhachHangData, sanLuongKhachHangLoading } = useSelector((state) => state.baoCao);
    const dataList = sanLuongKhachHangData?.data || [];

    return (
        // Bỏ margin-top (mt: 3) vì Grid cha đã có khoảng cách (gap-6)
        <Box sx={{ width: '100%', height: '100%' }}>
            <TableContainer
                component={Paper}
                className="rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                // 🔥 Ép chiều cao tối đa ~335px để bảng cao ĐÚNG BẰNG biểu đồ Top 10 bên trái
                sx={{ maxHeight: 335, overflowY: 'auto' }}
            >
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headSx, width: '70%', pl: 3 }}>Khách hàng</TableCell>
                            <TableCell align="right" sx={{ ...headSx, width: '30%', pr: 4 }}>Số lượng</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {sanLuongKhachHangLoading ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 8, color: '#60a5fa', fontStyle: 'italic' }} className="animate-pulse">
                                    Đang tổng hợp...
                                </TableCell>
                            </TableRow>
                        ) : dataList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                            dataList.map((row) => (
                                <TableRow key={row.nhaKhoaId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                    <TableCell sx={{ ...cellSx, fontWeight: 600, pl: 3 }}>
                                        {row.tenNhaKhoa}
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...cellSx, pr: 4, fontWeight: 700, color: '#0369a1' }}>
                                        {new Intl.NumberFormat('vi-VN').format(row.tongSanLuong)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BaoCaoKhachHangTable;