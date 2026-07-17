import { useRef, useEffect } from "react";
import { rowBase, borderBottom, exBg, formatNgay } from "./constants";

export default function PhieuXuatTable({ data, selectedId, onRowClick, hasMore, loadingMore, onLoadMore }) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !onLoadMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) onLoadMore();
            },
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, onLoadMore]);

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[500px] overflow-y-auto table-scroll">

                {/* ── TABLE — desktop (sm+) ── */}
                <table className="hidden sm:table w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${exBg}`}>Ngày xuất</th>
                            <th className={`${rowBase} ${exBg}`}>Số phiếu</th>
                            <th className={`${rowBase} ${exBg}`}>Bộ phận</th>
                            <th className={`${rowBase} ${exBg}`}>Nhân viên</th>
                            <th className={`${rowBase} ${exBg}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td className={`${rowBase} text-gray-400`} colSpan={5}>Không có dữ liệu</td>
                            </tr>
                        ) : data.map((row) => {
                            const isSelected = row._id === selectedId;
                            return (
                                <tr
                                    key={row._id}
                                    onClick={() => onRowClick(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-green-50" : "hover:bg-gray-50"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{formatNgay(row.ngayTao)}</td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{row.soPhieu}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.boPhan}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.nhanVien}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>
                                        <span className={`text-sm text-white font-medium px-2.5 py-0.5 ${row.trangThai === "Đã xuất" ? "bg-green-500" : "bg-yellow-500"}`}>
                                            {row.trangThai}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ── CARD LIST — mobile (< sm) ── */}
                <div className="sm:hidden flex flex-col gap-2 p-2 bg-gray-50">
                    {data.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Không có dữ liệu</p>
                    ) : data.map((row) => {
                        const isSelected = row._id === selectedId;
                        return (
                            <div
                                key={row._id}
                                onClick={() => onRowClick(row)}
                                className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-colors ${isSelected ? "border-green-400 bg-green-50" : "border-gray-200"}`}
                            >
                                {/* Header row: số phiếu + trạng thái */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm text-gray-800">{row.soPhieu}</span>
                                    <span className={`text-xs text-white font-medium px-2 py-0.5 rounded ${row.trangThai === "Đã xuất" ? "bg-green-500" : "bg-yellow-500"}`}>
                                        {row.trangThai}
                                    </span>
                                </div>
                                {/* Details */}
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                                    <span className="text-gray-400">Ngày xuất</span>
                                    <span>{formatNgay(row.ngayTao)}</span>

                                    <span className="text-gray-400">Bộ phận</span>
                                    <span>{row.boPhan}</span>

                                    <span className="text-gray-400">Nhân viên</span>
                                    <span>{row.nhanVien}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sentinel */}
                <div ref={sentinelRef} className="h-1" />
                {loadingMore && (
                    <div className="text-center py-2 text-xs text-gray-400">Đang tải thêm...</div>
                )}
            </div>
        </div>
    );
}