import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { QRCodeCanvas } from "qrcode.react";

const DonHangPrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [donHang, setDonHang] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/donhang/${id}`);
        // Handle both response structures
        const donHangData = res.data?.data || res.data;
        if (donHangData) {
          setDonHang(donHangData);
        } else {
          console.error("Không có dữ liệu trả về:", res.data);
        }
      } catch (err) {
        console.error("Lỗi fetch:", err.response?.status, err.message);
        if (err.response?.status === 404) {
          console.error("Không tìm thấy đơn hàng với ID:", id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!donHang) return <div className="p-4">Không tìm thấy đơn hàng</div>;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const maDonHang = `TAN${donHang._id.substring(donHang._id.length - 8).toUpperCase()}`;
  
  const bacSi = donHang.bacSi?.hoVaTen || "";
  const benhNhan = donHang.benhNhan?.hoVaTen || "";
  const nhaKhoa =
    donHang.nhaKhoa?.tenGiaoDich || donHang.nhaKhoa?.hoVaTen || "";

  const buildTeethText = (viTri = []) => {
    if (!Array.isArray(viTri)) return "";
    const parts = viTri
      .map((v) => (Array.isArray(v.soRang) ? v.soRang.join(", ") : ""))
      .filter(Boolean);
    return parts.join(" | ");
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4">
        <span className="text-white font-medium text-sm">PHIẾU ĐƠN HÀNG</span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col items-center py-6 px-4">
        <div className="print-area bg-white w-full max-w-4xl shadow-lg border border-gray-400 p-8">
          {/* Top info row */}
          <div className="grid grid-cols-12 gap-2 text-sm">
            <div className="col-span-5">
              <div className="grid grid-cols-[78px_1fr] gap-y-1">
                <span className="font-bold">Mã số:</span>
                <span className="font-bold">{maDonHang}</span>
                <span className="font-bold">Nha khoa:</span>
                <span className="font-bold">{nhaKhoa || "---"}</span>
                <span className="font-bold">Bác sĩ:</span>
                <span className="font-bold">{bacSi || "---"}</span>
                <span className="font-bold">Bệnh nhân:</span>
                <span className="font-bold">{benhNhan || "---"}</span>
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-center">
              <div className="w-20 h-20 border border-gray-800 flex items-center justify-center">
                <QRCodeCanvas value={maDonHang} size={72} level="M" />
              </div>
            </div>

            <div className="col-span-5">
              <div className="grid grid-cols-[90px_1fr] gap-y-1">
                <span className="font-bold">Nhận:</span>
                <span className="font-bold">{formatDateTime(donHang.ngayNhan)}</span>
                <span className="font-bold">Giao:</span>
                <span className="font-bold">{formatDateTime(donHang.henGiao)}</span>
                <span className="font-bold">Chỉ định giao:</span>
                <span className="font-bold">{donHang.trangThai || "---"}</span>
              </div>
            </div>
          </div>

          <div className="h-3" />

          {/* Main table */}
          <table className="w-full text-sm border border-gray-800 border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-800 p-1.5 text-center font-bold">
                  Loại phục hình
                </th>
                <th className="border border-gray-800 p-1.5 text-center font-bold">S.L</th>
                <th className="border border-gray-800 p-1.5 text-center font-bold">Răng</th>
                <th className="border border-gray-800 p-1.5 text-center font-bold">Màu</th>
                <th className="border border-gray-800 p-1.5 text-center font-bold">Loại</th>
              </tr>
            </thead>
            <tbody>
              {donHang.danhSachSanPham && donHang.danhSachSanPham.length > 0 ? (
                donHang.danhSachSanPham.map((sp, index) => (
                  <tr key={index}>
                    <td className="border border-gray-800 p-1.5 font-bold">
                      {sp.sanPham?.tenSanPham || "---"}
                    </td>
                    <td className="border border-gray-800 p-1.5 text-center font-bold">
                      {sp.soLuong || 1}
                    </td>
                    <td className="border border-gray-800 p-1.5 text-center">
                      {buildTeethText(sp.viTri) || ""}
                    </td>
                    <td className="border border-gray-800 p-1.5 text-center font-bold">
                      {sp.mau || ""}
                    </td>
                    <td className="border border-gray-800 p-1.5 text-center font-bold">
                      {sp.loaiDon || "Mới"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-800 p-2 text-center">
                    ---
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="grid grid-cols-12 gap-3 mt-4">
            <div className="col-span-8">
              <div className="text-sm font-bold">Chỉ định:</div>
              <div className="text-sm whitespace-pre-wrap ml-4 mt-1 font-bold">
                {donHang.chiDinhBacSi || ""}
              </div>

              <div className="text-sm font-bold mt-4">Yêu cầu kỹ thuật:</div>
              <div className="text-sm whitespace-pre-wrap ml-4 mt-1 font-bold">
                {donHang.ghiChuChung || ""}
              </div>
            </div>

            <div className="col-span-4">
              <table className="w-full text-sm border border-gray-800 border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-800 p-1.5 text-center font-bold">
                      Phụ kiện
                    </th>
                    <th className="border border-gray-800 p-1.5 text-center font-bold">S.L</th>
                  </tr>
                </thead>
                <tbody>
                  {donHang.danhSachPhuKien && donHang.danhSachPhuKien.length > 0 ? (
                    donHang.danhSachPhuKien.map((pk, index) => (
                      <tr key={index}>
                        <td className="border border-gray-800 p-1.5">
                          {pk.tenPhuKien}
                        </td>
                        <td className="border border-gray-800 p-1.5 text-center">
                          {pk.soLuong}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-gray-800 p-1.5">&nbsp;</td>
                      <td className="border border-gray-800 p-1.5 text-center">&nbsp;</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            In trang này (Ctrl+P)
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Quay lại
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: white;
          }
          .print-area {
            box-shadow: none;
            border: none;
            max-width: 100%;
            padding: 24px;
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

export default DonHangPrintPreview;
