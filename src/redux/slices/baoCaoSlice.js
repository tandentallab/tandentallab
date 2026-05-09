import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= GET BAO CAO ================= */
export const fetchTopProductsBaoCao = createAsyncThunk(
    "baoCao/fetchTopProducts",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/baocao/top-products", { params });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy báo cáo");
        }
    }
);

export const fetchDetailedReport = createAsyncThunk(
    "baoCao/fetchDetailedReport",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/baocao/detailed-report", { params });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy báo cáo");
        }
    }
);

/* ================= SLICE ================= */
const baoCaoSlice = createSlice({
    name: "baoCao",

    initialState: {
        data: [],
        detailedData: [], // 👉 Thêm state cho bảng chi tiết
        loading: false,
        detailedLoading: false, // 👉 Thêm loading riêng cho bảng
        error: null,
    },

    reducers: {
        clearBaoCaoData: (state) => {
            state.data = [];
            state.detailedData = []; // 👉 Clear cả dữ liệu chi tiết
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            /* ===== FETCH TOP PRODUCTS ===== */
            .addCase(fetchTopProductsBaoCao.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopProductsBaoCao.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload || [];
            })
            .addCase(fetchTopProductsBaoCao.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            /* ===== FETCH DETAILED REPORT (BỔ SUNG) ===== */
            .addCase(fetchDetailedReport.pending, (state) => {
                state.detailedLoading = true;
                state.error = null;
            })
            .addCase(fetchDetailedReport.fulfilled, (state, action) => {
                state.detailedLoading = false;
                state.detailedData = action.payload || []; // 👉 Lưu dữ liệu bảng chi tiết
            })
            .addCase(fetchDetailedReport.rejected, (state, action) => {
                state.detailedLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearBaoCaoData } = baoCaoSlice.actions;
export default baoCaoSlice.reducer;