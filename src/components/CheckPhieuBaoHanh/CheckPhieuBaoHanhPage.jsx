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
    // 1. Tìm các số răng riêng lẻ
    const numberMatches = entry.match(/\d+/g);
    if (numberMatches) {
      numberMatches.forEach(num => positions.add(parseInt(num)));
    }

    // 2. Tìm khoảng răng (chấp nhận cả kí tự -> hoặc - hoặc –)
    const rangeMatch = entry.match(/(\d+)\s*(?:->|-|–)\s*(\d+)/g);
    if (rangeMatch) {
      rangeMatch.forEach(range => {
        const parts = range.split(/(?:->|-|–)/).map(n => parseInt(n.trim()));
        if (parts.length === 2) {
          const [start, end] = parts;
          const indexStart = FULL_TEETH_ORDER.indexOf(start);
          const indexEnd = FULL_TEETH_ORDER.indexOf(end);

          if (indexStart !== -1 && indexEnd !== -1) {
            // Duyệt theo vị trí thực tế trên cung hàm (FDI World Dental Federation Grid)
            const minIdx = Math.min(indexStart, indexEnd);
            const maxIdx = Math.max(indexStart, indexEnd);
            for (let i = minIdx; i <= maxIdx; i++) {
              positions.add(FULL_TEETH_ORDER[i]);
            }
          } else {
            // Nhỡ không khớp bảng răng thì fallback theo số học bình thường
            for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
              positions.add(i);
            }
          }
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
          src="/TẤN 2.png"
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
              <div className="warranty-card">
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

                <div className="wc-section-title">
                  ✨ DANH SÁCH SẢN PHẨM BẢO HÀNH
                </div>

                <div className="wc-products-list">
                  {(warranty.danhSachSanPham || []).map((item, index) => (
                    <div className="wc-product-card" key={index}>
                      {warranty.danhSachSanPham.length > 1 && (
                        <div className="wc-product-header">
                          📦 Sản phẩm {index + 1}
                        </div>
                      )}
                      <div className="wc-product-body">
                        <div className="wc-product-row">
                          <span className="wc-label">🦷 Loại răng</span>
                          <span className="wc-value">{item.tenSanPhamBaoHanh || item.tenSanPham || 'Không rõ'}</span>
                        </div>

                        <div className="wc-product-row wc-full wc-teeth-row">
                          <span className="wc-label">📍 Vị trí răng</span>
                          <ToothPositionGrid viTriRang={item.viTriRang} />
                        </div>

                        <div className="wc-product-row">
                          <span className="wc-label">🔢 Số lượng</span>
                          <span className="wc-value">{item.soLuong || 1} Răng</span>
                        </div>

                        <div className="wc-product-dates-grid">
                          <div className="wc-date-col">
                            <span className="wc-date-label">🗓 Ngày làm</span>
                            <span className="wc-date-value">{new Date(item.baoHanhTu).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="wc-date-col text-right">
                            <span className="wc-date-label">⏳ Ngày hết hạn</span>
                            <span className="wc-date-value highlight-red">{new Date(item.baoHanhDen).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        <div className="wc-remaining-days-bar">
                          {(() => {
                            const end = new Date(item.baoHanhDen);
                            const today = new Date();
                            end.setHours(0, 0, 0, 0);
                            today.setHours(0, 0, 0, 0);
                            const diffTime = end.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays > 0) {
                              return <span className="badge-active">Còn {diffDays} ngày bảo hành</span>;
                            } else {
                              return <span className="badge-expired">Hết bảo hành</span>;
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
            max-width: 160px; 
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
        .wc-full { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; grid-template-columns: none !important; }
        .wc-highlight { background: #f8faff; }
        
        .tooth-grid { display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; width: 100%; margin-top: 6px; }
        .tooth-chip { display: block; text-align: center; font-size: 11px; font-weight: bold; color: #0b4dbb; background: #dbeafe; border-radius: 4px; padding: 6px 0; line-height: 1; border: 1px solid #b9d5ff; }
        .tooth-chip.inactive { background: #f3f4f6; color: #9ca3af; border-color: #e5e7eb; font-weight: normal; }

        /* ===== NEW PRODUCT CARDS ===== */
        .wc-section-title {
            padding: 16px 18px 10px;
            font-size: 13px;
            font-weight: 700;
            color: #1e3a8a;
            background: #f1f5f9;
            border-bottom: 1px solid #e2e8f0;
            letter-spacing: 0.5px;
            text-align: center;
        }
        .wc-products-list {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: #f8fafc;
        }
        .wc-product-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .wc-product-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.06);
        }
        .wc-product-header {
            background: linear-gradient(135deg, #e2e8f0, #f1f5f9);
            padding: 10px 14px;
            font-size: 12px;
            font-weight: 700;
            color: #334155;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .wc-product-body {
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        .wc-product-row {
            display: grid;
            grid-template-columns: 125px 1fr;
            gap: 12px;
            align-items: center;
        }
        .wc-product-dates-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 4px;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;
        }
        .wc-date-col {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        .wc-date-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
        }
        .wc-date-value {
            font-size: 13px;
            color: #0f172a;
            font-weight: 700;
        }
        .wc-date-value.highlight-red {
            color: #ef4444;
        }
        .wc-remaining-days-bar {
            margin-top: 12px;
            text-align: center;
        }
        .wc-remaining-days-bar .badge-active {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            color: #047857;
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            padding: 6px 16px;
            border-radius: 9999px;
            box-shadow: 0 2px 4px rgba(4, 120, 87, 0.04);
        }
        .wc-remaining-days-bar .badge-expired {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            color: #be123c;
            background: #fff1f2;
            border: 1px solid #fecdd3;
            padding: 6px 16px;
            border-radius: 9999px;
            box-shadow: 0 2px 4px rgba(190, 18, 60, 0.04);
        }
        
        .error-box { background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border: 1px solid #ffeeba; text-align: center; }
        .error-box p { margin: 0; font-weight: bold; font-size: 16px; }
        .error-box span { font-size: 13px; margin-top: 5px; display: block; }

        .zalo-browser .tooth-grid, @media (max-width: 600px) {
          .warranty-lookup-body .container { padding: 25px 12px; }
          .wc-row, .wc-product-row { grid-template-columns: 110px 1fr; gap: 6px; }
          .tooth-grid { grid-template-columns: repeat(16, 1fr); gap: 2px; }
          .tooth-chip { font-size: 8.5px; padding: 4px 0; }
        }
      `}</style>
    </div>
  );
};

export default CheckPhieuBaoHanhPage;