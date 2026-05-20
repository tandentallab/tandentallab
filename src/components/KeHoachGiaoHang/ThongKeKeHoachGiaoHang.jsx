import React from "react";
import { FiPackage, FiAlertTriangle, FiSend } from "react-icons/fi";

const ThongKeKeHoachGiaoHang = ({ countToday, countOverdue, countDone }) => {
  return (
    <div className="flex w-full mb-4 rounded-lg overflow-hidden shadow-md">
      {/* Giao hôm nay */}
      <div className="flex-1 bg-blue-700 text-white px-5 py-3 flex items-center gap-3">
        <div>
          <div className="text-3xl font-extrabold leading-none">
            {countToday}
          </div>
          <div className="text-sm font-semibold mt-0.5">Giao hôm nay</div>
        </div>
      </div>

      {/* Trễ hạn */}
      <div className="flex-1 bg-red-600 text-white px-5 py-3 flex items-center gap-3">
        <div>
          <div className="text-3xl font-extrabold leading-none">
            {countOverdue}
          </div>
          <div className="text-sm font-semibold mt-0.5">Trễ</div>
        </div>
      </div>

      {/* Gởi thử */}
      <div className="flex-1 bg-green-700 text-white px-5 py-3 flex items-center gap-3">
        <div>
          <div className="text-3xl font-extrabold leading-none">
            {countDone}
          </div>
          <div className="text-sm font-semibold mt-0.5">Hoàn thành</div>
        </div>
      </div>
    </div>
  );
};

export default ThongKeKeHoachGiaoHang;
