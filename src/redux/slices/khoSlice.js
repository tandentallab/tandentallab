// redux/slices/khoSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

// ===== THUNKS =====
export const fetchNhaCungCap = createAsyncThunk(
  "kho/fetchNhaCungCap",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/nha-cung-cap");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải nhà cung cấp");
    }
  }
);

export const fetchVatLieu = createAsyncThunk(
  "kho/fetchVatLieu",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/vat-lieu");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải vật liệu");
    }
  }
);

// ===== SLICE =====
const khoSlice = createSlice({
  name: "kho",
  initialState: {
    nhaCungCap: [],
    vatLieu: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // NhaCungCap
    builder
      .addCase(fetchNhaCungCap.pending, (state) => { state.loading = true; })
      .addCase(fetchNhaCungCap.fulfilled, (state, action) => {
        state.loading = false;
        state.nhaCungCap = action.payload;
      })
      .addCase(fetchNhaCungCap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    // VatLieu
    builder
      .addCase(fetchVatLieu.pending, (state) => { state.loading = true; })
      .addCase(fetchVatLieu.fulfilled, (state, action) => {
        state.loading = false;
        state.vatLieu = action.payload;
      })
      .addCase(fetchVatLieu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default khoSlice.reducer;
