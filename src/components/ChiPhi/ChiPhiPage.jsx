import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Box, Tabs, Tab, OutlinedInput, InputAdornment, IconButton, Divider, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import ConfirmModal from './ConfirmModal';
import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiHangNgay from './ChiPhiHangNgay';
import BaoCaoChiPhi from './BaoCaoChiPhi';
import BaoCaoThuChi from './BaoCaoThuChi';
import QuyChiPhiWidget from './QuyChiPhiWidget';

import { fetchChiPhi, addChiPhi, deleteChiPhi, fetchLoaiChiPhi, fetchQuyChiPhi } from '../../redux/slices/chiPhiSlice';
import { getChiPhiSelector } from '../../redux/selector';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

const TAB_STYLES = {
    minHeight: 'unset',
    '& .MuiTab-root': {
        minHeight: 'unset !important',
        padding: '16px 0 8px 0 !important',
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        gap: '16px'
    },
    '& .MuiTabs-indicator': {
        height: 2,
    },
};

// --- TÁCH SEARCH INPUT ---
const SearchInput = React.memo(({ onSearch }) => {
    const [localValue, setLocalValue] = useState('');
    // Mobile là dưới 900px, từ 900px trở lên nó có cột riêng nên được phép bung đủ 240px
    const isMobile = useMediaQuery('(max-width:899px)');

    const handleSearch = () => {
        onSearch(localValue);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <OutlinedInput
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm tên chi phí..."
            size="small"
            endAdornment={
                <InputAdornment position="end" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Divider
                        orientation="vertical"
                        sx={{ height: 24, mx: 0.5, borderColor: '#cbd5e1' }}
                    />
                    <IconButton onClick={handleSearch} edge="end" sx={{ p: 0.5, mr: 0.5 }}>
                        <SearchIcon sx={{ color: '#0ea5e9', fontSize: 24, '&:hover': { color: '#0284c7' } }} />
                    </IconButton>
                </InputAdornment>
            }
            sx={{
                width: isMobile ? '100%' : '240px',
                transition: 'width 0.3s ease-in-out',
                bgcolor: '#ffffff',
                borderRadius: '10px',
                height: '42px',
                paddingRight: '4px',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                '& fieldset': { borderColor: '#e2e8f0', transition: 'border-color 0.2s' },
                '&:hover fieldset': { borderColor: '#bae6fd' },
                '&.Mui-focused fieldset': { borderColor: '#0ea5e9', borderWidth: '1px' },
                '& .MuiInputBase-input': {
                    fontSize: '1rem',
                    color: '#0f172a',
                    '&::placeholder': { color: '#94a3b8', opacity: 1 }
                }
            }}
        />
    );
});

const ChiPhiPage = () => {
    const dispatch = useDispatch();
    const { danhSachChiPhi, isLoading } = useSelector(getChiPhiSelector);

    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.quyenSuDung?.ten?.toLowerCase() === "admin" || user?.appRole?.toLowerCase() === "admin";

    // Phân rã thành 3 mốc rõ ràng để kiểm soát Grid
    const isDesktop = useMediaQuery('(min-width:1050px)');
    const isTablet = useMediaQuery('(min-width:900px) and (max-width:1049px)');
    const isMobile = !isDesktop && !isTablet;

    const now = dayjs().tz('Asia/Ho_Chi_Minh');
    const [filter, setFilter] = useState({ ngay: 0, thang: now.month() + 1, nam: now.year() });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTab, setCurrentTab] = useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        dispatch(fetchChiPhi(filter));
        dispatch(fetchLoaiChiPhi());
        dispatch(fetchQuyChiPhi());
    }, [dispatch, filter]);

    const handleAddChiPhi = useCallback((data) => {
        dispatch(addChiPhi(data));
    }, [dispatch]);

    const handleDeleteChiPhi = useCallback((id) => {
        setItemToDelete(id);
        setIsConfirmOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (itemToDelete) {
            // Thêm .then() để đợi xóa xong thì tải lại dữ liệu mới nhất
            dispatch(deleteChiPhi(itemToDelete)).then(() => {
                dispatch(fetchChiPhi(filter));
            });
        }
        setIsConfirmOpen(false);
        setItemToDelete(null);
    }, [dispatch, itemToDelete, filter]);

    const handleCommitSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    const danhSachChiPhiFiltered = useMemo(() => {
        if (!searchTerm.trim()) return danhSachChiPhi;
        const term = searchTerm.toLowerCase().trim();
        return danhSachChiPhi.filter(item => item.tenChiPhi?.toLowerCase().includes(term));
    }, [danhSachChiPhi, searchTerm]);

    const tabBar = useMemo(() => (
        <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={TAB_STYLES}>
            <Tab sx={{ mr: isDesktop ? 4 : 2 }} label="CHI PHÍ HẰNG NGÀY" />
            <Tab label="BÁO CÁO TỔNG HỢP" />
        </Tabs>
    ), [currentTab, isDesktop]);

    return (
        <Box className="bg-slate-50 px-2 mb-2 relative flex flex-col" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

            {isAdmin ? (
                <Box sx={{
                    mt: 1, mb: 2,
                    display: 'grid',
                    gap: isMobile ? 2 : 1.5,
                    gridTemplateColumns: isMobile ? '1fr' : '1fr auto', // Cả Tablet và Desktop đều 2 cột
                    gridTemplateAreas: isDesktop
                        ? '"tabs right-panel" "filter right-panel"' // Desktop: Nằm chung nhóm phải
                        : isTablet
                            ? '"tabs search" "filter widget"' // Tablet: Tách ra cột 2 dòng 1 (Search) và cột 2 dòng 2 (Widget)
                            : '"tabs" "search" "widget" "filter"', // Mobile: Dọc từ trên xuống
                }}>
                    <Box sx={{ gridArea: 'tabs', display: 'flex', alignItems: 'flex-start', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        {tabBar}
                    </Box>

                    <Box sx={{ mt: isMobile ? 1 : 2, gridArea: 'filter', display: 'flex', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    </Box>

                    {/* DESKTOP (>= 1050px) */}
                    {isDesktop && (
                        <Box sx={{
                            gridArea: 'right-panel',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            gap: 1.5,
                            mt: 1
                        }}>
                            {currentTab === 0 && <SearchInput onSearch={handleCommitSearch} />}
                            {currentTab === 0
                                ? <QuyChiPhiWidget />
                                : <Box sx={{ width: '100%', minWidth: '300px' }}><BaoCaoThuChi filter={filter} /></Box>
                            }
                        </Box>
                    )}

                    {/* TABLET (900-1049px) VÀ MOBILE (<900px) */}
                    {!isDesktop && (
                        <>
                            {currentTab === 0 && (
                                <Box sx={{ gridArea: 'search', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', mt: isTablet ? 1 : 0 }}>
                                    <SearchInput onSearch={handleCommitSearch} />
                                </Box>
                            )}
                            <Box sx={{ gridArea: 'widget', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                                {currentTab === 0
                                    ? <QuyChiPhiWidget />
                                    : <Box sx={{ width: '100%', minWidth: '300px' }}><BaoCaoThuChi filter={filter} /></Box>
                                }
                            </Box>
                        </>
                    )}
                </Box>
            ) : (
                <Box sx={{
                    mt: isMobile ? 1 : 2, mb: 1,
                    display: 'grid',
                    gap: isMobile ? 2 : 1.5,
                    gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
                    gridTemplateAreas: isDesktop
                        ? '"filter right-panel"'
                        : isTablet
                            ? '"filter search" "filter widget"' // Dùng chung logic cho giao diện không có admin
                            : '"search" "widget" "filter"',
                }}>
                    <Box sx={{ gridArea: 'filter', display: 'flex', alignItems: isTablet ? 'center' : 'flex-end', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <ChiPhiFilterBar filter={filter} setFilter={setFilter} />
                    </Box>
                    {isDesktop ? (
                        <Box sx={{ gridArea: 'right-panel', display: 'flex', gap: 1.5, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                            <SearchInput onSearch={handleCommitSearch} />
                            <QuyChiPhiWidget />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ gridArea: 'search', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <SearchInput onSearch={handleCommitSearch} />
                            </Box>
                            <Box sx={{ gridArea: 'widget', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                                <QuyChiPhiWidget />
                            </Box>
                        </>
                    )}
                </Box>
            )}

            <Box className="flex-1 mt-2" sx={{ minHeight: 0, overflow: 'hidden' }}>
                {isAdmin ? (
                    <>
                        {currentTab === 0 && (
                            <ChiPhiHangNgay
                                danhSachChiPhi={danhSachChiPhiFiltered}
                                isLoading={isLoading}
                                filter={filter}
                                onAdd={handleAddChiPhi}
                                onDelete={handleDeleteChiPhi}
                            />
                        )}
                        {currentTab === 1 && (
                            <BaoCaoChiPhi
                                danhSachChiPhi={danhSachChiPhiFiltered}
                                filter={filter}
                                isLoading={isLoading}
                                onDelete={handleDeleteChiPhi}
                            />
                        )}
                    </>
                ) : (
                    <ChiPhiHangNgay
                        danhSachChiPhi={danhSachChiPhiFiltered}
                        isLoading={isLoading}
                        filter={filter}
                        onAdd={handleAddChiPhi}
                        onDelete={handleDeleteChiPhi}
                    />
                )}
            </Box>

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