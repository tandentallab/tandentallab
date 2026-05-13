import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import { api } from "../../config/api";

/* ================= GET ALL ================= */

export const fetchBangLuong =
  createAsyncThunk(
    "bangLuong/fetchBangLuong",

    async (
      params = {},
      thunkAPI
    ) => {
      try {
        const res = await api.get(
          "/bang-luong",
          {
            params,
          }
        );

        return res.data.data;
      } catch (err) {
        return thunkAPI.rejectWithValue(
          err.response?.data
            ?.message || err.message
        );
      }
    }
  );

/* ================= DETAIL ================= */

export const fetchBangLuongDetail =
  createAsyncThunk(
    "bangLuong/fetchBangLuongDetail",

    async (id, thunkAPI) => {
      try {
        const res = await api.get(
          `/bang-luong/${id}`
        );

        return res.data.data;
      } catch (err) {
        return thunkAPI.rejectWithValue(
          err.response?.data
            ?.message || err.message
        );
      }
    }
  );

/* ================= CREATE OR UPDATE ================= */

export const createBangLuong =
  createAsyncThunk(
    "bangLuong/createBangLuong",

    async (data, thunkAPI) => {
      try {
        const res = await api.post(
          "/bang-luong",
          data
        );

        return res.data;
      } catch (err) {
        return thunkAPI.rejectWithValue(
          err.response?.data
            ?.message || err.message
        );
      }
    }
  );

/* ================= DELETE ================= */

export const deleteBangLuong =
  createAsyncThunk(
    "bangLuong/deleteBangLuong",

    async (id, thunkAPI) => {
      try {
        await api.delete(
          `/bang-luong/${id}`
        );

        return id;
      } catch (err) {
        return thunkAPI.rejectWithValue(
          err.response?.data
            ?.message || err.message
        );
      }
    }
  );

  /* ================= DELETE BY MONTH YEAR ================= */

export const deleteBangLuongByMonthYear =
  createAsyncThunk(
    "bangLuong/deleteBangLuongByMonthYear",

    async (
      { thang, nam },
      thunkAPI
    ) => {
      try {
        const res =
          await api.delete(
            "/bang-luong",
            {
              params: {
                thang,
                nam,
              },
            }
          );

        return {
          thang,
          nam,
          message:
            res.data.message,
        };
      } catch (err) {
        return thunkAPI.rejectWithValue(
          err.response?.data
            ?.message || err.message
        );
      }
    }
  );

const bangLuongSlice =
  createSlice({
    name: "bangLuong",

    initialState: {
      data: [],

      detail: null,

      loading: false,

      error: null,
    },

    reducers: {},

    extraReducers: (builder) => {
      builder

        /* ================= FETCH ================= */

     .addCase(fetchBangLuong.pending, (state) => {
  state.loading = true;

  state.error = null;

  state.data = [];
})

        .addCase(
          fetchBangLuong.fulfilled,
          (state, action) => {
            state.loading = false;

            state.data =
              action.payload;
          }
        )

        .addCase(
          fetchBangLuong.rejected,
          (state, action) => {
            state.loading = false;

            state.error =
              action.payload;
          }
        )

        /* ================= DETAIL ================= */

        .addCase(
          fetchBangLuongDetail.fulfilled,
          (state, action) => {
            state.detail =
              action.payload;
          }
        )

        /* ================= CREATE OR UPDATE ================= */

       .addCase(
  createBangLuong.fulfilled,
  (state, action) => {
    const payload = action.payload;

    const data = payload.data;

    const existingIndex =
      state.data.findIndex(
        (item) =>
          item._id === data._id
      );

    // đã tồn tại => update
    if (existingIndex !== -1) {
      state.data[existingIndex] =
        data;
    }

    // chưa tồn tại => thêm mới
    else {
      state.data.unshift(data);
    }

    state.detail = data;
  }
)

        /* ================= DELETE ================= */

        .addCase(
          deleteBangLuong.fulfilled,
          (state, action) => {
            state.data =
              state.data.filter(
                (item) =>
                  item._id !==
                  action.payload
              );
          }
        )

        /* ================= DELETE ALL BY MONTH YEAR ================= */

        .addCase(
  deleteBangLuongByMonthYear.fulfilled,
  (state) => {
    state.data = [];
  }
)
    },
  });

export default bangLuongSlice.reducer;