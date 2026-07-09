import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api"; // ⚠️ chỉnh lại path cho khớp cấu trúc dự án

// ── Thunks ────────────────────────────────────────────────────────────────────

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

// ── Slice ─────────────────────────────────────────────────────────────────────

const phieuMuonVatLieuSlice = createSlice({
    name: "phieuMuonVatLieu",
    initialState: {
        list: [],
        total: 0,
        selected: null,
        loading: false,
        loadingDetail: false,
        error: null,
    },

    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },

    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const rejected = (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || action.error.message;
        };

        builder
            // fetchAll
            .addCase(fetchAllPhieuMuonVatLieu.pending, pending)
            .addCase(fetchAllPhieuMuonVatLieu.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.data || [];
                state.total = action.payload.total || 0;
            })
            .addCase(fetchAllPhieuMuonVatLieu.rejected, rejected)

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

            // create
            .addCase(createPhieuMuonVatLieu.pending, pending)
            .addCase(createPhieuMuonVatLieu.fulfilled, (state, action) => {
                state.loading = false;
                state.list = [action.payload.data, ...state.list];
                state.total += 1;
            })
            .addCase(createPhieuMuonVatLieu.rejected, rejected)

            // update
            .addCase(updatePhieuMuonVatLieu.pending, pending)
            .addCase(updatePhieuMuonVatLieu.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.data;
                state.list = state.list.map((p) =>
                    p._id === updated._id ? { ...p, ...updated } : p
                );
            })
            .addCase(updatePhieuMuonVatLieu.rejected, rejected)

            // delete
            .addCase(deletePhieuMuonVatLieu.pending, pending)
            .addCase(deletePhieuMuonVatLieu.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter((p) => p._id !== action.payload);
                state.total -= 1;
            })
            .addCase(deletePhieuMuonVatLieu.rejected, rejected);
    },
});

export const { clearSelected } = phieuMuonVatLieuSlice.actions;
export default phieuMuonVatLieuSlice.reducer;