import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= GET ALL ================= */
export const fetchNhanVien = createAsyncThunk(
  "nhanVien/fetchNhanVien",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/nhan-vien");
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

/* ================= CREATE ================= */
export const createNhanVien = createAsyncThunk(
  "nhanVien/createNhanVien",
  async (data, thunkAPI) => {
    try {
      const res = await api.post("/nhan-vien", data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

/* ================= UPDATE ================= */
export const updateNhanVien = createAsyncThunk(
  "nhanVien/updateNhanVien",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await api.put(`/nhan-vien/${id}`, data);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

/* ================= DELETE ================= */
export const deleteNhanVien = createAsyncThunk(
  "nhanVien/deleteNhanVien",
  async (id, thunkAPI) => {
    try {
      await api.delete(`/nhan-vien/${id}`);
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);

const nhanVienSlice = createSlice({
  name: "nhanVien",
  initialState: {
    data: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ================= */
      .addCase(fetchNhanVien.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchNhanVien.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchNhanVien.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ================= CREATE ================= */
      .addCase(createNhanVien.fulfilled, (state, action) => {
        state.data.unshift(action.payload);
      })

      /* ================= UPDATE ================= */
      .addCase(updateNhanVien.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })

      /* ================= DELETE ================= */
      .addCase(deleteNhanVien.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (item) => item._id !== action.payload
        );
      });
  },
});

export default nhanVienSlice.reducer;