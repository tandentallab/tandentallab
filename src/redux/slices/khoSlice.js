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

export const addNhaCungCap = createAsyncThunk(
  "kho/addNhaCungCap",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/kho/nha-cung-cap", payload);
      return res.data; // { data: { _id, ten, ... } }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi thêm nhà cung cấp");
    }
  }
);

/**
 * fetchVatLieu — tải trang đầu (reset danh sách), dùng khi:
 * - mount component
 * - thay đổi filter / search
 * - refresh thủ công
 *
 * params: { page, limit, search, nhaCungCap, nhomVatLieu, trangThai }
 */
export const fetchVatLieu = createAsyncThunk(
  "kho/fetchVatLieu",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/vat-lieu", { params: { limit: 20, ...params, page: 1 } });
      // Server trả về { data: [...], pagination: { page, limit, total, totalPages, hasMore } }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải vật liệu");
    }
  }
);

/**
 * fetchVatLieuThongKe — tải số liệu thống kê (tổng vật liệu, số hàng thiếu
 * hàng) từ API riêng, tính trên TOÀN BỘ collection ở backend.
 * Không phụ thuộc vào danh sách vatLieu (vốn chỉ chứa dữ liệu đã lazy-load),
 * nên số liệu luôn chính xác bất kể người dùng đã cuộn/tải bao nhiêu trang.
 */
export const fetchVatLieuThongKe = createAsyncThunk(
  "kho/fetchVatLieuThongKe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/vat-lieu/thong-ke");
      return res.data; // { tongVatLieu, soHangThieuHang }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải thống kê vật liệu");
    }
  }
);

/**
 * fetchVatLieuTuyChon — tải danh sách giá trị duy nhất (nhóm/loại/form/màu)
 * từ API riêng, tính trên TOÀN BỘ collection ở backend.
 * Dùng cho dropdown lọc (filter bar) và SelectWithAdd trong modal thêm/sửa
 * vật liệu — không phụ thuộc vào mảng vatLieu (vốn chỉ chứa dữ liệu đã
 * lazy-load), tránh thiếu option của các vật liệu chưa được tải.
 */
export const fetchVatLieuTuyChon = createAsyncThunk(
  "kho/fetchVatLieuTuyChon",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/vat-lieu/tuy-chon");
      return res.data; // { nhomVatLieu, loaiVatLieu, formRang, mauRang }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải danh sách tùy chọn vật liệu");
    }
  }
);

/**
 * fetchVatLieuMore — tải thêm trang tiếp theo (append), dùng khi:
 * - người dùng kéo xuống cuối bảng (infinite scroll / lazy loading)
 *
 * params: { page, limit, search, nhaCungCap, nhomVatLieu, trangThai }
 */
export const fetchVatLieuMore = createAsyncThunk(
  "kho/fetchVatLieuMore",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/kho/vat-lieu", { params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi tải thêm vật liệu");
    }
  }
);

/**
 * deleteVatLieuMany — xóa nhiều vật liệu cùng lúc (bulk delete)
 * payload: { ids: string[] }
 */
export const deleteVatLieuMany = createAsyncThunk(
  "kho/deleteVatLieuMany",
  async (ids, { rejectWithValue }) => {
    try {
      const res = await api.delete("/kho/vat-lieu", { data: { ids } });
      return { ids, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Lỗi xóa vật liệu");
    }
  }
);

// ===== SLICE =====
const khoSlice = createSlice({
  name: "kho",
  initialState: {
    nhaCungCap: [],

    // ── Lazy-loading state ─────────────────────────────────────────────────
    vatLieu: [],           // danh sách đang hiển thị (accumulated)
    vatLieuPage: 0,        // trang hiện tại đã tải
    vatLieuTotal: 0,       // tổng số bản ghi khớp filter
    vatLieuHasMore: false, // còn trang tiếp không
    vatLieuLimit: 20,      // số bản ghi mỗi trang

    // ── Thống kê vật liệu — độc lập với danh sách lazy-load ────────────────
    vatLieuThongKe: {
      tongVatLieu: 0,
      soHangThieuHang: 0,
    },
    loadingThongKe: false,

    // ── Tùy chọn lọc/phân loại vật liệu — độc lập với danh sách lazy-load ──
    vatLieuTuyChon: {
      nhomVatLieu: [],
      loaiVatLieu: [],
      formRang: [],
      mauRang: [],
    },
    loadingTuyChon: false,

    loading: false,        // loading lần đầu / reset
    loadingMore: false,    // loading khi append thêm
    error: null,

    // ── Filter state — NhapXuatTable ───────────────────────────────────────
    nhapXuatFilters: {
      selectedMonth: "",
      selectedNCC: "",
      selectedBoPhan: "",
      selectedTrangThai: [],
    },

    // ── Filter state — VatLieuTable ────────────────────────────────────────
    // Được lưu trong slice để không mất khi component unmount / chuyển tab
    vatLieuFilters: {
      search: "",
      filterNCC: "",
      filterTrangThai: "",
      filterNhom: "",
      filterLoai: "",
    },

    // ── Filter state — NhaCungCapTable ────────────────────────────────────
    nhaCungCapFilters: {
      search: "",
    },
  },
  reducers: {
    // Reset về trạng thái ban đầu (dùng khi filter thay đổi trước khi fetch)
    resetVatLieu(state) {
      state.vatLieu = [];
      state.vatLieuPage = 0;
      state.vatLieuTotal = 0;
      state.vatLieuHasMore = false;
    },

    // ── NhapXuatTable filters ──────────────────────────────────────────────
    setNhapXuatFilters(state, action) {
      state.nhapXuatFilters = { ...state.nhapXuatFilters, ...action.payload };
    },
    resetNhapXuatFilters(state) {
      state.nhapXuatFilters = {
        selectedMonth: "",
        selectedNCC: "",
        selectedBoPhan: "",
        selectedTrangThai: [],
      };
    },

    // ── VatLieuTable filters ───────────────────────────────────────────────
    setVatLieuFilters(state, action) {
      state.vatLieuFilters = { ...state.vatLieuFilters, ...action.payload };
    },
    resetVatLieuFilters(state) {
      state.vatLieuFilters = {
        search: "",
        filterNCC: "",
        filterTrangThai: "",
        filterNhom: "",
        filterLoai: "",
      };
    },

    // ── NhaCungCapTable filters ────────────────────────────────────────────
    setNhaCungCapFilters(state, action) {
      state.nhaCungCapFilters = { ...state.nhaCungCapFilters, ...action.payload };
    },
    resetNhaCungCapFilters(state) {
      state.nhaCungCapFilters = { search: "" };
    },
  },
  extraReducers: (builder) => {
    // ── NhaCungCap fetch ──────────────────────────────────────────────────
    builder
      .addCase(fetchNhaCungCap.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNhaCungCap.fulfilled, (state, action) => {
        state.loading = false;
        state.nhaCungCap = action.payload;
      })
      .addCase(fetchNhaCungCap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── NhaCungCap add ────────────────────────────────────────────────────
    builder
      .addCase(addNhaCungCap.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addNhaCungCap.fulfilled, (state, action) => {
        state.loading = false;
        const newNcc = action.payload?.data || action.payload;
        if (newNcc?._id) state.nhaCungCap = [newNcc, ...state.nhaCungCap];
      })
      .addCase(addNhaCungCap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── VatLieu — fetch (trang 1, reset list) ────────────────────────────
    builder
      .addCase(fetchVatLieu.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.vatLieu = [];       // xóa list cũ ngay khi bắt đầu request mới
        state.vatLieuHasMore = false;
      })
      .addCase(fetchVatLieu.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload;
        state.vatLieu = data;
        state.vatLieuPage = pagination.page;
        state.vatLieuTotal = pagination.total;
        state.vatLieuHasMore = pagination.hasMore;
        state.vatLieuLimit = pagination.limit;
      })
      .addCase(fetchVatLieu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── VatLieu — thống kê (tổng, thiếu hàng) ────────────────────────────
    builder
      .addCase(fetchVatLieuThongKe.pending, (state) => {
        state.loadingThongKe = true;
      })
      .addCase(fetchVatLieuThongKe.fulfilled, (state, action) => {
        state.loadingThongKe = false;
        state.vatLieuThongKe = {
          tongVatLieu: action.payload.tongVatLieu,
          soHangThieuHang: action.payload.soHangThieuHang,
        };
      })
      .addCase(fetchVatLieuThongKe.rejected, (state, action) => {
        state.loadingThongKe = false;
        state.error = action.payload;
      });

    // ── VatLieu — tùy chọn lọc/phân loại (nhóm, loại, form, màu) ──────────
    builder
      .addCase(fetchVatLieuTuyChon.pending, (state) => {
        state.loadingTuyChon = true;
      })
      .addCase(fetchVatLieuTuyChon.fulfilled, (state, action) => {
        state.loadingTuyChon = false;
        state.vatLieuTuyChon = {
          nhomVatLieu: action.payload.nhomVatLieu || [],
          loaiVatLieu: action.payload.loaiVatLieu || [],
          formRang: action.payload.formRang || [],
          mauRang: action.payload.mauRang || [],
        };
      })
      .addCase(fetchVatLieuTuyChon.rejected, (state, action) => {
        state.loadingTuyChon = false;
        state.error = action.payload;
      });

    // ── VatLieu — fetchMore (trang tiếp, append) ─────────────────────────
    builder
      .addCase(fetchVatLieuMore.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(fetchVatLieuMore.fulfilled, (state, action) => {
        state.loadingMore = false;
        const { data, pagination } = action.payload;
        // Tránh duplicate khi dispatch liên tiếp
        const existingIds = new Set(state.vatLieu.map((v) => v._id));
        const newItems = data.filter((v) => !existingIds.has(v._id));
        state.vatLieu = [...state.vatLieu, ...newItems];
        state.vatLieuPage = pagination.page;
        state.vatLieuTotal = pagination.total;
        state.vatLieuHasMore = pagination.hasMore;
      })
      .addCase(fetchVatLieuMore.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.payload;
      });

    // ── VatLieu — xóa nhiều (bulk delete) ────────────────────────────────
    builder
      .addCase(deleteVatLieuMany.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteVatLieuMany.fulfilled, (state, action) => {
        const deletedIds = new Set(action.payload.ids);
        state.vatLieu = state.vatLieu.filter((v) => !deletedIds.has(v._id));
        state.vatLieuTotal = Math.max(0, state.vatLieuTotal - deletedIds.size);
      })
      .addCase(deleteVatLieuMany.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  resetVatLieu,
  setNhapXuatFilters,
  resetNhapXuatFilters,
  setVatLieuFilters,
  resetVatLieuFilters,
  setNhaCungCapFilters,
  resetNhaCungCapFilters,
} = khoSlice.actions;
export default khoSlice.reducer;