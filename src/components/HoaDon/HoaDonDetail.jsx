import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useDispatch, useSelector } from "react-redux";
import { fetchHoaDonById, updateHoaDon } from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import { Avatar, Button, IconButton, Tooltip } from "@mui/material";
import { EditIcon, TrashIcon } from "lucide-react";
import { exportHoaDonToExcel } from "../../utils/exportToExcel";
import { deepPurple } from "@mui/material/colors";
import DonHangChuaXuatModal from "../DonHangChuaXuat/DonHangChuaXuatModal";

const HoaDonDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [nhaKhoaInfo, setNhaKhoaInfo] = useState(null);

  const dispatch = useDispatch();
  const { hoaDonDetail } = useSelector((state) => state.hoaDon);
  const { data: bangGia = [] } = useSelector((state) => state.bangGia) || {};
  const nhaKhoa = useSelector((state) => state.nhaKhoa);

  const [chinhSachThanhToan, setChinhSachThanhToan] = useState(
    hoaDon?.chinhSachThanhToan
  );
  const [ghiChuChoKhachHang, setGhiChuChoKhachHang] = useState(
    hoaDon?.ghiChuKhachHang
  );
  const [ghiChuNoiBo, setGhiChuNoiBo] = useState(hoaDon?.ghiChuNoiBo);

  const [thuePhanTram, setThuePhanTram] = useState(hoaDon?.thue);
  const [chiPhiKhac, setChiPhiKhac] = useState(hoaDon?.chiPhiKhac);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const handleAddOrders = (orders) => {
    console.log("Orders từ modal:", orders);

    setHoaDon((prev) => {
      if (!prev) return prev;

      // id đã tồn tại
      const existingIds = prev.danhSachDonHang.map((i) => i.donHang?._id);

      // chỉ lấy đơn mới
      const newItems = orders.filter(
        (o) => !existingIds.includes(o.donHang?._id)
      );

      if (!newItems.length) return prev;

      const updatedItems = [...prev.danhSachDonHang, ...newItems];

      // tính lại tổng
      let tongTien = 0;
      let tongChietKhau = 0;

      updatedItems.forEach((i) => {
        tongTien += Number(i.tongTien || 0);

        tongChietKhau +=
          Number(i.tongTien || 0) - Number(i.thanhTienSauCK || 0);
      });

      const thanhTien = tongTien - tongChietKhau;

      return {
        ...prev,
        danhSachDonHang: updatedItems,
        tongTien,
        tongChietKhau,
        thanhTien,
        conLai: thanhTien - (prev.daThanhToan || 0),
      };
    });
  };

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  useEffect(() => {
    console.log("Hóa đơn: ", hoaDon);
    setGhiChuChoKhachHang(hoaDon?.ghiChuChoKhachHang);
    setGhiChuNoiBo(hoaDon?.ghiChuNoiBo);
    setChinhSachThanhToan(hoaDon?.chinhSachThanhToan);
    setThuePhanTram(hoaDon?.thue);
    setChiPhiKhac(hoaDon?.chiPhiKhac);
  }, [hoaDon]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await dispatch(fetchHoaDonById(id)).unwrap();
        const found = res.data;

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
  }, [id, dispatch, nhaKhoa]);

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";
    return new Date(dateTime).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount = 0) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleChangeChiPhiKhac = (chiPhi) => {
    setChiPhiKhac(chiPhi);

    const newHoaDon = { ...hoaDon };

    newHoaDon.chiPhiKhac = chiPhi;

    newHoaDon.thanhTien += chiPhiKhac;

    newHoaDon.conLai = newHoaDon.thanhTien - (newHoaDon.daThanhToan || 0);

    setHoaDon(newHoaDon);
  };

  // LOGIC HANDLERS (Giữ nguyên logic của bạn)
  const handleDiscountChange = (index, field, value) => {
    const newHoaDon = { ...hoaDon };

    const items = [...newHoaDon.danhSachDonHang];

    const item = { ...items[index] };

    // update field
    item[field] = value;

    const tong = Number(item.tongTien || 0);

    let thanhTien = tong;

    // tính sau chiết khấu
    if (item.loaiChietKhau === "phanTram") {
      const percent = Number(item.chietKhau) || 0;

      thanhTien = tong - (tong * percent) / 100;
    } else {
      const tien = Number(item.chietKhau) || 0;

      thanhTien = tong - tien;
    }

    item.thanhTienSauCK = Math.max(thanhTien, 0);

    items[index] = item;

    newHoaDon.danhSachDonHang = items;

    /* ================= TÍNH LẠI TỔNG ================= */

    let tongTien = 0;
    let tongChietKhau = 0;

    // ✅ thành tiền = tổng thanhTienSauCK
    let thanhTienHoaDon = 0;

    items.forEach((i) => {
      const tong = Number(i.tongTien || 0);

      const thanhTienSauCK = Number(i.thanhTienSauCK || 0);

      tongTien += tong;

      tongChietKhau += tong - thanhTienSauCK;

      thanhTienHoaDon += thanhTienSauCK;
    });

    newHoaDon.tongTien = tongTien;

    newHoaDon.tongChietKhau = tongChietKhau;

    // ✅ logic mới
    newHoaDon.thanhTien = thanhTienHoaDon + chiPhiKhac;

    newHoaDon.conLai = newHoaDon.thanhTien - (newHoaDon.daThanhToan || 0);

    setHoaDon(newHoaDon);
  };

  const handleDelete = (index) => {
    const newHoaDon = { ...hoaDon };
    const items = newHoaDon.danhSachDonHang.filter((_, i) => i !== index);
    newHoaDon.danhSachDonHang = items;
    let tongTien = 0;
    let tongChietKhau = 0;
    items.forEach((i) => {
      tongTien += i.tongTien || 0;
      tongChietKhau += (i.tongTien || 0) - (i.thanhTienSauCK || 0);
    });
    newHoaDon.tongTien = tongTien;
    newHoaDon.tongChietKhau = tongChietKhau;
    newHoaDon.thanhTien = tongTien - tongChietKhau;
    newHoaDon.conLai = newHoaDon.thanhTien - (newHoaDon.daThanhToan || 0);
    setHoaDon(newHoaDon);
  };

  const handleUpdateHoaDon = () => {
    if (window.confirm("Bạn có chắc muốn cập nhật hóa đơn?")) {
      dispatch(
        updateHoaDon({
          id: hoaDon._id,
          data: {
            ...hoaDon,
            thue: thuePhanTram,
            chiPhiKhac,
            ghiChuChoKhachHang,
            ghiChuNoiBo,
            chinhSachThanhToan,
          },
        })
      );
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!hoaDon) return <div className="p-4">Không tìm thấy hóa đơn</div>;

  return (
    <div className="fixed inset-0 z-[1299] bg-[#f0f2f5] flex flex-col w-screen h-screen overflow-hidden">
      {/* 1. TOP BAR */}
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4 shrink-0 shadow-sm">
        <span className="text-white font-medium text-sm">
          Chi tiết hóa đơn: {hoaDon.soHoaDon}
        </span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl hover:opacity-70"
        >
          &times;
        </button>
      </div>

      {/* 2. BODY CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT AREA: Scrollable Info & Table */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* SECTION 1: Customer & Invoice Info */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            <div className="col-span-2 bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
              <h3 className="text-blue-600 font-bold mb-3 border-b pb-2 uppercase text-[11px]">
                Thông tin khách hàng
              </h3>
              <div className="flex items-center justify-center gap-x-2">
                <Avatar>NK</Avatar>{" "}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="text-gray-500">
                    Nha khoa:{" "}
                    <span className="text-gray-900 font-semibold">
                      {nhaKhoaInfo?.hoVaTen || "..."}
                    </span>
                  </span>
                  <span className="text-gray-500">
                    Email:{" "}
                    <span className="text-gray-900">
                      {nhaKhoaInfo?.email || "---"}
                    </span>
                  </span>
                  <span className="text-gray-500 col-span-2">
                    Địa chỉ:{" "}
                    <span className="text-gray-900">
                      {nhaKhoaInfo
                        ? `${nhaKhoaInfo.diaChiCuThe}, ${nhaKhoaInfo.tinh}`
                        : "---"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-lg">
              <h3 className="text-blue-600 font-bold mb-3 border-b pb-2 uppercase text-[11px]">
                Chứng từ
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã:</span>
                  <span className="font-bold text-red-600">
                    TAN{hoaDon._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày xuất:</span>
                  <span>{formatDate(hoaDon.ngayXuatHoaDon)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Table - Bọc trong div để kiểm soát overflow */}
          <div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] sticky top-0 z-10 border-b">
                <tr>
                  <th className="p-3 text-center w-12">STT</th>
                  <th className="p-3">Mã đơn hàng</th>
                  <th className="p-3">Thông tin chung</th>
                  <th className="p-3">Sản phẩm & Vị trí</th>
                  <th className="p-3 text-right">Tổng tiền</th>
                  <th className="p-3 text-center w-32">Chiết khấu</th>
                  <th className="p-3 text-right">Thành tiền</th>
                  <th className="p-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hoaDon.danhSachDonHang.map((item, index) => (
                  <tr
                    key={item._id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="p-3 text-center text-gray-400">
                      {index + 1}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate(`/donhang/${item.donHang?._id}/edit`)
                        }
                        className="font-bold text-blue-600 hover:underline text-xs"
                      >
                        TAN{item.donHang?._id?.slice(-6).toUpperCase()}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="text-xs leading-relaxed">
                        <div>
                          <span className="text-gray-400">BS:</span>{" "}
                          {item.donHang?.bacSi?.hoVaTen}
                        </div>
                        <div className="font-medium">
                          <span className="text-gray-400">BN:</span>{" "}
                          {item.donHang?.benhNhan?.hoVaTen}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {item.donHang?.danhSachSanPham?.map((sp, i) => (
                          <div
                            key={i}
                            className="text-[12px] bg-gray-50 p-1 rounded border border-gray-100"
                          >
                            <span className="font-medium text-blue-700">
                              {sp.sanPham?.tenSanPham}
                            </span>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {sp.viTri
                                ?.map((v) => `${v.kieu}: ${v.soRang.join(",")}`)
                                .join(" | ")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-600 font-medium">
                      {formatCurrency(item.tongTien)}
                    </td>
                    <td className="p-3">
                      <div className="flex border rounded overflow-hidden h-8">
                        <input
                          type="number"
                          value={item.chietKhau || 0}
                          onChange={(e) =>
                            handleDiscountChange(
                              index,
                              "chietKhau",
                              Number(e.target.value)
                            )
                          }
                          className="w-full text-center text-xs outline-none border-r"
                        />
                        <select
                          value={item.loaiChietKhau}
                          onChange={(e) =>
                            handleDiscountChange(
                              index,
                              "loaiChietKhau",
                              e.target.value
                            )
                          }
                          className="bg-gray-50 text-[10px] px-1 outline-none font-bold"
                        >
                          <option value="phanTram">%</option>
                          <option value="tienMat">đ</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-gray-800">
                      {formatCurrency(item.thanhTienSauCK)}
                    </td>
                    <td className="p-3 text-center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(index)}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={8}>
                    <Button onClick={() => setIsModalOpen(true)}>
                      Thêm đơn hàng chưa xuất hóa đơn
                    </Button>
                    <DonHangChuaXuatModal
                      open={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      selectedClinic={nhaKhoaInfo?._id} // ✅ fix crash
                      selectedOrders={selectedOrders}
                      setSelectedOrders={setSelectedOrders}
                      onAddOrders={handleAddOrders} // ✅ thêm dòng này
                    />{" "}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-12 gap-6 bg-white p-6 shadow-sm  rounded-lg mb-24">
              {/* Cột trái: Chính sách & Ghi chú */}
              <div className="col-span-7 space-y-6">
                {/* Select Chính sách thanh toán */}
                <div className="w-1/2">
                  <label className="text-[11px] font-bold text-blue-500 uppercase tracking-wider mb-1 block">
                    Chính sách thanh toán
                  </label>
                  <select
                    value={chinhSachThanhToan}
                    onChange={(e) => setChinhSachThanhToan(e.target.value)}
                    className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-blue-500 bg-transparent cursor-pointer"
                  >
                    <option value="Thanh toán cuối tháng">
                      Thanh toán cuối tháng
                    </option>
                    <option value="Thanh toán ngay">Thanh toán ngay</option>
                    <option value="Thanh toán trong 10 ngày">
                      Thanh toán trong 7 ngày
                    </option>
                    <option value="Thanh toán trong 10 ngày">
                      Thanh toán trong 10 ngày
                    </option>
                    <option value="Thanh toán trong 30 ngày">
                      Thanh toán trong 30 ngày
                    </option>
                    <option value="Thanh toán trong 60 ngày">
                      Thanh toán trong 60 ngày
                    </option>
                    <option value="Thanh toán trong 90 ngày">
                      Thanh toán trong 90 ngày
                    </option>
                  </select>
                </div>

                {/* Ghi chú cho khách hàng */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Ghi chú cho khách hàng
                  </label>
                  <textarea
                    value={ghiChuChoKhachHang}
                    onChange={(e) => setGhiChuChoKhachHang(e.target.value)}
                    className="w-full mt-1 border-b border-gray-200 focus:border-blue-400 outline-none text-sm py-2 resize-none h-16 transition-all"
                    placeholder="Nội dung này sẽ hiển thị trên bản in hóa đơn..."
                  />
                </div>

                {/* Ghi chú nội bộ */}
              </div>

              {/* Cột phải: Tài liệu & Con số tài chính */}
              <div className="col-span-5 flex flex-col justify-between">
                {/* Box Upload Tài liệu (Dựa theo ảnh image_1d329f.png) */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Ghi chú nội bộ
                  </label>
                  <textarea
                    value={ghiChuNoiBo}
                    onChange={(e) => setGhiChuNoiBo(e.target.value)}
                    className="w-full mt-1 border-b border-gray-200 focus:border-blue-400 outline-none text-sm py-2 resize-none h-16 transition-all"
                    placeholder="Chỉ nhân viên nội bộ mới nhìn thấy ghi chú này..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: Summary Sidebar */}
        <div className="w-80 bg-white border-l shadow-xl flex flex-col shrink-0">
          <div className="p-4 border-b bg-gray-50 shrink-0">
            <h4 className="font-bold text-gray-700 uppercase text-xs">
              Tổng kết tài chính
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tổng tiền hàng</span>
              <span className="font-medium">
                {formatCurrency(hoaDon.tongTien)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-red-500 italic">
              <span>Giảm giá</span>
              <span>- {formatCurrency(hoaDon.tongChietKhau)}</span>
            </div>
            <div className="flex justify-between items-center text-sm px-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Thuế</span>
                <div className="flex items-center border-b border-gray-200 focus-within:border-blue-400 w-16">
                  <input
                    type="number"
                    value={thuePhanTram}
                    onChange={(e) => setThuePhanTram(Number(e.target.value))}
                    className="w-full text-center outline-none text-xs p-1 bg-transparent"
                  />
                  <span className="text-[10px] text-gray-400">% =</span>
                </div>
              </div>
            </div>

            {/* CHI PHÍ KHÁC (VNĐ) - Ô nhập liệu */}
            <div className="flex justify-between items-center text-sm px-2">
              <span className="text-gray-500">Chi phí khác</span>
              <div className="border-b border-gray-200 focus-within:border-blue-400 w-32">
                <input
                  type="number"
                  value={chiPhiKhac}
                  onChange={(e) => {
                    setChiPhiKhac(Number(e.target.value));
                  }}
                  placeholder="Nhập VNĐ..."
                  className="w-full text-right outline-none text-xs p-1 bg-transparent font-medium"
                />
              </div>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="font-bold">Thành tiền</span>
              <span className="font-bold text-blue-600 text-lg">
                {formatCurrency(hoaDon.thanhTien)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Đã thanh toán</span>
              <span>{formatCurrency(hoaDon.daThanhToan || 0)}</span>
            </div>
            <div className="flex justify-between pt-4 border-t-2 border-dashed">
              <span className="font-black text-gray-700">CÒN LẠI</span>
              <span className="font-black text-red-600 text-xl">
                {formatCurrency(hoaDon.conLai)}
              </span>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={handleUpdateHoaDon}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 active:scale-95 transition"
              >
                CẬP NHẬT HÓA ĐƠN
              </button>
              <button
                onClick={() => exportHoaDonToExcel(hoaDon, nhaKhoaInfo)}
                className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                Xuất file Excel
              </button>
              <button
                onClick={() => navigate(`/hoa-don/${hoaDon._id}/print`)}
                className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
              >
                In hóa đơn (F4)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FOOTER */}
      <div className="h-12 bg-white border-t px-6 flex justify-end items-center shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 text-gray-700 px-6 py-1.5 rounded font-medium text-sm hover:bg-gray-300 transition"
        >
          Thoát
        </button>
      </div>
    </div>
  );
};

export default HoaDonDetail;
