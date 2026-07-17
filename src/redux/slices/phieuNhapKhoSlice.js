import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAllPhieuNhapKho = createAsyncThunk(
    "phieuNhapKho/fetchAll",
    async (params, thunkAPI) => {
        try {
            const response = await api.get("/phieu-nhap-kho", { params });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const fetchPhieuNhapKhoById = createAsyncThunk(
    "phieuNhapKho/fetchById",
    async (id, thunkAPI) => {
        try {
            const response = await api.get(`/phieu-nhap-kho/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const createPhieuNhapKho = createAsyncThunk(
    "phieuNhapKho/create",
    async (payload, thunkAPI) => {
        try {
            const response = await api.post("/phieu-nhap-kho", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const updatePhieuNhapKho = createAsyncThunk(
    "phieuNhapKho/update",
    async ({ id, ...payload }, thunkAPI) => {
        try {
            const response = await api.patch(`/phieu-nhap-kho/${id}`, payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const deletePhieuNhapKho = createAsyncThunk(
    "phieuNhapKho/delete",
    async (id, thunkAPI) => {
        try {
            await api.delete(`/phieu-nhap-kho/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);
export const appendPhieuNhapKho = createAsyncThunk(
    "phieuNhapKho/append",
    async (params, thunkAPI) => {
        try {
            const response = await api.get("/phieu-nhap-kho", { params });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);
// ── Slice ─────────────────────────────────────────────────────────────────────

const phieuNhapKhoSlice = createSlice({
    name: "phieuNhapKho",
    initialState: {
        phieuNhapKhos: [],
        selected: null,   // phiếu đang xem / sửa
        total: 0,
        page: 1,
        limit: 20,
        loading: false,
        loadingMore: false,
        loadingDetail: false,
        hasMore: true,
        error: null,
    },

    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },

    extraReducers: (builder) => {
        // helper
        const pending = (state) => { state.loading = true; state.error = null; };
        const rejected = (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || action.error.message;
        };

        builder
            // fetchAll
            .addCase(fetchAllPhieuNhapKho.pending, pending)
            .addCase(fetchAllPhieuNhapKho.fulfilled, (state, action) => {
                state.loading = false;
                state.phieuNhapKhos = action.payload.data || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 20;
                state.hasMore = (action.payload.data || []).length >= (action.payload.limit || 20);
            })
            .addCase(fetchAllPhieuNhapKho.rejected, rejected)

            // fetchById
            .addCase(fetchPhieuNhapKhoById.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchPhieuNhapKhoById.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchPhieuNhapKhoById.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload?.message || action.error.message;
            })

            // create
            .addCase(createPhieuNhapKho.pending, pending)
            .addCase(createPhieuNhapKho.fulfilled, (state, action) => {
                state.loading = false;
                if (state.page === 1) {
                    state.phieuNhapKhos = [
                        action.payload.data,
                        ...state.phieuNhapKhos,
                    ].slice(0, state.limit);
                }
                state.total += 1;
            })
            .addCase(createPhieuNhapKho.rejected, rejected)

            // update
            .addCase(updatePhieuNhapKho.pending, pending)
            .addCase(updatePhieuNhapKho.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.data;
                state.phieuNhapKhos = state.phieuNhapKhos.map((p) =>
                    p._id === updated._id ? { ...p, ...updated } : p
                );
                if (state.selected?._id === updated._id) {
                    state.selected = updated;
                }
            })
            .addCase(updatePhieuNhapKho.rejected, rejected)

            // delete
            .addCase(deletePhieuNhapKho.pending, pending)
            .addCase(deletePhieuNhapKho.fulfilled, (state, action) => {
                state.loading = false;
                state.phieuNhapKhos = state.phieuNhapKhos.filter(
                    (p) => p._id !== action.payload
                );
                state.total -= 1;
            })
            .addCase(deletePhieuNhapKho.rejected, rejected)

            // appendPhieuNhapKho (infinite scroll)
            .addCase(appendPhieuNhapKho.pending, (state) => { state.loadingMore = true; })
            .addCase(appendPhieuNhapKho.fulfilled, (state, action) => {
                state.loadingMore = false;
                const newData = action.payload.data || [];
                state.phieuNhapKhos = [...state.phieuNhapKhos, ...newData];
                state.total = action.payload.total || state.total;
                state.hasMore = state.phieuNhapKhos.length < state.total;
            })
            .addCase(appendPhieuNhapKho.rejected, (state) => { state.loadingMore = false; });
    },
});

export const { clearSelected } = phieuNhapKhoSlice.actions;
export default phieuNhapKhoSlice.reducer;