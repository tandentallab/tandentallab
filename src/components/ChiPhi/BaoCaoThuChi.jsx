import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getChiPhiSelector } from '../../redux/selector';
import { api } from '../../config/api';
import { formatVND } from './chiPhiUtils';

const BaoCaoThuChi = ({ filter }) => {
    const { danhSachChiPhi, isLoading: isLoadingChiPhi } = useSelector(getChiPhiSelector);

    const [tongThu, setTongThu] = useState(0);
    const [isLoadingThu, setIsLoadingThu] = useState(false);

    const tongChi = danhSachChiPhi.reduce((sum, i) => sum + (i.gia ?? 0), 0);

    useEffect(() => {
        const fetchTongThu = async () => {
            setIsLoadingThu(true);
            try {
                const res = await api.get('/baocao/doanh-thu-thang', {
                    params: {
                        thang: filter.thang,
                        nam: filter.nam
                    }
                });

                if (res.data.success) {
                    setTongThu(res.data.tongHop.thanhToan);
                }
            } catch (err) {
                console.error(err);
                setTongThu(0);
            } finally {
                setIsLoadingThu(false);
            }
        };

        fetchTongThu();
    }, [filter]);

    const loiNhuan = tongThu - tongChi;

    if (isLoadingChiPhi || isLoadingThu) {
        return (
            <Box className="flex justify-center items-center py-10">
                <CircularProgress
                    size={32}
                    sx={{ color: '#94a3b8' }}
                />
            </Box>
        );
    }

    return (
        <Box className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">

                {/* Tổng Thu */}
                <Paper
                    elevation={0}
                    className="flex-1 p-5 rounded-xl border border-green-200 bg-green-50 flex items-center gap-4"
                >
                    <Box className="p-3 rounded-full bg-green-100 text-green-600">
                        <TrendingUpIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            className="block uppercase font-semibold text-green-600"
                        >
                            Tổng Thu
                        </Typography>

                        <Typography
                            variant="h6"
                            className="font-bold text-green-700"
                        >
                            {formatVND(tongThu)}
                        </Typography>
                    </Box>
                </Paper>

                {/* Tổng Chi */}
                <Paper
                    elevation={0}
                    className="flex-1 p-5 rounded-xl border border-red-200 bg-red-50 flex items-center gap-4"
                >
                    <Box className="p-3 rounded-full bg-red-100 text-red-600">
                        <TrendingDownIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            className="block uppercase font-semibold text-red-600"
                        >
                            Tổng Chi
                        </Typography>

                        <Typography
                            variant="h6"
                            className="font-bold text-red-700"
                        >
                            {formatVND(tongChi)}
                        </Typography>
                    </Box>
                </Paper>

                {/* Lợi Nhuận */}
                <Paper
                    elevation={0}
                    className="flex-1 p-5 rounded-xl border border-indigo-200 bg-indigo-50 flex items-center gap-4"
                >
                    <Box className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                        <WalletIcon />
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            className="block uppercase font-semibold text-indigo-600"
                        >
                            Lợi Nhuận
                        </Typography>

                        <Typography
                            variant="h6"
                            className="font-bold text-indigo-700"
                        >
                            {formatVND(loiNhuan)}
                        </Typography>
                    </Box>
                </Paper>

            </div>
        </Box>
    );
};

export default BaoCaoThuChi;