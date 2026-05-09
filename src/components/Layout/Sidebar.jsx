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
  Warehouse,
  Settings,
  Category,
  AccountTree,
  ReceiptLong,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const drawerWidth = collapsed ? 64 : 240;

  /* ===== MENU ===== */
  const menu = [
    { name: "Thống kê", router: "/", icon: <Dashboard /> },
    { name: "Đơn Hàng", router: "/don-hang", icon: <ShoppingCart /> },
    // 👉 Đã thêm Sản Phẩm vào ngay dưới Đơn Hàng
    { name: "Sản Phẩm", router: "/san-pham", icon: <Category /> },
    { name: "Công Đoạn", router: "/cong-doan", icon: <AccountTree /> }, // 👉 Vừa thêm dòng này
  ];

  const customerMenu = [
    { name: "Nha Khoa", router: "/nha-khoa", icon: <LocalHospital /> },
    { name: "Người liên hệ", router: "/nguoi-lien-he", icon: <Contacts /> },
    { name: "Bệnh nhân", router: "/benh-nhan", icon: <People /> },
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
    { name: "Hóa Đơn", router: "/hoa-don", icon: <Receipt /> },
    { name: "Phiếu Thu", router: "/phieu-thu", icon: <Receipt /> },
    { name: "Báo Cáo", router: "/bao-cao", icon: <BarChart /> },

    // Kho will be rendered as a dropdown with sub-items
  ];

  const khoMenu = [
    { name: "Vật liệu", router: "/kho/vat-lieu", icon: <Category /> },
    {
      name: "Phiếu nhập xuất",
      router: "/kho/phieu-nhap-xuat",
      icon: <Receipt />,
    },
    { name: "Nhà cung cấp", router: "/kho/nha-cung-cap", icon: <Contacts /> },
  ];

  const settingMenu = [
    { name: "Tài khoản", router: "/tai-khoan", icon: <People /> },
    { name: "Nhập dữ liệu", router: "/nhap-du-lieu", icon: <Assignment /> },
    { name: "Công ty", router: "/cong-ty", icon: <LocalHospital /> },
    { name: "Quyền sử dụng", router: "/quyen-su-dung", icon: <People /> },
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
  const isKhoActive = khoMenu.some((item) =>
    location.pathname.includes(item.router)
  );
  const [openKho, setOpenKho] = useState(isKhoActive);

  return (
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
      <Toolbar />

      <List>
        {/* ===== MENU CHÍNH ===== */}
        {menu.map((item, index) => (
          <Tooltip
            key={index}
            title={collapsed ? item.name : ""}
            placement="right"
          >
            <ListItemButton
              onClick={() => navigate(item.router)}
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
              }}
              className={`transition ${isActive(item.router)
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
                }`}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                }}
                className={isActive(item.router) ? "text-blue-600" : ""}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && <ListItemText primary={item.name} />}
            </ListItemButton>
          </Tooltip>
        ))}

        {/* ===== DROPDOWN ===== */}
        <Tooltip
          title={collapsed ? "Quản lý khách hàng" : ""}
          placement="right"
        >
          <ListItemButton
            onClick={() => setOpenCustomer(!openCustomer)}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1 : 2,
            }}
            className={`transition ${isCustomerActive
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100"
              }`}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <People />
            </ListItemIcon>

            {!collapsed && <ListItemText primary="Quản lý khách hàng" />}

            {!collapsed && (openCustomer ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>

        <Collapse in={openCustomer && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {customerMenu.map((item, index) => (
              <Tooltip
                key={index}
                title={collapsed ? item.name : ""}
                placement="right"
              >
                <ListItemButton
                  sx={{
                    pl: collapsed ? 1 : 4,
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                  onClick={() => navigate(item.router)}
                  className={`transition ${isActive(item.router)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                    className={isActive(item.router) ? "text-blue-600" : ""}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && <ListItemText primary={item.name} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Collapse>

        {/* ===== MENU KHÁC ===== */}
        {otherMenu.map((item, index) => (
          <Tooltip
            key={index}
            title={collapsed ? item.name : ""}
            placement="right"
          >
            <ListItemButton
              onClick={() => navigate(item.router)}
              sx={{
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
              }}
              className={`transition ${isActive(item.router)
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
                }`}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                }}
                className={isActive(item.router) ? "text-blue-600" : ""}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && <ListItemText primary={item.name} />}
            </ListItemButton>
          </Tooltip>
        ))}

        {/* ===== KHO DROPDOWN ===== */}
        <Tooltip title={collapsed ? "Kho" : ""} placement="right">
          <ListItemButton
            onClick={() => setOpenKho(!openKho)}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1 : 2,
            }}
            className={`transition ${isKhoActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
              }`}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
              className={isKhoActive ? "text-blue-600" : ""}
            >
              <Warehouse />
            </ListItemIcon>

            {!collapsed && <ListItemText primary="Kho" />}

            {!collapsed && (openKho ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>

        <Collapse in={openKho && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {khoMenu.map((item, index) => (
              <Tooltip
                key={index}
                title={collapsed ? item.name : ""}
                placement="right"
              >
                <ListItemButton
                  sx={{
                    pl: collapsed ? 1 : 4,
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                  onClick={() => navigate(item.router)}
                  className={`transition ${isActive(item.router)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                    className={isActive(item.router) ? "text-blue-600" : ""}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && <ListItemText primary={item.name} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Collapse>

        {/* ===== SETTING MENU ===== */}
        <Tooltip title={collapsed ? "Thiết lập" : ""} placement="right">
          <ListItemButton
            onClick={() => setOpenSetting(!openSetting)}
            sx={{
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 1 : 2,
            }}
            className={`transition ${isSettingActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
              }`}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <Settings />
            </ListItemIcon>

            {!collapsed && <ListItemText primary="Thiết lập" />}

            {!collapsed && (openSetting ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        </Tooltip>

        <Collapse in={openSetting && !collapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingMenu.map((item, index) => (
              <Tooltip
                key={index}
                title={collapsed ? item.name : ""}
                placement="right"
              >
                <ListItemButton
                  sx={{
                    pl: collapsed ? 1 : 4,
                    justifyContent: collapsed ? "center" : "flex-start",
                  }}
                  onClick={() => navigate(item.router)}
                  className={`transition ${isActive(item.router)
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                    }}
                    className={isActive(item.router) ? "text-blue-600" : ""}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && <ListItemText primary={item.name} />}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default Sidebar;
