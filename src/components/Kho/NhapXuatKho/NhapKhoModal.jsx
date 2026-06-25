import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu, fetchNhaCungCap } from "../../../redux/slices/khoSlice";
import {
    createPhieuNhapKho,
    updatePhieuNhapKho,
    clearSelected,
} from "../../../redux/slices/phieuNhapKhoSlice";
import { useEffect, useMemo, useState } from "react";

import NccCombobox from "./NccCombobox";
import ThemNhaCungCapModal from "./ThemNhaCungCapModal";

/**
 * Props:
 *  open      – boolean
 *  onClose   – () => void
 *  editData  – object | null
 */
export default function NhapKhoModal({ open, onClose, editData = null }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting } = useSelector((state) => state.phieuNhapKho);

    const isEdit = !!editData;

    const [ghiChu, setGhiChu] = useState("");
    const [items, setItems] = useState({});

    // Modal thêm NCC mới
    const [nccModal, setNccModal] = useState(false);
    const [nccInitialText, setNccInitialText] = useState("");
    // vatLieuId đang mở NCC modal (để auto-select NCC sau khi tạo)
    const [pendingVlId, setPendingVlId] = useState(null);

    // ── Fetch master data ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        dispatch(fetchVatLieu());
        dispatch(fetchNhaCungCap());
    }, [open, dispatch]);

    // ── Init items ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!open || !kho.vatLieu?.length) return;

        setGhiChu(editData?.ghiChu || "");

        const editMap = {};
        if (isEdit && editData.danhSachVatLieu) {
            editData.danhSachVatLieu.forEach((item) => {
                const vlId = item.vatLieu?._id || item.vatLieu;
                editMap[vlId] = {
                    checked: true,
                    nhaCungCap: item.nhaCungCap?._id || item.nhaCungCap || "",
                    soLuong: item.soLuong || 0,
                    donGia: item.donGia || 0,
                    thanhTien: item.thanhTien || 0,
                    moTa: item.moTa || "",
                };
            });
        }

        const initial = {};
        kho.vatLieu.forEach((vl) => {
            initial[vl._id] = editMap[vl._id] || {
                checked: false,
                nhaCungCap: vl.nhaCungCap?._id || "",
                soLuong: 0,
                donGia: vl.giaMua || 0,
                thanhTien: 0,
                moTa: "",
            };
        });
        setItems(initial);
    }, [kho.vatLieu, open, editData]);

    // ── Helpers ──────────────────────────────────────────────────────────
    const toggleCheck = (id) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], checked: !p[id].checked } }));

    const toggleCheckAll = () => {
        const all = Object.values(items).every((i) => i.checked);
        setItems((p) => {
            const n = {};
            Object.keys(p).forEach((id) => { n[id] = { ...p[id], checked: !all }; });
            return n;
        });
    };

    const updateField = (id, field, value) => {
        setItems((p) => {
            const cur = p[id];
            const upd = { ...cur, [field]: value };
            const sl = field === "soLuong" ? Number(value) : Number(cur.soLuong || 0);
            const dg = field === "donGia" ? Number(value) : Number(cur.donGia || 0);
            upd.thanhTien = sl * dg;
            return { ...p, [id]: upd };
        });
    };

    const checkedItems = useMemo(
        () => Object.entries(items).filter(([, v]) => v.checked),
        [items]
    );

    const allChecked =
        Object.keys(items).length > 0 &&
        Object.values(items).every((i) => i.checked);

    const tongTien = useMemo(
        () => checkedItems.reduce((s, [, v]) => s + Number(v.thanhTien || 0), 0),
        [checkedItems]
    );

    const fmt = (v) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

    // ── Xử lý mở modal thêm NCC ─────────────────────────────────────────
    const handleOpenNccModal = (vlId, inputText) => {
        setPendingVlId(vlId);
        setNccInitialText(inputText);
        setNccModal(true);
    };

    // Sau khi tạo NCC thành công → fetch lại danh sách NCC và auto-select
    const handleNccCreated = async (newNcc) => {
        await dispatch(fetchNhaCungCap());
        if (pendingVlId) {
            updateField(pendingVlId, "nhaCungCap", newNcc._id);
        }
        setPendingVlId(null);
    };

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const danhSachVatLieu = checkedItems
            .filter(([, v]) => v.soLuong > 0)
            .map(([vatLieuId, v]) => ({
                vatLieu: vatLieuId,
                ...(v.nhaCungCap ? { nhaCungCap: v.nhaCungCap } : {}),
                soLuong: Number(v.soLuong),
                donGia: Number(v.donGia),
                thanhTien: Number(v.thanhTien),
                moTa: v.moTa,
            }));

        if (danhSachVatLieu.length === 0) {
            alert("Vui lòng chọn ít nhất một vật liệu và nhập số lượng > 0.");
            return;
        }

        try {
            if (isEdit) {
                await dispatch(updatePhieuNhapKho({ id: editData._id, danhSachVatLieu, ghiChu })).unwrap();
            } else {
                await dispatch(createPhieuNhapKho({ danhSachVatLieu, ghiChu, nguoiTao: user?.hoTen || "Admin" })).unwrap();
            }
            dispatch(clearSelected());
            onClose();
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    };

    if (!open) return null;

    const vatLieuList = kho.vatLieu || [];
    const nhaCungCapList = kho.nhaCungCap || [];

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-[1200px] h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                {isEdit ? `Sửa phiếu – ${editData.soPhieu}` : "Tạo phiếu nhập kho"}
                            </h2>
                            {checkedItems.length > 0 && (
                                <p className="text-sm text-gray-400 mt-0.5">Đã chọn {checkedItems.length} vật liệu</p>
                            )}
                        </div>
                        <button type="button" onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                        {/* Table header */}
                        <div className="px-6 py-3 bg-gray-50 border-b shrink-0 grid gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            style={{ gridTemplateColumns: "40px 1fr 220px 90px 150px 130px 1fr" }}>
                            <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                                className="w-4 h-4 accent-green-600 cursor-pointer" title="Chọn tất cả" />
                            <div>Vật liệu</div>
                            <div>Nhà cung cấp</div>
                            <div>Số lượng</div>
                            <div>Đơn giá (₫)</div>
                            <div>Thành tiền</div>
                            <div>Mô tả</div>
                        </div>

                        {/* Table body */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                            {kho.loading ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Đang tải...</div>
                            ) : vatLieuList.length === 0 ? (
                                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có vật liệu.</div>
                            ) : (
                                vatLieuList.map((vl) => {
                                    const item = items[vl._id];
                                    if (!item) return null;
                                    const on = item.checked;
                                    const inputCls = `border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`;

                                    return (
                                        <div key={vl._id}
                                            className={`px-6 py-2.5 grid gap-3 items-center transition-colors ${on ? "bg-green-50" : "hover:bg-gray-50/60"}`}
                                            style={{ gridTemplateColumns: "40px 1fr 220px 90px 150px 130px 1fr" }}>

                                            {/* Checkbox */}
                                            <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                                className="w-4 h-4 accent-green-600 cursor-pointer" />

                                            {/* Tên vật liệu */}
                                            <div>
                                                <div className={`text-sm font-medium ${on ? "text-gray-800" : "text-gray-400"}`}>
                                                    {vl.tenVatLieu}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}
                                                </div>
                                            </div>

                                            {/* NCC Combobox */}
                                            <NccCombobox
                                                value={item.nhaCungCap}
                                                onChange={(id) => updateField(vl._id, "nhaCungCap", id)}
                                                options={nhaCungCapList}
                                                disabled={!on}
                                                onAddNew={(text) => handleOpenNccModal(vl._id, text)}
                                            />

                                            {/* Số lượng */}
                                            <input type="number" min={0} disabled={!on} value={item.soLuong}
                                                onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                                className={inputCls} />

                                            {/* Đơn giá */}
                                            <input type="number" min={0} disabled={!on} value={item.donGia}
                                                onChange={(e) => updateField(vl._id, "donGia", e.target.value)}
                                                className={inputCls} />

                                            {/* Thành tiền */}
                                            <div className={`text-sm font-medium ${on && item.thanhTien > 0 ? "text-green-700" : "text-gray-400"}`}>
                                                {on ? fmt(item.thanhTien) : "—"}
                                            </div>

                                            {/* Mô tả */}
                                            <input type="text" disabled={!on} value={item.moTa}
                                                placeholder="Ghi chú riêng..."
                                                onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                                className={inputCls} />
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-6 py-4 shrink-0 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú phiếu</label>
                                <textarea rows={2} placeholder="Ghi chú chung..."
                                    className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm text-gray-500">Tổng tiền: </span>
                                    <span className="text-xl font-bold text-green-700">{fmt(tongTien)}</span>
                                    {checkedItems.length > 0 && (
                                        <span className="ml-2 text-xs text-gray-400">({checkedItems.length} vật liệu)</span>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={onClose}
                                        className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                        Hủy
                                    </button>
                                    <button type="submit"
                                        disabled={submitting || checkedItems.length === 0}
                                        className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                        {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu phiếu nhập"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal thêm NCC — z-index cao hơn để nằm trên NhapKhoModal */}
            <ThemNhaCungCapModal
                open={nccModal}
                initialTen={nccInitialText}
                onClose={() => { setNccModal(false); setPendingVlId(null); }}
                onCreated={handleNccCreated}
            />
        </>
    );
}