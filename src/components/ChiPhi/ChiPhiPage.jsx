import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Box, Tabs, Tab } from '@mui/material';

import ConfirmModal from './ConfirmModal';
import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiHangNgay from './ChiPhiHangNgay';
import BaoCaoChiPhi from './BaoCaoChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi';
import QuyChiPhiWidget from './QuyChiPhiWidget'; // Import component vừa tạo

import { fetchChiPhi, addChiPhi, deleteChiPhi, fetchLoaiChiPhi, fetchQuyChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const ChiPhiPage = () => {
    const dispatch = useDispatch();
    const { danhSachChiPhi, isLoading } = useSelector(getChiPhiSelector);

    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.quyenSuDung?.ten?.toLowerCase() === "admin" || user?.appRole?.toLowerCase() === "admin";

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
        dispatch(fetchQuyChiPhi());
    }, [dispatch, filter]);

    const handleAddChiPhi = (data) => { dispatch(addChiPhi(data)); };

    const handleDeleteChiPhi = (id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) dispatch(deleteChiPhi(itemToDelete));
        setIsConfirmOpen(false);
        setItemToDelete(null);
    };

    return (
        <Box className="bg-slate-50 px-2 mb-2 relative flex flex-col" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
            {isAdmin ? (
                currentTab === 1 ? (
                    <Box className="mt-3 mb-4 gap-4" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gridTemplateRows: '4fr 6fr', gridTemplateAreas: { xs: `"tabs" "filter" "report"`, md: `"tabs report" "filter report"` } }}>
                        <Box sx={{ gridArea: 'tabs', display: 'flex' }}>
                            <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }, '& .Mui-selected': { color: '#0284c7' } }}>
                                <Tab label="CHI PHÍ HẰNG NGÀY" />
                                <Tab label="BÁO CÁO TỔNG HỢP" />
                            </Tabs>
                        </Box>
                        <Box sx={{ gridArea: 'filter', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                            <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                        </Box>
                        <Box sx={{ gridArea: 'report', display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{ width: '100%' }}><BaoCaoThuChi filter={filter} /></Box>
                        </Box>
                    </Box>
                ) : (
                    <Box className="flex flex-col mt-3 gap-4">
                        {/* HÀNG 1: CHỈ ĐỂ TABS */}
                        <Box className="w-full">
                            <Tabs value={currentTab} onChange={(e, newVal) => setCurrentTab(newVal)} sx={{ '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' }, '& .Mui-selected': { color: '#0284c7' } }}>
                                <Tab label="CHI PHÍ HẰNG NGÀY" />
                                <Tab label="BÁO CÁO TỔNG HỢP" />
                            </Tabs>
                        </Box>

                        {/* HÀNG 2: GỘP BỘ LỌC VÀ WIDGET QUỸ VÀO CÙNG DÒNG */}
                        <Box className="flex flex-col-reverse md:flex-row justify-between items-center w-full gap-4">
                            <Box className="w-full md:w-auto flex-1">
                                <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                            </Box>
                            <Box className="w-full md:w-auto flex justify-center md:justify-end">
                                <QuyChiPhiWidget />
                            </Box>
                        </Box>
                    </Box>
                )
            ) : (
                <Box className="flex flex-col-reverse md:flex-row justify-between items-center mt-3 w-full gap-4">
                    <Box className="w-full md:w-auto flex-1">
                        <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    </Box>
                    <Box className="w-full md:w-auto flex justify-center md:justify-end mb-2">
                        <QuyChiPhiWidget />
                    </Box>
                </Box>
            )}

            <Box className="flex-1 overflow-y-auto mt-2">
                {isAdmin ? (
                    <>
                        {currentTab === 0 && <ChiPhiHangNgay danhSachChiPhi={danhSachChiPhi} isLoading={isLoading} filter={filter} onAdd={handleAddChiPhi} onDelete={handleDeleteChiPhi} />}
                        {currentTab === 1 && <BaoCaoChiPhi danhSachChiPhi={danhSachChiPhi} filter={filter} isLoading={isLoading} onDelete={handleDeleteChiPhi} />}
                    </>
                ) : (
                    <ChiPhiHangNgay danhSachChiPhi={danhSachChiPhi} isLoading={isLoading} filter={filter} onAdd={handleAddChiPhi} onDelete={handleDeleteChiPhi} />
                )}
            </Box>

            {/* MODAL XÁC NHẬN XÓA CHUNG CỦA PAGE */}
            {isConfirmOpen && (
                <ConfirmModal isOpen={isConfirmOpen} title="Xác nhận xóa" message="Bạn có chắc chắn muốn xóa chi phí này không?" onCancel={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete} />
            )}
        </Box>
    );
};

export default ChiPhiPage;