import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
    fetchAllPhieuNhapKho,
    fetchPhieuNhapKhoById,
    updatePhieuNhapKho,
    deletePhieuNhapKho,
    clearSelected,
} from "../../../redux/slices/phieuNhapKhoSlice";

import NhapKhoModal from "./NhapKhoModal";
import XuatKhoModal from "./XuatKhoModal";

const STATUS_OPTIONS = ["", "Chưa nhận", "Đã nhận"];

export default function NhapXuatTable() {
    const dispatch = useDispatch();
    const { phieuNhapKhos, selected, loading, loadingDetail, error, total, limit } =
        useSelector((state) => state.phieuNhapKho);

    // ── Modal state ────────────────────────────────────────────────────────
    const [modal, setModal] = useState(""); // "Nhap" | "NhapEdit" | "Xuat" | ""
    const [currentPage, setCurrentPage] = useState(1);

    // ── Filter state ───────────────────────────────────────────────────────
    const [filters, setFilters] = useState({
        soPhieu: "",
        trangThai: "",
        tuNgay: "",
        denNgay: "",
    });
    const [appliedFilters, setAppliedFilters] = useState({});

    // ── Delete confirm ─────────────────────────────────────────────────────
    const [confirmId, setConfirmId] = useState(null);

    const totalPages = Math.ceil(total / limit);

    const fetchPage = (p, extra = appliedFilters) => {
        setCurrentPage(p);
        dispatch(fetchAllPhieuNhapKho({ page: p, limit, ...extra }));
    };

    useEffect(() => {
        fetchPage(1, {});
    }, [dispatch]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Loại bỏ key rỗng trước khi gửi
        const cleaned = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== "")
        );
        setAppliedFilters(cleaned);
        fetchPage(1, cleaned);
    };

    const handleReset = () => {
        setFilters({ soPhieu: "", trangThai: "", tuNgay: "", denNgay: "" });
        setAppliedFilters({});
        fetchPage(1, {});
    };

    const handleEdit = async (id) => {
        await dispatch(fetchPhieuNhapKhoById(id));
        setModal("NhapEdit");
    };

    const handleConfirmDelete = (id) => setConfirmId(id);

    const handleDelete = async () => {
        if (!confirmId) return;
        try {
            await dispatch(deletePhieuNhapKho(confirmId)).unwrap();
        } catch (err) {
            alert("Lỗi xóa: " + (err?.message || err));
        } finally {
            setConfirmId(null);
        }
    };

    const handleXacNhan = async (phieu) => {
        if (phieu.trangThai === "Đã nhận") return;
        if (!window.confirm(`Xác nhận đã nhận phiếu ${phieu.soPhieu}?\nTồn kho sẽ được cộng ngay.`)) return;
        try {
            await dispatch(updatePhieuNhapKho({ id: phieu._id, trangThai: "Đã nhận" })).unwrap();
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    };

    // ── Format helpers ─────────────────────────────────────────────────────
    const fmtDate = (v) => {
        if (!v) return "";
        return new Date(v).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const fmtCurrency = (v) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);

    const statusBadge = (s) =>
        s === "Đã nhận"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700";

    // ── Tách dòng theo NCC ─────────────────────────────────────────────────
    const rows = phieuNhapKhos.flatMap((phieu) => {
        const uniqueNCCs = [
            ...new Map(
                phieu.danhSachVatLieu
                    .filter((i) => i.nhaCungCap)
                    .map((i) => [i.nhaCungCap._id, i.nhaCungCap])
            ).values(),
        ];
        if (uniqueNCCs.length === 0) return [{ phieu, ncc: null }];
        return uniqueNCCs.map((ncc) => ({ phieu, ncc }));
    });

    return (
        <div className="p-4 space-y-4">

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setModal("Nhap")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow transition-colors">
                    + Nhập kho
                </button>
                <button onClick={() => setModal("Xuat")}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded shadow transition-colors">
                    + Xuất kho
                </button>
                {total > 0 && (
                    <span className="ml-auto text-sm text-gray-500">{total} phiếu nhập</span>
                )}
            </div>

            {/* ── Bộ lọc ── */}
            <form onSubmit={handleSearch}
                className="bg-gray-50 border rounded-lg px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số phiếu</label>
                    <input name="soPhieu" value={filters.soPhieu} onChange={handleFilterChange}
                        placeholder="TAN2506..."
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                    <select name="trangThai" value={filters.trangThai} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500">
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s || "— Tất cả —"}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                    <input type="date" name="tuNgay" value={filters.tuNgay} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                    <input type="date" name="denNgay" value={filters.denNgay} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500" />
                </div>
                <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
                    <button type="button" onClick={handleReset}
                        className="px-3 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                        Xóa lọc
                    </button>
                    <button type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                        Tìm kiếm
                    </button>
                </div>
            </form>

            {/* ── Modals ── */}
            <NhapKhoModal
                open={modal === "Nhap"}
                onClose={() => { setModal(""); fetchPage(1); }}
            />
            <NhapKhoModal
                open={modal === "NhapEdit"}
                editData={selected}
                onClose={() => { setModal(""); dispatch(clearSelected()); fetchPage(currentPage); }}
            />
            <XuatKhoModal open={modal === "Xuat"} onClose={() => setModal("")} />

            {/* ── Error ── */}
            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2">
                    Lỗi: {typeof error === "string" ? error : error?.message || "Không thể tải dữ liệu"}
                </div>
            )}

            {/* ── Table ── */}
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Số phiếu</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Ngày tạo</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Nhà cung cấp</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-16">Số VL</th>
                            <th className="text-right px-4 py-3 font-semibold text-gray-600 w-36">Tổng tiền</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Trạng thái</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28">Người tạo</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-36">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-gray-400">
                                    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin mr-2 align-middle" />
                                    Đang tải...
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-12 text-gray-400">
                                    Không có phiếu nhập kho nào.
                                </td>
                            </tr>
                        ) : (
                            rows.map(({ phieu, ncc }, idx) => {
                                const isDaНhan = phieu.trangThai === "Đã nhận";
                                return (
                                    <tr key={`${phieu._id}-${ncc?._id ?? idx}`}
                                        className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium text-gray-800">
                                            {phieu.soPhieu}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {fmtDate(phieu.ngayTao)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">
                                            {ncc ? ncc.ten : <span className="text-gray-400 italic">Không có NCC</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">
                                            {phieu.danhSachVatLieu?.length ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-800">
                                            {fmtCurrency(phieu.tongTien)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(phieu.trangThai)}`}>
                                                {phieu.trangThai}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">{phieu.nguoiTao}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Xác nhận nhận hàng */}
                                                {!isDaНhan && (
                                                    <button
                                                        onClick={() => handleXacNhan(phieu)}
                                                        title="Xác nhận đã nhận"
                                                        className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors">
                                                        ✓ Nhận
                                                    </button>
                                                )}
                                                {/* Sửa — chỉ khi chưa nhận */}
                                                {!isDaНhan && (
                                                    <button
                                                        onClick={() => handleEdit(phieu._id)}
                                                        disabled={loadingDetail}
                                                        title="Sửa phiếu"
                                                        className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-40">
                                                        ✎
                                                    </button>
                                                )}
                                                {/* Xóa — chỉ khi chưa nhận */}
                                                {!isDaНhan && (
                                                    <button
                                                        onClick={() => handleConfirmDelete(phieu._id)}
                                                        title="Xóa phiếu"
                                                        className="px-2 py-1 text-xs rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors">
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Trang {currentPage} / {totalPages} · {total} phiếu</span>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => fetchPage(currentPage - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            ‹
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, i, arr) => {
                                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "..." ? (
                                    <span key={`d${i}`} className="px-2 py-1">…</span>
                                ) : (
                                    <button key={p} onClick={() => fetchPage(p)}
                                        className={`px-3 py-1 border rounded transition-colors ${p === currentPage ? "bg-green-600 text-white border-green-600" : "hover:bg-gray-50"}`}>
                                        {p}
                                    </button>
                                )
                            )}
                        <button disabled={currentPage === totalPages} onClick={() => fetchPage(currentPage + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 transition-colors">
                            ›
                        </button>
                    </div>
                </div>
            )}

            {/* ── Confirm Delete Dialog ── */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-80 space-y-4">
                        <h3 className="font-semibold text-gray-800">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-600">
                            Bạn có chắc muốn xóa phiếu này không? Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmId(null)}
                                className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}