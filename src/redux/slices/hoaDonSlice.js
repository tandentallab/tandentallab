import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";
import { toast } from "sonner";

/* ================= ASYNC THUNKS ================= */

// 🔥 Lấy ngày xuất hóa đơn gần nhất của tất cả nha khoa
export const fetchNgayXuatHoaDonGanNhatAll = createAsyncThunk(
  "hoaDon/fetchNgayXuatHoaDonGanNhatAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/hoa-don/ngay-gan-nhat-all");
      return res.data; // Trả về toàn bộ object gồm { success, total, data }
    } catch (err) {
      return rejectWithValue(
        err.response?.data || err.message
      );
    }
  }
);

// 🔥 Lấy đơn hàng chưa xuất hóa đơn (Hỗ trợ kèm ngày tháng chốt sổ)
export const fetchDonHangChuaHoaDon = createAsyncThunk(
  "hoaDon/fetchDonHangChuaHoaDon",
  async (payload, { rejectWithValue }) => {
    try {
      // Kiểm tra xem payload truyền vào là một chuỗi (ID) hay là một object chứa nhiều tham số
      const isObject = typeof payload === "object" && payload !== null;
      const nhaKhoaId = isObject ? payload.nhaKhoaId : payload;

      // Nếu là object, bóc tách tuNgay và denNgay ra làm params
      const params = isObject
        ? { tuNgay: payload.tuNgay, denNgay: payload.denNgay }
        : {};

      const res = await api.get(`/hoa-don/don-hang-chua-xuat/${nhaKhoaId}`, { params });

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi khi tải danh sách đơn hàng");
    }
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
      loaiHan, // 🔥 1. Đón lấy loaiHan từ component gửi sang
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
        loaiHan, // 🔥 2. Gắn vào URL params ném xuống cho Backend
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

export const fetchHoaDonById = createAsyncThunk(
  "hoaDon/fetchById",

  async (id) => {
    console.log("FETCH ID:", id);

    const url = `/hoa-don/${id}`;
    console.log("URL:", url);

    const res = await api.get(url);

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

    ngayXuatHoaDonGanNhatAll: [],

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

          const ids = action.meta.arg.danhSachDonHangIds;

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


          if (
            state.chiTietHoaDon?._id ===
            updatedHoaDon._id
          ) {
            state.chiTietHoaDon =
              updatedHoaDon;
          }

        }
      )

      .addCase(
        updateHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
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
        }
      )

      .addCase(
        thanhToanHoaDon.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload?.message ||
            action.error.message;
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
        }
      )

      .addCase(
        deleteHoaDon.rejected,
        (state, action) => {
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
      )

      .addCase(fetchNgayXuatHoaDonGanNhatAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNgayXuatHoaDonGanNhatAll.fulfilled, (state, action) => {
        state.loading = false;
        state.ngayXuatHoaDonGanNhatAll = action.payload.data; // Lưu mảng kết quả từ API vào state
      })
      .addCase(fetchNgayXuatHoaDonGanNhatAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.error.message;
      })
  },
});

export const {
  clearChiTietHoaDon,
} = slice.actions;

export default slice.reducer;