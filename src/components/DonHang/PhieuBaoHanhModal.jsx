import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { api } from "../../config/api";
import { toast } from "sonner";

const generateQRCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let qr = "";
  for (let i = 0; i < 4; i += 1) {
    qr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return qr;
};

const addYearsToDate = (dateValue, years) => {
  if (!dateValue) return "";
  const start = new Date(dateValue);
  if (isNaN(start.getTime())) return "";
  const numYears = Number(years) || 0;
  const result = new Date(start.getFullYear() + numYears, start.getMonth(), start.getDate());
  if (isNaN(result.getTime())) return "";
  return result.toISOString().slice(0, 10);
};

const formatDateVN = (dateValue) => {
  if (!dateValue) return "---";
  return new Date(dateValue).toLocaleDateString("vi-VN");
};

const PhieuBaoHanhModal = ({ open, onClose, donHang, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [fullDonHang, setFullDonHang] = useState(null);
  const [generatedQR, setGeneratedQR] = useState("");
  const [productWarrantyConfigs, setProductWarrantyConfigs] = useState({});
  const [ghiChu, setGhiChu] = useState("");
  const [mauTheList, setMauTheList] = useState([]);
  const [selectedMauTheId, setSelectedMauTheId] = useState("");

  useEffect(() => {
    if (open) {
      const fetchMauThe = async () => {
        try {
          const res = await api.get("/mau-the-bao-hanh");
          if (res.data?.success) {
            setMauTheList(res.data.data);
            if (res.data.data.length > 0) {
              setSelectedMauTheId(res.data.data[0]._id);
            }
          }
        } catch (err) {
          toast.error("Không thể tải danh sách mẫu thẻ");
        }
      };
      fetchMauThe();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !donHang?._id) return;

    const loadDonHang = async () => {
      try {
        const res = await api.get(`/donhang/${donHang._id}`);
        const data = res.data?.data;
        setFullDonHang(data);
        setGeneratedQR(generateQRCode());
        setProductWarrantyConfigs({});
        setGhiChu("");
      } catch (error) {
        toast.error("Lỗi khi tải thông tin đơn hàng");
      }
    };

    loadDonHang();
  }, [open, donHang?._id]);

  const maDonHang = useMemo(() => {
    if (!fullDonHang) return "";
    return fullDonHang.maDonHang || `TAN${fullDonHang._id.substring(fullDonHang._id.length - 8).toUpperCase()}`;
  }, [fullDonHang]);

  const productOptions = fullDonHang?.danhSachSanPham || [];

  // Lọc sản phẩm đã có phiếu bảo hành từ database, chỉ hiển thị sản phẩm chưa có phiếu
  const sanPhamDaCoPhieu = fullDonHang?.phieuBaoHanh?.danhSachBaoHanh?.map(item =>
    item.sanPham?._id || item.sanPham
  ) || [];

  const availableProducts = productOptions.filter((sp) => {
    const spId = sp.sanPham?._id || sp.sanPham;
    return !sanPhamDaCoPhieu.includes(spId);
  });

  // Khởi tạo state cấu hình bảo hành cho từng sản phẩm
  useEffect(() => {
    if (availableProducts.length > 0 && Object.keys(productWarrantyConfigs).length === 0) {
      const initialConfigs = {};
      availableProducts.forEach((sp, idx) => {
        initialConfigs[idx] = {
          customEndDate: "",
          selectedYears: sp.sanPham?.baoHanhMacDinh || 0,
          tenSanPhamBaoHanh: sp.sanPham?.tenSanPham || sp.sanPham?.ten || "Sản phẩm",
        };
      });
      setProductWarrantyConfigs(initialConfigs);
    }
  }, [availableProducts, productWarrantyConfigs]);

  const handleConfigChange = (idx, field, value) => {
    setProductWarrantyConfigs(prev => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: value
      }
    }));
  };

  // Tính ngày kết thúc dựa trên lựa chọn của admin
  const getCalculatedEndDate = (sp, config) => {
    if (!config) return "";
    if (config.customEndDate) return config.customEndDate;
    if (!fullDonHang?.ngayNhan) return "";
    if (config.selectedYears !== null && config.selectedYears !== "") {
      return addYearsToDate(fullDonHang.ngayNhan, config.selectedYears);
    }
    const defaultYears = sp.sanPham?.baoHanhMacDinh || 0;
    return addYearsToDate(fullDonHang.ngayNhan, defaultYears);
  };

  const handleSubmit = async () => {
    console.log("Dữ liệu gửi lên:", {
      donHang: fullDonHang._id,
      mauTheId: selectedMauTheId, // Kiểm tra kỹ chỗ này
      ghiChu
    });
    try {

      // Kiểm tra nếu chưa chọn sản phẩm
      if (!selectedMauTheId) {
        toast.error("Vui lòng chọn mẫu thẻ trước khi lưu!");
        return;
      }

      if (availableProducts.length === 0) {
        toast.error("Không có sản phẩm nào để bảo hành");
        return;
      }

      if (!fullDonHang?._id) {
        toast.error("Không tìm thấy đơn hàng");
        return;
      }

      setLoading(true);

      const danhSachBaoHanh = availableProducts.map((product, idx) => {
        const config = productWarrantyConfigs[idx] || {};
        const sanPhamId = product.sanPham?._id || product.sanPham;
        const endDate = getCalculatedEndDate(product, config);
        const startDate = fullDonHang.ngayNhan ? new Date(fullDonHang.ngayNhan).toISOString() : new Date().toISOString();
        const finalEndDate = endDate ? new Date(endDate).toISOString() : new Date().toISOString();

        return {
          sanPham: sanPhamId,
          viTriRang: product.viTri?.map((v) => {
            if (!v.soRang || v.soRang.length === 0) return "";
            if (v.kieu === "Rời" || v.soRang.length === 1) return v.soRang.join(", ");
            return `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`;
          }).filter(Boolean).join("; ") || "---",
          soLuong: product.soLuong || 1,
          mau: product.mau || "",
          tenSanPhamBaoHanh: config.tenSanPhamBaoHanh || product.sanPham?.tenSanPham || product.sanPham?.ten || "",
          baoHanhTu: startDate,
          baoHanhDen: finalEndDate,
        };
      });

      const payload = {
        donHang: fullDonHang._id,
        danhSachBaoHanh,
        mauTheId: selectedMauTheId,
        ghiChu,
      };

      const res = await api.post("/phieu-bao-hanh", payload);
      if (res.data?.success) {
        toast.success(`Tạo phiếu bảo hành thành công! Mã: ${res.data.data.maBaoHanh}`);

        // Reload lại fullDonHang để cập nhật danh sách phiếu bảo hành
        const reloadRes = await api.get(`/donhang/${fullDonHang._id}`);
        if (reloadRes.data?.data) {
          setFullDonHang(reloadRes.data.data);
        }

        // Reset form
        setProductWarrantyConfigs({});

        onSuccess?.();
      } else {
        toast.error(res.data?.message || "Lỗi khi tạo phiếu bảo hành");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Lỗi khi tạo phiếu bảo hành");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !donHang?._id || !fullDonHang) return null;

  // Nếu không còn sản phẩm nào, tự động đóng modal
  if (availableProducts.length === 0) {
    onClose();
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-blue-600 text-white font-bold">
        Thêm phiếu bảo hành
      </DialogTitle>

      <DialogContent className="pt-6 flex flex-col gap-4 px-8">
        {/* Hàng 1: Mã bảo hành | Mẫu thẻ */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Mã bảo hành</label>
            <TextField
              disabled
              value={maDonHang}
              fullWidth
              size="small"
              inputProps={{ style: { fontSize: "14px", fontWeight: "bold" } }}
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Mẫu thẻ *</label>
            <TextField
              select
              fullWidth
              size="small"
              value={selectedMauTheId || ""}
              onChange={(e) => setSelectedMauTheId(e.target.value)}
            >
              {mauTheList.map((mau) => (
                <MenuItem key={mau._id} value={mau._id}>
                  {mau.tenMau}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="flex flex-col gap-3 my-2">
          <label className="text-xs text-gray-600 font-bold block">Danh sách sản phẩm bảo hành</label>
          {availableProducts.map((sp, idx) => {
            const config = productWarrantyConfigs[idx] || {};
            const calculatedEndDate = getCalculatedEndDate(sp, config);
            return (
              <div key={idx} className="border border-blue-100 rounded p-4 bg-blue-50/30 flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex flex-col gap-1">
                    <span className="font-bold text-sm text-blue-800">{sp.sanPham?.tenSanPham || `Sản phẩm ${idx + 1}`}</span>
                    <span className="text-xs text-gray-600">
                      Vị trí: {sp.viTri?.map((v) => {
                        if (!v.soRang || v.soRang.length === 0) return "";
                        if (v.kieu === "Rời" || v.soRang.length === 1) return v.soRang.join(", ");
                        return `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`;
                      }).filter(Boolean).join("; ") || "---"} | SL: {sp.soLuong || 1}
                    </span>
                  </div>

                  <div className="col-span-4 flex flex-col gap-1 text-xs text-gray-700">
                    <span className="font-medium">Từ: <span className="font-normal">{formatDateVN(fullDonHang.ngayNhan)}</span></span>
                    <span className="font-medium">Đến: <span className="text-blue-700 font-semibold">{formatDateVN(calculatedEndDate)}</span></span>
                  </div>

                  <div className="col-span-2">
                    <TextField
                      type="date"
                      value={config.customEndDate || ""}
                      onChange={(e) => handleConfigChange(idx, "customEndDate", e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ style: { fontSize: '13px' } }}
                    />
                  </div>
                  <div className="col-span-2">
                    <TextField
                      select
                      value={config.selectedYears ?? (sp.sanPham?.baoHanhMacDinh || 0)}
                      onChange={(e) => {
                        handleConfigChange(idx, "selectedYears", e.target.value === "" ? null : Number(e.target.value));
                        handleConfigChange(idx, "customEndDate", "");
                      }}
                      fullWidth
                      size="small"
                      inputProps={{ style: { fontSize: '13px' } }}
                    >
                      {Array.from({ length: 11 }, (_, i) => i).map((year) => (
                        <MenuItem key={year} value={year}>
                          {year} năm
                        </MenuItem>
                      ))}
                    </TextField>
                  </div>
                </div>

                {/* Tên sản phẩm bảo hành */}
                <div>
                  <TextField
                    label="Tên sản phẩm bảo hành"
                    placeholder="Nhập chi tiết loại răng bảo hành..."
                    value={config.tenSanPhamBaoHanh ?? ""}
                    onChange={(e) => handleConfigChange(idx, "tenSanPhamBaoHanh", e.target.value)}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      className: "bg-white rounded-lg",
                      style: { fontSize: '13px' }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Thông tin nha khoa, bác sĩ, bệnh nhân */}
        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Tên nha khoa trên thẻ"
            disabled
            value={fullDonHang?.nhaKhoa?.tenGiaoDich || fullDonHang?.nhaKhoa?.hoVaTen || "---"}
            fullWidth
            size="small"
          />
          <TextField
            label="Bác sĩ"
            disabled
            value={fullDonHang?.bacSi?.hoVaTen || "---"}
            fullWidth
            size="small"
          />
          <TextField
            label="Tên bệnh nhân trên thẻ"
            disabled
            value={fullDonHang?.benhNhan?.hoVaTen || "---"}
            fullWidth
            size="small"
          />
        </div>

        {/* Thông tin liên hệ */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Điện thoại"
            disabled
            value={fullDonHang?.nhaKhoa?.soDienThoai || "---"}
            fullWidth
            size="small"
          />
        </div>

        {/* Hàng 7: Ghi chú */}
        <TextField
          label="Ghi chú"
          value={ghiChu}
          onChange={(e) => setGhiChu(e.target.value)}
          fullWidth
          multiline
          rows={2}
          size="small"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || availableProducts.length === 0}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhieuBaoHanhModal;
