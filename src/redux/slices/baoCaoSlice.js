import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

/* ================= 1. GET BAO CAO SẢN LƯỢNG (GIỮ NGUYÊN) ================= */
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

/* ================= 2. GET BÁO CÁO DOANH THU (THÊM MỚI) ================= */
export const fetchBaoCaoDoanhThuThang = createAsyncThunk(
    "baoCao/fetchBaoCaoDoanhThuThang",
    async ({ thang, nam }, { rejectWithValue }) => {
        try {
            const res = await api.get("/baocao/doanh-thu-thang", { params: { thang, nam } });
            // Trả về thẳng dữ liệu (res.data chứa { success, thang, nam, tongHop, chiTiet })
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy báo cáo doanh thu");
        }
    }
);

export const upsertGhiChu = createAsyncThunk(
    "baoCao/upsertGhiChu",
    async ({ id, thang, nam, noiDung }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/nhakhoa/${id}/ghi-chu`, { thang, nam, noiDung });
            return { nhaKhoaId: id, noiDung };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lưu ghi chú thất bại");
        }
    }
);

/* ================= SLICE ================= */
const baoCaoSlice = createSlice({
    name: "baoCao",
    initialState: {
        // --- State của trang Sản lượng (Giữ nguyên) ---
        data: [],
        detailedData: [],
        loading: false,
        detailedLoading: false,
        error: null,

        // --- State của trang Doanh thu (Được tách riêng, chống crash) ---
        doanhThuData: null,
        doanhThuLoading: false,
        doanhThuError: null,
        notes: {},
    },

    reducers: {
        clearBaoCaoData: (state) => {
            state.data = [];
            state.detailedData = [];
            state.error = null;
            // Xóa state mới
            state.doanhThuData = null;
            state.doanhThuError = null;
            state.notes = {};
        }
    },

    extraReducers: (builder) => {
        builder
            /* ===== CASE CỦA SẢN LƯỢNG (GIỮ NGUYÊN 100%) ===== */
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
            .addCase(fetchDetailedReport.pending, (state) => {
                state.detailedLoading = true;
                state.error = null;
            })
            .addCase(fetchDetailedReport.fulfilled, (state, action) => {
                state.detailedLoading = false;
                state.detailedData = action.payload || [];
            })
            .addCase(fetchDetailedReport.rejected, (state, action) => {
                state.detailedLoading = false;
                state.error = action.payload;
            })

            /* ===== CASE CỦA DOANH THU MỚI THÊM VÀO ===== */
            .addCase(fetchBaoCaoDoanhThuThang.pending, (state) => {
                state.doanhThuLoading = true;
                state.doanhThuError = null;
            })
            .addCase(fetchBaoCaoDoanhThuThang.fulfilled, (state, action) => {
                state.doanhThuLoading = false;
                state.doanhThuData = action.payload;

                // Tự động rải Ghi chú vào map notes
                const notesMap = {};
                const chiTiet = action.payload?.chiTiet || [];
                chiTiet.forEach((row) => {
                    if (row.ghiChu) notesMap[row.nhaKhoaId] = row.ghiChu;
                });
                state.notes = notesMap;
            })
            .addCase(fetchBaoCaoDoanhThuThang.rejected, (state, action) => {
                state.doanhThuLoading = false;
                state.doanhThuError = action.payload;
            })
            .addCase(upsertGhiChu.fulfilled, (state, action) => {
                const { nhaKhoaId, noiDung } = action.payload;
                state.notes[nhaKhoaId] = noiDung;
            });
    },
});

export const { clearBaoCaoData } = baoCaoSlice.actions;
export default baoCaoSlice.reducer;