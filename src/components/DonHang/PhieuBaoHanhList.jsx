import React, { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { api } from "../../config/api";
import WarrantyCardPrint from "./WarrantyCardPrint";
import { toast } from "sonner";

const PhieuBaoHanhList = ({ phieuBaoHanhList, onDelete, donHangId }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [printWarranty, setPrintWarranty] = useState(null);
  const [mauTheList, setMauTheList] = useState([]);
  // map: phieuId -> selectedMauTheId
  const [selectedMauTheMap, setSelectedMauTheMap] = useState({});

  useEffect(() => {
    const fetchMauThe = async () => {
      try {
        const res = await api.get("/mau-the-bao-hanh");
        if (res.data?.success) {
          setMauTheList(res.data.data || []);
        }
      } catch (err) {
        // silent
      }
    };
    fetchMauThe();
  }, []);

  const getSelectedMauTheId = (pbh) => {
    if (selectedMauTheMap[pbh._id]) return selectedMauTheMap[pbh._id];
    // mặc định: mẫu gắn với phiếu, rồi mẫu đầu tiên
    const attachedId = typeof pbh.mauThe === 'object' ? pbh.mauThe?._id : pbh.mauThe;
    return attachedId || (mauTheList[0]?._id ?? "");
  };

  // Convert to array if it's an object
  let warrantyArray = Array.isArray(phieuBaoHanhList)
    ? phieuBaoHanhList
    : phieuBaoHanhList
      ? [phieuBaoHanhList]
      : [];

  // Filter only valid warranties (có danhSachBaoHanh array)
  warrantyArray = warrantyArray.filter(
    (pbh) => pbh && pbh.danhSachBaoHanh && Array.isArray(pbh.danhSachBaoHanh) && pbh.danhSachBaoHanh.length > 0
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phiếu bảo hành này?")) {
      return;
    }

    try {
      await api.delete(`/phieu-bao-hanh/${id}`);
      toast.success("Xóa phiếu bảo hành thành công");
      onDelete();
    } catch (err) {
      toast.error("Lỗi xóa phiếu bảo hành");
    }
  };

  if (!warrantyArray || warrantyArray.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        Chưa có thẻ bảo hành nào
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {warrantyArray.map((pbh) => (
        <div key={pbh._id} className="border rounded bg-white shadow-sm">
          <div
            className="p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
            onClick={() =>
              setExpandedId(expandedId === pbh._id ? null : pbh._id)
            }
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="text-sm font-medium">
                {pbh.maBaoHanh} - {pbh.sanPham?.tenSanPham}
              </div>
              <div className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded">
                QR: <span className="font-semibold text-yellow-700">{pbh.maQR}</span>
              </div>
              <div className="text-xs text-gray-500">
                Bảo hành: {new Date(pbh.baoHanhTu).toLocaleDateString("vi-VN")} đến{" "}
                {new Date(pbh.baoHanhDen).toLocaleDateString("vi-VN")}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(pbh._id);
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Xóa
            </button>
          </div>

          {expandedId === pbh._id && (
            <div className="border-t bg-gray-50 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Mẫu thẻ:</span>{" "}
                  <span className="font-medium">{pbh.mauTheTi}</span>
                </div>
                <div>
                  <span className="text-gray-600">Số lượng:</span>{" "}
                  <span className="font-medium">{pbh.soLuong}</span>
                </div>
                <div>
                  <span className="text-gray-600">Vị trí răng:</span>{" "}
                  <span className="font-medium">{pbh.viTriRang}</span>
                </div>
                <div>
                  <span className="text-gray-600">Màu:</span>{" "}
                  <span className="font-medium">{pbh.mau}</span>
                </div>
                {pbh.soDienThoai && (
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>{" "}
                    <span className="font-medium">{pbh.soDienThoai}</span>
                  </div>
                )}
                {pbh.ghiChu && (
                  <div className="col-span-2">
                    <span className="text-gray-600">Ghi chú:</span>{" "}
                    <span className="font-medium">{pbh.ghiChu}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t flex flex-col gap-3">
                {/* Chọn mẫu thẻ ngay tại đây */}
                <TextField
                  select
                  size="small"
                  fullWidth
                  label="Chọn mẫu thẻ bảo hành"
                  value={getSelectedMauTheId(pbh)}
                  onChange={(e) =>
                    setSelectedMauTheMap((prev) => ({ ...prev, [pbh._id]: e.target.value }))
                  }
                  disabled={mauTheList.length === 0}
                >
                  {mauTheList.map((m) => (
                    <MenuItem key={m._id} value={m._id}>{m.tenMau}</MenuItem>
                  ))}
                </TextField>
                <button
                  onClick={() => setPrintWarranty(pbh)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                >
                  🖨 In thẻ bảo hành
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {printWarranty && (
        <WarrantyCardPrint
          open={!!printWarranty}
          onClose={() => setPrintWarranty(null)}
          warranty={printWarranty}
          initialMauTheId={getSelectedMauTheId(printWarranty)}
        />
      )}
    </div>
  );
};

export default PhieuBaoHanhList;
