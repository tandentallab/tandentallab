import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDonHang } from "../../redux/slices/donHangSlice";
import {
  format,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.donHang);

  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // 🔥 FILTER STATE
  const [filterType, setFilterType] = useState("all");
  // all | today | range | overdue

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    dispatch(fetchDonHang());
  }, [dispatch]);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  // ================= FILTER LOGIC =================
  const filteredOrders = useMemo(() => {
    let result = [...data];

    result = result.filter((order) => {
      const henGiaoDate = parseISO(order.henGiao);

      const overdue =
        isBefore(henGiaoDate, todayStart) && order.trangThai !== "Hoàn thành";

      const dueToday = isToday(henGiaoDate);

      const inRange =
        fromDate &&
        toDate &&
        isAfter(henGiaoDate, startOfDay(new Date(fromDate))) &&
        isBefore(henGiaoDate, endOfDay(new Date(toDate)));

      // 🔥 FILTER TYPE
      if (filterType === "today") return dueToday;
      if (filterType === "overdue") return overdue;
      if (filterType === "range") return inRange;

      return true;
    });

    // 🔥 FILTER ĐƠN GẤP
    if (showUrgentOnly) {
      result = result.filter((order) => {
        const henGiaoDate = parseISO(order.henGiao);

        return (
          isToday(henGiaoDate) ||
          (isBefore(henGiaoDate, todayStart) &&
            order.trangThai !== "Hoàn thành")
        );
      });
    }

    return result;
  }, [data, showUrgentOnly, filterType, fromDate, toDate]);

  // ================= COUNT =================
  const countToday = data.filter((o) => isToday(parseISO(o.henGiao))).length;

  const countOverdue = data.filter(
    (o) =>
      isBefore(parseISO(o.henGiao), todayStart) && o.trangThai !== "Hoàn thành"
  ).length;

  const countDone = data.filter((o) => o.trangThai === "Hoàn thành").length;

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER STATS ================= */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{countToday}</div>
            <div>Giao hôm nay</div>
          </div>

          <div className="bg-red-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{countOverdue}</div>
            <div>Trễ</div>
          </div>

          <div className="bg-green-600 text-white p-4 rounded-lg">
            <div className="text-2xl font-bold">{countDone}</div>
            <div>Hoàn thành</div>
          </div>
        </div>

        {/* ================= FILTER ================= */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="all">Tất cả</option>
            <option value="today">Giao hôm nay</option>
            <option value="overdue">Trễ hẹn</option>
            <option value="range">Khoảng ngày</option>
          </select>

          {filterType === "range" && (
            <>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border px-2 py-2 rounded"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border px-2 py-2 rounded"
              />
            </>
          )}

          {/* Toggle */}
          <label className="flex items-center gap-2 ml-auto">
            <span>Đơn gấp</span>
            <input
              type="checkbox"
              checked={showUrgentOnly}
              onChange={() => setShowUrgentOnly(!showUrgentOnly)}
            />
          </label>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Bác sĩ</th>
                <th className="p-3 text-left">Bệnh nhân</th>
                <th className="p-3 text-left">Hẹn giao</th>
                <th className="p-3 text-left">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const date = parseISO(order.henGiao);

                const overdue =
                  isBefore(date, todayStart) &&
                  order.trangThai !== "Hoàn thành";

                const today = isToday(date);

                return (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {order.nhaKhoa?.hoVaTen}
                    </td>

                    <td className="p-3">{order.bacSi?.hoVaTen}</td>

                    <td className="p-3">{order.benhNhan?.hoVaTen}</td>

                    <td className="p-3">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold ${
                            overdue
                              ? "text-red-600"
                              : today
                              ? "text-orange-500"
                              : ""
                          }`}
                        >
                          {format(date, "dd/MM/yyyy HH:mm")}
                        </span>

                        {overdue && (
                          <span className="text-xs text-red-600">Trễ hẹn</span>
                        )}

                        {today && (
                          <span className="text-xs text-orange-500">
                            Hôm nay
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          order.trangThai === "Hoàn thành"
                            ? "bg-green-100 text-green-700"
                            : order.trangThai === "Đang sản xuất"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {order.trangThai}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-6 text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KeHoachGiaoHangTable;
