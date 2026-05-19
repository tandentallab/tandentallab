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
  const start = new Date(dateValue);
  const result = new Date(start.getFullYear() + years, start.getMonth(), start.getDate());
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
  const [selectedProductIndex, setSelectedProductIndex] = useState("");
  const [selectedYears, setSelectedYears] = useState(null);
  const [customEndDate, setCustomEndDate] = useState("");
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
        setSelectedProductIndex("");
        setSelectedYears(1);
        setCustomEndDate("");
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
  const selectedProduct = selectedProductIndex === "" ? null : productOptions[Number(selectedProductIndex)];
  
  // Lọc sản phẩm đã có phiếu bảo hành từ database, chỉ hiển thị sản phẩm chưa có phiếu
  const sanPhamDaCoPhieu = fullDonHang?.phieuBaoHanh?.danhSachBaoHanh?.map(item => 
    item.sanPham?._id || item.sanPham
  ) || [];
  
  const availableProducts = productOptions.filter((sp) => {
    const spId = sp.sanPham?._id || sp.sanPham;
    return !sanPhamDaCoPhieu.includes(spId);
  });

  // Lấy thời gian bảo hành mặc định từ sản phẩm
  const getDefaultWarrantyEndDate = () => {
    if (!selectedProduct || !selectedProduct.sanPham) return "";
    const defaultYears = selectedProduct.sanPham.baoHanhMacDinh || 0;
    return addYearsToDate(fullDonHang.ngayNhan, defaultYears);
  };

  // Tính ngày kết thúc dựa trên lựa chọn của admin
  const getCalculatedEndDate = () => {
    if (customEndDate) return customEndDate;
    if (selectedYears !== null) return addYearsToDate(fullDonHang.ngayNhan, selectedYears);
    return getDefaultWarrantyEndDate();
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

      if (selectedProductIndex === "") {
        toast.error("Vui lòng chọn sản phẩm");
        return;
      }

      if (!fullDonHang?._id) {
        toast.error("Không tìm thấy đơn hàng");
        return;
      }

      const index = Number(selectedProductIndex);
      const product = productOptions[index];
      if (!product) {
        toast.error("Sản phẩm không hợp lệ");
        return;
      }

      setLoading(true);

      // Lấy ID sản phẩm từ dữ liệu
      const sanPhamId = product.sanPham?._id || product.sanPham;
      const endDate = getCalculatedEndDate();

      // Tạo payload cho 1 sản phẩm duy nhất
      const payload = {
        donHang: fullDonHang._id,
        danhSachBaoHanh: [
          {
            sanPham: sanPhamId,
            viTriRang: product.viTri?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`).join("; ") || "---",
            soLuong: product.soLuong || 1,
            mau: product.mau || "",
            baoHanhTu: new Date(fullDonHang.ngayNhan).toISOString(),
            baoHanhDen: new Date(endDate).toISOString(),
          },
        ],
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
        setSelectedProductIndex("");
        setSelectedYears(1);
        setCustomEndDate("");
        
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
        {/* Hàng 1: Mã bảo hành | Sản phẩm */}
        <div className="grid grid-cols-2 gap-4">
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
            <label className="text-xs text-gray-600 font-bold block mb-2">Sản phẩm *</label>
            <TextField
              select
              value={selectedProductIndex}
              onChange={(e) => {
                setSelectedProductIndex(e.target.value);
                setSelectedYears(null);
                setCustomEndDate("");
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="">Chọn sản phẩm</MenuItem>
              {availableProducts.map((sp) => {
                const originalIndex = productOptions.findIndex(p => p === sp);
                return (
                  <MenuItem key={originalIndex} value={String(originalIndex)}>
                    {sp.sanPham?.tenSanPham || `Sản phẩm ${originalIndex + 1}`}
                  </MenuItem>
                );
              })}
            </TextField>
          </div>
        </div>

        {/* Hàng 2: Bảo hành từ | Bảo hành đến | Chọn năm bảo hành */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Bảo hành từ</label>
            <TextField
              disabled
              value={fullDonHang.ngayNhan ? formatDateVN(fullDonHang.ngayNhan) : ""}
              fullWidth
              size="small"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Bảo hành đến</label>
            <div className="flex gap-2">
              <TextField
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                fullWidth
                size="small"
                disabled={!selectedProduct}
                inputProps={{ style: { minHeight: 40 } }}
              />
              {customEndDate && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setCustomEndDate("")}
                  sx={{ minWidth: "40px", px: 0 }}
                >
                  ✕
                </Button>
              )}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Chọn năm bảo hành</label>
            <TextField
              select
              value={selectedYears ?? (selectedProduct?.sanPham?.baoHanhMacDinh || 0)}
              onChange={(e) => {
                setSelectedYears(e.target.value === "" ? null : Number(e.target.value));
              }}
              fullWidth
              size="small"
              disabled={!selectedProduct}
            >
              {Array.from({ length: 11 }, (_, i) => i).map((year) => (
                <MenuItem key={year} value={year}>
                  {year} năm {year === (selectedProduct?.sanPham?.baoHanhMacDinh || 0) && selectedYears === null ? "(Mặc định)" : ""}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {/* Hàng 2.5: Hiển thị thời gian bảo hành cụ thể */}
        {selectedProduct && (
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Thời gian bảo hành:</span> {formatDateVN(fullDonHang.ngayNhan)} → {formatDateVN(getCalculatedEndDate())} 
              <span className="text-gray-500 ml-2">
                ({Math.ceil((new Date(getCalculatedEndDate()) - new Date(fullDonHang.ngayNhan)) / (1000 * 60 * 60 * 24))} ngày)
              </span>
            </p>
          </div>
        )}

        {/* Hàng 3: Tên nha khoa trên thẻ | Vị trí răng | Số lượng */}
        <div className="grid grid-cols-3 gap-4">
          <TextField
            label="Tên nha khoa trên thẻ"
            disabled
            value={fullDonHang?.nhaKhoa?.tenGiaoDich || fullDonHang?.nhaKhoa?.hoVaTen || "---"}
            fullWidth
            size="small"
          />
          <TextField
            label="Vị trí răng"
            disabled
            value={selectedProduct?.viTri?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`).join("; ") || "---"}
            fullWidth
            size="small"
          />
          <TextField
            label="Số lượng"
            disabled
            value={selectedProduct?.soLuong || ""}
            fullWidth
            size="small"
          />
        </div>

        {/* Hàng 4: Bác sĩ | Mẫu thẻ */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Bác sĩ"
            disabled
            value={fullDonHang?.bacSi?.hoVaTen || "---"}
            fullWidth
            size="small"
          />
          <TextField
          label="Mẫu thẻ"
          select // Thêm thuộc tính này
          fullWidth
          size="small"
          value={selectedMauTheId || ""} // Bạn cần tạo state selectedMauTheId để lưu giá trị chọn
          onChange={(e) => setSelectedMauTheId(e.target.value)}
          >
          {mauTheList.map((mau) => (
            <MenuItem key={mau._id} value={mau._id}>
              {mau.tenMau}
            </MenuItem>
          ))}
        </TextField>
        </div>

        {/* Hàng 5: Tên bệnh nhân */}
        <TextField
          label="Tên bệnh nhân trên thẻ"
          disabled
          value={fullDonHang?.benhNhan?.hoVaTen || "---"}
          fullWidth
          size="small"
        />

        {/* Hàng 6: Điện thoại | Số CCCD */}
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Điện thoại"
            disabled
            value={fullDonHang?.nhaKhoa?.soDienThoai || "---"}
            fullWidth
            size="small"
          />
          <TextField
            label="Số CCCD"
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
          disabled={loading || selectedProductIndex === ""}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhieuBaoHanhModal;
