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

/* ================= 2. GET BÁO CÁO DOANH THU (GIỮ NGUYÊN) ================= */
export const fetchBaoCaoDoanhThuThang = createAsyncThunk(
    "baoCao/fetchBaoCaoDoanhThuThang",
    async ({ thang, nam }, { rejectWithValue }) => {
        try {
            const res = await api.get("/baocao/doanh-thu-thang", { params: { thang, nam } });
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

/* ================= 3. GET SẢN LƯỢNG THEO KHÁCH HÀNG (THÊM MỚI) ================= */
export const fetchSanLuongKhachHang = createAsyncThunk(
    "baoCao/fetchSanLuongKhachHang",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/baocao/san-luong-khach-hang", { params });
            // Trả về nguyên cục data chứa cả tongTatCa và mảng danh sách
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy báo cáo sản lượng khách hàng");
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

        // --- State của trang Doanh thu (Giữ nguyên) ---
        doanhThuData: null,
        doanhThuLoading: false,
        doanhThuError: null,
        notes: {},

        // --- State của trang Sản lượng Khách hàng (THÊM MỚI) ---
        sanLuongKhachHangData: null,
        sanLuongKhachHangLoading: false,
        sanLuongKhachHangError: null,
    },

    reducers: {
        clearBaoCaoData: (state) => {
            state.data = [];
            state.detailedData = [];
            state.error = null;
            state.doanhThuData = null;
            state.doanhThuError = null;
            state.notes = {};
            // Clear luôn state mới
            state.sanLuongKhachHangData = null;
            state.sanLuongKhachHangError = null;
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

            /* ===== CASE CỦA DOANH THU ===== */
            .addCase(fetchBaoCaoDoanhThuThang.pending, (state) => {
                state.doanhThuLoading = true;
                state.doanhThuError = null;
            })
            .addCase(fetchBaoCaoDoanhThuThang.fulfilled, (state, action) => {
                state.doanhThuLoading = false;
                state.doanhThuData = action.payload;

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
            })

            /* ===== CASE CỦA SẢN LƯỢNG KHÁCH HÀNG (THÊM MỚI) ===== */
            .addCase(fetchSanLuongKhachHang.pending, (state) => {
                state.sanLuongKhachHangLoading = true;
                state.sanLuongKhachHangError = null;
            })
            .addCase(fetchSanLuongKhachHang.fulfilled, (state, action) => {
                state.sanLuongKhachHangLoading = false;
                // Lưu nguyên cục payload chứa success, loaiDonDaLoc, tongTatCa, data
                state.sanLuongKhachHangData = action.payload;
            })
            .addCase(fetchSanLuongKhachHang.rejected, (state, action) => {
                state.sanLuongKhachHangLoading = false;
                state.sanLuongKhachHangError = action.payload;
            });
    },
});

export const { clearBaoCaoData } = baoCaoSlice.actions;
export default baoCaoSlice.reducer;