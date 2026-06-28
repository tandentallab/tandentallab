import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Box, Divider, Fade, Tab, Tabs } from '@mui/material';
import { ListAlt as ListAltIcon, BarChart as BarChartIcon } from '@mui/icons-material';

import { fetchChiPhi, addChiPhi, deleteChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

import QuanLyChiPhi from './QuanLyChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

// ==========================================
// MAIN PAGE
// ==========================================
const ChiPhiPage = () => {
    const dispatch = useDispatch();
    const { danhSachChiPhi, isLoading } = useSelector(getChiPhiSelector);
    const [activeTab, setActiveTab] = useState(0);

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const [filter, setFilter] = useState({
        thang: now.month() + 1,
        nam: now.year(),
    });

    // Các state cho Modal xác nhận xóa
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchChiPhi(filter));
    }, [dispatch, filter]);

    const handleAddChiPhi = (data) => {
        dispatch(addChiPhi(data));
    };

    // Khi bấm xóa từ component con, mở modal và lưu ID
    const handleDeleteChiPhi = (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    // Hàm gọi Redux để xóa thực sự
    const handleConfirmDelete = () => {
        if (itemToDelete) {
            dispatch(deleteChiPhi(itemToDelete));
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    // Hàm đóng modal
    const handleCancelDelete = () => {
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <Box className="min-h-screen bg-slate-50 p-5 relative">
            {/* Tabs */}
            <Box className="mb-5">
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        minHeight: 40,
                        '& .MuiTabs-indicator': { bgcolor: '#4f46e5', height: 2, borderRadius: '1px' },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#94a3b8',
                            minHeight: 40,
                            px: 0,
                            mr: 4,
                            '&.Mui-selected': { color: '#4f46e5', fontWeight: 700 },
                        },
                    }}
                >
                    <Tab
                        label={
                            <Box className="flex items-center gap-1.5">
                                <ListAltIcon sx={{ fontSize: 16 }} />
                                Chi phí
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box className="flex items-center gap-1.5">
                                <BarChartIcon sx={{ fontSize: 16 }} />
                                Báo cáo Thu / Chi
                            </Box>
                        }
                    />
                </Tabs>
                <Divider sx={{ borderColor: '#e2e8f0' }} />
            </Box>

            {/* Tab content */}
            <Fade in key={activeTab} timeout={200}>
                <Box>
                    {activeTab === 0 && (
                        <QuanLyChiPhi
                            danhSachChiPhi={danhSachChiPhi}
                            isLoading={isLoading}
                            filter={filter}
                            setFilter={setFilter}
                            onAdd={handleAddChiPhi}
                            onDelete={handleDeleteChiPhi}
                        />
                    )}
                    {activeTab === 1 && <BaoCaoThuChi />}
                </Box>
            </Fade>

            {/* ========================================================= */}
            {/* CUSTOM CONFIRM MODAL VỚI TAILWIND CSS */}
            {/* ========================================================= */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                    {/* Hộp thoại */}
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-[400px] max-w-[90%] transform transition-all">
                        {/* Tiêu đề */}
                        <div className="flex items-center gap-3 mb-4">
                            {/* Icon cảnh báo */}
                            <div className="bg-red-100 text-red-600 p-2 rounded-full flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Xác nhận xóa</h3>
                        </div>

                        {/* Nội dung thông báo */}
                        <p className="text-gray-600 mb-8 pl-11">
                            Bạn có chắc chắn muốn xóa chi phí này không?
                        </p>

                        {/* Cụm nút hành động */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow-md hover:bg-red-700 transition-colors"
                            >
                                Xóa chi phí
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ========================================================= */}
        </Box>
    );
};

export default ChiPhiPage;