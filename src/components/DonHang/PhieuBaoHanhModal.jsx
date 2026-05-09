import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";
import { api } from "../../config/api";

const PhieuBaoHanhModal = ({ open, onClose, donHang, onSuccess, productIndex = null }) => {
  const [formData, setFormData] = useState({
    selectedProducts: [],
    mauTheTi: "Mẫu in UNC",
    baoHanhDen: "",
    namBaoHanh: 1,
    ghiChu: "",
  });

  const [loading, setLoading] = useState(false);
  const [fullDonHang, setFullDonHang] = useState(null);
  const [useCustomDate, setUseCustomDate] = useState(false);

  // Fetch full donHang data khi modal mở
  useEffect(() => {
    if (open && donHang?._id) {
      const fetchFullDonHang = async () => {
        try {
          const res = await api.get(`/donhang/${donHang._id}`);
          setFullDonHang(res.data.data);

          // Auto-set selectedProducts: nếu 1 sản phẩm thì chọn ngay, nếu nhiều để admin chọn
          const spList = res.data.data?.danhSachSanPham || [];
          if (productIndex !== null && spList[productIndex]) {
            setFormData((prev) => ({ ...prev, selectedProducts: [productIndex] }));
          } else if (spList.length === 1) {
            setFormData((prev) => ({ ...prev, selectedProducts: [0] }));
          } else {
            setFormData((prev) => ({ ...prev, selectedProducts: [] }));
          }

          // Auto-set bảo hành đến = 1 năm
          const start = new Date(res.data.data.ngayNhan);
          const end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate());
          setFormData((prev) => ({
            ...prev,
            baoHanhDen: end.toISOString().split("T")[0],
            namBaoHanh: 1,
          }));
        } catch (err) {
          console.error("Lỗi fetch full donHang:", err);
        }
      };
      fetchFullDonHang();
    }
  }, [open, donHang?._id, productIndex]);

  // Guard: Không render nếu donHang không có _id hoặc modal chưa mở
  if (!open || !donHang?._id) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductSelect = (index) => {
    setFormData((prev) => {
      const selected = [...prev.selectedProducts];
      if (selected.includes(index)) {
        // Uncheck
        return { ...prev, selectedProducts: selected.filter((i) => i !== index) };
      } else {
        // Check
        return { ...prev, selectedProducts: [...selected, index] };
      }
    });
  };

  const handleYearChange = (years) => {
    if (!fullDonHang?.ngayNhan) return;
    const start = new Date(fullDonHang.ngayNhan);
    const end = new Date(start.getFullYear() + years, start.getMonth(), start.getDate());
    setFormData({
      ...formData,
      namBaoHanh: years,
      baoHanhDen: end.toISOString().split("T")[0],
    });
    setUseCustomDate(false);
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, baoHanhDen: e.target.value });
    setUseCustomDate(true);
  };

  const handleSubmit = async () => {
    try {
      if (!fullDonHang?._id) {
        alert("Lỗi: Không tìm thấy mã đơn hàng");
        return;
      }

      if (formData.selectedProducts.length === 0) {
        alert("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
      }

      setLoading(true);

      const baoHanhDenDate = new Date(formData.baoHanhDen);
      const createdPhieus = [];

      const targetProducts =
        productIndex !== null ? [productIndex] : formData.selectedProducts;

      // Tạo phiếu bảo hành cho mỗi sản phẩm được chọn
      for (const spIndex of targetProducts) {
        const selectedSP = fullDonHang.danhSachSanPham[spIndex];
        if (!selectedSP) continue;

        // Tính vị trí răng từ viTri object
        const viTriRang = selectedSP.viTri
          .map((v) => `${v.kieu}: ${v.soRang.join(", ")}`)
          .join("; ");

        // Convert dates to ISO string format
        const baoHanhTuDate = new Date(fullDonHang.ngayNhan).toISOString();
        const baoHanhDenDate = new Date(formData.baoHanhDen).toISOString();

        const payload = {
          donHang: fullDonHang._id,
          nhaKhoa: fullDonHang.nhaKhoa?._id || fullDonHang.nhaKhoa,
          bacSi: fullDonHang.bacSi?._id || fullDonHang.bacSi,
          benhNhan: fullDonHang.benhNhan?._id || fullDonHang.benhNhan,
          sanPham: selectedSP.sanPham?._id || selectedSP.sanPham,
          viTriRang: viTriRang,
          soLuong: selectedSP.soLuong || 1,
          mau: selectedSP.mau || "",
          mauTheTi: formData.mauTheTi,
          baoHanhTu: baoHanhTuDate,
          baoHanhDen: baoHanhDenDate,
          soDienThoai: fullDonHang.benhNhan?.soDienThoai || "",
          ghiChu: formData.ghiChu || selectedSP.ghiChu || "",
        };

        const res = await api.post("/phieu-bao-hanh", payload);
        if (res.data?.success) {
          createdPhieus.push(selectedSP.sanPham?.tenSanPham || "Sản phẩm");
        }
      }

      if (createdPhieus.length > 0) {
        alert(`Thêm phiếu bảo hành thành công cho: ${createdPhieus.join(", ")}`);
        setFormData({
          selectedProducts:
            productIndex !== null && fullDonHang?.danhSachSanPham?.[productIndex]
              ? [productIndex]
              : [],
          mauTheTi: "Mẫu in UNC",
          baoHanhDen: "",
          namBaoHanh: 1,
          ghiChu: "",
        });
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Lỗi tạo phiếu:", err);
      alert("Lỗi khi thêm phiếu bảo hành: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const baoHanhTu = fullDonHang?.ngayNhan
    ? new Date(fullDonHang.ngayNhan).toLocaleDateString("vi-VN")
    : "---";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="bg-blue-600 text-white font-bold">
        Thêm phiếu bảo hành
      </DialogTitle>

      <DialogContent className="pt-6 flex flex-col gap-4 px-8">
        {/* Mã bảo hành - Tách riêng, tăng kích thước */}
        <div>
          <label className="text-xs text-gray-600 font-bold block mb-2">Mã bảo hành</label>
          <TextField
            disabled
            value={fullDonHang?._id ? `TAN${fullDonHang._id.substring(fullDonHang._id.length - 8).toUpperCase()}` : ""}
            fullWidth
            size="medium"
            inputProps={{ style: { fontSize: "16px", fontWeight: "bold" } }}
          />
        </div>

        {/* Mã QR */}
        <TextField label="Mã QR" placeholder="(Để trống)" fullWidth size="small" />

        {productIndex === null && (
          <div>
            <label className="text-xs text-gray-600 font-bold block mb-2">Chọn sản phẩm *</label>
            <div className="border rounded p-3 space-y-2">
              {fullDonHang?.danhSachSanPham?.length === 1 ? (
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-sm">
                    ✓ {fullDonHang.danhSachSanPham[0].sanPham?.tenSanPham || "---"}
                  </div>
                </div>
              ) : (
                fullDonHang?.danhSachSanPham?.map((sp, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.selectedProducts.includes(idx)}
                      onChange={() => handleProductSelect(idx)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{sp.sanPham?.tenSanPham || "---"}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {productIndex !== null && fullDonHang?.danhSachSanPham?.[productIndex] && (
          <div className="space-y-3 bg-blue-50 p-3 rounded border border-blue-200">
            <TextField
              label="Sản phẩm"
              disabled
              value={fullDonHang.danhSachSanPham[productIndex].sanPham?.tenSanPham || "---"}
              fullWidth
              size="small"
            />
            <TextField
              label="Vị trí răng"
              disabled
              value={
                fullDonHang.danhSachSanPham[productIndex].viTri
                  ?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`)
                  .join("; ") || "---"
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Số lượng"
              disabled
              value={fullDonHang.danhSachSanPham[productIndex].soLuong || 1}
              fullWidth
              size="small"
            />
            <TextField
              label="Màu"
              disabled
              value={fullDonHang.danhSachSanPham[productIndex].mau || "---"}
              fullWidth
              size="small"
            />
          </div>
        )}

        {/* Hiển thị thông tin chi tiết của sản phẩm được chọn */}
        {productIndex === null && formData.selectedProducts.length > 0 && (
          <div className="space-y-3 bg-blue-50 p-3 rounded border border-blue-200">
            {formData.selectedProducts.map((spIndex) => {
              const sp = fullDonHang.danhSachSanPham[spIndex];
              return (
                <div key={spIndex} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                  <div className="text-sm font-medium text-blue-700">
                    {sp.sanPham?.tenSanPham || "---"}
                  </div>
                  
                  {/* Vị trí răng */}
                  <TextField
                    label="Vị trí răng"
                    disabled
                    value={sp.viTri?.map((v) => `${v.kieu}: ${v.soRang.join(", ")}`).join("; ") || "---"}
                    fullWidth
                    size="small"
                  />

                  {/* Số lượng */}
                  <TextField
                    label="Số lượng"
                    disabled
                    value={sp.soLuong || 1}
                    fullWidth
                    size="small"
                  />

                  {/* Màu */}
                  <TextField
                    label="Màu"
                    disabled
                    value={sp.mau || "---"}
                    fullWidth
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Bảo hành từ */}
        <TextField
          label="Bảo hành từ"
          disabled
          value={fullDonHang?.ngayNhan ? new Date(fullDonHang.ngayNhan).toLocaleDateString("vi-VN") : "---"}
          fullWidth
          size="small"
        />

        {/* Bảo hành đến - Dropdown chọn năm + Date picker */}
        <div className="grid grid-cols-3 gap-2">
          <TextField
            label="Chọn năm bảo hành"
            select
            value={useCustomDate ? "" : formData.namBaoHanh}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            fullWidth
            size="small"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((year) => (
              <MenuItem key={year} value={year}>
                {year} năm
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="Hoặc chọn ngày"
            value={formData.baoHanhDen}
            onChange={handleDateChange}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ style: { fontSize: "12px" } }}
          />
        </div>

        {/* Tên nha khoa */}
        <TextField
          label="Tên nha khoa trên thẻ"
          disabled
          value={fullDonHang?.nhaKhoa?.tenGiaoDich || fullDonHang?.nhaKhoa?.hoVaTen || "---"}
          fullWidth
          size="small"
        />

        {/* Bác sĩ */}
        <TextField
          label="Bác sĩ"
          disabled
          value={fullDonHang?.bacSi?.hoVaTen || "---"}
          fullWidth
          size="small"
        />

        {/* Tên bệnh nhân */}
        <TextField
          label="Tên bệnh nhân"
          disabled
          value={fullDonHang?.benhNhan?.hoVaTen || "---"}
          fullWidth
          size="small"
        />

        {/* Điện thoại - từ bệnh nhân */}
        <TextField
          label="Điện thoại"
          disabled
          value={fullDonHang?.benhNhan?.soDienThoai || "---"}
          fullWidth
          size="small"
        />

        {/* Mẫu thẻ */}
        <TextField
          label="Mẫu thẻ"
          name="mauTheTi"
          select
          value={formData.mauTheTi}
          onChange={handleChange}
          fullWidth
          size="small"
        >
          <MenuItem value="Mẫu in Dbio">Mẫu in Dbio</MenuItem>
          <MenuItem value="Mẫu in UNC">Mẫu in UNC</MenuItem>
          <MenuItem value="Mẫu thẻ Lab">Mẫu thẻ Lab</MenuItem>
        </TextField>

        {/* Ghi chú */}
        <TextField
          label="Ghi chú"
          name="ghiChu"
          value={formData.ghiChu}
          onChange={handleChange}
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
