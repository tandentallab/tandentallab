import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHoaDonById, updateHoaDon } from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import { fetchPhieuThuByHoaDon } from "../../redux/slices/phieuThuSlice";
import { X, Printer, FileDown, Save, Upload } from "lucide-react";
import { exportHoaDonToExcel } from "../../utils/exportToExcel";
import HoaDonDetailTable from "./HoaDonDetailTable";
import PhieuThuModal from "../PhieuThu/PhieuThuModal"; // 🔥 Đã import Modal đường tắt

const fmtVND = (v) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(v || 0));

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return `${dt.toLocaleDateString("vi-VN")} ${dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
};

const TRANG_THAI_COLOR = {
  "Chưa thanh toán": "bg-orange-500 text-white",
  "Thanh toán một phần": "bg-yellow-500 text-white",
  "Đã thanh toán": "bg-green-500 text-white",
};

const HoaDonDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [phieuThuList, setPhieuThuList] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [ptOpen, setPtOpen] = useState(false);

  const [formState, setFormState] = useState({
    chinhSachThanhToan: "Thanh toán cuối tháng",
    ghiChuChoKhachHang: "",
    ghiChuNoiBo: "",
    chietKhauPhanTram: 0,
    thuePhanTram: 0,
    chiPhiKhac: 0,
    ngayXuatHoaDon: "",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await dispatch(fetchNhaKhoa());
        const res = await dispatch(fetchHoaDonById(id)).unwrap();
        const data = res.data;
        setHoaDon(data);

        const tongCongLoaded = data.tongCong || 0;
        const chietKhauPhanTram =
          tongCongLoaded > 0
            ? Math.round((data.chietKhau / tongCongLoaded) * 100)
            : 0;

        setFormState({
          chinhSachThanhToan: data.chinhSachThanhToan || "Thanh toán cuối tháng",
          ghiChuChoKhachHang: data.ghiChuChoKhachHang || "",
          ghiChuNoiBo: data.ghiChuNoiBo || "",
          chietKhauPhanTram,
          thuePhanTram: data.thue || 0,
          chiPhiKhac: data.chiPhiKhac || 0,
          ngayXuatHoaDon: data.ngayXuatHoaDon
            ? new Date(data.ngayXuatHoaDon).toISOString().split("T")[0]
            : "",
        });

        try {
          const ptRes = await dispatch(fetchPhieuThuByHoaDon(id)).unwrap();
          setPhieuThuList(ptRes?.data || ptRes || []);
        } catch (ptErr) {
          console.error("Không tải được phiếu thu:", ptErr);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, dispatch]);

  // Hàm reload dữ liệu sau khi lập phiếu thu thành công
  const reloadData = async () => {
    try {
      const res = await dispatch(fetchHoaDonById(id)).unwrap();
      setHoaDon(res.data);
      const ptRes = await dispatch(fetchPhieuThuByHoaDon(id)).unwrap();
      setPhieuThuList(ptRes?.data || ptRes || []);
    } catch (err) {
      console.error("Lỗi khi tải lại dữ liệu:", err);
    }
  };

  const setField = (key, val) => {
    setFormState((p) => ({ ...p, [key]: val }));
    setIsDirty(true);
  };

  const handleGhiChuChange = (idx, val) => {
    const newHoaDon = { ...hoaDon };
    newHoaDon.danhSachSanPham = [...newHoaDon.danhSachSanPham];
    newHoaDon.danhSachSanPham[idx] = { ...newHoaDon.danhSachSanPham[idx], ghiChu: val };
    setHoaDon(newHoaDon);
    setIsDirty(true);
  };

  // ================= FINANCIAL SUMMARY =================
  const fin = useMemo(() => {
    if (!hoaDon) return { tongCong: 0, chietKhauTien: 0, thueTien: 0, giaTriThanhToan: 0, conLai: 0 };

    const tongCong = (hoaDon.danhSachSanPham || []).reduce(
      (s, sp) => s + (sp.tongCongSanPham || 0),
      0
    );

    const chietKhauTien = tongCong * (formState.chietKhauPhanTram / 100);
    const sauCK = tongCong - chietKhauTien;
    const thueTien = sauCK * (formState.thuePhanTram / 100);
    const giaTriThanhToan = sauCK + thueTien + Number(formState.chiPhiKhac || 0);
    const conLai = giaTriThanhToan - (hoaDon.daThanhToan || 0);

    return { tongCong, chietKhauTien, thueTien, giaTriThanhToan, conLai };
  }, [hoaDon, formState]);

  // ================= SAVE =================
  const handleUpdate = async () => {
    try {
      await dispatch(
        updateHoaDon({
          id,
          data: {
            chietKhau: Math.round(fin.chietKhauTien),
            thue: formState.thuePhanTram,
            chiPhiKhac: Number(formState.chiPhiKhac),
            chinhSachThanhToan: formState.chinhSachThanhToan,
            ghiChuChoKhachHang: formState.ghiChuChoKhachHang,
            ghiChuNoiBo: formState.ghiChuNoiBo,
            danhSachSanPham: hoaDon.danhSachSanPham,
          },
        })
      ).unwrap();
      setIsDirty(false);
      alert("Đã lưu hóa đơn thành công!");
    } catch (err) {
      alert("Lỗi: " + (err.message || err));
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Đang tải...</div>;
  if (!hoaDon) return <div className="p-10 text-center text-red-500">Không tìm thấy hóa đơn!</div>;

  const initials = hoaDon.nhaKhoa?.hoVaTen?.slice(0, 2).toUpperCase() || "NK";

  return (
    <div className="fixed inset-0 z-[1300] bg-white flex flex-col font-sans text-gray-800 overflow-hidden overflow-y-auto pb-20">

      {/* ===== HEADER ===== */}
      <header className="h-12 bg-[#00a8df] flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-base">
            Hóa đơn <span className="font-bold">{hoaDon.soHoaDon || "---"}</span>
          </h1>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${TRANG_THAI_COLOR[hoaDon.trangThai] || "bg-orange-500 text-white"}`}>
            {hoaDon.trangThai}
          </span>
        </div>
        <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* ===== INFO ROW ===== */}
      <div className="bg-white px-6 py-4 flex items-stretch shrink-0 gap-4 border-b border-gray-200">
        <div className="w-[40%] pr-4 flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-white font-bold text-base shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Nha khoa</p>
              <p className="font-bold text-gray-900 text-base leading-tight mt-0.5 uppercase">
                {hoaDon.nhaKhoa?.hoVaTen || "---"}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[11px] text-gray-400 font-medium">Chính sách thanh toán</p>
            <select
              value={formState.chinhSachThanhToan}
              onChange={(e) => setField("chinhSachThanhToan", e.target.value)}
              className="border-0 border-b border-gray-300 text-sm text-gray-800 outline-none bg-transparent pr-4 py-0.5 mt-0.5 w-4/5"
            >
              {[
                "Thanh toán trước",
                "Thanh toán ngay",
                "Thanh toán trong 7 ngày",
                "Thanh toán trong 10 ngày",
                "Thanh toán trong 30 ngày",
                "Thanh toán trong 60 ngày",
                "Thanh toán trong 90 ngày",
                "Thanh toán cuối tháng",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-[30%] text-[13px] text-gray-700 space-y-1.5 p-4 bg-[#e6f7ff] rounded-xl flex flex-col justify-center">
          <p><span className="text-gray-500 inline-block w-20">Địa chỉ:</span> <span className="font-medium">{hoaDon.nhaKhoa?.diaChiCuThe || ""}</span></p>
          <p><span className="text-gray-500 inline-block w-20">Điện thoại:</span> <span className="font-medium">{hoaDon.nhaKhoa?.soDienThoai || ""}</span></p>
          <p><span className="text-gray-500 inline-block w-20">Mô tả:</span> <span className="font-medium">{hoaDon.nhaKhoa?.moTa || ""}</span></p>
          <p className="pt-1.5 border-t border-sky-200 mt-1">
            <span className="text-gray-500 inline-block w-20">Công nợ:</span>
            <span className="font-bold text-gray-900">{fmtVND(fin.conLai)}</span>
          </p>
        </div>

        <div className="w-[30%] pl-8 flex flex-col justify-center">
          <p className="text-[11px] text-gray-400 font-medium">Giá trị thanh toán</p>
          <p className="text-3xl font-black text-gray-900 leading-tight mt-1 mb-3">{fmtVND(fin.giaTriThanhToan)}</p>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-gray-400 font-medium">Ngày xuất</p>
            <div className="flex items-center">
              <input
                type="date"
                value={formState.ngayXuatHoaDon}
                onChange={(e) => setField("ngayXuatHoaDon", e.target.value)}
                className="border-0 border-b border-gray-300 text-sm text-gray-800 outline-none bg-transparent w-36"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div className="flex-1 bg-white flex flex-col">
        <HoaDonDetailTable
          rows={hoaDon.danhSachSanPham || []}
          navigate={navigate}
          handleGhiChuChange={handleGhiChuChange}
        />

        <div className="flex border-t border-gray-200 mt-6 bg-gray-50/30 shrink-0 items-stretch">
          <div className="w-[55%] p-6 space-y-6">
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1.5">Ghi chú cho khách hàng</p>
              <textarea
                value={formState.ghiChuChoKhachHang}
                onChange={(e) => setField("ghiChuChoKhachHang", e.target.value)}
                rows={2}
                className="w-full border-b border-gray-300 text-sm outline-none resize-none bg-transparent focus:border-[#00a8df] transition-colors pb-1"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1.5">Ghi chú nội bộ</p>
              <textarea
                value={formState.ghiChuNoiBo}
                onChange={(e) => setField("ghiChuNoiBo", e.target.value)}
                rows={2}
                className="w-full border-b border-gray-300 text-sm outline-none resize-none bg-transparent focus:border-[#00a8df] transition-colors pb-1"
              />
            </div>
          </div>

          <div className="w-[15%] p-6 flex flex-col justify-center">
            <div className="w-full h-full min-h-[120px] bg-[#e6f7ff] rounded-xl border-2 border-dashed border-[#00a8df]/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00a8df] hover:bg-sky-50 transition-all p-4">
              <p className="text-xs font-bold text-[#00a8df]">Tài liệu</p>
              <Upload className="w-6 h-6 text-[#00a8df]" />
            </div>
          </div>

          <div className="w-[30%] p-8 flex flex-col justify-center">
            <div className="max-w-[320px] ml-auto w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-sm">Tổng cộng</span>
                <span className="font-bold text-gray-900 text-[15px]">{fmtVND(fin.tongCong)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-sm">Chiết khấu</span>
                <div className="flex items-center flex-1 justify-end ml-4">
                  <input
                    type="number" min={0} max={100}
                    value={formState.chietKhauPhanTram}
                    onChange={(e) => setField("chietKhauPhanTram", Number(e.target.value))}
                    className="w-12 border-b border-gray-400 text-center text-sm outline-none bg-transparent pb-0.5"
                  />
                  <span className="mx-3 text-gray-800">% =</span>
                  <span className="w-[100px] text-right border-b border-gray-400 text-[15px] pb-0.5">{fmtVND(fin.chietKhauTien)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-sm">Thuế</span>
                <div className="flex items-center flex-1 justify-end ml-4">
                  <input
                    type="number" min={0} max={100}
                    value={formState.thuePhanTram}
                    onChange={(e) => setField("thuePhanTram", Number(e.target.value))}
                    className="w-12 border-b border-gray-400 text-center text-sm outline-none bg-transparent pb-0.5"
                  />
                  <span className="mx-3 text-gray-800">% =</span>
                  <span className="w-[100px] text-right border-b border-gray-400 text-[15px] pb-0.5">{fmtVND(fin.thueTien)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-sm">Chi phí khác</span>
                <div className="flex items-center flex-1 justify-end ml-4">
                  <input
                    type="number" min={0}
                    value={formState.chiPhiKhac}
                    onChange={(e) => setField("chiPhiKhac", Number(e.target.value))}
                    className="w-[100px] text-right border-b border-gray-400 text-[15px] outline-none bg-transparent pb-0.5"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200/60 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-[15px]">Giá trị thanh toán</span>
                  <span className="font-bold text-gray-900 text-[16px]">{fmtVND(fin.giaTriThanhToan)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-bold text-[15px]">Đã thanh toán</span>
                  <span className="font-bold text-gray-900 text-[16px]">{fmtVND(hoaDon.daThanhToan || 0)}</span>
                </div>

                {phieuThuList.length > 0 && (
                  <div className="flex flex-col gap-1.5 pl-12">
                    {phieuThuList.map((pt, idx) => {
                      let tien = 0;
                      if (pt.danhSachHoaDon && Array.isArray(pt.danhSachHoaDon)) {
                        const hdItem = pt.danhSachHoaDon.find(x => x.hoaDon === id || x.hoaDon?._id === id);
                        if (hdItem) tien = hdItem.soTienThanhToan;
                      }
                      if (!tien) tien = pt.soTienThanhToan || pt.tongTien || pt.soTien || 0;

                      const dateStr = pt.ngayThu
                        ? new Date(pt.ngayThu).toLocaleDateString('vi-VN')
                        : (pt.createdAt ? new Date(pt.createdAt).toLocaleDateString('vi-VN') : "---");

                      return (
                        <div key={idx} className="flex items-center justify-between text-[14px] text-gray-700">
                          <span>{dateStr}</span>
                          <span>{fmtVND(tien)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-900 font-bold text-[16px]">Còn nợ</span>
                  <span className="font-bold text-gray-900 text-lg">{fmtVND(fin.conLai)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-200 flex items-center justify-between px-6 z-[1310] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <span className="text-gray-400">⋮</span>
          <span className="text-xs text-gray-400 font-medium">
            Kế Toán Tạo lúc {fmtDateTime(hoaDon.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer className="w-4 h-4" /> In hóa đơn
          </button>
          <button
            onClick={() => exportHoaDonToExcel(hoaDon)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-md text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FileDown className="w-4 h-4" /> Xuất excel
          </button>
          {fin.conLai > 0 && (
            <button
              onClick={() => setPtOpen(true)}
              className="px-5 py-2 bg-[#4CAF50] text-white rounded-md text-[13px] font-bold hover:bg-green-600 transition-colors shadow-sm"
            >
              Lập phiếu thu
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={!isDirty}
            className={`flex items-center gap-1.5 px-6 py-2 rounded-md text-[13px] font-bold transition-all shadow-sm ${isDirty
              ? "bg-[#00a8df] text-white hover:bg-sky-600 hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </footer>

      {/* 🔥 HIỂN THỊ MODAL LẬP PHIẾU THU ĐƯỜNG TẮT NẰM Ở ĐÂY */}
      <PhieuThuModal
        open={ptOpen}
        onClose={() => setPtOpen(false)}
        onSuccess={reloadData}
        initialNhaKhoaId={hoaDon?.nhaKhoa?._id}
        initialHoaDonId={hoaDon?._id}
      />

    </div>
  );
};

export default HoaDonDetail;