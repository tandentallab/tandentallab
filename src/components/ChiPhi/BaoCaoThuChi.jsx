import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress } from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getChiPhiSelector } from '../../redux/selector';
import { api } from '../../config/api';
import { formatVND } from './chiPhiUtils';

// Nhận vào mỗi filter từ Component cha là đủ
const BaoCaoThuChi = ({ filter }) => {
    const { danhSachChiPhi, isLoading: isLoadingChiPhi } = useSelector(getChiPhiSelector);

    const [tongThu, setTongThu] = useState(0);
    const [isLoadingThu, setIsLoadingThu] = useState(false);

    // Tính tổng chi từ Redux store
    const tongChi = danhSachChiPhi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    // Lấy số liệu Thu
    useEffect(() => {
        const fetchTongThu = async () => {
            setIsLoadingThu(true);
            try {
                const res = await api.get('/baocao/doanh-thu-thang', {
                    params: { thang: filter.thang, nam: filter.nam }
                });

                if (res.data.success) {
                    setTongThu(res.data.tongHop.thanhToan);
                }
            } catch (error) {
                console.error("Lỗi lấy tổng thu:", error);
                setTongThu(0);
            } finally {
                setIsLoadingThu(false);
            }
        };

        fetchTongThu();
    }, [filter]);

    const loiNhuan = tongThu - tongChi;

    return (
        <Box className="mb-6">
            {isLoadingChiPhi || isLoadingThu ? (
                <Box className="flex justify-center items-center py-10">
                    <CircularProgress size={32} sx={{ color: '#94a3b8' }} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* THẺ TỔNG THU */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} className="p-5 rounded-xl border border-green-200 bg-green-50 flex items-center gap-4">
                            <Box className="p-3 bg-green-100 text-green-600 rounded-full">
                                <TrendingUpIcon fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" className="text-green-600 font-semibold uppercase mb-0.5 block">
                                    Tổng Thu
                                </Typography>
                                <Typography variant="h6" className="text-green-700 font-bold">
                                    {formatVND(tongThu)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* THẺ TỔNG CHI */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} className="p-5 rounded-xl border border-red-200 bg-red-50 flex items-center gap-4">
                            <Box className="p-3 bg-red-100 text-red-600 rounded-full">
                                <TrendingDownIcon fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" className="text-red-600 font-semibold uppercase mb-0.5 block">
                                    Tổng Chi
                                </Typography>
                                <Typography variant="h6" className="text-red-700 font-bold">
                                    {formatVND(tongChi)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* THẺ LỢI NHUẬN */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} className="p-5 rounded-xl border border-indigo-200 bg-indigo-50 flex items-center gap-4">
                            <Box className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                                <WalletIcon fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" className="text-indigo-600 font-semibold uppercase mb-0.5 block">
                                    Lợi Nhuận
                                </Typography>
                                <Typography variant="h6" className="text-indigo-700 font-bold">
                                    {formatVND(loiNhuan)}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default BaoCaoThuChi;