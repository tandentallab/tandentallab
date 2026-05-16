import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export const createPhieuBaoHanh = createAsyncThunk(
  "phieuBaoHanh/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/phieu-bao-hanh", data);
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tạo phiếu");
    }
  }
);

export const fetchPhieuBaoHanhByDonHang = createAsyncThunk(
  "phieuBaoHanh/fetchByDonHang",
  async (donHangId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/phieu-bao-hanh/don-hang/${donHangId}`);
      return res.data?.data || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi lấy danh sách");
    }
  }
);

export const updatePhieuBaoHanh = createAsyncThunk(
  "phieuBaoHanh/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/phieu-bao-hanh/${id}`, data);
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi cập nhật");
    }
  }
);

export const deletePhieuBaoHanh = createAsyncThunk(
  "phieuBaoHanh/delete",
  async (id, { rejectWithValue }) => {
    try {
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi xóa");
    }
  }
);

const phieuBaoHanhSlice = createSlice({
  name: "phieuBaoHanh",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPhieuBaoHanh.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPhieuBaoHanh.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createPhieuBaoHanh.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPhieuBaoHanhByDonHang.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPhieuBaoHanhByDonHang.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchPhieuBaoHanhByDonHang.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePhieuBaoHanh.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) {
          state.list[idx] = action.payload;
        }
      })
      .addCase(deletePhieuBaoHanh.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
      });
  },
});

export default phieuBaoHanhSlice.reducer;
