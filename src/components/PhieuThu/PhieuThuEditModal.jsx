import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// 🔥 THÊM IMPORTS TỪ SLICE CỦA BẠN
import { updatePhieuThu, fetchHoaDonChuaThanhToan } from "../../redux/slices/phieuThuSlice";
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

    const [chiTietHoaDon, setChiTietHoaDon] = useState([]);
    const [error, setError] = useState("");
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!phieuThu || !open) return;
            setIsLoadingData(true);
            try {
                setNgayThu(toLocalDatetimeInput(phieuThu.ngayThu));
                setPhuongThuc(phieuThu.phuongThucThanhToan || "Tiền mặt");
                setNoiDung(phieuThu.noiDung || "");
                setSoTienThu(String(phieuThu.soTienThu || 0));
                setError("");

                const nkId = phieuThu.nhaKhoaInfo?._id || (phieuThu.danhSachHoaDon?.[0]?.hoaDon?.nhaKhoa);
                let unpaidList = [];

                if (nkId) {
                    // 🔥 GỌI REDUX THUNK CỦA BẠN (Chuẩn xịn kiến trúc Redux)
                    try {
                        const res = await dispatch(fetchHoaDonChuaThanhToan(nkId)).unwrap();
                        // Tùy theo API bạn trả về là res.data hay mảng trực tiếp
                        unpaidList = res.data || res || [];
                    } catch (err) {
                        console.warn("Lấy hóa đơn nợ thất bại:", err);
                    }
                }

                const existingIds = new Set();

                // 1. Lấy các hóa đơn ĐANG NẰM TRONG Phiếu thu này
                const ds = (phieuThu.danhSachHoaDon || []).map(item => {
                    const hd = item.hoaDon || {};
                    existingIds.add(hd._id);
                    const giaTriHoaDon = hd.giaTriThanhToan || 0;
                    const daTTruocLanNay = item.daTTruocLanNay || 0;
                    const conLaiToiDa = giaTriHoaDon - daTTruocLanNay;

                    return {
                        ...item,
                        conLaiToiDa,
                        selected: (item.soTienThanhToan || 0) > 0,
                        soTienThanhToanInput: String(item.soTienThanhToan || 0)
                    };
                });

                // 2. TRỘN THÊM các hóa đơn chưa thanh toán (từ Thunk trả về)
                unpaidList.forEach(hd => {
                    if (!existingIds.has(hd._id)) {
                        ds.push({
                            hoaDon: hd,
                            soTienThanhToan: 0,
                            giaTriHoaDon: hd.giaTriThanhToan || 0,
                            daTTruocLanNay: hd.daThanhToan || 0,
                            conLaiTruocLanNay: hd.conLai || 0,
                            conLaiToiDa: hd.conLai || 0,
                            selected: false,
                            soTienThanhToanInput: "0"
                        });
                    }
                });

                // 3. SẮP XẾP: Mới nhất nổi lên trên cùng
                ds.sort((a, b) => new Date(b.hoaDon.ngayXuatHoaDon || 0) - new Date(a.hoaDon.ngayXuatHoaDon || 0));

                setChiTietHoaDon(ds);
            } catch (err) {
                console.error("Lỗi khi load dữ liệu chỉnh sửa:", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadData();
    }, [phieuThu, open, dispatch]);

    // ================= LOGIC THÁC NƯỚC (Khi gõ Tổng Tiền) =================
    const handleTotalAmountChange = (val) => {
        const digits = val.replace(/[^\d]/g, "");
        setSoTienThu(digits);
        let remaining = Number(digits) || 0;

        const newList = [...chiTietHoaDon];

        // Thác nước: Rót cho hóa đơn CŨ NHẤT TRƯỚC (Ascending)
        const sortedIndices = newList
            .map((item, idx) => ({ idx, date: new Date(item.hoaDon?.ngayXuatHoaDon || 0).getTime() }))
            .sort((a, b) => a.date - b.date);

        newList.forEach(item => {
            if (item.selected) item.soTienThanhToanInput = "0";
        });

        for (const { idx } of sortedIndices) {
            const item = newList[idx];
            if (!item.selected) continue;

            if (remaining > 0) {
                const payAmount = Math.min(remaining, item.conLaiToiDa);
                newList[idx].soTienThanhToanInput = String(payAmount);
                remaining -= payAmount;
            }
        }
        setChiTietHoaDon(newList);
    };

    // ================= LOGIC CHECKBOX =================
    const handleToggleRow = (idx) => {
        const newList = [...chiTietHoaDon];
        const item = newList[idx];
        item.selected = !item.selected;

        if (!item.selected) {
            item.soTienThanhToanInput = "0";
        } else {
            item.soTienThanhToanInput = String(item.conLaiToiDa);
        }
        setChiTietHoaDon(newList);

        const newTotal = newList.reduce((sum, row) => sum + (Number(row.soTienThanhToanInput) || 0), 0);
        setSoTienThu(String(newTotal));
    };

    // ================= LOGIC GÕ TỪNG DÒNG =================
    const handleRowAmountChange = (idx, value) => {
        const digits = value.replace(/[^\d]/g, "");
        const newList = [...chiTietHoaDon];
        newList[idx].soTienThanhToanInput = digits;

        newList[idx].selected = Number(digits) > 0;

        setChiTietHoaDon(newList);
        const newTotal = newList.reduce((sum, row) => sum + (Number(row.soTienThanhToanInput) || 0), 0);
        setSoTienThu(String(newTotal));
    };

    const tongPhanBo = useMemo(() => {
        return chiTietHoaDon.reduce((sum, item) => sum + (Number(item.soTienThanhToanInput) || 0), 0);
    }, [chiTietHoaDon]);

    const lechTien = (Number(soTienThu) || 0) - tongPhanBo;

    const isOverLimit = useMemo(() => {
        return chiTietHoaDon.some(item => (Number(item.soTienThanhToanInput) || 0) > item.conLaiToiDa);
    }, [chiTietHoaDon]);

    const handleSave = async () => {
        setError("");

        if (tongPhanBo === 0) {
            setError("Phiếu thu phải phân bổ ít nhất 1 hóa đơn. Nếu muốn hủy, vui lòng xóa phiếu thu này.");
            return;
        }

        if (isOverLimit) {
            setError("Có hóa đơn bị nhập thanh toán vượt quá số nợ. Vui lòng kiểm tra các ô màu đỏ.");
            return;
        }

        if (lechTien !== 0) {
            setError(`Số tiền thu (${fmt(Number(soTienThu))}) đang lệch so với tổng tiền phân bổ bên dưới (${fmt(tongPhanBo)}).`);
            return;
        }

        try {
            const result = await dispatch(updatePhieuThu({
                id: phieuThu._id,
                data: {
                    ngayThu: ngayThu ? new Date(ngayThu).toISOString() : undefined,
                    phuongThucThanhToan: phuongThuc,
                    noiDung,
                    danhSachHoaDon: chiTietHoaDon
                        .filter(item => item.selected && Number(item.soTienThanhToanInput) > 0)
                        .map(item => ({
                            hoaDon: item.hoaDon._id || item.hoaDon,
                            soTienThanhToan: Number(item.soTienThanhToanInput)
                        }))
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
        return [n * 10_000, n * 100_000, n * 1_000_000];
    }, [soTienThu]);

    if (!open || !phieuThu) return null;

    const nk = phieuThu.nhaKhoaInfo || {};
    const ngt = phieuThu.nguoiTaoInfo || {};
    const tenKhach = nk.hoVaTen || nk.tenGiaoDich || "";
    const address = [nk.diaChiCuThe, nk.quanHuyen, nk.tinh].filter(Boolean).join(", ");

    return (
        <div>
            <div className="fixed inset-0 z-[1400] flex items-start justify-center pt-4 pb-4 overflow-y-auto">
                <div className="fixed inset-0 bg-black/40" onClick={onClose} />
                <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style={{ maxHeight: "calc(100vh - 32px)" }}>

                    {/* HEADER */}
                    <div className="flex items-center justify-between px-6 py-3.5 bg-[#29b6f6] rounded-t-2xl shrink-0">
                        <h2 className="text-white font-semibold text-base tracking-wide">Chỉnh sửa Phiếu thu {phieuThu.soPhieuThu}</h2>
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
                            {/* LEFT: customer info */}
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
                                    <p className="text-xs text-gray-400 mb-0.5">Tổng số tiền thu (Tự động chia vào hóa đơn cũ nhất)</p>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={fmt(soTienThu)}
                                        onChange={(e) => handleTotalAmountChange(e.target.value)}
                                        onFocus={() => setShowAmountSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowAmountSuggestions(false), 150)}
                                        className={`w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent pb-1 outline-none`}
                                    />
                                    {Number(soTienThu) > 0 && (
                                        <div className="mt-0.5 space-y-0.5 flex justify-between items-center">
                                            <p className="text-xs text-gray-500 italic">{docSoTien(Number(soTienThu))}</p>
                                            {lechTien !== 0 && (
                                                <p className={`text-xs font-semibold ${lechTien > 0 ? "text-orange-500" : "text-red-500"}`}>
                                                    {lechTien > 0 ? `Còn dư: ${fmt(lechTien)}` : `Bị lệch: ${fmt(lechTien)}`}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {showAmountSuggestions && amountSuggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-[60px] z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                            {amountSuggestions.map((val) => (
                                                <div
                                                    key={val}
                                                    onMouseDown={() => handleTotalAmountChange(String(val))}
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

                        {/* INVOICE TABLE (Editable Amount & Checkboxes) */}
                        {isLoadingData ? (
                            <div className="flex justify-center items-center py-6">
                                <span className="text-gray-400 text-sm">Đang tải dữ liệu hóa đơn...</span>
                            </div>
                        ) : chiTietHoaDon.length > 0 && (
                            <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-gray-100">
                                        <tr className="text-gray-500 bg-gray-50/50">
                                            <th className="w-10 px-4 py-3 text-center"></th>
                                            <th className="px-4 py-3 text-left font-medium">Hóa đơn</th>
                                            <th className="px-4 py-3 text-left font-medium">Ngày xuất</th>
                                            <th className="px-4 py-3 text-right font-medium">Nợ trước lần này</th>
                                            <th className="px-4 py-3 text-right font-medium text-[#29b6f6]">Thanh toán lần này</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chiTietHoaDon.map((item, idx) => {
                                            const hd = item.hoaDon || {};

                                            const inputVal = Number(item.soTienThanhToanInput) || 0;
                                            const hasError = inputVal > item.conLaiToiDa;

                                            return (
                                                <tr key={hd._id || idx} className={`border-b border-gray-50 last:border-0 transition ${item.selected ? "bg-blue-50/30" : "opacity-60 grayscale"}`}>

                                                    {/* CHECKBOX */}
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.selected}
                                                            onChange={() => handleToggleRow(idx)}
                                                            className="w-4 h-4 accent-[#29b6f6] cursor-pointer rounded"
                                                        />
                                                    </td>

                                                    <td
                                                        className="px-4 py-3 font-medium text-[#29b6f6] cursor-pointer hover:underline"
                                                        onClick={() => navigate(`/hoa-don/${hd._id}/edit`)}
                                                    >
                                                        {hd.soHoaDon || formatSoHoaDon(hd._id)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{hd.ngayXuatHoaDon ? new Date(hd.ngayXuatHoaDon).toLocaleDateString("vi-VN") : "—"}</td>

                                                    {/* Nợ trước lần này */}
                                                    <td className="px-4 py-3 text-right text-gray-500 font-medium">
                                                        {fmt(item.conLaiToiDa)}
                                                    </td>

                                                    {/* Ô NHẬP TIỀN TỪNG DÒNG */}
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            disabled={!item.selected}
                                                            value={fmt(item.soTienThanhToanInput)}
                                                            onChange={(e) => handleRowAmountChange(idx, e.target.value)}
                                                            className={`w-28 text-right border-b-2 font-bold bg-transparent pb-0.5 outline-none transition-colors ${!item.selected ? "border-transparent text-gray-400"
                                                                : hasError ? "border-red-400 text-red-600 focus:border-red-600"
                                                                    : "border-gray-200 text-[#29b6f6] focus:border-[#29b6f6]"
                                                                }`}
                                                        />
                                                        {hasError && <p className="text-[10px] text-red-500 mt-1">Lố {fmt(inputVal - item.conLaiToiDa)} ₫</p>}
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
                            <button onClick={handleSave}
                                disabled={loading}
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
        </div>
    );

}