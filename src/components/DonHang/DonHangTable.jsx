import React, { useState } from 'react';

const DEFAULT_COL_WIDTHS = [140, 120, 170, 120, 120, 230, 115, 150, 170];

const DonHangTable = ({ data, selectedId, onRowClick }) => {
    const isDataValid = Array.isArray(data);
    const renderData = isDataValid ? data : [];

    const [colWidths, setColWidths] = useState(DEFAULT_COL_WIDTHS);

    const handleResizeMouseDown = (e, colIndex) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX;
        const startWidth = colWidths[colIndex];

        const onMouseMove = (moveEvent) => {
            const newWidth = Math.max(60, startWidth + moveEvent.clientX - startX);
            setColWidths((prev) => {
                const next = [...prev];
                next[colIndex] = newWidth;
                return next;
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const formatDateTime = (value) => {
        if (!value) return "";
        return new Date(value).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (value) => {
        if (!value) return "";
        return new Date(value).toLocaleDateString("vi-VN");
    };

    const loaiDonPrefix = { "Hàng sửa": "sửa", "Hàng làm lại": "làm lại", "Hàng bảo hành": "bảo hành" };

    const renderViTri = (viTri) => {
        if (!Array.isArray(viTri) || viTri.length === 0) return "";
        return viTri.map((vt) => {
            const soRang = vt.soRang || [];
            if (soRang.length === 0) return "";
            if (vt.kieu === "Cầu" && soRang.length >= 2) {
                const min = Math.min(...soRang);
                const max = Math.max(...soRang);
                return `R${min}->${max}`;
            }
            return soRang.map((r) => `R${r}`).join(" ");
        }).filter(Boolean).join(" ");
    };

    const renderTomTatRang = (danhSachSanPham) => {
        if (!Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0) return "";
        return danhSachSanPham.map((sp) => {
            const prefix = loaiDonPrefix[sp.loaiDon] || "";
            const soLuong = sp.soLuong || 1;
            const tenSanPham = sp.sanPham?.tenSanPham || "";
            const viTriStr = renderViTri(sp.viTri);
            return [prefix, soLuong, tenSanPham, viTriStr].filter(Boolean).join(" ");
        }).join(", ");
    };

    const totalWidth = colWidths.reduce((a, b) => a + b, 0);

    const ResizeHandle = ({ idx }) => (
        <div
            onMouseDown={(e) => handleResizeMouseDown(e, idx)}
            className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize group-hover:bg-blue-300 hover:bg-blue-400 active:bg-blue-500 z-20 transition-colors"
        />
    );

    const thBase = "px-3 py-3 select-none relative group overflow-hidden";

    return (
        <div className="bg-white rounded shadow-sm overflow-hidden border">
            {/* ── MOBILE: Card list (hidden sm+) ── */}
            <div className="sm:hidden divide-y divide-gray-100">
                {renderData.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 text-sm">Không có dữ liệu đơn hàng</p>
                ) : (
                    renderData.map((dh) => (
                        <div
                            key={dh._id}
                            onClick={() => onRowClick(dh)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${selectedId === dh._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-blue-700 text-sm">
                                    {dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8).toUpperCase()}`}
                                </span>
                                <TrangThaiBadge value={dh.trangThai} />
                            </div>
                            <p className="text-sm text-gray-800 font-medium truncate">
                                {dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen || '—'}
                            </p>
                            {(dh.bacSi?.hoVaTen || dh.benhNhan?.hoVaTen) && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {[dh.bacSi?.hoVaTen && `BS: ${dh.bacSi.hoVaTen}`, dh.benhNhan?.hoVaTen && `BN: ${dh.benhNhan.hoVaTen}`].filter(Boolean).join(' · ')}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                {dh.ngayNhan && <span>Nhận: {new Date(dh.ngayNhan).toLocaleDateString('vi-VN')}</span>}
                                {dh.henGiao && <span>Hẹn giao: {new Date(dh.henGiao).toLocaleDateString('vi-VN')}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── DESKTOP: Table (hidden on mobile) ── */}
            <div className="hidden sm:block overflow-x-auto">
                <table
                    className="text-sm text-left"
                    style={{ tableLayout: 'fixed', width: totalWidth, minWidth: '100%' }}
                >
                    <colgroup>
                        {colWidths.map((w, i) => <col key={i} style={{ width: w }} />)}
                    </colgroup>
                    <thead className="bg-blue-50 text-blue-600 font-medium border-b sticky top-0 z-10">
                        <tr>
                            <th className={thBase}>Nhận lúc<ResizeHandle idx={0} /></th>
                            <th className={thBase}>Số<ResizeHandle idx={1} /></th>
                            <th className={thBase}>Khách hàng<ResizeHandle idx={2} /></th>
                            <th className={`${thBase} hidden md:table-cell`}>Bác sĩ<ResizeHandle idx={3} /></th>
                            <th className={`${thBase} hidden md:table-cell`}>Bệnh nhân<ResizeHandle idx={4} /></th>
                            <th className={`${thBase} hidden lg:table-cell`}>Răng<ResizeHandle idx={5} /></th>
                            <th className={thBase}>Trạng thái<ResizeHandle idx={6} /></th>
                            <th className={thBase}>Hẹn giao<ResizeHandle idx={7} /></th>
                            <th className={`${thBase} hidden xl:table-cell`}>Ghi chú<ResizeHandle idx={8} /></th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {renderData.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-8 text-gray-500">
                                    Không có dữ liệu đơn hàng
                                </td>
                            </tr>
                        ) : (
                            renderData.map((dh) => (
                                <tr
                                    key={dh._id}
                                    className={`border-b cursor-pointer transition-colors ${selectedId === dh._id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`}
                                    onClick={() => onRowClick(dh)}
                                >
                                    <td className="px-3 py-3 truncate">{formatDateTime(dh.ngayNhan)}</td>
                                    <td className="px-3 py-3 font-medium truncate">{dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8).toUpperCase()}`}</td>
                                    <td className="px-3 py-3 truncate">{dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen}</td>
                                    <td className="px-3 py-3 truncate hidden md:table-cell">{dh.bacSi?.hoVaTen}</td>
                                    <td className="px-3 py-3 truncate hidden md:table-cell">{dh.benhNhan?.hoVaTen}</td>
                                    <td className="px-3 py-3 truncate hidden lg:table-cell" title={renderTomTatRang(dh.danhSachSanPham)}>{renderTomTatRang(dh.danhSachSanPham)}</td>
                                    <td className="px-3 py-3"><TrangThaiBadge value={dh.trangThai} /></td>
                                    <td className="px-3 py-3 truncate">{formatDateTime(dh.henGiao)}</td>
                                    <td className="px-3 py-3 truncate hidden xl:table-cell" title={dh.ghiChuChung || ""}>{dh.ghiChuChung || ""}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TrangThaiBadge = ({ value }) => {
    const map = {
        'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
        'Đang sản xuất': 'bg-blue-100 text-blue-800',
        'Hoàn thành': 'bg-green-100 text-green-800',
        'Đã giao': 'bg-gray-100 text-gray-700',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[value] || 'bg-gray-100 text-gray-600'}`}>
            {value || 'Chờ xử lý'}
        </span>
    );
};

export default DonHangTable;
