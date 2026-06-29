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
 *   - mount component
 *   - thay đổi filter / search
 *   - refresh thủ công
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
 * fetchVatLieuMore — tải thêm trang tiếp theo (append), dùng khi:
 *   - người dùng kéo xuống cuối bảng (infinite scroll / lazy loading)
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

// ===== SLICE =====
const khoSlice = createSlice({
  name: "kho",
  initialState: {
    nhaCungCap: [],

    // Lazy-loading state
    vatLieu: [],           // danh sách đang hiển thị (accumulated)
    vatLieuPage: 0,        // trang hiện tại đã tải
    vatLieuTotal: 0,       // tổng số bản ghi khớp filter
    vatLieuHasMore: false, // còn trang tiếp không
    vatLieuLimit: 20,      // số bản ghi mỗi trang

    loading: false,        // loading lần đầu / reset
    loadingMore: false,    // loading khi append thêm
    error: null,
  },
  reducers: {
    // Reset về trạng thái ban đầu (dùng khi filter thay đổi trước khi fetch)
    resetVatLieu(state) {
      state.vatLieu = [];
      state.vatLieuPage = 0;
      state.vatLieuTotal = 0;
      state.vatLieuHasMore = false;
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
  },
});

export const { resetVatLieu } = khoSlice.actions;
export default khoSlice.reducer;
