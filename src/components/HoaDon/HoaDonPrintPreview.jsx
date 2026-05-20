import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";

const HoaDonPrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết hóa đơn theo ID
        const res = await api.get(`/hoa-don/${id}`);
        const data = res.data?.data || res.data;
        setHoaDon(data);
      } catch (err) {
        console.error("Lỗi tải hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Đang tải...</div>;
  if (!hoaDon) return <div className="p-4 text-center">Không tìm thấy dữ liệu</div>;

  const formatCurrency = (amount) => new Intl.NumberFormat("vi-VN").format(Math.round(amount || 0));
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("vi-VN") : "---";

  return (
    <div className="p-8 bg-white max-w-[210mm] mx-auto min-h-[297mm] shadow-lg print:shadow-none">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-xl uppercase">Hóa đơn thanh toán</h1>
        <p>Số hóa đơn: {hoaDon.soHoaDon || "---"}</p>
        <p>Ngày xuất: {formatDate(hoaDon.ngayXuatHoaDon)}</p>
        <p className="font-bold mt-2">Nha khoa: {hoaDon.nhaKhoa?.hoVaTen || "---"}</p>
      </div>

      {/* Bảng sản phẩm - Khớp với logic Table */}
      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2">STT</th>
            <th className="border border-black p-2">Sản phẩm</th>
            <th className="border border-black p-2">SL</th>
            <th className="border border-black p-2">Đơn giá</th>
            <th className="border border-black p-2">Giảm giá</th>
            <th className="border border-black p-2">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {(hoaDon.danhSachSanPham || []).map((sp, idx) => (
            <tr key={idx}>
              <td className="border border-black p-2 text-center">{idx + 1}</td>
              <td className="border border-black p-2">{sp.tenSanPham}</td>
              <td className="border border-black p-2 text-center">{sp.soLuong}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(sp.donGia)}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(sp.giamGia)}</td>
              <td className="border border-black p-2 text-right">{formatCurrency(sp.thanhTien)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết - Khớp với Model HoaDon.js */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-1"><span>Tổng cộng:</span> <b>{formatCurrency(hoaDon.tongCong)}</b></div>
          <div className="flex justify-between py-1"><span>Chiết khấu:</span> <b>{formatCurrency(hoaDon.chietKhau)}</b></div>
          <div className="flex justify-between py-1"><span>Thuế:</span> <b>{formatCurrency(hoaDon.thue)}</b></div>
          <div className="flex justify-between py-1"><span>Chi phí khác:</span> <b>{formatCurrency(hoaDon.chiPhiKhac)}</b></div>
          <div className="flex justify-between py-1 border-t border-black mt-2 pt-2">
            <span className="font-bold">Giá trị thanh toán:</span>
            <b className="text-lg">{formatCurrency(hoaDon.giaTriThanhToan)}</b>
          </div>
        </div>
      </div>

      {/* Nút điều khiển - Chỉ hiện trên màn hình, không in */}
      <div className="mt-10 print:hidden flex gap-4 justify-center">
        <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 text-white rounded">In Hóa Đơn</button>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-500 text-white rounded">Quay lại</button>
      </div>
    </div>
  );
};

export default HoaDonPrintPreview;