import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
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

  const [form, setForm] = useState({
    Email: "",
    Password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Nếu đã đăng nhập → redirect tới dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
    setErrorMsg("");
  };

  const handleLogin = async () => {
    // Validation
    if (!form.Email.trim()) {
      setErrorMsg("Vui lòng nhập Email hoặc Mã nhân viên");
      return;
    }
    if (!form.Password.trim()) {
      setErrorMsg("Vui lòng nhập Mật khẩu");
      return;
    }

    try {
      // Gửi login request
      const result = await dispatch(login(form)).unwrap();
      console.log("✅ Đăng nhập thành công:", result);
      // Redux sẽ xử lý redirect qua useEffect
    } catch (err) {
      console.log("❌ Lỗi đăng nhập:", err);
      setErrorMsg(err || "Đăng nhập thất bại");
    }
  };

  // Enter để đăng nhập
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Paper
        elevation={6}
        className="
          w-full
          max-w-5xl
          min-h-[600px]
          md:min-h-[500px]
          flex
          flex-col
          md:flex-row
          rounded-2xl
          overflow-hidden
        "
      >
        {/* LEFT - LOGO */}
        <div
          className="
            w-full
            md:w-1/2
            flex
            flex-col
            items-center
            justify-center
            bg-gradient-to-b
            from-blue-50
            to-gray-50
            px-6
            py-12
          "
        >
          <div className="text-center">
            <div
              className="
                text-4xl
                sm:text-5xl
                md:text-6xl
                font-bold
                mb-4
              "
            >
              <span className="text-blue-500">Dental</span>
              <span className="text-yellow-500">SO</span>
            </div>

            <p
              className="
                text-gray-600
                text-sm
                sm:text-base
                font-medium
              "
            >
              Hệ thống quản lý nha khoa hiện đại
            </p>
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div
          className="
            w-full
            md:w-1/2
            flex
            flex-col
            items-center
            justify-center
            px-6
            sm:px-10
            md:px-12
            py-10
          "
        >
          <div className="w-full max-w-sm">
            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                mb-6
                sm:mb-8
                text-gray-800
                text-center
                md:text-left
              "
            >
              Đăng nhập
            </h2>

            {/* ERROR MESSAGE */}
            {(errorMsg || error) && (
              <Alert severity="error" className="mb-4">
                {errorMsg || error}
              </Alert>
            )}

            {/* EMAIL INPUT */}
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              placeholder="Nhập Email hoặc Mã nhân viên"
              value={form.Email}
              onChange={(e) => handleChange("Email", e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              size="small"
            />

            {/* PASSWORD INPUT */}
            <TextField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              placeholder="Nhập mật khẩu"
              value={form.Password}
              onChange={(e) => handleChange("Password", e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
              size="small"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* LOGIN BUTTON */}
            <Button
              variant="contained"
              fullWidth
              className="
                mt-6
                rounded-full
                py-3
                !bg-cyan-500
                hover:!bg-cyan-600
                text-white
                font-semibold
                h-[45px]
              "
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </div>
        </div>
      </Paper>
    </div>
  );
}
