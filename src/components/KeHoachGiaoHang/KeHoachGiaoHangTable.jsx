import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDonHang, fetchMoreDonHang } from "../../redux/slices/donHangSlice";
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
// Đảm bảo đường dẫn import DonHangDetailPanel đúng với cấu trúc thư mục của bạn
import DonHangDetailPanel from "../DonHang/DonHangDetailPanel";

const ROWS_PER_PAGE = 20;

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { data, loading, loadingMore, pagination } = useSelector((state) => state.donHang);

  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("Chờ xử lý");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [page, setPage] = useState(1);

  // State quản lý việc mở panel chi tiết đơn hàng
  const [selectedDonHang, setSelectedDonHang] = useState(null);

  const sentinelRef = useRef(null);

  const todayStart = startOfDay(new Date());

  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [filterType, fromDate, toDate, filterStatus]);

  // Build params và dispatch load
  const loadData = useCallback(() => {
    const params = { page, limit: ROWS_PER_PAGE };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filterStatus !== "all") params.trangThai = filterStatus;

    const today = startOfDay(new Date());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filterType === "today") {
      params.henGiaoFrom = today.toISOString();
      params.henGiaoTo = tomorrow.toISOString();
    } else if (filterType === "overdue") {
      params.henGiaoTo = today.toISOString();
    } else if (filterType === "range") {
      if (fromDate) params.henGiaoFrom = startOfDay(new Date(fromDate)).toISOString();
      if (toDate) params.henGiaoTo = endOfDay(new Date(toDate)).toISOString();
    }

    if (page === 1) {
      dispatch(fetchDonHang(params));
    } else {
      dispatch(fetchMoreDonHang(params));
    }
  }, [dispatch, page, debouncedSearch, filterStatus, filterType, fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Infinite scroll: khi sentinel vào viewport thì tải trang tiếp theo
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && page < (pagination?.totalPages || 1) && !loadingMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, pagination?.totalPages, loadingMore, loading]);

  // ================= FILTER LOGIC (client-side phần còn lại) =================
  const filteredOrders = useMemo(() => {
    let result = [...data];

    // Khi lọc "overdue" mà không chọn trạng thái cụ thể, loại bỏ đơn Hoàn thành
    if (filterType === "overdue" && filterStatus === "all") {
      result = result.filter((o) => o.trangThai !== "Hoàn thành");
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

    return result;
  }, [data, filterType, filterStatus, showUrgentOnly, todayStart]);

  // ================= COUNT =================
  const countToday = data.filter((o) => isToday(parseISO(o.henGiao))).length;
  const countOverdue = data.filter(
    (o) =>
      isBefore(parseISO(o.henGiao), todayStart) && o.trangThai !== "Hoàn thành"
  ).length;
  const countDone = data.filter((o) => o.trangThai === "Hoàn thành").length;

  if (loading && page === 1)
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
    <div className="p-4 bg-gray-100 min-h-screen relative">
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
            onClick={() => { if (page === 1) loadData(); else setPage(1); }}
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
          </div>
        )}

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded shadow-sm overflow-hidden border print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="text-sky-500 font-medium border-b sticky top-0 bg-white z-10">
                <tr>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Nhận lúc</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Số</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Hẹn giao</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Khách hàng</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Bác sĩ</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Bệnh nhân</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Răng</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Trạng thái</th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">Ghi chú</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
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
                      onClick={() => setSelectedDonHang(order)}
                      className={`border-b cursor-pointer transition-colors ${selectedDonHang?._id === order._id
                          ? "bg-sky-200 border-sky-200"
                          : "hover:bg-gray-50"
                        }`}
                    >
                      {/* NHẬN LÚC */}
                      <td className="px-3 truncate">
                        {order.ngayNhan
                          ? format(parseISO(order.ngayNhan), "dd/MM/yyyy HH:mm")
                          : "—"}
                      </td>

                      {/* SỐ ĐƠN */}
                      <td className="px-3 truncate">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donhang/${order._id}/edit`);
                          }}
                          className={`hover:underline ${overdue ? "text-red-500" : today ? "text-blue-600" : ""
                            }`}
                        >
                          {maDon}
                        </button>
                      </td>

                      {/* HẸN GIAO */}
                      <td className={`px-3 truncate ${overdue ? "text-red-500" : today ? "text-blue-600" : ""
                        }`}>
                        {format(date, "dd/MM/yyyy HH:mm")}
                      </td>

                      {/* KHÁCH HÀNG */}
                      <td className="px-3 truncate">{order.nhaKhoa?.hoVaTen}</td>

                      {/* BÁC SĨ */}
                      <td className="px-3 truncate">{order.bacSi?.hoVaTen}</td>

                      {/* BỆNH NHÂN */}
                      <td className="px-3 truncate">{order.benhNhan?.hoVaTen}</td>

                      {/* RĂNG */}
                      <td className="px-3 py-2 truncate">
                        {formatDanhSachSanPham(order.danhSachSanPham)}
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-3">
                        <TrangThaiBadge value={order.trangThai} />
                      </td>

                      {/* GHI CHÚ */}
                      <td className="px-3 truncate" title={order.ghiChuChung || ""}>
                        {order.ghiChuChung}
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ================= INFINITE SCROLL SENTINEL ================= */}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="text-center py-3 text-gray-400 text-sm">Đang tải thêm...</div>
            )}
            {!loadingMore && pagination?.totalPages && page >= pagination.totalPages && filteredOrders.length > 0 && (
              <div className="text-center py-2 text-gray-400 text-xs">Đã tải {pagination.total} đơn</div>
            )}
          </div>
        </div>

        {/* ================= PRINT VIEW ================= */}
        <div id="print-section" className="hidden print:block w-full">
          <style>{`
            @media print {
              @page { 
                size: A4 landscape; 
                margin: 4mm 6mm !important; 
              }
              
              /* Triệt tiêu các thuộc tính căn chỉnh flex, margin, padding của các thẻ cha (Dashboard/Header/Sidebar) khi in */
              html, body, #root, #root > div, main, .bg-gray-100, .max-w-full {
                position: static !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                display: block !important;
                box-shadow: none !important;
                background: white !important;
              }
              
              body * { visibility: hidden; }
              #print-section, #print-section * { visibility: visible; }
              #print-section {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                background-color: white !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                overflow: visible !important;
                display: block !important;
              }
              #print-section h2 {
                margin: 0 0 16px 0 !important;
                padding: 0 !important;
                text-align: center !important;
                font-size: 20px !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
              }
              #print-section table {
                width: 100% !important;
                border-collapse: collapse !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              #print-section table td,
              #print-section table th {
                border: 1px solid black !important;
                padding: 4px 6px !important;
                font-size: 11px !important;
                line-height: 1.3 !important;
                vertical-align: middle !important;
              }
              #print-section table th {
                background-color: #f3f4f6 !important;
                font-weight: bold !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}</style>
          <h2 className="text-xl font-bold text-center mb-4 uppercase">Kế Hoạch Giao Hàng</h2>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Nhận lúc</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Số</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Khách hàng</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Bệnh nhân</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "80%" }}>Răng</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Hẹn giao</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "20%" }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const maDon = order.maDonHang || `TAN${order._id.substring(order._id.length - 8).toUpperCase()}`;
                return (
                  <tr key={order._id}>
                    <td className="border border-black px-2 py-1 text-center" style={{ width: "1%", whiteSpace: "nowrap" }}>
                      {order.ngayNhan ? format(parseISO(order.ngayNhan), "dd/MM/yyyy HH:mm") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>{maDon}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "1%", whiteSpace: "nowrap" }}>{order.nhaKhoa?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "1%", whiteSpace: "nowrap" }}>{order.benhNhan?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "80%" }}>{formatDanhSachSanPham(order.danhSachSanPham)}</td>
                    <td className="border border-black px-2 py-1 text-center" style={{ width: "1%", whiteSpace: "nowrap" }}>
                      {order.henGiao ? format(parseISO(order.henGiao), "dd/MM/yyyy HH:mm") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1" style={{ width: "20%" }}>{order.ghiChuChung}</td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="border border-black text-center py-4">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hiển thị Panel Chi Tiết Đơn Hàng nếu đang chọn 1 đơn hàng */}
      {selectedDonHang && (
        <DonHangDetailPanel
          donHang={selectedDonHang}
          onClose={() => setSelectedDonHang(null)}
        />
      )}
    </div>
  );
};

const TrangThaiBadge = ({ value }) => {
  const map = {
    "Chờ xử lý": "bg-yellow-100 text-yellow-800",
    "Đang sản xuất": "bg-blue-100 text-blue-800",
    "Hoàn thành": "bg-green-100 text-green-800",
    "Đã giao": "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`px-2 py-1 font-medium text-xs ${map[value] || "bg-gray-100 text-gray-600"}`}>
      {value || "Chờ xử lý"}
    </span>
  );
};

export default KeHoachGiaoHangTable;