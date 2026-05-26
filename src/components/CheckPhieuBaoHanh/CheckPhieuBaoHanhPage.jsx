import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../config/api';
import { toast } from 'sonner';
import { CircularProgress } from '@mui/material';

// THỨ TỰ SẮP XẾP LƯỚI RĂNG 16 CỘT X 2 HÀNG THEO MẪU GỐC
const FULL_TEETH_ORDER = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

const parseToothPositions = (viTriRang) => {
  if (!viTriRang) return [];
  const positions = new Set();
  const entries = viTriRang.split(';').map(e => e.trim());
  
  entries.forEach(entry => {
    const numberMatches = entry.match(/\d+/g);
    if (numberMatches) {
      numberMatches.forEach(num => positions.add(parseInt(num)));
    }
    const rangeMatch = entry.match(/(\d+)\s*-\s*(\d+)/g);
    if (rangeMatch) {
      rangeMatch.forEach(range => {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          positions.add(i);
        }
      });
    }
  });
  return Array.from(positions);
};

const ToothPositionGrid = ({ viTriRang }) => {
  const selectedTeeth = parseToothPositions(viTriRang);

  return (
    <div className="tooth-grid">
      {FULL_TEETH_ORDER.map((tooth) => (
        <span
          key={tooth}
          className={`tooth-chip ${selectedTeeth.includes(tooth) ? '' : 'inactive'}`}
        >
          {tooth}
        </span>
      ))}
    </div>
  );
};

const CheckPhieuBaoHanhPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [warranty, setWarranty] = useState(null);
  const [searched, setSearched] = useState(false);

  // TỰ ĐỘNG NHẬN DIỆN MÃ QR (GIỮ NGUYÊN CHỮ HOA VÀ CHỮ THƯỜNG)
  useEffect(() => {
    const isZalo = /Zalo/i.test(navigator.userAgent);
    if (isZalo) {
      document.documentElement.classList.add('zalo-browser');
    }
    
    const qrcode = searchParams.get('qrcode');
    if (qrcode && qrcode.trim()) {
      const cleanQr = qrcode.trim(); // ĐÃ BỎ .toUpperCase() - GIỮ NGUYÊN CHỮ HOA THƯỜNG (ví dụ: x6TC)
      setCode(cleanQr); 
      searchWarranty(cleanQr);
    }

    return () => {
      document.documentElement.classList.remove('zalo-browser');
    };
  }, [searchParams]);

  const searchWarranty = async (searchCode) => {
    if (!searchCode || searchCode.trim() === '') {
      toast.error('Vui lòng nhập mã bảo hành');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Gửi nguyên vẹn searchCode lên API để đảm bảo phân biệt hoa thường đối với mã QR
      const res = await api.get(`/public/check-warranty/${searchCode.trim()}`);
      if (res.data?.success) {
        setWarranty(res.data.data);
        toast.success('Tìm thấy thông tin bảo hành');
      } else {
        setWarranty(null);
        toast.error(res.data?.message || 'Không tìm thấy thông tin');
      }
    } catch (err) {
      setWarranty(null);
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy phiếu bảo hành. Vui lòng kiểm tra lại mã.');
      } else {
        toast.error(err.response?.data?.message || 'Lỗi khi tra cứu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchWarranty(code);
  };

  // BIỆN PHÁP CHẶN GÕ CHỮ: Chỉ cho phép nhập số khi gõ tay từ bàn phím
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCode(value);
  };

  const handleClear = () => {
    setCode('');
    setWarranty(null);
    setSearched(false);
  };

  return (
    <div className="warranty-lookup-body">
      <div className="container">
        <img 
          src="/logo_tan_dental.jpg" 
          className="logo" 
          alt="Logo" 
          onError={(e) => e.target.src = '/logo192.png'} 
        />
        <h4>THÔNG TIN BẢO HÀNH RĂNG SỨ<br />CÔNG TY TNHH TẤN DENTAL</h4>

        <div className="search-box">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={code}
              maxLength={20}
              placeholder="Nhập mã bảo hành..."
              onChange={handleCodeChange}
              disabled={loading}
            />
            <br />
            <button type="submit" className="btn-tra-cuu" disabled={loading || !code.trim()}>
              {loading ? <CircularProgress size={20} style={{ color: 'white' }} /> : 'Tra cứu'}
            </button>
            
            {warranty && (
              <button type="button" className="btn-clear" onClick={handleClear}>
                Xóa kết quả
              </button>
            )}
          </form>
        </div>

        <div className="result" style={{ display: (searched) ? 'block' : 'none' }}>
          {loading && <p className="loading">Đang tra cứu hệ thống...</p>}

          {!loading && warranty && (
            <div className="space-y-6">
              {(warranty.danhSachSanPham || []).map((item, index) => (
                <div className="warranty-card" key={index}>
                  <div className="wc-header">
                    <div className="wc-title">PHIẾU BẢO HÀNH RĂNG SỨ</div>
                    <div className="wc-sub">Dental Warranty Certificate</div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row">
                      <span className="wc-label">👤 Khách hàng</span>
                      <span className="wc-value">{warranty.benhNhan?.ten || 'Không rõ'}</span>
                    </div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row">
                      <span className="wc-label">🏥 Nha khoa</span>
                      <span className="wc-value">{warranty.nhaKhoa?.ten || 'Không rõ'}</span>
                    </div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row">
                      <span className="wc-label">🦷 Loại răng</span>
                      <span className="wc-value">{item.tenSanPham || 'Không rõ'}</span>
                    </div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row wc-full wc-teeth-row">
                      <span className="wc-label">📍 Vị trí răng</span>
                      <ToothPositionGrid viTriRang={item.viTriRang} />
                    </div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row">
                      <span className="wc-label">🔢 Số lượng</span>
                      <span className="wc-value">{item.soLuong || 1} Răng</span>
                    </div>
                  </div>

                  {item.mau && (
                    <div className="wc-section">
                      <div className="wc-row">
                        <span className="wc-label">🎨 Màu sắc</span>
                        <span className="wc-value">{item.mau}</span>
                      </div>
                    </div>
                  )}

                  <div className="wc-section wc-highlight">
                    <div className="wc-row">
                      <span className="wc-label">🗓 Ngày làm</span>
                      <span className="wc-value">{new Date(item.baoHanhTu).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="wc-section">
                    <div className="wc-row">
                      <span className="wc-label">⏳ Ngày hết hạn</span>
                      <span className="wc-value">{new Date(item.baoHanhDen).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !warranty && (
            <div className="error-box">
              <p>❌ Không tìm thấy thông tin bảo hành</p>
              <span>Vui lòng kiểm tra lại chính xác ký tự mã của bạn.</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .warranty-lookup-body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #6d9eeb, #8e7cc3);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            width: 100%;
            padding: 20px 10px;
            box-sizing: border-box;
        }
        .warranty-lookup-body .container {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
            width: 100%;
            max-width: 550px;
            text-align: center;
            box-sizing: border-box;
        }
        .warranty-lookup-body h4 { color: #333; margin-bottom: 25px; font-size: 16px; line-height: 1.5; font-weight: bold; }
        
        .warranty-lookup-body .search-box input[type="text"] {
            width: 90%; 
            padding: 12px; 
            font-size: 18px; 
            border: 2px solid #0066cc; 
            border-radius: 8px; 
            text-align: left; 
            box-sizing: border-box;
        }
        
        .warranty-lookup-body .btn-tra-cuu {
            margin-top: 20px; 
            padding: 12px 30px; 
            font-size: 18px; 
            background: #0066cc; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-weight: bold;
            transition: background 0.2s;
            display: inline-block;
        }
        .warranty-lookup-body .btn-tra-cuu:hover { background: #004a99; }
        
        .warranty-lookup-body .btn-clear {
            margin-top: 20px;
            margin-left: 10px;
            padding: 12px 20px;
            font-size: 18px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        .warranty-lookup-body .btn-clear:hover { background: #5a6268; }
        
        .warranty-lookup-body .result { margin-top: 25px; text-align: left; }
        .warranty-lookup-body .loading { color: #ff4500; font-weight: bold; text-align: center; }
        
        .warranty-lookup-body .logo { 
            max-width: 100px; 
            margin: 0 auto 20px auto; 
            display: block; 
            border-radius: 0 !important; 
            box-shadow: none !important; 
        }
        
        .warranty-card { background: #fff; border-radius: 14px; box-shadow: 0 12px 30px rgba(0,0,0,.12); overflow: hidden; font-size: 15px; border: 1px solid #eee; margin-bottom: 20px; }
        .wc-header { background: linear-gradient(135deg, #0d6efd, #4f8df7); color: white; padding: 18px; text-align: center; }
        .wc-title { font-size: 18px; font-weight: 700; letter-spacing: 0.5px; }
        .wc-sub { font-size: 13px; opacity: .85; margin-top: 2px; }
        .wc-section { padding: 14px 18px; border-bottom: 1px solid #eee; }
        .wc-section:last-child { border-bottom: none; }
        .wc-row { display: grid; grid-template-columns: 125px 1fr; gap: 12px; align-items: center; }
        .wc-label { display: flex; align-items: center; padding: 6px 12px; border-radius: 14px; font-size: 12px; font-weight: 600; white-space: nowrap; background: #f0f4ff; color: #0d6efd; width: fit-content; }
        .wc-value { font-size: 14px; color: #000000; text-align: right; font-weight: bold; text-transform: uppercase; }
        .wc-full { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; grid-template-columns: none; }
        .wc-highlight { background: #f8faff; }
        
        .tooth-grid { display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; width: 100%; margin-top: 6px; }
        .tooth-chip { display: block; text-align: center; font-size: 11px; font-weight: bold; color: #0b4dbb; background: #dbeafe; border-radius: 4px; padding: 6px 0; line-height: 1; border: 1px solid #b9d5ff; }
        .tooth-chip.inactive { background: #f3f4f6; color: #9ca3af; border-color: #e5e7eb; font-weight: normal; }
        
        .error-box { background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; text-align: center; }
        .error-box p { margin: 0; font-weight: bold; font-size: 16px; }
        .error-box span { font-size: 13px; margin-top: 5px; display: block; }

        .zalo-browser .tooth-grid, @media (max-width: 600px) {
          .warranty-lookup-body .container { padding: 25px 12px; }
          .wc-row { grid-template-columns: 110px 1fr; gap: 6px; }
          .tooth-grid { grid-template-columns: repeat(16, 1fr); gap: 2px; }
          .tooth-chip { font-size: 8.5px; padding: 4px 0; }
        }
      `}</style>
    </div>
  );
};

export default CheckPhieuBaoHanhPage;