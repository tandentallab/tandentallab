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
  const [selectedYears, setSelectedYears] = useState(1);
  const [customEndDate, setCustomEndDate] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [items, setItems] = useState([]);

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
        setItems([]);
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

  const handleAddProduct = () => {
    if (selectedProductIndex === "") {
      toast.error("Vui lòng chọn sản phẩm");
      return;
    }

    const index = Number(selectedProductIndex);
    const product = productOptions[index];
    if (!product) {
      toast.error("Sản phẩm không hợp lệ");
      return;
    }

    const endDate = customEndDate || addYearsToDate(fullDonHang.ngayNhan, selectedYears);
    const exists = items.some((item) => item.sanPhamIndex === index);
    if (exists) {
      toast.error("Sản phẩm này đã được thêm vào phiếu");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        sanPhamIndex: index,
        tenSanPham: product.sanPham?.tenSanPham || "---",
        viTriRang: product.viTri?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`).join("; ") || "---",
        soLuong: product.soLuong || 1,
        mau: product.mau || "",
        baoHanhTu: fullDonHang.ngayNhan,
        baoHanhDen: endDate,
      },
    ]);

    setSelectedProductIndex("");
    setSelectedYears(1);
    setCustomEndDate("");
  };

  const handleRemoveItem = (sanPhamIndex) => {
    setItems((prev) => prev.filter((item) => item.sanPhamIndex !== sanPhamIndex));
  };

  const handleSubmit = async () => {
    try {
      if (!fullDonHang?._id) {
        toast.error("Không tìm thấy đơn hàng");
        return;
      }

      if (items.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 sản phẩm vào phiếu bảo hành");
        return;
      }

      setLoading(true);

      const payload = {
        donHang: fullDonHang._id,
        danhSachBaoHanh: items.map((item) => ({
          sanPham: productOptions[item.sanPhamIndex].sanPham?._id || productOptions[item.sanPhamIndex].sanPham,
          viTriRang: item.viTriRang,
          soLuong: item.soLuong,
          mau: item.mau,
          baoHanhTu: new Date(item.baoHanhTu).toISOString(),
          baoHanhDen: new Date(item.baoHanhDen).toISOString(),
        })),
        mauTheTi: "Mẫu in Lab",
        ghiChu,
      };

      const res = await api.post("/phieu-bao-hanh", payload);
      if (res.data?.success) {
        toast.success(`Tạo phiếu bảo hành thành công! Mã: ${res.data.data.maBaoHanh}`);
        onSuccess?.();
        onClose();
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-blue-600 text-white font-bold">
        Thêm phiếu bảo hành
      </DialogTitle>

      <DialogContent className="pt-6 flex flex-col gap-4 px-8">
        <div>
          <label className="text-xs text-gray-600 font-bold block mb-2">Mã bảo hành</label>
          <TextField
            disabled
            value={maDonHang}
            fullWidth
            size="medium"
            inputProps={{ style: { fontSize: "16px", fontWeight: "bold" } }}
          />
        </div>

        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <label className="text-xs text-gray-600 font-bold block mb-2">Mã QR</label>
          <TextField
            disabled
            value={generatedQR}
            fullWidth
            size="small"
            inputProps={{ style: { fontSize: "14px", fontWeight: "bold" } }}
          />
          <p className="text-xs text-gray-600 mt-2">Mã QR 4 ký tự sẽ được sinh tự động khi lưu phiếu.</p>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField
              select
              label="Sản phẩm"
              value={selectedProductIndex}
              onChange={(e) => setSelectedProductIndex(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">Chọn sản phẩm</MenuItem>
              {productOptions.map((sp, index) => (
                <MenuItem key={index} value={String(index)}>
                  {sp.sanPham?.tenSanPham || `Sản phẩm ${index + 1}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Chọn năm bảo hành"
              value={selectedYears}
              onChange={(e) => {
                setSelectedYears(Number(e.target.value));
                setCustomEndDate("");
              }}
              fullWidth
              size="small"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
                <MenuItem key={year} value={year}>
                  {year} năm
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 block">
              Hoặc chọn ngày bảo hành
            </label>
            <TextField
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ style: { minHeight: 40 } }}
            />
          </div>

          {selectedProduct && (
            <div className="rounded bg-blue-50 border border-blue-200 p-3 text-sm text-gray-700 space-y-1">
              <div><span className="font-medium">Sản phẩm:</span> {selectedProduct.sanPham?.tenSanPham || "---"}</div>
              <div><span className="font-medium">Vị trí:</span> {selectedProduct.viTri?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`).join("; ") || "---"}</div>
              <div><span className="font-medium">Số lượng:</span> {selectedProduct.soLuong || 1}</div>
              <div><span className="font-medium">Màu:</span> {selectedProduct.mau || "---"}</div>
              <div><span className="font-medium">Bảo hành đến:</span> {customEndDate ? formatDateVN(customEndDate) : `${selectedYears} năm từ ngày nhận`}</div>
            </div>
          )}

          <Button variant="outlined" onClick={handleAddProduct} fullWidth>
            Thêm sản phẩm vào phiếu
          </Button>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Danh sách sản phẩm trong phiếu</div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {items.length > 0 ? items.map((item) => (
              <div key={item.sanPhamIndex} className="border rounded-lg p-3 bg-gray-50 flex items-start justify-between gap-3">
                <div className="text-sm space-y-1">
                  <div className="font-medium text-gray-800">{item.tenSanPham}</div>
                  <div className="text-gray-600">Vị trí: {item.viTriRang}</div>
                  <div className="text-gray-600">SL: {item.soLuong} | Màu: {item.mau || "---"}</div>
                  <div className="text-gray-600">BH: {formatDateVN(item.baoHanhTu)} - {formatDateVN(item.baoHanhDen)}</div>
                </div>
                <Button color="error" size="small" onClick={() => handleRemoveItem(item.sanPhamIndex)}>
                  Xóa
                </Button>
              </div>
            )) : (
              <div className="text-sm text-gray-400 italic">Chưa có sản phẩm nào được thêm vào phiếu</div>
            )}
          </div>
        </div>

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
          label="Tên bệnh nhân"
          disabled
          value={fullDonHang?.benhNhan?.hoVaTen || "---"}
          fullWidth
          size="small"
        />

        <TextField
          label="Điện thoại"
          disabled
          value={fullDonHang?.nhaKhoa?.soDienThoai || "---"}
          fullWidth
          size="small"
        />

        <TextField
          label="Mẫu thẻ"
          disabled
          value="Mẫu in Lab"
          fullWidth
          size="small"
        />

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
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhieuBaoHanhModal;
