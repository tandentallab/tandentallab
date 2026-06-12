import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../config/api';

export const fetchChartData = createAsyncThunk(
    'dashboard/fetchChartData',
    async ({ chartId, startDate, endDate, groupBy }, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/stats', {
                params: { chartType: chartId, startDate, endDate, groupBy }
            });
            return { chartId, data: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching chart');
        }
    }
);

export const fetchOrderByMonth = createAsyncThunk(
    'dashboard/fetchOrderByMonth',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/don-hang-thang', { params });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching monthly orders');
        }
    }
);

// Default Filter theo yêu cầu: 7 ngày, nhóm theo ngày, bật legend, tắt label
const defaultFilter = {
    timeRange: 'Trong vòng 7 ngày',
    groupBy: 'day',
    showDataLabels: false,
    showLegend: true
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        chart1: { data: [], loading: false, config: { ...defaultFilter } },
        chart2: { data: [], loading: false, config: { ...defaultFilter } },
        chart3: { data: [], loading: false, config: { ...defaultFilter, showDataLabels: true } },
        chart4: { data: [], loading: false, config: { ...defaultFilter, showDataLabels: false, showLegend: true } },
        orders: { data: [], loading: false, error: null }
    },
    reducers: {
        updateChartConfig: (state, action) => {
            const { chartId, config } = action.payload;
            state[chartId].config = { ...state[chartId].config, ...config };
        },
        // 👇 THÊM: Action resetDashboard để dọn rác sau khi logout
        resetDashboard: (state) => {
            state.chart1 = { data: [], loading: false, config: { ...defaultFilter } };
            state.chart2 = { data: [], loading: false, config: { ...defaultFilter } };
            state.chart3 = { data: [], loading: false, config: { ...defaultFilter, showDataLabels: true } };
            state.chart4 = { data: [], loading: false, config: { ...defaultFilter, showDataLabels: false, showLegend: true } };
            state.orders = { data: [], loading: false, error: null };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchChartData.pending, (state, action) => {
                const { chartId } = action.meta.arg;
                state[chartId].loading = true;
            })
            .addCase(fetchChartData.fulfilled, (state, action) => {
                const { chartId, data } = action.payload;
                state[chartId].loading = false;
                state[chartId].data = data;
            })
            .addCase(fetchChartData.rejected, (state, action) => {
                const { chartId } = action.meta.arg;
                state[chartId].loading = false;
            })
            .addCase(fetchOrderByMonth.pending, (state) => {
                state.orders.loading = true;
                state.orders.error = null;
            })
            .addCase(fetchOrderByMonth.fulfilled, (state, action) => {
                state.orders.loading = false;
                state.orders.data = action.payload || [];
            })
            .addCase(fetchOrderByMonth.rejected, (state, action) => {
                state.orders.loading = false;
                state.orders.error = action.payload || 'Error fetching monthly orders';
            });
    }
});

// Nhớ export action resetDashboard ra ngoài
export const { updateChartConfig, resetDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;