import React from 'react';

const DonHangTable = ({ data, selectedId, onRowClick }) => {
    // Hàm helper render tóm tắt vị trí răng
    const renderTomTatRang = (danhSachSanPham) => {
        if (!danhSachSanPham || danhSachSanPham.length === 0) return "Chưa có SP";

        const sp = danhSachSanPham[0];
        const tenSp = sp.sanPham?.tenSanPham || "SP";
        const soLuong = sp.soLuong || 0;

        let viTriStr = "R";
        if (sp.viTri && sp.viTri.length > 0) {
            // Tạm thời hiển thị text mẫu, bạn có thể custom logic gộp mảng sau
            viTriStr = "R11->13";
        }

        return `${soLuong} ${tenSp} ${viTriStr}`;
    };

    // Đảm bảo data luôn là một mảng để tránh lỗi .map is not a function
    const isDataValid = Array.isArray(data);
    // Tính toán mảng để render, nếu data lỗi thì trả về mảng rỗng
    const renderData = isDataValid ? data : [];

    return (
        <div className="bg-white rounded shadow-sm overflow-hidden border">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-blue-50 text-blue-600 font-medium border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Số</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Nhận lúc</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Nha khoa</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Bác sĩ</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Bệnh nhân</th>
                            <th className="px-4 py-3 cursor-pointer hover:bg-blue-100">Răng</th>
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
                                        {dh.ngayNhan ? new Date(dh.ngayNhan).toLocaleString('vi-VN', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        }) : ''}
                                    </td>
                                    <td className="px-4 py-3">{dh.nhaKhoa?.tenGiaoDich || dh.nhaKhoa?.hoVaTen}</td>
                                    <td className="px-4 py-3">{dh.bacSi?.hoVaTen}</td>
                                    <td className="px-4 py-3">{dh.benhNhan?.hoVaTen}</td>
                                    <td className="px-4 py-3 max-w-[250px] truncate" title={renderTomTatRang(dh.danhSachSanPham)}>
                                        {renderTomTatRang(dh.danhSachSanPham)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {dh.henGiao ? new Date(dh.henGiao).toLocaleDateString('vi-VN') : ''}
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