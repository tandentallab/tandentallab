import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
    fetchAllPhieuXuatKho,
    fetchPhieuXuatKhoById,
    updatePhieuXuatKho,
    deletePhieuXuatKho,
    clearSelectedXuat,
} from "../../../redux/slices/phieuXuatKhoSlice";
import { fetchVatLieu } from "../../../redux/slices/khoSlice";

import XuatKhoModal from "./XuatKhoModal";

const STATUS_OPTIONS = ["", "Chưa xuất", "Đã xuất"];

export default function XuatKhoTable() {
    const dispatch = useDispatch();
    const { phieuXuatKhos, selected, loading, loadingDetail, error, total, limit } =
        useSelector((state) => state.phieuXuatKho);

    const [modal, setModal] = useState(""); // "Xuat" | "XuatEdit" | ""
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState({
        soPhieu: "",
        trangThai: "",
        boPhan: "",
        tuNgay: "",
        denNgay: "",
    });
    const [appliedFilters, setAppliedFilters] = useState({});
    const [confirmId, setConfirmId] = useState(null);

    const totalPages = Math.ceil(total / limit);

    const fetchPage = (p, extra = appliedFilters) => {
        setCurrentPage(p);
        dispatch(fetchAllPhieuXuatKho({ page: p, limit, ...extra }));
    };

    useEffect(() => {
        fetchPage(1, {});
    }, [dispatch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const cleaned = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== "")
        );
        setAppliedFilters(cleaned);
        fetchPage(1, cleaned);
    };

    const handleReset = () => {
        setFilters({ soPhieu: "", trangThai: "", boPhan: "", tuNgay: "", denNgay: "" });
        setAppliedFilters({});
        fetchPage(1, {});
    };

    const handleEdit = async (id) => {
        await dispatch(fetchPhieuXuatKhoById(id));
        setModal("XuatEdit");
    };

    const handleConfirmDelete = (id) => setConfirmId(id);

    const handleDelete = async () => {
        if (!confirmId) return;
        try {
            await dispatch(deletePhieuXuatKho(confirmId)).unwrap();
        } catch (err) {
            alert("Lỗi xóa: " + (err?.message || err));
        } finally {
            setConfirmId(null);
        }
    };

    const handleXacNhan = async (phieu) => {
        if (phieu.trangThai === "Đã xuất") return;
        if (!window.confirm(`Xác nhận xuất kho phiếu ${phieu.soPhieu}?\nTồn kho sẽ bị trừ ngay.`)) return;
        try {
            await dispatch(updatePhieuXuatKho({ id: phieu._id, trangThai: "Đã xuất" })).unwrap();
            dispatch(fetchVatLieu());
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    };

    const fmtDate = (v) => {
        if (!v) return "";
        return new Date(v).toLocaleString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    const statusBadge = (s) =>
        s === "Đã xuất"
            ? "bg-orange-100 text-orange-700"
            : "bg-yellow-100 text-yellow-700";

    return (
        <div className="p-4 space-y-4">

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => setModal("Xuat")}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded shadow transition-colors">
                    + Xuất kho
                </button>
                {total > 0 && (
                    <span className="ml-auto text-sm text-gray-500">{total} phiếu xuất</span>
                )}
            </div>

            {/* ── Bộ lọc ── */}
            <form onSubmit={handleSearch}
                className="bg-gray-50 border rounded-lg px-4 py-3 grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Số phiếu</label>
                    <input name="soPhieu" value={filters.soPhieu} onChange={handleFilterChange}
                        placeholder="XUAT2506..."
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                    <select name="trangThai" value={filters.trangThai} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400">
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s || "— Tất cả —"}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bộ phận</label>
                    <input name="boPhan" value={filters.boPhan} onChange={handleFilterChange}
                        placeholder="Phòng khám..."
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
                    <input type="date" name="tuNgay" value={filters.tuNgay} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
                    <input type="date" name="denNgay" value={filters.denNgay} onChange={handleFilterChange}
                        className="border rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400" />
                </div>
                <div className="col-span-2 md:col-span-5 flex gap-2 justify-end">
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
            <XuatKhoModal
                open={modal === "Xuat"}
                onClose={() => { setModal(""); fetchPage(1); }}
            />
            <XuatKhoModal
                open={modal === "XuatEdit"}
                editData={selected}
                onClose={() => { setModal(""); dispatch(clearSelectedXuat()); fetchPage(currentPage); }}
            />

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
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-40">Số phiếu</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-36">Ngày tạo</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Bộ phận</th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Nhân viên</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-16">Số VL</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-28">Trạng thái</th>
                            <th className="text-center px-4 py-3 font-semibold text-gray-600 w-36">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-400">
                                    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mr-2 align-middle" />
                                    Đang tải...
                                </td>
                            </tr>
                        ) : phieuXuatKhos.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-gray-400">
                                    Không có phiếu xuất kho nào.
                                </td>
                            </tr>
                        ) : (
                            phieuXuatKhos.map((phieu) => {
                                const isDaXuat = phieu.trangThai === "Đã xuất";
                                return (
                                    <tr key={phieu._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-mono font-medium text-gray-800">
                                            {phieu.soPhieu}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-xs">
                                            {fmtDate(phieu.ngayTao)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{phieu.boPhan}</td>
                                        <td className="px-4 py-3 text-gray-700 text-xs">{phieu.nhanVien}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">
                                            {phieu.danhSachVatLieu?.length ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(phieu.trangThai)}`}>
                                                {phieu.trangThai}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {!isDaXuat && (
                                                    <button
                                                        onClick={() => handleXacNhan(phieu)}
                                                        title="Xác nhận đã xuất"
                                                        className="px-2 py-1 text-xs rounded bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition-colors">
                                                        ✓ Xuất
                                                    </button>
                                                )}
                                                {!isDaXuat && (
                                                    <button
                                                        onClick={() => handleEdit(phieu._id)}
                                                        disabled={loadingDetail}
                                                        title="Sửa phiếu"
                                                        className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-40">
                                                        ✎
                                                    </button>
                                                )}
                                                {!isDaXuat && (
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
                                        className={`px-3 py-1 border rounded transition-colors ${p === currentPage ? "bg-orange-500 text-white border-orange-500" : "hover:bg-gray-50"}`}>
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
