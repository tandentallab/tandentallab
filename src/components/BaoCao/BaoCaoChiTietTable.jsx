import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDetailedReport } from '../../redux/slices/baoCaoSlice';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, IconButton, Collapse, Box,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const COL_WIDTHS = { name: '30%', data: '14%' };

// ─────────────────────────────────────────────────────────────────────────────
// SubGroupRow: Hàng cấp 2 — Nhóm sản phẩm (collapsible)
// ─────────────────────────────────────────────────────────────────────────────
const SubGroupRow = ({ group }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TableRow sx={{ bgcolor: '#fff3e0', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
                <TableCell sx={{ pl: 4, py: 1, width: COL_WIDTHS.name }} className="font-bold">
                    <IconButton size="small">
                        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                    <span className="ml-1 text-[12px]">{group.tenNhom || 'KHÁC'}</span>
                </TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold">{group.moi}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold">{group.sua}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold">{group.baoHanh}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold">{group.lamLai}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold">{group.tong}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                {group.products?.map((item, idx) => (
                                    <TableRow key={idx} sx={{ bgcolor: '#ffffff' }}>
                                        <TableCell sx={{ pl: 10, py: 0.8, width: COL_WIDTHS.name, color: '#475569', fontSize: '12px' }}>
                                            {item.ten}
                                        </TableCell>
                                        <TableCell align="center" sx={{ width: COL_WIDTHS.data, fontSize: '12px' }}>{item.moi}</TableCell>
                                        <TableCell align="center" sx={{ width: COL_WIDTHS.data, fontSize: '12px' }}>{item.sua}</TableCell>
                                        <TableCell align="center" sx={{ width: COL_WIDTHS.data, fontSize: '12px' }}>{item.baoHanh}</TableCell>
                                        <TableCell align="center" sx={{ width: COL_WIDTHS.data, fontSize: '12px' }} className="text-red-400">{item.lamLai}</TableCell>
                                        <TableCell align="center" sx={{ width: COL_WIDTHS.data, fontSize: '12px' }} className="font-bold text-gray-400">{item.tong}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// MainTypeRow: Hàng cấp 1 — Loại sản phẩm (collapsible, mặc định mở)
// ─────────────────────────────────────────────────────────────────────────────
const MainTypeRow = ({ typeData }) => {
    const [open, setOpen] = useState(true);
    return (
        <>
            <TableRow sx={{ bgcolor: '#ffe0b2' }}>
                <TableCell sx={{ width: COL_WIDTHS.name }} className="py-2">
                    <div className="flex items-center font-bold text-gray-900">
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                        <span className="ml-1 text-[13px] uppercase">{typeData._id || 'KHÁC'}</span>
                    </div>
                </TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold text-[13px]">{typeData.t_moi}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold text-[13px]">{typeData.t_sua}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold text-[13px]">{typeData.t_bh}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold text-[13px]">{typeData.t_ll}</TableCell>
                <TableCell align="center" sx={{ width: COL_WIDTHS.data }} className="font-bold text-[13px]">{typeData.t_tong}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                {typeData.groups?.map((group, idx) => (
                                    <SubGroupRow key={idx} group={group} />
                                ))}
                            </TableBody>
                        </Table>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// BaoCaoChiTietTable
// Props: startDate, endDate (YYYY-MM-DD) — do BaoCaoPage tính sẵn (SSOT)
//        dateType: 'ngayNhan' | 'henGiao'
// Component KHÔNG tự tính toán ngày tháng, chỉ dispatch và hiển thị.
// ─────────────────────────────────────────────────────────────────────────────
const BaoCaoChiTietTable = ({ startDate, endDate, dateType }) => {
    const dispatch = useDispatch();
    const { detailedData = [], detailedLoading } = useSelector((state) => state.baoCao || {});

    useEffect(() => {
        if (!startDate || !endDate) return;
        dispatch(fetchDetailedReport({ startDate, endDate, dateType }));
    }, [dispatch, startDate, endDate, dateType]);

    const totals = detailedData.reduce(
        (acc, curr) => ({
            m: acc.m + curr.t_moi,
            s: acc.s + curr.t_sua,
            b: acc.b + curr.t_bh,
            l: acc.l + curr.t_ll,
            t: acc.t + curr.t_tong,
        }),
        { m: 0, s: 0, b: 0, l: 0, t: 0 }
    );

    return (
        <Box sx={{ width: '100%', mt: 4 }}>
            <TableContainer
                component={Paper}
                className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                sx={{ height: '100vh', overflowY: 'auto', scrollbarGutter: 'stable' }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: COL_WIDTHS.name, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', py: 2, zIndex: 10 }}>
                                SẢN PHẨM
                            </TableCell>
                            <TableCell align="center" sx={{ width: COL_WIDTHS.data, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>MỚI</TableCell>
                            <TableCell align="center" sx={{ width: COL_WIDTHS.data, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>SỬA</TableCell>
                            <TableCell align="center" sx={{ width: COL_WIDTHS.data, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>BẢO HÀNH</TableCell>
                            <TableCell align="center" sx={{ width: COL_WIDTHS.data, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>LÀM LẠI</TableCell>
                            <TableCell align="center" sx={{ width: COL_WIDTHS.data, bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>TỔNG CỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detailedLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" className="py-20 text-blue-400 font-bold italic animate-pulse">
                                    Đang tổng hợp dữ liệu chi tiết...
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {detailedData.map((type, idx) => (
                                    <MainTypeRow key={idx} typeData={type} />
                                ))}

                                {/* Hàng tổng cộng — sticky bottom */}
                                <TableRow sx={{ bgcolor: '#fef3c7', position: 'sticky', bottom: 0, zIndex: 5 }}>
                                    <TableCell className="font-bold py-4 text-[14px]">TỔNG CỘNG HỆ THỐNG</TableCell>
                                    <TableCell align="center" className="font-black text-blue-900">{totals.m}</TableCell>
                                    <TableCell align="center" className="font-black text-blue-900">{totals.s}</TableCell>
                                    <TableCell align="center" className="font-black text-blue-900">{totals.b}</TableCell>
                                    <TableCell align="center" className="font-black text-red-700">{totals.l}</TableCell>
                                    <TableCell align="center" className="font-black text-blue-900">{totals.t}</TableCell>
                                </TableRow>
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BaoCaoChiTietTable;