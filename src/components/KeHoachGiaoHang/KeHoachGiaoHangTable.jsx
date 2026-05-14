import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDonHangAll } from "../../redux/slices/donHangSlice";
import {
  format,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import ThongKeKeHoachGiaoHang from "./ThongKeKeHoachGiaoHang";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { allData: data, loading } = useSelector((state) => state.donHang);

  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  // 🔥 FILTER STATE
  const [filterType, setFilterType] = useState("all");
  // all | today | range | overdue

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDonHangAll());
  }, [dispatch]);

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const navigate = useNavigate();

  // ================= FILTER LOGIC =================
  const filteredOrders = useMemo(() => {
    let result = [...data];

    result = result.filter((order) => {
      const henGiaoDate = parseISO(order.henGiao);

      const overdue =
        isBefore(henGiaoDate, todayStart) && order.trangThai !== "Hoàn thành";

      const dueToday = isToday(henGiaoDate);

      const from = fromDate ? startOfDay(new Date(fromDate)) : null;

      const to = toDate ? endOfDay(new Date(toDate)) : null;

      const inRange = from && to && henGiaoDate >= from && henGiaoDate <= to;

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

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    const end = start + rowsPerPage;

    return filteredOrders.slice(start, end);
  }, [filteredOrders, page, rowsPerPage]);

  // reset page khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [filterType, fromDate, toDate, showUrgentOnly]);

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
        <ThongKeKeHoachGiaoHang
          countToday={countToday}
          countOverdue={countOverdue}
          countDone={countDone}
        ></ThongKeKeHoachGiaoHang>

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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 🔥 Responsive wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left whitespace-nowrap">
                    Số đơn hàng
                  </th>

                  <th className="p-3 text-left whitespace-nowrap">
                    Khách hàng
                  </th>

                  <th className="p-3 text-left whitespace-nowrap">Bác sĩ</th>

                  <th className="p-3 text-left whitespace-nowrap">Bệnh nhân</th>

                  <th className="p-3 text-left whitespace-nowrap">Hẹn giao</th>

                  <th className="p-3 text-left whitespace-nowrap">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => {
                  const date = parseISO(order.henGiao);

                  const overdue =
                    isBefore(date, todayStart) &&
                    order.trangThai !== "Hoàn thành";

                  const today = isToday(date);

                  return (
                    <tr key={order._id} className="border-t hover:bg-gray-50">
                      {/* SỐ ĐƠN */}
                      <td className="p-3 font-medium whitespace-nowrap">
                        <Button
                          variant="text"
                          onClick={() => {
                            navigate(`/donhang/${order._id}/edit`);
                          }}
                        >
                          {order.maDonHang ||
                            `TAN${order._id
                              .substring(order._id.length - 8)
                              .toUpperCase()}`}
                        </Button>
                      </td>

                      {/* KHÁCH HÀNG */}
                      <td className="p-3 min-w-[180px]">
                        <div className="font-medium break-words">
                          {order.nhaKhoa?.hoVaTen}
                        </div>
                      </td>

                      {/* BÁC SĨ */}
                      <td className="p-3 min-w-[150px]">
                        <div className="break-words">
                          {order.bacSi?.hoVaTen}
                        </div>
                      </td>

                      {/* BỆNH NHÂN */}
                      <td className="p-3 min-w-[150px]">
                        <div className="break-words">
                          {order.benhNhan?.hoVaTen}
                        </div>
                      </td>

                      {/* HẸN GIAO */}
                      <td className="p-3 whitespace-nowrap">
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
                            <span className="text-xs text-red-600">
                              Trễ hẹn
                            </span>
                          )}

                          {today && (
                            <span className="text-xs text-orange-500">
                              Hôm nay
                            </span>
                          )}
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
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
                    <td colSpan="6" className="text-center p-6 text-gray-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* ================= PAGINATION ================= */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-4 border-t bg-white">
              {/* LEFT */}
              <div className="flex items-center gap-2 text-sm">
                <span>Hiển thị</span>

                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <span>/ {filteredOrders.length} đơn</span>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={`px-3 py-1 rounded border ${
                    page === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Trước
                </button>

                <span className="text-sm">
                  Trang {page} / {totalPages || 1}
                </span>

                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`px-3 py-1 rounded border ${
                    page === totalPages || totalPages === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeHoachGiaoHangTable;
