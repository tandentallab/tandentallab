import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useDispatch } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

const HoaDonPrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [nhaKhoaInfo, setNhaKhoaInfo] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hoa-don/${id}`);
        const found = res.data?.data || res.data;

        if (found) {
          setHoaDon(found);

          const nhaKhoaId = typeof found.nhaKhoa === "string" ? found.nhaKhoa : found.nhaKhoa?._id;
          if (nhaKhoaId) {
            try {
              const nkRes = await api.get(`/nha-khoa/${nhaKhoaId}`);
              setNhaKhoaInfo(nkRes.data?.data || nkRes.data);
            } catch (e) {
              setNhaKhoaInfo(found.nhaKhoa);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu in...</div>;
  if (!hoaDon) return <div className="p-4 text-center">Không tìm thấy dữ liệu</div>;

  const formatCurrency = (amount) => {
    if (amount === 0) return "0";
    if (!amount) return "";
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const formatShortDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatDiscount = (value, type) => {
    if (!value) return "0";
    if (type === "phanTram") {
      const raw = String(value).replace("%", "").trim();
      return raw ? `${raw}%` : "0";
    }
    return formatCurrency(Number(value) || 0);
  };

  const rows = [];
  (hoaDon.danhSachSanPham || []).forEach((sp, idx) => {
    const loaiGiamGia = sp.loaiGiamGia || "phanTram";
    const baseAmount = sp.thanhTien || (sp.soLuong || 1) * (sp.donGia || 0);

    // Hiển thị giảm giá theo đúng loại đã lưu
    let displayDiscount = "0";
    if (loaiGiamGia === "phanTram") {
      const percent = sp.giamGiaPhanTram || (baseAmount ? Math.round((sp.giamGia || 0) / baseAmount * 100) : 0);
      displayDiscount = percent ? `${percent}%` : "0";
    } else {
      displayDiscount = sp.giamGia ? formatCurrency(sp.giamGia) : "0";
    }

    rows.push({
      stt: idx + 1,
      ngay: sp.donHang?.ngayNhan || hoaDon.ngayXuatHoaDon,
      bacSi: sp.donHang?.bacSi?.hoVaTen || "---",
      benhNhan: sp.donHang?.benhNhan?.hoVaTen || "---",
      sanPham: sp.tenSanPham || "---",
      rang: sp.viTri?.map(v => v.soRang?.join(", ")).filter(Boolean).join(" | ") || "",
      soLuong: sp.soLuong || 1,
      donGia: sp.donGia || 0,
      giamGia: displayDiscount,
      thanhTien: sp.tongCongSanPham || 0,
      ghiChu: sp.ghiChu || "",
    });
  });

  return (
<div className="h-screen flex flex-col bg-gray-200 overflow-hidden">
      {/* Header Bar - Fixed Top */}
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4 shrink-0 print:hidden z-[1000]">
        <span className="text-white font-medium text-sm tracking-wide uppercase">Xem trước hóa đơn</span>
        <button onClick={() => navigate(-1)} className="text-white text-2xl hover:opacity-80 leading-none">&times;</button>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 scrollbar-thin">
        <div className="w-full flex justify-center">
          <div 
            className="print-area bg-white w-full max-w-[210mm] shadow-lg p-8 mb-4"
            style={{ fontFamily: "'Cambria', serif", fontSize: "10.5pt" }}
          >
            {/* ĐÃ SỬA: ĐƯA TÊN CÔNG TY VÀ TÊN LOẠI GIẤY VÀO BẢNG CÓ VIỀN */}
            <table className="w-full border-collapse border border-black mb-4" style={{ fontSize: "10.5pt" }}>
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2 align-top leading-tight font-bold text-center">
                    <div className="font-bold mb-1 uppercase">Công ty TNHH Tấn Dental</div>
                    <div>Số 43, đường số 14, KDC Hồng Phát, phường An Bình,</div>
                    <div>TP Cần Thơ</div>
                    <div>Điện thoại: 0842312828</div>
                  </td>
                  <td className="border border-black p-2 w-1/2 text-center align-middle font-bold  uppercase">
                    Giấy báo thanh toán
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Căn giữa Khách hàng và Ngày */}
            <div className="mb-6 leading-tight text-center">
              <div className="font-bold">Khách hàng: <span className="font-bold uppercase">{nhaKhoaInfo?.hoVaTen || nhaKhoaInfo?.tenGiaoDich || "---"}</span></div>
              <div>Từ Ngày: {formatDate(hoaDon.ngayXuatHoaDon)} - Đến Ngày: {formatDate(hoaDon.ngayXuatHoaDon)}</div>
            </div>

            {/* ĐÃ SỬA CHỖ NÀY: XÓA 'border border-black' khỏi className của table để bỏ viền bao ngoài cùng */}
            <table className="w-full border-collapse" style={{ fontSize: "10.5pt" }}>
              <thead>
                <tr className="font-bold text-center">
                  <th className="border border-black p-1">STT</th>
                  <th className="border border-black p-1">NGÀY</th>
                  <th className="border border-black p-1">BÁC SĨ</th>
                  <th className="border border-black p-1">BỆNH NHÂN</th>
                  <th className="border border-black p-1">SẢN PHẨM</th>
                  <th className="border border-black p-1">RĂNG</th>
                  <th className="border border-black p-1">S.L</th>
                  <th className="border border-black p-1">ĐƠN GIÁ</th>
                  <th className="border border-black p-1">GIẢM GIÁ</th>
                  <th className="border border-black p-1">THÀNH TIỀN</th>
                  <th className="border border-black p-1">GHI CHÚ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-black text-center p-1">{index + 1}</td>
                    <td className="border border-black text-center p-1">{formatShortDate(row.ngay)}</td>
                    <td className="border border-black p-1">{row.bacSi}</td>
                    <td className="border border-black p-1 whitespace-nowrap">{row.benhNhan}</td>
                    <td className="border border-black p-1">{row.sanPham}</td>
                    <td className="border border-black text-center p-1">{row.rang}</td>
                    <td className="border border-black text-center p-1">{row.soLuong}</td>
                    <td className="border border-black text-right p-1">{formatCurrency(row.donGia)}</td>
                    <td className="border border-black text-center p-1">{row.giamGia}</td>
                    <td className="border border-black text-center p-1">{row.thanhTien ? formatCurrency(row.thanhTien) : "0"}</td>
                    <td className="border border-black p-1">{row.ghiChu}</td>
                  </tr>
                ))}

                {/* KHỐI TỔNG HỢP CHI PHÍ */}
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    PHÁT SINH TRONG KỲ:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    {formatCurrency(hoaDon.tongCong || 0)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    CHIẾT KHẤU:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    {formatCurrency(hoaDon.chietKhau || 0)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    NỢ ĐẦU KỲ:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    0
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    GIÁ TRỊ THANH TOÁN:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    {formatCurrency(hoaDon.giaTriThanhToan || 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-left leading-normal" style={{ fontSize: "10.5pt" }}>
              
              <div className="mt-1 whitespace-pre-wrap text-gray-800">
                *Ghi chú:
              </div>
              <div className="mt-1 whitespace-pre-wrap text-gray-800 font-bold">
                {hoaDon.ghiChuChoKhachHang || ""}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Bar - Fixed Bottom */}
      <div className="h-16 bg-white border-t flex justify-center items-center gap-4 shrink-0 print:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => window.print()} 
          className="bg-green-600 text-white px-10 py-2 rounded shadow font-bold hover:bg-green-700 transition transform active:scale-95"
        >
          IN HÓA ĐƠN
        </button>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-gray-500 text-white px-10 py-2 rounded shadow font-bold hover:bg-gray-600 transition transform active:scale-95"
        >
          QUAY LẠI
        </button>
      </div>

      <style>{`
        @media print {
          @page { 
            size: A4; 
            margin: 15mm; 
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            border: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            page-break-inside: auto;
          }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}</style>
    </div>
  );
};

export default HoaDonPrintPreview;