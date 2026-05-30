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

  // Luôn fetch mới khi mount (navigate vào trang), không check data.length
  // handleConfigSave đã tự gọi loadDataForChart khi config thay đổi nên không cần effect theo dõi config
  useEffect(() => {
    loadDataForChart('chart1', chart1.config);
    loadDataForChart('chart2', chart2.config);
    loadDataForChart('chart3', chart3.config);
    loadDataForChart('chart4', chart4.config);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          keys={['Mới', 'Hàng sửa', 'Hàng bảo hành', 'Hàng làm lại']}
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
    </div>
  );
};

export default DashboardPage;