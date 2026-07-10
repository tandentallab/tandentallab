import { useDispatch, useSelector } from "react-redux";
import { fetchVatLieu } from "../../../redux/slices/khoSlice";
import {
    createPhieuMuonVatLieu,
    updatePhieuMuonVatLieu,
} from "../../../redux/slices/phieuMuonVatLieuSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Props:
 *  open      – boolean
 *  onClose   – () => void
 *  editData  – object | null
 *  loai      – "Mượn" | "Cho mượn"   (chỉ dùng khi tạo mới, editData sẽ tự quyết định loai)
 */
export default function PhieuMuonModal({ open, onClose, editData = null }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting } = useSelector((state) => state.phieuMuonVatLieu);

    const isEdit = !!editData;

    // Loại phiếu: khi sửa thì lấy theo phiếu đang sửa, khi tạo mới thì cho chọn trong modal
    const [formLoai, setFormLoai] = useState("Mượn");
    const effectiveLoai = isEdit ? editData.loai : formLoai;
    const isMuon = effectiveLoai === "Mượn";

    // Phiếu đã xử lý (đã nhận hoặc đã trả) → khóa phần nội dung, chỉ còn sửa ghi chú
    const locked = isEdit && (editData.trangThaiNhan === "Đã nhận" || editData.trangThaiTra === "Đã trả");

    const [nhanVien, setNhanVien] = useState("");
    const [doiTac, setDoiTac] = useState({ ten: "", diaChi: "", soDienThoai: "" });
    const [ghiChu, setGhiChu] = useState("");
    const [items, setItems] = useState({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [vatLieuInfo, setVatLieuInfo] = useState({});
    const initializedRef = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset trạng thái khởi tạo mỗi khi modal mở lại / đổi phiếu đang sửa
    useEffect(() => {
        initializedRef.current = false;
        setSearch("");
        setDebouncedSearch("");
        // Khi mở modal để tạo mới, luôn quay về mặc định "Mượn"
        if (open && !editData) setFormLoai("Mượn");
    }, [open, editData]);

    useEffect(() => {
        if (!open) return;
        dispatch(fetchVatLieu({ limit: -1, name: debouncedSearch }));
    }, [open, dispatch, debouncedSearch]);

    useEffect(() => {
        if (!kho.vatLieu?.length) return;
        setVatLieuInfo((prev) => {
            const next = { ...prev };
            kho.vatLieu.forEach((vl) => { next[vl._id] = vl; });
            return next;
        });
    }, [kho.vatLieu]);

    useEffect(() => {
        if (!open || !kho.vatLieu?.length) return;

        if (!initializedRef.current) {
            setNhanVien(editData?.nhanVien || "");
            setDoiTac({
                ten: editData?.doiTac?.ten || "",
                diaChi: editData?.doiTac?.diaChi || "",
                soDienThoai: editData?.doiTac?.soDienThoai || "",
            });
            setGhiChu(editData?.ghiChu || "");

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
                if (!initial[vl._id]) initial[vl._id] = { checked: false, soLuong: 0, moTa: "" };
            });
            setItems(initial);
            initializedRef.current = true;
        } else {
            setItems((prev) => {
                const next = { ...prev };
                kho.vatLieu.forEach((vl) => {
                    if (!next[vl._id]) next[vl._id] = { checked: false, soLuong: 0, moTa: "" };
                });
                return next;
            });
        }
    }, [kho.vatLieu, open, editData, isEdit]);

    const toggleCheck = (id) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], checked: !p[id].checked } }));

    const updateField = (id, field, value) =>
        setItems((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));

    const checkedItems = useMemo(
        () => Object.entries(items).filter(([, v]) => v.checked),
        [items]
    );

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!locked) {
            if (!doiTac.ten.trim()) {
                alert("Vui lòng nhập tên đối tác.");
                return;
            }
            const validItems = checkedItems
                .filter(([, v]) => Number(v.soLuong) > 0)
                .map(([vatLieuId, v]) => ({
                    vatLieu: vatLieuId,
                    soLuong: Number(v.soLuong),
                    moTa: v.moTa,
                }));
            if (validItems.length === 0) {
                alert("Vui lòng chọn ít nhất một vật liệu và nhập số lượng > 0.");
                return;
            }

            try {
                if (isEdit) {
                    await dispatch(updatePhieuMuonVatLieu({
                        id: editData._id,
                        nhanVien,
                        doiTac,
                        danhSachVatLieu: validItems,
                        ghiChu,
                        currentRole: user?.quyenSuDung?.ten,
                    })).unwrap();
                    toast.success("Đã cập nhật phiếu");
                } else {
                    await dispatch(createPhieuMuonVatLieu({
                        loai: formLoai,
                        nhanVien,
                        doiTac,
                        danhSachVatLieu: validItems,
                        ghiChu,
                    })).unwrap();
                    toast.success(formLoai === "Mượn" ? "Đã tạo phiếu mượn" : "Đã tạo phiếu cho mượn");
                }
                onClose();
            } catch (err) {
                alert("Lỗi: " + (err?.message || err));
            }
            return;
        }

        try {
            await dispatch(updatePhieuMuonVatLieu({
                id: editData._id,
                ghiChu,
                currentRole: user?.quyenSuDung?.ten,
            })).unwrap();
            toast.success("Đã cập nhật ghi chú");
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

    const theme = isMuon ? "sky" : "green";

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] h-[95vh] sm:h-[85vh] flex flex-col">

                {/* Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 ${isMuon ? "bg-sky-100" : "bg-green-100"}`}>
                    <div className="flex items-center gap-3">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                            {isEdit ? `Sửa phiếu ${effectiveLoai.toLowerCase()}` : "Tạo phiếu"}
                        </h2>

                        {/* Bộ chọn loại phiếu — chỉ cho đổi khi tạo mới */}
                        {!isEdit && (
                            <div className="inline-flex rounded-full border border-gray-300 bg-white p-0.5 text-xs font-medium">
                                <button type="button" onClick={() => setFormLoai("Mượn")}
                                    className={`px-3 py-1 rounded-full transition-colors ${isMuon ? "bg-sky-600 text-white" : "text-gray-500 hover:text-sky-700"
                                        }`}>
                                    Phiếu mượn
                                </button>
                                <button type="button" onClick={() => setFormLoai("Cho mượn")}
                                    className={`px-3 py-1 rounded-full transition-colors ${!isMuon ? "bg-green-600 text-white" : "text-gray-500 hover:text-green-700"
                                        }`}>
                                    Phiếu cho mượn
                                </button>
                            </div>
                        )}
                    </div>
                    <button type="button" onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-3">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs text-gray-600">Tên đối tác *</label>
                                <input type="text" disabled={locked} value={doiTac.ten}
                                    onChange={(e) => setDoiTac((p) => ({ ...p, ten: e.target.value }))}
                                    placeholder="ABC Dental"
                                    className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-600">Địa chỉ</label>
                                <input type="text" disabled={locked} value={doiTac.diaChi}
                                    onChange={(e) => setDoiTac((p) => ({ ...p, diaChi: e.target.value }))}
                                    placeholder="Ninh Kiều, Cần Thơ"
                                    className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-600">Số điện thoại</label>
                                <input type="text" disabled={locked} value={doiTac.soDienThoai}
                                    onChange={(e) => setDoiTac((p) => ({ ...p, soDienThoai: e.target.value }))}
                                    placeholder="0123456789"
                                    className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="text-xs text-gray-600">Nhân viên</label>
                            <input type="text" value={nhanVien}
                                onChange={(e) => setNhanVien(e.target.value)}
                                placeholder="Nguyễn Văn A"
                                className="block border rounded w-[282px] px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                        </div>
                    </div>

                    {locked && (
                        <div className="px-4 sm:px-6 py-2 bg-yellow-50 text-xs text-yellow-700 border-b shrink-0">
                            Phiếu đã được xử lý (đã nhận hoặc đã trả) nên không thể sửa danh sách vật liệu / đối tác. Chỉ có thể cập nhật ghi chú.
                        </div>
                    )}

                    {/* Vật liệu đã chọn — luôn hiển thị dù đang lọc theo từ khóa khác */}
                    {checkedItems.length > 0 && (
                        <div className="px-4 sm:px-6 py-2 border-b bg-gray-50 flex flex-wrap gap-1.5 shrink-0">
                            {checkedItems.map(([id, v]) => (
                                <span key={id}
                                    className={`inline-flex items-center gap-1.5 text-xs bg-white border rounded-full pl-2.5 pr-1.5 py-1 ${isMuon ? "border-sky-200" : "border-green-200"}`}>
                                    <span className="text-gray-700">{vatLieuInfo[id]?.tenVatLieu || "…"}</span>
                                    <span className="text-gray-400">× {v.soLuong || 0}</span>
                                    {!locked && (
                                        <button type="button" onClick={() => toggleCheck(id)}
                                            className="w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                            ✕
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Table header */}
                    <div className={`hidden sm:grid px-6 py-2.5 border-b shrink-0 gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide ${isMuon ? "bg-sky-100/50" : "bg-green-100/50"}`}
                        style={{ gridTemplateColumns: "40px 1fr 120px 1fr" }}>
                        <input type="checkbox" checked={allChecked} disabled={locked} onChange={toggleCheckAll}
                            className={`w-4 h-4 cursor-pointer ${isMuon ? "accent-sky-600" : "accent-green-600"}`} />
                        <div>
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm vật liệu..."
                                className="w-full px-2 py-1 text-sm font-normal border text-black" />
                        </div>
                        <div>Số lượng</div>
                        <div>Mô tả</div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                        {kho.loading ? (
                            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Đang tải...</div>
                        ) : vatLieuList.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Không có vật liệu.</div>
                        ) : vatLieuList.map((vl) => {
                            const item = items[vl._id];
                            if (!item) return null;
                            const on = item.checked;
                            const inputCls = `border rounded px-2 py-1.5 text-sm w-full focus:outline-none ${!on ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white"}`;
                            return (
                                <div key={vl._id}
                                    className={`grid px-4 sm:px-6 py-2.5 gap-3 items-center transition-colors ${on ? (isMuon ? "bg-sky-50" : "bg-green-50") : "hover:bg-gray-50/60"}`}
                                    style={{ gridTemplateColumns: "40px 1fr 120px 1fr" }}>
                                    <input type="checkbox" checked={on} disabled={locked}
                                        onChange={() => toggleCheck(vl._id)}
                                        className={`w-4 h-4 cursor-pointer ${isMuon ? "accent-sky-600" : "accent-green-600"}`} />
                                    <div>
                                        <div className={`text-sm font-medium ${on ? "text-gray-800" : "text-gray-400"}`}>{vl.tenVatLieu}</div>
                                        <div className="text-xs text-gray-400">{vl.maVatLieu}{vl.donViTinh ? ` · ${vl.donViTinh}` : ""}</div>
                                    </div>
                                    <input type="number" min={0} disabled={!on || locked} value={item.soLuong}
                                        onChange={(e) => updateField(vl._id, "soLuong", e.target.value)}
                                        className={inputCls} />
                                    <input type="text" disabled={!on || locked} value={item.moTa} placeholder="Ghi chú riêng..."
                                        onChange={(e) => updateField(vl._id, "moTa", e.target.value)}
                                        className={inputCls} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 shrink-0 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                            <textarea rows={2} placeholder="Ghi chú chung..."
                                className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none"
                                value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-gray-400">
                                {checkedItems.length > 0 ? `${checkedItems.length} vật liệu đã chọn` : ""}
                            </span>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose}
                                    className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting}
                                    className={`px-5 py-2 text-white text-sm font-medium rounded disabled:opacity-50 transition-colors ${isMuon ? "bg-sky-600 hover:bg-sky-700" : "bg-green-600 hover:bg-green-700"}`}>
                                    {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu phiếu"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}