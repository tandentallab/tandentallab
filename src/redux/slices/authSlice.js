import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {api} from "../../config/api";

/* ================= LOGIN ================= */

export const login = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/staff/login", data);

      // Lưu token
      localStorage.setItem("token", res.data.token);
      
      // Lưu user info (backup)
      localStorage.setItem("currentUser", JSON.stringify(res.data.staff));

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Đăng nhập thất bại"
      );
    }
  }
);

/* ================= RESTORE AUTH (Khi app load) ================= */

export const restoreAuth = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      
      // Nếu không có token → không cần restore
      if (!token) {
        return null;
      }

      // Gọi API để lấy thông tin user hiện tại (từ token)
      const res = await api.get("/staff/me");

      // Nếu thành công → token còn hợp lệ, lưu user info
      if (res.data?.staff) {
        localStorage.setItem("currentUser", JSON.stringify(res.data.staff));
      }

      return { token, staff: res.data.staff || null };
    } catch (err) {
      // Token hết hạn hoặc invalid → xóa token
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      return null;
    }
  }
);

/* ================= LOGOUT ================= */

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
});

/* ================= SLICE ================= */

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    token: null,
    loading: true, // Set thành true để show loading khi app start
    error: null,
    isAuthenticated: false,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ===== LOGIN ===== */
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.staff;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== LOGOUT ===== */
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      /* ===== RESTORE AUTH ===== */
      .addCase(restoreAuth.pending, (state) => {
        state.loading = true;
      })

      .addCase(restoreAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.staff;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })

      .addCase(restoreAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;