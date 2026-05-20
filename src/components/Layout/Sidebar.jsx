import React, { useState, useEffect } from "react";
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
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import PaymentsIcon from "@mui/icons-material/Payments";
import BadgeIcon from "@mui/icons-material/Badge";

import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// IMPORT HÀM PHÂN QUYỀN
import { hasRouteAccess } from "../../config/permissions";

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. LOGIC LẤY THÔNG TIN USER TỪ FILE 1
  const auth = useSelector((state) => state.auth);
  const currentUser = auth?.user;

  useEffect(() => {
    console.log("Quyền sử dụng của bạn là ", auth?.user?.quyenSuDung?.ten);
  }, [auth]);

  // 2. LOGIC RESPONSIVE VÀ LAYOUT TỪ FILE 2
  const theme = useTheme();
  const isMobileSize = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Kích thước & Trạng thái Drawer
  const drawerWidth = isMobileSize ? 250 : collapsed ? 74 : 250;
  const isOpen = isMobileSize || !collapsed;

  /* ===== MENU DATA ===== */
  const menu = [
    { name: "Thống kê", router: "/", icon: <Dashboard /> },
    { name: "Đơn Hàng", router: "/don-hang", icon: <ShoppingCart /> },
    {
      name: "Kế Hoạch Giao Hàng",
      router: "/ke-hoach-giao-hang",
      icon: <Assignment />,
    },
    {
      name: "Chờ xuất hóa đơn",
      router: "/cho-xuat-hoa-don",
      icon: <ReceiptLong />,
    },
    { name: "Hóa Đơn", router: "/hoa-don", icon: <RequestQuoteIcon /> },
    {
      name: "Phiếu Thu",
      router: "/phieu-thu",
      icon: <AccountBalanceWalletIcon />,
    },

    { name: "Phiếu Bảo Hành", router: "/phieu-bao-hanh", icon: <Receipt /> },
    {
      name: "Mẫu Thẻ Bảo Hành",
      router: "/mau-the-bao-hanh",
      icon: <Category />,
    },
    { name: "Sản Phẩm", router: "/san-pham", icon: <Category /> },
    { name: "Công Đoạn", router: "/cong-doan", icon: <AccountTree /> },
  ];

  const customerMenu = [
    { name: "Nha Khoa", router: "/nha-khoa", icon: <LocalHospital /> },
    { name: "Người liên hệ", router: "/nguoi-lien-he", icon: <Contacts /> },
    { name: "Bệnh nhân", router: "/benh-nhan", icon: <People /> },
  ];

  const otherMenu = [
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

  /* ===== LỌC MENU DỰA TRÊN QUYỀN (SỬ DỤNG currentUser) ===== */
  const filteredMainMenu = menu.filter((item) =>
    hasRouteAccess(currentUser, item.router)
  );
  const filteredCustomerMenu = customerMenu.filter((item) =>
    hasRouteAccess(currentUser, item.router)
  );
  const filteredOtherMenu = otherMenu.filter((item) =>
    hasRouteAccess(currentUser, item.router)
  );
  const filteredSettingMenu = settingMenu.filter((item) =>
    hasRouteAccess(currentUser, item.router)
  );

  const hasCustomerGroup = filteredCustomerMenu.length > 0;
  const hasSettingGroup = filteredSettingMenu.length > 0;

  /* ===== ACTIVE STATE & ĐIỀU HƯỚNG ===== */
  const checkActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const [openCustomer, setOpenCustomer] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);

  useEffect(() => {
    if (customerMenu.some((item) => location.pathname.startsWith(item.router)))
      setOpenCustomer(true);
    if (settingMenu.some((item) => location.pathname.startsWith(item.router)))
      setOpenSetting(true);
  }, [location.pathname]);

  const handleNavigate = (router) => {
    navigate(router);
    if (isMobileSize) setMobileOpen(false);
  };

  /* ===== ĐỒNG BỘ STYLES CHUẨN PIXEL ===== */
  const getListItemSx = (paddingLeft, active = false) => ({
    justifyContent: "flex-start",
    width: "calc(100% - 16px)", // Chiếm full trừ đi 16px (margin 2 bên)
    margin: "4px 8px", // Ép margin 8px cố định để bg luôn nằm giữa
    pl: paddingLeft,
    pr: 1.5,
    borderRadius: 2,
    backgroundColor: active ? "#bfdbfe" : "transparent",
    "&:hover": { backgroundColor: active ? "#93c5fd" : "rgba(0, 0, 0, 0.04)" },
    overflow: "hidden",
    transition: "padding-left 0.2s", // Hiệu ứng đẩy lùi text khi thụt lề
  });

  const iconSx = {
    minWidth: 24,
    width: 24,
    mr: 2, // Đẩy chữ cách icon đúng 16px
    justifyContent: "center",
    flexShrink: 0,
    color: "inherit",
  };

  /* ===== RENDER MENU ITEM ===== */
  const renderMenuItem = (item, nested = false) => {
    const active = checkActive(item.router);
    // 🚨 FIX QUAN TRỌNG: Nếu là menu con, chỉ thụt lề khi sidebar MỞ. Nếu ĐÓNG, lùi về 1.5 bằng hàng với cha.
    const paddingLeft = nested && isOpen ? 3.5 : 1.5;

    return (
      <Tooltip
        key={item.router}
        title={!isOpen ? item.name : ""}
        placement="right"
        disableHoverListener={isOpen}
      >
        <ListItemButton
          onClick={() => handleNavigate(item.router)}
          sx={getListItemSx(paddingLeft, active)}
        >
          <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.name} sx={{ whiteSpace: "nowrap" }} />
        </ListItemButton>
      </Tooltip>
    );
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ px: 2, overflow: "hidden" }}>
        <Box
          sx={{
            fontWeight: 700,
            fontSize: 18,
            color: "#2563eb",
            whiteSpace: "nowrap",
          }}
        >
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
              // Luôn là 1.5, không truyền active để không bao giờ bị tô màu
              sx={getListItemSx(1.5, false)}
            >
              <ListItemIcon sx={iconSx}>
                <People />
              </ListItemIcon>
              <ListItemText
                primary="Quản lý khách hàng"
                sx={{ whiteSpace: "nowrap" }}
              />
              {/* Chỉ hiện mũi tên khi mở rộng, tránh bị dồn ép layout khi thu nhỏ */}
              {isOpen &&
                (openCustomer ? (
                  <ExpandLess sx={{ flexShrink: 0 }} />
                ) : (
                  <ExpandMore sx={{ flexShrink: 0 }} />
                ))}
            </ListItemButton>
            {/* Vẫn cho xổ xuống ngay cả khi sidebar chỉ có icon */}
            <Collapse in={openCustomer} timeout="auto" unmountOnExit>
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
              sx={getListItemSx(1.5, false)}
            >
              <ListItemIcon sx={iconSx}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Thiết lập" sx={{ whiteSpace: "nowrap" }} />
              {isOpen &&
                (openSetting ? (
                  <ExpandLess sx={{ flexShrink: 0 }} />
                ) : (
                  <ExpandMore sx={{ flexShrink: 0 }} />
                ))}
            </ListItemButton>
            <Collapse in={openSetting} timeout="auto" unmountOnExit>
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
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1201,
            bgcolor: "#fff",
            boxShadow: 2,
            "&:hover": { bgcolor: "#f3f4f6" },
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
          whiteSpace: "nowrap",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowY: "auto",
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#d1d5db",
              borderRadius: "10px",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
