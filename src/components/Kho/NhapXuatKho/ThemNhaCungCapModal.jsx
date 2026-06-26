import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addNhaCungCap } from "../../../redux/slices/khoSlice";

/**
 * Props:
 *  open        – boolean
 *  onClose     – () => void
 *  initialTen  – string   ← tên NCC đã nhập trước đó trong combobox
 *  onCreated   – ({ _id, ten }) => void   ← gọi sau khi tạo xong để chọn ngay NCC mới
 */
export default function ThemNhaCungCapModal({ open, onClose, initialTen = "", onCreated }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState({ ten: "", soDienThoai: "", email: "", diaChi: "", ghiChu: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Mỗi lần modal mở: reset form và điền sẵn tên từ combobox
    useEffect(() => {
        if (!open) return;
        setForm({ ten: initialTen, soDienThoai: "", email: "", diaChi: "", ghiChu: "" });
        setError("");
    }, [open, initialTen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.ten.trim()) { setError("Tên nhà cung cấp không được để trống."); return; }

        setLoading(true);
        try {
            const result = await dispatch(addNhaCungCap(form)).unwrap();
            // Tuỳ backend: { success, data: {...} } hoặc object NCC trực tiếp
            const newNcc = result?.data || result;
            onCreated?.(newNcc);
            onClose();
        } catch (err) {
            setError(err?.message || "Lỗi khi thêm nhà cung cấp.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h3 className="font-semibold text-gray-800">Thêm nhà cung cấp</h3>
                    <button type="button" onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
                    {/* Tên — bắt buộc, có sẵn text đã nhập */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên nhà cung cấp <span className="text-red-500">*</span>
                        </label>
                        <input
                            autoFocus
                            name="ten"
                            value={form.ten}
                            onChange={handleChange}
                            placeholder="Nhập tên nhà cung cấp..."
                            className={`border rounded w-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${error ? "border-red-400" : ""}`}
                        />
                        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input name="soDienThoai" value={form.soDienThoai} onChange={handleChange}
                            placeholder="0901..."
                            className="border rounded w-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            placeholder="ncc@example.com"
                            className="border rounded w-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                        <input name="diaChi" value={form.diaChi} onChange={handleChange}
                            placeholder="Địa chỉ..."
                            className="border rounded w-full px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea name="ghiChu" rows={2} value={form.ghiChu} onChange={handleChange}
                            className="border rounded w-full px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            {loading ? "Đang thêm..." : "Thêm"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}