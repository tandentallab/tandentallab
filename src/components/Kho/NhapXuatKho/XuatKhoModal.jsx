import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu } from "../../../redux/slices/khoSlice";
import {
    createPhieuXuatKho,
    updatePhieuXuatKho,
    clearSelectedXuat,
} from "../../../redux/slices/phieuXuatKhoSlice";
import { useEffect, useMemo, useState } from "react";

/**
 * Props:
 *  open      – boolean
 *  onClose   – () => void
 *  editData  – object | null
 */
export default function XuatKhoModal({ open, onClose, editData = null }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting } = useSelector((state) => state.phieuXuatKho);

    const isEdit = !!editData;

    const [ghiChu, setGhiChu] = useState("");
    const [boPhan, setBoPhan] = useState("");
    const [nhanVien, setNhanVien] = useState("");
    const [items, setItems] = useState({});

    // ── Fetch master data ────────────────────────────────────────────────
    useEffect(() => {
        if (!open) return;
        dispatch(fetchVatLieu());
    }, [open, dispatch]);

    // ── Init items ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!open || !kho.vatLieu?.length) return;

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

        const initial = {};
        kho.vatLieu.forEach((vl) => {
            initial[vl._id] = editMap[vl._id] || {
                checked: false,
                soLuong: 0,
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

    const updateField = (id, field, value) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

    const checkedItems = useMemo(
        () => Object.entries(items).filter(([, v]) => v.checked),
        [items]
    );

    const allChecked =
        Object.keys(items).length > 0 &&
        Object.values(items).every((i) => i.checked);

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!boPhan.trim()) {
            alert("Vui lòng nhập bộ phận nhận hàng.");
            return;
        }
        if (!nhanVien.trim()) {
            alert("Vui lòng nhập tên nhân viên nhận hàng.");
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
            alert("Vui lòng chọn ít nhất một vật liệu và nhập số lượng > 0.");
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
                })).unwrap();
            } else {
                await dispatch(createPhieuXuatKho({
                    danhSachVatLieu,
                    ghiChu,
                    boPhan,
                    nhanVien,
                })).unwrap();
            }
            dispatch(clearSelectedXuat());
            onClose();
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    };

    if (!open) return null;

    const vatLieuList = kho.vatLieu || [];

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[1100px] h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {isEdit ? `Sửa phiếu – ${editData.soPhieu}` : "Tạo phiếu xuất kho"}
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

                    {/* Thông tin xuất */}
                    <div className="px-6 py-3 bg-orange-50 border-b shrink-0 grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Bộ phận nhận <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={boPhan}
                                onChange={(e) => setBoPhan(e.target.value)}
                                placeholder="Phòng khám A, Labo..."
                                className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Nhân viên nhận <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nhanVien}
                                onChange={(e) => setNhanVien(e.target.value)}
                                placeholder="Tên nhân viên..."
                                className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                            />
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="px-6 py-3 bg-gray-50 border-b shrink-0 grid gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
                        style={{ gridTemplateColumns: "40px 1fr 80px 80px 1fr" }}>
                        <input type="checkbox" checked={allChecked} onChange={toggleCheckAll}
                            className="w-4 h-4 accent-orange-500 cursor-pointer" title="Chọn tất cả" />
                        <div>Vật liệu</div>
                        <div>Tồn kho</div>
                        <div>Số lượng xuất</div>
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
                                const overStock = on && Number(item.soLuong) > vl.soLuong;
                                const inputCls = `border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 ${
                                    overStock
                                        ? "border-red-400 focus:ring-red-400"
                                        : "focus:ring-orange-400"
                                } ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`;

                                return (
                                    <div key={vl._id}
                                        className={`px-6 py-2.5 grid gap-3 items-center transition-colors ${on ? "bg-orange-50" : "hover:bg-gray-50/60"}`}
                                        style={{ gridTemplateColumns: "40px 1fr 80px 80px 1fr" }}>

                                        {/* Checkbox */}
                                        <input type="checkbox" checked={on} onChange={() => toggleCheck(vl._id)}
                                            className="w-4 h-4 accent-orange-500 cursor-pointer" />

                                        {/* Tên vật liệu */}
                                        <div>
                                            <div className={`text-sm font-medium ${on ? "text-gray-800" : "text-gray-400"}`}>
                                                {vl.tenVatLieu}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}
                                            </div>
                                        </div>

                                        {/* Tồn kho */}
                                        <div className={`text-sm font-medium text-center ${vl.soLuong <= 0 ? "text-red-500" : "text-gray-600"}`}>
                                            {vl.soLuong}
                                        </div>

                                        {/* Số lượng xuất */}
                                        <div>
                                            <input type="number" min={0} max={vl.soLuong} disabled={!on}
                                                value={item.soLuong}
                                                onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                                className={inputCls} />
                                            {overStock && (
                                                <div className="text-xs text-red-500 mt-0.5">Vượt tồn kho!</div>
                                            )}
                                        </div>

                                        {/* Mô tả */}
                                        <input type="text" disabled={!on} value={item.moTa}
                                            placeholder="Ghi chú riêng..."
                                            onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                            className={`border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400 ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`} />
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
                                className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-400"
                                value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                {checkedItems.length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        Đã chọn <span className="font-semibold text-orange-600">{checkedItems.length}</span> vật liệu
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
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