import React from "react";
import { FiPackage, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

const ThongKeKeHoachGiaoHang = ({ countToday, countOverdue, countDone }) => {
  const StatCard = ({ count, title, subTitle, color, icon: Icon }) => (
    <div
      className="flex-1 min-w-[240px] bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-default flex items-center justify-between"
      style={{ borderLeftColor: color }}
    >
      <div className="overflow-hidden">
        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
          {title}
        </div>
        <div className="text-gray-900 text-2xl font-extrabold leading-tight">
          {count.toLocaleString()}
        </div>
        <div
          className="text-[12px] font-medium mt-1 flex items-center gap-1"
          style={{ color: color }}
        >
          <span className="text-[8px]">●</span> {subTitle}
        </div>
      </div>

      <div
        className="p-2 rounded-xl flex items-center justify-center ml-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={22} style={{ color: color }} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap gap-3 w-full py-2">
      {/* Giao hôm nay */}
      <StatCard
        count={countToday}
        title="Giao hôm nay"
        subTitle="Đơn cần xử lý ngay"
        color="#2563EB" // Blue-600
        icon={FiPackage}
      />

      {/* Trễ hạn */}
      <StatCard
        count={countOverdue}
        title="Trễ hạn"
        subTitle="Cần ưu tiên xử lý"
        color="#DC2626" // Red-600
        icon={FiAlertTriangle}
      />

      {/* Hoàn thành */}
      <StatCard
        count={countDone}
        title="Hoàn thành"
        subTitle="Đã giao thành công"
        color="#059669" // Green-600
        icon={FiCheckCircle}
      />
    </div>
  );
};

export default ThongKeKeHoachGiaoHang;
