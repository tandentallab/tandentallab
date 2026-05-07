import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= ASYNC THUNKS ================= */

// 🔥 Lấy đơn hàng chưa xuất hóa đơn
export const fetchDonHangChuaHoaDon = createAsyncThunk(
  "hoaDon/fetchDonHangChuaHoaDon",
  async (nhaKhoaId) => {
    const res = await api.get(
      `/hoa-don/don-hang-chua-xuat/${nhaKhoaId}`
    );

    return res.data;
  }
);

// 🔥 Admin lấy tất cả hóa đơn
export const fetchAllHoaDonAdmin = createAsyncThunk(
  "hoaDon/fetchAllAdmin",

  async ({ page, search, trangThai } = {}) => {
    const res = await api.get(`/hoa-don/all`, {
      params: {
        page,
        search,
        trangThai,
      },
    });

    return res.data;
  }
);

// 🔥 Lấy hóa đơn theo nha khoa
export const fetchHoaDonByNhaKhoa = createAsyncThunk(
  "hoaDon/fetchByNhaKhoa",

  async (nhaKhoaId) => {
    const res = await api.get(
      `/hoa-don/nha-khoa/${nhaKhoaId}`
    );

    return res.data;
  }
);

// 🔥 Lấy chi tiết hóa đơn theo ID
export const fetchHoaDonById = createAsyncThunk(
  "hoaDon/fetchById",

  async (id) => {
    const res = await api.get(`/hoa-don/${id}`);

    return res.data;
  }
);

// 🔥 Tạo hóa đơn
export const createHoaDon = createAsyncThunk(
  "hoaDon/create",

  async (payload) => {
    const res = await api.post(
      `/hoa-don`,
      payload
    );

    return res.data;
  }
);

// 🔥 Update hóa đơn
export const updateHoaDon = createAsyncThunk(
  "hoaDon/update",

  async ({ id, data }) => {
    const res = await api.put(
      `/hoa-don/${id}`,
      data
    );

    return res.data;
  }
);

// 🔥 Xóa hóa đơn
export const deleteHoaDon = createAsyncThunk(
  "hoaDon/delete",

  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/hoa-don/${id}`
      );

      return {
        id,
        ...res.data,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

/* ================= SLICE ================= */

const slice = createSlice({
  name: "hoaDon",

  initialState: {
    donHangs: [],

    danhSachHoaDon: [],

    // 🔥 CHI TIẾT HÓA ĐƠN
    chiTietHoaDon: null,

    pagination: {},

    loading: false,

    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      /* ================= ĐƠN HÀNG CHƯA XUẤT HÓA ĐƠN ================= */

      .addCase(
        fetchDonHangChuaHoaDon.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchDonHangChuaHoaDon.fulfilled,
        (state, action) => {
          state.loading = false;

          state.donHangs =
            action.payload;
        }
      )

      /* ================= LẤY CHI TIẾT HÓA ĐƠN ================= */

      .addCase(
        fetchHoaDonById.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchHoaDonById.fulfilled,
        (state, action) => {
          state.loading = false;

          state.chiTietHoaDon =
            action.payload.data;
        }
      )

      .addCase(
        fetchHoaDonById.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.error.message;
        }
      )

      /* ================= TẠO HÓA ĐƠN ================= */

      .addCase(
        createHoaDon.fulfilled,
        (state, action) => {
          alert("Tạo hóa đơn thành công");

          const createdOrders =
            action.meta.arg
              .danhSachDonHang;

          const ids = createdOrders.map(
            (item) => item.donHangId
          );

          // 🔥 Xóa các đơn hàng đã chọn khỏi danh sách chờ
          state.donHangs =
            state.donHangs.filter(
              (dh) =>
                !ids.includes(dh._id)
            );

          if (action.payload.success) {
            state.danhSachHoaDon.unshift(
              action.payload.data
            );
          }
        }
      )

      /* ================= UPDATE HÓA ĐƠN ================= */

      .addCase(
        updateHoaDon.fulfilled,
        (state, action) => {
          const index =
            state.danhSachHoaDon.findIndex(
              (hd) =>
                hd._id ===
                action.payload.data._id
            );

          if (index !== -1) {
            state.danhSachHoaDon[index] =
              action.payload.data;
          }

          // 🔥 Update luôn chi tiết hóa đơn nếu đang mở
          if (
            state.chiTietHoaDon?._id ===
            action.payload.data._id
          ) {
            state.chiTietHoaDon =
              action.payload.data;
          }

          alert("Cập nhật thành công");
        }
      )

      /* ================= ADMIN LẤY TẤT CẢ HÓA ĐƠN ================= */

      .addCase(
        fetchAllHoaDonAdmin.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchAllHoaDonAdmin.fulfilled,
        (state, action) => {
          state.loading = false;

          state.danhSachHoaDon =
            action.payload.data;

          state.pagination = {
            total: action.payload.total,

            totalPages:
              action.payload.totalPages,

            currentPage:
              action.payload.currentPage,
          };
        }
      )

      /* ================= XÓA HÓA ĐƠN ================= */

      .addCase(
        deleteHoaDon.fulfilled,
        (state, action) => {
          const id = action.payload.id;

          state.danhSachHoaDon =
            state.danhSachHoaDon.filter(
              (hd) => hd._id !== id
            );

          // 🔥 Reset chi tiết nếu đang xem
          if (
            state.chiTietHoaDon?._id === id
          ) {
            state.chiTietHoaDon =
              null;
          }

          alert("Xóa hóa đơn thành công");
        }
      )

      .addCase(
        deleteHoaDon.rejected,
        (state, action) => {
          alert(
            action.payload?.message ||
              "Xóa thất bại"
          );
        }
      );
  },
});

export default slice.reducer;