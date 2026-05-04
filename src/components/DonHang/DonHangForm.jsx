import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "../../config/api";
import { createDonHang, updateDonHang } from "../../redux/slices/donHangSlice";
import DanhSachPhuKien from "./DanhSachPhuKien";
import ChonViTriRangModal from "./ChonViTriRangModal";
import SanPhamModal from "../SanPham/SanPhamModal";
import ChonDonHangCuModal from "./ChonDonHangCuModal";
import toast from "react-hot-toast";

const SearchInput = ({
  value,
  onChange,
  options = [],
  placeholder,
  label,
  showAddNew = false,
  onAddNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && options.length > 0) {
      const selectedOpt = options.find((o) => o._id === value);
      if (selectedOpt) setSearchTerm(selectedOpt.nameDisplay || "");
    } else {
      setSearchTerm("");
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    (opt?.nameDisplay || "")
      .toLowerCase()
      .includes((searchTerm || "").toLowerCase())
  );

  const avatarChar = searchTerm ? searchTerm.charAt(0).toUpperCase() : "?";

  return (
    <div className="flex items-center gap-3 relative" ref={wrapperRef}>
      <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase">
        {avatarChar}
      </div>
      <div className="flex-1 relative">
        {label && (
          <label className="text-[11px] text-gray-500 absolute -top-3 left-0">
            {label}
          </label>
        )}
        <input
          type="text"
          className="w-full border-b border-gray-300 outline-none pb-1 text-sm bg-transparent focus:border-blue-500"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          onFocus={() => setIsOpen(true)}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              onChange("");
            }}
            className="absolute right-0 top-0 text-gray-400 hover:text-gray-600 font-bold"
          >
            &times;
          </button>
        )}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border shadow-lg rounded z-[100] max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt._id}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSearchTerm(opt.nameDisplay);
                    onChange(opt._id);
                    setIsOpen(false);
                  }}
                >
                  {opt.nameDisplay}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 italic">
                Không tìm thấy kết quả
              </div>
            )}
            {showAddNew && (
              <div
                onClick={() => {
                  setIsOpen(false);
                  if (onAddNew) onAddNew();
                }}
                className="px-3 py-2 border-t text-green-600 font-medium hover:bg-gray-50 cursor-pointer flex items-center gap-2"
              >
                <span>+</span> Thêm mới
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DonHangForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [nhaKhoasList, setNhaKhoasList] = useState([]);
  const [allBacSi, setAllBacSi] = useState([]);
  const [allBenhNhan, setAllBenhNhan] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [selectedNhaKhoaInfo, setSelectedNhaKhoaInfo] = useState(null);

  const [isViTriModalOpen, setIsViTriModalOpen] = useState(false);
  const [editingSpIndex, setEditingSpIndex] = useState(null);
  const [isSanPhamModalOpen, setIsSanPhamModalOpen] = useState(false);

  // <-- THÊM MỚI: State quản lý Modal Chọn Đơn Cũ
  const [modalDonHangCuInfo, setModalDonHangCuInfo] = useState({
    isOpen: false,
    index: null,
    loaiDon: "",
  });

  const [formData, setFormData] = useState({
    nhaKhoa: "",
    bacSi: "",
    benhNhan: "",
    ngayNhan: new Date().toISOString().slice(0, 16),
    yeuCauHoanThanh: "",
    henGiao: "",
    danhSachSanPham: [
      {
        loaiDon: "Mới",
        sanPham: "",
        viTri: [],
        soLuong: 1,
        mau: "",
        ghiChu: "",
      },
    ],
    danhSachPhuKien: [],
    chiDinhBacSi: "",
    ghiChuChung: "",
    ghiChuTaiChinh: "",
  });

  const fetchSanPhamData = async () => {
    try {
      const res = await api.get("/sanpham");
      setSanPhamList(
        (res.data.data || res.data || []).map((sp) => ({
          ...sp,
          nameDisplay: sp.tenSanPham,
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resNk, resBs, resBn] = await Promise.all([
          api.get("/nhakhoa"),
          api.get("/nguoilienhe"),
          api.get("/benhnhan"),
        ]);

        setNhaKhoasList(
          (resNk.data.data || resNk.data || []).map((nk) => ({
            ...nk,
            nameDisplay: nk.tenGiaoDich || nk.hoVaTen,
          }))
        );
        setAllBacSi(
          (resBs.data.data || resBs.data || []).map((bs) => ({
            ...bs,
            nameDisplay: bs.hoVaTen,
          }))
        );
        setAllBenhNhan(
          (resBn.data.data || resBn.data || []).map((bn) => ({
            ...bn,
            nameDisplay: bn.hoVaTen,
          }))
        );

        await fetchSanPhamData();
      } catch (err) {
        console.error("Lỗi tải DB:", err);
      }
    };
    fetchMasterData();
  }, []);

  const bacSiList = formData.nhaKhoa
    ? allBacSi.filter(
        (bs) => (bs.nhaKhoa?._id || bs.nhaKhoa) === formData.nhaKhoa
      )
    : [];
  const benhNhanList = formData.nhaKhoa
    ? allBenhNhan.filter(
        (bn) => (bn.nhaKhoa?._id || bn.nhaKhoa) === formData.nhaKhoa
      )
    : [];

  useEffect(() => {
    if (isEditMode) {
      api
        .get(`/donhang/${id}`)
        .then((res) => {
          const dh = res.data.data;
          setFormData({
            ...dh,
            nhaKhoa: dh.nhaKhoa?._id || dh.nhaKhoa,
            bacSi: dh.bacSi?._id || dh.bacSi,
            benhNhan: dh.benhNhan?._id || dh.benhNhan,
            ngayNhan: dh.ngayNhan
              ? new Date(dh.ngayNhan).toISOString().slice(0, 16)
              : "",
            yeuCauHoanThanh: dh.yeuCauHoanThanh
              ? new Date(dh.yeuCauHoanThanh).toISOString().slice(0, 16)
              : "",
            henGiao: dh.henGiao
              ? new Date(dh.henGiao).toISOString().slice(0, 16)
              : "",
            danhSachSanPham: (dh.danhSachSanPham || []).map((sp) => ({
              ...sp,
              sanPham: sp.sanPham?._id || sp.sanPham || "",
              donHangCu: sp.donHangCu?._id || sp.donHangCu || null,
            })),
          });
        })
        .catch(() => toast.error("Không thể tải thông tin đơn hàng"));
    }
  }, [id, isEditMode]);

  useEffect(() => {
    if (formData.nhaKhoa) {
      setSelectedNhaKhoaInfo(
        nhaKhoasList.find((nk) => nk._id === formData.nhaKhoa)
      );
    } else {
      setSelectedNhaKhoaInfo(null);
    }
  }, [formData.nhaKhoa, nhaKhoasList]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // <-- THÊM MỚI: Xử lý bật Modal khi chọn Hàng sửa/Làm lại
  const handleSanPhamChange = (index, field, value) => {
    const newDsSp = [...formData.danhSachSanPham];
    newDsSp[index][field] = value;
    setFormData({ ...formData, danhSachSanPham: newDsSp });

    if (
      field === "loaiDon" &&
      ["Hàng sửa", "Hàng làm lại", "Hàng bảo hành"].includes(value)
    ) {
      if (!formData.benhNhan) {
        alert(
          "Vui lòng chọn Bệnh nhân ở cột trái trước để hệ thống tìm đơn hàng cũ!"
        );
        // Reset về "Mới" nếu chưa có bệnh nhân
        const resetDsSp = [...formData.danhSachSanPham];
        resetDsSp[index][field] = "Mới";
        setFormData({ ...formData, danhSachSanPham: resetDsSp });
        return;
      }
      setModalDonHangCuInfo({ isOpen: true, index: index, loaiDon: value });
    }
  };

  // <-- THÊM MỚI: Đắp dữ liệu từ đơn cũ sang dòng hiện tại
  const handleApplyOldOrder = (oldOrder) => {
    const index = modalDonHangCuInfo.index;
    const newDsSp = [...formData.danhSachSanPham];

    // Lấy sản phẩm đầu tiên của đơn cũ (bạn có thể tuỳ biến thêm nếu 1 đơn có nhiều SP)
    const oldProduct = oldOrder.danhSachSanPham?.[0] || {};

    newDsSp[index] = {
      ...newDsSp[index],
      sanPham: oldProduct.sanPham?._id || oldProduct.sanPham || "",
      viTri: oldProduct.viTri || [],
      soLuong: oldProduct.soLuong || 1,
      mau: oldProduct.mau || "",
      ghiChu: oldProduct.ghiChu || "",
    };

    setFormData({ ...formData, danhSachSanPham: newDsSp });
    setModalDonHangCuInfo({ isOpen: false, index: null, loaiDon: "" });
  };

  const handleRemoveSanPham = (index) => {
    const newDsSp = [...formData.danhSachSanPham];
    newDsSp.splice(index, 1);
    setFormData({ ...formData, danhSachSanPham: newDsSp });
  };

  const handleSaveViTri = (dataViTri) => {
    let totalTeeth = 0;
    dataViTri.forEach((item) => {
      totalTeeth += item.soRang.length;
    });
    if (totalTeeth > 32) totalTeeth = 32;
    if (totalTeeth === 0) totalTeeth = 1;

    const newDsSp = [...formData.danhSachSanPham];
    newDsSp[editingSpIndex].viTri = dataViTri;
    newDsSp[editingSpIndex].soLuong = totalTeeth;
    setFormData({ ...formData, danhSachSanPham: newDsSp });
    setIsViTriModalOpen(false);
  };

  const handleSave = () => {
    if (!formData.nhaKhoa || !formData.bacSi || !formData.benhNhan) {
      toast.error("Vui lòng nhập đầy đủ Nha Khoa, Bác Sĩ, Bệnh Nhân!");
      return;
    }
    const action = isEditMode
      ? updateDonHang({ id, data: formData })
      : createDonHang(formData);
    const promise = dispatch(action).unwrap();
    toast.promise(promise, {
      loading: isEditMode ? "Đang lưu thay đổi..." : "Đang tạo đơn hàng...",
      success: isEditMode
        ? "Cập nhật đơn hàng thành công!"
        : "Tạo đơn hàng thành công!",
      error: (err) =>
        err || (isEditMode ? "Cập nhật thất bại" : "Tạo đơn hàng thất bại"),
    });
    promise.then(() => navigate(-1)).catch(() => {});
  };

  const renderViTriText = (viTriArr) => {
    if (!viTriArr || viTriArr.length === 0) return "";
    return viTriArr
      .map((v) =>
        v.kieu === "Rời"
          ? v.soRang.join(", ")
          : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
      )
      .join("; ");
  };

  return (
    <div className="fixed inset-0 z-[1299] bg-[#f0f2f5] flex flex-col w-full h-full overflow-hidden">
      {/* Top bar */}
      <div className="h-10 bg-[#00a8ff] flex justify-between items-center px-4 shrink-0">
        <span className="text-white font-medium text-sm">
          {isEditMode ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
        </span>
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-bold leading-none hover:text-gray-200 transition"
        >
          &times;
        </button>
      </div>

      {/* Body: main form + right side panel */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Main form (scrollable) */}
        <div className="flex-1 overflow-y-auto pb-16">
          <div className="w-full mt-4 flex flex-col gap-4">
            {/* Section 1: Customer info + clinic info + dates */}
            <div className="flex gap-0 w-full bg-white border-b border-gray-200 shadow-sm">
              <div className="w-[30%] p-4 flex flex-col gap-6 border-r">
                <SearchInput
                  label="Nha khoa"
                  options={nhaKhoasList}
                  value={formData.nhaKhoa}
                  onChange={(val) => {
                    setFormData({
                      ...formData,
                      nhaKhoa: val,
                      bacSi: "",
                      benhNhan: "",
                    });
                  }}
                />
                <SearchInput
                  label="Bác sĩ"
                  options={bacSiList}
                  value={formData.bacSi}
                  onChange={(val) => setFormData({ ...formData, bacSi: val })}
                />
                <SearchInput
                  label="Bệnh nhân"
                  options={benhNhanList}
                  value={formData.benhNhan}
                  onChange={(val) =>
                    setFormData({ ...formData, benhNhan: val })
                  }
                />
              </div>
              <div className="w-[40%] bg-[#e8f6fc] p-4 text-sm flex flex-col gap-2 pt-6">
                <div className="flex">
                  <span className="text-gray-500 w-20">Địa chỉ:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {selectedNhaKhoaInfo?.diaChiCuThe || ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">Điện thoại:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {selectedNhaKhoaInfo?.soDienThoai || ""}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-20">Mô tả:</span>{" "}
                  <span className="font-medium text-gray-800">
                    {selectedNhaKhoaInfo?.moTa || ""}
                  </span>
                </div>
              </div>
              <div className="w-[30%] p-4 flex flex-col gap-4 pt-6 border-l bg-white">
                <div className="flex justify-between items-center border-b pb-1">
                  <label className="text-sm text-gray-500">Ngày nhận</label>
                  <input
                    type="datetime-local"
                    name="ngayNhan"
                    value={formData.ngayNhan}
                    onChange={handleInputChange}
                    className="text-sm outline-none bg-transparent text-gray-700"
                  />
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <label className="text-sm text-gray-500">
                    Y/c hoàn thành
                  </label>
                  <input
                    type="datetime-local"
                    name="yeuCauHoanThanh"
                    value={formData.yeuCauHoanThanh}
                    onChange={handleInputChange}
                    className="text-sm outline-none bg-transparent text-gray-700"
                  />
                </div>
                <div className="flex justify-between items-center border-b pb-1">
                  <label className="text-sm text-gray-500">Hẹn giao</label>
                  <input
                    type="datetime-local"
                    name="henGiao"
                    value={formData.henGiao}
                    onChange={handleInputChange}
                    className="text-sm outline-none bg-transparent text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Products table */}
            <div className="w-full bg-white shadow-sm border-t border-b border-gray-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f0f9ff] text-gray-600 border-b">
                  <tr>
                    <th className="p-3 w-32 font-medium">Loại</th>
                    <th className="p-3 w-[30%] font-medium">Sản phẩm</th>
                    <th className="p-3 w-40 font-medium">Vị trí</th>
                    <th className="p-3 w-20 text-center font-medium">
                      Số lượng
                    </th>
                    <th className="p-3 w-28 font-medium">Màu</th>
                    <th className="p-3 font-medium">Ghi chú</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.danhSachSanPham.map((sp, index) => (
                    <tr key={index} className="border-b bg-[#e1f5fe]">
                      <td className="p-2">
                        <select
                          value={sp.loaiDon}
                          onChange={(e) =>
                            handleSanPhamChange(
                              index,
                              "loaiDon",
                              e.target.value
                            )
                          }
                          className="w-full border-b border-blue-200 p-1 outline-none bg-transparent"
                        >
                          <option value="Mới">Mới</option>
                          <option value="Hàng sửa">Hàng sửa</option>
                          <option value="Hàng làm lại">Hàng làm lại</option>
                          <option value="Hàng bảo hành">Hàng bảo hành</option>
                        </select>
                      </td>
                      <td className="p-2 align-top pt-3">
                        <SearchInput
                          placeholder="Tìm sản phẩm..."
                          options={sanPhamList}
                          value={sp.sanPham}
                          onChange={(val) =>
                            handleSanPhamChange(index, "sanPham", val)
                          }
                          showAddNew={true}
                          onAddNew={() => setIsSanPhamModalOpen(true)}
                        />
                      </td>
                      <td className="p-2">
                        <div
                          onClick={() => {
                            setEditingSpIndex(index);
                            setIsViTriModalOpen(true);
                          }}
                          className="w-full border-b border-blue-200 p-1 bg-transparent cursor-pointer text-blue-600 hover:text-blue-800 min-h-[30px] flex items-center"
                        >
                          {renderViTriText(sp.viTri) || (
                            <span className="text-blue-400 italic font-medium">
                              Chọn răng...
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="w-full border-b border-blue-200 p-1 text-center font-bold text-gray-700 min-h-[30px] flex items-center justify-center">
                          {sp.soLuong}
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={sp.mau}
                          onChange={(e) =>
                            handleSanPhamChange(index, "mau", e.target.value)
                          }
                          className="w-full border-b border-blue-200 p-1 outline-none bg-transparent"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={sp.ghiChu}
                          onChange={(e) =>
                            handleSanPhamChange(index, "ghiChu", e.target.value)
                          }
                          className="w-full border-b border-blue-200 p-1 outline-none bg-transparent"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveSanPham(index)}
                          className="text-gray-400 hover:text-red-500 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5 mx-auto"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="7" className="p-0 bg-[#f0f9ff]">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            danhSachSanPham: [
                              ...formData.danhSachSanPham,
                              {
                                loaiDon: "Mới",
                                sanPham: "",
                                viTri: [],
                                soLuong: 1,
                                mau: "",
                                ghiChu: "",
                              },
                            ],
                          })
                        }
                        className="w-full py-4 px-6 text-green-600 font-bold hover:bg-blue-100 cursor-pointer flex items-center justify-start gap-2 transition"
                      >
                        <span className="text-3xl leading-none font-black">
                          +
                        </span>
                        <span className="text-sm mt-1">Thêm sản phẩm</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side panel: 2 tabs – Sản xuất / Ghi chú */}
        <RightSidePanel
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />
      </div>

      {/* Footer save bar */}
      <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-t z-10 shadow-lg shrink-0">
        <button className="bg-gray-500 text-white px-4 py-1.5 rounded text-sm">
          Cập nhật phiên bản mới!
        </button>
        <button
          onClick={handleSave}
          className="bg-[#4CAF50] hover:bg-green-600 text-white px-8 py-2 rounded shadow-md font-medium"
        >
          Lưu (F3)
        </button>
      </div>

      <ChonViTriRangModal
        isOpen={isViTriModalOpen}
        onClose={() => setIsViTriModalOpen(false)}
        initialViTri={formData.danhSachSanPham[editingSpIndex]?.viTri || []}
        onSave={handleSaveViTri}
      />

      {isSanPhamModalOpen && (
        <SanPhamModal
          open={isSanPhamModalOpen}
          handleClose={() => {
            setIsSanPhamModalOpen(false);
            fetchSanPhamData();
          }}
        />
      )}

      <ChonDonHangCuModal
        isOpen={modalDonHangCuInfo.isOpen}
        onClose={() =>
          setModalDonHangCuInfo({ isOpen: false, index: null, loaiDon: "" })
        }
        onSelect={handleApplyOldOrder}
        patientId={formData.benhNhan}
        nhaKhoaName={selectedNhaKhoaInfo?.nameDisplay}
        bacSiName={bacSiList.find((b) => b._id === formData.bacSi)?.nameDisplay}
        benhNhanName={
          benhNhanList.find((b) => b._id === formData.benhNhan)?.nameDisplay
        }
        loaiDon={modalDonHangCuInfo.loaiDon}
      />
    </div>
  );
};

/* ===== Right side panel ===== */
const RightSidePanel = ({ formData, setFormData, handleInputChange }) => {
  const [activeTab, setActiveTab] = useState("ghichu");

  return (
    <div className="w-72 border-l bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b shrink-0">
        {[
          { key: "sanxuat", label: "Sản xuất" },
          { key: "ghichu", label: "Ghi chú" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-700 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "sanxuat" && (
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-gray-700">
              Phụ kiện đi kèm
            </h4>
            <DanhSachPhuKien
              phuKienDaChon={formData.danhSachPhuKien}
              setPhuKienDaChon={(data) =>
                setFormData({ ...formData, danhSachPhuKien: data })
              }
            />
          </div>
        )}

        {activeTab === "ghichu" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Chỉ định của bác sĩ
              </label>
              <textarea
                name="chiDinhBacSi"
                value={formData.chiDinhBacSi}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded p-2 text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400"
                placeholder="Nhập chỉ định..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Ghi chú chung
              </label>
              <textarea
                name="ghiChuChung"
                value={formData.ghiChuChung}
                onChange={handleInputChange}
                rows={4}
                className="w-full border rounded p-2 text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400"
                placeholder="Nhập ghi chú..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">
                Ghi chú tài chính
              </label>
              <textarea
                name="ghiChuTaiChinh"
                value={formData.ghiChuTaiChinh}
                onChange={handleInputChange}
                rows={3}
                className="w-full border rounded p-2 text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400"
                placeholder="Nhập ghi chú tài chính..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonHangForm;
