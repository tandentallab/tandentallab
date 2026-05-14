import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { numberToWords } from "../../utils/numberToWords";

const PhieuThuPrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [phieuThu, setPhieuThu] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/phieu-thu/${id}`);
        setPhieuThu(res.data?.data || res.data);
      } catch (err) {
        console.error("Lỗi fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!phieuThu) return <div className="p-4">Không tìm thấy phiếu thu</div>;

  const danhSachHoaDon = phieuThu.danhSachHoaDon || [];
  const firstHoaDon = danhSachHoaDon[0]?.hoaDon || {};
  const nhaKhoa = firstHoaDon.nhaKhoa || {};
  const bacSi = phieuThu.bacSi || {};
  const diaChiNhaKhoa = [
    nhaKhoa.diaChiCuThe,
    nhaKhoa.quanHuyen,
    nhaKhoa.tinh,
    nhaKhoa.quocGia,
  ]
    .filter(Boolean)
    .join(", ");

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN").format(value || 0);
  };

  const getDayName = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    return days[d.getDay()];
  };

  const maPhieuThu = phieuThu.soPhieuThu || `PT${phieuThu._id.substring(phieuThu._id.length - 8).toUpperCase()}`;
  const printDate = phieuThu.ngayThu || phieuThu.ngayTao || new Date(); // Thêm new Date() làm dự phòng
  const soTienText = numberToWords(phieuThu.soTienThu);

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4">
        <span className="text-white font-medium text-sm">PHIẾU THU</span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col items-center py-6 px-4">
        <div className="print-area bg-white w-full max-w-4xl shadow-lg border border-gray-300 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">PHIẾU THU</h1>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Left column */}
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-bold min-w-24">Mã số:</span>
                <span className="font-bold text-blue-600">{maPhieuThu}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-24">Ngày:</span>
                <span>{formatDate(printDate)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold min-w-24">Thứ:</span>
                <span>
                  {getDayName(printDate)}, {formatDate(printDate)}
                </span>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-2 text-sm text-right pr-4">
              <div>QĐ số 15/2006/QĐ-BTC</div>
              <div>ngày 20/03/2006 của BTC</div>
            </div>
          </div>

          {/* Content section */}
          <div className="mb-6 space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-bold min-w-32">Người nộp tiền:</span>
              <span className="font-bold">
                {bacSi.hoVaTen || nhaKhoa.hoVaTen || "---"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold min-w-32">Địa chỉ:</span>
              <span>{diaChiNhaKhoa || "---"}</span>
            </div>
            {phieuThu.noiDung && (
              <div className="flex gap-2">
                <span className="font-bold min-w-32">Nội dung thu:</span>
                <span>{phieuThu.noiDung}</span>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="border border-gray-300 rounded p-4 mb-6">
            <div className="flex justify-between mb-3">
              <span className="font-bold">Số tiền thu:</span>
              <span className="font-bold text-lg">
                {formatCurrency(phieuThu.soTienThu)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Bằng chữ:</span>
              <span className="font-bold">
                {soTienText}
              </span>
            </div>
          </div>

          {/* Invoice Details Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 text-left font-bold">
                    Hóa đơn
                  </th>
                  <th className="border border-gray-400 p-2 text-right font-bold">
                    Giá trị hóa đơn
                  </th>
                  <th className="border border-gray-400 p-2 text-right font-bold">
                    Đã thanh toán
                  </th>
                  <th className="border border-gray-400 p-2 text-right font-bold">
                    Thanh toán lần này
                  </th>
                  <th className="border border-gray-400 p-2 text-right font-bold">
                    Tổng cộng
                  </th>
                  <th className="border border-gray-400 p-2 text-right font-bold">
                    Còn lại
                  </th>
                </tr>
              </thead>
              <tbody>
                {danhSachHoaDon.map((item, idx) => {
                  const hd = item.hoaDon || {};
                  const soTienThanhToan = item.soTienThanhToan || 0;
                  const daTTruocLanNay = (hd.daThanhToan || 0) - soTienThanhToan;
                  return (
                    <tr key={hd._id || idx}>
                      <td className="border border-gray-400 p-2">
                        {hd.soHoaDon || (hd._id ? `TAN${hd._id.substring(hd._id.length - 8).toUpperCase()}` : "---")}
                      </td>
                      <td className="border border-gray-400 p-2 text-right">
                        {formatCurrency(hd.thanhTien || hd.tongTien || 0)}
                      </td>
                      <td className="border border-gray-400 p-2 text-right">
                        {formatCurrency(daTTruocLanNay)}
                      </td>
                      <td className="border border-gray-400 p-2 text-right font-bold">
                        {formatCurrency(soTienThanhToan)}
                      </td>
                      <td className="border border-gray-400 p-2 text-right">
                        {formatCurrency(hd.daThanhToan || 0)}
                      </td>
                      <td className="border border-gray-400 p-2 text-right">
                        {formatCurrency(hd.conLai || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-5 gap-4 mt-12 text-xs text-center">
            <div>
              <div className="h-16 border-t border-gray-400 mb-1"></div>
              <div className="font-bold">Người lập phiếu</div>
              <div className="text-gray-600">(Ký, họ tên)</div>
            </div>
            <div>
              <div className="h-16 border-t border-gray-400 mb-1"></div>
              <div className="font-bold">Người nộp tiền</div>
              <div className="text-gray-600">(Ký, họ tên)</div>
            </div>
            <div>
              <div className="h-16 border-t border-gray-400 mb-1"></div>
              <div className="font-bold">Thủ quỹ</div>
              <div className="text-gray-600">(Ký, họ tên)</div>
            </div>
            <div>
              <div className="h-16 border-t border-gray-400 mb-1"></div>
              <div className="font-bold">Kế toán</div>
              <div className="text-gray-600">(Ký, họ tên)</div>
            </div>
            <div>
              <div className="h-16 border-t border-gray-400 mb-1"></div>
              <div className="font-bold">Thủ trưởng đơn vị</div>
              <div className="text-gray-600">(Ký, họ tên)</div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          In phiếu thu
        </button>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          .bg-gray-200 {
            background: white;
          }
          .print-area {
            box-shadow: none;
            border: none;
            max-width: none;
            width: 100%;
          }
          button {
            display: none;
          }
          .h-10 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PhieuThuPrintPreview;
