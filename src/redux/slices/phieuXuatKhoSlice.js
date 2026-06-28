import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAllPhieuXuatKho = createAsyncThunk(
    "phieuXuatKho/fetchAll",
    async (params, thunkAPI) => {
        try {
            const response = await api.get("/phieu-xuat-kho", { params });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const fetchPhieuXuatKhoById = createAsyncThunk(
    "phieuXuatKho/fetchById",
    async (id, thunkAPI) => {
        try {
            const response = await api.get(`/phieu-xuat-kho/${id}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const createPhieuXuatKho = createAsyncThunk(
    "phieuXuatKho/create",
    async (payload, thunkAPI) => {
        try {
            const response = await api.post("/phieu-xuat-kho", payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const updatePhieuXuatKho = createAsyncThunk(
    "phieuXuatKho/update",
    async ({ id, ...payload }, thunkAPI) => {
        try {
            const response = await api.patch(`/phieu-xuat-kho/${id}`, payload);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const deletePhieuXuatKho = createAsyncThunk(
    "phieuXuatKho/delete",
    async (id, thunkAPI) => {
        try {
            await api.delete(`/phieu-xuat-kho/${id}`);
            return id;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const fetchXuatKhoOptions = createAsyncThunk(
    "phieuXuatKho/fetchOptions",
    async (_, thunkAPI) => {
        try {
            const response = await api.get("/phieu-xuat-kho/options");
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const phieuXuatKhoSlice = createSlice({
    name: "phieuXuatKho",
    initialState: {
        phieuXuatKhos: [],
        selected: null,
        total: 0,
        page: 1,
        limit: 10,
        loading: false,
        loadingDetail: false,
        error: null,
        boPhanList: [],
        nhanVienList: [],
    },

    reducers: {
        clearSelectedXuat(state) {
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
            .addCase(fetchAllPhieuXuatKho.pending, pending)
            .addCase(fetchAllPhieuXuatKho.fulfilled, (state, action) => {
                state.loading = false;
                state.phieuXuatKhos = action.payload.data || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(fetchAllPhieuXuatKho.rejected, rejected)

            // fetchById
            .addCase(fetchPhieuXuatKhoById.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(fetchPhieuXuatKhoById.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.selected = action.payload.data;
            })
            .addCase(fetchPhieuXuatKhoById.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload?.message || action.error.message;
            })

            // create
            .addCase(createPhieuXuatKho.pending, pending)
            .addCase(createPhieuXuatKho.fulfilled, (state, action) => {
                state.loading = false;
                if (state.page === 1) {
                    state.phieuXuatKhos = [
                        action.payload.data,
                        ...state.phieuXuatKhos,
                    ].slice(0, state.limit);
                }
                state.total += 1;
            })
            .addCase(createPhieuXuatKho.rejected, rejected)

            // update
            .addCase(updatePhieuXuatKho.pending, pending)
            .addCase(updatePhieuXuatKho.fulfilled, (state, action) => {
                state.loading = false;
                const updated = action.payload.data;
                state.phieuXuatKhos = state.phieuXuatKhos.map((p) =>
                    p._id === updated._id ? { ...p, ...updated } : p
                );
                if (state.selected?._id === updated._id) {
                    state.selected = updated;
                }
            })
            .addCase(updatePhieuXuatKho.rejected, rejected)

            // delete
            .addCase(deletePhieuXuatKho.pending, pending)
            .addCase(deletePhieuXuatKho.fulfilled, (state, action) => {
                state.loading = false;
                state.phieuXuatKhos = state.phieuXuatKhos.filter(
                    (p) => p._id !== action.payload
                );
                state.total -= 1;
            })
            .addCase(deletePhieuXuatKho.rejected, rejected)

            // fetchOptions
            .addCase(fetchXuatKhoOptions.fulfilled, (state, action) => {
                state.boPhanList = action.payload.data?.boPhanList || [];
                state.nhanVienList = action.payload.data?.nhanVienList || [];
            });
    },
});

export const { clearSelectedXuat } = phieuXuatKhoSlice.actions;
export default phieuXuatKhoSlice.reducer;
