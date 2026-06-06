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
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 56;

const REPORT_MENU = [
    { path: '/bao-cao', label: 'Sản lượng theo thời gian', icon: <BarChartIcon fontSize="small" /> },
    { path: '/bao-cao/khach-hang', label: 'Sản lượng theo khách hàng', icon: <PeopleAltIcon fontSize="small" /> },
    { path: '/bao-cao/doanh-thu', label: 'Doanh thu theo tháng', icon: <AttachMoneyIcon fontSize="small" /> },
];

const SidebarContent = ({ collapsed, onCollapse, onNavigate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    const getItemSx = (active) => ({
        justifyContent: 'flex-start',
        width: 'calc(100% - 16px)',
        margin: '2px 8px',
        pl: 1.5,
        pr: 1.5,
        borderRadius: 2,
        backgroundColor: active ? '#bfdbfe' : 'transparent',
        '&:hover': { backgroundColor: active ? '#93c5fd' : 'rgba(0,0,0,0.04)' },
        overflow: 'hidden',
        transition: theme.transitions.create('padding-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    });

    const iconSx = {
        minWidth: 24,
        width: 24,
        mr: collapsed ? 0 : 2,
        justifyContent: 'center',
        flexShrink: 0,
        color: 'inherit',
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Header với nút toggle ở góc phải */}
            <Box sx={{
                px: 1.5,
                bgcolor: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 48,
                overflow: 'hidden',
            }}>


                {/* Nút toggle nằm ngay header */}
                <Tooltip title={collapsed ? 'Mở rộng' : 'Thu gọn'} placement="right" arrow>
                    <IconButton
                        onClick={onCollapse}
                        size="small"
                        sx={{
                            color: 'white',
                            flexShrink: 0,
                            bgcolor: '#0EA5A4',
                            ml: collapsed ? 'auto' : 0,
                            mr: collapsed ? 'auto' : 0,
                            '&:hover': { bgcolor: '#0D9488', color: 'white' },
                        }}
                    >
                        {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Menu items */}
            <List sx={{ pt: 1, flex: 1 }}>
                {REPORT_MENU.map((item) => {
                    const isActive =
                        location.pathname === item.path ||
                        (item.path === '/bao-cao' && location.pathname === '/bao-cao/san-luong');

                    const button = (
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path);
                                onNavigate?.();
                            }}
                            sx={getItemSx(isActive)}
                        >
                            <ListItemIcon sx={{ ...iconSx, color: isActive ? '#1d4ed8' : '#64748b' }}>
                                {item.icon}
                            </ListItemIcon>
                            {!collapsed && (
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'normal', lineHeight: 1.4 }}
                                />
                            )}
                        </ListItemButton>
                    );

                    return (
                        <ListItem key={item.path} disablePadding>
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
    const [collapsed, setCollapsed] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                        onCollapse={() => setCollapsed(v => !v)}
                    />
                </Box>
            )}

            {/* ── MOBILE: Drawer trượt ── */}
            {isMobile && (
                <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: SIDEBAR_EXPANDED }} role="presentation">
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