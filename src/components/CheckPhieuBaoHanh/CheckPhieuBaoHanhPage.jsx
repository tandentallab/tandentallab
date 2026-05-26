import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const EXTERNAL_API =
  'https://sapi.dentalso.com/api/p1/warranty/66022d6a6293fefc6c2e92c3/code';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const Row = ({ label, value }) => (
  <div className="wc-section">
    <div className="wc-row">
      <span className="wc-label">{label}</span>
      <span className="wc-value">{value || '—'}</span>
    </div>
  </div>
);

const CheckPhieuBaoHanhPage = () => {
  const [searchParams] = useSearchParams();
  const [inputCode, setInputCode] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const isZalo = /Zalo/i.test(navigator.userAgent);
    if (isZalo) document.documentElement.classList.add('zalo-browser');
    return () => document.documentElement.classList.remove('zalo-browser');
  }, []);

  useEffect(() => {
    const qrcode = searchParams.get('qrcode');
    console.log('[warranty] qrcode param:', qrcode);
    if (qrcode?.trim()) {
      setInputCode(qrcode.trim());
      fetchWarranty(qrcode.trim());
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputCode.trim()) fetchWarranty(inputCode.trim());
  };

  const handleClear = () => {
    setInputCode('');
    setItems([]);
    setSearched(false);
    setError(null);
  };

  const fetchWarranty = async (q) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await axios.get(EXTERNAL_API, { params: { q } });
      console.log('[warranty] response:', res.data);
      setItems(res.data?.data || []);
    } catch (err) {
      console.error('[warranty] error:', err.response?.data || err.message);
      setError(
        err.response?.status === 404
          ? 'Không tìm thấy phiếu bảo hành.'
          : err.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wbody">
      <div className="wcontainer">
        <img
          src="/logo_tan_dental.jpg"
          className="wlogo"
          alt="Logo"
          onError={(e) => (e.target.src = '/logo192.png')}
        />
        <h4 className="wtitle">
          THÔNG TIN BẢO HÀNH RĂNG SỨ
          <br />
          CÔNG TY TNHH TẤN DENTAL
        </h4>

        {/* Search form */}
        <form className="wsearch" onSubmit={handleSubmit}>
          <input
            type="text"
            className="wsearch-input"
            placeholder="Nhập mã tra cứu..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={loading}
            maxLength={30}
            autoComplete="off"
          />
          <div className="wsearch-btns">
            <button
              type="submit"
              className="wbtn wbtn-primary"
              disabled={loading || !inputCode.trim()}
            >
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Tra cứu'}
            </button>
            {(items.length > 0 || error) && (
              <button type="button" className="wbtn wbtn-secondary" onClick={handleClear}>
                Xóa
              </button>
            )}
          </div>
        </form>

        {loading && (
          <div className="wloading">
            <CircularProgress size={32} />
            <p>Đang tra cứu...</p>
          </div>
        )}

        {!loading && error && (
          <div className="werror">
            <p>❌ {error}</p>
            <span>Vui lòng kiểm tra lại mã và thử lại.</span>
          </div>
        )}

        {!loading && searched && !error && items.length === 0 && (
          <div className="werror">
            <p>❌ Không tìm thấy phiếu bảo hành</p>
            <span>Vui lòng kiểm tra lại mã của bạn.</span>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="wcards">
            {items.map((w) => (
              <div className="warranty-card" key={w._id}>
                {/* Header */}
                <div className="wc-header">
                  <div className="wc-title">PHIẾU BẢO HÀNH RĂNG SỨ</div>
                  <div className="wc-sub">Dental Warranty Certificate</div>
                  <div className="wc-code">Mã: {w.code}</div>
                </div>

                {/* Thông tin bệnh nhân */}
                <Row label="Bệnh nhân" value={w.patientname} />
                <Row label="Nha khoa" value={w.companyname} />
                <Row label="Bác sĩ" value={w.doctorname} />

                {/* Thông tin sản phẩm */}
                <Row label="Loại răng" value={w.itemname} />
                <Row label="Số lượng" value={w.itemquantity ? `${w.itemquantity} răng` : null} />

                {/* Ghi chú từ đơn hàng */}
                {w.estimate?.message && (
                  <Row label="Ghi chú" value={w.estimate.message} />
                )}

                {/* Thời hạn bảo hành */}
                <div className="wc-section wc-highlight">
                  <div className="wc-row">
                    <span className="wc-label">Ngày bảo hành</span>
                    <span className="wc-value">{fmtDate(w.warrantydate)}</span>
                  </div>
                </div>

                <div className="wc-section wc-expire">
                  <div className="wc-row">
                    <span className="wc-label">Hết hạn</span>
                    <span className="wc-value wc-expire-val">{fmtDate(w.deliverydate)}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="wc-footer">
                  <span>Được bảo hành bởi <b>CÔNG TY TNHH TẤN DENTAL</b></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .wbody {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #6d9eeb 0%, #8e7cc3 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 24px 12px 40px;
          box-sizing: border-box;
        }
        .wcontainer {
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          width: 100%;
          max-width: 520px;
          padding: 32px 20px 28px;
          box-sizing: border-box;
          text-align: center;
        }
        .wlogo {
          max-width: 90px;
          margin: 0 auto 16px;
          display: block;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        .wtitle {
          color: #1a1a2e;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.6;
          margin: 0 0 24px;
          letter-spacing: 0.3px;
        }
        .wloading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #555;
          margin: 20px 0;
        }
        .werror {
          background: #fff3cd;
          color: #856404;
          padding: 16px;
          border-radius: 10px;
          border: 1px solid #ffeeba;
          text-align: center;
          margin-top: 8px;
        }
        .werror p { margin: 0 0 4px; font-weight: 700; font-size: 15px; }
        .werror span { font-size: 13px; }
        .wcards { display: flex; flex-direction: column; gap: 20px; margin-top: 4px; text-align: left; }

        /* Card */
        .warranty-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
          overflow: hidden;
          border: 1px solid #e8eaf0;
        }
        .wc-header {
          background: linear-gradient(135deg, #0d6efd 0%, #4f8df7 100%);
          color: #fff;
          padding: 18px 20px 14px;
          text-align: center;
        }
        .wc-title { font-size: 17px; font-weight: 700; letter-spacing: 0.4px; }
        .wc-sub { font-size: 12px; opacity: 0.85; margin-top: 3px; font-style: italic; }
        .wc-code {
          display: inline-block;
          margin-top: 10px;
          background: rgba(255,255,255,0.22);
          border: 1px solid rgba(255,255,255,0.45);
          border-radius: 20px;
          padding: 4px 16px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .wc-section {
          padding: 12px 18px;
          border-bottom: 1px solid #f0f2f7;
        }
        .wc-section:last-of-type { border-bottom: none; }
        .wc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }
        .wc-label {
          display: inline-flex;
          align-items: center;
          background: #eef2ff;
          color: #3563e9;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 11px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .wc-value {
          font-size: 14px;
          color: #111;
          font-weight: 600;
          text-align: right;
          text-transform: uppercase;
          word-break: break-word;
        }
        .wc-highlight { background: #f5f8ff; }
        .wc-expire { background: #fff8f0; }
        .wc-expire-val { color: #c0392b !important; }

        .wc-footer {
          background: #f8fff8;
          border-top: 1px dashed #c3e6cb;
          padding: 12px 18px;
          text-align: center;
          font-size: 12.5px;
          color: #2d7a3a;
        }

        /* Search form */
        .wsearch { margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; }
        .wsearch-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 17px;
          border: 2px solid #0d6efd;
          border-radius: 10px;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }
        .wsearch-input:focus { border-color: #0a4fc4; }
        .wsearch-input:disabled { background: #f5f5f5; }
        .wsearch-btns { display: flex; gap: 10px; justify-content: center; }
        .wbtn {
          padding: 11px 28px;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background 0.2s, opacity 0.2s;
        }
        .wbtn:disabled { opacity: 0.55; cursor: not-allowed; }
        .wbtn-primary { background: #0d6efd; color: #fff; }
        .wbtn-primary:hover:not(:disabled) { background: #0a58ca; }
        .wbtn-secondary { background: #6c757d; color: #fff; }
        .wbtn-secondary:hover { background: #5a6268; }

        @media (max-width: 480px) {
          .wcontainer { padding: 24px 12px 20px; }
          .wc-label { font-size: 11px; padding: 4px 9px; }
          .wc-value { font-size: 13px; }
          .wc-title { font-size: 15px; }
        }
      `}</style>
    </div>
  );
};

export default CheckPhieuBaoHanhPage;
