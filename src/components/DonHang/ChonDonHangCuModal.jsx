import React, { useState, useEffect } from 'react';
import { api } from '../../config/api';

const ChonDonHangCuModal = ({ isOpen, onClose, onSelect, patientId, nhaKhoaName, bacSiName, benhNhanName, loaiDon }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchCode, setSearchCode] = useState('');

    // Chỉ fetch danh sách đơn hàng CỦA ĐÚNG BỆNH NHÂN ĐÓ
    useEffect(() => {
        if (isOpen && patientId) {
            setLoading(true);
            api.get(`/donhang?benhNhan=${patientId}`).then(res => {
                setOrders(res.data.data || res.data || []);
                setLoading(false);
            }).catch(err => {
                console.error("Lỗi lấy đơn hàng cũ:", err);
                setLoading(false);
            });
        }
    }, [isOpen, patientId]);

    if (!isOpen) return null;

    const filteredOrders = orders.filter(o =>
        (o.maDonHang || '').toLowerCase().includes(searchCode.toLowerCase())
    );

    // Hàm tóm tắt sản phẩm để hiển thị trên bảng
    const renderSpSummary = (dsSp) => {
        if (!dsSp || dsSp.length === 0) return '';
        const sp = dsSp[0];
        const tenSp = sp.sanPham?.tenSanPham || 'Sản phẩm';
        const sl = sp.soLuong || 0;
        let viTri = '';
        if (sp.viTriText) {
            viTri = sp.viTriText;
        } else if (sp.viTri && sp.viTri.length > 0) {
            viTri = sp.viTri.map(v => v.kieu === 'Rời' ? v.soRang.join(',') : `${v.soRang[0]}->${v.soRang[v.soRang.length - 1]}`).join('; ');
        }
        return `${sl} ${tenSp} ${viTri ? `(${viTri})` : ''}`;
    };

    return (
        <div className="fixed inset-0 z-[100000] bg-black/50 flex items-center justify-center p-2 md:p-4">
            <div className="bg-[#f4f6f8] w-full h-full md:w-[80%] md:h-[80%] md:min-w-[1000px] md:min-h-[600px] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-12 bg-[#00a8ff] flex justify-between items-center px-4 md:px-6 shrink-0">
                    <span className="text-white font-bold text-base md:text-lg">Chọn {loaiDon?.replace('Hàng ', '') || 'Sửa'}</span>
                    <button onClick={onClose} className="text-white text-3xl font-bold leading-none hover:text-gray-200 transition">&times;</button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* BỘ LỌC */}
                    <div className="md:w-[300px] bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0 flex flex-col">

                        {/* Mobile: compact search bar */}
                        <div className="flex md:hidden items-center gap-2 px-4 py-3 border-b border-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Tìm mã đơn hàng..."
                                className="flex-1 outline-none text-sm bg-transparent"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                            {benhNhanName && (
                                <span className="text-xs text-gray-500 font-medium shrink-0">{benhNhanName}</span>
                            )}
                        </div>

                        {/* Desktop: full filter panel */}
                        <div className="hidden md:flex flex-col gap-6 p-6">
                            <div className="border-b border-gray-300 pb-1">
                                <input
                                    type="text"
                                    placeholder="Nhập mã đơn hàng, từ khóa..."
                                    className="w-full outline-none text-sm bg-transparent"
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                />
                            </div>

                            <div className="relative border-b border-gray-300 pb-1 mt-2">
                                <label className="text-[11px] text-gray-500 absolute -top-4 left-0">Người liên hệ</label>
                                <input type="text" readOnly value={bacSiName || ''} className="w-full outline-none text-sm bg-transparent text-gray-700" />
                            </div>

                            <div className="relative border-b border-gray-300 pb-1 mt-2">
                                <label className="text-[11px] text-gray-500 absolute -top-4 left-0">Bệnh nhân</label>
                                <input type="text" readOnly value={benhNhanName || ''} className="w-full outline-none text-sm bg-transparent text-gray-800 font-bold" />
                            </div>

                            <div className="relative border-b border-gray-300 pb-1 mt-2">
                                <label className="text-[11px] text-gray-500 absolute -top-4 left-0">Ngày nhận (Từ - Đến)</label>
                                <input type="text" placeholder="Từ - Đến" readOnly className="w-full outline-none text-sm bg-transparent text-gray-400 cursor-not-allowed" />
                                <span className="absolute right-0 top-0 text-gray-400">📅</span>
                            </div>

                            <button className="bg-[#00a8ff] hover:bg-blue-500 text-white font-bold py-2.5 rounded-full mt-4 w-32 mx-auto shadow-md transition">
                                Tìm kiếm
                            </button>
                        </div>
                    </div>

                    {/* DANH SÁCH ĐƠN HÀNG */}
                    <div className="flex-1 flex flex-col bg-white overflow-hidden p-3 md:p-6">
                        <h3 className="text-gray-600 font-bold uppercase mb-3 text-xs md:text-sm shrink-0">{nhaKhoaName || 'NHA KHOA'}</h3>

                        {/* Desktop table */}
                        <div className="hidden md:block flex-1 overflow-y-auto border border-gray-200 rounded">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 border-b sticky top-0">
                                    <tr>
                                        <th className="p-3 font-medium">Ngày nhận</th>
                                        <th className="p-3 font-medium">Đơn hàng</th>
                                        <th className="p-3 font-medium">Loại đơn</th>
                                        <th className="p-3 font-medium">Người liên hệ</th>
                                        <th className="p-3 font-medium">Bệnh nhân</th>
                                        <th className="p-3 font-medium">Sản phẩm</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">Đang tải...</td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr><td colSpan="5" className="p-4 text-center text-gray-500">Bệnh nhân này chưa có đơn hàng nào trước đây.</td></tr>
                                    ) : (
                                        filteredOrders.map((order, idx) => (
                                            <tr
                                                key={idx}
                                                onClick={() => onSelect(order)}
                                                className="border-b hover:bg-blue-50 cursor-pointer transition"
                                                title="Click để copy dữ liệu sang đơn hàng mới"
                                            >
                                                <td className="p-3">{new Date(order.ngayNhan).toLocaleDateString('vi-VN')}</td>
                                                <td className="p-3 font-medium text-gray-800">{order.maDonHang || 'TAN...'}</td>
                                                <td className="p-3">
                                                    {order.danhSachSanPham.map((sp, idx) => (
                                                        <p key={idx}>{sp.loaiDon}</p>
                                                    ))}
                                                </td>
                                                <td className="p-3">{order.bacSi?.hoVaTen || bacSiName}</td>
                                                <td className="p-3">{order.benhNhan?.hoVaTen || benhNhanName}</td>
                                                <td className="p-3 text-gray-600 font-medium">{renderSpSummary(order.danhSachSanPham)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="block md:hidden flex-1 overflow-y-auto space-y-2">
                            {loading ? (
                                <p className="text-center text-gray-500 py-8">Đang tải...</p>
                            ) : filteredOrders.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Bệnh nhân này chưa có đơn hàng nào trước đây.</p>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => onSelect(order)}
                                        className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-semibold text-gray-800 text-sm">{order.maDonHang || 'TAN...'}</span>
                                            <span className="text-xs text-gray-400">{new Date(order.ngayNhan).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <p className="text-sm text-blue-700 font-medium">{renderSpSummary(order.danhSachSanPham)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{order.bacSi?.hoVaTen || bacSiName}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChonDonHangCuModal;