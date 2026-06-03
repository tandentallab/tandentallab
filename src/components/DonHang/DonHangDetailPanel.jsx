import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  deleteDonHang,
  updateDonHang,
  updateCongDoanTrangThai,
} from "../../redux/slices/donHangSlice";
import { toast } from "sonner";
import { api } from "../../config/api";
import PhieuBaoHanhModal from "./PhieuBaoHanhModal";
import WarrantyCardPrint from "./WarrantyCardPrint";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PrintIcon from '@mui/icons-material/Print';
import CheckIcon from '@mui/icons-material/Check';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

// Helpers for warranty edit
const addYearsToDate = (dateValue, years) => {
  const start = new Date(dateValue);
  return new Date(start.getFullYear() + years, start.getMonth(), start.getDate())
    .toISOString()
    .slice(0, 10);
};
const formatDateVN = (dateValue) => {
  if (!dateValue) return "---";
  return new Date(dateValue).toLocaleDateString("vi-VN");
};

const DonHangDetailPanel = (props) => {
  const { donHang, onClose } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmall = useMediaQuery("(max-width:550px)");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chitiet");
  const [isPhieuBaoHanhOpen, setIsPhieuBaoHanhOpen] = useState(false);
  const [warranty, setWarranty] = useState(null);
  const [openPrintWarranty, setOpenPrintWarranty] = useState(false);
  const [openWarrantyDialog, setOpenWarrantyDialog] = useState(false);
  const [warrantyEditForm, setWarrantyEditForm] = useState({ ghiChu: "", danhSachBaoHanh: [] });
  const [savingWarranty, setSavingWarranty] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // { spIndex, thuTu, top, right }
  const [isOpen, setIsOpen] = useState(false);
  const [fullDonHang, setFullDonHang] = useState(donHang);

  useEffect(() => {
    if (donHang) {
      const id = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(id);
    } else {
      setIsOpen(false);
    }
  }, [!!donHang]);

  // Thêm useEffect để fetch dữ liệu chi tiết khi donHang._id thay đổi
  useEffect(() => {
    if (donHang?._id) {
      api.get(`/donhang/${donHang._id}`) // Gọi đúng API chi tiết (có populate)
        .then((res) => {
          setFullDonHang(res.data.data);
        })
        .catch((err) => console.error("Lỗi fetch full donHang:", err));
    }
  }, [donHang?._id]);

  // Close dropdown on outside click or scroll
  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => setOpenDropdown(null);
    document.addEventListener("click", handler);
    document.addEventListener("scroll", handler, true);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("scroll", handler, true);
    };
  }, [openDropdown]);

  const maDonHang = fullDonHang
    ? fullDonHang.maDonHang ||
    `TAN${fullDonHang._id.substring(fullDonHang._id.length - 8).toUpperCase()}`
    : "";

  // Fetch warranty when donHang changes
  useEffect(() => {
    if (donHang?._id) {
      api
        .get(`/phieu-bao-hanh/don-hang/${donHang._id}`)
        .then((res) => {
          console.log("Warranty Response:", res.data);
          setWarranty(res.data.data || res.data);
        })
        .catch((err) => {
          console.log("Warranty Fetch Error:", err.message);
          setWarranty(null);
        });
    }
  }, [donHang?._id]);

  const trangThaiColor = {
    "Chờ xử lý": "bg-yellow-200 text-yellow-900",
    "Đang sản xuất": "bg-blue-200 text-blue-900",
    "Đang thử": "bg-purple-200 text-purple-900",
    "Hoàn thành": "bg-green-200 text-green-900",
    "Đã giao": "bg-gray-200 text-gray-800",
  };

  const isLocked = fullDonHang?.trangThai === "Đã giao" || !!fullDonHang?.daXuatHoaDon;

  const handleEdit = () => {
    if (isLocked) {
      toast.error("Đơn hàng đã xuất hóa đơn / đã giao, không thể chỉnh sửa");
      return;
    }
    navigate(`/donhang/${donHang._id}/edit`);
  };

  const handlePrint = () => {
    navigate(`/donhang/${donHang._id}/print`);
  };

  const handleDelete = () => {
    if (isLocked) {
      toast.error("Đơn hàng đã xuất hóa đơn / đã giao, không thể xóa");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${maDonHang}?`)) {
      const promise = dispatch(deleteDonHang(donHang._id)).unwrap();
      toast.promise(promise, {
        loading: "Đang xóa...",
        success: `Đã xóa đơn hàng ${maDonHang}`,
        error: (err) => err || "Xóa đơn hàng thất bại",
      });
      promise.then(() => onClose()).catch(() => { });
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

  const handleOpenPhieuBaoHanh = () => {
    setIsPhieuBaoHanhOpen(true);
  };

  const handleOpenPrintWarranty = () => {
    setOpenPrintWarranty(true);
  };

  const handleOpenWarrantyView = () => {
    if (!warranty) return;
    const enriched = (warranty.danhSachBaoHanh || []).map((item) => {
      const startDate = new Date(item.baoHanhTu);
      const endDate = new Date(item.baoHanhDen);
      const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
      const expectedEnd = addYearsToDate(item.baoHanhTu, yearsDiff);
      const actualEndStr = endDate.toISOString().slice(0, 10);
      const isExactYears = expectedEnd === actualEndStr;
      return {
        ...item,
        selectedYears: isExactYears ? yearsDiff : "",
        customEndDate: isExactYears ? "" : actualEndStr,
      };
    });
    setWarrantyEditForm({ ghiChu: warranty.ghiChu || "", danhSachBaoHanh: enriched });
    setOpenWarrantyDialog(true);
  };

  const handleSaveWarrantyEdit = async () => {
    try {
      setSavingWarranty(true);
      const cleanedDanhSach = warrantyEditForm.danhSachBaoHanh.map(
        ({ selectedYears, customEndDate, ...rest }) => rest
      );
      const res = await api.put(`/phieu-bao-hanh/${warranty._id}`, {
        ghiChu: warrantyEditForm.ghiChu,
        danhSachBaoHanh: cleanedDanhSach,
      });
      if (res.data?.success) {
        toast.success("Cập nhật phiếu bảo hành thành công");
        setOpenWarrantyDialog(false);
        api.get(`/phieu-bao-hanh/don-hang/${donHang._id}`)
          .then((r) => setWarranty(r.data.data || r.data));
      } else {
        toast.error(res.data?.message || "Lỗi khi cập nhật");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi cập nhật");
    } finally {
      setSavingWarranty(false);
    }
  };

  const handleSyncFromOrder = async () => {
    if (!donHang?._id) {
      toast.error("Không tìm thấy thông tin đơn hàng tương ứng");
      return;
    }

    try {
      setSavingWarranty(true);
      const res = await api.get(`/donhang/${donHang._id}`);
      if (res.data?.success) {
        const latestOrder = res.data.data;

        // Hàm format vị trí răng
        const formatViTri = (viTriArr) => {
          if (!viTriArr || viTriArr.length === 0) return "";
          return viTriArr
            .map((v) =>
              v.kieu === "Rời"
                ? v.soRang.join(", ")
                : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`
            )
            .join("; ");
        };

        const nhaKhoaId = latestOrder.nhaKhoa?._id || latestOrder.nhaKhoa;
        // Fetch bảng giá nha khoa
        const bangGiaRes = await api.get(`/bang-gia/nha-khoa/${nhaKhoaId}`).catch(() => null);
        const mapGia = {};
        if (bangGiaRes?.data) {
          bangGiaRes.data.forEach((item) => {
            if (item.sanPhamId) {
              mapGia[item.sanPhamId.toString()] = item.donGia || 0;
            }
          });
        }

        // Lọc sản phẩm loại "Mới" từ đơn hàng mới nhất và có giá > 0
        const orderProducts = (latestOrder.danhSachSanPham || [])
          .filter((sp) => {
            const spId = sp.sanPham?._id || sp.sanPham;
            const donGia = mapGia[spId] ?? sp.sanPham?.donGiaChung ?? 0;
            return sp.loaiDon === "Mới" && donGia > 0;
          })
          .map((sp) => ({
            sanPhamId: sp.sanPham?._id || sp.sanPham,
            tenSanPham: sp.sanPham?.tenSanPham || sp.sanPham?.ten || "Sản phẩm",
            viTriRang: formatViTri(sp.viTri),
            soLuong: Number(sp.soLuong) || 1,
            mau: sp.mau || "",
            baoHanhMacDinh: sp.sanPham?.baoHanhMacDinh || 0,
          }));

        // Chuẩn hóa danh sách sản phẩm hiện tại của phiếu bảo hành
        const currentWarrantyProducts = (warrantyEditForm.danhSachBaoHanh || []).map((w) => ({
          sanPhamId: w.sanPham?._id || w.sanPham,
          tenSanPham: w.sanPham?.tenSanPham || w.sanPham?.ten || "Sản phẩm",
          viTriRang: w.viTriRang || "",
          soLuong: Number(w.soLuong) || 1,
          mau: w.mau || "",
        }));

        // So sánh
        const sortFn = (a, b) => {
          const idA = (a.sanPhamId || "").toString();
          const idB = (b.sanPhamId || "").toString();
          if (idA !== idB) return idA.localeCompare(idB);
          return (a.viTriRang || "").localeCompare(b.viTriRang || "");
        };

        const sortedOrder = [...orderProducts].sort(sortFn);
        const sortedCurrent = [...currentWarrantyProducts].sort(sortFn);

        const isSame = sortedOrder.length === sortedCurrent.length &&
          sortedOrder.every((op, idx) => {
            const cwp = sortedCurrent[idx];
            return op.sanPhamId === cwp.sanPhamId &&
              op.viTriRang === cwp.viTriRang &&
              op.soLuong === cwp.soLuong &&
              op.mau === cwp.mau;
          });

        if (isSame) {
          toast.success("Dữ liệu đồng bộ");
        } else {
          // Xây dựng danh sách bảo hành mới
          const newList = orderProducts.map((op) => {
            const existingMatch = (warrantyEditForm.danhSachBaoHanh || []).find((w) => {
              const wId = w.sanPham?._id || w.sanPham;
              return wId === op.sanPhamId && w.viTriRang === op.viTriRang;
            });

            if (existingMatch) {
              return {
                ...existingMatch,
                soLuong: op.soLuong,
                mau: op.mau,
                tenSanPhamBaoHanh: existingMatch.tenSanPhamBaoHanh || op.tenSanPham || "",
              };
            }

            const newBaoHanhTu = warranty?.createdAt
              ? new Date(warranty.createdAt).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10);
            const defaultYears = op.baoHanhMacDinh || 0;
            const newBaoHanhDen = addYearsToDate(newBaoHanhTu, defaultYears);

            return {
              sanPham: {
                _id: op.sanPhamId,
                tenSanPham: op.tenSanPham,
              },
              viTriRang: op.viTriRang,
              soLuong: op.soLuong,
              mau: op.mau,
              tenSanPhamBaoHanh: op.tenSanPham || "",
              baoHanhTu: newBaoHanhTu,
              baoHanhDen: newBaoHanhDen,
              selectedYears: defaultYears > 0 ? defaultYears : "",
              customEndDate: "",
            };
          });

          setWarrantyEditForm({
            ...warrantyEditForm,
            danhSachBaoHanh: newList,
          });
          toast.success("Đã đồng bộ thông tin mới từ đơn hàng!");
        }
      } else {
        toast.error(res.data?.message || "Lỗi khi lấy dữ liệu đơn hàng");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lấy dữ liệu đơn hàng");
    } finally {
      setSavingWarranty(false);
    }
  };
  const CONG_DOAN_TRANG_THAI_OPTIONS = ["Chưa sẵn sàng", "Chờ sản xuất"];

  const CONG_DOAN_TRANG_THAI_STYLE = {
    "Chưa sẵn sàng": "text-gray-500",
    "Chờ sản xuất": "text-cyan-600 font-medium",
  };

  const panelTop = isVerySmall ? 0 : 70;
  const panelWidth = isVerySmall ? "100%" : "530px";
  const panelHeight = `calc(100vh - ${panelTop}px)`;

  const getCongDoanTrangThai = (sp, thuTu) => {
    const found = sp.trangThaiCongDoan?.find((cd) => cd.thuTu === thuTu);
    return found?.trangThai || "Chưa sẵn sàng";
  };

  const handleCongDoanStatusChange = (spIndex, thuTu, trangThai) => {
    setOpenDropdown(null);
    dispatch(
      updateCongDoanTrangThai({ id: donHang._id, spIndex, thuTu, trangThai })
    )
      .unwrap()
      .catch((err) => toast.error(err || "Cập nhật thất bại"));
  };

  const totalCongDoanCount = donHang?.danhSachSanPham?.reduce(
    (sum, sp) => sum + (sp.sanPham?.quyTrinh?.length || 0),
    0
  ) || 0;

  const doneCongDoanCount = donHang?.danhSachSanPham?.reduce((sum, sp) => {
    const quyTrinh = sp.sanPham?.quyTrinh || [];
    return sum + quyTrinh.filter((cd) => {
      const found = sp.trangThaiCongDoan?.find((t) => t.thuTu === cd.thuTu);
      return found?.trangThai === "Hoàn thành";
    }).length;
  }, 0) || 0;

  const conLaiCongDoan = totalCongDoanCount - doneCongDoanCount;

  const groupedNhatKy = (donHang?.nhatKyChinhSua || []).filter(e => e.hanhDong !== "Chỉnh sửa đơn hàng (không có thay đổi)").reduce((acc, entry) => {
    const d = new Date(entry.thoiGian);
    const dateKey = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  const hasWarranty = warranty && (
    (warranty.danhSachBaoHanh && warranty.danhSachBaoHanh.length > 0) || warranty.isValid
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed left-0 right-0 bottom-0 bg-black/20 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ zIndex: props.fullscreen ? 2998 : (isVerySmall ? 1499 : 1298), top: `${panelTop}px` }}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed right-0 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ zIndex: props.fullscreen ? 2999 : (isVerySmall ? 1500 : 1300), top: `${panelTop}px`, width: panelWidth, height: panelHeight, maxHeight: panelHeight, paddingBottom: isMobile ? "40px" : "0" }}
      >
        {/* Header */}
        <div className="bg-[#4fc3f7] border-b px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <div onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:cursor-pointer transition-all duration-100">
              <ArrowForwardIcon onClick={onClose} sx={{ fontSize: 22 }} />
            </div>
            <span className="text-xl">{maDonHang}</span>
          </div>
          {!props.fullscreen && (
            <div className="flex items-center gap-2 shrink-0 text-white">
              <div onClick={handleEdit} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:cursor-pointer transition-all duration-100">
                <EditIcon sx={{ fontSize: 22 }} />
              </div>
              <div onClick={handleDelete} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-500 hover:cursor-pointer transition-all duration-100">
                <DeleteIcon sx={{ fontSize: 22 }} />
              </div>
            </div>
          )}
        </div>

        {/* NhaKhoa row */}
        {donHang && (
          <div className="border-b px-4 py-3 flex items-center gap-3 bg-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm shrink-0 uppercase">
              {(donHang.nhaKhoa?.tenGiaoDich || donHang.nhaKhoa?.hoVaTen || "?").charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-800 text-lg truncate">
                  {donHang.nhaKhoa?.tenGiaoDich || donHang.nhaKhoa?.hoVaTen || "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b shrink-0 bg-gray-100">
          {[
            { key: "chitiet", label: "Chi tiết" },
            { key: "sanxuat", label: `Sản xuất${donHang ? ` (${donHang.danhSachSanPham?.length || 0})` : ""}` },
            { key: "ghichu", label: "Ghi chú" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 flex-1 text-sm font-medium transition border-b-2 ${activeTab === tab.key ? "border-teal-600 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {donHang && activeTab === "chitiet" && (
            <div className="flex flex-col">
              {/* Info rows */}
              <div className="px-4 py-3 flex flex-col gap-1 text-sm border-b">
                {donHang.bacSi?.hoVaTen && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Bác sĩ:</span>
                    <span className="font-medium text-gray-800">{donHang.bacSi.hoVaTen}</span>
                  </div>
                )}
                {donHang.benhNhan?.hoVaTen && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Bệnh nhân:</span>
                    <span className="font-medium text-gray-800">{donHang.benhNhan.hoVaTen}</span>
                  </div>
                )}
                {donHang.yeuCauHoanThanh && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Y/c hoàn thành:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(donHang.yeuCauHoanThanh).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                    </span>
                  </div>
                )}
                {donHang.henGiao && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Hẹn giao:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(donHang.henGiao).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
                    </span>
                  </div>
                )}
                {donHang.chiDinhBacSi && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-500 w-28 shrink-0">Chỉ định:</span>
                    <span className="font-medium text-gray-800 whitespace-pre-wrap">{donHang.chiDinhBacSi}</span>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="px-4 py-3 border-b">
                <h4 className="font-semibold mb-2">
                  {donHang.danhSachSanPham?.length || 0} sản phẩm
                </h4>
                {donHang.danhSachSanPham?.length > 0 ? (
                  donHang.danhSachSanPham.map((sp, idx) => (
                    <div key={idx} className="mb-1 last:mb-0">
                      <div className="flex gap-1 items-center font-medium ">
                        <div className="text-sm">{{ "Hàng sửa": "Sửa", "Hàng làm lại": "Làm lại", "Hàng bảo hành": "Bảo hành" }[sp.loaiDon] ?? sp.loaiDon}</div>
                        -
                        <div className="text-sm">{sp.soLuong}</div>
                        <div className="text-sm">{sp.sanPham?.tenSanPham || "N/A"}</div>
                      </div>
                      {sp.viTri?.length > 0 && (
                        <div className="text-sm text-gray-700">• Vị trí: {renderViTriText(sp.viTri)}</div>
                      )}
                      {sp.mau && <div className="text-sm text-gray-700">• Màu: {sp.mau}</div>}
                      {sp.ghiChu && <div className="text-sm text-gray-700">• {sp.ghiChu}</div>}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm italic">Chưa có sản phẩm</div>
                )}

                {/* --- KHU VỰC ĐÃ CẬP NHẬT GIAO DIỆN NÚT IN BẢO HÀNH --- */}
                {(hasWarranty || donHang?.danhSachSanPham?.some((sp) => sp.loaiDon === "Mới")) && (
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <button
                      onClick={hasWarranty ? handleOpenWarrantyView : handleOpenPhieuBaoHanh}
                      className={`font-medium text-sm px-3 py-1.5 rounded-full text-white flex items-center gap-2 transition-colors ${hasWarranty ? "bg-teal-500 hover:bg-teal-600" : "bg-slate-500 hover:bg-slate-600"}`}
                    >
                      <ReceiptIcon sx={{ fontSize: 18 }} /> Thẻ bảo hành
                    </button>
                  </div>
                )}
                {/* --------------------------------------------------- */}
              </div>

              {/* Phụ kiện */}
              {donHang.danhSachPhuKien?.length > 0 && (
                <div className="px-4 py-3 border-b">
                  <h4 className="font-semibold mb-2">Phụ kiện</h4>
                  <div className="flex flex-col gap-1">
                    {donHang.danhSachPhuKien.map((pk, idx) => (
                      <div key={idx} className="text-sm">
                        {pk.soLuong} {pk.tenPhuKien}
                        {pk.soHuu && <span className="text-sm ml-1">• {pk.soHuu}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhật ký chỉnh sửa */}
              {Object.keys(groupedNhatKy).length > 0 && (
                <div className="px-4 py-3">
                  <h4 className="font-semibold mb-2">Nhật ký chỉnh sửa</h4>
                  {Object.entries(groupedNhatKy).reverse().map(([dateKey, entries]) => (
                    <div key={dateKey} className="mb-3">
                      <div className="text-sm font-medium mb-1">{dateKey}</div>
                      {entries.map((entry, i) => {
                        const t = new Date(entry.thoiGian);
                        const timeStr = t.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
                        return (
                          <div key={i} className="flex gap-2 text-sm mb-1 ml-3">
                            <span className="text-gray-600 text-xs pt-0.5">{timeStr}</span>
                            <span>
                              <span className="font-medium text-gray-800">{entry.nguoiThuc}</span>
                              <span className="text-gray-600 ml-1">{entry.hanhDong}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {donHang && activeTab === "sanxuat" && (
            <div className="p-4">
              {donHang.danhSachSanPham?.map((sp, spIdx) => {
                const quyTrinh = sp.sanPham?.quyTrinh
                  ? [...sp.sanPham.quyTrinh].sort((a, b) => a.thuTu - b.thuTu)
                  : [];
                return (
                  <div key={spIdx} className="mb-4 border rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 border-b px-3 py-2">
                      <div className="font-semibold text-gray-800 text-sm">
                        {sp.sanPham?.tenSanPham || `Sản phẩm ${spIdx + 1}`}
                      </div>
                      {(sp.viTri?.length > 0 || sp.mau) && (
                        <div className="text-sm text-gray-600 mt-0.5">
                          {sp.viTri?.length > 0 && <><span className="font-medium text-black">{sp.soLuong}</span> răng: <span className="font-medium text-black">{renderViTriText(sp.viTri)}</span></>}
                          {sp.mau && <span className="ml-1">– Màu răng: <span className="font-medium text-black">{sp.mau}</span></span>}
                        </div>
                      )}
                    </div>
                    <div className="divide-y">
                      {quyTrinh.length > 0 ? (
                        quyTrinh.map((cd, i) => {
                          const currentStatus = getCongDoanTrangThai(sp, cd.thuTu);
                          const isDropOpen = openDropdown?.spIndex === spIdx && openDropdown?.thuTu === cd.thuTu;
                          return (
                            <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                              <span className="text-gray-700">{cd.thuTu}. {cd.tenCongDoan}</span>
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    if (props.fullscreen) return;
                                    e.stopPropagation();
                                    if (isDropOpen) {
                                      setOpenDropdown(null);
                                    } else {
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      setOpenDropdown({ spIndex: spIdx, thuTu: cd.thuTu, top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                    }
                                  }}
                                  className={`text-sm px-2 py-1 rounded transition ${CONG_DOAN_TRANG_THAI_STYLE[currentStatus]} ${props.fullscreen ? "cursor-default" : "hover:bg-gray-100"}`}
                                >
                                  {currentStatus}
                                </button>
                                {isDropOpen && ReactDOM.createPortal(
                                  <div
                                    style={{ top: openDropdown.top, right: openDropdown.right }}
                                    className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[150px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {CONG_DOAN_TRANG_THAI_OPTIONS.map((opt) => (
                                      <button
                                        key={opt}
                                        onClick={() => handleCongDoanStatusChange(spIdx, cd.thuTu, opt)}
                                        className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition ${opt === currentStatus ? "font-semibold text-cyan-600" : "text-gray-700"}`}
                                      >
                                        {opt}
                                      </button>
                                    ))}
                                  </div>,
                                  document.body
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-3 py-3 text-sm text-gray-400 italic">Chưa có thông tin công đoạn</div>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!donHang.danhSachSanPham || donHang.danhSachSanPham.length === 0) && (
                <div className="text-gray-400 text-sm italic text-center mt-8">Chưa có sản phẩm</div>
              )}
            </div>
          )}

          {donHang && activeTab === "ghichu" && (
            <div className="p-4 flex flex-col gap-4 text-sm">
              <NoteBlock label="Chỉ định của bác sĩ" value={donHang.chiDinhBacSi} />
              <NoteBlock label="Ghi chú chung" value={donHang.ghiChuChung} />
              <NoteBlock label="Ghi chú tài chính" value={donHang.ghiChuTaiChinh} />
              <NoteBlock label="Ghi chú sản xuất" value={donHang.ghiChuSanXuat} />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        {!props.fullscreen && (
          <div className="border-t bg-white px-3 py-2.5 flex gap-2 shrink-0">
            <button
              onClick={handleMarkComplete}
              disabled={donHang?.trangThai === "Hoàn thành"}
              className={`flex-1 py-2 rounded-lg font-medium text-sm transition flex items-center justify-center gap-1.5 ${donHang?.trangThai === "Hoàn thành" ? "bg-green-100 text-green-700 border border-green-200 cursor-default" : "bg-green-500 hover:bg-green-600 text-white"}`}
            >
              <CheckIcon />
              {donHang?.trangThai === "Hoàn thành" ? "Đã hoàn thành" : "Hoàn thành"}
            </button>
            <button
              onClick={() => navigate(`/donhang/${donHang._id}/print`)}
              className="flex-1 py-2 rounded-lg font-medium text-sm bg-blue-500 hover:bg-blue-600 text-white transition flex items-center justify-center gap-1.5"
            >
              <PrintIcon />
              Phiếu chỉ định
            </button>
            <button
              onClick={() => navigate(`/donhang/${donHang._id}/delivery-note`)}
              className="flex-1 py-2 rounded-lg font-medium text-sm bg-orange-500 hover:bg-orange-600 text-white transition flex items-center justify-center gap-1.5"
            >
              <LocalShippingIcon />
              Phiếu giao hàng
            </button>
          </div>
        )}
      </div >

      {donHang && isPhieuBaoHanhOpen && (
        <PhieuBaoHanhModal
          open={isPhieuBaoHanhOpen}
          onClose={() => setIsPhieuBaoHanhOpen(false)}
          donHang={donHang}
          onSuccess={(newWarranty) => {
            toast.success("Đã tạo phiếu bảo hành");
            setIsPhieuBaoHanhOpen(false);
            setWarranty(newWarranty);
            if (newWarranty) {
              const enriched = (newWarranty.danhSachBaoHanh || []).map((item) => {
                const startDate = new Date(item.baoHanhTu);
                const endDate = new Date(item.baoHanhDen);
                const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
                const expectedEnd = addYearsToDate(item.baoHanhTu, yearsDiff);
                const actualEndStr = endDate.toISOString().slice(0, 10);
                const isExactYears = expectedEnd === actualEndStr;
                return {
                  ...item,
                  selectedYears: isExactYears ? yearsDiff : "",
                  customEndDate: isExactYears ? "" : actualEndStr,
                };
              });
              setWarrantyEditForm({
                ghiChu: newWarranty.ghiChu || "",
                danhSachBaoHanh: enriched,
              });
              setOpenWarrantyDialog(true);
            }
          }}
        />
      )}

      {
        warranty && (
          <WarrantyCardPrint
            open={openPrintWarranty}
            onClose={() => setOpenPrintWarranty(false)}
            warranty={warranty}
            donHang={{ ...fullDonHang, bacSi: fullDonHang?.bacSi?.hoVaTen ? fullDonHang.bacSi : donHang?.bacSi }}
          />
        )
      }

      {/* Warranty edit dialog */}
      <Dialog open={openWarrantyDialog} onClose={() => setOpenWarrantyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#1976d2", color: "white", fontWeight: "bold" }}>
          Phiếu Bảo Hành
        </DialogTitle>
        <DialogContent className="mt-6">
          {warranty && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <div className="text-sm space-y-1">
                  <div><span className="font-bold text-blue-900">Mã BH:</span> <span className="font-semibold">{warranty.maBaoHanh}</span></div>
                  <div><span className="font-bold text-blue-900">Đơn hàng:</span> <span className="font-semibold">{warranty.donHang?.maDonHang || donHang?.maDonHang}</span></div>
                  <div><span className="font-bold text-blue-900">Bệnh nhân:</span> <span className="font-semibold text-blue-700">{warranty.benhNhan?.hoVaTen || donHang?.benhNhan?.hoVaTen}</span></div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-700 mb-3">Danh sách sản phẩm &amp; bảo hành:</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {warrantyEditForm.danhSachBaoHanh.map((item, idx) => (
                  <div key={idx} className="p-3 bg-blue-50/30 rounded-lg border border-blue-200 shadow-sm">
                    <div className="mb-3 flex flex-col gap-0.5">
                      <div className="font-bold text-blue-800 text-sm">
                        {idx + 1}. {item.sanPham?.tenSanPham || item.sanPham}
                      </div>
                      {item.viTriRang && <div className="text-xs text-gray-600">Vị trí: {item.viTriRang}</div>}
                      {item.soLuong && <div className="text-xs text-gray-600">SL: {item.soLuong}</div>}
                      {item.mau && <div className="text-xs text-gray-600">Màu: {item.mau}</div>}
                      <div className="text-xs text-gray-500 mt-1">
                        Ngày bắt đầu: {formatDateVN(item.baoHanhTu)} &nbsp;|&nbsp; Hạn hiện tại:{" "}
                        <span className="font-semibold text-gray-800">{formatDateVN(warranty.danhSachBaoHanh?.[idx]?.baoHanhDen)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Chọn năm bảo hành:</label>
                        <TextField
                          select
                          value={item.selectedYears ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newList = [...warrantyEditForm.danhSachBaoHanh];
                            const newEnd = val === "" ? item.baoHanhTu : addYearsToDate(item.baoHanhTu, Number(val));
                            newList[idx] = { ...newList[idx], selectedYears: val === "" ? "" : Number(val), customEndDate: "", baoHanhDen: new Date(newEnd).toISOString() };
                            setWarrantyEditForm({ ...warrantyEditForm, danhSachBaoHanh: newList });
                          }}
                          fullWidth size="small"
                        >
                          <MenuItem value="">-- Chọn năm --</MenuItem>
                          {Array.from({ length: 11 }, (_, i) => i).map((y) => (
                            <MenuItem key={y} value={y}>{y} năm</MenuItem>
                          ))}
                        </TextField>
                      </div>
                      <div className="col-span-2 flex items-center justify-center mt-4">
                        <span className="text-gray-400 text-xs">hoặc</span>
                      </div>
                      <div className="col-span-5">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày bảo hành đến:</label>
                        <TextField
                          type="date"
                          value={item.customEndDate || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newList = [...warrantyEditForm.danhSachBaoHanh];
                            newList[idx] = { ...newList[idx], customEndDate: val, selectedYears: "", baoHanhDen: val ? new Date(val).toISOString() : new Date(item.baoHanhTu).toISOString() };
                            setWarrantyEditForm({ ...warrantyEditForm, danhSachBaoHanh: newList });
                          }}
                          fullWidth size="small"
                        />
                      </div>
                      <div className="col-span-12 mt-1 pt-2 border-t border-green-200 bg-green-50 rounded px-3 py-1.5 flex items-center gap-2">
                        <span className="font-semibold text-xs text-green-900">Kết quả:</span>
                        <span className="text-xs text-green-800">{formatDateVN(item.baoHanhTu)} → {formatDateVN(item.baoHanhDen)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <TextField
                label="Ghi chú"
                value={warrantyEditForm.ghiChu}
                onChange={(e) => setWarrantyEditForm({ ...warrantyEditForm, ghiChu: e.target.value })}
                fullWidth multiline rows={2} size="small"
                sx={{ mt: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleSyncFromOrder}
            variant="outlined"
            color="primary"
            disabled={savingWarranty}
            style={{ marginRight: "auto" }}
          >
            Cập nhật phiếu BH
          </Button>
          <Button
            onClick={() => setOpenWarrantyDialog(false)}
            variant="contained"
            color="warning"
            size="medium"
          >
            Hủy
          </Button>
          <Button
            onClick={() => { setOpenWarrantyDialog(false); handleOpenPrintWarranty(); }}
            variant="contained"
            color="success"
            size="medium"
            startIcon={<PrintIcon />}
          >
            In thẻ BH
          </Button>
          <Button
            onClick={handleSaveWarrantyEdit}
            variant="contained"
            color="primary"
            size="medium"
            disabled={savingWarranty}
          >
            {savingWarranty ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
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