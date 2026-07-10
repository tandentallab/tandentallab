import { useRef, useEffect } from "react";
import {
    rowBase,
    borderBottom,
    formatNgay
} from "../NhapXuatKho/NhapXuatTable/constants";

export default function PhieuMuonTable({
    data,
    loai,
    loading,
    selectedId,
    onRowClick,
    hasMore,
    loadingMore,
    onLoadMore,
}) {
    const scrollRef = useRef(null);
    const sentinelRef = useRef(null);
    const isMuon = loai === "Mượn";
    const themeBg = isMuon ? "bg-sky-50" : "bg-green-50";
    const selectedBg = isMuon ? "bg-sky-50" : "bg-green-50";
    const selectedBorder = isMuon ? "border-sky-400" : "border-green-400";

    useEffect(() => {
        const el = sentinelRef.current;
        const root = scrollRef.current;
        if (!el || !root || !onLoadMore) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) onLoadMore();
            },
            { root, threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadingMore, onLoadMore, data.length]);

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div ref={scrollRef} className="max-h-[650px] overflow-y-auto table-scroll">
                <div className={`sticky top-0 h-10 flex items-center justify-center border-b font-medium uppercase text-sm ${themeBg}`}>
                    {loai}
                </div>

                {/* ── TABLE — desktop (sm+) ── */}
                <table className="hidden sm:table w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-10 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${themeBg}`}>Ngày tạo</th>
                            <th className={`${rowBase} ${themeBg}`}>Số phiếu</th>
                            <th className={`${rowBase} ${themeBg}`}>Đối tác</th>
                            <th className={`${rowBase} ${themeBg}`}>Vật liệu</th>
                            <th className={`${rowBase} ${themeBg}`}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className={`${rowBase} text-gray-400`} colSpan={5}>Đang tải...</td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td className={`${rowBase} text-gray-400`} colSpan={5}>Không có dữ liệu</td>
                            </tr>
                        ) : data.map((row) => {
                            const items = row.danhSachVatLieu || [];
                            const tenVatLieu = items.map((i) => i.vatLieu?.tenVatLieu || "?").join(", ");
                            const trangThai = ({ trangThaiNhan, trangThaiTra }) => {
                                if (trangThaiNhan === "Chưa nhận")
                                    return <p className="px-2.5 py-0.5 w-fit text-white font-medium bg-yellow-500">Chưa nhận</p>;
                                if (trangThaiTra === "Chưa trả")
                                    return <p className="px-2.5 py-0.5 w-fit text-white font-medium bg-red-500">Chưa trả</p>;
                                return <p className="px-2.5 py-0.5 w-fit text-white font-medium bg-green-500">Đã trả</p>;
                            };
                            const isSelected = row._id === selectedId;

                            return (
                                <tr
                                    key={row._id}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? selectedBg : "hover:bg-gray-50"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} max-w-28 truncate`}>{formatNgay(row.ngayTao)}</td>
                                    <td className={`${rowBase} ${borderBottom} max-w-24 truncate`}>{row.soPhieu || "-"}</td>
                                    <td className={`${rowBase} ${borderBottom} max-w-32 truncate`}>{row.doiTac?.ten || "—"}</td>
                                    <td className={`${rowBase} ${borderBottom} max-w-56 truncate`} title={tenVatLieu}>
                                        {items.length > 0 ? tenVatLieu : "—"}
                                    </td>
                                    <td className={`${rowBase} ${borderBottom}`}>
                                        {trangThai(row)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ── CARD LIST — mobile (< sm) ── */}
                <div className="sm:hidden flex flex-col gap-2 p-2 bg-gray-50">
                    {loading ? (
                        <p className="text-sm text-gray-400 text-center py-6">Đang tải...</p>
                    ) : data.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">Không có dữ liệu</p>
                    ) : data.map((row) => {
                        const items = row.danhSachVatLieu || [];
                        const tenVatLieu = items.map((i) => i.vatLieu?.tenVatLieu || "?").join(", ");
                        const daNhan = row.trangThaiNhan === "Đã nhận";
                        const daTra = row.trangThaiTra === "Đã trả";
                        const isSelected = row._id === selectedId;

                        return (
                            <div
                                key={row._id}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-colors ${isSelected ? `${selectedBorder} ${selectedBg}` : "border-gray-200"}`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm text-gray-800 truncate">{row.doiTac?.ten || "—"}</span>
                                    <div className="flex flex-col gap-1 items-end shrink-0">
                                        <span className={`text-xs text-white font-medium px-2 py-0.5 rounded ${daNhan ? "bg-green-500" : "bg-yellow-500"}`}>
                                            {row.trangThaiNhan}
                                        </span>
                                        <span className={`text-xs text-white font-medium px-2 py-0.5 rounded ${daTra ? "bg-green-500" : "bg-orange-400"}`}>
                                            {row.trangThaiTra}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                                    <span className="text-gray-400">Ngày tạo</span>
                                    <span>{formatNgay(row.ngayTao)}</span>

                                    <span className="text-gray-400">Nhân viên</span>
                                    <span className="truncate">{row.nhanVien || "—"}</span>

                                    <span className="text-gray-400">Vật liệu</span>
                                    <span className="truncate col-span-1" title={tenVatLieu}>
                                        {items.length > 0 ? tenVatLieu : "—"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sentinel — nằm TRONG vùng cuộn để IntersectionObserver bắt đúng lúc chạm đáy */}
                <div ref={sentinelRef} className="h-1" />
                {loadingMore && (
                    <div className="text-center py-2 text-xs text-gray-400">Đang tải thêm...</div>
                )}
            </div>
        </div>
    );
}