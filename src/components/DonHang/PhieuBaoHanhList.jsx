import React, { useState } from "react";
import { api } from "../../config/api";
import PhieuBaoHanhPreview from "./PhieuBaoHanhPreview";
import toast from "react-hot-toast";

const PhieuBaoHanhList = ({ phieuBaoHanhList, onDelete, donHangId }) => {
  const [expandedId, setExpandedId] = useState(null);

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

  if (!phieuBaoHanhList || phieuBaoHanhList.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 italic">
        Chưa có thẻ bảo hành nào
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {phieuBaoHanhList.map((pbh) => (
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

              <div className="mt-3 pt-3 border-t flex justify-center">
                <PhieuBaoHanhPreview phieuBaoHanh={pbh} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhieuBaoHanhList;
