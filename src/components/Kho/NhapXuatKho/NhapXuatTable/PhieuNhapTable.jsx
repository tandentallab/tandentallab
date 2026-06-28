import { useRef, useEffect } from "react";
import { rowBase, borderBottom, imBg, formatNgay } from "./constants";

export default function PhieuNhapTable({ data, selectedId, onRowClick, hasMore, loadingMore, onLoadMore }) {
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
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${imBg}`}>Ngày nhập</th>
                            <th className={`${rowBase} ${imBg}`}>Số phiếu</th>
                            <th className={`${rowBase} ${imBg}`}>Nhà cung cấp</th>
                            <th className={`${rowBase} ${imBg}`}>Thành tiền</th>
                            <th className={`${rowBase} ${imBg}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td className={`${rowBase} text-gray-400`} colSpan={5}>Không có dữ liệu</td>
                            </tr>
                        ) : data.map((row) => {
                            const nccDaiDien = row.danhSachVatLieu?.[0]?.nhaCungCap?.ten || "—";
                            const nccSet = new Set(
                                (row.danhSachVatLieu || []).map((v) => v.nhaCungCap?.ten).filter(Boolean)
                            );
                            const coNhieuNCC = nccSet.size > 1;
                            const isSelected = row._id === selectedId;
                            return (
                                <tr
                                    key={row._id}
                                    onClick={() => onRowClick(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-sky-50" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{formatNgay(row.ngayTao)}</td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>{row.soPhieu}</td>
                                    <td className={`${rowBase} ${borderBottom} max-w-32 truncate`}>
                                        {nccDaiDien}
                                        {coNhieuNCC && (
                                            <span className="text-gray-400 text-xs ml-1">+{nccSet.size - 1}</span>
                                        )}
                                    </td>
                                    <td className={`${rowBase} ${borderBottom} whitespace-nowrap`}>
                                        {(row.tongTien || 0).toLocaleString("vi-VN")}
                                    </td>
                                    <td className={`${rowBase} ${borderBottom}`}>
                                        <span className={`text-sm text-white font-medium px-2.5 py-0.5 ${row.trangThai === "Đã nhận" ? "bg-green-500" : "bg-yellow-500"
                                            }`}>
                                            {row.trangThai}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${imBg} font-medium`} colSpan={3}>Tổng</td>
                                <td className={`${rowBase} ${imBg} font-medium`} colSpan={2}>
                                    {data.reduce((s, r) => s + (r.tongTien || 0), 0).toLocaleString("vi-VN")} ₫
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
                {/* Sentinel vô hình — trigger load more khi cuộn tới */}
                <div ref={sentinelRef} className="h-1" />
                {loadingMore && (
                    <div className="text-center py-2 text-xs text-gray-400">Đang tải thêm...</div>
                )}
            </div>
        </div>
    );
}
