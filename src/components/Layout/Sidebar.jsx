import React, { useState } from "react";
import {
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Tooltip,
  useMediaQuery,
  useTheme,
  IconButton,
  Box,
} from "@mui/material";

import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  ShoppingCart,
  LocalHospital,
  Contacts,
  People,
  Assignment,
  Receipt,
  BarChart,
  Settings,
  Category,
  AccountTree,
  ReceiptLong,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import PaymentsIcon from "@mui/icons-material/Payments";
import BadgeIcon from "@mui/icons-material/Badge";

import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import { hasRouteAccess } from "../../config/permissions";

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(getAuthSelector);

  const theme = useTheme();
  // Check xem màn hình có đang ở kích thước Mobile/Tablet không
  const isMobileSize = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Độ rộng sidebar: Nếu là màn hình nhỏ thì luôn là 250 khi mở, màn hình lớn mới theo biến collapsed
  const drawerWidth = isMobileSize ? 250 : (collapsed ? 64 : 250);

  /* ===== MENU DATA ===== */
  const menu = [
    { name: "Thống kê", router: "/", icon: <Dashboard /> },
    { name: "Đơn Hàng", router: "/don-hang", icon: <ShoppingCart /> },
    { name: "Sản Phẩm", router: "/san-pham", icon: <Category /> },
    { name: "Công Đoạn", router: "/cong-doan", icon: <AccountTree /> },
  ];

  const customerMenu = [
    { name: "Nha Khoa", router: "/nha-khoa", icon: <LocalHospital /> },
    { name: "Người liên hệ", router: "/nguoi-lien-he", icon: <Contacts /> },
    { name: "Bệnh nhân", router: "/benh-nhan", icon: <People /> },
  ];

  const otherMenu = [
    { name: "Kế Hoạch Giao Hàng", router: "/ke-hoach-giao-hang", icon: <Assignment /> },
    { name: "Chờ xuất hóa đơn", router: "/cho-xuat-hoa-don", icon: <ReceiptLong /> },
    { name: "Hóa Đơn", router: "/hoa-don", icon: <Receipt /> },
    { name: "Phiếu Thu", router: "/phieu-thu", icon: <Receipt /> },
    { name: "Báo Cáo", router: "/bao-cao", icon: <BarChart /> },
    { name: "Nhân viên", router: "/nhan-vien", icon: <BadgeIcon /> },
    { name: "Bảng lương", router: "/bang-luong", icon: <PaymentsIcon /> },
  ];

  const settingMenu = [
    { name: "Tài khoản", router: "/tai-khoan", icon: <People /> },
    { name: "Nhập dữ liệu", router: "/nhap-du-lieu", icon: <Assignment /> },
    { name: "Công ty", router: "/cong-ty", icon: <LocalHospital /> },
    { name: "Quyền sử dụng", router: "/quyen-su-dung", icon: <People /> },
  ];

  const filteredMainMenu = menu.filter((item) => hasRouteAccess(user, item.router));
  const filteredCustomerMenu = customerMenu.filter((item) => hasRouteAccess(user, item.router));
  const filteredOtherMenu = otherMenu.filter((item) => hasRouteAccess(user, item.router));
  const filteredSettingMenu = settingMenu.filter((item) => hasRouteAccess(user, item.router));

  const hasCustomerGroup = filteredCustomerMenu.length > 0;
  const hasSettingGroup = filteredSettingMenu.length > 0;

  const checkActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const [openCustomer, setOpenCustomer] = useState(
    customerMenu.some(item => location.pathname.startsWith(item.router))
  );
  const [openSetting, setOpenSetting] = useState(
    settingMenu.some(item => location.pathname.startsWith(item.router))
  );

  const handleNavigate = (router) => {
    navigate(router);
    if (isMobileSize) setMobileOpen(false);
  };

  /* ===== RENDER MENU ITEM ===== */
  const renderMenuItem = (item, nested = false) => {
    const active = checkActive(item.router);

    // QUAN TRỌNG: Nếu là màn hình nhỏ (isMobileSize) thì LUÔN hiện chữ.
    // Nếu màn hình lớn thì hiện chữ khi KHÔNG collapsed.
    const showText = isMobileSize ? true : !collapsed;

    const paddingLeft = nested && showText ? 3.5 : 1.5;

    return (
      <Tooltip
        key={item.router}
        title={collapsed && !isMobileSize ? item.name : ""}
        placement="right"
        disableHoverListener={!collapsed || isMobileSize}
      >
        <ListItemButton
          onClick={() => handleNavigate(item.router)}
          sx={{
            justifyContent: "flex-start",
            pl: paddingLeft,
            pr: 1.5,
            ml: 1,
            mr: 1,
            mb: 0.5,
            borderRadius: 2,
            minWidth: 48,
            transition: "all 0.2s",
            backgroundColor: active ? "#bfdbfe" : "transparent",
            color: "inherit",
            "&:hover": {
              backgroundColor: active ? "#93c5fd" : "rgba(0, 0, 0, 0.04)",
            }
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: showText ? 2 : 0,
              justifyContent: "center",
              color: "inherit",
            }}
          >
            {item.icon}
          </ListItemIcon>

          {showText && <ListItemText primary={item.name} />}
        </ListItemButton>
      </Tooltip>
    );
  };

  const scrollbarStyles = {
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": { width: "6px" },
    "&::-webkit-scrollbar-track": { background: "transparent" },
    "&::-webkit-scrollbar-thumb": { background: "#d1d5db", borderRadius: "10px" },
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ fontWeight: 700, fontSize: 18, color: "#2563eb", whiteSpace: "nowrap" }}>
          TẤN DENTAL
        </Box>
        {isMobileSize && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ ml: "auto" }}>
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>

      <List>
        {filteredMainMenu.map((item) => renderMenuItem(item))}

        {hasCustomerGroup && (
          <>
            <ListItemButton
              onClick={() => setOpenCustomer(!openCustomer)}
              sx={{ pl: 1.5, pr: 1.5, ml: 1, mr: 1, mb: 0.5, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: (isMobileSize || !collapsed) ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {(isMobileSize || !collapsed) && <ListItemText primary="Quản lý khách hàng" />}
              {(isMobileSize || !collapsed) && (openCustomer ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            <Collapse in={openCustomer && (isMobileSize || !collapsed)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {filteredCustomerMenu.map((item) => renderMenuItem(item, true))}
              </List>
            </Collapse>
          </>
        )}

        {filteredOtherMenu.map((item) => renderMenuItem(item))}

        {hasSettingGroup && (
          <>
            <ListItemButton
              onClick={() => setOpenSetting(!openSetting)}
              sx={{ pl: 1.5, pr: 1.5, ml: 1, mr: 1, mb: 0.5, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: (isMobileSize || !collapsed) ? 2 : 0 }}>
                <Settings />
              </ListItemIcon>
              {(isMobileSize || !collapsed) && <ListItemText primary="Thiết lập" />}
              {(isMobileSize || !collapsed) && (openSetting ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            <Collapse in={openSetting && (isMobileSize || !collapsed)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {filteredSettingMenu.map((item) => renderMenuItem(item, true))}
              </List>
            </Collapse>
          </>
        )}
      </List>
    </>
  );

  return (
    <>
      {isMobileSize && (
        <IconButton
          onClick={() => setMobileOpen(!mobileOpen)}
          sx={{
            position: "fixed", top: 12, left: 12,
            zIndex: 1201, // Đảm bảo bấm ăn 100% trên cả giả lập
            bgcolor: "#fff", boxShadow: 2,
            "&:hover": { bgcolor: "#f3f4f6" }
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobileSize ? "temporary" : "permanent"}
        open={isMobileSize ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            ...scrollbarStyles,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;