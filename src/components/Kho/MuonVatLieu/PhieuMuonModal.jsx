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
export default function PhieuMuonModal({ open, onClose, editData = null, loai = "Mượn" }) {
    const dispatch = useDispatch();
    const kho = useSelector((state) => state.kho);
    const { user } = useSelector((state) => state.auth);
    const { loading: submitting } = useSelector((state) => state.phieuMuonVatLieu);

    const isEdit = !!editData;
    const effectiveLoai = editData?.loai || loai;
    const isMuon = effectiveLoai === "Mượn";

    // Phiếu đã xử lý (đã nhận hoặc đã trả) → khóa phần nội dung, chỉ còn sửa ghi chú
    const locked = isEdit && (editData.trangThaiNhan === "Đã nhận" || editData.trangThaiTra === "Đã trả");

    const [nhanVien, setNhanVien] = useState("");
    const [doiTac, setDoiTac] = useState({ ten: "", diaChi: "", soDienThoai: "" });
    const [ghiChu, setGhiChu] = useState("");
    const [items, setItems] = useState({});
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    // Cache tên/mã/đơn vị theo id vật liệu — không bị xóa khi đổi từ khóa tìm kiếm,
    // để vẫn hiển thị được tên của những vật liệu đã chọn nhưng đang bị lọc khỏi danh sách hiển thị
    const [vatLieuInfo, setVatLieuInfo] = useState({});
    // true sau khi đã khởi tạo state lần đầu cho phiên mở modal hiện tại
    const initializedRef = useRef(false);

    // Debounce ô tìm kiếm — chỉ gọi API sau khi người dùng ngừng gõ 400ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    // Reset trạng thái khởi tạo mỗi khi modal mở lại / đổi phiếu đang sửa
    useEffect(() => {
        initializedRef.current = false;
        setSearch("");
        setDebouncedSearch("");
    }, [open, editData]);

    useEffect(() => {
        if (!open) return;
        dispatch(fetchVatLieu({ limit: -1, name: debouncedSearch }));
    }, [open, dispatch, debouncedSearch]);

    // Gộp thông tin vật liệu (tên/mã/đơn vị) vào cache, không xóa dữ liệu cũ
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
            // Khởi tạo lần đầu cho phiên mở modal này — nạp toàn bộ dữ liệu form + danh sách đã chọn (nếu sửa)
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
                        loai,
                        nhanVien,
                        doiTac,
                        danhSachVatLieu: validItems,
                        ghiChu,
                    })).unwrap();
                    toast.success(loai === "Mượn" ? "Đã tạo phiếu mượn" : "Đã tạo phiếu cho mượn");
                }
                onClose();
            } catch (err) {
                alert("Lỗi: " + (err?.message || err));
            }
            return;
        }

        // locked → chỉ cập nhật ghi chú
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

    if (!open) return null;

    const vatLieuList = kho.vatLieu || [];
    const theme = isMuon ? "sky" : "green";

    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-[900px] h-[95vh] sm:h-[85vh] flex flex-col">

                {/* Header */}
                <div className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 ${isMuon ? "bg-sky-50" : "bg-green-50"}`}>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                        {isEdit
                            ? `Sửa phiếu ${effectiveLoai.toLowerCase()}`
                            : effectiveLoai === "Mượn" ? "Tạo phiếu mượn vật liệu" : "Tạo phiếu cho mượn vật liệu"}
                    </h2>
                    <button type="button" onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    {/* Thông tin đối tác + nhân viên */}
                    <div className="px-4 sm:px-6 py-3 border-b shrink-0 grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                {isMuon ? "Mượn của (đối tác)" : "Cho mượn (đối tác)"} *
                            </label>
                            <input type="text" disabled={locked} value={doiTac.ten}
                                onChange={(e) => setDoiTac((p) => ({ ...p, ten: e.target.value }))}
                                placeholder="Tên đối tác..."
                                className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Số điện thoại</label>
                            <input type="text" disabled={locked} value={doiTac.soDienThoai}
                                onChange={(e) => setDoiTac((p) => ({ ...p, soDienThoai: e.target.value }))}
                                className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nhân viên phụ trách</label>
                            <input type="text" value={nhanVien}
                                onChange={(e) => setNhanVien(e.target.value)}
                                className="border rounded w-full px-2 py-1.5 text-sm" />
                        </div>
                        <div className="sm:col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Địa chỉ</label>
                            <input type="text" disabled={locked} value={doiTac.diaChi}
                                onChange={(e) => setDoiTac((p) => ({ ...p, diaChi: e.target.value }))}
                                className="border rounded w-full px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-400" />
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
                    <div className={`hidden sm:grid px-6 py-2.5 border-b shrink-0 gap-3 items-center text-xs font-semibold text-gray-500 uppercase tracking-wide ${isMuon ? "bg-sky-50/50" : "bg-green-50/50"}`}
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