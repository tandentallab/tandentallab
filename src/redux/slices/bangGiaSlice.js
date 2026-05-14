import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= API ================= */

// 📄 Lấy tất cả bảng giá từ tất cả nha khoa
export const fetchAllBangGia = createAsyncThunk(
  "bangGia/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bang-gia`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lấy bảng giá thất bại"
      );
    }
  }
);

// 📄 Lấy bảng giá theo nha khoa
export const fetchBangGiaByNhaKhoa = createAsyncThunk(
  "bangGia/fetchByNhaKhoa",
  async (nhaKhoaId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bang-gia/nha-khoa/${nhaKhoaId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lấy bảng giá thất bại"
      );
    }
  }
);

// ➕ Tạo / cập nhật giá riêng
export const upsertBangGia = createAsyncThunk(
  "bangGia/upsert",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(`/bang-gia`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cập nhật giá thất bại"
      );
    }
  }
);

// ❌ Xóa giá riêng (reset về giá chung)
export const deleteBangGia = createAsyncThunk(
  "bangGia/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/bang-gia/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Xóa giá thất bại"
      );
    }
  }
);

/* ================= SLICE ================= */

const bangGiaSlice = createSlice({
  name: "bangGia",
  initialState: {
    data: [], // danh sách bảng giá đã merge (đã fallback)
    loading: false,
    error: null,
  },

  reducers: {
    // update local nhanh (optional)
    updateLocalPrice: (state, action) => {
      const { sanPhamId, donGia } = action.payload;
      const item = state.data.find((i) => i.sanPhamId === sanPhamId);
      if (item) {
        item.donGia = donGia;
        item.laGiaRieng = true;
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ALL ================= */
      .addCase(fetchAllBangGia.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBangGia.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllBangGia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= FETCH ================= */
      .addCase(fetchBangGiaByNhaKhoa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBangGiaByNhaKhoa.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBangGiaByNhaKhoa.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= UPSERT ================= */
      .addCase(upsertBangGia.fulfilled, (state, action) => {
        const updated = action.payload;

        const index = state.data.findIndex(
          (item) => item.sanPhamId === updated.sanPhamId
        );

        if (index !== -1) {
          state.data[index].donGia = updated.donGia;
          state.data[index].laGiaRieng = true;
          state.data[index].bangGiaId = updated._id;
        }
      })

      .addCase(upsertBangGia.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ================= DELETE ================= */
      .addCase(deleteBangGia.fulfilled, (state, action) => {
        const id = action.payload;

        const item = state.data.find(
          (i) => i.bangGiaId === id
        );

        if (item) {
          item.laGiaRieng = false;
          item.bangGiaId = null;
          // ⚠️ không set lại donGia ở đây vì cần fetch lại hoặc giữ cache giá chung
        }
      })

      .addCase(deleteBangGia.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { updateLocalPrice } = bangGiaSlice.actions;
export default bangGiaSlice.reducer;