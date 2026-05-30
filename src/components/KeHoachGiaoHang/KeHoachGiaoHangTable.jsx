import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDonHang,
  fetchMoreDonHang,
  setFilter,
} from "../../redux/slices/donHangSlice";
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
  FiDownload,
  FiPrinter,
} from "react-icons/fi";
import DonHangDetailPanel from "../DonHang/DonHangDetailPanel";

const ROWS_PER_PAGE = 20;

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { data, loading, loadingMore, pagination } = useSelector(
    (state) => state.donHang
  );

  // const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  // const [filterType, setFilterType] = useState("all");
  // const [filterStatus, setFilterStatus] = useState("Chờ xử lý");
  // const [fromDate, setFromDate] = useState("");
  // const [toDate, setToDate] = useState("");
  // const [searchText, setSearchText] = useState("");
  const [showFilterBar, setShowFilterBar] = useState(false);

  const [page, setPage] = useState(1);
  const [loadingAll, setLoadingAll] = useState(false);
  const [printOrders, setPrintOrders] = useState(null);

  // State quản lý việc mở panel chi tiết đơn hàng
  const [selectedDonHang, setSelectedDonHang] = useState(null);

  const sentinelRef = useRef(null);

  const todayStart = startOfDay(new Date());

  const navigate = useNavigate();

  const filters = useSelector((state) => state.donHang.filters);

  const {
    showUrgentOnly,
    filterType,
    filterStatus,
    fromDate,
    toDate,
    searchText,
  } = filters;

  // Build params và dispatch load
  const loadData = useCallback(() => {
    const params = { page, limit: ROWS_PER_PAGE };
    if (page === 1) {
      dispatch(fetchDonHang(params));
    } else {
      dispatch(fetchMoreDonHang(params));
    }
  }, [dispatch, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [filterType, fromDate, toDate, showUrgentOnly, filterStatus, searchText]);

  // Infinite scroll: khi sentinel vào viewport thì tải trang tiếp theo
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          page < (pagination?.totalPages || 1) &&
          !loadingMore &&
          !loading
        ) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [page, pagination?.totalPages, loadingMore, loading]);

  // ================= FILTER LOGIC =================
  const applyFilters = useCallback((sourceData) => {
    let result = [...sourceData];

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

    if (filterStatus !== "all") {
      result = result.filter((order) => order.trangThai === filterStatus);
    }

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

    result.sort((a, b) => parseISO(a.henGiao) - parseISO(b.henGiao));
    return result;
  }, [filterType, filterStatus, fromDate, toDate, showUrgentOnly, searchText, todayStart]);

  const filteredOrders = useMemo(() => applyFilters(data), [data, applyFilters]);

  // Lấy toàn bộ dữ liệu (không phân trang) rồi áp filter
  const fetchAllFiltered = useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await api.get("/donhang", { params: { page: 1, limit: 9999 } });
      const allData = res.data.data || [];
      return applyFilters(allData);
    } finally {
      setLoadingAll(false);
    }
  }, [applyFilters]);

  // ================= COUNT =================
  const countToday = data.filter((o) => isToday(parseISO(o.henGiao))).length;
  const countOverdue = data.filter(
    (o) =>
      isBefore(parseISO(o.henGiao), todayStart) && o.trangThai !== "Hoàn thành"
  ).length;
  const countDone = data.filter((o) => o.trangThai === "Hoàn thành").length;

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

  // Hàm format 1 sản phẩm duy nhất
  const formatSingleSanPham = (item) => {
    if (!item) return "";
    const loaiDonMap = {
      Mới: "",
      "Hàng sửa": "Sửa",
      "Hàng bảo hành": "Bảo hành",
      "Hàng làm lại": "Làm lại",
    };
    const loaiDon = loaiDonMap[item.loaiDon] || "";
    const soLuong = item.soLuong || 1;
    const tenSanPham = item.sanPham?.tenSanPham || item.sanPham?.ten || "";
    const viTri = formatViTri(item.viTri);
    const mau = item.mau ? `(${item.mau})` : "";
    return [loaiDon, soLuong, tenSanPham, viTri, mau]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Mỗi đơn hàng nhiều sản phẩm được tách ra thành nhiều dòng
  const expandedRows = useMemo(() => {
    return filteredOrders.flatMap((order) => {
      const dssp = order.danhSachSanPham || [];
      if (dssp.length === 0) return [{ order, sp: null, spIdx: 0 }];
      return dssp.map((sp, spIdx) => ({ order, sp, spIdx }));
    });
  }, [filteredOrders]);

  const handleExportExcel = async () => {
    await exportKeHoachGiaoHangToExcel(filteredOrders, formatSingleSanPham);
  };

  if (loading && page === 1)
    return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

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
              onChange={(e) =>
                dispatch(
                  setFilter({
                    searchText: e.target.value,
                  })
                )
              }
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
            onClick={handlePrint}
            disabled={loadingAll}
            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition disabled:opacity-50"
            title="In danh sách"
          >
            {loadingAll ? <FiRefreshCw size={17} className="animate-spin" /> : <FiPrinter size={17} />}
          </button>
          <button
            onClick={() => {
              if (page === 1) loadData();
              else setPage(1);
            }}
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
              onChange={(e) =>
                dispatch(
                  setFilter({
                    filterType: e.target.value,
                  })
                )
              }
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
                  onChange={(e) =>
                    dispatch(
                      setFilter({
                        fromDate: e.target.value,
                      })
                    )
                  }
                  className="border px-2 py-1.5 rounded text-sm"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    dispatch(
                      setFilter({
                        toDate: e.target.value,
                      })
                    )
                  }
                  className="border px-2 py-1.5 rounded text-sm"
                />
              </>
            )}

            {/* Lọc trạng thái */}
            <select
              value={filterStatus}
              onChange={(e) =>
                dispatch(
                  setFilter({
                    filterStatus: e.target.value,
                  })
                )
              }
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
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Nhận lúc
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Số
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Hẹn giao
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Khách hàng
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Bác sĩ
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Bệnh nhân
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Răng
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="px-3 py-3 select-none whitespace-nowrap">
                    Ghi chú
                  </th>
                </tr>
              </thead>

              <tbody>
                {expandedRows.map(({ order, sp, spIdx }) => {
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
                      key={`${order._id}_${spIdx}`}
                      onClick={() => setSelectedDonHang(order)}
                      className={`border-b cursor-pointer transition-colors ${selectedDonHang?._id === order._id
                        ? "bg-sky-100 border-sky-200"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      {/* NHẬN LÚC */}
                      <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-600">
                        {order.ngayNhan
                          ? format(parseISO(order.ngayNhan), "HH:mm dd/MM/yyyy")
                          : "—"}
                      </td>

                      {/* SỐ ĐƠN */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donhang/${order._id}/edit`);
                          }}
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
                      <td
                        className={`px-3 py-2.5 whitespace-nowrap text-sm font-medium ${overdue ? "text-red-500" : "text-gray-700"
                          }`}
                      >
                        {format(date, "HH:mm dd/MM/yyyy")}
                      </td>

                      {/* KHÁCH HÀNG */}
                      <td className="px-3 py-2.5 text-sm text-gray-800 truncate max-w-[180px]">
                        {order.nhaKhoa?.hoVaTen}
                      </td>

                      {/* BÁC SĨ */}
                      <td className="px-3 py-2.5 text-sm text-gray-700 truncate max-w-[120px]">
                        {order.bacSi?.hoVaTen}
                      </td>

                      {/* BỆNH NHÂN */}
                      <td className="px-3 py-2.5 text-sm text-gray-700 truncate max-w-[140px]">
                        {order.benhNhan?.hoVaTen}
                      </td>

                      {/* RĂNG */}
                      <td className="px-3 py-2.5 text-sm text-gray-700 truncate max-w-[200px]">
                        {formatSingleSanPham(sp)}
                      </td>

                      {/* TRẠNG THÁI */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <TrangThaiBadge value={order.trangThai} />
                      </td>

                      {/* GHI CHÚ */}
                      <td
                        className="px-3 py-2.5 text-sm text-gray-700 truncate max-w-[160px]"
                        title={order.ghiChuChung || ""}
                      >
                        {order.ghiChuChung}
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && !loading && (
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

            {/* ================= INFINITE SCROLL SENTINEL ================= */}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="text-center py-3 text-gray-400 text-sm">Đang tải thêm...</div>
            )}
          </div>
        </div>

        {/* ================= PRINT VIEW ================= */}
        <div id="print-section" className="hidden print:block w-full">
          <style>{`
            @media print {
              @page { 
                size: A4 landscape; 
                margin: 8mm; 
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
                padding: 8px 10px !important;
                font-size: 13px !important;
                line-height: 1.4 !important;
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
          <h2 className="text-xl font-bold text-center mb-4 uppercase">
            Kế Hoạch Giao Hàng
          </h2>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 text-center font-semibold">
                  Nhận lúc
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold">
                  Số
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold">
                  Khách hàng
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold">
                  Bệnh nhân
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold w-1/4">
                  Răng
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold">
                  Hẹn giao
                </th>
                <th className="border border-black px-2 py-1 text-center font-semibold w-1/6">
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {
                filteredOrders.flatMap((order) => {
                  const dssp = order.danhSachSanPham || [];
                  const products = dssp.length > 0 ? dssp : [null];
                  const maDon =
                    order.maDonHang ||
                    `TAN${order._id
                      .substring(order._id.length - 8)
                      .toUpperCase()}`;
                  return products.map((sp, spIdx) => (
                    <tr key={`${order._id}_${spIdx}`}>
                      <td className="border border-black px-2 py-1 text-center">
                        {order.ngayNhan
                          ? format(parseISO(order.ngayNhan), "dd/MM/yyyy HH:mm")
                          : "—"}
                      </td>
                      <td className="border border-black px-2 py-1 text-center font-semibold">
                        {maDon}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {order.nhaKhoa?.hoVaTen}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {order.benhNhan?.hoVaTen}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {formatSingleSanPham(sp)}
                      </td>
                      <td className="border border-black px-2 py-1 text-center">
                        {order.henGiao
                          ? format(parseISO(order.henGiao), "dd/MM/yyyy HH:mm")
                          : "—"}
                      </td>
                      <td className="border border-black px-2 py-1">
                        {order.ghiChuChung}
                      </td>
                    </tr>
                  ));
                })}
              {(printOrders ?? filteredOrders).length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="border border-black text-center py-4"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table >
        </div >
      </div >

      {/* Hiển thị Panel Chi Tiết Đơn Hàng nếu đang chọn 1 đơn hàng */}
      {
        selectedDonHang && (
          <DonHangDetailPanel
            donHang={selectedDonHang}
            onClose={() => setSelectedDonHang(null)}
          />
        )
      }
    </div >
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
    <span
      className={`px-2 py-1 rounded font-medium text-xs ${map[value] || "bg-gray-100 text-gray-600"
        }`}
    >
      {value || "Chờ xử lý"}
    </span>
  );
};

export default KeHoachGiaoHangTable;
