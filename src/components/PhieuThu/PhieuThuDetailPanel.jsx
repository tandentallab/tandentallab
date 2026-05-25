import React, { useState } from "react";
import PhieuThuEditModal from "./PhieuThuEditModal";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const formatNumber = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);

const formatCurrency = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v || 0
  );

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatSoPhieu = (id) =>
  id ? "TAN" + id.toString().slice(-8).toUpperCase() : "—";

// Helper to display soPhieuThu, falling back to _id-based format for old records
const displaySoPhieu = (phieuThu) =>
  phieuThu?.soPhieuThu || formatSoPhieu(phieuThu?._id);

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const InfoRow = ({ label, value, valueClass = "" }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span
      className={`text-sm text-gray-800 font-medium text-right ${valueClass}`}
    >
      {value ?? "—"}
    </span>
  </div>
);

export default function PhieuThuDetailPanel({ phieuThu, onClose, onUpdated }) {
  const navigate = useNavigate();
  const isOpen = !!phieuThu;
  const [openEdit, setOpenEdit] = useState(false);

  const nk = phieuThu?.nhaKhoaInfo || {};
  const ngt = phieuThu?.nguoiTaoInfo || {};

  const danhSachHoaDon = phieuThu?.danhSachHoaDon || [];

  const tenKhach = nk.hoVaTen || nk.tenGiaoDich || "";
  const address = [nk.diaChiCuThe, nk.quanHuyen, nk.tinh]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 pt-16 h-full w-full sm:w-[480px] bg-gray-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* ── HEADER ── */}
        <div className="bg-[#29b6f6] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-base tracking-wide truncate">
              {displaySoPhieu(phieuThu)}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setOpenEdit(true)}
              title="Chỉnh sửa"
              className="p-1.5 rounded-full hover:bg-white/20 transition"
            >
              <EditOutlinedIcon sx={{ fontSize: 20 }} />
            </button>
            <button
              onClick={onClose}
              title="Đóng"
              className="p-1.5 rounded-full hover:bg-white/20 transition"
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {phieuThu && (
            <>
              {/* ── Card 1: Khách hàng ── */}
              <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#29b6f6] flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-base">
                    {getInitials(tenKhach)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-base leading-tight">
                    {tenKhach || "—"}
                  </p>
                  {address && (
                    <p className="text-xs text-[#29b6f6] mt-0.5 truncate">
                      Địa chỉ: {address}
                    </p>
                  )}
                  <p className="text-xs text-[#29b6f6] mt-0.5">
                    Điện thoại:{" "}
                    <span className="text-gray-400">
                      {nk.soDienThoai || "Chưa có"}
                    </span>
                  </p>
                  {nk.email !== undefined && (
                    <p className="text-xs text-[#29b6f6] mt-0.5">
                      Email:{" "}
                      <span className="text-gray-400">
                        {nk.email || "Chưa có"}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* ── Card 2: Số tiền thu + thông tin ── */}
              <div className="bg-white rounded-2xl shadow-sm px-4 pt-4 pb-2">
                {/* Amount header row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <AttachMoneyIcon
                        sx={{ fontSize: 18, color: "#16a34a" }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Số tiền thu
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatNumber(phieuThu.soTienThu)}
                  </span>
                </div>
                {/* Info rows */}
                <InfoRow
                  label="Phương thức thanh toán"
                  value={phieuThu.phuongThucThanhToan}
                />
                <InfoRow
                  label="Ngày thu"
                  value={formatDate(phieuThu.ngayThu)}
                />
                <InfoRow
                  label="Ngày tạo"
                  value={formatDate(phieuThu.ngayTao || phieuThu.createdAt)}
                />
                <InfoRow
                  label="Người tạo"
                  value={phieuThu.nguoiTaoInfo?.HoTenNV || "-"}
                />
                {phieuThu.noiDung && (
                  <InfoRow label="Nội dung" value={phieuThu.noiDung} />
                )}
                {phieuThu.conThua > 0 && (
                  <InfoRow
                    label="Trả thừa"
                    value={formatCurrency(phieuThu.conThua)}
                    valueClass="text-orange-500"
                  />
                )}
              </div>

              {/* ── Card 3: Hóa đơn ── */}
              {danhSachHoaDon.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
                  <p className="font-semibold text-gray-800 text-sm mb-3">
                    Hóa đơn {danhSachHoaDon.length > 1 ? `(${danhSachHoaDon.length})` : ""}
                  </p>
                  <div className="space-y-3">
                    {danhSachHoaDon.map((item, idx) => {
                      const hd = item.hoaDon || {};
                      const soTienThanhToan = item.soTienThanhToan ?? (idx === 0 ? phieuThu?.soTienThu : 0);
                      const daTTruocLanNay = item.daTTruocLanNay || 0;
                      const giaTriHoaDon = item.giaTriHoaDon || hd.giaTriThanhToan || 0;
                      const tongCong = daTTruocLanNay + (soTienThanhToan || 0);
                      const conLai = giaTriHoaDon - tongCong;
                      return (
                        <div key={hd._id || idx} className={`${idx > 0 ? "border-t pt-3" : ""}`}>
                          <div className="flex justify-between items-center mb-2">
                            <Button
                              variant="text"
                              size="small"
                              sx={{ minWidth: 0, p: 0, fontSize: "0.875rem" }}
                              onClick={() => { navigate(`/hoa-don/${hd._id}/edit`); }}
                            >
                              {hd.soHoaDon || formatSoPhieu(hd._id)}
                            </Button>
                            <span className="text-xs text-gray-500">
                              {formatDateShort(hd.ngayXuatHoaDon)}
                            </span>
                          </div>
                          <div className="space-y-0">
                            <InfoRow label="Giá trị hóa đơn:" value={formatNumber(giaTriHoaDon)} />
                            <InfoRow
                              label="Đã thanh toán:"
                              value={formatNumber(daTTruocLanNay)}
                            />
                            <InfoRow
                              label="Thanh toán lần này:"
                              value={formatNumber(soTienThanhToan)}
                              valueClass="text-blue-600 font-bold"
                            />
                            <InfoRow
                              label="Tổng cộng:"
                              value={formatNumber(tongCong)}
                              valueClass="font-bold"
                            />
                            <InfoRow
                              label="Còn lại:"
                              value={formatNumber(conLai)}
                              valueClass={conLai > 0 ? "text-orange-500" : "text-green-600"}
                            />
                          </div>
                          {hd.trangThai && (
                            <div className="mt-2 flex justify-end">
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${hd.trangThai === "Đã thanh toán" ? "bg-green-100 text-green-700"
                                : hd.trangThai === "Thanh toán một phần" ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                                }`}>
                                {hd.trangThai}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="shrink-0 px-4 py-3 bg-white border-t flex justify-end">
          <button
            onClick={() => {
              if (phieuThu?._id) {
                navigate(`/phieu-thu/${phieuThu._id}/print`);
              }
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <PrintIcon sx={{ fontSize: 16 }} />
            In phiếu thu
          </button>
        </div>
      </div>

      {openEdit && phieuThu && (
        <PhieuThuEditModal
          phieuThu={phieuThu}
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onSuccess={(updated) => {
            setOpenEdit(false);
            if (onUpdated) onUpdated(updated);
            if (onClose) onClose();
          }}
        />
      )}
    </>
  );
}
