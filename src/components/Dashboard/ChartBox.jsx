import React, { useState } from 'react';
import { Paper, Typography, IconButton, CircularProgress } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { ChartFilterModal } from './ChartFilterModal';

// ─────────────────────────────────────────────────────────────────────────────
// CustomTooltip: Hiển thị [Label] [Số], loại bỏ dấu ":"
// ─────────────────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatValue }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-xl text-xs">
                <p className="font-bold text-gray-700 mb-1 border-b pb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="flex gap-2 font-medium" style={{ color: entry.color }}>
                        <span>{entry.name}</span>
                        <span>{formatValue(entry.value)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export const ChartBox = ({ chartId, title, data, loading, keys, colors, yAxisLabel, config, onConfigSave, isCurrency = false }) => {
    const [openFilter, setOpenFilter] = useState(false);
    const safeData = Array.isArray(data) ? data : [];

    // Kiểm tra có cần cuộn hay không (nếu > 10 ngày)
    const isScrollable = safeData.length > 10;
    const minWidth = isScrollable ? `${(safeData.length / 10) * 100}%` : '100%';

    const formatValue = (val) => {
        if (isCurrency) return new Intl.NumberFormat('vi-VN').format(val);
        return val;
    };

    return (
        <Paper className="p-4 rounded-xl shadow-md w-full h-[360px] flex flex-col bg-white relative">
            {/* 1. Header: Tiêu đề và nút cài đặt */}
            <div className="flex justify-between items-center mb-1">
                <Typography variant="h6" className="font-bold text-gray-700">{title}</Typography>
                <IconButton onClick={() => setOpenFilter(true)} size="small" className="bg-gray-50 hover:bg-gray-200">
                    <TuneIcon fontSize="small" color="action" />
                </IconButton>
            </div>

            {/* 2. Dòng hiển thị trạng thái bộ lọc và đơn vị tính (MỚI) */}
            <div className="flex justify-between items-center mb-3 px-1">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {config.timeRange}
                </span>
                <span className="text-[10px] font-bold text-gray-400 italic uppercase tracking-wider">
                    Đơn vị: {yAxisLabel}
                </span>
            </div>

            {/* 3. Vùng biểu đồ */}
            <div className="flex-1 w-full relative mb-1" style={{ minHeight: '240px' }}>
                {loading && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded">
                        <CircularProgress size={30} color="primary" />
                    </div>
                )}

                <div
                    className={`w-full h-full custom-scrollbar pb-2 ${isScrollable ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'
                        }`}
                >
                    <div style={{ width: minWidth, height: '100%', minHeight: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={safeData} margin={{ top: 10, right: 30, left: isCurrency ? 20 : 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-[10px] font-medium fill-gray-400"
                                    interval={0}
                                />
                                <YAxis
                                    tickFormatter={formatValue}
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-[10px] font-medium fill-gray-400"
                                    width={isCurrency ? 80 : 40}
                                />

                                <Tooltip
                                    content={
                                        <CustomTooltip
                                            formatValue={formatValue}
                                        />
                                    }
                                    cursor={{ fill: '#f8fafc' }}
                                />

                                {config.showLegend && <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />}

                                {keys.map((key, index) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={colors[index % colors.length]} name={key} barSize={32}>
                                        {/* Ẩn số trên cột nếu là biểu đồ doanh số (isCurrency) */}
                                        {config.showDataLabels && !isCurrency && (
                                            <LabelList
                                                dataKey={key}
                                                position="inside"
                                                fill="#fff"
                                                fontSize={10}
                                                fontWeight="bold"
                                                formatter={formatValue}
                                            />
                                        )}
                                    </Bar>
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <ChartFilterModal
                open={openFilter}
                onClose={() => setOpenFilter(false)}
                chartTitle={title}
                initialConfig={config}
                onSave={(newConfig) => {
                    onConfigSave(chartId, newConfig);
                    setOpenFilter(false);
                }}
            />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f8fafc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </Paper>
    );
};