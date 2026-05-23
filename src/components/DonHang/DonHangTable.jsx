import React from 'react';

const DonHangTable = ({ data, selectedId, onRowClick }) => {
    // Đảm bảo data luôn là một mảng để tránh lỗi .map is not a function
    const isDataValid = Array.isArray(data);
    const renderData = isDataValid ? data : [];

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

    const renderTomTatRang = (danhSachSanPham) => {
        if (!Array.isArray(danhSachSanPham) || danhSachSanPham.length === 0) return "";
        const first = danhSachSanPham[0];
        const soLuong = first?.soLuong || 0;
        const tenSanPham = first?.sanPham?.tenSanPham || "";
        return `${soLuong} ${tenSanPham}`.trim();
    };

    const rows = (dh) => [
        {
            label: "Số",
            value: dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8).toUpperCase()}`,
        },
        {
            label: "Nhận lúc",
            value: formatDateTime(dh.ngayNhan),
        },
        {
            label: "Nha khoa",
            value: dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen || "",
        },
        {
            label: "Bác sĩ",
            value: dh.bacSi?.hoVaTen || "",
        },
        {
            label: "Bệnh nhân",
            value: dh.benhNhan?.hoVaTen || "",
        },
        {
            label: "Răng",
            value: renderTomTatRang(dh.danhSachSanPham),
        },
        {
            label: "Hẹn giao",
            value: formatDate(dh.henGiao),
        },
        {
            label: "Trạng thái",
            value: <TrangThaiBadge value={dh.trangThai} />,
        },
    ];

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
                            {/* Row 1: mã đơn + trạng thái */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-blue-700 text-sm">
                                    {dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8).toUpperCase()}`}
                                </span>
                                <TrangThaiBadge value={dh.trangThai} />
                            </div>
                            {/* Row 2: nha khoa */}
                            <p className="text-sm text-gray-800 font-medium truncate">
                                {dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen || '—'}
                            </p>
                            {/* Row 3: bác sĩ · bệnh nhân */}
                            {(dh.bacSi?.hoVaTen || dh.benhNhan?.hoVaTen) && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {[dh.bacSi?.hoVaTen && `BS: ${dh.bacSi.hoVaTen}`, dh.benhNhan?.hoVaTen && `BN: ${dh.benhNhan.hoVaTen}`].filter(Boolean).join(' · ')}
                                </p>
                            )}
                            {/* Row 4: nhận lúc · hẹn giao */}
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                {dh.ngayNhan && (
                                    <span>Nhận: {new Date(dh.ngayNhan).toLocaleDateString('vi-VN')}</span>
                                )}
                                {dh.henGiao && (
                                    <span>Hẹn giao: {new Date(dh.henGiao).toLocaleDateString('vi-VN')}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── DESKTOP: Table (hidden on mobile) ── */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-blue-50 text-blue-600 font-medium border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Số</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Nhận lúc</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Nha khoa</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100 hidden md:table-cell">Bác sĩ</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100 hidden md:table-cell">Bệnh nhân</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100 hidden lg:table-cell">Răng</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Hẹn giao</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {renderData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-gray-500">
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
                                    <td className="px-4 py-3 font-medium">
                                        {dh.maDonHang || `TAN${dh._id.substring(dh._id.length - 8).toUpperCase()}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatDateTime(dh.ngayNhan)}
                                    </td>
                                    <td className="px-4 py-3">{dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{dh.bacSi?.hoVaTen}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{dh.benhNhan?.hoVaTen}</td>
                                    <td className="px-4 py-3 max-w-[250px] truncate hidden lg:table-cell" title={renderTomTatRang(dh.danhSachSanPham)}>
                                        {renderTomTatRang(dh.danhSachSanPham)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatDate(dh.henGiao)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <TrangThaiBadge value={dh.trangThai} />
                                    </td>
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