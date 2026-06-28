import React from 'react';
import PrintIcon from '@mui/icons-material/Print';

const PrintPreviewModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const { tenChiPhi, loaiChiPhi, gia, ghiChu } = data;
    const originUrl = window.location.origin;

    // Lấy ngày giờ thực tế tại thời điểm mở/bấm in
    const dateObj = new Date();
    const ngay = dateObj.getDate().toString().padStart(2, '0');
    const thang = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const nam = dateObj.getFullYear();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60">

            <style>
                {`
                    @media print {
                        /* 1. Ẩn mọi thứ bên ngoài vùng in */
                        body * {
                            visibility: hidden;
                        }
                        
                        /* 2. Chỉ hiển thị nội dung phiếu chi */
                        #print-content, #print-content * {
                            visibility: visible;
                        }

                        /* 3. ĐÂY LÀ MẤU CHỐT: Xóa bỏ lệnh căn giữa của Modal khi in */
                        .fixed, .flex, .absolute {
                            position: static !important;
                            display: block !important;
                            transform: none !important;
                        }

                        /* 4. Ép vùng in bám sát góc trên cùng bên trái của trang giấy */
                        #print-content {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                        }
                        
                        /* 5. Cố định khổ giấy A5 Nằm ngang */
                        @page { 
                            size: A5 landscape; 
                            margin: 10mm; 
                        }
                    }
                `}
            </style>

            {/* Các class print: tĩnh hỗ trợ phá vỡ giao diện nổi (popup) khi in ra giấy */}
            <div className="bg-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl relative flex flex-col print:static print:block print:max-h-none print:overflow-visible print:bg-white print:shadow-none">

                <div className="flex justify-end items-center p-4 bg-white border-b sticky top-0 z-10 print:hidden">
                    <button onClick={onClose} className="text-red-500 font-bold text-3xl hover:text-red-700 leading-none">
                        &times;
                    </button>
                </div>

                <div className="p-8 flex justify-center flex-1 print:p-0 print:block">
                    <div
                        id="print-content"
                        className="bg-white text-black p-8 shadow-md print:shadow-none print:p-0"
                        style={{ width: '210mm', minHeight: '148mm', fontFamily: "'Times New Roman', serif" }}
                    >
                        {/* Thông tin công ty */}
                        <div className="flex items-center gap-6 border-b-2 border-black pb-4 mb-6">
                            <div className="w-24 h-24">
                                <img src={`${originUrl}/logo_tan_dental.jpg`} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-left mb-1">Công ty TNHH Tấn Dental</h1>
                                <p className="text-base text-left mb-1">Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</p>
                                <p className="text-base text-left">Điện thoại: 0842312828</p>
                            </div>
                        </div>

                        {/* Tiêu đề & Ngày tháng tự động cập nhật */}
                        <div className="text-center my-6">
                            <h2 className="text-2xl font-bold mb-2">PHIẾU CHI TIỀN</h2>
                            <p className="italic text-lg">Ngày {ngay} tháng {thang} năm {nam}</p>
                        </div>

                        <div className="text-lg leading-loose px-4">
                            <div className="flex mb-3">
                                <span className="w-60">Tên chi phí</span>
                                <span className="flex-1 border-b border-dotted border-black font-bold pl-2">{tenChiPhi}</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-60">Loại chi phí</span>
                                <span className="flex-1 border-b border-dotted border-black font-bold pl-2">{loaiChiPhi}</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-60">Số tiền</span>
                                <span className="flex-1 border-b border-dotted border-black font-bold pl-2 text-xl">{gia?.toLocaleString('vi-VN')} VNĐ</span>
                            </div>
                            <div className="flex mb-3">
                                <span className="w-60">Ghi chú</span>
                                <span className="flex-1 border-b border-dotted border-black font-bold pl-2">{ghiChu || 'Không có'}</span>
                            </div>
                        </div>

                        {/* Đã thêm khoảng trống rõ ràng để dễ ký tên */}
                        <div className="flex justify-around text-center mt-12 mb-12">
                            <div>
                                <div className="font-bold text-lg">Người lập phiếu</div>
                                <div className="italic text-base">(Ký, họ tên)</div>
                                <div style={{ height: '90px' }}></div>
                            </div>
                            <div>
                                <div className="font-bold text-lg">Người nhận tiền</div>
                                <div className="italic text-base">(Ký, họ tên)</div>
                                <div style={{ height: '90px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-4 bg-white border-t sticky bottom-0 z-10 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow flex items-center gap-2 text-lg"
                    >
                        IN <PrintIcon />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PrintPreviewModal;