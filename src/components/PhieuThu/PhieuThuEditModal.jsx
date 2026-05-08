import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePhieuThu } from "../../redux/slices/phieuThuSlice";

const toLocalDatetimeInput = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);
const formatDateDisplay = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
const formatSoHoaDon = (id) => (id ? "TAN" + id.toString().slice(-8).toUpperCase() : "â€”");

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PhieuThuEditModal({ phieuThu, open, onClose, onSuccess }) {
    const dispatch = useDispatch();
    const { loading } = useSelector((s) => s.phieuThu);

    const [ngayThu, setNgayThu] = useState("");
    const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
    const [noiDung, setNoiDung] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (phieuThu && open) {
            setNgayThu(toLocalDatetimeInput(phieuThu.ngayThu));
            setPhuongThuc(phieuThu.phuongThucThanhToan || "Tiền mặt");
            setNoiDung(phieuThu.noiDung || "");
            setError("");
        }
    }, [phieuThu, open]);

    const handleSave = async () => {
        setError("");
        try {
            const result = await dispatch(updatePhieuThu({
                id: phieuThu._id,
                data: {
                    ngayThu: ngayThu ? new Date(ngayThu).toISOString() : undefined,
                    phuongThucThanhToan: phuongThuc,
                    noiDung,
                },
            })).unwrap();
            if (onSuccess) onSuccess(result.data);
        } catch (err) {
            setError(typeof err === "string" ? err : "Cập nhật thất bại");
        }
    };

    if (!open || !phieuThu) return null;

    const nk = phieuThu.nhaKhoaInfo || {};
    const ngt = phieuThu.nguoiTaoInfo || {};
    const hd = phieuThu.hoaDonInfo || {};
    const tenKhach = nk.hoVaTen || nk.tenGiaoDich || "";
    const address = [nk.diaChiCuThe, nk.quanHuyen, nk.tinh].filter(Boolean).join(", ");

    return (
        <div className="fixed inset-0 z-[1400] flex items-start justify-center pt-4 pb-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style={{ maxHeight: "calc(100vh - 32px)" }}>

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-[#29b6f6] rounded-t-2xl shrink-0">
                    <h2 className="text-white font-semibold text-base tracking-wide">Phiếu thu {phieuThu.soPhieuThu}</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>
                    )}

                    {/* TOP: 2 col */}
                    <div className="grid grid-cols-2 gap-8">
                        {/* LEFT: customer info (read-only) */}
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Công ty</p>
                            <div className="flex items-center gap-2 border-b-2 border-gray-200 pb-1">
                                {tenKhach && (
                                    <div className="w-8 h-8 rounded-full bg-[#29b6f6] flex items-center justify-center shrink-0">
                                        <span className="text-white font-bold text-xs">{getInitials(tenKhach)}</span>
                                    </div>
                                )}
                                <span className="text-sm font-semibold text-gray-800">{tenKhach || "—"}</span>
                            </div>
                            {tenKhach && (
                                <div className="mt-3 bg-[#e3f2fd] rounded-xl px-4 py-3 space-y-1 text-sm">
                                    <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Địa chỉ:</span><span className="text-gray-700">{address || "—"}</span></div>
                                    <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Điện thoại:</span><span className="text-gray-500">{nk.soDienThoai || ""}</span></div>
                                    <div className="flex gap-2"><span className="text-gray-500 w-20 shrink-0">Mô tả:</span><span className="text-gray-700">{nk.moTa || ""}</span></div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: editable fields */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Số tiền thu</p>
                                <p className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-1">{fmt(phieuThu.soTienThu)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Ngày thu</p>
                                <input type="datetime-local" value={ngayThu} onChange={(e) => setNgayThu(e.target.value)}
                                    className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Phương thức thanh toán</p>
                                <select value={phuongThuc} onChange={(e) => setPhuongThuc(e.target.value)}
                                    className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none appearance-none cursor-pointer">
                                    <option value="Tiền mặt">Tiền mặt</option>
                                    <option value="Chuyển khoản">Chuyển khoản</option>
                                </select>
                            </div>
                            {ngt.hoVaTen && (
                                <p className="text-xs text-gray-400 text-right">
                                    <span className="font-medium text-gray-600">{ngt.hoVaTen}</span> tạo lúc {formatDateDisplay(phieuThu.ngayTao || phieuThu.createdAt)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* INVOICE TABLE (read-only) */}
                    {hd._id && (
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                            <table className="w-full text-sm">
                                <thead className="border-b border-gray-100">
                                    <tr className="text-gray-500">
                                        <th className="px-4 py-3 text-left font-medium">STT</th>
                                        <th className="px-4 py-3 text-left font-medium">Hóa đơn</th>
                                        <th className="px-4 py-3 text-left font-medium">Ngày xuất</th>
                                        <th className="px-4 py-3 text-right font-medium">Giá trị</th>
                                        <th className="px-4 py-3 text-right font-medium">Đã thanh toán</th>
                                        <th className="px-4 py-3 text-right font-medium">Còn lại</th>
                                        <th className="px-4 py-3 text-right font-medium">Thanh toán</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-50">
                                        <td className="px-4 py-3 text-gray-500">1</td>
                                        <td className="px-4 py-3 font-medium text-[#29b6f6]">{formatSoHoaDon(hd._id)}</td>
                                        <td className="px-4 py-3 text-gray-600">{hd.ngayXuatHoaDon ? new Date(hd.ngayXuatHoaDon).toLocaleDateString("vi-VN") : "â€”"}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(hd.thanhTien)}</td>
                                        <td className="px-4 py-3 text-right text-gray-500">{fmt(hd.daThanhToan)}</td>
                                        <td className="px-4 py-3 text-right text-gray-700">{fmt(hd.conLai)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(phieuThu.soTienThu)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* BOTTOM */}
                    <div className="grid grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Nội dung thu</p>
                                <input type="text" value={noiDung} onChange={(e) => setNoiDung(e.target.value)}
                                    className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none" />
                            </div>
                        </div>
                        <div />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-3 border-t bg-white rounded-b-2xl flex items-center justify-between shrink-0">
                    <div />
                    <div className="flex items-center gap-3">
                        <button onClick={alert.bind(null, "Tính năng in phiếu thu đang được phát triển")}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            In phiếu thu (F2)
                        </button>
                        <button onClick={handleSave} disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 bg-[#29b6f6] hover:bg-[#0091ea] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm">
                            {loading && (
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Lưu (F3)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
