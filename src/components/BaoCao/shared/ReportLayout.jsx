import React, { useState } from 'react';
import {
    Box, Drawer, IconButton, Typography, Tooltip,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    useMediaQuery, useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_EXPANDED = 265;
const SIDEBAR_COLLAPSED = 56;

const REPORT_MENU = [
    { path: '/bao-cao', label: 'Sản lượng theo thời gian', icon: <BarChartIcon fontSize="small" /> },
    { path: '/bao-cao/khach-hang', label: 'Sản lượng theo khách hàng', icon: <PeopleAltIcon fontSize="small" /> },
    { path: '/bao-cao/doanh-so', label: 'Doanh số theo khách hàng', icon: <StorefrontIcon fontSize="small" /> },
    { path: '/bao-cao/doanh-so-san-pham', label: 'Doanh số theo sản phẩm', icon: <Inventory2Icon fontSize="small" /> },
    { path: '/bao-cao/doanh-so-thoi-gian', label: 'Doanh số theo thời gian', icon: <TimelineIcon fontSize="small" /> },
    { path: '/bao-cao/doanh-thu', label: 'Doanh thu theo tháng', icon: <AttachMoneyIcon fontSize="small" /> },
];

const SidebarContent = ({ collapsed, onCollapse, onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const TRANSITION = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

    // Màu riêng cho từng item
    const ITEM_COLORS = [
        { bg: '#ede9fe', border: '#a78bfa', icon: '#7c3aed' }, // tím
        { bg: '#dbeafe', border: '#60a5fa', icon: '#1d4ed8' }, // xanh dương
        { bg: '#dcfce7', border: '#4ade80', icon: '#15803d' }, // xanh lá
        { bg: '#fef9c3', border: '#facc15', icon: '#a16207' }, // vàng
        { bg: '#ffedd5', border: '#fdba74', icon: '#ea580c' }, // cam
        { bg: '#fee2e2', border: '#f87171', icon: '#b91c1c' }, // đỏ
    ];

    const getItemSx = (active) => collapsed ? ({
        // collapsed: button hoàn toàn transparent, không borderRadius để tránh animate ellipse
        justifyContent: 'center',
        alignItems: 'center',
        width: 44,
        height: 44,
        minWidth: 0,
        mx: 'auto',
        my: '2px',
        p: 0,
        borderRadius: 0,
        backgroundColor: 'transparent !important',
        outline: 'none',
        border: 'none',
        transition: 'none',
        '&:hover': { backgroundColor: 'transparent !important' },
        '&:focus': { outline: 'none', border: 'none', backgroundColor: 'transparent !important' },
        '&.Mui-focusVisible': { outline: 'none', border: 'none', backgroundColor: 'transparent !important', boxShadow: 'none' },
        overflow: 'visible',
    }) : ({
        justifyContent: 'flex-start',
        width: '100%',
        margin: '2px 0',
        pl: 1,
        pr: 1,
        py: 1.2,
        borderRadius: 2,
        backgroundColor: active ? '#bfdbfe' : 'transparent',
        '&:hover': {
            backgroundColor: active ? '#93c5fd' : 'rgba(0,0,0,0.04)'
        },
        overflow: 'hidden',
    });

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header */}
            <Box sx={{
                px: 1.5,
                bgcolor: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48,
                overflow: 'hidden',
            }}>
                {/* Nút collapse — chỉ hiện trên desktop */}
                {!onNavigate && (
                    <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn'} placement="right" arrow>
                        <IconButton
                            onClick={onCollapse}
                            size="small"
                            sx={{
                                color: 'white',
                                flexShrink: 0,
                                bgcolor: '#0EA5A4',
                                transition: TRANSITION,
                                '&:hover': { bgcolor: '#0D9488', color: 'white' },
                            }}
                        >
                            {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                )}

                {/* Nút đóng — chỉ hiện trên mobile, góc trên bên phải */}
                {onNavigate && (
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                        <Tooltip title="Đóng" placement="left" arrow>
                            <IconButton
                                onClick={onNavigate}
                                size="small"
                                sx={{
                                    color: 'white',
                                    flexShrink: 0,
                                    bgcolor: '#0EA5A4',
                                    transition: TRANSITION,
                                    '&:hover': { bgcolor: '#0D9488', color: 'white' },
                                }}
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>

            {/* Menu items */}
            <List sx={{ pt: 1, flex: 1 }}>
                {REPORT_MENU.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path === '/bao-cao' && location.pathname === '/bao-cao/san-luong');

                    const button = (
                        <ListItemButton
                            onClick={() => { navigate(item.path); onNavigate?.(); }}
                            sx={getItemSx(isActive)}
                            disableRipple={collapsed}
                            disableTouchRipple={collapsed}
                        >
                            {/* Icon — có vòng tròn riêng khi collapsed, plain khi expanded */}
                            <Box sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                ml: collapsed ? 0 : '4px',
                                transition: TRANSITION,
                                // Chỉ hiện bg + border khi collapsed
                                ...(collapsed ? {
                                    backgroundColor: ITEM_COLORS[REPORT_MENU.indexOf(item)].bg,
                                    border: `1.5px solid ${ITEM_COLORS[REPORT_MENU.indexOf(item)].border}`,
                                    '&:hover': {
                                        filter: 'brightness(0.93)',
                                    },
                                } : {
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                }),
                                color: collapsed
                                    ? ITEM_COLORS[REPORT_MENU.indexOf(item)].icon
                                    : (isActive ? '#1d4ed8' : '#64748b'),
                            }}>
                                {item.icon}
                            </Box>

                            {/* Label — ẩn khi collapsed */}
                            {!collapsed && (
                                <Box sx={{ flexShrink: 0, ml: 2 }}>
                                    <Box sx={{
                                        width: 200,
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.4,
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#1d4ed8' : '#1e293b',
                                        pr: 2,
                                    }}>
                                        {item.label}
                                    </Box>
                                </Box>
                            )}
                        </ListItemButton>
                    );

                    return (
                        <ListItem
                            key={item.path}
                            disablePadding
                            sx={collapsed ? { justifyContent: 'center' } : {}}
                        >
                            {collapsed ? (
                                <Tooltip title={item.label} placement="right" arrow>
                                    {button}
                                </Tooltip>
                            ) : button}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

const ReportLayout = ({ children, title }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem('sidebar-collapsed') === 'true'; }
        catch { return false; }
    });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const toggleCollapsed = () => setCollapsed(v => {
        const next = !v;
        try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { }
        return next;
    });

    const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

    return (
        <Box sx={{ display: 'flex', height: '100%', width: '100%', bgcolor: '#f9fafb' }}>

            {/* ── DESKTOP: Sidebar tĩnh có collapse ── */}
            {!isMobile && (
                <Box
                    className="no-print"
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        bgcolor: 'white',
                        borderRight: '1px solid #e5e7eb',
                        boxShadow: '2px 0 6px rgba(0,0,0,0.04)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }}
                >
                    <SidebarContent
                        collapsed={collapsed}
                        onCollapse={toggleCollapsed}
                    />
                </Box>
            )}

            {/* ── MOBILE: Drawer trượt ── */}
            {isMobile && (
                <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: SIDEBAR_EXPANDED, pt: '68px' }} role="presentation">
                        <SidebarContent
                            collapsed={false}
                            onCollapse={() => { }}
                            onNavigate={() => setDrawerOpen(false)}
                        />
                    </Box>
                </Drawer>
            )}

            {/* ── Content area ── */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Header */}
                <Box
                    className="no-print"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 3,
                        py: 1.5,
                        minHeight: 40,
                        maxHeight: 48,
                    }}
                >
                    {isMobile && (
                        <IconButton
                            onClick={() => setDrawerOpen(true)}
                            sx={{ bgcolor: '#f3f4f6', '&:hover': { bgcolor: '#e5e7eb' } }}
                        >
                            <MenuIcon sx={{ color: '#1e3a8a' }} />
                        </IconButton>
                    )}
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "black" }}
                    >
                        {title || 'Báo Cáo Thống Kê'}
                    </Typography>
                </Box>

                {/* Page content */}
                <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
                    {children}
                </Box>
            </Box>

            <style>{`
                    .print-only { display: none; }
                    @media print {
                        .no-print { display: none !important; }
                        header, nav, aside, .MuiDrawer-root { display: none !important; }
                        .print-only { display: block !important; }
                        @page { size: A4 portrait; margin: 0 !important; }
                        body { background: white !important; margin: 0 !important; padding: 15mm 20mm !important; }
                    }
                `}</style>
        </Box>
    );
};

export default ReportLayout;