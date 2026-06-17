import React from "react";
import {
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
  CreditCard,
} from "@mui/icons-material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import PaymentsIcon from "@mui/icons-material/Payments";
import BadgeIcon from "@mui/icons-material/Badge";
import Inventory2Icon from "@mui/icons-material/Inventory2";

export const MAIN_MENU = [
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
    icon: <CreditCard />,
  },
  { name: "Sản Phẩm", router: "/san-pham", icon: <Category /> },
  { name: "Công Đoạn", router: "/cong-doan", icon: <AccountTree /> },
  { name: "Kho", router: "/kho", icon: <Inventory2Icon /> },
];

export const CUSTOMER_MENU = [
  { name: "Nha Khoa", router: "/nha-khoa", icon: <LocalHospital /> },
  { name: "Người liên hệ", router: "/nguoi-lien-he", icon: <Contacts /> },
  { name: "Bệnh nhân", router: "/benh-nhan", icon: <People /> },
];

export const OTHER_MENU = [
  { name: "Báo Cáo", router: "/bao-cao", icon: <BarChart /> },
  { name: "Nhân viên", router: "/nhan-vien", icon: <BadgeIcon /> },
  { name: "Bảng lương", router: "/bang-luong", icon: <PaymentsIcon /> },
];

export const SETTING_MENU = [
  { name: "Tài khoản", router: "/tai-khoan", icon: <People /> },
  { name: "Nhập dữ liệu", router: "/nhap-du-lieu", icon: <Assignment /> },
  { name: "Công ty", router: "/cong-ty", icon: <LocalHospital /> },
  { name: "Quyền sử dụng", router: "/quyen-su-dung", icon: <People /> },
];

export const ALL_MENUS = [
  { title: "Menu Chính", items: MAIN_MENU },
  { title: "Khách Hàng", items: CUSTOMER_MENU },
  { title: "Khác", items: OTHER_MENU },
  { title: "Thiết Lập", items: SETTING_MENU },
];
