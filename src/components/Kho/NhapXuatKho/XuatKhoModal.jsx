import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { fetchVatLieu } from "../../../redux/slices/khoSlice";
import {
    createPhieuXuatKho,
    updatePhieuXuatKho,
    clearSelectedXuat,
    fetchXuatKhoOptions,
} from "../../../redux/slices/phieuXuatKhoSlice";
import { useEffect, useMemo, useRef, useState } from "react";

function ComboboxInput({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const filtered = (options || []).filter(
        (o) => !value || o.toLowerCase().includes(value.toLowerCase())
    );

    useEffect(() => {
        function handleOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <input
                type="text"
                value={value}
                onFocus={() => setOpen(true)}
                onChange={(e) => { onChange(e.target.value); setOpen(true); }}
                placeholder={placeholder}
                className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
            {open && filtered.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded shadow-lg max-h-40 overflow-y-auto">
                    {filtered.map((opt) => (
                        <li
                            key={opt}
                            onMouseDown={(e) => { e.preventDefault(); onChange(opt); setOpen(false); }}
                            className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-orange-50 hover:text-orange-700 ${value === opt ? "bg-orange-50 text-orange-700 font-medium" : "text-slate-700"}`}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/**
 * Props:
 *  open           – boolean
 *  onClose        – () => void
 *  editData       – object | null
 *  preSelectedIds – string[] | null  (danh sách _id vật liệu được chọn sẵn từ tab Vật liệu)
 */
export default function XuatKhoModal({ open, onClose, editData = null, preSelectedIds = null }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting, boPhanList, nhanVienList } = useSelector((state) => state.phieuXuatKho);

    const isEdit = !!editData;

    const [ghiChu, setGhiChu] = useState("");
    const [boPhan, setBoPhan] = useState("");
    const [nhanVien, setNhanVien] = useState("");
    const [items, setItems] = useState({});

    // Cache tên/mã/đơn vị/tồn kho theo id — không bị xóa khi đổi từ khóa tìm kiếm,
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

    // fetchXuatKhoOptions chỉ cần gọi 1 lần khi mở modal, không phụ thuộc search
    useEffect(() => {
        if (!open) return;
        dispatch(fetchXuatKhoOptions());
    }, [open, dispatch]);

    // Reset trạng thái khởi tạo mỗi khi modal mở lại / đổi phiếu đang sửa
    useEffect(() => {
        initializedRef.current = false;
        setSearch("");
        setDebouncedSearch("");
    }, [open, editData]);

    // Gộp thông tin vật liệu (tên/mã/đơn vị/tồn kho) vào cache, không xóa dữ liệu cũ
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
            setBoPhan(editData?.boPhan || "");
            setNhanVien(editData?.nhanVien || user?.hoTen || "");

            const editMap = {};
            if (isEdit && editData.danhSachVatLieu) {
                editData.danhSachVatLieu.forEach((item) => {
                    const vlId = item.vatLieu?._id || item.vatLieu;
                    editMap[vlId] = {
                        checked: true,
                        soLuong: item.soLuong || 0,
                        moTa: item.moTa || "",
                    };
                });
            }

            const initial = { ...editMap };
            kho.vatLieu.forEach((vl) => {
                const preChecked = preSelectedIds ? preSelectedIds.includes(vl._id) : false;
                if (!initial[vl._id]) {
                    initial[vl._id] = { checked: preChecked, soLuong: 0, moTa: "" };
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
                    if (!next[vl._id]) next[vl._id] = { checked: false, soLuong: 0, moTa: "" };
                });
                return next;
            });
        }
    }, [kho.vatLieu, open, editData, isEdit]);

    // ── Helpers ──────────────────────────────────────────────────────────
    const toggleCheck = (id) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], checked: !p[id].checked } }));

    const updateField = (id, field, value) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

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

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!boPhan.trim()) {
            toast.error("Vui lòng nhập bộ phận.");
            return;
        }
        if (!nhanVien.trim()) {
            toast.error("Vui lòng nhập tên nhân viên.");
            return;
        }

        const danhSachVatLieu = checkedItems
            .filter(([, v]) => v.soLuong > 0)
            .map(([vatLieuId, v]) => ({
                vatLieu: vatLieuId,
                soLuong: Number(v.soLuong),
                moTa: v.moTa,
            }));

        if (danhSachVatLieu.length === 0) {
            toast.error("Vui lòng chọn ít nhất một vật liệu và nhập số lượng > 0.");
            return;
        }

        try {
            if (isEdit) {
                await dispatch(updatePhieuXuatKho({
                    id: editData._id,
                    danhSachVatLieu,
                    ghiChu,
                    boPhan,
                    nhanVien,
                    currentRole: user?.quyenSuDung?.ten
                })).unwrap();
            } else {
                await dispatch(createPhieuXuatKho({
                    danhSachVatLieu,
                    ghiChu,
                    boPhan,
                    nhanVien,
                    nguoiTao: user?.HoTenNV || user?.quyenSuDung?.ten,
                })).unwrap();
            }
            dispatch(clearSelectedXuat());
            onClose();
        } catch (err) {
            toast.error(err?.message || "Lưu phiếu xuất thất bại.");
        }
    };

    if (!open) return null;

    const vatLieuList = kho.vatLieu || [];

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[1100px] h-[95vh] sm:h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0">
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                            {isEdit ? `Sửa phiếu – ${editData.soPhieu}` : "Tạo phiếu xuất kho"}
                        </h2>
                        {checkedItems.length > 0 && (
                            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Đã chọn {checkedItems.length} vật liệu</p>
                        )}
                    </div>
                    <button type="button" onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

                    {/* Thông tin xuất — responsive: 1 col mobile, 2 col desktop */}
                    <div className="px-4 sm:px-6 py-3 bg-orange-50 border-b shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Bộ phận <span className="text-red-500">*</span>
                            </label>
                            <ComboboxInput
                                value={boPhan}
                                onChange={setBoPhan}
                                options={boPhanList}
                                placeholder="Phòng khám, Labo..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Nhân viên <span className="text-red-500">*</span>
                            </label>
                            <ComboboxInput
                                value={nhanVien}
                                onChange={setNhanVien}
                                options={nhanVienList}
                                placeholder="Tên nhân viên..."
                            />
                        </div>
                    </div>

                    {/* Vật liệu đã chọn — luôn hiển thị dù đang lọc theo từ khóa khác */}
                    {checkedItems.length > 0 && (
                        <div className="px-4 sm:px-6 py-2 border-b bg-gray-50 flex flex-wrap gap-1.5 shrink-0">
                            {checkedItems.map(([id, v]) => (
                                <span key={id}
                                    className="inline-flex items-center gap-1.5 text-xs bg-white border border-orange-200 rounded-full pl-2.5 pr-1.5 py-1">
                                    <span className="text-gray-700">{vatLieuInfo[id]?.tenVatLieu || "…"}</span>
                                    <span className="text-gray-400">× {v.soLuong || 0}</span>
                                    <button type="button" onClick={() => toggleCheck(id)}
                                        className="w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Table header — desktop only */}
                    <div className="hidden sm:grid px-6 py-3 bg-gray-50 border-b shrink-0 gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        style={{ gridTemplateColumns: "40px 1fr 80px 80px 1fr" }}>
                        <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                            className="w-4 h-4 accent-orange-500 cursor-pointer" title="Chọn tất cả" />
                        <div className="mr-2">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nhập tên vật liệu"
                                className="w-full px-2 py-1 text-sm font-normal border text-black"
                            />
                        </div>
                        <div>Tồn kho</div>
                        <div>SL Xuất</div>
                        <div>Mô tả</div>
                    </div>

                    {/* Mobile: "Chọn tất cả" bar */}
                    <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-50 border-b shrink-0">
                        <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                            className="w-4 h-4 accent-orange-500 cursor-pointer" />
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
                                const overStock = on && Number(item.soLuong) > vl.soLuong;
                                const inputCls = `border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 ${overStock
                                    ? "border-red-400 focus:ring-red-400"
                                    : "focus:ring-orange-400"
                                    } ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`;

                                return (
                                    <div key={vl._id} className={`transition-colors ${on ? "bg-orange-50" : "hover:bg-gray-50/60"}`}>

                                        {/* ── Desktop row ── */}
                                        <div className="hidden sm:grid px-6 py-2.5 gap-3 items-center"
                                            style={{ gridTemplateColumns: "40px 1fr 80px 80px 1fr" }}>
                                            <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                                className="w-4 h-4 accent-orange-500 cursor-pointer" />
                                            <div>
                                                <div className={`text-sm font-medium ${on ? "text-gray-800" : "text-gray-400"}`}>{vl.tenVatLieu}</div>
                                                <div className="text-xs text-gray-400">{vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}</div>
                                            </div>
                                            <div className={`text-sm font-medium text-center ${vl.soLuong <= 0 ? "text-red-500" : "text-gray-600"}`}>
                                                {vl.soLuong}
                                            </div>
                                            <div>
                                                <input type="number" min={0} max={vl.soLuong} disabled={!on}
                                                    value={item.soLuong}
                                                    onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                                    className={inputCls} />
                                                {overStock && <div className="text-xs text-red-500 mt-0.5">Vượt tồn kho!</div>}
                                            </div>
                                            <input type="text" disabled={!on} value={item.moTa}
                                                placeholder="Ghi chú riêng..."
                                                onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                                className={`border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400 ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`} />
                                        </div>

                                        {/* ── Mobile card ── */}
                                        <div className="sm:hidden px-4 py-3 space-y-2">
                                            {/* Tên + tồn kho + checkbox */}
                                            <div className="flex items-start gap-3">
                                                <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                                    className="w-4 h-4 mt-0.5 accent-orange-500 cursor-pointer shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-semibold leading-tight ${on ? "text-gray-800" : "text-gray-400"}`}>{vl.tenVatLieu}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}</div>
                                                </div>
                                                <div className={`text-xs font-medium shrink-0 px-1.5 py-0.5 rounded ${vl.soLuong <= 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                                                    Tồn: {vl.soLuong}
                                                </div>
                                            </div>

                                            {/* Inputs — chỉ hiện khi được chọn */}
                                            {on && (
                                                <div className="pl-7 space-y-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Số lượng xuất</label>
                                                        <input type="number" min={0} max={vl.soLuong} value={item.soLuong}
                                                            onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                                            className={`border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 ${overStock ? "border-red-400 focus:ring-red-400" : "focus:ring-orange-400"} bg-white`} />
                                                        {overStock && <div className="text-xs text-red-500 mt-0.5">Vượt tồn kho!</div>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                                                        <input type="text" value={item.moTa} placeholder="Ghi chú riêng..."
                                                            onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                                            className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white" />
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
                                className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-400"
                                value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                {checkedItems.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        Đã chọn <span className="font-semibold text-orange-600">{checkedItems.length}</span> vật liệu
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={onClose}
                                    className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit"
                                    disabled={submitting || checkedItems.length === 0}
                                    className="px-5 py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu phiếu xuất"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}