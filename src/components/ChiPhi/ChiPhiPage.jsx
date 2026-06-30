import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Box, Tabs, Tab } from '@mui/material';

import { fetchChiPhi, addChiPhi, deleteChiPhi, fetchLoaiChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiHangNgay from './ChiPhiHangNgay';
import BaoCaoChiPhi from './BaoCaoChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi'; // Đã thêm Stat Cards vào đây

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const ChiPhiPage = () => {
    const dispatch = useDispatch();
    const { danhSachChiPhi, isLoading } = useSelector(getChiPhiSelector);

    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.appRole?.toLowerCase() === "admin";

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const [filter, setFilter] = useState({
        ngay: 0,
        thang: now.month() + 1,
        nam: now.year(),
    });

    const [currentTab, setCurrentTab] = useState(0);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchChiPhi(filter));
        dispatch(fetchLoaiChiPhi());
    }, [dispatch, filter]);

    const handleAddChiPhi = (data) => {
        dispatch(addChiPhi(data));
    };

    const handleDeleteChiPhi = (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            dispatch(deleteChiPhi(itemToDelete));
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <Box className="min-h-screen bg-slate-50 px-2 py-5 sm:p-5 relative">

            {/* 1. ĐẦU TIÊN: PHẦN CHỌN TABS (Chỉ hiển thị cho Admin) */}
            {isAdmin && (
                <Tabs
                    value={currentTab}
                    onChange={(e, newVal) => setCurrentTab(newVal)}
                    sx={{
                        mb: 3,
                        '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' },
                        '& .Mui-selected': { color: '#0284c7' }
                    }}
                >
                    <Tab label="Chi Phí Hằng Ngày" />
                    <Tab label="Báo Cáo Tổng Hợp" />
                </Tabs>
            )}

            {/* 2. DÒNG TIẾP THEO: STAT CARDS (Chỉ hiển thị ở tab Báo Cáo của Admin) */}
            {isAdmin && currentTab === 1 && (
                <Box className="mb-5">
                    <BaoCaoThuChi filter={filter} />
                </Box>
            )}

            {/* 3. TIẾP THEO NỮA: THANH LỌC (Dùng chung cho cả 2 tab) */}
            <Box className="mb-5">
                <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
            </Box>

            {/* 4. CUỐI CÙNG: NỘI DUNG BÊN DƯỚI (Form / Table) */}
            {isAdmin ? (
                <>
                    {currentTab === 0 && (
                        <ChiPhiHangNgay
                            danhSachChiPhi={danhSachChiPhi}
                            isLoading={isLoading}
                            filter={filter}
                            onAdd={handleAddChiPhi}
                            onDelete={handleDeleteChiPhi}
                        />
                    )}

                    {currentTab === 1 && (
                        <BaoCaoChiPhi
                            danhSachChiPhi={danhSachChiPhi}
                            filter={filter}
                            isLoading={isLoading}
                            onDelete={handleDeleteChiPhi}
                        />
                    )}
                </>
            ) : (
                <ChiPhiHangNgay
                    danhSachChiPhi={danhSachChiPhi}
                    isLoading={isLoading}
                    filter={filter}
                    onAdd={handleAddChiPhi}
                    onDelete={handleDeleteChiPhi}
                />
            )}

            {/* CUSTOM CONFIRM MODAL */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
                    <div className="bg-white rounded-lg shadow-2xl p-6 w-[400px] max-w-[90%] transform transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-red-100 text-red-600 p-2 rounded-full flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Xác nhận xóa</h3>
                        </div>
                        <p className="text-gray-600 mb-8 pl-11">Bạn có chắc chắn muốn xóa chi phí này không?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded hover:bg-gray-200">
                                Hủy bỏ
                            </button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
                                Xóa chi phí
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Box>
    );
};

export default ChiPhiPage;