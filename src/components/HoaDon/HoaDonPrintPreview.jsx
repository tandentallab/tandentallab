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
  const [phieuThuList, setPhieuThuList] = useState([]);
  const [company, setCompany] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchNhaKhoa());
    const fetchCompany = async () => {
      try {
        const res = await api.get('/cong-ty');
        if (res.data && res.data.data) {
          setCompany(res.data.data);
        }
      } catch (e) {
        console.error("Lỗi fetch thông tin công ty:", e);
      }
    };
    fetchCompany();
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/hoa-don/${id}`);
        const found = res.data?.data || res.data;

        if (found) {
          setHoaDon(found);

          // Lấy lịch sử phiếu thu về bản in để tổng hợp Đã thanh toán
          try {
            const ptRes = await api.get(`/phieu-thu/hoa-don/${id}`);
            setPhieuThuList(ptRes.data?.data || ptRes.data || []);
          } catch (e) {
            setPhieuThuList([]);
          }

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
    const d = new Date(new Date(date).getTime() + 7 * 60 * 60 * 1000);
    const [yyyy, mm, dd] = d.toISOString().split("T")[0].split("-");
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatShortDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatViTriRang = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "";
    return viTriArr
      .map((v) =>
        v.kieu === "Cầu" && v.soRang?.length > 1
          ? `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
          : v.soRang?.join(", ")
      )
      .filter(Boolean)
      .join(", ");
  };

  const getFirstName = (fullName) => {
    if (!fullName || fullName === "---") return "---";
    const parts = fullName.trim().split(" ");
    return parts[parts.length - 1];
  };

  const rows = [];
  (hoaDon.danhSachSanPham || [])
    .filter((sp) => (sp.tongCongSanPham || 0) !== 0)
    .forEach((sp, idx) => {
      const loaiGiamGia = sp.loaiGiamGia || "phanTram";
      const baseAmount = sp.thanhTien || (sp.soLuong || 1) * (sp.donGia || 0);

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
        bacSi: getFirstName(sp.donHang?.bacSi?.hoVaTen),
        benhNhan: sp.donHang?.benhNhan?.hoVaTen || "---",
        sanPham: sp.tenSanPham || "---",
        rang: formatViTriRang(sp.viTri),
        soLuong: sp.soLuong || 1,
        donGia: sp.donGia || 0,
        giamGia: displayDiscount,
        thanhTien: sp.tongCongSanPham || 0,
        ghiChu: sp.ghiChu || "",
      });
    });

  const phatSinhTrongKy = (hoaDon.tongCong || 0) - (hoaDon.chietKhau || 0) +
    Math.round(Math.max(0, (hoaDon.tongCong || 0) - (hoaDon.chietKhau || 0)) * ((hoaDon.thue || 0) / 100)) +
    (hoaDon.chiPhiKhac || 0);

  const noDauKy = hoaDon.noDauKy || 0;
  const giaTriThanhToan = phatSinhTrongKy + noDauKy;

  return (
    <div className="h-screen flex flex-col bg-gray-200 overflow-hidden">
      <div className="h-10 bg-[#00a8df] flex justify-between items-center px-4 shrink-0 print:hidden z-[1000]">
        <span className="text-white font-medium text-sm tracking-wide uppercase">Xem trước hóa đơn</span>
        <button onClick={() => navigate(-1)} className="text-white text-2xl hover:opacity-80 leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 px-4 pb-4 scrollbar-thin w-full">
        <div className="w-full flex justify-center">
          <div
            className="print-area bg-white w-full max-w-[297mm] shadow-lg p-4 mb-2"
            style={{ fontFamily: "'Cambria', serif", fontSize: "10.5pt" }}
          >
            <table className="w-full border-collapse border border-black mb-2" style={{ fontSize: "10.5pt" }}>
              <tbody>
                <tr>
                  <td className="border border-black p-2 w-1/2 align-top leading-tight font-bold text-center">
                    <div className="font-bold mb-1 uppercase">{company?.Ten || ""}</div>
                    <div>{company?.DiaChi || ""}</div>
                    <div>{company?.DienThoai ? `Điện thoại: ${company.DienThoai}` : ""}</div>
                  </td>
                  <td className="border border-black p-2 w-1/2 text-center align-middle font-bold uppercase text-lg">
                    Giấy báo thanh toán
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 🔥 ĐÃ SỬA: Hiển thị từ ngày bắt đầu bộ lọc đến chính xác ngày xuất hóa đơn */}
            <div className="mb-2 leading-tight text-center">
              <div className="font-bold mb-2">Khách hàng: <span className="font-bold uppercase">{nhaKhoaInfo?.hoVaTen || nhaKhoaInfo?.tenGiaoDich || "---"}</span></div>
              <div>Từ Ngày: {formatDate(hoaDon.tuNgay)} - Đến Ngày: {formatDate(hoaDon.ngayXuatHoaDon)}</div>
            </div>

            <table className="w-full border-collapse" style={{ fontSize: "10.5pt" }}>
              {/* <colgroup>
                <col style={{ width: "3%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "5%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col />
                <col style={{ width: "4%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "8%" }} />
              </colgroup> */}
              <thead>
                <tr className="font-bold text-center">
                  <th className="border border-black p-0.5 whitespace-nowrap">STT</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">NGÀY</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">BÁC SĨ</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">BỆNH NHÂN</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">SẢN PHẨM</th>
                  <th className="border border-black p-0.5 whitespace-nowrap w-36">RĂNG</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">S.L</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">ĐƠN GIÁ</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">GIẢM GIÁ</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">THÀNH TIỀN</th>
                  <th className="border border-black p-0.5 whitespace-nowrap">GHI CHÚ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-black text-center p-0.5">{index + 1}</td>
                    <td className="border border-black text-center p-0.5">{formatShortDate(row.ngay)}</td>
                    <td className="border border-black text-center p-0.5">{row.bacSi}</td>
                    <td className="border border-black text-center p-0.5">{row.benhNhan}</td>
                    <td className="border border-black text-center p-0.5">{row.sanPham}</td>
                    <td className="border border-black text-center p-0.5">{row.rang}</td>
                    <td className="border border-black text-center p-0.5">{row.soLuong}</td>
                    <td className="border border-black text-center p-0.5">{formatCurrency(row.donGia)}</td>
                    <td className="border border-black text-center p-0.5">{row.giamGia}</td>
                    <td className="border border-black text-center p-0.5">{row.thanhTien ? formatCurrency(row.thanhTien) : "0"}</td>
                    <td className="border border-black text-center p-0.5">{row.ghiChu}</td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                    PHÁT SINH TRONG KỲ:
                  </td>
                  <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                    {formatCurrency(hoaDon.tongCong || 0)}
                  </td>
                </tr>

                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                    CHIẾT KHẤU
                  </td>
                  <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                    {formatCurrency(hoaDon.chietKhau || 0)}
                  </td>
                </tr>

                {hoaDon.thue > 0 && (
                  <tr>
                    <td colSpan={6} style={{ border: "none" }}></td>
                    <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                      THUẾ
                    </td>
                    <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                      {formatCurrency(
                        Math.round(
                          Math.max(0, (hoaDon.tongCong || 0) - (hoaDon.chietKhau || 0)) * (hoaDon.thue / 100)
                        )
                      )}
                    </td>
                  </tr>
                )}

                {hoaDon.chiPhiKhac > 0 && (
                  <tr>
                    <td colSpan={6} style={{ border: "none" }}></td>
                    <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                      CHI PHÍ KHÁC
                    </td>
                    <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                      {formatCurrency(hoaDon.chiPhiKhac || 0)}
                    </td>
                  </tr>
                )}

                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                    NỢ ĐẦU KỲ
                  </td>
                  <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                    {formatCurrency(noDauKy)}
                  </td>
                </tr>

                <tr>
                  <td colSpan={6} style={{ border: "none" }}></td>
                  <td colSpan={3} className="border border-black p-0.5 text-right font-bold uppercase whitespace-nowrap">
                    GIÁ TRỊ THANH TOÁN
                  </td>
                  <td colSpan={2} className="border border-black p-0.5 font-bold text-right whitespace-nowrap">
                    {formatCurrency(giaTriThanhToan)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              className="mt-4 text-left leading-normal text-gray-800"
              style={{ fontSize: "10.5pt" }}
            >
              <span>*Ghi chú: </span>
              <span>
                {hoaDon.ghiChuChoKhachHang || ""}
              </span>
            </div>

          </div>
        </div>
      </div>

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
            size: A4 landscape;
            margin: 10mm; 
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
            max-width: 100% !important;
            border: none !important; 
            margin: 0 !important; 
            padding: 16px !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            page-break-inside: auto;
          }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .bg-gray-100 { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .bg-gray-200 { background-color: #e5e7eb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default HoaDonPrintPreview;