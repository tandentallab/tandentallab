import React, { useRef } from 'react';
import {
    Dialog, DialogContent, DialogActions,
    Button, Box, IconButton, Typography,
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';

/**
 * PhieuChiTemplate — nội dung phiếu chi, dùng inline style
 * để render đúng cả trong preview lẫn khi in qua iframe.
 */
const PhieuChiTemplate = ({ data }) => {
    if (!data) return null;
    const { tenChiPhi, loaiChiPhi, gia, ghiChu } = data;

    const dateObj = new Date();
    const ngay = dateObj.getDate().toString().padStart(2, '0');
    const thang = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const nam = dateObj.getFullYear();

    const rows = [
        { label: 'Tên chi phí', value: tenChiPhi },
        { label: 'Loại chi phí', value: loaiChiPhi },
        { label: 'Số tiền', value: `${gia?.toLocaleString('vi-VN')} VNĐ`, large: true },
        { label: 'Ghi chú', value: ghiChu || 'Không có' },
    ];

    return (
        <div style={{ fontFamily: "'Times New Roman', serif", color: '#000', width: '100%' }}>
            {/* Header công ty */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid black', paddingBottom: '14px', marginBottom: '18px' }}>
                <img
                    src="/logo_tan_dental.jpg"
                    alt="Logo"
                    style={{ width: '80px', height: '80px', objectFit: 'contain', flexShrink: 0 }}
                />
                <div>
                    <div style={{ fontSize: '17px', fontWeight: 'bold', marginBottom: '3px' }}>Công ty TNHH Tấn Dental</div>
                    <div style={{ fontSize: '14px', marginBottom: '3px' }}>Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</div>
                    <div style={{ fontSize: '14px' }}>Điện thoại: 0842312828</div>
                </div>
            </div>

            {/* Tiêu đề */}
            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '6px' }}>PHIẾU CHI TIỀN</div>
                <div style={{ fontStyle: 'italic', fontSize: '15px' }}>Ngày {ngay} tháng {thang} năm {nam}</div>
            </div>

            {/* Nội dung */}
            <div style={{ fontSize: '16px', lineHeight: '2.2', padding: '0 8px' }}>
                {rows.map(({ label, value, large }) => (
                    <div key={label} style={{ display: 'flex', marginBottom: '6px' }}>
                        <span style={{ width: '200px', flexShrink: 0 }}>{label}</span>
                        <span style={{
                            flex: 1,
                            borderBottom: '1px dotted black',
                            fontWeight: 'bold',
                            fontSize: large ? '18px' : 'inherit',
                            paddingLeft: '8px',
                        }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Ký tên */}
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: '44px' }}>
                {['Người lập phiếu', 'Người nhận tiền'].map((title) => (
                    <div key={title}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{title}</div>
                        <div style={{ fontStyle: 'italic', fontSize: '13px', marginTop: '4px' }}>(Ký, họ tên)</div>
                        <div style={{ height: '80px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * PrintPreviewModal — Dialog xem trước + in qua iframe ẩn.
 * Không dùng window.print() trực tiếp để tránh conflict CSS với app.
 */
const PrintPreviewModal = ({ isOpen, onClose, data }) => {
    const iframeRef = useRef(null);

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Build HTML hoàn chỉnh để in — tự chứa toàn bộ style
        const { tenChiPhi, loaiChiPhi, gia, ghiChu } = data || {};
        const dateObj = new Date();
        const ngay = dateObj.getDate().toString().padStart(2, '0');
        const thang = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const nam = dateObj.getFullYear();
        const origin = window.location.origin;

        const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: A5 landscape; margin: 12mm; }
    body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 0; }
    .header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 12px; }
    .logo { width: 80px; height: 80px; object-fit: contain; flex-shrink: 0; }
    .company-name { font-size: 17px; font-weight: bold; margin-bottom: 3px; }
    .company-detail { font-size: 14px; margin-bottom: 3px; }
    .title-section { text-align: center; margin: 10px 0; }
    .title { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
    .date { font-style: italic; font-size: 14px; }
    .content { font-size: 15px; line-height: 1.8; padding: 0 8px; }
    .row { display: flex; margin-bottom: 4px; }
    .label { width: 200px; flex-shrink: 0; }
    .value { flex: 1; border-bottom: 1px dotted black; font-weight: bold; padding-left: 8px; }
    .value-large { font-size: 17px; }
    .signatures { display: flex; justify-content: space-around; text-align: center; margin-top: 24px; }
    .sig-title { font-weight: bold; font-size: 15px; }
    .sig-sub { font-style: italic; font-size: 13px; margin-top: 4px; }
    .sig-space { height: 55px; }
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="${origin}/logo_tan_dental.jpg" alt="Logo"/>
    <div>
      <div class="company-name">Công ty TNHH Tấn Dental</div>
      <div class="company-detail">Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</div>
      <div class="company-detail">Điện thoại: 0842312828</div>
    </div>
  </div>
  <div class="title-section">
    <div class="title">PHIẾU CHI TIỀN</div>
    <div class="date">Ngày ${ngay} tháng ${thang} năm ${nam}</div>
  </div>
  <div class="content">
    <div class="row"><span class="label">Tên chi phí</span><span class="value">${tenChiPhi || ''}</span></div>
    <div class="row"><span class="label">Loại chi phí</span><span class="value">${loaiChiPhi || ''}</span></div>
    <div class="row"><span class="label">Số tiền</span><span class="value value-large">${gia?.toLocaleString('vi-VN')} VNĐ</span></div>
    <div class="row"><span class="label">Ghi chú</span><span class="value">${ghiChu || 'Không có'}</span></div>
  </div>
  <div class="signatures">
    <div><div class="sig-title">Người lập phiếu</div><div class="sig-sub">(Ký, họ tên)</div><div class="sig-space"></div></div>
    <div><div class="sig-title">Người nhận tiền</div><div class="sig-sub">(Ký, họ tên)</div><div class="sig-space"></div></div>
  </div>
</body>
</html>`;

        iframe.srcdoc = html;
        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        };
    };

    return (
        <>
            {/* iframe ẩn dùng để in — hoàn toàn tách biệt khỏi CSS của app */}
            <iframe
                ref={iframeRef}
                style={{ display: 'none' }}
                title="print-frame"
            />

            <Dialog
                open={isOpen}
                onClose={onClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: { borderRadius: '16px', height: '90vh', bgcolor: '#f1f5f9' },
                }}
            >
                {/* Header */}


                {/* Preview */}
                <DialogContent sx={{ p: 4, overflowY: 'auto' }}>
                    <Box sx={{
                        bgcolor: 'white',
                        width: '210mm',
                        minHeight: '148mm',
                        mx: 'auto',
                        p: '12mm',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    }}>
                        <PhieuChiTemplate data={data} />
                    </Box>
                </DialogContent>

                {/* Footer */}
                <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={onClose} color="inherit" fontWeight="bold">
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handlePrint}
                        variant="contained"
                        startIcon={<Print />}
                        sx={{ borderRadius: '10px', px: 4, fontWeight: 'bold' }}
                    >
                        IN PHIẾU
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PrintPreviewModal;