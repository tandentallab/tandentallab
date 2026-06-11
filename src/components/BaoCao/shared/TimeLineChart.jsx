import React, { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const formatCurrency = (val) => new Intl.NumberFormat('vi-VN').format(val || 0);

const CustomizedLabel = (props) => {
    const { x, y, value } = props;
    if (value === undefined || value === null) return null;

    const formattedVal = formatCurrency(value);
    const boxWidth = Math.max(formattedVal.length * 6.5 + 12, 30);
    const boxHeight = 20;

    return (
        <g>
            <rect
                x={x - boxWidth / 2}
                y={y - boxHeight - 8}
                width={boxWidth}
                height={boxHeight}
                fill="#0ea5e9"
                rx={4}
                stroke="#ffffff"
                strokeWidth={1.5}
            />
            <text
                x={x}
                y={y - 13}
                fill="#ffffff"
                fontSize={10.5}
                fontWeight="bold"
                textAnchor="middle"
            >
                {formattedVal}
            </text>
        </g>
    );
};

const TimeLineChart = ({ data, loading }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const wrapperRef = useRef(null);

    // 🔥 LOGIC FIX LAG TUYỆT ĐỐI (Đã kiểm tra kỹ an toàn)
    useEffect(() => {
        if (!wrapperRef.current) return;

        let timeoutId;
        let isFirstRender = true;

        const observer = new ResizeObserver(entries => {
            const newWidth = entries[0].contentRect.width;
            if (newWidth === 0) return;

            if (isFirstRender) {
                setContainerWidth(newWidth);
                isFirstRender = false;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    setContainerWidth(newWidth);
                }, 300);
            }
        });

        observer.observe(wrapperRef.current);
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    // Mobile (< 480px): mỗi điểm tối thiểu 72px để label không đè nhau
    // Tablet trở lên: tối thiểu 80px, hiển thị tối đa 10 điểm vừa khung
    const isMobile = containerWidth > 0 && containerWidth < 480;
    const MIN_ITEM_WIDTH = isMobile ? 72 : 80;
    const MAX_VISIBLE_ITEMS = isMobile ? 5 : 10;

    const itemWidth = containerWidth > 0
        ? Math.max(containerWidth / MAX_VISIBLE_ITEMS, MIN_ITEM_WIDTH)
        : MIN_ITEM_WIDTH;

    // Nếu ít điểm hơn MAX_VISIBLE_ITEMS thì giãn đều ra full width, ngược lại scroll
    const finalChartWidth = data.length > MAX_VISIBLE_ITEMS
        ? data.length * itemWidth
        : containerWidth;

    return (
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            {/* Giữ ref ở ngoài cùng để đo Width liên tục */}
            <div ref={wrapperRef} className="w-full overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar">

                {loading ? (
                    <div className="h-[260px] w-full flex items-center justify-center animate-pulse text-blue-400 font-bold italic text-sm">
                        Đang thiết lập biểu đồ...
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-[260px] w-full flex items-center justify-center text-gray-400 text-sm italic">
                        Không có dữ liệu doanh số
                    </div>
                ) : containerWidth > 0 ? (
                    // 🔥 BỎ RESPONSIVE CONTAINER, TRUYỀN THẲNG WIDTH VÀO LINECHART
                    <div style={{ width: finalChartWidth, height: 260 }}>
                        <LineChart width={finalChartWidth} height={260} data={data} margin={{ top: 36, right: isMobile ? 16 : 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="timeLabel"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: isMobile ? 11 : 12, fontWeight: 500 }}
                                dy={10}
                                interval={0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 11 }}
                                tickFormatter={(val) => formatCurrency(val)}
                                width={isMobile ? 70 : 85}
                                dx={-5}
                            />
                            <Line
                                type="linear"
                                dataKey="doanhSo"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                                dot={{ r: isMobile ? 3 : 4, fill: '#0ea5e9', strokeWidth: 0 }}
                                label={<CustomizedLabel />}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </div>
                ) : (
                    // Tránh giật layout lúc mili-giây đầu chưa đo được width
                    <div className="h-[260px] w-full" />
                )}
            </div>

            <style jsx="true">{`
                .custom-scrollbar {
                    -webkit-overflow-scrolling: touch;
                    scroll-snap-type: x proximity;
                }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                @media (max-width: 480px) {
                    .custom-scrollbar::-webkit-scrollbar { height: 4px; }
                }
            `}</style>
        </div>
    );
};

export default TimeLineChart;