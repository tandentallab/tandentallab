import React, { useEffect, useState } from "react";
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

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Quyền sử dụng của bạn là ", auth?.user?.quyenSuDung?.ten);
  }, []);

  const drawerWidth = collapsed ? 72 : 250;

  /* ===== MENU ===== */
  const menu = [
    { name: "Thống kê", router: "/", icon: <Dashboard /> },
    { name: "Đơn Hàng", router: "/don-hang", icon: <ShoppingCart /> },
    { name: "Sản Phẩm", router: "/san-pham", icon: <Category /> },
    { name: "Công Đoạn", router: "/cong-doan", icon: <AccountTree /> },
  ];

  const customerMenu = [
    {
      name: "Nha Khoa",
      router: "/nha-khoa",
      icon: <LocalHospital />,
    },
    {
      name: "Người liên hệ",
      router: "/nguoi-lien-he",
      icon: <Contacts />,
    },
    {
      name: "Bệnh nhân",
      router: "/benh-nhan",
      icon: <People />,
    },
  ];

  const otherMenu = [
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
    {
      name: "Hóa Đơn",
      router: "/hoa-don",
      icon: <Receipt />,
    },
    {
      name: "Phiếu Thu",
      router: "/phieu-thu",
      icon: <Receipt />,
    },
    {
      name: "Báo Cáo",
      router: "/bao-cao",
      icon: <BarChart />,
    },
    {
      name: "Nhân viên",
      router: "/nhan-vien",
      icon: <BadgeIcon />,
    },
    {
      name: "Bảng lương",
      router: "/bang-luong",
      icon: <PaymentsIcon />,
    },
  ];

  const settingMenu = [
    {
      name: "Tài khoản",
      router: "/tai-khoan",
      icon: <People />,
    },
    {
      name: "Nhập dữ liệu",
      router: "/nhap-du-lieu",
      icon: <Assignment />,
    },
    {
      name: "Công ty",
      router: "/cong-ty",
      icon: <LocalHospital />,
    },
    {
      name: "Quyền sử dụng",
      router: "/quyen-su-dung",
      icon: <People />,
    },
  ];

  /* ===== ACTIVE ===== */
  const isActive = (path) => location.pathname === path;

  const isCustomerActive = customerMenu.some((item) =>
    location.pathname.includes(item.router)
  );

  const isSettingActive = settingMenu.some((item) =>
    location.pathname.includes(item.router)
  );

  const [openCustomer, setOpenCustomer] = useState(isCustomerActive);

  const [openSetting, setOpenSetting] = useState(isSettingActive);

  const handleNavigate = (router) => {
    navigate(router);

    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderMenuItem = (item, nested = false) => (
    <Tooltip
      key={item.router}
      title={collapsed && !isMobile ? item.name : ""}
      placement="right"
    >
      <ListItemButton
        onClick={() => handleNavigate(item.router)}
        sx={{
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",

          px: collapsed && !isMobile ? 1 : 2,

          pl: nested
            ? collapsed && !isMobile
              ? 1
              : 4
            : collapsed && !isMobile
            ? 1
            : 2,

          borderRadius: 2,
          mx: 1,
          mb: 0.5,
        }}
        className={`transition ${
          isActive(item.router)
            ? "bg-blue-100 text-blue-600"
            : "hover:bg-gray-100"
        }`}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: collapsed && !isMobile ? 0 : 2,
            justifyContent: "center",
          }}
          className={isActive(item.router) ? "text-blue-600" : ""}
        >
          {item.icon}
        </ListItemIcon>

        {(!collapsed || isMobile) && <ListItemText primary={item.name} />}
      </ListItemButton>
    </Tooltip>
  );

  const drawerContent = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        {(!collapsed || isMobile) && (
          <Box
            sx={{
              fontWeight: 700,
              fontSize: 18,
              color: "#2563eb",
            }}
          >
            Admin Panel
          </Box>
        )}

        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>

      <List>
        {/* ===== MENU CHÍNH ===== */}
        {menu.map((item) => renderMenuItem(item))}

        {/* ===== CUSTOMER MENU ===== */}
        <Tooltip
          title={collapsed && !isMobile ? "Quản lý khách hàng" : ""}
          placement="right"
        >
          <ListItemButton
            onClick={() => setOpenCustomer(!openCustomer)}
            sx={{
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",

              px: collapsed && !isMobile ? 1 : 2,

              borderRadius: 2,
              mx: 1,
              mb: 0.5,
            }}
            className={`transition ${
              isCustomerActive
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed && !isMobile ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <People />
            </ListItemIcon>

            {(!collapsed || isMobile) && (
              <>
                <ListItemText primary="Quản lý khách hàng" />

                {openCustomer ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        <Collapse in={openCustomer} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {customerMenu.map((item) => renderMenuItem(item, true))}
          </List>
        </Collapse>

        {/* ===== MENU KHÁC ===== */}
        {otherMenu.map((item) => renderMenuItem(item))}

        {/* ===== SETTING ===== */}
        <Tooltip
          title={collapsed && !isMobile ? "Thiết lập" : ""}
          placement="right"
        >
          <ListItemButton
            onClick={() => setOpenSetting(!openSetting)}
            sx={{
              justifyContent: collapsed && !isMobile ? "center" : "flex-start",

              px: collapsed && !isMobile ? 1 : 2,

              borderRadius: 2,
              mx: 1,
              mb: 0.5,
            }}
            className={`transition ${
              isSettingActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed && !isMobile ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <Settings />
            </ListItemIcon>

            {(!collapsed || isMobile) && (
              <>
                <ListItemText primary="Thiết lập" />

                {openSetting ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        <Collapse in={openSetting} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingMenu.map((item) => renderMenuItem(item, true))}
          </List>
        </Collapse>
      </List>
    </>
  );

  return (
    <>
      {/* ===== MOBILE BUTTON ===== */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 1400,
            bgcolor: "#fff",
            boxShadow: 2,

            "&:hover": {
              bgcolor: "#f3f4f6",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* ===== MOBILE DRAWER ===== */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        /* ===== DESKTOP DRAWER ===== */
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,

            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.3s ease",
              overflowX: "hidden",
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
