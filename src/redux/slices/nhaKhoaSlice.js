import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= API ================= */

// gọi API
export const fetchNhaKhoa = createAsyncThunk(
  "nhaKhoa/fetch",
  async () => {
    const res = await api.get("/nhakhoa");
    return res.data;
  }
);
export const createNhaKhoa = createAsyncThunk(
  "nhaKhoa/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/nhakhoa", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo thất bại"
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateNhaKhoa = createAsyncThunk(
  "nhaKhoa/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/nhakhoa/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);

/* ================= SLICE ================= */

const nhaKhoaSlice = createSlice({
  name: "nhaKhoa",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {
    addLocal: (state, action) => {
      state.data.unshift(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      //LAY DANH SACH NHA KHOA
      .addCase(fetchNhaKhoa.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNhaKhoa.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchNhaKhoa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      //TAO NHA KHOA
      .addCase(createNhaKhoa.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNhaKhoa.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
      })
      .addCase(createNhaKhoa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== UPDATE ===== */
      .addCase(updateNhaKhoa.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
  },
});

export const { addLocal } = nhaKhoaSlice.actions;
export default nhaKhoaSlice.reducer;