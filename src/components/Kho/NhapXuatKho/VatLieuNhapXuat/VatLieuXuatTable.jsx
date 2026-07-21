import { rowBase, borderBottom, exBg } from "../NhapXuatTable/constants";

export default function VatLieuXuatTable({ data, selectedId, onRowClick }) {
    const tongSoLuong = data.reduce((s, r) => s + r.soLuong, 0);
    return (
        <div className="flex flex-col flex-1 min-w-0">
            <div className="max-h-[500px] overflow-y-auto table-scroll">
                <table className="w-full border-collapse text-sm text-left bg-white">
                    <thead className="sticky top-0 z-10">
                        <tr className="shadow">
                            <th className={`${rowBase} ${exBg}`}>Tên vật liệu</th>
                            <th className={`${rowBase} ${exBg}`}>ĐVT</th>
                            <th className={`${rowBase} ${exBg}`}>Số lượng</th>
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
                                    className={`cursor-pointer transition-colors ${isSelected ? "bg-green-100" : "hover:bg-gray-100"}`}
                                >
                                    <td className={`${rowBase} ${borderBottom} max-w-60`}>{row.tenVatLieu}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.donViTinh}</td>
                                    <td className={`${rowBase} ${borderBottom}`}>{row.soLuong}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="sticky bottom-0 z-10">
                            <tr>
                                <td className={`${rowBase} ${exBg} font-medium`} colSpan={2}>Tổng</td>
                                <td className={`${rowBase} ${exBg} font-medium`}>{tongSoLuong}</td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}