import { rowBase, borderBottom, imBg } from "../NhapXuatTable/constants";

export default function VatLieuNhapTable({ data, selectedId, onRowClick }) {
    const tongSoLuong = data.reduce((s, r) => s + r.soLuong, 0);
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[500px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${imBg}`}>Tên vật liệu</th>
                            <th className={`${rowBase} ${imBg}`}>ĐVT</th>
                            <th className={`${rowBase} ${imBg}`}>Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td className={`${rowBase} text-gray-400`} colSpan={3}>Không có dữ liệu</td>
                            </tr>
                        ) : data.map((row) => {
                            const isSelected = row.id === selectedId;
                            return (
                                <tr
                                    key={row.id}
                                    onClick={() => onRowClick?.(row)}
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-sky-100" : "hover:bg-gray-100"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} max-w-52 truncate`}>{row.tenVatLieu}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.donViTinh}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.soLuong}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${imBg} font-medium`} colSpan={2}>Tổng</td>
                                <td className={`${rowBase} ${imBg} font-medium`}>{tongSoLuong}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}