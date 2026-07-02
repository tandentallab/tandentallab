import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, AccountBalanceWallet } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { getChiPhiSelector } from '../../redux/selector';
import { api } from '../../config/api';
import { formatVND } from '../../utils/chiPhiUtils';
import StatCard from './StatCard';

const BaoCaoThuChi = ({ filter }) => {
    const { danhSachChiPhi, isLoading: isLoadingChiPhi } = useSelector(getChiPhiSelector);
    const [tongThu, setTongThu] = useState(0);
    const [isLoadingThu, setIsLoadingThu] = useState(false);

    // Tính tổng chi dựa trên dữ liệu Redux
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
        // CHỈ CHẠY LẠI KHI THÁNG HOẶC NĂM THAY ĐỔI
    }, [filter.thang, filter.nam]);

    const loiNhuan = tongThu - tongChi;

    if (isLoadingThu) {
        return (
            <Box className="flex justify-center items-center py-10 w-full">
                <CircularProgress size={32} sx={{ color: '#94a3b8' }} />
            </Box>
        );
    }

    return (
        <Box>
            <div className="flex flex-col md:flex-row gap-4">
                <StatCard
                    icon={<TrendingUp />}
                    title="Tổng Thu"
                    value={formatVND(tongThu)}
                    themeColors={{
                        wrapper: 'border-green-200 bg-green-50',
                        iconBg: 'bg-green-100',
                        iconColor: 'text-green-600',
                        textColor: 'text-green-600',
                        valueColor: 'text-green-700'
                    }}
                />
                <StatCard
                    icon={<TrendingDown />}
                    title="Tổng Chi"
                    value={formatVND(tongChi)}
                    themeColors={{
                        wrapper: 'border-red-200 bg-red-50',
                        iconBg: 'bg-red-100',
                        iconColor: 'text-red-600',
                        textColor: 'text-red-600',
                        valueColor: 'text-red-700'
                    }}
                />
                <StatCard
                    icon={<AccountBalanceWallet />}
                    title="Lợi Nhuận"
                    value={formatVND(loiNhuan)}
                    themeColors={{
                        wrapper: 'border-indigo-200 bg-indigo-50',
                        iconBg: 'bg-indigo-100',
                        iconColor: 'text-indigo-600',
                        textColor: 'text-indigo-600',
                        valueColor: 'text-indigo-700'
                    }}
                />
            </div>
        </Box>
    );
};

export default BaoCaoThuChi;