import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu, fetchNhaCungCap } from "../../../redux/slices/khoSlice";
import {
    createPhieuNhapKho,
    updatePhieuNhapKho,
    clearSelected,
} from "../../../redux/slices/phieuNhapKhoSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import NccCombobox from "./NccCombobox";
import ThemNhaCungCapModal from "./ThemNhaCungCapModal";

/**
 * Props:
 *  open           – boolean
 *  onClose        – () => void
 *  editData       – object | null
 *  preSelectedIds – string[] | null  (danh sách _id vật liệu được chọn sẵn từ tab Vật liệu)
 */
export default function NhapKhoModal({ open, onClose, editData = null, preSelectedIds = null }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting } = useSelector((state) => state.phieuNhapKho);

    const isEdit = !!editData;

    const [ghiChu, setGhiChu] = useState("");
    const [items, setItems] = useState({});
    // NCC cấp phiếu (dùng cho EDIT mode)
    const [nhaCungCapId, setNhaCungCapId] = useState("");

    // Modal thêm NCC mới
    const [nccModal, setNccModal] = useState(false);
    const [nccInitialText, setNccInitialText] = useState("");
    // vatLieuId đang mở NCC modal (để auto-select NCC sau khi tạo)
    const [pendingVlId, setPendingVlId] = useState(null);

    // Cache tên/mã/đơn vị/giá theo id — không bị xóa khi đổi từ khóa tìm kiếm,
    // để vẫn hiển thị được vật liệu đã chọn dù nó đang bị lọc khỏi danh sách hiển thị
    const [vatLieuInfo, setVatLieuInfo] = useState({});
    // true sau khi đã khởi tạo state lần đầu cho phiên mở modal hiện tại
    const initializedRef = useRef(false);

    // search vật liệu
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce: chỉ cập nhật debouncedSearch sau khi người dùng ngừng gõ 400ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // ── Fetch master data ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        dispatch(fetchVatLieu({ limit: -1, name: debouncedSearch }));
    }, [open, dispatch, debouncedSearch]);

    // fetchNhaCungCap chỉ cần gọi 1 lần khi mở modal
    useEffect(() => {
        if (!open) return;
        dispatch(fetchNhaCungCap());
    }, [open, dispatch]);

    // Reset trạng thái khởi tạo mỗi khi modal mở lại / đổi phiếu đang sửa
    useEffect(() => {
        initializedRef.current = false;
        setSearch("");
        setDebouncedSearch("");
    }, [open, editData]);

    // Gộp thông tin vật liệu (tên/mã/đơn vị/giá) vào cache, không xóa dữ liệu cũ
    useEffect(() => {
        if (!kho.vatLieu?.length) return;
        setVatLieuInfo((prev) => {
            const next = { ...prev };
            kho.vatLieu.forEach((vl) => { next[vl._id] = vl; });
            return next;
        });
    }, [kho.vatLieu]);

    // ── Init items ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!open || !kho.vatLieu?.length) return;

        if (!initializedRef.current) {
            // Khởi tạo lần đầu cho phiên mở modal này
            setGhiChu(editData?.ghiChu || "");

            // NCC cấp phiếu (EDIT mode)
            if (isEdit) {
                const nccId = editData.nhaCungCap?._id || editData.nhaCungCap || "";
                setNhaCungCapId(typeof nccId === "string" ? nccId : "");
            } else {
                setNhaCungCapId("");
            }

            const editMap = {};
            if (isEdit && editData.danhSachVatLieu) {
                editData.danhSachVatLieu.forEach((item) => {
                    const vlId = item.vatLieu?._id || item.vatLieu;
                    editMap[vlId] = {
                        checked: true,
                        nhaCungCap: "", // không dùng per-item NCC trong edit
                        soLuong: item.soLuong || 0,
                        donGia: item.donGia || 0,
                        thanhTien: item.thanhTien || 0,
                        moTa: item.moTa || "",
                    };
                });
            }

            const initial = { ...editMap };
            kho.vatLieu.forEach((vl) => {
                const preChecked = preSelectedIds ? preSelectedIds.includes(vl._id) : false;
                if (!initial[vl._id]) {
                    initial[vl._id] = {
                        checked: preChecked,
                        nhaCungCap: vl.nhaCungCap?._id || "",
                        soLuong: 0,
                        donGia: vl.giaMua || 0,
                        thanhTien: 0,
                        moTa: "",
                    };
                }
            });
            setItems(initial);
            initializedRef.current = true;
        } else {
            // Các lần tải sau (do gõ tìm kiếm) — chỉ THÊM vật liệu mới xuất hiện,
            // không đụng đến state của vật liệu đã có (dù đang bị lọc khỏi danh sách hiển thị)
            setItems((prev) => {
                const next = { ...prev };
                kho.vatLieu.forEach((vl) => {
                    if (!next[vl._id]) {
                        next[vl._id] = {
                            checked: false,
                            nhaCungCap: vl.nhaCungCap?._id || "",
                            soLuong: 0,
                            donGia: vl.giaMua || 0,
                            thanhTien: 0,
                            moTa: "",
                        };
                    }
                });
                return next;
            });
        }
    }, [kho.vatLieu, open, editData, isEdit]);

    // ── Helpers ──────────────────────────────────────────────────────────
    const toggleCheck = (id) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], checked: !p[id].checked } }));

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

    // "Chọn tất cả" chỉ áp dụng cho danh sách đang hiển thị (theo từ khóa tìm kiếm hiện tại),
    // không đụng tới các vật liệu đã chọn trước đó nhưng đang bị lọc khỏi danh sách
    const visibleIds = useMemo(() => (kho.vatLieu || []).map((vl) => vl._id), [kho.vatLieu]);
    const allChecked =
        visibleIds.length > 0 && visibleIds.every((id) => items[id]?.checked);

    const toggleCheckAll = () => {
        const all = allChecked;
        setItems((p) => {
            const n = { ...p };
            visibleIds.forEach((id) => { n[id] = { ...n[id], checked: !all }; });
            return n;
        });
    };

    const tongTien = useMemo(
        () => checkedItems.reduce((s, [, v]) => s + Number(v.thanhTien || 0), 0),
        [checkedItems]
    );

    // Số nhóm NCC sẽ tạo phiếu (chỉ những item có số lượng > 0)
    const nccGroupCount = useMemo(() => {
        if (isEdit) return 1;
        const keys = new Set(
            checkedItems
                .filter(([, v]) => Number(v.soLuong) > 0)
                .map(([, v]) => v.nhaCungCap || "__none__")
        );
        return keys.size;
    }, [checkedItems, isEdit]);

    const fmt = (v) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

    // ── Xử lý mở modal thêm NCC ─────────────────────────────────────────
    const handleOpenNccModal = (vlId, inputText) => {
        setPendingVlId(vlId);
        setNccInitialText(inputText);
        setNccModal(true);
    };

    const handleNccCreated = async (newNcc) => {
        await dispatch(fetchNhaCungCap());
        if (pendingVlId) {
            updateField(pendingVlId, "nhaCungCap", newNcc._id);
        } else {
            // Edit mode: cập nhật NCC cấp phiếu
            setNhaCungCapId(newNcc._id);
        }
        setPendingVlId(null);
    };

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validItems = checkedItems
            .filter(([, v]) => v.soLuong > 0)
            .map(([vatLieuId, v]) => ({
                vatLieu: vatLieuId,
                nhaCungCap: v.nhaCungCap || null,
                soLuong: Number(v.soLuong),
                donGia: Number(v.donGia),
                thanhTien: Number(v.thanhTien),
                moTa: v.moTa,
            }));

        if (validItems.length === 0) {
            alert("Vui lòng chọn ít nhất một vật liệu và nhập số lượng > 0.");
            return;
        }

        try {
            if (isEdit) {
                // NCC cấp phiếu, items không có nhaCungCap
                const danhSachVatLieu = validItems.map(({ nhaCungCap, ...rest }) => rest);
                await dispatch(updatePhieuNhapKho({
                    id: editData._id,
                    nhaCungCap: nhaCungCapId || null,
                    danhSachVatLieu,
                    ghiChu,
                    currentRole: user?.quyenSuDung?.ten
                })).unwrap();
            } else {
                // Nhóm theo per-item NCC → mỗi NCC một phiếu nhập
                const grouped = {};
                validItems.forEach((item) => {
                    const key = item.nhaCungCap || "__none__";
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(item);
                });

                const groups = Object.entries(grouped);
                for (const [nccKey, groupItems] of groups) {
                    // Loại bỏ nhaCungCap per-item, dùng làm top-level nhaCungCap
                    const danhSachVatLieu = groupItems.map(({ nhaCungCap, ...rest }) => rest);
                    await dispatch(createPhieuNhapKho({
                        nhaCungCap: nccKey === "__none__" ? null : nccKey,
                        danhSachVatLieu,
                        ghiChu,
                        nguoiTao: user?.HoTenNV || user?.quyenSuDung?.ten,
                    })).unwrap();
                }

                toast.success(
                    groups.length > 1
                        ? `Đã tạo ${groups.length} phiếu nhập (theo từng nhà cung cấp)`
                        : "Đã tạo phiếu nhập kho"
                );
            }
            dispatch(clearSelected());
            onClose();
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    };

    const editVlIds = useMemo(() => {
        if (!isEdit || !editData?.danhSachVatLieu) return null;
        return new Set(editData.danhSachVatLieu.map((item) => item.vatLieu?._id || item.vatLieu));
    }, [isEdit, editData]);

    const vatLieuList = useMemo(() => {
        const list = kho.vatLieu || [];
        if (!editVlIds || editVlIds.size === 0) return list;
        const selected = [];
        const rest = [];
        list.forEach((vl) => {
            if (editVlIds.has(vl._id)) selected.push(vl);
            else rest.push(vl);
        });
        return [...selected, ...rest];
    }, [kho.vatLieu, editVlIds]);

    if (!open) return null;

    const nhaCungCapList = kho.nhaCungCap || [];

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-[1200px] h-[95vh] sm:h-[90vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                                {isEdit ? `Sửa phiếu – ${editData.soPhieu}` : "Tạo phiếu nhập kho"}
                            </h2>
                            {checkedItems.length > 0 && (
                                <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                                    Đã chọn {checkedItems.length} vật liệu
                                    {!isEdit && nccGroupCount > 0 && (
                                        <span className="ml-2 text-green-600 font-medium">
                                            → sẽ tạo {nccGroupCount} phiếu (theo nhà cung cấp)
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>
                        <button type="button" onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                        {/* NCC cấp phiếu — chỉ hiện trong EDIT mode */}
                        {isEdit && (
                            <div className="px-4 sm:px-6 py-3 bg-sky-50 border-b shrink-0">
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Nhà cung cấp
                                </label>
                                <NccCombobox
                                    value={nhaCungCapId}
                                    onChange={setNhaCungCapId}
                                    options={nhaCungCapList}
                                    disabled={editData?.trangThaiNhap === "Đã nhận"}
                                    onAddNew={(text) => {
                                        setNccInitialText(text);
                                        setPendingVlId(null);
                                        setNccModal(true);
                                    }}
                                />
                            </div>
                        )}

                        {/* Table header — desktop only */}
                        <div className="hidden sm:grid px-6 py-3 bg-gray-50 border-b shrink-0 gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            style={{ gridTemplateColumns: isEdit ? "40px 1fr 90px 150px 130px 1fr" : "40px 1fr 220px 90px 150px 130px 1fr" }}>
                            <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                                className="w-4 h-4 accent-green-600 cursor-pointer" title="Chọn tất cả" />
                            <div className="mr-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Nhập tên vật liệu"
                                    className="w-full px-2 py-1 text-sm font-normal border text-black"
                                />
                            </div>
                            {!isEdit && <div>Nhà cung cấp</div>}
                            <div>Số lượng</div>
                            <div>Đơn giá (₫)</div>
                            <div>Thành tiền</div>
                            <div>Mô tả</div>
                        </div>

                        {/* Mobile: "Chọn tất cả" bar */}
                        <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-50 border-b shrink-0">
                            <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                                className="w-4 h-4 accent-green-600 cursor-pointer" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chọn tất cả</span>
                        </div>

                        {/* Body */}
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
                                        <div key={vl._id} className={`transition-colors ${on ? "bg-green-50" : "hover:bg-gray-50/60"}`}>

                                            {/* ── Desktop row ── */}
                                            <div className="hidden sm:grid px-6 py-2.5 gap-3 items-center"
                                                style={{ gridTemplateColumns: isEdit ? "40px 1fr 90px 150px 130px 1fr" : "40px 1fr 220px 90px 150px 130px 1fr" }}>
                                                <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                                    className="w-4 h-4 accent-green-600 cursor-pointer" />
                                                <div>
                                                    <div className={`text-sm font-medium ${on ? "text-gray-800" : "text-gray-400"}`}>{vl.tenVatLieu}</div>
                                                    <div className="text-xs text-gray-400">{vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}</div>
                                                </div>
                                                {!isEdit && (
                                                    <NccCombobox value={item.nhaCungCap} onChange={(id) => updateField(vl._id, "nhaCungCap", id)}
                                                        options={nhaCungCapList} disabled={!on} onAddNew={(text) => handleOpenNccModal(vl._id, text)} />
                                                )}
                                                <input type="number" min={0} disabled={!on} value={item.soLuong}
                                                    onChange={(e) => updateField(vl._id, "soLuong", e.target.value)} className={inputCls} />
                                                <input type="number" min={0} disabled={!on} value={item.donGia}
                                                    onChange={(e) => updateField(vl._id, "donGia", e.target.value)} className={inputCls} />
                                                <div className={`text-sm font-medium ${on && item.thanhTien > 0 ? "text-green-700" : "text-gray-400"}`}>
                                                    {on ? fmt(item.thanhTien) : "—"}
                                                </div>
                                                <input type="text" disabled={!on} value={item.moTa} placeholder="Ghi chú riêng..."
                                                    onChange={(e) => updateField(vl._id, "moTa", e.target.value)} className={inputCls} />
                                            </div>

                                            {/* ── Mobile card ── */}
                                            <div className="sm:hidden px-4 py-3 space-y-2">
                                                {/* Tên + checkbox */}
                                                <div className="flex items-start gap-3">
                                                    <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                                        className="w-4 h-4 mt-0.5 accent-green-600 cursor-pointer shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-semibold leading-tight ${on ? "text-gray-800" : "text-gray-400"}`}>{vl.tenVatLieu}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}</div>
                                                    </div>
                                                    {on && item.thanhTien > 0 && (
                                                        <div className="text-sm font-bold text-green-700 shrink-0">{fmt(item.thanhTien)}</div>
                                                    )}
                                                </div>

                                                {/* Inputs — chỉ hiện khi được chọn */}
                                                {on && (
                                                    <div className="pl-7 space-y-2">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Nhà cung cấp</label>
                                                            <NccCombobox value={item.nhaCungCap} onChange={(id) => updateField(vl._id, "nhaCungCap", id)}
                                                                options={nhaCungCapList} disabled={false} onAddNew={(text) => handleOpenNccModal(vl._id, text)} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Số lượng</label>
                                                                <input type="number" min={0} value={item.soLuong}
                                                                    onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                                                    className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs text-gray-500 mb-1">Đơn giá (₫)</label>
                                                                <input type="number" min={0} value={item.donGia}
                                                                    onChange={(e) => updateField(vl._id, "donGia", e.target.value)}
                                                                    className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                                                            <input type="text" value={item.moTa} placeholder="Ghi chú riêng..."
                                                                onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                                                className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 shrink-0 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú phiếu</label>
                                <textarea rows={2} placeholder="Ghi chú chung..."
                                    className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-500"
                                    value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <span className="text-sm text-gray-500">Tổng tiền: </span>
                                    <span className="text-xl font-bold text-green-700">{fmt(tongTien)}</span>
                                    {checkedItems.length > 0 && (
                                        <span className="ml-2 text-xs text-gray-400">({checkedItems.length} vật liệu)</span>
                                    )}
                                </div>
                                <div className="flex gap-3 justify-end">
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

            <ThemNhaCungCapModal
                open={nccModal}
                initialTen={nccInitialText}
                onClose={() => { setNccModal(false); setPendingVlId(null); }}
                onCreated={handleNccCreated}
            />
        </>
    );
}