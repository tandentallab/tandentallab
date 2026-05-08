import React, { useState } from "react";
import PhieuThuEditModal from "./PhieuThuEditModal";

const formatNumber = (v) =>
    new Intl.NumberFormat("vi-VN").format(v || 0);

const formatCurrency = (v) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const formatDateShort = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatSoPhieu = (id) =>
    id ? "TAN" + id.toString().slice(-8).toUpperCase() : "—";

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const InfoRow = ({ label, value, valueClass = "" }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-sm text-gray-800 font-medium text-right ${valueClass}`}>{value ?? "—"}</span>
    </div>
);

export default function PhieuThuDetailPanel({ phieuThu, onClose, onUpdated }) {
    const isOpen = !!phieuThu;
    const [openEdit, setOpenEdit] = useState(false);

    const nk = phieuThu?.nhaKhoaInfo || {};
    const ngt = phieuThu?.nguoiTaoInfo || {};
    const hd = phieuThu?.hoaDonInfo || {};

    const tenKhach = nk.hoVaTen || nk.tenGiaoDich || "";
    const address = [nk.diaChiCuThe, nk.quanHuyen, nk.tinh].filter(Boolean).join(", ");

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 pt-16 h-full w-[480px] bg-gray-100 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* ── HEADER ── */}
                <div className="bg-[#29b6f6] text-white px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-base tracking-wide truncate">{formatSoPhieu(phieuThu?._id)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => setOpenEdit(true)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-full hover:bg-white/20 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                            </svg>
                        </button>
                        <button onClick={onClose} title="Đóng" className="p-1.5 rounded-full hover:bg-white/20 transition text-xl font-bold leading-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                            </svg>
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
                                    <span className="text-white font-bold text-base">{getInitials(tenKhach)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-base leading-tight">{tenKhach || "—"}</p>
                                    {address && (
                                        <p className="text-xs text-[#29b6f6] mt-0.5 truncate">
                                            Địa chỉ: {address}
                                        </p>
                                    )}
                                    <p className="text-xs text-[#29b6f6] mt-0.5">
                                        Điện thoại: <span className="text-gray-400">{nk.soDienThoai || "Chưa có"}</span>
                                    </p>
                                    {nk.email !== undefined && (
                                        <p className="text-xs text-[#29b6f6] mt-0.5">
                                            Email: <span className="text-gray-400">{nk.email || "Chưa có"}</span>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền thu</span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{formatNumber(phieuThu.soTienThu)}</span>
                                </div>
                                {/* Info rows */}
                                <InfoRow label="Phương thức thanh toán" value={phieuThu.phuongThucThanhToan} />
                                <InfoRow label="Ngày thu" value={formatDate(phieuThu.ngayThu)} />
                                <InfoRow label="Ngày tạo" value={formatDate(phieuThu.ngayTao || phieuThu.createdAt)} />
                                <InfoRow label="Người tạo" value={ngt.hoVaTen} />
                                {phieuThu.noiDung && (
                                    <InfoRow label="Nội dung" value={phieuThu.noiDung} />
                                )}
                                {phieuThu.conThua > 0 && (
                                    <InfoRow label="Trả thừa" value={formatCurrency(phieuThu.conThua)} valueClass="text-orange-500" />
                                )}
                            </div>

                            {/* ── Card 3: Hóa đơn ── */}
                            {hd._id && (
                                <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
                                    <p className="font-semibold text-gray-800 text-sm mb-3">Hóa đơn</p>
                                    {/* Invoice header row */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-bold text-[#29b6f6]">{formatSoPhieu(hd._id)}</span>
                                        <span className="text-sm text-gray-500">Ngày xuất: {formatDateShort(hd.ngayXuatHoaDon)}</span>
                                    </div>
                                    {/* Invoice detail rows */}
                                    <div className="space-y-0">
                                        <InfoRow label="Giá trị hóa đơn:" value={formatNumber(hd.thanhTien)} />
                                        <InfoRow label="Đã thanh toán:" value={formatNumber(hd.daThanhToan)} />
                                        <InfoRow
                                            label="Số tiền còn lại:"
                                            value={formatNumber(hd.conLai)}
                                            valueClass={(hd.conLai || 0) > 0 ? "text-orange-500" : "text-green-600"}
                                        />
                                        <InfoRow
                                            label="Số tiền thanh toán:"
                                            value={formatNumber(phieuThu.soTienThu)}
                                            valueClass="text-gray-900 font-bold"
                                        />
                                    </div>
                                    {hd.trangThai && (
                                        <div className="mt-3 flex justify-end">
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${hd.trangThai === "Đã thanh toán" ? "bg-green-100 text-green-700"
                                                : hd.trangThai === "Thanh toán một phần" ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}>
                                                {hd.trangThai}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── FOOTER ── */}
                <div className="shrink-0 px-4 py-3 bg-white border-t flex justify-end">
                    <button
                        onClick={alert.bind(null, "Tính năng in phiếu thu đang được phát triển")}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
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
                    }}
                />
            )}
        </>
    );
}