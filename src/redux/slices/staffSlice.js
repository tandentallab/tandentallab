import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= GET ALL ================= */
export const fetchStaff = createAsyncThunk(
  "staff/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/staff");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Lỗi tải dữ liệu"
      );
    }
  }
);

/* ================= CREATE ================= */
export const createStaff = createAsyncThunk(
  "staff/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/staff/register", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Tạo thất bại"
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateStaff = createAsyncThunk(
  "staff/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/staff/${id}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cập nhật thất bại"
      );
    }
  }
);

/* ================= DELETE ================= */
export const deleteStaff = createAsyncThunk(
  "staff/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/staff/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Xóa thất bại"
      );
    }
  }
);

/* ================= SLICE ================= */

const staffSlice = createSlice({
  name: "staff",

  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ===== FETCH ===== */
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== CREATE ===== */
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload.staff);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== UPDATE ===== */
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex(
          (s) => s._id === action.payload.staff._id
        );
        if (index !== -1) {
          state.data[index] = action.payload.staff;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== DELETE ===== */
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default staffSlice.reducer;
