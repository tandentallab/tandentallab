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
          const enriched = { ...found };
          const wraps = (enriched.danhSachDonHang || []).slice();

          await Promise.all(
            wraps.map(async (wrap, idx) => {
              const donHangId = typeof wrap.donHang === "string" ? wrap.donHang : wrap.donHang?._id;
              if (donHangId) {
                try {
                  const dhRes = await api.get(`/donhang/${donHangId}`);
                  wrap.donHang = dhRes.data?.data || dhRes.data || wrap.donHang;
                } catch (e) {}
              }

              const dh = wrap.donHang || {};
              const list = dh.danhSachSanPham || [];
              await Promise.all(
                list.map(async (spItem) => {
                  const spId = typeof spItem.sanPham === "string" ? spItem.sanPham : spItem.sanPham?._id;
                  if (spId) {
                    try {
                      const spRes = await api.get(`/sanpham/${spId}`);
                      spItem.sanPham = spRes.data?.data || spRes.data || spItem.sanPham;
                    } catch (e) {}
                  }
                })
              );
              wraps[idx] = wrap;
            })
          );

          enriched.danhSachDonHang = wraps;
          setHoaDon(enriched);

          const nhaKhoaId = typeof enriched.nhaKhoa === "string" ? enriched.nhaKhoa : enriched.nhaKhoa?._id;
          if (nhaKhoaId) {
            try {
              const nkRes = await api.get(`/nhakhoa/${nhaKhoaId}`);
              setNhaKhoaInfo(nkRes.data?.data || nkRes.data);
            } catch (e) {
              setNhaKhoaInfo(enriched.nhaKhoa);
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
  (hoaDon.danhSachDonHang || []).forEach((wrap) => {
    const donHang = wrap.donHang || {};
    const sanPhamList = donHang.danhSachSanPham || [];
    const orderNote = wrap.ghiChu || donHang.ghiChuChung || "";

    if (sanPhamList.length === 0) {
      rows.push({
        ngay: donHang.ngayNhan || hoaDon.ngayXuatHoaDon,
        bacSi: donHang.bacSi?.hoVaTen || "---",
        benhNhan: donHang.benhNhan?.hoVaTen || "---",
        sanPham: "", rang: "", soLuong: "",
        donGia: wrap.tongTien || 0,
        giamGia: formatDiscount(wrap.chietKhau, wrap.loaiChietKhau),
        thanhTien: wrap.thanhTienSauCK || 0,
        ghiChu: orderNote,
      });
      return;
    }

    sanPhamList.forEach((sp, idx) => {
      const gia = sp.sanPham?.donGiaChung || sp.donGia || 0;
      rows.push({
        ngay: donHang.ngayNhan || hoaDon.ngayXuatHoaDon,
        bacSi: donHang.bacSi?.hoVaTen || "---",
        benhNhan: donHang.benhNhan?.hoVaTen || "---",
        sanPham: sp.sanPham?.tenSanPham || "---",
        rang: sp.viTri?.map(v => v.soRang?.join(", ")).filter(Boolean).join(" | "),
        soLuong: sp.soLuong || "",
        donGia: gia,
        giamGia: idx === 0 ? formatDiscount(wrap.chietKhau, wrap.loaiChietKhau) : "",
        thanhTien: (sp.soLuong || 0) * gia,
        ghiChu: idx === 0 ? (sp.ghiChu ? `${sp.ghiChu}. ${orderNote}` : orderNote) : sp.ghiChu || "",
      });
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
              <div>Khách hàng: <span className="font-bold uppercase">{nhaKhoaInfo?.hoVaTen || nhaKhoaInfo?.tenGiaoDich || "---"}</span></div>
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
                    <td className="border border-black text-right p-1">{row.thanhTien ? formatCurrency(row.thanhTien) : "0"}</td>
                    <td className="border border-black p-1">{row.ghiChu}</td>
                  </tr>
                ))}

                {/* KHỐI TỔNG HỢP CHI PHÍ */}
                {/* KHỐI TỔNG HỢP CHI PHÍ */}
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    PHÁT SINH TRONG KỲ:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    {formatCurrency(hoaDon.tongTien)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-1 text-left uppercase">
                    CHIẾT KHẤU:
                  </td>
                  <td colSpan={2} className="border border-black p-1 font-bold text-right">
                    {formatCurrency(hoaDon.tongChietKhau)}
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
                    {formatCurrency(hoaDon.thanhTien)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* PHẦN GHI CHÚ NẰM DƯỚI BẢNG (Giờ sẽ không còn bị dính viền trên nữa) */}
            <div className="mt-4 text-left leading-normal" style={{ fontSize: "10.5pt" }}>
              
              <div className="mt-1 whitespace-pre-wrap text-gray-800">
                *Ghi chú: {hoaDon.ghiChuChoKhachHang || ""}
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