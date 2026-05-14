import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api"; // Đảm bảo đường dẫn này trỏ đúng đến file config api của bạn

/* ================= GET ALL (paginated) ================= */
export const fetchDonHang = createAsyncThunk(
    "donHang/fetchAll",
    async (params = {}, { rejectWithValue }) => {
        try {
            const res = await api.get("/donhang", { params });
            return res.data; // { success, data, total, totalPages, currentPage, stats }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Lỗi tải dữ liệu đơn hàng"
            );
        }
    }
);

/* ================= GET ALL (không phân trang, dùng cho KeHoachGiaoHang) ================= */
export const fetchDonHangAll = createAsyncThunk(
    "donHang/fetchAll_noPage",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/donhang", { params: { page: 1, limit: 9999 } });
            return res.data.data || [];
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Lỗi tải dữ liệu đơn hàng"
            );
        }
    }
);

/* ================= GET BY ID ================= */
export const fetchDonHangById = createAsyncThunk(
    "donHang/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await api.get(`/donhang/${id}`);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Lỗi tải chi tiết đơn hàng"
            );
        }
    }
);

/* ================= CREATE ================= */
export const createDonHang = createAsyncThunk(
    "donHang/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await api.post("/donhang", data);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Tạo đơn hàng thất bại"
            );
        }
    }
);

/* ================= UPDATE ================= */
export const updateDonHang = createAsyncThunk(
    "donHang/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/donhang/${id}`, data);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Cập nhật đơn hàng thất bại"
            );
        }
    }
);

/* ================= DELETE ================= */
export const deleteDonHang = createAsyncThunk(
    "donHang/delete",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/donhang/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Xóa đơn hàng thất bại"
            );
        }
    }
);

/* ================= UPDATE CONG DOAN STATUS ================= */
export const updateCongDoanTrangThai = createAsyncThunk(
    "donHang/updateCongDoanTrangThai",
    async ({ id, spIndex, thuTu, trangThai }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/donhang/${id}/congdoan-status`, { spIndex, thuTu, trangThai });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Cập nhật trạng thái công đoạn thất bại"
            );
        }
    }
);

/* ================= SLICE ================= */

const donHangSlice = createSlice({
    name: "donHang",

    initialState: {
        data: [],
        allData: [], // dùng cho KeHoachGiaoHang (không phân trang)
        loading: false,
        error: null,
        pagination: { total: 0, totalPages: 1, currentPage: 1 },
        stats: {},
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            /* ===== FETCH (paginated) ===== */
            .addCase(fetchDonHang.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDonHang.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data || [];
                state.pagination = {
                    total: action.payload.total || 0,
                    totalPages: action.payload.totalPages || 1,
                    currentPage: action.payload.currentPage || 1,
                };
                state.stats = action.payload.stats || {};
            })
            .addCase(fetchDonHang.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ===== FETCH ALL (no pagination) ===== */
            .addCase(fetchDonHangAll.fulfilled, (state, action) => {
                state.allData = action.payload || [];
            })

            /* ===== CREATE ===== */
            .addCase(createDonHang.pending, (state) => {
                state.loading = true;
            })
            .addCase(createDonHang.fulfilled, (state, action) => {
                state.loading = false;
                // Không thêm vào data[] vì data là paginated — DonHangPage sẽ reload
            })
            .addCase(createDonHang.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            /* ===== UPDATE ===== */
            .addCase(updateDonHang.fulfilled, (state, action) => {
                const index = state.data.findIndex(
                    (item) => item._id === action.payload._id
                );
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* ===== UPDATE CONG DOAN STATUS ===== */
            .addCase(updateCongDoanTrangThai.fulfilled, (state, action) => {
                const index = state.data.findIndex(
                    (item) => item._id === action.payload._id
                );
                if (index !== -1) {
                    state.data[index] = action.payload;
                }
            })

            /* ===== DELETE ===== */
            .addCase(deleteDonHang.fulfilled, (state, action) => {
                state.data = state.data.filter(
                    (item) => item._id !== action.payload
                );
            });
    },
});

export default donHangSlice.reducer;