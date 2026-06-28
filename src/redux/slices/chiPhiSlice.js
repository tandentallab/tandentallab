import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api"; // Tự động lấy cấu hình base URL và Token của bạn

/* ================= 1. GET DANH SÁCH CHI PHÍ ================= */
export const fetchChiPhi = createAsyncThunk(
    "chiPhi/fetchChiPhi",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/chiphi", { params });
            // Trả về mảng data từ API
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy danh sách chi phí");
        }
    }
);

/* ================= 2. TẠO CHI PHÍ MỚI ================= */
export const addChiPhi = createAsyncThunk(
    "chiPhi/addChiPhi",
    async (data, { rejectWithValue }) => {
        try {
            const res = await api.post("/chiphi", data);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi tạo chi phí mới");
        }
    }
);

/* ================= 3. XÓA CHI PHÍ ================= */
export const deleteChiPhi = createAsyncThunk(
    "chiPhi/deleteChiPhi",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/chiphi/${id}`);
            return id; // Trả về id để xóa khỏi danh sách local
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi xóa chi phí");
        }
    }
);

/* ================= SLICE ================= */
const chiPhiSlice = createSlice({
    name: "chiPhi",
    initialState: {
        danhSachChiPhi: [],
        isLoading: false,
        error: null,
    },

    reducers: {
        clearChiPhiData: (state) => {
            state.danhSachChiPhi = [];
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        builder
            /* ===== CASE LẤY DANH SÁCH CHI PHÍ ===== */
            .addCase(fetchChiPhi.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchChiPhi.fulfilled, (state, action) => {
                state.isLoading = false;
                state.danhSachChiPhi = action.payload || [];
            })
            .addCase(fetchChiPhi.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            /* ===== CASE TẠO CHI PHÍ MỚI ===== */
            .addCase(addChiPhi.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addChiPhi.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.danhSachChiPhi.unshift(action.payload); // Đẩy chi phí mới lên đầu danh sách
                }
            })
            .addCase(addChiPhi.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            /* ===== CASE XÓA CHI PHÍ ===== */
            .addCase(deleteChiPhi.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteChiPhi.fulfilled, (state, action) => {
                state.isLoading = false;
                state.danhSachChiPhi = state.danhSachChiPhi.filter(
                    (item) => item._id !== action.payload
                );
            })
            .addCase(deleteChiPhi.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearChiPhiData } = chiPhiSlice.actions;
export default chiPhiSlice.reducer;