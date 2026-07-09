import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ConfirmModal from './ConfirmModal';
import { Box, Tabs, Tab } from '@mui/material';

import { fetchChiPhi, addChiPhi, deleteChiPhi, fetchLoaiChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiHangNgay from './ChiPhiHangNgay';
import BaoCaoChiPhi from './BaoCaoChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi';

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
        <Box className="bg-slate-50 px-2 mb-2 relative flex flex-col"
            style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

            {/* PHẦN ĐẦU: Tabs + Filter + Báo cáo thu chi */}
            {isAdmin ? (
                currentTab === 1 ? (
                    // TAB "Báo Cáo Tổng Hợp": grid 2 cột x 2 dòng, chiều cao 2 dòng chia tỉ lệ 4/6
                    // Cột 1 dòng 1: Tabs | Cột 1 dòng 2: Filter | Cột 2 (2 dòng): BaoCaoThuChi
                    <Box
                        className="mt-3 mb-4 gap-4"
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gridTemplateRows: '4fr 6fr',
                            gridTemplateAreas: {
                                xs: `"tabs" "filter" "report"`,
                                md: `"tabs report" "filter report"`,
                            },
                        }}
                    >
                        <Box sx={{ gridArea: 'tabs', display: 'flex' }}>
                            <Tabs
                                value={currentTab}
                                onChange={(e, newVal) => setCurrentTab(newVal)}
                                sx={{
                                    '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' },
                                    '& .Mui-selected': { color: '#0284c7' }
                                }}
                            >
                                <Tab label="CHI PHÍ HẰNG NGÀY" />
                                <Tab label="BÁO CÁO TỔNG HỢP" />
                            </Tabs>
                        </Box>

                        <Box sx={{ gridArea: 'filter', display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
                            <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                        </Box>

                        <Box sx={{ gridArea: 'report', display: 'flex', alignItems: 'flex-end' }}>
                            <Box sx={{ width: '100%' }}>
                                <BaoCaoThuChi filter={filter} />
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    // TAB "Chi Phí Hằng Ngày": chỉ có Tabs + Filter, không có BaoCaoThuChi
                    <Box className="flex flex-col mt-3 gap-14 ">
                        <Tabs
                            value={currentTab}
                            onChange={(e, newVal) => setCurrentTab(newVal)}
                            sx={{
                                '& .MuiTab-root': { fontWeight: 600, fontSize: '0.95rem', textTransform: 'none' },
                                '& .Mui-selected': { color: '#0284c7' }
                            }}
                        >
                            <Tab label="CHI PHÍ HẰNG NGÀY" />
                            <Tab label="BÁO CÁO TỔNG HỢP" />
                        </Tabs>

                        <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    </Box>
                )
            ) : (
                // KHÔNG PHẢI ADMIN: Filter luôn nằm bên trái
                <Box className="flex justify-start items-end mt-3 gap-4">
                    <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                </Box>
            )}

            {/* CUỐI CÙNG: NỘI DUNG BÊN DƯỚI (Form / Table) */}
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
                <ConfirmModal
                    isOpen={isConfirmOpen}
                    title="Xác nhận xóa"
                    message="Bạn có chắc chắn muốn xóa chi phí này không?"
                    onCancel={() => setIsConfirmOpen(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </Box>
    );
};

export default ChiPhiPage;