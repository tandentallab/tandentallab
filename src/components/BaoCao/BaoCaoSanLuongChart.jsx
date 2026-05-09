import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopProductsBaoCao } from '../../redux/slices/baoCaoSlice';
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';

const BaoCaoSanLuongChart = ({ startDate, endDate, dateType }) => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.baoCao);

    useEffect(() => {
        if (!startDate || !endDate) return;
        dispatch(fetchTopProductsBaoCao({ startDate, endDate, dateType }));
    }, [dispatch, startDate, endDate, dateType]);

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

                {/* ── Chart ── */}
                <div className="h-[220px] w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full animate-pulse text-blue-400 font-bold italic text-sm">
                            Đang cập nhật biểu đồ...
                        </div>
                    ) : !data || data.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-300 text-sm">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={data}
                                // barCategoryGap: khoảng cách giữa các nhóm bar (% hoặc px)
                                // barGap: khoảng cách giữa các bar trong cùng nhóm
                                barCategoryGap="20%"
                                margin={{ top: 0, right: 52, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={false}
                                    stroke="#f1f5f9"
                                />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#1e293b', fontSize: 12, fontWeight: 600 }}
                                    width={136}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: '1px solid #e2e8f0',
                                        fontSize: 12,
                                    }}
                                />
                                {/* barSize nhỏ hơn → gap giữa các bar lớn hơn tương đối */}
                                <Bar
                                    dataKey="quantity"
                                    fill="#00a3e0"
                                    radius={[0, 4, 4, 0]}
                                    barSize={11}
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