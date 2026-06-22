import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../config/api";

export const fetchAllPhieuNhapKho = createAsyncThunk(
    'phieuNhapKho/fetchAll',
    async (params, thunkAPI) => {
        try {
            const response = await api.get('/phieu-nhap-kho', { params });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

const phieuNhapKhoSlice = createSlice({
    name: 'phieuNhapKho',
    initialState: {
        phieuNhapKhos: [],
        total: 0,
        page: 1,
        limit: 10,
        loading: false,
        error: null
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPhieuNhapKho.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPhieuNhapKho.fulfilled, (state, action) => {
                state.loading = false;
                state.phieuNhapKhos = action.payload.data || [];
                state.total = action.payload.total || 0;
                state.page = action.payload.page || 1;
                state.limit = action.payload.limit || 10;
            })
            .addCase(fetchAllPhieuNhapKho.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    }
});

export default phieuNhapKhoSlice.reducer;