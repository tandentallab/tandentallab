import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { fetchChartData, updateChartConfig } from '../../redux/slices/dashboardSlice';
import { ChartBox } from './ChartBox';

dayjs.extend(utc);
dayjs.extend(timezone);

const VN_TZ = 'Asia/Ho_Chi_Minh'; // UTC+7

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH: tính startDate / endDate theo múi giờ Việt Nam.
// Trả về YYYY-MM-DD — backend sẽ chuẩn hóa 00:00 / 23:59 giờ VN.
// ─────────────────────────────────────────────────────────────────────────────
const calculateDateRange = (timeRange) => {
  const now = dayjs().tz(VN_TZ);
  let start = now;
  let end = now;

  switch (timeRange) {
    case 'Hôm nay':
      start = now.startOf('day');
      break;
    case 'Hôm qua':
      start = now.subtract(1, 'day').startOf('day');
      end = now.subtract(1, 'day');
      break;
    case 'Tuần này':
      // Tuần bắt đầu Thứ Hai (ISO week)
      start = now.startOf('week').add(1, 'day');
      break;
    case 'Tháng này':
      start = now.startOf('month');
      break;
    case 'Năm nay':
      start = now.startOf('year');
      break;
    case 'Trong vòng 7 ngày':
      start = now.subtract(7, 'day').startOf('day');
      break;
    case 'Trong vòng 10 ngày':
      start = now.subtract(10, 'day').startOf('day');
      break;
    case 'Trong vòng 30 ngày':
      start = now.subtract(30, 'day').startOf('day');
      break;
    default:
      start = now.subtract(7, 'day').startOf('day');
  }

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
  };
};

// ─────────────────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const dispatch = useDispatch();
  // Lấy thêm chart3 từ Redux
  const { chart1, chart2, chart3 } = useSelector((state) => state.dashboard);

  const loadDataForChart = useCallback((chartId, config) => {
    const { startDate, endDate } = calculateDateRange(config.timeRange);
    dispatch(fetchChartData({ chartId, startDate, endDate, groupBy: config.groupBy }));
  }, [dispatch]);

  useEffect(() => {
    if (chart1.data.length === 0) loadDataForChart('chart1', chart1.config);
    if (chart2.data.length === 0) loadDataForChart('chart2', chart2.config);
    if (chart3.data.length === 0) loadDataForChart('chart3', chart3.config); // Fetch Chart 3
  }, [loadDataForChart, chart1.config, chart2.config, chart3.config, chart1.data.length, chart2.data.length, chart3.data.length]);

  const handleConfigSave = (chartId, newConfig) => {
    dispatch(updateChartConfig({ chartId, config: newConfig }));
    loadDataForChart(chartId, newConfig);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1 và Chart 2 giữ nguyên */}
        <ChartBox
          chartId="chart1"
          title="Hàng nhận theo loại"
          data={chart1.data} loading={chart1.loading} config={chart1.config} onConfigSave={handleConfigSave}
          keys={['Mới', 'Sửa', 'Bảo hành', 'Làm lại']} colors={['#3B82F6', '#F59E0B', '#10B981', '#EF4444']}
          yAxisLabel="Số lượng (Răng/Case)"
        />
        <ChartBox
          chartId="chart2"
          title="Tình hình nhận hàng"
          data={chart2.data} loading={chart2.loading} config={chart2.config} onConfigSave={handleConfigSave}
          keys={['Đơn hàng mới', 'Khách gửi hàng']} colors={['#6366F1', '#EC4899']}
          yAxisLabel="Số lượng (Đơn)"
        />
      </div>

      {/* 👉 THÊM CHART 3 VÀO ĐÂY: FULL WIDTH */}
      <div className="grid grid-cols-1 gap-6">
        <ChartBox
          chartId="chart3"
          title="Doanh số thực thu (theo phiếu thu)"
          data={chart3.data} loading={chart3.loading} config={chart3.config} onConfigSave={handleConfigSave}
          keys={['Thực thu']} colors={['#059669']} // Màu xanh lá (Emerald) hợp với tài chính
          yAxisLabel="Số tiền (VNĐ)"
          isCurrency={true} // Truyền prop báo hiệu đây là chart tiền tệ
        />
      </div>
    </div>
  );
};

export default DashboardPage;