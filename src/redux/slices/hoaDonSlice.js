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

// 🔥 Lấy đơn hàng chưa xuất hóa đơn - tất cả nha khoa
export const fetchDonHangChuaHoaDonAll = createAsyncThunk(
  "hoaDon/fetchDonHangChuaHoaDonAll",
  async () => {
    const res = await api.get(
      `/hoa-don/don-hang-chua-xuat/all`
    );

    return res.data;
  }
);

// 🔥 Admin lấy tất cả hóa đơn
export const fetchAllHoaDonAdmin = createAsyncThunk(
  "hoaDon/fetchAllAdmin",

  async (
    {
      page,
      limit,
      nhaKhoaId,
      search,
      trangThai,
      fromDate,
      toDate,
    } = {}
  ) => {
    const res = await api.get(`/hoa-don/all`, {
      params: {
        page,
        limit,
        nhaKhoaId,
        search,
        trangThai,
        fromDate,
        toDate,
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

  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/hoa-don`,
        payload
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

// 🔥 Update hóa đơn
export const updateHoaDon = createAsyncThunk(
  "hoaDon/update",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        `/hoa-don/${id}`,
        data
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
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

// 🔥 Thanh toán hóa đơn
export const thanhToanHoaDon = createAsyncThunk(
  "hoaDon/thanhToan",

  async (
    { id, soTienThanhToan },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post(
        `/hoa-don/${id}/thanh-toan`,
        {
          soTienThanhToan,
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

// 🔥 Thống kê công nợ hóa đơn
export const fetchThongKeCongNoHoaDon =
  createAsyncThunk(
    "hoaDon/fetchThongKeCongNo",

    async (nhaKhoaId) => {
      const res = await api.get(
        `/hoa-don/thong-ke-cong-no`,
        {
          params: {
            nhaKhoaId,
          },
        }
      );

      return res.data;
    }
  );

/* ================= ĐẾM ĐƠN HÀNG CHƯA XUẤT HÓA ĐƠN ================= */

export const fetchCountDonHangChuaXuat =
  createAsyncThunk(
    "hoaDon/fetchCountDonHangChuaXuat",

    async (_, { rejectWithValue }) => {
      try {
        const res = await api.get(
          "/hoa-don/count-don-hang-chua-xuat"
        );

        return res.data.data;
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

    thongKeCongNo: {
      conNo: {
        soHoaDon: 0,
        tongTien: 0,
      },

      treHan: {
        soHoaDon: 0,
        tongTien: 0,
      },

      chuaDenHan: {
        soHoaDon: 0,
        tongTien: 0,
      },
    },

    countDonHangChuaXuat: [],

    pagination: {},

    loading: false,

    error: null,
  },

  reducers: {
    clearChiTietHoaDon: (state) => {
      state.chiTietHoaDon = null;
    },
  },

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

      .addCase(
        fetchDonHangChuaHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
        }
      )

      /* ================= ĐƠN HÀNG CHƯA XUẤT HÓA ĐƠN - TẤT CẢ NHA KHOA ================= */

      .addCase(
        fetchDonHangChuaHoaDonAll.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchDonHangChuaHoaDonAll.fulfilled,
        (state, action) => {
          state.loading = false;

          state.donHangs =
            action.payload;
        }
      )

      .addCase(
        fetchDonHangChuaHoaDonAll.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
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
            action.payload?.message ||
            action.error.message;
        }
      )

      /* ================= TẠO HÓA ĐƠN ================= */

      .addCase(
        createHoaDon.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        createHoaDon.fulfilled,
        (state, action) => {
          state.loading = false;

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

      .addCase(
        createHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
        }
      )

      /* ================= UPDATE HÓA ĐƠN ================= */

      .addCase(
        updateHoaDon.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        updateHoaDon.fulfilled,
        (state, action) => {
          state.loading = false;

          const updatedHoaDon =
            action.payload.data;

          const index =
            state.danhSachHoaDon.findIndex(
              (hd) =>
                hd._id ===
                updatedHoaDon._id
            );

          if (index !== -1) {
            state.danhSachHoaDon[index] =
              updatedHoaDon;
          }

          // 🔥 Update luôn chi tiết hóa đơn nếu đang mở
          if (
            state.chiTietHoaDon?._id ===
            updatedHoaDon._id
          ) {
            state.chiTietHoaDon =
              updatedHoaDon;
          }

          alert("Cập nhật thành công");
        }
      )

      .addCase(
        updateHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;

          alert(
            action.payload?.message ||
              "Cập nhật thất bại"
          );
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

      .addCase(
        fetchAllHoaDonAdmin.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
        }
      )

      /* ================= THANH TOÁN HÓA ĐƠN ================= */

      .addCase(
        thanhToanHoaDon.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        thanhToanHoaDon.fulfilled,
        (state, action) => {
          state.loading = false;

          const updatedHoaDon =
            action.payload.data;

          // update list
          const index =
            state.danhSachHoaDon.findIndex(
              (hd) =>
                hd._id ===
                updatedHoaDon._id
            );

          if (index !== -1) {
            state.danhSachHoaDon[index] =
              updatedHoaDon;
          }

          // update detail
          if (
            state.chiTietHoaDon?._id ===
            updatedHoaDon._id
          ) {
            state.chiTietHoaDon =
              updatedHoaDon;
          }

          alert("Thanh toán thành công");
        }
      )

      .addCase(
        thanhToanHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;

          alert(
            action.payload?.message ||
              "Thanh toán thất bại"
          );
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
      )

      /* ================= THỐNG KÊ CÔNG NỢ ================= */

      .addCase(
        fetchThongKeCongNoHoaDon.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchThongKeCongNoHoaDon.fulfilled,
        (state, action) => {
          state.loading = false;

          state.thongKeCongNo =
            action.payload.data;
        }
      )

      .addCase(
        fetchThongKeCongNoHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.error.message;
        }
      )

      /* ================= ĐẾM ĐƠN HÀNG CHƯA XUẤT HÓA ĐƠN ================= */

      .addCase(
        fetchCountDonHangChuaXuat.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchCountDonHangChuaXuat.fulfilled,
        (state, action) => {
          state.loading = false;

          state.countDonHangChuaXuat =
            action.payload;
        }
      )

      .addCase(
        fetchCountDonHangChuaXuat.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
        }
      );
  },
});

export const {
  clearChiTietHoaDon,
} = slice.actions;

export default slice.reducer;