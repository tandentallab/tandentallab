import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDonHangAll } from "../../redux/slices/donHangSlice";
import {
  format,
  isToday,
  isBefore,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import ThongKeKeHoachGiaoHang from "./ThongKeKeHoachGiaoHang";
import { useNavigate } from "react-router-dom";
import { exportKeHoachGiaoHangToExcel } from "../../utils/exportToExcel";
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiMoreVertical,
  FiDownload,
  FiPrinter,
} from "react-icons/fi";

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { allData: data, loading } = useSelector((state) => state.donHang);

  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("Chờ xử lý");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDonHangAll());
  }, [dispatch]);

  const todayStart = startOfDay(new Date());

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

      if (filterType === "today") return dueToday;
      if (filterType === "overdue") return overdue;
      if (filterType === "range") return inRange;
      return true;
    });

    // 🔥 FILTER TRẠNG THÁI
    if (filterStatus !== "all") {
      result = result.filter((order) => order.trangThai === filterStatus);
    }

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

    // 🔥 SEARCH
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (o) =>
          (o.maDonHang && o.maDonHang.toLowerCase().includes(q)) ||
          (o.nhaKhoa?.hoVaTen && o.nhaKhoa.hoVaTen.toLowerCase().includes(q)) ||
          (o.bacSi?.hoVaTen && o.bacSi.hoVaTen.toLowerCase().includes(q)) ||
          (o.benhNhan?.hoVaTen && o.benhNhan.hoVaTen.toLowerCase().includes(q))
      );
    }

    return result;
  }, [
    data,
    showUrgentOnly,
    filterType,
    filterStatus,
    fromDate,
    toDate,
    searchText,
  ]);

  // ================= PAGINATION =================
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  useEffect(() => {
    setPage(1);
  }, [filterType, fromDate, toDate, showUrgentOnly, filterStatus, searchText]);

  // ================= COUNT =================
  const countToday = data.filter((o) => isToday(parseISO(o.henGiao))).length;
  const countOverdue = data.filter(
    (o) =>
      isBefore(parseISO(o.henGiao), todayStart) && o.trangThai !== "Hoàn thành"
  ).length;
  const countDone = data.filter((o) => o.trangThai === "Hoàn thành").length;

  if (loading)
    return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

  // Hàm format danh sách sản phẩm của đơn hàng
  const formatDanhSachSanPham = (danhSachSanPham = []) => {
    // Mapping loại đơn
    const loaiDonMap = {
      Mới: "",
      "Hàng sửa": "Sửa",
      "Hàng bảo hành": "Bảo hành",
      "Hàng làm lại": "Làm lại",
    };

    // Hàm format vị trí răng
    const formatViTri = (viTriArr) => {
      if (!viTriArr || viTriArr.length === 0) return "";
      return viTriArr
        .map((v) =>
          v.kieu === "Rời"
            ? v.soRang.join(", ")
            : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
        )
        .join("; ");
    };

    return danhSachSanPham
      .map((item) => {
        const loaiDon = loaiDonMap[item.loaiDon] || "";

        const soLuong = item.soLuong || 1;

        // Tên sản phẩm
        const tenSanPham = item.sanPham?.tenSanPham || item.sanPham?.ten || "";

        // Vị trí
        const viTri = formatViTri(item.viTri);

        // Màu
        const mau = item.mau ? `(${item.mau})` : "";

        // Ghép chuỗi
        return [loaiDon, soLuong, tenSanPham, viTri, mau]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
      })
      .join(", ");
  };

  const handleExportExcel = async () => {
    await exportKeHoachGiaoHangToExcel(filteredOrders, formatDanhSachSanPham);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* ================= HEADER STATS ================= */}
        <div className="print:hidden">
          <ThongKeKeHoachGiaoHang
            countToday={countToday}
            countOverdue={countOverdue}
            countDone={countDone}
          />
        </div>

        {/* ================= TOOLBAR ================= */}
        <div className="flex items-center gap-2 mb-2 px-1 print:hidden">
          {/* Filter icon toggle */}
          <button
            onClick={() => setShowFilterBar((v) => !v)}
            className={`p-2 rounded hover:bg-gray-200 transition ${showFilterBar ? "text-blue-600" : "text-gray-500"
              }`}
            title="Lọc"
          >
            <FiFilter size={18} />
          </button>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <FiSearch
              size={15}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 pr-3 py-1.5 border rounded-full text-sm bg-white w-52 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Actions */}
          <button
            onClick={handleExportExcel}
            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition"
            title="Xuất Excel"
          >
            <FiDownload size={17} />
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition"
            title="In danh sách"
          >
            <FiPrinter size={17} />
          </button>
          <button
            onClick={() => dispatch(fetchDonHangAll())}
            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition"
            title="Làm mới"
          >
            <FiRefreshCw size={17} />
          </button>
        </div>

        {/* ================= FILTER BAR ================= */}
        {showFilterBar && (
          <div className="flex flex-wrap gap-2 mb-3 px-1 py-2 bg-white rounded border text-sm print:hidden">
            {/* Loại lọc ngày */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border px-2 py-1.5 rounded text-sm"
            >
              <option value="all">Tất cả ngày</option>
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
                  className="border px-2 py-1.5 rounded text-sm"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border px-2 py-1.5 rounded text-sm"
                />
              </>
            )}

            {/* Lọc trạng thái */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-2 py-1.5 rounded text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Chờ xử lý">Chờ xử lý</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>

            {/* Đơn gấp */}
            {/* <label className="flex items-center gap-1.5 ml-auto cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUrgentOnly}
                onChange={() => setShowUrgentOnly(!showUrgentOnly)}
                className="accent-red-500"
              />
              <span className="text-red-600 font-medium">Đơn gấp</span>
            </label> */}
          </div>
        )}

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-lg shadow overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Nhận lúc
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Số
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Hẹn giao
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Bác sĩ
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Bệnh nhân
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Răng
                  </th>{" "}
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Ghi chú
                  </th>
                  {/* <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Tiến độ
                  </th>
                  <th className="px-4 py-3 text-left text-blue-600 font-semibold whitespace-nowrap text-xs">
                    Tiến độ sản xuất
                  </th> */}
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => {
                  const date = parseISO(order.henGiao);
                  const overdue =
                    isBefore(date, todayStart) &&
                    order.trangThai !== "Hoàn thành";
                  const today = isToday(date);

                  const maDon =
                    order.maDonHang ||
                    `TAN${order._id
                      .substring(order._id.length - 8)
                      .toUpperCase()}`;

                  return (
                    <tr
                      key={order._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* NHẬN LÚC */}
                      <td className="px-4 py-2.5 text-gray-600 font-bold whitespace-nowrap text-xs">
                        {order.ngayNhan
                          ? format(parseISO(order.ngayNhan), "dd/MM/yyyy HH:mm")
                          : "—"}
                      </td>
                      {/* SỐ ĐƠN */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/donhang/${order._id}/edit`)}
                          className={`font-medium text-sm hover:underline ${overdue
                            ? "text-red-500"
                            : today
                              ? "text-blue-600"
                              : "text-gray-700"
                            }`}
                        >
                          {maDon}
                        </button>
                      </td>

                      {/* HẸN GIAO */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`text-sm font-medium ${overdue
                            ? "text-red-500"
                            : today
                              ? "text-gray-800"
                              : "text-gray-700"
                            }`}
                        >
                          {format(date, "dd/MM/yyyy HH:mm")}
                        </span>
                      </td>

                      {/* KHÁCH HÀNG */}
                      <td className="px-4 py-2.5 min-w-[180px]">
                        <span className="text-gray-800 text-sm">
                          {order.nhaKhoa?.hoVaTen}
                        </span>
                      </td>

                      {/* BÁC SĨ */}
                      <td className="px-4 py-2.5 min-w-[120px] text-gray-700 text-sm">
                        {order.bacSi?.hoVaTen}
                      </td>

                      {/* BỆNH NHÂN */}
                      <td className="px-4 py-2.5 min-w-[140px] text-gray-700 text-sm">
                        {order.benhNhan?.hoVaTen}
                      </td>
                      <td className="px-4 py-2.5 min-w-[140px] text-gray-700 text-sm">
                        {formatDanhSachSanPham(order.danhSachSanPham)}
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${order.trangThai === "Hoàn thành"
                            ? "text-green-700"
                            : order.trangThai === "Đang sản xuất"
                              ? "text-blue-700"
                              : "text-gray-600"
                            }`}
                        >
                          {order.trangThai
                            ? order.trangThai.length > 10
                              ? order.trangThai.substring(0, 10) + "..."
                              : order.trangThai
                            : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 min-w-[140px] text-gray-700 text-sm">
                        {order.ghiChuChung}
                      </td>

                      {/* TIẾN ĐỘ */}
                      {/* <td className="px-4 py-2.5 whitespace-nowrap min-w-[100px]">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400 rounded-full"
                            style={{ width: `${order.tienDo || 0}%` }}
                          />
                        </div>
                      </td> */}

                      {/* TIẾN ĐỘ SẢN XUẤT */}
                      {/* <td className="px-4 py-2.5 whitespace-nowrap min-w-[120px]">
                        <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-300 rounded-full"
                            style={{ width: `${order.tienDoSanXuat || 0}%` }}
                          />
                        </div>
                      </td> */}
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-10 text-gray-400 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ================= PAGINATION ================= */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 px-4 py-3 border-t bg-white text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span>Hiển thị</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>/ {filteredOrders.length} đơn</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Trước
                </button>
                <span className="px-2 text-gray-600">
                  Trang {page} / {totalPages || 1}
                </span>
                <button
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= PRINT VIEW ================= */}
        <div id="print-section" className="hidden print:block w-full">
          <style>{`
            @media print {
              @page { size: A4 landscape; margin: 10mm; }
              body * { visibility: hidden; }
              #print-section, #print-section * { visibility: visible; }
              #print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
              }
            }
          `}</style>
          <h2 className="text-xl font-bold text-center mb-4 uppercase">Kế Hoạch Giao Hàng</h2>
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 text-center font-semibold">Nhận lúc</th>
                <th className="border border-black px-2 py-1 text-center font-semibold">Số</th>
                <th className="border border-black px-2 py-1 text-center font-semibold">Khách hàng</th>
                <th className="border border-black px-2 py-1 text-center font-semibold">Bệnh nhân</th>
                <th className="border border-black px-2 py-1 text-center font-semibold w-1/4">Răng</th>
                <th className="border border-black px-2 py-1 text-center font-semibold">Hẹn giao</th>
                <th className="border border-black px-2 py-1 text-center font-semibold w-1/6">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const maDon = order.maDonHang || `TAN${order._id.substring(order._id.length - 8).toUpperCase()}`;
                return (
                  <tr key={order._id}>
                    <td className="border border-black px-2 py-1 text-center text-xs">
                      {order.ngayNhan ? format(parseISO(order.ngayNhan), "dd/MM/yyyy HH:mm") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-semibold text-xs">{maDon}</td>
                    <td className="border border-black px-2 py-1 text-xs">{order.nhaKhoa?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1 text-xs">{order.benhNhan?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1 text-xs">{formatDanhSachSanPham(order.danhSachSanPham)}</td>
                    <td className="border border-black px-2 py-1 text-center text-xs">
                      {order.henGiao ? format(parseISO(order.henGiao), "dd/MM/yyyy HH:mm") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1 text-xs">{order.ghiChuChung}</td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="border border-black text-center py-4 text-xs">
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
