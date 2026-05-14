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
  const { chart1, chart2, chart3, chart4 } = useSelector((state) => state.dashboard);

  const loadDataForChart = useCallback((chartId, config) => {
    const { startDate, endDate } = calculateDateRange(config.timeRange);
    dispatch(fetchChartData({ chartId, startDate, endDate, groupBy: config.groupBy }));
  }, [dispatch]);

  useEffect(() => {
    if (chart1.data.length === 0) loadDataForChart('chart1', chart1.config);
    if (chart2.data.length === 0) loadDataForChart('chart2', chart2.config);
    if (chart3.data.length === 0) loadDataForChart('chart3', chart3.config);
    if (chart4.data.length === 0) loadDataForChart('chart4', chart4.config);
  }, [
    loadDataForChart,
    chart1.config, chart2.config, chart3.config, chart4.config,
    chart1.data.length, chart2.data.length, chart3.data.length, chart4.data.length,
  ]);

  const handleConfigSave = (chartId, newConfig) => {
    dispatch(updateChartConfig({ chartId, config: newConfig }));
    loadDataForChart(chartId, newConfig);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* ROW 1: Chart 1 + Chart 2 — 2 cột trên md+, 1 cột trên mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <ChartBox
          chartId="chart1"
          title="Số lượng hàng nhận theo loại"
          data={chart1.data}
          loading={chart1.loading}
          config={chart1.config}
          onConfigSave={handleConfigSave}
          keys={['Mới', 'Sửa', 'Bảo hành', 'Làm lại']}
          colors={['#3B82F6', '#F59E0B', '#10B981', '#EF4444']}
          yAxisLabel="Số lượng (Răng / Case)"
        />
        <ChartBox
          chartId="chart2"
          title="Đơn hàng mới vs Khách gửi hàng"
          data={chart2.data}
          loading={chart2.loading}
          config={chart2.config}
          onConfigSave={handleConfigSave}
          keys={['Đơn hàng mới', 'Khách gửi hàng']}
          colors={['#6366F1', '#EC4899']}
          yAxisLabel="Số lượng (Đơn)"
        />
      </div>

      {/* ROW 2: Chart 3 — full width */}
      <div className="mb-4 md:mb-6">
        <ChartBox
          chartId="chart3"
          title="Thực thu kỳ này vs Kỳ trước"
          data={chart3.data}
          loading={chart3.loading}
          config={chart3.config}
          onConfigSave={handleConfigSave}
          variant="line"
          keys={['Kì này', 'Kì trước']}
          colors={['#059669', '#94a3b8']}
          yAxisLabel="Số tiền (VNĐ)"
          isCurrency={true}
        />
      </div>

      {/* ROW 3: Chart 4 — full width */}
      <div>
        <ChartBox
          chartId="chart4"
          title="Doanh thu ghi nhận, Đã thu & Còn nợ"
          data={chart4.data}
          loading={chart4.loading}
          config={chart4.config}
          onConfigSave={handleConfigSave}
          variant="bar"
          keys={['Doanh thu', 'Đã thu', 'Còn nợ']}
          colors={['#6366F1', '#10B981', '#EF4444']}
          yAxisLabel="Số tiền (VNĐ)"
          isCurrency={true}
        />
      </div>

    </div>
  );
};

export default DashboardPage;