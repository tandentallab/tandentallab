import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

export const fetchAllPhieuMuonVatLieu = createAsyncThunk(
    "phieuMuonVatLieu/fetchAll",
    async (params, thunkAPI) => {
        try {
            const response = await api.get("/phieu-muon-vat-lieu", { params });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const fetchPhieuMuonVatLieuById = createAsyncThunk(
    "phieuMuonVatLieu/fetchById",
    async (id, thunkAPI) => {
        try {
            const response = await api.get(`/phieu-muon-vat-lieu/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const createPhieuMuonVatLieu = createAsyncThunk(
    "phieuMuonVatLieu/create",
    async (payload, thunkAPI) => {
        try {
            const response = await api.post("/phieu-muon-vat-lieu", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const updatePhieuMuonVatLieu = createAsyncThunk(
    "phieuMuonVatLieu/update",
    async ({ id, ...payload }, thunkAPI) => {
        try {
            const response = await api.patch(`/phieu-muon-vat-lieu/${id}`, payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const deletePhieuMuonVatLieu = createAsyncThunk(
    "phieuMuonVatLieu/delete",
    async (id, thunkAPI) => {
        try {
            await api.delete(`/phieu-muon-vat-lieu/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

const emptyBucket = () => ({
    list: [],
    total: 0,
    page: 1,
    limit: 20,
    hasMore: true,
    loading: false,
    loadingMore: false,
});

const phieuMuonVatLieuSlice = createSlice({
    name: "phieuMuonVatLieu",
    initialState: {
        byLoai: {
            "Mượn": emptyBucket(),
            "Cho mượn": emptyBucket(),
        },
        selected: null,
        loadingDetail: false,
        error: null,
    },

    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
        // Xóa sạch danh sách + reset về trang 1 cho 1 loai (dùng khi đổi filter tháng, hoặc refresh)
        resetLoai(state, action) {
            const loai = action.payload;
            if (state.byLoai[loai]) state.byLoai[loai] = emptyBucket();
        },
    },

    extraReducers: (builder) => {
        builder
            // fetchAll — theo từng loai, hỗ trợ append khi page > 1
            .addCase(fetchAllPhieuMuonVatLieu.pending, (state, action) => {
                const { loai, page = 1 } = action.meta.arg || {};
                const bucket = state.byLoai[loai];
                if (!bucket) return;
                if (page > 1) bucket.loadingMore = true;
                else bucket.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPhieuMuonVatLieu.fulfilled, (state, action) => {
                const { loai, page = 1, limit = 20 } = action.meta.arg || {};
                const bucket = state.byLoai[loai];
                if (!bucket) return;
                const newList = action.payload.data || [];
                bucket.list = page > 1 ? [...bucket.list, ...newList] : newList;
                bucket.total = action.payload.total || 0;
                bucket.page = page;
                bucket.limit = limit;
                bucket.hasMore = bucket.list.length < bucket.total;
                bucket.loading = false;
                bucket.loadingMore = false;
            })
            .addCase(fetchAllPhieuMuonVatLieu.rejected, (state, action) => {
                const { loai } = action.meta.arg || {};
                const bucket = state.byLoai[loai];
                if (bucket) { bucket.loading = false; bucket.loadingMore = false; }
                state.error = action.payload?.message || action.error.message;
            })

            // fetchById
            .addCase(fetchPhieuMuonVatLieuById.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchPhieuMuonVatLieuById.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchPhieuMuonVatLieuById.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload?.message || action.error.message;
            })

            // create — thêm vào đầu bucket đúng loai
            .addCase(createPhieuMuonVatLieu.fulfilled, (state, action) => {
                const created = action.payload.data;
                const bucket = state.byLoai[created.loai];
                if (bucket) {
                    bucket.list = [created, ...bucket.list];
                    bucket.total += 1;
                }
            })

            // update — tìm đúng bucket theo id và thay thế
            .addCase(updatePhieuMuonVatLieu.fulfilled, (state, action) => {
                const updated = action.payload.data;
                Object.values(state.byLoai).forEach((bucket) => {
                    bucket.list = bucket.list.map((p) =>
                        p._id === updated._id ? { ...p, ...updated } : p
                    );
                });
            })

            // delete — xóa khỏi bucket chứa id đó
            .addCase(deletePhieuMuonVatLieu.fulfilled, (state, action) => {
                const id = action.payload;
                Object.values(state.byLoai).forEach((bucket) => {
                    const before = bucket.list.length;
                    bucket.list = bucket.list.filter((p) => p._id !== id);
                    if (bucket.list.length !== before) bucket.total -= 1;
                });
            });
    },
});

export const { clearSelected, resetLoai } = phieuMuonVatLieuSlice.actions;
export default phieuMuonVatLieuSlice.reducer;