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
  const printDate = phieuThu.ngayThu || phieuThu.ngayTao || new Date();
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
        <div className="print-area bg-white shadow-lg border border-gray-300" style={{ width: "210mm", fontFamily: "Cambria", padding: "10mm" }}>
          {/* Header */}
          <div style={{ marginBottom: "6mm" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3mm" }}>
              <div style={{ flex: 2 }}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>CÔNG TY TNHH TẤN DENTAL</p>
                <p style={{ margin: "1mm 0 0", fontSize: "9pt" }}>Số 43, đường số 14, KDC Hồng Phát, An Bình, Cần Thơ</p>
              </div>
              <div style={{ flex: 1, textAlign: "right", fontSize: "11pt" }}>
                <div>QĐ số 15/2006/QĐ-BTC</div>
                <div>ngày 20/03/2006 của BTC</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #ccc", paddingTop: "3mm", textAlign: "center" }}>
              <h1 style={{ margin: "0 0", fontSize: "15pt", fontWeight: "bold", textTransform: "uppercase" }}>PHIẾU THU</h1>
              <div style={{ fontSize: "9pt" }}>{maPhieuThu}</div>
              <div style={{ fontSize: "9pt" }}>{getDayName(printDate)}, {formatDate(printDate)}</div>
            </div>
          </div>

          {/* Thông tin người nộp */}
          <div style={{ marginBottom: "3mm", fontSize: "11pt", lineHeight: "2" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ minWidth: "105px" }}>Người nộp tiền:</span>
              <strong>{bacSi.hoVaTen || nhaKhoa.hoVaTen || "---"}</strong>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ minWidth: "105px" }}>Địa chỉ:</span>
              <strong>{diaChiNhaKhoa || "---"}</strong>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ minWidth: "105px" }}>Nội dung thu:</span>
              <strong>{phieuThu.noiDung || "---"}</strong>
            </div>
            <div style={{ display: "flex", gap: "4px", alignItems: "baseline", justifyContent: "space-between" }}>
              <div>
                <span style={{ display: "inline-block", minWidth: "105px" }}>Số tiền thu:</span>
                <strong style={{ fontSize: "11pt" }}>{formatCurrency(phieuThu.soTienThu)} đ</strong>
              </div>
              <div>
                <span>Bằng chữ:</span>
                <strong style={{ marginLeft: "4px", fontSize: "11pt" }}>{soTienText}</strong>
              </div>
            </div>
          </div>

          {/* Bảng hóa đơn */}
          <div style={{ marginBottom: "4mm" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11pt" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #999", fontWeight: "normal", textAlign: "center", padding: "2mm" }}>Hóa đơn</th>
                  <th style={{ border: "1px solid #999", fontWeight: "normal", textAlign: "center", padding: "2mm" }}>Số tiền ban đầu</th>
                  <th style={{ border: "1px solid #999", fontWeight: "normal", textAlign: "center", padding: "2mm" }}>Đã thanh toán</th>
                  <th style={{ border: "1px solid #999", fontWeight: "normal", textAlign: "center", padding: "2mm" }}>Số tiền còn lại</th>
                  <th style={{ border: "1px solid #999", fontWeight: "normal", textAlign: "center", padding: "2mm" }}>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {danhSachHoaDon.map((item, idx) => {
                  const hd = item.hoaDon || {};
                  const soTienThanhToan = item.soTienThanhToan || 0;
                  const daTTruocLanNay = item.daTTruocLanNay || 0;
                  return (
                    <tr key={hd._id || idx}>
                      <td style={{ border: "1px solid #999", padding: "1.5mm 2mm" }}>
                        {hd.soHoaDon || (hd._id ? `TAN${hd._id.substring(hd._id.length - 8).toUpperCase()}` : "---")}
                      </td>
                      <td style={{ border: "1px solid #999", padding: "1.5mm 2mm", textAlign: "right" }}>{formatCurrency(hd.giaTriThanhToan || 0)}</td>
                      <td style={{ border: "1px solid #999", padding: "1.5mm 2mm", textAlign: "right" }}>{formatCurrency(daTTruocLanNay)}</td>
                      <td style={{ border: "1px solid #999", padding: "1.5mm 2mm", textAlign: "right" }}>{formatCurrency((hd.giaTriThanhToan || 0) - daTTruocLanNay)}</td>
                      <td style={{ border: "1px solid #999", padding: "1.5mm 2mm", textAlign: "right" }}>{formatCurrency(soTienThanhToan)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chữ ký */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11pt", marginTop: "8mm" }}>
            {[["Người lập phiếu"], ["Người nộp tiền"], ["Thủ quỹ"], ["Kế toán"], ["Thủ trưởng đơn vị"]].map(([label]) => (
              <div key={label} style={{ textAlign: "center", width: "20%" }}>
                <div style={{ fontWeight: "bold" }}>{label}</div>
                <div style={{ fontStyle: "italic", fontSize: "10pt" }}>(Ký, họ tên)</div>
              </div>
            ))}
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
          @page { size: A5 landscape; margin: 0; }
          body { margin: 0; padding: 0; background: white; }
          .bg-gray-200 { background: white; }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            width: 210mm !important;
            /* Đã giảm padding top xuống còn 4mm để chừa thêm chỗ trống phía dưới */
            padding: 4mm 10mm 10mm 10mm !important; 
          }
          button, .h-10 { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default PhieuThuPrintPreview;