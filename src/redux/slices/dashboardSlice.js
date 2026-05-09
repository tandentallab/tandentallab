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
    },
    reducers: {
        updateChartConfig: (state, action) => {
            const { chartId, config } = action.payload;
            state[chartId].config = { ...state[chartId].config, ...config };
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
            });
    },
});

export const { updateChartConfig } = dashboardSlice.actions;
export default dashboardSlice.reducer;