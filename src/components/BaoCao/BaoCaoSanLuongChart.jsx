import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopProductsBaoCao } from '../../redux/slices/baoCaoSlice';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';

const BaoCaoSanLuongChart = ({ startDate, endDate, dateType }) => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.baoCao);

    // State lưu width của YAxis (Tự động tính % theo màn hình)
    const [yAxisWidth, setYAxisWidth] = useState(220);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (!startDate || !endDate) return;
        dispatch(fetchTopProductsBaoCao({ startDate, endDate, dateType }));
    }, [dispatch, startDate, endDate, dateType]);

    // Hook xử lý responsive linh hoạt
    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;
            if (screenWidth < 768) {
                setIsMobile(true);
                // Cấp 35% chiều ngang màn hình cho phần chữ trên Mobile
                setYAxisWidth(screenWidth * 0.35);
            } else {
                setIsMobile(false);
                // Cấp cứng 220px trên PC
                setYAxisWidth(220);
            }
        };

        handleResize(); // Chạy ngay lần đầu
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                Lỗi: {error}
            </div>
        );
    }

    return (
        <div className="w-full bg-[#d9f2ff] p-4 rounded-2xl border border-blue-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-3 px-1 tracking-tight">
                Sản lượng theo thời gian
            </h2>

            <div className="bg-white rounded-2xl px-4 pt-3 pb-2 shadow-sm border border-gray-100 relative">
                <p className="text-center text-gray-400 font-semibold mb-3 text-[10px] uppercase tracking-widest">
                    Top 10 sản phẩm có số lượng cao nhất
                </p>

                <div className="h-[250px] w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full animate-pulse text-blue-400 font-bold italic text-sm">
                            Đang cập nhật biểu đồ...
                        </div>
                    ) : !data || data.length === 0 ? (
                        <div className="flex items-center justify-start h-full text-gray-300 text-sm">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data}
                                barCategoryGap="15%"
                                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis type="number" hide domain={[0, (dataMax) => Math.round(dataMax * 1.25)]} />

                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    orientation="left"
                                    width={yAxisWidth} // Áp dụng width % đã được convert sang số
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    tick={{
                                        fill: '#1e293b',
                                        fontSize: isMobile ? 10 : 12, // Giảm font nếu là mobile
                                        fontWeight: 600,
                                        textAnchor: 'end'
                                    }}
                                    dx={-10}
                                />

                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #e2e8f0',
                                        fontSize: 12,
                                    }}
                                />

                                <Bar
                                    dataKey="quantity"
                                    fill="#00a3e0"
                                    radius={[0, 4, 4, 0]}
                                    barSize={14}
                                >
                                    <LabelList
                                        dataKey="quantity"
                                        position="right"
                                        style={{ fill: '#00a3e0', fontSize: 11, fontWeight: 'bold' }}
                                        offset={8}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BaoCaoSanLuongChart;