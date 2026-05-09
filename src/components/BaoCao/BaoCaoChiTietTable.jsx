import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDetailedReport } from '../../redux/slices/baoCaoSlice';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Box, Collapse, IconButton,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useEffect } from 'react';

// ─── Màu nền các tầng ───────────────────────────────────────────────────────
const BG = {
    type: '#fff3e0',   // Cấp 1 — Loại SP
    group: '#fffde7',   // Cấp 2 — Nhóm SP
    product: '#ffffff',   // Cấp 3 — Sản phẩm
    total: '#fef3c7',   // Hàng tổng cộng
};

const COL = { name: '32%', data: '13.6%' };

const headSx = (extra = {}) => ({
    bgcolor: '#e0f2fe',
    color: '#0369a1',
    fontWeight: 'bold',
    py: 1.2,
    ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
// Cấp 2: Nhóm sản phẩm — collapse được, mặc định MỞ
// ─────────────────────────────────────────────────────────────────────────────
const GroupRow = ({ group }) => {
    const [open, setOpen] = useState(true);

    return (
        <>
            {/* Header nhóm */}
            <TableRow
                sx={{ bgcolor: BG.group, cursor: 'pointer', '&:hover': { filter: 'brightness(0.97)' } }}
                onClick={() => setOpen((v) => !v)}
            >
                <TableCell sx={{ width: COL.name, pl: 2.5, py: 0.6, fontWeight: 600, fontSize: '12px', color: '#374151' }}>
                    <IconButton size="small" sx={{ mr: 0.5, p: 0.2 }} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
                        {open ? <KeyboardArrowUp sx={{ fontSize: 16 }} /> : <KeyboardArrowDown sx={{ fontSize: 16 }} />}
                    </IconButton>
                    {group.tenNhom || 'KHÁC'}
                </TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.6, fontWeight: 600, fontSize: '12px' }}>{group.moi}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.6, fontWeight: 600, fontSize: '12px' }}>{group.sua}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.6, fontWeight: 600, fontSize: '12px' }}>{group.baoHanh}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.6, fontWeight: 600, fontSize: '12px' }}>{group.lamLai}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.6, fontWeight: 600, fontSize: '12px' }}>{group.tong}</TableCell>
            </TableRow>

            {/* Cấp 3: Sản phẩm — luôn hiển thị khi nhóm mở, không có nút collapse thêm */}
            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                {group.products?.map((item, pIdx) => (
                                    <TableRow
                                        key={pIdx}
                                        sx={{ bgcolor: BG.product, '&:hover': { bgcolor: '#f8fafc' } }}
                                    >
                                        <TableCell sx={{ width: COL.name, pl: 7.5, py: 0.5, fontSize: '11.5px', color: '#475569' }}>
                                            {item.ten}
                                        </TableCell>
                                        <TableCell align="center" sx={{ width: COL.data, py: 0.5, fontSize: '11.5px' }}>{item.moi}</TableCell>
                                        <TableCell align="center" sx={{ width: COL.data, py: 0.5, fontSize: '11.5px' }}>{item.sua}</TableCell>
                                        <TableCell align="center" sx={{ width: COL.data, py: 0.5, fontSize: '11.5px' }}>{item.baoHanh}</TableCell>
                                        <TableCell align="center" sx={{ width: COL.data, py: 0.5, fontSize: '11.5px', color: item.lamLai > 0 ? '#ef4444' : 'inherit' }}>
                                            {item.lamLai}
                                        </TableCell>
                                        <TableCell align="center" sx={{ width: COL.data, py: 0.5, fontSize: '11.5px', fontWeight: 600, color: '#94a3b8' }}>
                                            {item.tong}
                                        </TableCell>
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
// Cấp 1: Loại sản phẩm — collapse được, mặc định MỞ
// ─────────────────────────────────────────────────────────────────────────────
const TypeRow = ({ typeData }) => {
    const [open, setOpen] = useState(true);

    return (
        <>
            {/* Header loại */}
            <TableRow
                sx={{ bgcolor: BG.type, cursor: 'pointer', '&:hover': { filter: 'brightness(0.97)' } }}
                onClick={() => setOpen((v) => !v)}
            >
                <TableCell sx={{ width: COL.name, py: 0.8, fontWeight: 700, fontSize: '13px' }}>
                    <IconButton size="small" sx={{ mr: 0.5, p: 0.2 }} onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
                        {open ? <KeyboardArrowUp sx={{ fontSize: 17 }} /> : <KeyboardArrowDown sx={{ fontSize: 17 }} />}
                    </IconButton>
                    <span className="uppercase">{typeData._id || 'KHÁC'}</span>
                </TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.8, fontWeight: 700, fontSize: '13px' }}>{typeData.t_moi}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.8, fontWeight: 700, fontSize: '13px' }}>{typeData.t_sua}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.8, fontWeight: 700, fontSize: '13px' }}>{typeData.t_bh}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.8, fontWeight: 700, fontSize: '13px' }}>{typeData.t_ll}</TableCell>
                <TableCell align="center" sx={{ width: COL.data, py: 0.8, fontWeight: 700, fontSize: '13px' }}>{typeData.t_tong}</TableCell>
            </TableRow>

            {/* Các nhóm bên trong — mỗi nhóm tự collapse độc lập */}
            <TableRow sx={{ p: 0 }}>
                <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableBody>
                                {typeData.groups?.map((group, gIdx) => (
                                    <GroupRow key={gIdx} group={group} />
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
// BaoCaoChiTietTable — main component
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
            m: acc.m + (curr.t_moi || 0),
            s: acc.s + (curr.t_sua || 0),
            b: acc.b + (curr.t_bh || 0),
            l: acc.l + (curr.t_ll || 0),
            t: acc.t + (curr.t_tong || 0),
        }),
        { m: 0, s: 0, b: 0, l: 0, t: 0 }
    );

    return (
        <Box sx={{ width: '100%', mt: 3 }}>
            <TableContainer
                component={Paper}
                className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                sx={{ maxHeight: '100vh', overflowY: 'auto', scrollbarGutter: 'stable' }}
            >
                <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>

                    {/* ── HEADER ── */}
                    <TableHead>
                        <TableRow>
                            <TableCell sx={headSx({ width: COL.name, zIndex: 10 })}>SẢN PHẨM</TableCell>
                            <TableCell align="center" sx={headSx({ width: COL.data })}>MỚI</TableCell>
                            <TableCell align="center" sx={headSx({ width: COL.data })}>SỬA</TableCell>
                            <TableCell align="center" sx={headSx({ width: COL.data })}>BẢO HÀNH</TableCell>
                            <TableCell align="center" sx={headSx({ width: COL.data })}>LÀM LẠI</TableCell>
                            <TableCell align="center" sx={headSx({ width: COL.data })}>TỔNG CỘNG</TableCell>
                        </TableRow>
                    </TableHead>

                    {/* ── BODY ── */}
                    <TableBody>
                        {detailedLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center"
                                    sx={{ py: 8, color: '#60a5fa', fontStyle: 'italic', fontSize: '13px' }}
                                    className="animate-pulse"
                                >
                                    Đang tổng hợp dữ liệu chi tiết...
                                </TableCell>
                            </TableRow>
                        ) : detailedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8, color: '#94a3b8', fontSize: '13px' }}>
                                    Không có dữ liệu trong khoảng thời gian này
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {detailedData.map((type, tIdx) => (
                                    <TypeRow key={tIdx} typeData={type} />
                                ))}

                                {/* ── Hàng tổng cộng sticky ── */}
                                <TableRow sx={{ bgcolor: BG.total, position: 'sticky', bottom: 0, zIndex: 5 }}>
                                    <TableCell sx={{ width: COL.name, py: 1, fontWeight: 800, fontSize: '13px' }}>
                                        TỔNG CỘNG HỆ THỐNG
                                    </TableCell>
                                    <TableCell align="center" sx={{ width: COL.data, py: 1, fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>{totals.m}</TableCell>
                                    <TableCell align="center" sx={{ width: COL.data, py: 1, fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>{totals.s}</TableCell>
                                    <TableCell align="center" sx={{ width: COL.data, py: 1, fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>{totals.b}</TableCell>
                                    <TableCell align="center" sx={{ width: COL.data, py: 1, fontWeight: 800, fontSize: '13px', color: '#b91c1c' }}>{totals.l}</TableCell>
                                    <TableCell align="center" sx={{ width: COL.data, py: 1, fontWeight: 800, fontSize: '13px', color: '#1e3a8a' }}>{totals.t}</TableCell>
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