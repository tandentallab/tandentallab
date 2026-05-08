import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllPhieuThu } from "../../redux/slices/phieuThuSlice";
import PhieuThuModal from "./PhieuThuModal";
import PhieuThuDetailPanel from "./PhieuThuDetailPanel";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

const formatSoPhieu = (id) =>
    id ? "TAN" + id.toString().slice(-8).toUpperCase() : "-";

const formatDateTime = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

const ROWS_PER_PAGE = 20;

export default function PhieuThuPage() {
    const dispatch = useDispatch();
    const { danhSach, pagination, loading } = useSelector((s) => s.phieuThu);

    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedPhieuThu, setSelectedPhieuThu] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(searchTerm); setPage(1); }, 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    const loadData = useCallback(() => {
        dispatch(fetchAllPhieuThu({ page, limit: ROWS_PER_PAGE, search: debouncedSearch }));
    }, [dispatch, page, debouncedSearch]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleRefresh = () => { setSearchTerm(""); setDebouncedSearch(""); setPage(1); loadData(); };

    const handleRowClick = (pt) => {
        setSelectedPhieuThu((prev) => (prev?._id === pt._id ? null : pt));
    };

    // When an update happens from the edit modal, sync the selected record
    const handlePanelUpdated = (updated) => {
        if (updated) {
            setSelectedPhieuThu((prev) => prev ? { ...prev, ...updated } : prev);
        }
        loadData();
    };

    const totalPages = pagination.totalPages || 1;

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded shadow-sm border">
                <h2 className="text-base font-semibold text-gray-700">Phiếu Thu</h2>
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm phiếu thu, khách hàng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border bg-gray-50 pl-8 pr-8 py-1.5 rounded-full w-72 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                            className="w-4 h-4 absolute left-2.5 top-2 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-2.5 top-1.5 text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
                        )}
                    </div>
                    <button onClick={() => setOpenModal(true)} title="Thêm phiếu thu"
                        className="bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center w-8 h-8 font-bold text-lg shadow-sm">+</button>
                    <button onClick={handleRefresh} title="Tải lại" className="text-gray-600 hover:bg-gray-100 p-1.5 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow-sm overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-blue-50 text-blue-600 font-medium border-b sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3">Số phiếu</th>
                                <th className="px-4 py-3">Khách hàng</th>
                                <th className="px-4 py-3">Ngày thu</th>
                                <th className="px-4 py-3 text-right">Số tiền thu</th>
                                <th className="px-4 py-3">Nội dung thu</th>
                                <th className="px-4 py-3">Phương thức</th>
                                <th className="px-4 py-3">Người tạo</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Đang tải dữ liệu...</td></tr>
                            ) : danhSach.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không có dữ liệu</td></tr>
                            ) : (
                                danhSach.map((pt) => (
                                    <tr
                                        key={pt._id}
                                        onClick={() => handleRowClick(pt)}
                                        className={`border-b cursor-pointer transition-colors ${selectedPhieuThu?._id === pt._id ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : "hover:bg-gray-50"}`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-blue-700">{formatSoPhieu(pt._id)}</td>
                                        <td className="px-4 py-3">{pt.nhaKhoaInfo?.hoVaTen || pt.nhaKhoaInfo?.tenGiaoDich || "-"}</td>
                                        <td className="px-4 py-3">{formatDateTime(pt.ngayThu)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(pt.soTienThu)}</td>
                                        <td className="px-4 py-3 max-w-[200px] truncate" title={pt.noiDung}>{pt.noiDung || "-"}</td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pt.phuongThucThanhToan === "Chuy?n kho?n" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                                                {pt.phuongThucThanhToan || "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{pt.nguoiTaoInfo?.HoTenNV || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 border-t p-3 flex justify-between items-center text-sm text-gray-600">
                    <span>Tổng: {pagination.total || 0} phiếu thu</span>
                    <div className="flex items-center gap-2">
                        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">← Trước</button>
                        <span className="text-xs">Trang {page} / {totalPages}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                            className="px-2 py-1 border rounded text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">Sau →</button>
                    </div>
                </div>
            </div>

            <PhieuThuModal open={openModal} onClose={() => setOpenModal(false)} onSuccess={loadData} />

            <PhieuThuDetailPanel
                phieuThu={selectedPhieuThu}
                onClose={() => setSelectedPhieuThu(null)}
                onUpdated={handlePanelUpdated}
            />
        </div>
    );
}
