// Đường dẫn: src/utils/exportPhieuChi.js

export const xuatPhieuChi = (chiPhiData) => {
    // SỬA: Bỏ `ngayTao` đi, chỉ lấy các trường cần thiết
    const { tenChiPhi, loaiChiPhi, gia, ghiChu } = chiPhiData;
    const printWindow = window.open('', '_blank');

    const originUrl = window.location.origin;

    // SỬA: Dùng new Date() không tham số để luôn lấy ngày hiện tại lúc bấm in
    const dateObj = new Date();
    const ngay = dateObj.getDate().toString().padStart(2, '0');
    const thang = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const nam = dateObj.getFullYear();

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>Phiếu Chi - ${tenChiPhi}</title>
            <style>
                /* ÉP TRÌNH DUYỆT DÙNG KHỔ A5 NẰM NGANG (LANDSCAPE) */
                @page { 
                    size: A5 landscape; 
                    margin: 15mm; 
                }

                body { 
                    font-family: 'Times New Roman', serif; 
                    color: #000;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5; 
                }

                /* KHUNG XEM TRƯỚC (PREVIEW) */
                .preview-container {
                    background: white;
                    width: 210mm; /* Chiều ngang A5 */
                    min-height: 148mm; /* Chiều dọc A5 */
                    margin: 20px auto;
                    padding: 20mm;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }

                .toolbar-no-print {
                    text-align: center;
                    padding: 15px;
                    background: #e3f2fd;
                    border-bottom: 2px solid #90caf9;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .btn-print {
                    background-color: #4caf50;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    font-size: 18px;
                    font-weight: bold;
                    border-radius: 5px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .btn-print:hover { background-color: #45a049; }

                @media print {
                    body { background-color: white; }
                    .toolbar-no-print { display: none !important; }
                    .preview-container {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        min-height: auto;
                        box-shadow: none;
                    }
                }
                
                .header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    border-bottom: 2px solid black; 
                    padding-bottom: 12px; 
                    margin-bottom: 20px; 
                }
                .company-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .logo-container {
                    width: 80px;
                    height: 80px;
                }
                .logo-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .company-text {
                    text-align: left;
                }
                .company-name {
                    font-size: 18px;
                    font-weight: bold;
                }
                .company-detail {
                    font-size: 16px;
                    margin-top: 4px;
                }

                .title-section { 
                    text-align: center; 
                    margin: 20px 0; 
                }
                .title { 
                    font-size: 24px; 
                    font-weight: bold; 
                    margin-bottom: 5px; 
                }
                .date-info { font-style: italic; font-size: 16px; }
                
                .content-row { 
                    margin-bottom: 12px; 
                    font-size: 18px; 
                    line-height: 1.5;
                }
                .label { 
                    display: inline-block; 
                    width: 220px; 
                }
                .dots { 
                    border-bottom: 1px dotted #000; 
                    display: inline-block; 
                    width: calc(100% - 230px); 
                    font-weight: bold;
                }
                
                .footer { 
                    margin-top: 40px; 
                    display: flex; 
                    justify-content: space-around; 
                    text-align: center; 
                }
                .signature-title { font-weight: bold; font-size: 18px; }
                .signature-sub { font-style: italic; font-size: 15px; margin-top: 5px; }
                
                /* SỬA: Tăng chiều cao vùng trống lên 100px để chừa chỗ ký tên thoải mái */
                .space { height: 100px; } 
            </style>
        </head>
        <body>
            <div class="toolbar-no-print">
                <button class="btn-print" onclick="window.print()">🖨️ BẤM VÀO ĐÂY ĐỂ IN PHIẾU</button>
                <p style="margin-top: 10px; color: #555;">(Khổ giấy: A5 Nằm ngang - Giao diện này chỉ dùng để xem trước, phần viền và nút in sẽ bị ẩn khi in ra giấy)</p>
            </div>

            <div class="preview-container">
                <div class="header">
                    <div class="company-info">
                        <div class="logo-container">
                            <img src="${originUrl}/logo_tan_dental.jpg" alt="Logo Tấn Dental" />
                        </div>
                        <div class="company-text">
                            <div class="company-name">Công ty TNHH Tấn Dental</div>
                            <div class="company-detail">Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</div>
                            <div class="company-detail">Điện thoại: 0842312828</div>
                        </div>
                    </div>
                </div>

                <div class="title-section">
                    <div class="title">PHIẾU CHI TIỀN</div>
                    <div class="date-info">Ngày ${ngay} tháng ${thang} năm ${nam}</div>
                </div>

                <div class="content">
                    <div class="content-row">
                        <span class="label">Người nhận tiền / Tên chi phí:</span> 
                        <span class="dots">${tenChiPhi}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Loại chi phí:</span> 
                        <span class="dots">${loaiChiPhi}</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Số tiền:</span> 
                        <span class="dots" style="font-size: 20px;">${gia?.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div class="content-row">
                        <span class="label">Lý do / Ghi chú:</span> 
                        <span class="dots">${ghiChu || 'Không có'}</span>
                    </div>
                </div>

                <div class="footer">
                    <div>
                        <div class="signature-title">Người lập phiếu</div>
                        <div class="signature-sub">(Ký, họ tên)</div>
                        <div class="space"></div>
                    </div>
                    <div>
                        <div class="signature-title">Người nhận tiền</div>
                        <div class="signature-sub">(Ký, họ tên)</div>
                        <div class="space"></div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};