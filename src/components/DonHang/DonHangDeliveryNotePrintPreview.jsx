import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";

const DonHangDeliveryNotePrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [donHang, setDonHang] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/donhang/${id}`);
        const donHangData = res.data?.data || res.data;
        if (donHangData) {
          setDonHang(donHangData);
        } else {
          console.error("Không có dữ liệu:", res.data);
        }
      } catch (err) {
        console.error("Lỗi fetch:", err.response?.status, err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!donHang) return <div className="p-4">Không tìm thấy đơn hàng</div>;

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const nhaKhoaTen =
    donHang.nhaKhoa?.tenGiaoDich || donHang.nhaKhoa?.hoVaTen || "";
  const bacSi = donHang.bacSi?.hoVaTen || "";
  const benhNhan = donHang.benhNhan?.hoVaTen || "";

  const sanPhamList = donHang.danhSachSanPham || [];
  const sanPhamText = sanPhamList
    .map((sp) => {
      const soLuong = sp.soLuong || 1;
      const ten = sp.sanPham?.tenSanPham || "";
      const mau = sp.mau ? ` (${sp.mau})` : "";
      return `${soLuong} ${ten}${mau}`.trim();
    })
    .filter(Boolean)
    .join(", ");

  const phuKienList = donHang.danhSachPhuKien || [];
  const phuKienText = phuKienList
    .map((pk) => `${pk.soLuong || 1} ${pk.tenPhuKien}`)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4">
        <span className="text-white font-medium text-sm">Phiếu giao hàng</span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col items-center print:items-start py-6 px-4 print:p-0">
        <div
          className="print-area bg-white w-full max-w-[300px] shadow-lg border border-gray-400 p-6 print:p-0 text-sm"
          style={{ fontFamily: "'Cambria', Georgia, serif" }}
        >
          <div className="text-center">
            <div className="font-bold text-lg">CÔNG TY TNHH TẤN DENTAL</div>
            <div>Điện thoại: 0842312828</div>
            <div className="text-base mt-2">PHIẾU GIAO HÀNG</div>
            <div className="border-b border-dashed border-gray-500 mt-2" />
          </div>

          <div className="mt-3 grid grid-cols-[90px_1fr] gap-y-1">
            <span>Nha khoa:</span>
            <span className="font-bold">{nhaKhoaTen || "---"}</span>
            <span>Bác sĩ:</span>
            <span className="font-bold">{bacSi || "---"}</span>
            <span> Bệnh nhân:</span>
            <span className="font-bold">{benhNhan || "---"}</span>
            <span> Sản phẩm:</span>
            <span className="font-bold">{sanPhamText || "---"}</span>
            <span>Giờ giao:</span>
            <span className="font-bold">{formatDateTime(donHang.henGiao)}</span>
          </div>

          <div className="border-b border-gray-300 mt-3" />
          <div className="mt-2 text-left">
            <span>Ghi chú SX: </span>
            <span className="font-bold">{donHang.ghiChuSanXuat || "---"}</span>
          </div>

          <div className="border-b border-gray-300 mt-3" />
          <div className="text-center mt-2">Xin cảm ơn quý Nha khoa!</div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            In trang nay (Ctrl+P)
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Quay lai
          </button>
        </div>
      </div>

      <style>{`
        @page {
          margin: 12mm 15mm;
        }
        @media print {
          body {
            background: white;
          }
          .print-area {
            box-shadow: none;
            border: none;
          }
          button {
            display: none;
          }
          .h-10, .mt-4 {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default DonHangDeliveryNotePrintPreview;
