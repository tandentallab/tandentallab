import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTopProductsBaoCao } from '../../redux/slices/baoCaoSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const BaoCaoSanLuongChart = ({ timeRange, dateType, customStart, customEnd }) => {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.baoCao);

    useEffect(() => {
        dispatch(fetchTopProductsBaoCao({
            timeRange,
            dateType,
            customStart: timeRange === 'custom' ? customStart : null,
            customEnd: timeRange === 'custom' ? customEnd : null
        }));
    }, [dispatch, timeRange, dateType, customStart, customEnd]);

    if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">Lỗi: {error}</div>;

    return (
        <div className="w-full bg-[#d9f2ff] p-6 rounded-2xl border border-blue-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6 px-2 tracking-tight">Sản lượng theo thời gian</h2>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative min-h-[400px]">
                <h3 className="text-center text-gray-400 font-bold mb-8 text-[10px] uppercase tracking-widest">Top 10 sản phẩm có số lượng cao nhất</h3>

                <div className="h-[320px] w-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full animate-pulse text-blue-400 font-bold italic text-sm">Đang cập nhật biểu đồ...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={data} margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#1e293b', fontSize: 13, fontWeight: 600 }} width={140} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="quantity" fill="#00a3e0" radius={[0, 4, 4, 0]} barSize={15}>
                                    <LabelList dataKey="quantity" position="right" style={{ fill: '#00a3e0', fontSize: 12, fontWeight: 'bold' }} offset={10} />
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