import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteDonHang, updateDonHang } from "../../redux/slices/donHangSlice";
import toast from "react-hot-toast";

const DonHangDetailPanel = ({ donHang, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chitiet");
  const isOpen = !!donHang;

  const maDonHang = donHang
    ? `TAN${donHang._id.substring(donHang._id.length - 8).toUpperCase()}`
    : "";

  const trangThaiColor = {
    "Chờ xử lý": "bg-yellow-200 text-yellow-900",
    "Đang sản xuất": "bg-blue-200 text-blue-900",
    "Hoàn thành": "bg-green-200 text-green-900",
    "Đã giao": "bg-gray-200 text-gray-800",
  };

  const handleEdit = () => {
    navigate(`/donhang/${donHang._id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${maDonHang}?`)) {
      const promise = dispatch(deleteDonHang(donHang._id)).unwrap();
      toast.promise(promise, {
        loading: "Đang xóa...",
        success: `Đã xóa đơn hàng ${maDonHang}`,
        error: (err) => err || "Xóa đơn hàng thất bại",
      });
      promise.then(() => onClose()).catch(() => {});
    }
  };

  const handleMarkComplete = () => {
    const payload = {
      ...donHang,
      trangThai: "Hoàn thành",
      nhaKhoa: donHang.nhaKhoa?._id || donHang.nhaKhoa,
      bacSi: donHang.bacSi?._id || donHang.bacSi,
      benhNhan: donHang.benhNhan?._id || donHang.benhNhan,
      danhSachSanPham: donHang.danhSachSanPham?.map((sp) => ({
        ...sp,
        sanPham: sp.sanPham?._id || sp.sanPham,
        donHangCu: sp.donHangCu?._id || sp.donHangCu || undefined,
      })),
    };
    const promise = dispatch(
      updateDonHang({ id: donHang._id, data: payload })
    ).unwrap();
    toast.promise(promise, {
      loading: "Đang cập nhật...",
      success: `Đơn hàng ${maDonHang} đã hoàn thành!`,
      error: (err) => err || "Cập nhật trạng thái thất bại",
    });
  };

  const renderViTriText = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return null;
    return viTriArr
      .map((v) =>
        v.kieu === "Rời"
          ? v.soRang.join(", ")
          : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
      )
      .join("; ");
  };

  const tabs = [
    { key: "chitiet", label: "Chi tiết" },
    { key: "sanxuat", label: "Sản xuất" },
    { key: "ghichu", label: "Ghi chú" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed right-0 top-0 pt-16 h-full w-[440px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-base truncate">{maDonHang}</span>
            {donHang && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  trangThaiColor[donHang.trangThai] ||
                  "bg-gray-200 text-gray-800"
                }`}
              >
                {donHang.trangThai || "Chờ xử lý"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={handleEdit}
              title="Chỉnh sửa"
              className="p-1.5 rounded hover:bg-teal-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              title="Xóa đơn hàng"
              className="p-1.5 rounded hover:bg-red-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              title="Đóng"
              className="p-1.5 rounded hover:bg-teal-600 transition text-xl font-bold leading-none ml-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium transition border-b-2 ${
                activeTab === tab.key
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {donHang && activeTab === "chitiet" && (
            <div className="p-4 flex flex-col gap-4">
              {/* Basic info card */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm flex flex-col gap-2 border">
                <InfoRow
                  label="Nha khoa"
                  value={
                    donHang.nhaKhoa?.tenGiaoDich || donHang.nhaKhoa?.hoVaTen
                  }
                />
                <InfoRow label="Bác sĩ" value={donHang.bacSi?.hoVaTen} />
                <InfoRow label="Bệnh nhân" value={donHang.benhNhan?.hoVaTen} />
              </div>

              {/* Dates grid */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <DateCard
                  label="Ngày nhận"
                  value={donHang.ngayNhan}
                  colorClass="bg-blue-50 border-blue-100"
                  format="datetime"
                />
                <DateCard
                  label="Hẹn giao"
                  value={donHang.henGiao}
                  colorClass="bg-orange-50 border-orange-100"
                  format="date"
                />
                <DateCard
                  label="Y/c hoàn thành"
                  value={donHang.yeuCauHoanThanh}
                  colorClass="bg-purple-50 border-purple-100"
                  format="datetime"
                />
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-3">
                  <div className="text-gray-500 text-xs mb-1">Trạng thái</div>
                  <div className="font-medium text-teal-800">
                    {donHang.trangThai || "Chờ xử lý"}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Danh sách sản phẩm
                </h4>
                {donHang.danhSachSanPham?.length > 0 ? (
                  donHang.danhSachSanPham.map((sp, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-3 mb-2 text-sm bg-blue-50 border-blue-100"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-medium text-blue-800">
                          {sp.sanPham?.tenSanPham || "N/A"}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                            {sp.loaiDon}
                          </span>
                          <span className="text-xs text-gray-500">
                            ×{sp.soLuong}
                          </span>
                        </div>
                      </div>
                      {sp.viTri?.length > 0 && (
                        <div className="text-gray-600 text-xs mt-1">
                          Răng: {renderViTriText(sp.viTri)}
                        </div>
                      )}
                      {sp.mau && (
                        <div className="text-gray-600 text-xs mt-0.5">
                          Màu: {sp.mau}
                        </div>
                      )}
                      {sp.ghiChu && (
                        <div className="text-gray-500 italic text-xs mt-0.5">
                          {sp.ghiChu}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm italic">
                    Chưa có sản phẩm
                  </div>
                )}
              </div>

              {/* Accessories */}
              {donHang.danhSachPhuKien?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Phụ kiện đi kèm
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {donHang.danhSachPhuKien.map((pk, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-gray-100 rounded px-2 py-1.5 border border-gray-200"
                      >
                        <span className="font-medium text-gray-700">
                          {pk.tenPhuKien}
                        </span>
                        <span className="text-gray-500 ml-1">
                          ×{pk.soLuong}
                        </span>
                        <span className="text-gray-400 ml-1 text-[11px]">
                          ({pk.soHuu})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mark complete button */}
              <button
                onClick={handleMarkComplete}
                disabled={donHang.trangThai === "Hoàn thành"}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition flex items-center justify-center gap-2 mt-1 ${
                  donHang.trangThai === "Hoàn thành"
                    ? "bg-green-100 text-green-700 cursor-default border border-green-200"
                    : "bg-green-500 hover:bg-green-600 text-white shadow-sm"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                {donHang.trangThai === "Hoàn thành"
                  ? "Đã hoàn thành"
                  : "Đánh dấu hoàn thành"}
              </button>
            </div>
          )}

          {donHang && activeTab === "sanxuat" && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Quy trình sản xuất
              </h4>
              {donHang.danhSachSanPham?.map((sp, idx) => (
                <div
                  key={idx}
                  className="mb-4 border rounded-lg overflow-hidden"
                >
                  <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium">
                    {sp.sanPham?.tenSanPham || `Sản phẩm ${idx + 1}`}
                  </div>
                  <div className="p-3 text-sm text-gray-500 italic">
                    {sp.sanPham?.congDoan?.length > 0 ? (
                      <ul className="flex flex-col gap-2">
                        {sp.sanPham.congDoan.map((cd, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-gray-700"
                          >
                            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {i + 1}
                            </span>
                            {cd.tenCongDoan || cd}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>Chưa có thông tin công đoạn</span>
                    )}
                  </div>
                </div>
              ))}
              {(!donHang.danhSachSanPham ||
                donHang.danhSachSanPham.length === 0) && (
                <div className="text-gray-400 text-sm italic text-center mt-8">
                  Chưa có sản phẩm
                </div>
              )}
            </div>
          )}

          {donHang && activeTab === "ghichu" && (
            <div className="p-4 flex flex-col gap-4 text-sm">
              <NoteBlock
                label="Chỉ định của bác sĩ"
                value={donHang.chiDinhBacSi}
              />
              <NoteBlock label="Ghi chú chung" value={donHang.ghiChuChung} />
              <NoteBlock
                label="Ghi chú tài chính"
                value={donHang.ghiChuTaiChinh}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex gap-2 items-start">
    <span className="text-gray-500 w-24 shrink-0">{label}:</span>
    <span className="font-medium text-gray-800">
      {value || <span className="text-gray-400 italic font-normal">--</span>}
    </span>
  </div>
);

const DateCard = ({ label, value, colorClass, format }) => {
  const formatted = value
    ? format === "datetime"
      ? new Date(value).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date(value).toLocaleDateString("vi-VN")
    : "--";
  return (
    <div className={`${colorClass} border rounded-lg p-3`}>
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      <div className="font-medium text-gray-800 text-sm">{formatted}</div>
    </div>
  );
};

const NoteBlock = ({ label, value }) => (
  <div>
    <h4 className="font-semibold text-gray-700 mb-1.5">{label}</h4>
    <div className="bg-gray-50 rounded-lg p-3 text-gray-700 min-h-[56px] border border-gray-100">
      {value || <span className="text-gray-400 italic">Không có</span>}
    </div>
  </div>
);

export default DonHangDetailPanel;
