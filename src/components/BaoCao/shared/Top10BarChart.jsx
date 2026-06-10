import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';

// 🚀 CUSTOM LẠI TRỤC Y
const CustomYAxisTick = (props) => {
    const { x, y, payload, axisWidth, isMobile } = props;
    let textVal = payload.value || "";

    const maxLength = Math.max(8, Math.floor((axisWidth - 15) / (isMobile ? 5.5 : 7.5)));

    if (textVal.length > maxLength) {
        textVal = textVal.substring(0, maxLength) + '...';
    }

    return (
        <text
            x={x - 8}
            y={y}
            dy={4}
            textAnchor="end"
            fill="#1e293b"
            fontSize={isMobile ? 10 : 12}
            fontWeight={600}
        >
            {textVal.replace(/\s/g, '\u00A0')}
        </text>
    );
};

// 🔥 THÊM PROP `isCurrency` VÀO ĐÂY (Mặc định là false để không ảnh hưởng trang Báo cáo Sản lượng)
const Top10BarChart = ({ data, loading, error, title, subTitle, isCurrency = false }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [chartWidth, setChartWidth] = useState(0);
    const chartRef = useRef(null);

    // Bắt sự kiện Resize Mobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 🔥 FIX LAG TUYỆT ĐỐI CHO GLOBAL SIDEBAR
    useEffect(() => {
        if (!chartRef.current) return;

        let timeoutId;
        let isFirstRender = true;

        const observer = new ResizeObserver(entries => {
            const newWidth = entries[0].contentRect.width;
            if (newWidth === 0) return; // Bỏ qua nếu width = 0

            if (isFirstRender) {
                setChartWidth(newWidth); // Lần đầu vào web -> Render ngay lập tức
                isFirstRender = false;
            } else {
                // Khi Sidebar đóng/mở -> Chờ 300ms (thời gian animation của Sidebar) mới cho phép update width
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setChartWidth(newWidth);
                }, 300);
            }
        });

        observer.observe(chartRef.current);
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    const yAxisWidth = useMemo(() => {
        if (!data || data.length === 0 || chartWidth === 0) return 85;

        const maxCharLength = Math.max(...data.map(item => item.name ? item.name.length : 0));
        let calcWidth = maxCharLength * (isMobile ? 5.5 : 7.5) + 15;
        calcWidth = Math.max(70, calcWidth);
        const maxWidth = isMobile ? chartWidth * 0.5 : chartWidth * 0.25;

        return Math.min(calcWidth, maxWidth);
    }, [data, isMobile, chartWidth]);

    if (error) {
        return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">Lỗi: {error}</div>;
    }

    return (
        <div className="w-full bg-[#d9f2ff] p-4 rounded-2xl border border-blue-100 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-3 px-1 tracking-tight">
                {title || 'Biểu đồ Top 10'}
            </h2>

            <div className="bg-white rounded-2xl px-4 pt-3 pb-2 shadow-sm border border-gray-100 relative">
                <p className="text-center text-gray-400 font-semibold mb-3 text-[10px] uppercase tracking-widest">
                    {subTitle || '10 mục có số lượng cao nhất'}
                </p>

                {/* Thêm overflow-hidden để khi Sidebar đẩy ra, biểu đồ chưa kịp thu nhỏ không bị tràn khung */}
                <div className="h-[300px] w-full overflow-hidden flex items-center justify-center" ref={chartRef}>
                    {loading ? (
                        <div className="animate-pulse text-blue-400 font-bold italic text-sm">
                            Đang tải biểu đồ...
                        </div>
                    ) : !data || data.length === 0 ? (
                        <div className="text-gray-400 text-sm italic">
                            Không có dữ liệu trong khoảng thời gian này
                        </div>
                    ) : chartWidth > 0 ? (
                        // 🔥 ĐÃ TĂNG MARGIN RIGHT CHO BIỂU ĐỒ TIỀN (tránh bị cắt mất dãy số dài)
                        <BarChart width={chartWidth} height={300} layout="vertical" data={data} barCategoryGap="15%" margin={{ top: 0, right: isCurrency ? 80 : 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide domain={[0, (dataMax) => Math.round(dataMax * 1.25)]} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                orientation="left"
                                width={yAxisWidth}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                tick={<CustomYAxisTick axisWidth={yAxisWidth} isMobile={isMobile} />}
                            />

                            {/* 🚀 ĐÃ THÊM FORMATTER CHO TOOLTIP (Hiển thị khi di chuột vào) */}
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                formatter={(value) => isCurrency ? new Intl.NumberFormat('vi-VN').format(value) : value}
                            />

                            {/* Tắt animation mặc định để không tốn tài nguyên lúc chớp width */}
                            <Bar dataKey="quantity" fill="#00a3e0" radius={[0, 4, 4, 0]} barSize={isMobile ? 12 : 14} isAnimationActive={false}>
                                {/* 🚀 ĐÃ THÊM FORMATTER CHO LABELLIST (Chữ hiển thị trên cột) */}
                                <LabelList
                                    dataKey="quantity"
                                    position="right"
                                    style={{ fill: '#00a3e0', fontSize: 11, fontWeight: 'bold' }}
                                    offset={8}
                                    formatter={(value) => isCurrency ? new Intl.NumberFormat('vi-VN').format(value) : value}
                                />
                            </Bar>
                        </BarChart>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Top10BarChart;