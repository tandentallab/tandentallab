import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDonHang, fetchMoreDonHang } from "../../redux/slices/donHangSlice";
import {
  format,
  isToday,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import ThongKeKeHoachGiaoHang from "./ThongKeKeHoachGiaoHang";
import { useNavigate } from "react-router-dom";
import { exportKeHoachGiaoHangToExcel } from "../../utils/exportToExcel";
import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiMoreVertical,
  FiDownload,
  FiPrinter,
} from "react-icons/fi";
import ReplayIcon from '@mui/icons-material/Replay';
// Đảm bảo đường dẫn import DonHangDetailPanel đúng với cấu trúc thư mục của bạn
import DonHangDetailPanel from "../DonHang/DonHangDetailPanel";
import SaveIcon from '@mui/icons-material/Save';

const ROWS_PER_PAGE = 20;

const KeHoachGiaoHangTable = () => {
  const dispatch = useDispatch();
  const { data, loading, loadingMore, pagination } = useSelector((state) => state.donHang);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [draftFromDate, setDraftFromDate] = useState("");
  const [draftToDate, setDraftToDate] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleApply = () => {
    setFromDate(draftFromDate);
    setToDate(draftToDate);
  };

  const handleReset = () => {
    setDraftFromDate("");
    setDraftToDate("");
    setFromDate("");
    setToDate("");
    setSearchText("");
  };

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
  }, [fromDate, toDate]);

  // Build params và dispatch load
  const loadData = useCallback(() => {
    const params = { page, limit: ROWS_PER_PAGE };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (fromDate) params.henGiaoFrom = new Date(fromDate).toISOString();
    if (toDate) params.henGiaoTo = new Date(toDate).toISOString();

    if (page === 1) {
      dispatch(fetchDonHang(params));
    } else {
      dispatch(fetchMoreDonHang(params));
    }
  }, [dispatch, page, debouncedSearch, fromDate, toDate]);

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

  // ================= FILTER LOGIC (client-side) =================
  const filteredOrders = useMemo(() => {
    return [...data];
  }, [data]);

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
        <div className="flex flex-wrap items-center gap-2 mb-3 px-1 print:hidden">
          {/* Hẹn giao từ */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-24">Hẹn giao từ:</span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={draftFromDate ? dayjs(draftFromDate.split("T")[0]) : null}
                  onChange={(val) =>
                    setDraftFromDate(val ? `${val.format("YYYY-MM-DD")}T${draftFromDate.split("T")[1] || "00:00"}` : "")
                  }
                  slotProps={{ textField: { size: "small", variant: "standard", inputProps: { style: { fontSize: "0.875rem" } } } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  ampm={false}
                  value={draftFromDate?.split("T")[1] ? dayjs(`2000-01-01T${draftFromDate.split("T")[1]}`) : null}
                  onChange={(val) =>
                    setDraftFromDate((prev) => prev ? `${prev.split("T")[0]}T${val ? val.format("HH:mm") : "00:00"}` : "")
                  }
                  slotProps={{ textField: { size: "small", variant: "standard", inputProps: { style: { fontSize: "0.875rem", width: "5.5rem" } } } }}
                />
              </LocalizationProvider>

              {/* Nút reset */}
              <button
                onClick={handleApply}
                className="w-10 h-10 rounded-full bg-sky-500 text-white shadow"
                title="Áp dụng bộ lọc"
              >
                <SaveIcon fontSize="small" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="w-24">đến:</span>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={draftToDate ? dayjs(draftToDate.split("T")[0]) : null}
                  onChange={(val) =>
                    setDraftToDate(val ? `${val.format("YYYY-MM-DD")}T${draftToDate.split("T")[1] || "23:59"}` : "")
                  }
                  slotProps={{ textField: { size: "small", variant: "standard", inputProps: { style: { fontSize: "0.875rem" } } } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  ampm={false}
                  value={draftToDate?.split("T")[1] ? dayjs(`2000-01-01T${draftToDate.split("T")[1]}`) : null}
                  onChange={(val) =>
                    setDraftToDate((prev) => prev ? `${prev.split("T")[0]}T${val ? val.format("HH:mm") : "23:59"}` : "")
                  }
                  slotProps={{ textField: { size: "small", variant: "standard", inputProps: { style: { fontSize: "0.875rem", width: "5.5rem" } } } }}
                />
              </LocalizationProvider>

              {/* Nút áp dụng */}
              <button
                onClick={handleReset}
                className="w-10 h-10 rounded-full bg-green-500 text-white shadow"
                title="Đặt lại bộ lọc"
              >
                <ReplayIcon fontSize="small" />
              </button>
            </div>
          </div>

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
                          ? format(parseISO(order.ngayNhan), "HH:mm dd/MM/yyyy")
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
                      <td className={`px-3 truncate ${overdue ? "text-red-500" : ""
                        }`}>
                        {format(date, "HH:mm dd/MM/yyyy")}
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
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "60%" }}>Răng</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>Hẹn giao</th>
                <th className="border border-black px-1 py-1.5 text-center font-semibold" style={{ width: "40%" }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const maDon = order.maDonHang || `TAN${order._id.substring(order._id.length - 8).toUpperCase()}`;
                return (
                  <tr key={order._id}>
                    <td className="border border-black px-2 py-1 text-center" style={{ width: "1%", whiteSpace: "nowrap" }}>
                      {order.ngayNhan ? format(parseISO(order.ngayNhan), "HH:mm dd/MM/yyyy") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1 text-center font-semibold" style={{ width: "1%", whiteSpace: "nowrap" }}>{maDon}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "1%", whiteSpace: "nowrap" }}>{order.nhaKhoa?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "1%", whiteSpace: "nowrap" }}>{order.benhNhan?.hoVaTen}</td>
                    <td className="border border-black px-2 py-1" style={{ width: "60%" }}>{formatDanhSachSanPham(order.danhSachSanPham)}</td>
                    <td className="border border-black px-2 py-1 text-center" style={{ width: "1%", whiteSpace: "nowrap" }}>
                      {order.henGiao ? format(parseISO(order.henGiao), "HH:mm dd/MM/yyyy") : "—"}
                    </td>
                    <td className="border border-black px-2 py-1" style={{ width: "40%" }}>{order.ghiChuChung}</td>
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