import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Paper } from '@mui/material';
import { THEAD_SX, tableCardSx } from '../../../utils/chiPhiStyles';
import { formatVND } from '../../../utils/chiPhiUtils';

const BaseTable = ({ columns, children, tongTien, topBar, onScroll }) => {
    return (
        // Thêm display flex, flex: 1, overflow: hidden vào Paper
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderRadius: '16px', border: { xs: 'none', md: '1px solid #bae6fd' }, bgcolor: { xs: 'transparent', md: '#fff' } }}>
            {topBar}

            {/* Thêm flex: 1 và overflowY: 'auto' vào TableContainer */}
            <TableContainer
                sx={{ flex: 1, overflowY: 'auto', ...tableCardSx }}
                onScroll={onScroll}
            >
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#e0f2fe', borderBottom: '1px solid #7dd3fc' }}>
                            {columns.map((col, index) => (
                                <TableCell key={index} align={col.align || 'left'} sx={{ ...THEAD_SX, width: col.width || 'auto', ...col.sx }}>
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {children}
                    </TableBody>
                    {tongTien !== undefined && (
                        <TableFooter sx={{ position: 'sticky', bottom: 0, zIndex: 1 }}>
                            <TableRow sx={{ background: '#5ab5e6' }}>
                                <TableCell colSpan={3} sx={{ fontWeight: 700, color: '#ffffff', borderTop: 'none', fontSize: '0.8rem', textTransform: 'uppercase', py: 1.25 }}>Tổng cộng</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#ffffff', borderTop: 'none', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>{formatVND(tongTien)}</TableCell>
                                <TableCell colSpan={2} className="hide-on-mobile" sx={{ borderTop: 'none' }} />
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default BaseTable;