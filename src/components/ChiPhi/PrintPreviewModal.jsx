import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { Print } from '@mui/icons-material';

const PrintPreviewModal = ({ isOpen, onClose, data }) => {
    const iframeRef = useRef(null);

    const { items = [], subtitle = "", type = "day", tonQuyData } = data || {};

    const tongTien = items.reduce((sum, item) => sum + (item.gia || 0), 0);

    let displaySubtitle = subtitle;
    if (type === 'month' && displaySubtitle) {
        displaySubtitle = displaySubtitle
            .replace(/ngày\s+\d{1,2}\//i, 'tháng ')
            .replace('ngày ../..', 'tháng tt/nnnn');
    }

    // Xử lý hiển thị Quỹ và Số Dư
    let strQuyHienTai = "";
    let strSoDu = "";
    let showQuy = false;

    if (tonQuyData && tonQuyData.quyHienTai !== undefined) {
        showQuy = true;
        strQuyHienTai = tonQuyData.quyHienTai.toLocaleString('vi-VN');
        strSoDu = (tonQuyData.quyHienTai - tongTien).toLocaleString('vi-VN');
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8"/>
            <style>
                @page { size: A5 portrait; margin: 3mm; }
                body { font-family: 'Times New Roman', serif; color: #000; margin: 0; padding: 0; }
                
                .print-container {
                    padding: 12px 12px 0 12px; 
                    box-sizing: border-box;
                    width: 100%;
                }
                
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 0.5px solid #000; padding: 2px 8px; font-size: 14px; }
                
                .col-header { font-weight: bold; text-align: center; background-color: #f8fafc; }
                .main-title { font-size: 14px; font-weight: bold; text-transform: uppercase; text-align: center; }
                .sub-title { font-size: 13px;  text-align: center; font-weight: normal; }
                .sd-n-cell { text-align: left; vertical-align: center; font-weight: normal;  padding: 0px 4px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="print-container">
                <table>
                    <thead>
                        <tr>
                            <th colspan="${showQuy ? '2' : '4'}" style="border-top: none; border-left: none; ${!showQuy ? 'border-right: none;' : ''}">
                                <div class="main-title">LAB TẤN DENTAL</div>
                                ${displaySubtitle ? `<div class="sub-title">${displaySubtitle}</div>` : ''}
                            </th>
                            ${showQuy ? `
                            <th colspan="2" class="sd-n-cell font-bold">
                                Quỹ: ${strQuyHienTai}
                            </th>
                            ` : ''}
                        </tr>
                        <tr>
                            <th width="8%" class="col-header">STT</th>
                            <th width="57%" class="col-header">Nội dung</th>
                            <th width="20%" class="col-header">Loại</th>
                            <th width="15%" class="col-header">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => {
        let sttDisplay = index + 1;
        if (type === 'month') {
            if (item.ngay) {
                const dateObj = new Date(item.ngay);
                if (!isNaN(dateObj)) {
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    sttDisplay = `${d}/${m}`;
                } else {
                    sttDisplay = item.ngay.substring(0, 5);
                }
            } else {
                sttDisplay = 'nn/tt';
            }
        }
        return `
                                <tr>
                                    <td class="text-center">${sttDisplay}</td>
                                    <td>${item.tenChiPhi || ''}</td>
                                    <td class="text-center">${item.loaiChiPhi || ''}</td>
                                    <td class="text-right">${(item.gia || 0).toLocaleString('vi-VN')}</td>
                                </tr>
                            `;
    }).join('')}
                        <tr>
                            <td colspan="3" class="text-center font-bold">TỔNG CỘNG</td>
                            <td class="text-right font-bold">${tongTien.toLocaleString('vi-VN')}</td>
                        </tr>
                        ${showQuy ? `
                        <tr>
                            <td colspan="3" class="text-center font-bold">SỐ DƯ</td>
                            <td class="text-right font-bold">${strSoDu}</td>
                        </tr>
                        ` : ''}
                    </tbody>
                </table>
            </div>
        </body>
        </html>
    `;

    const handlePrint = () => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        iframe.srcdoc = htmlContent;
        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        };
    };

    return (
        <>
            <iframe ref={iframeRef} style={{ display: 'none' }} title="print-frame" />
            <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '16px', height: '85vh', bgcolor: '#f1f5f9' } }}>
                <DialogContent sx={{ p: 1, overflowY: 'auto' }}>
                    <Box sx={{ bgcolor: 'white', width: '148mm', minHeight: '210mm', mx: 'auto', p: '2.4mm', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={onClose} color="inherit" sx={{ fontWeight: 'bold' }}>Hủy bỏ</Button>
                    <Button onClick={handlePrint} variant="contained" startIcon={<Print />} sx={{ borderRadius: '10px', px: 4, fontWeight: 'bold' }}>
                        IN PHIẾU
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PrintPreviewModal;