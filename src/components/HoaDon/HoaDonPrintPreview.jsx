import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllHoaDonAdmin } from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";

const LOGO_URL = "http://localhost:8080/assets/logo.png";

const HoaDonPrintPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [nhaKhoaInfo, setNhaKhoaInfo] = useState(null);

  const dispatch = useDispatch();
  const { danhSachHoaDon } = useSelector((state) => state.hoaDon);
  const nhaKhoa = useSelector((state) => state.nhaKhoa);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let found = danhSachHoaDon?.find((hd) => hd._id === id);

        if (!found) {
          const res = await dispatch(fetchAllHoaDonAdmin()).unwrap();
          found = res.data.find((hd) => hd._id === id);
        }

        if (!found) {
          const res = await api.get(`/hoa-don/${id}`);
          found = res.data.data;
        }

        if (found) {
          setHoaDon(found);

          const nhaKhoaId =
            typeof found.nhaKhoa === "string"
              ? found.nhaKhoa
              : found.nhaKhoa?._id;

          const foundNhaKhoa = nhaKhoa?.data?.find(
            (nk) => nk._id === nhaKhoaId
          );

          setNhaKhoaInfo(foundNhaKhoa || null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, dispatch, danhSachHoaDon, nhaKhoa?.data]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!hoaDon) return <div className="p-4">Không tìm thấy hóa đơn</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const items = hoaDon.danhSachDonHang || [];
  const buildTeethText = (viTri = []) => {
    if (!Array.isArray(viTri)) return "";
    const parts = viTri
      .map((v) => (Array.isArray(v.soRang) ? v.soRang.join(", ") : ""))
      .filter(Boolean);
    return parts.join(" | ");
  };

  const rows = [];
  items.forEach((wrap) => {
    const donHang = wrap.donHang || {};
    const bacSi = donHang.bacSi?.hoVaTen || "";
    const benhNhan = donHang.benhNhan?.hoVaTen || "";
    const ngay = donHang.ngayNhan || hoaDon.ngayXuatHoaDon;
    const sanPhamList = donHang.danhSachSanPham || [];

    if (sanPhamList.length === 0) {
      rows.push({
        ngay,
        bacSi,
        benhNhan,
        sanPham: "",
        rang: "",
        soLuong: "",
        donGia: wrap.tongTien || 0,
        giamGia: wrap.chietKhau
          ? `${wrap.chietKhau}${wrap.loaiChietKhau === "phanTram" ? "%" : "đ"}`
          : "",
        thanhTien: wrap.thanhTienSauCK || 0,
      });
      return;
    }

    sanPhamList.forEach((sp, spIndex) => {
      rows.push({
        ngay,
        bacSi,
        benhNhan,
        sanPham: sp.sanPham?.tenSanPham || "",
        rang: buildTeethText(sp.viTri),
        soLuong: sp.soLuong || "",
        donGia: sp.sanPham?.donGiaChung || "",
        giamGia:
          spIndex === 0 && wrap.chietKhau
            ? `${wrap.chietKhau}${wrap.loaiChietKhau === "phanTram" ? "%" : "đ"}`
            : "",
        thanhTien: spIndex === 0 ? wrap.thanhTienSauCK || 0 : "",
      });
    });
  });

  const tableRows = [];
  items.forEach((wrap) => {
    const donHang = wrap.donHang || {};
    const bacSi = donHang.bacSi?.hoVaTen || "";
    const benhNhan = donHang.benhNhan?.hoVaTen || "";
    const ngay = donHang.ngayNhan || hoaDon.ngayXuatHoaDon;
    const sanPhamList = donHang.danhSachSanPham || [];

    if (sanPhamList.length === 0) {
      tableRows.push({
        ngay,
        bacSi,
        benhNhan,
        sanPham: "",
        rang: "",
        soLuong: "",
        donGia: wrap.tongTien || 0,
        giamGia: wrap.chietKhau
          ? `${wrap.chietKhau}${wrap.loaiChietKhau === "phanTram" ? "%" : "đ"}`
          : "",
        thanhTien: wrap.thanhTienSauCK || 0,
      });
      return;
    }

    sanPhamList.forEach((sp, spIndex) => {
      tableRows.push({
        ngay,
        bacSi,
        benhNhan,
        sanPham: sp.sanPham?.tenSanPham || "",
        rang: buildTeethText(sp.viTri),
        soLuong: sp.soLuong || "",
        donGia: sp.sanPham?.donGiaChung || 0,
        giamGia:
          spIndex === 0 && wrap.chietKhau
            ? `${wrap.chietKhau}${wrap.loaiChietKhau === "phanTram" ? "%" : "đ"}`
            : "",
        thanhTien: spIndex === 0 ? wrap.thanhTienSauCK || 0 : "",
      });
    });
  });

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4">
        <span className="text-white font-medium text-sm">Hóa đơn</span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col items-center py-6 px-4">
        <div className="print-area bg-white w-full max-w-4xl shadow-lg border border-gray-400">
          {/* Header */}
          <div className="grid grid-cols-12 border-b border-gray-800">
            <div className="col-span-2 border-r border-gray-800 flex items-center justify-center p-2">
              <img src={LOGO_URL} alt="logo" className="max-h-16" />
            </div>
            <div className="col-span-6 border-r border-gray-800 text-center p-2">
              <div className="font-bold text-lg">CÔNG TY TNHH TẤN DENTAL</div>
              <div className="text-sm">
                Địa chỉ: Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ
              </div>
              <div className="text-sm">Điện thoại: 0842312828</div>
            </div>
            <div className="col-span-4 text-center p-2">
              <div className="font-bold text-lg">GIẤY BÁO THANH TOÁN</div>
            </div>
          </div>

          {/* Customer */}
          <div className="border-b border-gray-800 text-center font-bold py-2">
            Khách hàng: {nhaKhoaInfo?.hoVaTen || "---"}
          </div>

          {/* Date range */}
          <div className="border-b border-gray-800 text-center font-semibold py-2">
            Từ ngày: {formatDate(hoaDon.ngayXuatHoaDon)} đến ngày: {formatDate(hoaDon.ngayXuatHoaDon)}
          </div>

          {/* Table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="border-r border-gray-800 p-2">STT</th>
                <th className="border-r border-gray-800 p-2">NGÀY</th>
                <th className="border-r border-gray-800 p-2">BÁC SĨ</th>
                <th className="border-r border-gray-800 p-2">BỆNH NHÂN</th>
                <th className="border-r border-gray-800 p-2">SẢN PHẨM</th>
                <th className="border-r border-gray-800 p-2">RĂNG</th>
                <th className="border-r border-gray-800 p-2">S.L</th>
                <th className="border-r border-gray-800 p-2">ĐƠN GIÁ</th>
                <th className="border-r border-gray-800 p-2">GIẢM GIÁ</th>
                <th className="border-r border-gray-800 p-2">THÀNH TIỀN</th>
                <th className="p-2">GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${index}-${row.sanPham}`} className="border-b border-gray-800">
                  <td className="border-r border-gray-800 p-2 text-center">{index + 1}</td>
                  <td className="border-r border-gray-800 p-2 text-center">
                    {formatDate(row.ngay)}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-center">
                    {row.bacSi}
                  </td>
                  <td className="border-r border-gray-800 p-2">
                    {row.benhNhan}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-center">
                    {row.sanPham}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-center">
                    {row.rang}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-center">
                    {row.soLuong}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-right">
                    {formatCurrency(row.donGia)}
                  </td>
                  <td className="border-r border-gray-800 p-2 text-right">
                    {row.giamGia}
                    {row.thanhTien ? formatCurrency(row.thanhTien) : ""}
                  </td>
                    {formatCurrency(row.thanhTien)}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="grid grid-cols-12 border-t border-gray-800">
            <div className="col-span-8"></div>
            <div className="col-span-4 border-l border-gray-800">
              <div className="border-b border-gray-800 px-2 py-1 flex justify-between font-bold">
                <span>PHÁT SINH TRONG KỲ</span>
                <span>{formatCurrency(hoaDon.tongTien)}</span>
              </div>
              <div className="border-b border-gray-800 px-2 py-1 flex justify-between font-bold">
                <span>CHIẾT KHẤU</span>
                <span>{formatCurrency(hoaDon.tongChietKhau)}</span>
              </div>
              <div className="border-b border-gray-800 px-2 py-1 flex justify-between font-bold">
                <span>NỢ ĐẦU KỲ</span>
                <span>0</span>
              </div>
              <div className="px-2 py-1 flex justify-between font-bold">
                <span>GIÁ TRỊ THANH TOÁN</span>
                <span>{formatCurrency(hoaDon.thanhTien)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-2 text-sm">*Ghi chú:</div>
        </div>

        <div className="mt-4 flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
          >
            In hóa đơn
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default HoaDonPrintPreview;
