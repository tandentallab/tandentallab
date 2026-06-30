import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api"; // Tự động lấy cấu hình base URL và Token của bạn

/* ================= GET DANH SÁCH CHI PHÍ ================= */
export const fetchChiPhi = createAsyncThunk(
    "chiPhi/fetchChiPhi",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/chiphi", { params });
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy danh sách chi phí");
        }
    }
);

/* ================= TẠO CHI PHÍ MỚI ================= */
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

/* ================= CẬP NHẬT CHI PHÍ ================= */
export const updateChiPhi = createAsyncThunk(
    "chiPhi/updateChiPhi",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await api.put(`/chiphi/${id}`, data);
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi cập nhật chi phí");
        }
    }
);

/* ================= XÓA CHI PHÍ ================= */
export const deleteChiPhi = createAsyncThunk(
    "chiPhi/deleteChiPhi",
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/chiphi/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi xóa chi phí");
        }
    }
);

/* ================= GET DANH SÁCH LOẠI CHI PHÍ ================= */
export const fetchLoaiChiPhi = createAsyncThunk(
    "chiPhi/fetchLoaiChiPhi",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/chiphi/loai");
            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Lỗi lấy loại chi phí");
        }
    }
);

/* ================= SLICE ================= */
const chiPhiSlice = createSlice({
    name: "chiPhi",
    initialState: {
        danhSachChiPhi: [],
        danhSachLoaiChiPhi: [], // Lưu trữ danh sách loại chi phí động
        isLoading: false,
        error: null,
    },
    reducers: {
        clearChiPhiData: (state) => {
            state.danhSachChiPhi = [];
            state.error = null;
        },
        // Chèn loại chi phí mới vào UI lập tức để người dùng có thể chọn ngay
        themLoaiChiPhiLocal: (state, action) => {
            const loaiMoi = action.payload;
            if (!state.danhSachLoaiChiPhi.includes(loaiMoi)) {
                state.danhSachLoaiChiPhi.push(loaiMoi);

                // CẬP NHẬT: Sắp xếp lại danh sách A-Z, giữ "Khác" ở cuối
                state.danhSachLoaiChiPhi.sort((a, b) => {
                    if (a === "Khác") return 1;
                    if (b === "Khác") return -1;
                    return a.localeCompare(b);
                });
            }
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
                    state.danhSachChiPhi.unshift(action.payload);
                }
            })
            .addCase(addChiPhi.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            /* ===== CASE CẬP NHẬT CHI PHÍ ===== */
            .addCase(updateChiPhi.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateChiPhi.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    const index = state.danhSachChiPhi.findIndex((item) => item._id === action.payload._id);
                    if (index !== -1) {
                        state.danhSachChiPhi[index] = action.payload;
                    }
                }
            })
            .addCase(updateChiPhi.rejected, (state, action) => {
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
            })

            /* ===== CASE LẤY LOẠI CHI PHÍ ===== */
            .addCase(fetchLoaiChiPhi.fulfilled, (state, action) => {
                state.danhSachLoaiChiPhi = action.payload || [];
            });
    },
});

export const { clearChiPhiData, themLoaiChiPhiLocal } = chiPhiSlice.actions;
export default chiPhiSlice.reducer;