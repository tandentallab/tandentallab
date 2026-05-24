import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../config/api";
import { createDonHang, updateDonHang } from "../../redux/slices/donHangSlice";
import DanhSachPhuKien from "./DanhSachPhuKien";
import ChonViTriRangModal from "./ChonViTriRangModal";
import SanPhamModal from "../SanPham/SanPhamModal";
import ChonDonHangCuModal from "./ChonDonHangCuModal";
import DonHangDetailPanel from "./DonHangDetailPanel";
import PhieuBaoHanhModal from "./PhieuBaoHanhModal";
import PhieuBaoHanhList from "./PhieuBaoHanhList";
import WarrantyCardPrint from "./WarrantyCardPrint";
import { toast } from "sonner";

// ===== QUICK ADD MODALS =====
const QuickAddModal = ({ open, onClose, title, children, onSubmit, loading }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="font-bold text-base mb-4 text-blue-700">{title}</h3>
        <div className="flex flex-col gap-3">{children}</div>
        <div className="flex gap-2 mt-5 justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-50">Hủy</button>
          <button onClick={onSubmit} disabled={loading} className="px-4 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50">
            {loading ? "Đang lưu..." : "Thêm"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const QuickAddField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="text-xs text-gray-500">{label}</label>
    {type === "select" ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full border-b border-gray-300 outline-none py-1 text-sm mt-1 bg-transparent">
        {placeholder}
      </select>
    ) : type === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={2}
        className="w-full border border-gray-200 rounded outline-none py-1 px-2 text-sm mt-1 resize-none" placeholder={placeholder} />
    ) : (
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full border-b border-gray-300 outline-none py-1 text-sm mt-1" placeholder={placeholder} />
    )}
  </div>
);

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
                  if (onAddNew) onAddNew(searchTerm);
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

// Convert Date to local datetime string for date/time inputs (YYYY-MM-DDTHH:mm)
const toLocalDT = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DonHangForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Current user for nhật ký
  const { user } = useSelector((state) => state.auth);
  const nguoiThuc = user?.HoTenNV || "Điều Phối";

  const [nhaKhoasList, setNhaKhoasList] = useState([]);
  const [allBacSi, setAllBacSi] = useState([]);
  const [allBenhNhan, setAllBenhNhan] = useState([]);
  const [sanPhamList, setSanPhamList] = useState([]);
  const [selectedNhaKhoaInfo, setSelectedNhaKhoaInfo] = useState(null);

  // Quick-add modal states
  const [yeuCauThuModal, setYeuCauThuModal] = useState({ open: false, spIndex: null });
  const [quickAddNhaKhoa, setQuickAddNhaKhoa] = useState({ open: false, loading: false, form: { hoVaTen: "", tenGiaoDich: "", soDienThoai: "", email: "", website: "", diaChiCuThe: "", tinh: "", moTa: "" } });
  const [quickAddBacSi, setQuickAddBacSi] = useState({ open: false, loading: false, form: { hoVaTen: "", email: "", soDienThoai: "", tieuDe: "", moTa: "" } });
  const [quickAddBenhNhan, setQuickAddBenhNhan] = useState({ open: false, loading: false, form: { hoVaTen: "", soHoSo: "", gioiTinh: "", tinh: "", quanHuyen: "" } });

  const [isViTriModalOpen, setIsViTriModalOpen] = useState(false);
  const [editingSpIndex, setEditingSpIndex] = useState(null);
  const [isSanPhamModalOpen, setIsSanPhamModalOpen] = useState(false);
  const [donHangGocView, setDonHangGocView] = useState(null); // { _id } để xem detail panel đơn gốc

  // <-- THÊM MỚI: State quản lý Modal Chọn Đơn Cũ
  const [modalDonHangCuInfo, setModalDonHangCuInfo] = useState({
    isOpen: false,
    index: null,
    loaiDon: "",
  });

  // State cho Modal Phiếu Bảo Hành
  const [isPhieuBaoHanhModalOpen, setIsPhieuBaoHanhModalOpen] = useState(false);
  const [phieuBaoHanhList, setPhieuBaoHanhList] = useState([]);
  const [openPrintWarranty, setOpenPrintWarranty] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const [formData, setFormData] = useState({
    nhaKhoa: "",
    bacSi: "",
    benhNhan: "",
    ngayNhan: toLocalDT(new Date()),
    yeuCauHoanThanh: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      return toLocalDT(tomorrow);
    })(),
    henGiao: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(14, 0, 0, 0);
      return toLocalDT(tomorrow);
    })(),
    danhSachSanPham: [
      {
        loaiDon: "Mới",
        sanPham: "",
        viTri: [],
        soLuong: 1,
        mau: "",
        ghiChu: "",
        yeuCauThu: [],
      },
    ],
    danhSachPhuKien: [],
    chiDinhBacSi: "",
    ghiChuChung: "",
    ghiChuTaiChinh: "",
    ghiChuSanXuat: "",
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
            ngayNhan: dh.ngayNhan ? toLocalDT(dh.ngayNhan) : "",
            yeuCauHoanThanh: dh.yeuCauHoanThanh ? toLocalDT(dh.yeuCauHoanThanh) : "",
            henGiao: dh.henGiao ? toLocalDT(dh.henGiao) : "",
            danhSachSanPham: (dh.danhSachSanPham || []).map((sp) => ({
              ...sp,
              sanPham: sp.sanPham?._id || sp.sanPham || "",
              donHangCu: sp.donHangCu?._id || sp.donHangCu || null,
              yeuCauThu: sp.yeuCauThu || [],
            })),
          });
        })
        .catch(() => toast.error("Không thể tải thông tin đơn hàng"));
    }
  }, [id, isEditMode]);

  // Fetch phiếu bảo hành
  useEffect(() => {
    if (isEditMode && id) {
      api
        .get(`/phieu-bao-hanh/don-hang/${id}`)
        .then((res) => {
          const warranty = res.data?.data || res.data;
          // Convert single warranty to array
          const warrantyArray = warranty ? (Array.isArray(warranty) ? warranty : [warranty]) : [];
          console.log("Warranty fetched:", warrantyArray, "Length:", warrantyArray.length);
          setPhieuBaoHanhList(warrantyArray);
        })
        .catch((err) => {
          console.error("Lỗi fetch phiếu bảo hành:", err);
          setPhieuBaoHanhList([]);
        });
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

  // Keyboard shortcuts: F3 = Save, F4 = Print
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F3") {
        e.preventDefault();
        handleSaveRef.current();
      } else if (e.key === "F4" && isEditMode) {
        e.preventDefault();
        navigate(`/donhang/${id}/print`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditMode, id]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ===== QUICK-ADD HANDLERS =====
  const handleQuickAddNhaKhoa = async () => {
    const { form } = quickAddNhaKhoa;
    if (!form.hoVaTen && !form.tenGiaoDich) { toast.error("Vui lòng nhập tên nha khoa"); return; }
    setQuickAddNhaKhoa(s => ({ ...s, loading: true }));
    try {
      const res = await api.post("/nhakhoa", form);
      const newItem = { ...(res.data?.data || res.data), nameDisplay: (res.data?.data || res.data).tenGiaoDich || (res.data?.data || res.data).hoVaTen };
      setNhaKhoasList(prev => [...prev, newItem]);
      setFormData(f => ({ ...f, nhaKhoa: newItem._id, bacSi: "", benhNhan: "" }));
      setQuickAddNhaKhoa({ open: false, loading: false, form: { hoVaTen: "", tenGiaoDich: "", soDienThoai: "", email: "", website: "", diaChiCuThe: "", tinh: "", moTa: "" } });
      toast.success("Đã thêm nha khoa");
    } catch (err) { toast.error(err.response?.data?.message || "Lỗi thêm nha khoa"); setQuickAddNhaKhoa(s => ({ ...s, loading: false })); }
  };

  const handleQuickAddBacSi = async () => {
    const { form } = quickAddBacSi;
    if (!form.hoVaTen) { toast.error("Vui lòng nhập tên bác sĩ"); return; }
    if (!formData.nhaKhoa) { toast.error("Vui lòng chọn nha khoa trước"); return; }
    setQuickAddBacSi(s => ({ ...s, loading: true }));
    try {
      const res = await api.post("/nguoilienhe", { ...form, nhaKhoa: formData.nhaKhoa });
      const newItem = { ...(res.data?.data || res.data), nameDisplay: (res.data?.data || res.data).hoVaTen };
      setAllBacSi(prev => [...prev, newItem]);
      setFormData(f => ({ ...f, bacSi: newItem._id }));
      setQuickAddBacSi({ open: false, loading: false, form: { hoVaTen: "", email: "", soDienThoai: "", tieuDe: "", moTa: "" } });
      toast.success("Đã thêm bác sĩ");
    } catch (err) { toast.error(err.response?.data?.message || "Lỗi thêm bác sĩ"); setQuickAddBacSi(s => ({ ...s, loading: false })); }
  };

  const handleQuickAddBenhNhan = async () => {
    const { form } = quickAddBenhNhan;
    if (!form.hoVaTen) { toast.error("Vui lòng nhập tên bệnh nhân"); return; }
    if (!formData.nhaKhoa) { toast.error("Vui lòng chọn nha khoa trước"); return; }
    setQuickAddBenhNhan(s => ({ ...s, loading: true }));
    try {
      const res = await api.post("/benhnhan", { ...form, nhaKhoa: formData.nhaKhoa });
      const newItem = { ...(res.data?.data || res.data), nameDisplay: (res.data?.data || res.data).hoVaTen };
      setAllBenhNhan(prev => [...prev, newItem]);
      setFormData(f => ({ ...f, benhNhan: newItem._id }));
      setQuickAddBenhNhan({ open: false, loading: false, form: { hoVaTen: "", soHoSo: "", gioiTinh: "", tinh: "", quanHuyen: "" } });
      toast.success("Đã thêm bệnh nhân");
    } catch (err) { toast.error(err.response?.data?.message || "Lỗi thêm bệnh nhân"); setQuickAddBenhNhan(s => ({ ...s, loading: false })); }
  };

  // <-- THÊM MỚI: Xử lý bật Modal khi chọn Hàng sửa/Làm lại
  const handleSanPhamChange = (index, field, value) => {
    const newDsSp = [...formData.danhSachSanPham];
    // FIX: Clone object con để tránh mutate state trực tiếp
    newDsSp[index] = { ...newDsSp[index], [field]: value };

    // Nếu đổi loại đơn sang Sửa/Bảo hành/Làm lại
    if (field === "loaiDon" && ["Hàng sửa", "Hàng làm lại", "Hàng bảo hành"].includes(value)) {
      if (!formData.benhNhan) {
        alert("Vui lòng chọn Bệnh nhân ở cột trái trước để hệ thống tìm đơn hàng cũ!");
        // Tự động trả UI về "Mới" một cách an toàn
        newDsSp[index].loaiDon = "Mới";
        setFormData({ ...formData, danhSachSanPham: newDsSp });
        return;
      }

      // Nếu đã có bệnh nhân -> Cập nhật state và bật Modal
      setFormData({ ...formData, danhSachSanPham: newDsSp });
      setModalDonHangCuInfo({ isOpen: true, index: index, loaiDon: value });
      return;
    }

    // Trường hợp cập nhật các field khác (sanPham, soLuong, mau, ghiChu...)
    setFormData({ ...formData, danhSachSanPham: newDsSp });
  };

  // <-- THÊM MỚI: Đắp dữ liệu từ đơn cũ sang dòng hiện tại
  const handleApplyOldOrder = (oldOrder) => {
    const index = modalDonHangCuInfo.index;
    const newDsSp = [...formData.danhSachSanPham];
    const spCu = oldOrder.danhSachSanPham || [];

    // Lỡ đơn cũ lỗi không có sản phẩm nào thì đóng Modal luôn
    if (spCu.length === 0) {
      setModalDonHangCuInfo({ isOpen: false, index: null, loaiDon: "" });
      return;
    }

    // Map toàn bộ sản phẩm của đơn cũ thành mảng các dòng mới
    const mappedProducts = spCu.map(sp => ({
      loaiDon: modalDonHangCuInfo.loaiDon, // 🔥 ÉP CỨNG loại đơn (Sửa/Bảo hành/Làm lại) cho TẤT CẢ
      donHangCu: oldOrder._id,             // Map ID đơn hàng gốc cho TẤT CẢ
      sanPham: sp.sanPham?._id || sp.sanPham || "",
      viTri: sp.viTri || [],
      soLuong: sp.soLuong || 1,
      mau: sp.mau || "",
      ghiChu: sp.ghiChu || "",
    }));

    // XÓA dòng hiện tại (nơi user vừa bấm mở Modal) 
    // VÀ CHÈN toàn bộ mảng sản phẩm vừa map được vào đúng vị trí đó
    newDsSp.splice(index, 1, ...mappedProducts);

    setFormData({
      ...formData,
      danhSachSanPham: newDsSp,
      // Tự động copy ghi chú từ đơn gốc nếu hiện tại đang trống
      chiDinhBacSi: formData.chiDinhBacSi || oldOrder.chiDinhBacSi || "",
      ghiChuChung: formData.ghiChuChung || oldOrder.ghiChuChung || "",
      ghiChuTaiChinh: formData.ghiChuTaiChinh || oldOrder.ghiChuTaiChinh || "",
      ghiChuSanXuat: formData.ghiChuSanXuat || oldOrder.ghiChuSanXuat || "",
    });
    setModalDonHangCuInfo({ isOpen: false, index: null, loaiDon: "" });
  };

  const handleRemoveSanPham = (index) => {
    const newDsSp = [...formData.danhSachSanPham];
    newDsSp.splice(index, 1);
    setFormData({ ...formData, danhSachSanPham: newDsSp });
  };

  const handleViewDonHangGoc = async (donHangCuId) => {
    const id = typeof donHangCuId === 'object' ? donHangCuId._id : donHangCuId;
    if (!id) return;
    try {
      const res = await api.get(`/donhang/${id}`);
      setDonHangGocView(res.data?.data || res.data);
    } catch {
      toast.error("Không thể tải đơn hàng gốc");
    }
  };

  const handleDateChange = (field, date, time) => {
    if (!date) { setFormData(f => ({ ...f, [field]: "" })); return; }
    setFormData(f => ({ ...f, [field]: `${date}T${time || "00:00"}` }));
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
    const errors = [];

    if (!formData.nhaKhoa) errors.push("Chưa chọn Nha Khoa");
    if (!formData.benhNhan) errors.push("Chưa chọn Bệnh Nhân");

    if (!formData.ngayNhan) {
      errors.push("Chưa nhập Ngày nhận");
    }
    if (!formData.henGiao) {
      errors.push("Chưa nhập Hẹn giao");
    } else if (formData.ngayNhan && new Date(formData.henGiao) <= new Date(formData.ngayNhan)) {
      errors.push("Hẹn giao phải sau Ngày nhận");
    }
    if (
      formData.yeuCauHoanThanh &&
      formData.ngayNhan &&
      new Date(formData.yeuCauHoanThanh) <= new Date(formData.ngayNhan)
    ) {
      errors.push("Y/c hoàn thành phải sau Ngày nhận");
    }

    if (formData.danhSachSanPham.length === 0) {
      errors.push("Chưa có sản phẩm nào trong đơn hàng");
    } else {
      formData.danhSachSanPham.forEach((sp, i) => {
        if (!sp.sanPham) errors.push(`Dòng ${i + 1}: Chưa chọn sản phẩm`);
      });
    }

    if (errors.length > 0) {
      toast.error(errors[0], { duration: 4000 });
      return;
    }

    // Convert date strings to ISO format for backend; strip read-only nhật ký from payload
    const { nhatKyChinhSua: _nk, ...formBase } = formData;
    const dataToSend = {
      ...formBase,
      // Strip empty ObjectId fields to avoid Mongoose cast errors
      bacSi: formData.bacSi || undefined,
      ngayNhan: formData.ngayNhan ? new Date(formData.ngayNhan).toISOString() : null,
      yeuCauHoanThanh: formData.yeuCauHoanThanh ? new Date(formData.yeuCauHoanThanh).toISOString() : null,
      henGiao: formData.henGiao ? new Date(formData.henGiao).toISOString() : null,
      // Nhật ký: create adds initial entry; update appends a new entry
      ...(isEditMode
        ? { nhatKyLogEntry: { nguoiThuc: nguoiThuc, hanhDong: "Chỉnh sửa đơn hàng" } }
        : { nguoiThucDuyet: nguoiThuc }),
    };

    const action = isEditMode
      ? updateDonHang({ id, data: dataToSend })
      : createDonHang(dataToSend);
    const promise = dispatch(action).unwrap();
    toast.promise(promise, {
      loading: isEditMode ? "Đang lưu thay đổi..." : "Đang tạo đơn hàng...",
      success: (result) =>
        isEditMode
          ? `Cập nhật đơn hàng thành công!`
          : `Tạo đơn hàng thành công! Mã: ${result?.maDonHang || ""}`,
      error: (err) =>
        typeof err === "string"
          ? err
          : isEditMode
            ? "Cập nhật thất bại"
            : "Tạo đơn hàng thất bại",
    });
    promise.then(() => navigate(-1)).catch(() => { });
  };

  const handleSaveRef = useRef(null);
  handleSaveRef.current = handleSave;

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
  // Filter only valid warranties for print button
  const validWarranties = (phieuBaoHanhList || []).filter(
    (pbh) => pbh && pbh.danhSachBaoHanh && Array.isArray(pbh.danhSachBaoHanh) && pbh.danhSachBaoHanh.length > 0
  );
  return (
    <div className="fixed inset-0 z-[1299] bg-white flex flex-col w-full h-full overflow-hidden">
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

      {/* Body: main form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main form (scrollable) */}
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="w-full flex flex-col gap-0">
            {/* Section 1: Customer info + clinic info + dates */}
            <div className="flex flex-col sm:flex-row gap-0 w-full border-b border-gray-200">
              <div className="w-full sm:w-[30%] p-4 flex flex-col gap-6 border-b sm:border-b-0">
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
                  showAddNew={true}
                  onAddNew={(term) => setQuickAddNhaKhoa(s => ({ ...s, open: true, form: { ...s.form, hoVaTen: term || "" } }))}
                />
                <SearchInput
                  label="Bác sĩ"
                  options={bacSiList}
                  value={formData.bacSi}
                  onChange={(val) => setFormData({ ...formData, bacSi: val })}
                  showAddNew={true}
                  onAddNew={(term) => setQuickAddBacSi(s => ({ ...s, open: true, form: { ...s.form, hoVaTen: term || "" } }))}
                />
                <SearchInput
                  label="Bệnh nhân"
                  options={benhNhanList}
                  value={formData.benhNhan}
                  onChange={(val) =>
                    setFormData({ ...formData, benhNhan: val })
                  }
                  showAddNew={true}
                  onAddNew={(term) => setQuickAddBenhNhan(s => ({ ...s, open: true, form: { ...s.form, hoVaTen: term || "" } }))}
                />
              </div>
              <div className="w-full sm:w-[40%] p-4 flex flex-col gap-2">
                <div className="bg-[#d7f3ff] w-full h-full p-3 rounded-xl">
                  <div>
                    <span className="text-gray-600">Tên nha khoa:</span>
                    <span className="font-bold text-gray-800 ml-1">
                      {selectedNhaKhoaInfo?.nameDisplay || ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-bold text-gray-800 ml-1">
                      {selectedNhaKhoaInfo?.diaChiCuThe || ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <span className="font-bold text-gray-800 ml-1">
                      {selectedNhaKhoaInfo?.soDienThoai || ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mô tả:</span>
                    <span className="font-bold text-gray-800 ml-1">
                      {selectedNhaKhoaInfo?.moTa || ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-[30%] p-4 flex flex-col gap-4 border-t sm:border-t-0">
                {/* Ngày nhận */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-500 inline-block w-48">Ngày nhận:</label>
                  <input type="date" value={formData.ngayNhan ? formData.ngayNhan.split("T")[0] : ""} onChange={e => handleDateChange("ngayNhan", e.target.value, formData.ngayNhan?.split("T")[1] || "00:00")} className="flex-1 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                  <input type="time" value={formData.ngayNhan?.split("T")[1] || ""} onChange={e => handleDateChange("ngayNhan", formData.ngayNhan?.split("T")[0] || "", e.target.value)} className="w-28 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                </div>
                {/* Y/c hoàn thành */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-500 inline-block w-48">Y/c hoàn thành:</label>
                  <input type="date" value={formData.yeuCauHoanThanh ? formData.yeuCauHoanThanh.split("T")[0] : ""} onChange={e => handleDateChange("yeuCauHoanThanh", e.target.value, formData.yeuCauHoanThanh?.split("T")[1] || "00:00")} className="flex-1 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                  <input type="time" value={formData.yeuCauHoanThanh?.split("T")[1] || ""} onChange={e => handleDateChange("yeuCauHoanThanh", formData.yeuCauHoanThanh?.split("T")[0] || "", e.target.value)} className="w-28 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                </div>
                {/* Hẹn giao */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-500 inline-block w-48">Hẹn giao:</label>
                  <input type="date" value={formData.henGiao ? formData.henGiao.split("T")[0] : ""} onChange={e => handleDateChange("henGiao", e.target.value, formData.henGiao?.split("T")[1] || "00:00")} className="flex-1 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                  <input type="time" value={formData.henGiao?.split("T")[1] || ""} onChange={e => handleDateChange("henGiao", formData.henGiao?.split("T")[0] || "", e.target.value)} className="w-28 text-gray-700 border-0 border-b border-gray-300 focus:outline-none focus:border-blue-400 py-0.5 bg-transparent text-sm" />
                </div>
              </div>
            </div>

            {/* Section 2: Products table */}
            <div className="w-full bg-white shadow-sm border-t border-b border-gray-200">
              <table className="w-full min-w-[600px] text-sm text-left">
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
                    <th className="p-3 w-28 text-center font-medium">Yêu cầu thử</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.danhSachSanPham.map((sp, index) => (
                    <React.Fragment key={index}>
                      <tr className="border-b bg-[#e1f5fe]">
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
                          {["Hàng sửa", "Hàng làm lại", "Hàng bảo hành"].includes(sp.loaiDon) && sp.donHangCu && (
                            <button
                              type="button"
                              onClick={() => handleViewDonHangGoc(sp.donHangCu)}
                              className="text-xs text-blue-600 px-3 py-1 underline"
                            >
                              Xem đh gốc
                            </button>
                          )}
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
                            type="button"
                            onClick={() => setYeuCauThuModal({ open: true, spIndex: index })}
                            className={`text-xs rounded px-2 py-1 whitespace-nowrap transition font-medium border ${(sp.yeuCauThu || []).length > 0
                              ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                              : "bg-white text-blue-500 border-blue-300 hover:bg-blue-50"
                              }`}
                          >
                            {(sp.yeuCauThu || []).length > 0
                              ? `Yêu cầu thử (${sp.yeuCauThu.length})`
                              : "Yêu cầu thử"}
                          </button>
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
                    </React.Fragment>
                  ))}
                  <tr>
                    <td colSpan="8" className="p-0 bg-[#f0f9ff]">
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
                                yeuCauThu: [],
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
            {/* Bottom notes + accessories section */}
            <div className="w-full bg-white border-t border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row">
                {/* Left: notes (flex-1) */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex flex-col sm:flex-row border-b border-gray-100">
                    {/* Chỉ định của bác sĩ */}
                    <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Chỉ định của bác sĩ</label>
                      <textarea
                        name="chiDinhBacSi"
                        value={formData.chiDinhBacSi}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full outline-none resize-none text-sm text-gray-700 bg-transparent placeholder-gray-300"
                        placeholder="Nhập chỉ định bác sĩ..."
                      />
                    </div>
                    {/* Ghi chú */}
                    <div className="flex-1 p-4 flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Ghi chú</label>
                      <textarea
                        name="ghiChuChung"
                        value={formData.ghiChuChung}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full outline-none resize-none text-sm text-gray-700 bg-transparent placeholder-gray-300"
                        placeholder="Nhập ghi chú..."
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row border-gray-100">
                    {/* Ghi chú tài chính */}
                    <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Ghi chú về tài chính</label>
                      <textarea
                        name="ghiChuTaiChinh"
                        value={formData.ghiChuTaiChinh}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full outline-none resize-none text-sm text-gray-700 bg-transparent placeholder-gray-300"
                        placeholder="Nhập ghi chú tài chính..."
                      />
                    </div>
                    {/* Ghi chú sản xuất */}
                    <div className="flex-1 p-4 flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Ghi chú sản xuất</label>
                      <textarea
                        name="ghiChuSanXuat"
                        value={formData.ghiChuSanXuat || ""}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full outline-none resize-none text-sm text-gray-700 bg-transparent placeholder-gray-300"
                        placeholder="Ghi chú sản xuất (hiển thị khi in)..."
                      />
                    </div>
                  </div>
                </div>
                {/* Right: phụ kiện */}
                <div className="sm:w-[260px] border-t sm:border-t-0 sm:border-l border-gray-200 p-4 shrink-0">
                  <DanhSachPhuKien
                    phuKienDaChon={formData.danhSachPhuKien}
                    setPhuKienDaChon={(data) =>
                      setFormData({ ...formData, danhSachPhuKien: data })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer save bar */}
      <div className="bg-gray-100 px-4 sm:px-6 py-3 flex flex-wrap justify-between items-center gap-2 border-t z-10 shadow-lg shrink-0">
        <div className="flex flex-wrap gap-2">
          {isEditMode && (
            <button
              onClick={() => navigate(`/donhang/${id}/print`)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
              title="In đơn hàng (F4)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2m12 0v7M6 13H2v8a2 2 0 002 2h16a2 2 0 002-2v-8h-4m0 0V9m0 4v8m-6-8h4" />
              </svg>
              In đơn hàng (F4)
            </button>
          )}
          {isEditMode && (
            <button
              onClick={() => navigate(`/donhang/${id}/delivery-note`)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded text-sm"
            >
              In Phiếu giao hàng
            </button>
          )}
          {isEditMode && (
            <button
              onClick={() => {
                if (!formData._id) { toast.error("Vui lòng lưu đơn hàng trước khi thêm thẻ bảo hành"); return; }
                setIsPhieuBaoHanhModalOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded text-sm"
            >
              + Thêm thẻ bảo hành
            </button>
          )}
          {isEditMode && validWarranties.length > 0 && (
            <button
              onClick={() => { setSelectedWarranty(validWarranties[0]); setOpenPrintWarranty(true); }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2m12 0v7M6 13H2v8a2 2 0 002 2h16a2 2 0 002-2v-8h-4m0 0V9m0 4v8m-6-8h4" />
              </svg>
              In thẻ bảo hành
            </button>
          )}
        </div>
        <button
          onClick={handleSave}
          className="bg-[#4CAF50] hover:bg-green-600 text-white px-8 py-2 rounded shadow-md font-medium"
        >
          Lưu (F3)
        </button>
      </div>

      <>
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
      </>

      <PhieuBaoHanhModal
        open={isPhieuBaoHanhModalOpen}
        onClose={() => setIsPhieuBaoHanhModalOpen(false)}
        donHang={formData}
        onSuccess={() => {
          setIsPhieuBaoHanhModalOpen(false);
          if (id) {
            api.get(`/phieu-bao-hanh/don-hang/${id}`)
              .then((res) => {
                const warranty = res.data?.data || res.data;
                const warrantyArray = warranty ? (Array.isArray(warranty) ? warranty : [warranty]) : [];
                setPhieuBaoHanhList(warrantyArray);
              })
              .catch(() => { });
          }
        }}
      />
      {selectedWarranty && (
        <WarrantyCardPrint
          open={openPrintWarranty}
          onClose={() => setOpenPrintWarranty(false)}
          warranty={selectedWarranty}
          donHang={formData}
        />
      )}

      {/* Overlay xem đơn hàng gốc */}
      {donHangGocView && ReactDOM.createPortal(
        <DonHangDetailPanel donHang={donHangGocView} onClose={() => setDonHangGocView(null)} fullscreen />,
        document.body
      )}

      {/* Yêu cầu thử modal */}
      {yeuCauThuModal.open && yeuCauThuModal.spIndex !== null && (() => {
        const spIdx = yeuCauThuModal.spIndex;
        const sp = formData.danhSachSanPham[spIdx];
        const items = sp?.yeuCauThu || [];
        const addItem = (congDoan) => {
          const newDsSp = [...formData.danhSachSanPham];
          newDsSp[spIdx] = { ...newDsSp[spIdx], yeuCauThu: [...items, { congDoan, ngayTao: new Date().toISOString() }] };
          setFormData(f => ({ ...f, danhSachSanPham: newDsSp }));
        };
        const removeItem = (i) => {
          const newDsSp = [...formData.danhSachSanPham];
          newDsSp[spIdx] = { ...newDsSp[spIdx], yeuCauThu: items.filter((_, idx) => idx !== i) };
          setFormData(f => ({ ...f, danhSachSanPham: newDsSp }));
        };
        return ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setYeuCauThuModal({ open: false, spIndex: null })}>
            <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[95vw] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between bg-[#00a8ff] px-4 py-3">
                <span className="text-white font-semibold text-sm">Yêu cầu thử</span>
                <button type="button" onClick={() => setYeuCauThuModal({ open: false, spIndex: null })} className="text-white hover:text-blue-200 transition text-xl leading-none">&times;</button>
              </div>
              <div className="px-4 pt-4 pb-2">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-xs">
                      <th className="text-left pb-2 w-10">STT</th>
                      <th className="text-left pb-2">Công đoạn</th>
                      <th className="text-left pb-2">Ngày tạo</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs italic">Chưa có yêu cầu nào</td></tr>
                    )}
                    {items.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-2 text-gray-500 text-xs">{i + 1}</td>
                        <td className="py-2 font-medium text-gray-800">{item.congDoan}</td>
                        <td className="py-2 text-gray-500 text-xs">{new Date(item.ngayTao).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                        <td className="py-2 text-center">
                          <button type="button" onClick={() => removeItem(i)} className="text-orange-400 hover:text-red-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 px-4 pb-3">
                <button type="button" onClick={() => addItem("Thử Sườn")} className="flex-1 bg-[#00a8ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-full py-2 transition">+ Thử Sườn</button>
                <button type="button" onClick={() => addItem("Thử sứ thô")} className="flex-1 bg-[#00a8ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-full py-2 transition">+ Thử sứ thô</button>
              </div>
              <div className="flex justify-end px-4 pb-4">
                <button type="button" onClick={() => setYeuCauThuModal({ open: false, spIndex: null })} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded px-5 py-1.5 transition">Xác nhận</button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Quick-add: Nha Khoa */}
      <QuickAddModal
        open={quickAddNhaKhoa.open}
        onClose={() => setQuickAddNhaKhoa(s => ({ ...s, open: false }))}
        title="+ Thêm Nha Khoa"
        onSubmit={handleQuickAddNhaKhoa}
        loading={quickAddNhaKhoa.loading}
      >
        <QuickAddField label="Tên nha khoa *" value={quickAddNhaKhoa.form.hoVaTen} placeholder="Tên nha khoa..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, hoVaTen: v } }))} />
        <QuickAddField label="Tên giao dịch" value={quickAddNhaKhoa.form.tenGiaoDich} placeholder="Tên giao dịch..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, tenGiaoDich: v } }))} />
        <QuickAddField label="Email" value={quickAddNhaKhoa.form.email} placeholder="Email..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, email: v } }))} />
        <QuickAddField label="SĐT" value={quickAddNhaKhoa.form.soDienThoai} placeholder="Số điện thoại..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, soDienThoai: v } }))} />
        <QuickAddField label="Website" value={quickAddNhaKhoa.form.website} placeholder="achau.com.vn..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, website: v } }))} />
        <QuickAddField label="Địa chỉ cụ thể" value={quickAddNhaKhoa.form.diaChiCuThe} placeholder="Địa chỉ..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, diaChiCuThe: v } }))} />
        <QuickAddField label="Tỉnh / Thành phố" value={quickAddNhaKhoa.form.tinh} placeholder="Hồ Chí Minh..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, tinh: v } }))} />
        <QuickAddField label="Mô tả" type="textarea" value={quickAddNhaKhoa.form.moTa} placeholder="Mô tả..." onChange={v => setQuickAddNhaKhoa(s => ({ ...s, form: { ...s.form, moTa: v } }))} />
      </QuickAddModal>

      {/* Quick-add: Bác Sĩ */}
      <QuickAddModal
        open={quickAddBacSi.open}
        onClose={() => setQuickAddBacSi(s => ({ ...s, open: false }))}
        title="+ Thêm Bác Sĩ"
        onSubmit={handleQuickAddBacSi}
        loading={quickAddBacSi.loading}
      >
        <QuickAddField label="Họ và tên *" value={quickAddBacSi.form.hoVaTen} placeholder="Tên bác sĩ..." onChange={v => setQuickAddBacSi(s => ({ ...s, form: { ...s.form, hoVaTen: v } }))} />
        <QuickAddField label="Email" value={quickAddBacSi.form.email} placeholder="Email..." onChange={v => setQuickAddBacSi(s => ({ ...s, form: { ...s.form, email: v } }))} />
        <QuickAddField label="SĐT" value={quickAddBacSi.form.soDienThoai} placeholder="Số điện thoại..." onChange={v => setQuickAddBacSi(s => ({ ...s, form: { ...s.form, soDienThoai: v } }))} />
        <QuickAddField label="Tiêu đề" value={quickAddBacSi.form.tieuDe} placeholder="Bác sĩ / Nha sĩ..." onChange={v => setQuickAddBacSi(s => ({ ...s, form: { ...s.form, tieuDe: v } }))} />
        <QuickAddField label="Mô tả" type="textarea" value={quickAddBacSi.form.moTa} placeholder="Mô tả..." onChange={v => setQuickAddBacSi(s => ({ ...s, form: { ...s.form, moTa: v } }))} />
        {!formData.nhaKhoa && <p className="text-xs text-orange-500">⚠ Vui lòng chọn nha khoa trước</p>}
      </QuickAddModal>

      {/* Quick-add: Bệnh Nhân */}
      <QuickAddModal
        open={quickAddBenhNhan.open}
        onClose={() => setQuickAddBenhNhan(s => ({ ...s, open: false }))}
        title="+ Thêm Bệnh Nhân"
        onSubmit={handleQuickAddBenhNhan}
        loading={quickAddBenhNhan.loading}
      >
        <QuickAddField label="Tên *" value={quickAddBenhNhan.form.hoVaTen} placeholder="Tên bệnh nhân..." onChange={v => setQuickAddBenhNhan(s => ({ ...s, form: { ...s.form, hoVaTen: v } }))} />
        <QuickAddField label="Số hồ sơ" value={quickAddBenhNhan.form.soHoSo} placeholder="Số hồ sơ..." onChange={v => setQuickAddBenhNhan(s => ({ ...s, form: { ...s.form, soHoSo: v } }))} />
        <div>
          <label className="text-xs text-gray-500">Giới tính</label>
          <select value={quickAddBenhNhan.form.gioiTinh} onChange={e => setQuickAddBenhNhan(s => ({ ...s, form: { ...s.form, gioiTinh: e.target.value } }))}
            className="w-full border-b border-gray-300 outline-none py-1 text-sm mt-1 bg-transparent">
            <option value="">-- Chọn --</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <QuickAddField label="Tỉnh / Thành phố" value={quickAddBenhNhan.form.tinh} placeholder="Hồ Chí Minh..." onChange={v => setQuickAddBenhNhan(s => ({ ...s, form: { ...s.form, tinh: v } }))} />
        <QuickAddField label="Quận / Huyện" value={quickAddBenhNhan.form.quanHuyen} placeholder="Bình Thạnh..." onChange={v => setQuickAddBenhNhan(s => ({ ...s, form: { ...s.form, quanHuyen: v } }))} />
        {!formData.nhaKhoa && <p className="text-xs text-orange-500">⚠ Vui lòng chọn nha khoa trước</p>}
      </QuickAddModal>
    </div>
  );
};

/* ===== Right side panel ===== */
const RightSidePanel = ({
  formData,
  setFormData,
  handleInputChange,
  phieuBaoHanhList = [],
  donHangId,
  onRefreshPhieuBaoHanh,
}) => {
  const [activeTab, setActiveTab] = useState("ghichu");

  // Filter only valid warranties
  const validWarranties = (phieuBaoHanhList || []).filter(
    (pbh) => pbh && pbh.danhSachBaoHanh && Array.isArray(pbh.danhSachBaoHanh) && pbh.danhSachBaoHanh.length > 0
  );

  return (
    <div className="w-full md:w-72 max-h-[280px] md:max-h-none border-t md:border-t-0 md:border-l bg-white flex flex-col shrink-0 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b shrink-0">
        {[
          { key: "sanxuat", label: "Sản xuất" },
          { key: "ghichu", label: "Ghi chú" },
          ...(validWarranties.length > 0 ? [{
            key: "baohanhc",
            label: "Bảo hành",
            badge: validWarranties.length,
          }] : []),
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-sm font-medium transition border-b-2 relative ${activeTab === tab.key
              ? "border-blue-500 text-blue-700 bg-blue-50"
              : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
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

        {activeTab === "baohanhc" && (
          <div className="flex flex-col gap-2">
            <PhieuBaoHanhList
              phieuBaoHanhList={validWarranties}
              donHangId={donHangId}
              onDelete={onRefreshPhieuBaoHanh}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DonHangForm;
