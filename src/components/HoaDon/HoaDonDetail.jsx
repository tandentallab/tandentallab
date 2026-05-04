import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteHoaDon,
  fetchAllHoaDonAdmin,
  updateHoaDon,
} from "../../redux/slices/hoaDonSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import { Button, IconButton, Tooltip } from "@mui/material";
import { DeleteIcon, EditIcon, TrashIcon } from "lucide-react";

const HoaDonDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [hoaDon, setHoaDon] = useState(null);
  const [nhaKhoaInfo, setNhaKhoaInfo] = useState(null);

  const dispatch = useDispatch();
  const { danhSachHoaDon } = useSelector((state) => state.hoaDon);

  // Lấy danh sách nha khoa khi component mount
  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  const nhaKhoa = useSelector((state) => state.nhaKhoa);

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

          // ✅ TÌM NHA KHOA TRONG REDUX (GIỐNG TABLE)
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
  }, [id, dispatch, danhSachHoaDon]);

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!hoaDon) return <div className="p-4">Không tìm thấy hóa đơn</div>;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleUpdateHoaDon = () => {
    if (window.confirm("Bạn có chắc muốn cập nhật hóa đơn?")) {
      console.log("Hóa đơn cập nhật: ", hoaDon);
      dispatch(updateHoaDon({ id: hoaDon._id, data: hoaDon }));
    }
  };

  const handleDiscountChange = (index, field, value) => {
    const newHoaDon = { ...hoaDon };
    const items = [...newHoaDon.danhSachDonHang];

    const item = { ...items[index] };

    // update field
    item[field] = value;

    const tong = item.tongTien || 0;
    let thanhTien = tong;

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

    // 🔥 TÍNH LẠI TỔNG
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

  const handleDelete = (index) => {
    const newHoaDon = { ...hoaDon };

    const items = newHoaDon.danhSachDonHang.filter((_, i) => i !== index);

    newHoaDon.danhSachDonHang = items;

    // 🔥 TÍNH LẠI TỔNG
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

  return (
    <div className="fixed inset-0 z-[1299] bg-[#f0f2f5] flex flex-col w-full h-full overflow-hidden">
      {/* Top bar */}
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4 shrink-0">
        <span className="text-white font-medium text-sm">
          Chi tiết hóa đơn: {hoaDon.soHoaDon}
        </span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Section 1: Header Info */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white p-4 shadow-sm border border-gray-200 rounded">
              <h3 className="text-blue-600 font-bold mb-3 border-b pb-2 uppercase text-xs">
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Nha khoa:</span>
                <span className="font-medium">
                  {nhaKhoaInfo?.hoVaTen || "Đang tải..."}
                </span>
                <span className="text-gray-500">Địa chỉ:</span>
                <span>
                  {`${nhaKhoaInfo?.diaChiCuThe} - ${nhaKhoaInfo?.quanHuyen} - ${nhaKhoaInfo?.tinh}` ||
                    "---"}
                </span>
                <span className="text-gray-500">Email:</span>
                <span>{nhaKhoaInfo?.email || "---"}</span>
              </div>
            </div>

            <div className="w-1/3 bg-white p-4 shadow-sm border border-gray-200 rounded">
              <h3 className="text-blue-600 font-bold mb-3 border-b pb-2 uppercase text-xs">
                Chứng từ
              </h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-gray-500">Số hóa đơn:</span>
                <span className="font-bold text-red-600">
                  TAN{hoaDon._id.substring(hoaDon._id.length - 8).toUpperCase()}
                </span>
                <span className="text-gray-500">Ngày xuất:</span>
                <span>
                  {new Date(hoaDon.ngayXuatHoaDon).toLocaleString("vi-VN")}
                </span>
                <span className="text-gray-500">Trạng thái:</span>
                <span
                  className={`font-medium ${
                    hoaDon.trangThai === "Chưa thanh toán"
                      ? "text-orange-500"
                      : "text-green-600"
                  }`}
                >
                  {hoaDon.trangThai}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Table Orders */}
          <div className="bg-white shadow-sm border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8f9fa] text-gray-600 border-b">
                <tr>
                  <th className="p-3 font-medium">STT</th>
                  <th className="p-3 font-medium">Mã đơn hàng</th>
                  <th className="p-3 font-medium text-right">Tổng tiền gốc</th>
                  <th className="p-3 font-medium text-center">Chiết khấu</th>
                  <th className="p-3 font-medium text-right">Thành tiền</th>
                  <th className="p-3 font-medium text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {hoaDon.danhSachDonHang.map((item, index) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{index + 1}</td>
                    <td className="p-3 font-medium text-blue-600">
                      <Button
                        variant="text"
                        onClick={() => {
                          navigate(`/donhang/${item.donHang?._id}/edit`);
                        }}
                      >
                        TAN
                        {item.donHang?._id
                          .substring(item.donHang?._id?.length - 8)
                          .toUpperCase()}
                      </Button>
                    </td>
                    <td className="p-3 text-right">
                      {formatCurrency(item.tongTien)}
                    </td>
                    {/* <td className="p-3 text-center">
                      {item.chietKhau}{" "}
                      {item.loaiChietKhau === "phanTram" ? "%" : "đ"}
                    </td> */}
                    {/* ✅ CHIẾT KHẤU 2 INPUT */}
                    <td className="p-3 text-center">
                      {" "}
                      <div className="flex gap-2 justify-center">
                        {" "}
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
                          className="w-16 border rounded text-center"
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
                          className="border rounded"
                        >
                          <option value="phanTram">%</option>
                          <option value="tienMat">VNĐ</option>{" "}
                          {/* ⚠️ sửa lại đúng với backend */}
                        </select>
                      </div>{" "}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatCurrency(item.thanhTienSauCK)}
                    </td>
                    <td>
                      <Tooltip title="Xóa đơn hàng khỏi hóa đơn">
                        <IconButton>
                          <EditIcon
                            onClick={() => {
                              navigate(`/donhang/${item.donHang?._id}/edit`);
                            }}
                          ></EditIcon>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa đơn hàng khỏi hóa đơn">
                        <IconButton onClick={() => handleDelete(index)}>
                          <TrashIcon size={18} />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side panel: Summary Financials */}
        <div className="w-80 border-l bg-white flex flex-col shrink-0">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider">
              Tổng kết tài chính
            </h4>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tổng tiền hàng:</span>
              <span className="font-medium">
                {formatCurrency(hoaDon.tongTien)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-red-500">
              <span>Tổng chiết khấu:</span>
              <span>- {formatCurrency(hoaDon.tongChietKhau)}</span>
            </div>
            <hr />
            <div className="flex justify-between text-base">
              <span className="font-bold">Thành tiền:</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(hoaDon.thanhTien)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Đã thanh toán:</span>
              <span>{formatCurrency(hoaDon.daThanhToan)}</span>
            </div>
            <div className="flex justify-between text-lg border-t pt-2 mt-2">
              <span className="font-bold text-gray-700">Còn lại:</span>
              <span className="font-black text-red-600">
                {formatCurrency(hoaDon.conLai)}
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-2">
              <button
                onClick={handleUpdateHoaDon}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium shadow hover:bg-blue-700 transition"
              >
                Cập nhật hóa đơn
              </button>
              <button className="w-full bg-blue-600 text-white py-2 rounded font-medium shadow hover:bg-blue-700 transition">
                In hóa đơn (F4)
              </button>
              <button className="w-full bg-white border border-blue-600 text-blue-600 py-2 rounded font-medium hover:bg-blue-50 transition">
                Gửi email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-gray-100 px-6 py-3 flex justify-end items-center border-t z-10 shadow-lg shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded shadow-md font-medium"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default HoaDonDetail;
