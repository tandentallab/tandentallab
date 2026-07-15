import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const EXTERNAL_API =
  'https://sapi.dentalso.com/api/p1/warranty/66022d6a6293fefc6c2e92c3/code';
const QR_API =
  'https://sapi.dentalso.com/api/p1/warranty/66022d6a6293fefc6c2e92c3/qrcode';

const FULL_ORDER = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];

const fmtDate = (iso) => {
  if (!iso) return 'Không rõ';
  return new Date(iso).toLocaleDateString('vi-VN');
};

const TeethGrid = ({ positionString }) => {
  const selected = positionString?.match(/\d{2}/g)?.map(Number) || [];
  return (
    <div className="tooth-grid">
      {FULL_ORDER.map((t) => (
        <span key={t} className={`tooth-chip${selected.includes(t) ? '' : ' inactive'}`}>
          {t}
        </span>
      ))}
    </div>
  );
};

const CheckPhieuBaoHanhCuPage = () => {
  const [searchParams] = useSearchParams();
  const [inputCode, setInputCode] = useState('');
  const [result, setResult] = useState(null);   // single item
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isZalo = /Zalo/i.test(navigator.userAgent);
    if (isZalo) document.documentElement.classList.add('zalo-browser');
    return () => document.documentElement.classList.remove('zalo-browser');
  }, []);

  useEffect(() => {
    const code = searchParams.get('qrcode');
    if (code?.trim()) {
      const val = code.trim().toUpperCase();
      setInputCode(val);
      fetchWarranty(val);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputCode.trim().toUpperCase();
    if (!val) return;

    // Validate: QR = 4 ký tự chữ/số, code = 8 chữ số
    if (!/^[A-Z0-9]{4}$/.test(val) && !/^\d{8}$/.test(val)) {
      setError('Mã không hợp lệ.\nQR: 4 ký tự chữ/số\nCode: 8 chữ số');
      setResult(null);
      return;
    }
    fetchWarranty(val);
  };

  const fetchWarranty = async (q) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const isQR = /^[A-Z0-9]{4}$/.test(q) && !/^\d+$/.test(q);
      const endpoint = isQR ? QR_API : EXTERNAL_API;
      const res = await axios.get(endpoint, { params: { q } });
      const data = res.data?.data || [];
      if (!data.length) {
        setError('Không có dữ liệu.');
      } else {
        setResult(data[0]);
      }
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Không tìm thấy mã bảo hành'
          : err.response?.data?.message || 'Lỗi kết nối. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .wbody {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #6d9eeb, #8e7cc3);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          margin: 0;
          padding: 30px 0 50px;
        }
        .wcontainer {
          background: rgba(255,255,255,.95);
          padding: 30px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,.15);
          width: 100%;
          max-width: 540px;
          text-align: center;
          margin: 0 12px;
        }
        .wlogo {
          max-width: 90px;
          margin-bottom: 12px;
        }
        .wtitle {
          color: #1a237e;
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 20px;
          line-height: 1.5;
        }
        .wsearch-input {
          width: 90%;
          padding: 11px 14px;
          font-size: 17px;
          border: 2px solid #0066cc;
          border-radius: 8px;
          outline: none;
          text-transform: uppercase;
        }
        .wbtn {
          margin-top: 14px;
          padding: 11px 28px;
          font-size: 17px;
          background: #0066cc;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .wbtn:hover { background: #004a99; }
        .wbtn:disabled { background: #b0bec5; cursor: default; }
        .wloading {
          color: #ff4500;
          font-weight: bold;
          margin-top: 20px;
        }
        .werror {
          color: red;
          margin-top: 18px;
          white-space: pre-line;
        }

        /* ===== WARRANTY CARD ===== */
        .warranty-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 12px 30px rgba(0,0,0,.15);
          overflow: hidden;
          font-size: 15px;
          margin-top: 22px;
          text-align: left;
        }
        .wc-header {
          background: linear-gradient(135deg, #0d6efd, #4f8df7);
          color: white;
          padding: 18px;
          text-align: center;
        }
        .wc-title { font-size: 17px; font-weight: 700; }
        .wc-sub { font-size: 13px; opacity: .85; }

        .wc-section { padding: 18px 20px; }
        .wc-section + .wc-section { border-top: 1px solid #e6e6e6; }
        .wc-highlight { background: #f8faff; }

        .wc-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 12px;
          align-items: stretch;
        }
        .wc-label {
          display: flex;
          align-items: center;
          padding: 7px 10px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          color: #333;
        }
        .wc-value {
          font-size: 13px;
          color: #000;
          font-weight: 700;
          text-transform: uppercase;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .wc-full { align-items: flex-start; }

        /* ===== TOOTH GRID ===== */
        .tooth-grid {
          display: grid;
          grid-template-columns: repeat(16, 1fr);
          gap: 5px;
          width: 100%;
          margin-top: 6px;
        }
        .tooth-chip {
          display: block;
          text-align: center;
          font-size: 12px;
          font-weight: 600;
          color: #0b4dbb;
          background: #dbeafe;
          border-radius: 6px;
          padding: 5px 0;
          line-height: 1;
        }
        .tooth-chip.inactive {
          background: #e5e7eb;
          color: #9ca3af;
        }

        @media (max-width: 600px) {
          .wc-row { grid-template-columns: 108px 1fr; }
          .wc-label { font-size: 12px; padding: 6px 8px; }
          .tooth-chip { font-size: 9px; padding: 4px 0; }
          .zalo-browser .tooth-chip {
            display: inline-block !important;
            margin: 2px 1px;
          }
          .zalo-browser .tooth-grid {
            grid-template-columns: repeat(16, 1fr);
            gap: 2px;
          }
        }
      `}</style>

      <div className="wbody">
        <div className="wcontainer">
          <h4 className="wtitle">
            THÔNG TIN BẢO HÀNH RĂNG SỨ<br />
            DENTAL LAB
          </h4>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="wsearch-input"
              placeholder="Nhập mã bảo hành..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={8}
              autoComplete="off"
            />
            <br />
            <button type="submit" className="wbtn" disabled={loading || !inputCode.trim()}>
              Tra cứu
            </button>
          </form>

          {loading && <p className="wloading">Đang tra cứu...</p>}

          {!loading && error && <div className="werror">{error}</div>}

          {!loading && result && (
            <div className="warranty-card">
              <div className="wc-header">
                <div className="wc-title">PHIẾU BẢO HÀNH RĂNG SỨ</div>
                <div className="wc-sub">Dental Warranty Certificate</div>
              </div>

              <div className="wc-section">
                <div className="wc-row">
                  <span className="wc-label">👤 Khách hàng</span>
                  <span className="wc-value">{result.patientname ?? 'Không rõ'}</span>
                </div>
              </div>

              <div className="wc-section">
                <div className="wc-row">
                  <span className="wc-label">🏥 Nha khoa</span>
                  <span className="wc-value">{result.companyname ?? 'Không rõ'}</span>
                </div>
              </div>

              <div className="wc-section">
                <div className="wc-row">
                  <span className="wc-label">🦷 Loại răng</span>
                  <span className="wc-value">Sứ {result.itemname ?? 'Không rõ'}</span>
                </div>
              </div>

              <div className="wc-section">
                <div className="wc-row wc-full">
                  <span className="wc-label">📍 Vị trí răng</span>
                  <TeethGrid positionString={result.itemdescription} />
                </div>
              </div>

              <div className="wc-section">
                <div className="wc-row">
                  <span className="wc-label">🔢 Số lượng</span>
                  <span className="wc-value">{result.itemquantity ?? 'Không rõ'} Răng</span>
                </div>
              </div>

              <div className="wc-section wc-highlight">
                <div className="wc-row">
                  <span className="wc-label">🗓 Ngày làm</span>
                  <span className="wc-value">{fmtDate(result.warrantydate)}</span>
                </div>
              </div>

              <div className="wc-section">
                <div className="wc-row">
                  <span className="wc-label">⏳ Ngày hết hạn</span>
                  <span className="wc-value">{fmtDate(result.deliverydate)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckPhieuBaoHanhCuPage;

