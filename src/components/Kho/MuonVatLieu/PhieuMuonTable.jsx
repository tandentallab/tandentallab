function formatNgay(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("vi-VN");
}

const rowBase = "px-3 py-2";

/**
 * Props:
 *  data          – array phiếu mượn (đã lọc theo loai từ component cha)
 *  loai          – "Mượn" | "Cho mượn"
 *  loading       – boolean
 *  selectedId    – id phiếu đang được xem chi tiết (để highlight dòng)
 *  onRowClick    – (row) => void   → click vào dòng (trừ vùng nút) sẽ mở panel chi tiết
 *  onXacNhanNhan – (row) => void
 *  onXacNhanTra  – (row) => void
 *  onEdit        – (row) => void
 *  onDelete      – (row) => void
 */
export default function PhieuMuonTable({ data, loai, loading, selectedId, onRowClick, onXacNhanNhan, onXacNhanTra, onEdit, onDelete }) {
    const isMuon = loai === "Mượn";
    const theme = isMuon ? "sky" : "green";
    const headBg = isMuon ? "bg-sky-50" : "bg-green-50";

    const nhanLabel = isMuon ? "Xác nhận đã nhận" : "Xác nhận đã giao";
    const traLabel = isMuon ? "Xác nhận đã trả" : "Xác nhận nhận lại";

    return (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded">
            <table className="w-full text-sm text-left border-collapse min-w-[720px]">
                <thead>
                    <tr className={headBg}>
                        <th className={`${rowBase} font-semibold text-gray-600`}>Ngày tạo</th>
                        <th className={`${rowBase} font-semibold text-gray-600`}>{isMuon ? "Mượn của" : "Cho mượn"}</th>
                        <th className={`${rowBase} font-semibold text-gray-600`}>Nhân viên</th>
                        <th className={`${rowBase} font-semibold text-gray-600`}>Vật liệu</th>
                        <th className={`${rowBase} font-semibold text-gray-600`}>Trạng thái</th>
                        <th className={`${rowBase} font-semibold text-gray-600`}>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td className={`${rowBase} text-gray-400`} colSpan={6}>Đang tải...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td className={`${rowBase} text-gray-400`} colSpan={6}>Không có dữ liệu</td></tr>
                    ) : data.map((row) => {
                        const items = row.danhSachVatLieu || [];
                        const tenVatLieu = items.map((i) => i.vatLieu?.tenVatLieu || "?").join(", ");
                        const daNhan = row.trangThaiNhan === "Đã nhận";
                        const daTra = row.trangThaiTra === "Đã trả";

                        return (
                            <tr key={row._id}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`border-t border-gray-100 cursor-pointer transition-colors ${row._id === selectedId ? (isMuon ? "bg-sky-50" : "bg-green-50") : "hover:bg-gray-50"}`}>
                                <td className={`${rowBase} whitespace-nowrap`}>{formatNgay(row.ngayTao)}</td>
                                <td className={`${rowBase} max-w-40 truncate`}>{row.doiTac?.ten || "—"}</td>
                                <td className={`${rowBase} max-w-32 truncate`}>{row.nhanVien || "—"}</td>
                                <td className={`${rowBase} max-w-56 truncate`} title={tenVatLieu}>
                                    {items.length > 0 ? `${tenVatLieu} (${items.length})` : "—"}
                                </td>
                                <td className={rowBase}>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-xs text-white font-medium px-2 py-0.5 rounded w-fit ${daNhan ? "bg-green-500" : "bg-yellow-500"}`}>
                                            {row.trangThaiNhan}
                                        </span>
                                        <span className={`text-xs text-white font-medium px-2 py-0.5 rounded w-fit ${daTra ? "bg-green-500" : "bg-orange-400"}`}>
                                            {row.trangThaiTra}
                                        </span>
                                    </div>
                                </td>
                                <td className={rowBase} onClick={(e) => e.stopPropagation()}>
                                    <div className="flex flex-wrap gap-1.5">
                                        {!daNhan && (
                                            <>
                                                <button onClick={() => onXacNhanNhan(row)}
                                                    className={`text-xs text-white px-2 py-1 rounded transition-colors ${isMuon ? "bg-sky-500 hover:bg-sky-600" : "bg-green-500 hover:bg-green-600"}`}>
                                                    {nhanLabel}
                                                </button>
                                                <button onClick={() => onEdit(row)}
                                                    className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                                                    Sửa
                                                </button>
                                                <button onClick={() => onDelete(row)}
                                                    className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                        {daNhan && !daTra && (
                                            <>
                                                <button onClick={() => onXacNhanTra(row)}
                                                    className="text-xs text-white px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 transition-colors">
                                                    {traLabel}
                                                </button>
                                                <button onClick={() => onEdit(row)}
                                                    className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                                                    Ghi chú
                                                </button>
                                            </>
                                        )}
                                        {daTra && (
                                            <span className="text-xs text-gray-400 italic">Hoàn tất</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}