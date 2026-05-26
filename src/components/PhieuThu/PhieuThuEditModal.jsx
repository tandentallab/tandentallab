import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePhieuThu } from "../../redux/slices/phieuThuSlice";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PrintIcon from "@mui/icons-material/Print";
import { useNavigate } from "react-router-dom";

const toLocalDatetimeInput = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);
const docSoTien = (amount) => {
    if (!amount || amount <= 0) return "";
    const n = Math.round(amount);
    const ch = ["kh\u00f4ng", "m\u1ed9t", "hai", "ba", "b\u1ed1n", "n\u0103m", "s\u00e1u", "b\u1ea3y", "t\u00e1m", "ch\u00edn"];
    const readGroup = (num) => {
        if (num === 0) return "";
        const h = Math.floor(num / 100);
        const t = Math.floor((num % 100) / 10);
        const u = num % 10;
        const p = [];
        if (h > 0) p.push(ch[h] + " tr\u0103m");
        if (t > 1) {
            p.push(ch[t] + " m\u01b0\u01a1i");
            if (u === 1) p.push("m\u1ed1t");
            else if (u === 4) p.push("t\u01b0");
            else if (u === 5) p.push("l\u0103m");
            else if (u > 0) p.push(ch[u]);
        } else if (t === 1) {
            p.push("m\u01b0\u1eddi");
            if (u === 5) p.push("l\u0103m");
            else if (u > 0) p.push(ch[u]);
        } else if (u > 0) {
            if (h > 0) p.push("l\u1ebd");
            p.push(ch[u]);
        }
        return p.join(" ");
    };
    const ty = Math.floor(n / 1_000_000_000);
    const tr = Math.floor((n % 1_000_000_000) / 1_000_000);
    const ng = Math.floor((n % 1_000_000) / 1_000);
    const dv = n % 1_000;
    const parts = [];
    if (ty > 0) parts.push(readGroup(ty) + " t\u1ef7");
    if (tr > 0) parts.push(readGroup(tr) + " tri\u1ec7u");
    if (ng > 0) parts.push(readGroup(ng) + " ngh\u00ecn");
    if (dv > 0) parts.push(readGroup(dv));
    if (!parts.length) return "";
    const text = parts.join(" ");
    return text.charAt(0).toUpperCase() + text.slice(1) + " \u0111\u1ed3ng";
};
const formatDateDisplay = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
};
const formatSoHoaDon = (id) => (id ? "TAN" + id.toString().slice(-8).toUpperCase() : "—");

const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PhieuThuEditModal({ phieuThu, open, onClose, onSuccess }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((s) => s.phieuThu);

    const [ngayThu, setNgayThu] = useState("");
    const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
    const [noiDung, setNoiDung] = useState("");
    const [soTienThu, setSoTienThu] = useState("");
    const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (phieuThu && open) {
            setNgayThu(toLocalDatetimeInput(phieuThu.ngayThu));
            setPhuongThuc(phieuThu.phuongThucThanhToan || "Tiền mặt");
            setNoiDung(phieuThu.noiDung || "");
            setSoTienThu(String(phieuThu.soTienThu || 0));
            setError("");
        }
    }, [phieuThu, open]);

    const handleSave = async () => {
        setError("");
        if (amountOverLimit) {
            setError(`Số tiền thu (${fmt(Number(soTienThu))} ₫) vượt quá tổng giá trị hóa đơn (${fmt(maxSoTien)} ₫).`);
            return;
        }
        try {
            const result = await dispatch(updatePhieuThu({
                id: phieuThu._id,
                data: {
                    ngayThu: ngayThu ? new Date(ngayThu).toISOString() : undefined,
                    phuongThucThanhToan: phuongThuc,
                    noiDung,
                    soTienThu: soTienThu !== "" ? Number(soTienThu) : undefined,
                },
            })).unwrap();
            if (onSuccess) onSuccess(result.data);
        } catch (err) {
            setError(typeof err === "string" ? err : "Cập nhật thất bại");
        }
    };

    const handleSaveRef = useRef(null);
    handleSaveRef.current = handleSave;

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "F3") {
                e.preventDefault();
                handleSaveRef.current();
            }
            if (e.key === "F2") {
                e.preventDefault();
                if (phieuThu?._id) navigate(`/phieu-thu/${phieuThu._id}/print`);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, phieuThu, navigate]);

    const amountSuggestions = useMemo(() => {
        const digits = soTienThu.replace(/[^\d]/g, "");
        if (!digits) return [];
        const n = Number(digits);
        if (!n) return [];
        return [n * 100_000, n * 1_000_000];
    }, [soTienThu]);

    const maxSoTien = useMemo(
        () => (phieuThu?.danhSachHoaDon || []).reduce((s, item) => s + (item.hoaDon?.giaTriThanhToan || 0), 0)
        [phieuThu]
    );

    const amountOverLimit = maxSoTien > 0 && Number(soTienThu) > maxSoTien;

    if (!open || !phieuThu) return null;

    const nk = phieuThu.nhaKhoaInfo || {};
    const ngt = phieuThu.nguoiTaoInfo || {};
    const tenKhach = nk.hoVaTen || nk.tenGiaoDich || "";
    const address = [nk.diaChiCuThe, nk.quanHuyen, nk.tinh].filter(Boolean).join(", ");

    const danhSachHoaDon = phieuThu.danhSachHoaDon || [];

    return (
        <div className="fixed inset-0 z-[1400] flex items-start justify-center pt-4 pb-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style={{ maxHeight: "calc(100vh - 32px)" }}>

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-3.5 bg-[#29b6f6] rounded-t-2xl shrink-0">
                    <h2 className="text-white font-semibold text-base tracking-wide">Phiếu thu {phieuThu.soPhieuThu}</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1 transition">
                        <CloseIcon sx={{ fontSize: 20 }} />
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
                            <div className="relative">
                                <p className="text-xs text-gray-400 mb-0.5">Số tiền thu</p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={fmt(soTienThu)}
                                    onChange={(e) => setSoTienThu(e.target.value.replace(/[^\d]/g, ""))}
                                    onFocus={() => setShowAmountSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowAmountSuggestions(false), 150)}
                                    className={`w-full text-2xl font-bold text-gray-900 border-b-2 ${amountOverLimit ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#29b6f6]"} bg-transparent pb-1 outline-none`}
                                />
                                {amountOverLimit && (
                                    <p className="text-xs text-red-500 mt-0.5">
                                        Vượt quá tổng giá trị hóa đơn {fmt(maxSoTien)} ₫
                                    </p>
                                )}
                                {!amountOverLimit && Number(soTienThu) > 0 && (
                                    <div className="mt-0.5 space-y-0.5">
                                        <p className="text-xs text-[#29b6f6]">{fmt(Number(soTienThu))} ₫</p>
                                        <p className="text-xs text-gray-400 italic">{docSoTien(Number(soTienThu))}</p>
                                    </div>
                                )}
                                {showAmountSuggestions && amountSuggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                        {amountSuggestions.map((val) => (
                                            <div
                                                key={val}
                                                onMouseDown={() => {
                                                    setSoTienThu(String(val));
                                                    setShowAmountSuggestions(false);
                                                }}
                                                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between"
                                            >
                                                <span className="text-sm font-semibold text-gray-800">{fmt(val)}</span>
                                                <span className="text-xs text-gray-400">₫</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                    {danhSachHoaDon.length > 0 && (
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
                                    {danhSachHoaDon.map((item, idx) => {
                                        const hd = item.hoaDon || {};
                                        const giaTriHoaDon = hd.giaTriThanhToan || 0;
                                        const daTTruocLanNay = item.daTTruocLanNay || 0;
                                        const thanhToanLanNay = item.soTienThanhToan || 0;

                                        const conLai =
                                            giaTriHoaDon - daTTruocLanNay;
                                        return (
                                            <tr key={hd._id || idx} className="border-b border-gray-50 last:border-0">
                                                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                                <td
                                                    className="px-4 py-3 font-medium text-[#29b6f6] cursor-pointer hover:underline"
                                                    onClick={() => navigate(`/hoa-don/${hd._id}/edit`)}
                                                >
                                                    {hd.soHoaDon || formatSoHoaDon(hd._id)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{hd.ngayXuatHoaDon ? new Date(hd.ngayXuatHoaDon).toLocaleDateString("vi-VN") : "—"}</td>
                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {fmt(giaTriHoaDon)}
                                                </td>

                                                <td className="px-4 py-3 text-right text-gray-500">
                                                    {fmt(daTTruocLanNay)}
                                                </td>

                                                <td className="px-4 py-3 text-right text-gray-700">
                                                    {fmt(conLai)}
                                                </td>

                                                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                    {fmt(thanhToanLanNay)}
                                                </td>
                                            </tr>
                                        );
                                    })}
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
                        <button
                            onClick={() => {
                                if (phieuThu?._id) {
                                    navigate(`/phieu-thu/${phieuThu._id}/print`);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                            <PrintIcon sx={{ fontSize: 16 }} />
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
                            <SaveOutlinedIcon sx={{ fontSize: 17 }} />
                            Lưu (F3)
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}