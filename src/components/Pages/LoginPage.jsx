import React, { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../redux/slices/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({ Email: "", Password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focused, setFocused] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrorMsg("");
  };

  const handleLogin = async () => {
    if (!form.Email.trim()) {
      setErrorMsg("Vui lòng nhập Email hoặc Mã nhân viên");
      return;
    }
    if (!form.Password.trim()) {
      setErrorMsg("Vui lòng nhập Mật khẩu");
      return;
    }
    try {
      const result = await dispatch(login(form)).unwrap();
      console.log("✅ Đăng nhập thành công:", result);
    } catch (err) {
      console.log("❌ Lỗi đăng nhập:", err);
      setErrorMsg(err || "Đăng nhập thất bại");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  console.log("form: ", form);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          /* 🌟 ĐÃ NÂNG CẤP: Nền chính chuyển sang dải gradient xanh ngọc/xám nhạt rất sang trọng */
          --ink: linear-gradient(135deg, #e8f0fe 0%, #dce5f9 100%); 
          
          /* 🌟 ĐÃ NÂNG CẤP: Nền Form trắng tinh khiết để tương phản tốt nhất */
          --surface: #ffffff; 
          
          /* 🌟 ĐÃ NÂNG CẤP: Nền Brand panel có gradient nhẹ để tạo chiều sâu 3D */
          --card: linear-gradient(180deg, #f4f7fb 0%, #e9edf5 100%); 
          
          --border: #e2e8f0;       /* Border mảnh tinh tế cho giao diện sáng */
          --border-focus: #3b82f6; /* Màu viền khi focus ô nhập liệu */
          --gold: #a16207;         /* Vàng kim sang trọng, đậm nét để tương phản tốt */
          --gold-light: #ca8a04;   
          --blue: #2563eb;         /* Xanh dương thương hiệu sắc nét */
          --text: #0f172a;         /* Chữ chính màu xám đen cao cấp */
          --muted: #64748b;        /* Chữ phụ, ghi chú */
          --error: #dc2626;        /* Màu thông báo lỗi đỏ rõ ràng */
        }

        .login-root {
          min-height: 100vh;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Ambient background cho nền sáng */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 15% 20%, rgba(59,130,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 80%, rgba(161,98,7,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Subtle grid cho nền sáng */
        .login-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(15,23,42,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .login-shell {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 960px;
          min-height: 580px;
          margin: 24px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          /* 🌟 ĐÃ NÂNG CẤP: Đổi màu shadow ánh xanh dương nhẹ & viền trắng mờ để tạo hiệu ứng khối nổi (Glassy) */
          box-shadow: 0 24px 60px rgba(29, 78, 216, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.8);
          opacity: 0;
          transform: translateY(24px);
          animation: reveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        @keyframes reveal {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── LEFT BRAND PANEL ── */
        .brand-panel {
          width: 44%;
          flex-shrink: 0;
          background: var(--card);
          border-right: 1px solid rgba(226, 232, 240, 0.6); /* Viền mờ đi một chút cho thanh thoát */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
        }

        .brand-panel::before {
          content: '';
          position: absolute;
          top: -80px; left: -80px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-panel::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -60px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(161,98,7,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-divider {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin: 18px auto;
        }

        .brand-logo-wrap {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .brand-logo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(59,130,246,0.12));
        }

        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          text-align: center;
          letter-spacing: 0.5px;
          position: relative;
          z-index: 1;
        }

        .brand-sub {
          font-size: 12px;
          font-weight: 400;
          color: var(--muted);
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 6px;
          position: relative;
          z-index: 1;
        }

        .brand-badge {
          margin-top: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 40px;
          background: rgba(161,98,7,0.06);
          border: 1px solid rgba(161,98,7,0.15);
          position: relative;
          z-index: 1;
        }

        .brand-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--gold);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .brand-badge-text {
          font-size: 11px;
          font-weight: 500;
          color: var(--gold);
          letter-spacing: 0.5px;
        }

        /* ── RIGHT FORM PANEL ── */
        .form-panel {
          flex: 1;
          background: var(--surface);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 52px;
        }

        .form-heading {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
          letter-spacing: -0.3px;
        }

        .form-sub {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 36px;
        }

        /* Error */
        .form-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(220,38,38,0.05);
          border: 1px solid rgba(220,38,38,0.15);
          color: var(--error);
          font-size: 13px;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        /* Field */
        .field-wrap {
          margin-bottom: 18px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          transition: color 0.2s;
        }

        .field-wrap.focused .field-label { color: var(--blue); }

        .field-input-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: #f8fafc;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          box-sizing: border-box;
        }

        .field-input::placeholder { color: rgba(100,116,139,0.5); }

        .field-input:focus {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.06);
          background: #ffffff;
        }

        .field-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .field-input.has-icon { padding-right: 46px; }

        .field-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
        }
        .field-eye-btn:hover { color: var(--text); }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
          pointer-events: none;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(59,130,246,0.25);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .form-footer {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--muted); }

        .footer-text {
          font-size: 11px;
          color: var(--muted);
          letter-spacing: 0.5px;
        }

        /* Mobile */
        @media (max-width: 680px) {
          .brand-panel { display: none; }
          .form-panel { padding: 40px 28px; }
          .login-shell { margin: 16px; min-height: unset; border-radius: 16px; }
          .form-heading { font-size: 26px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-shell">
          {/* ── LEFT: Brand ── */}
          <div className="brand-panel">
            <div className="brand-logo-wrap">
              <img src="/logo3.png" alt="Tấn Dental" />
            </div>
            <div className="brand-divider" />
            <div className="brand-title">Tấn Dental</div>
            <div className="brand-sub">Dental Laboratory</div>
            <div className="brand-badge">
              <div className="brand-badge-dot" />
              <span className="brand-badge-text">
                Hệ thống quản lý phòng lab
              </span>
            </div>
          </div>

          {/* ── RIGHT: Form ── */}
          <div className="form-panel">
            <h1 className="form-heading">Đăng nhập</h1>

            {/* Error */}
            {(errorMsg || error) && (
              <div className="form-error">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <path
                    d="M8 4.5v4M8 10.5v1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {errorMsg || error}
              </div>
            )}

            {/* Email */}
            <div
              className={`field-wrap ${focused === "email" ? "focused" : ""}`}
            >
              <label className="field-label">Email / Mã nhân viên</label>
              <div className="field-input-wrap">
                <input
                  className="field-input"
                  placeholder="Nhập email hoặc mã nhân viên"
                  value={form.Email}
                  onChange={e => {
                    const value = e.target.value;

                    setForm(prev => ({
                      ...prev,
                      Email: value,
                      MSNV: value
                    }));

                    setErrorMsg("");
                  }}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div
              className={`field-wrap ${focused === "password" ? "focused" : ""}`}
            >
              <label className="field-label">Mật khẩu</label>
              <div className="field-input-wrap">
                <input
                  className="field-input has-icon"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={form.Password}
                  onChange={(e) => handleChange("Password", e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="field-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: 18 }} />
                  ) : (
                    <Visibility sx={{ fontSize: 18 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              className="submit-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 8h10M8 4l4 4-4 4"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Đăng nhập
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
