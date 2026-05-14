import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import { getDefaultPathForUser, hasRouteAccess } from "../../config/permissions";
import DonHangPage from "../DonHang/DonHangPage";
import DonHangForm from "../DonHang/DonHangForm";
import DonHangPrintPreview from "../DonHang/DonHangPrintPreview";
import DonHangDeliveryNotePrintPreview from "../DonHang/DonHangDeliveryNotePrintPreview";
import DashboardPage from "../Dashboard/DashboardPage";
import NhaKhoaPage from "../NhaKhoa/NhaKhoaPage";
import NguoiLienHePage from "../NguoiLienHe/NguoiLienHePage";
import BenhNhanPage from "../BenhNhan/BenhNhanPage";
import StaffPage from "../Staff/StaffPage";
import NhapDuLieu from "../Settings/NhapDuLieu";
import CongTy from "../Settings/CongTy";
import VaiTro from "../Settings/VaiTro";
import StaffProfile from "../Staff/StaffProfile";
import SanPhamPage from "../SanPham/SanPhamPage";
import CongDoanPage from "../CongDoan/CongDoanPage";
import HoaDonTable from "../HoaDon/HoaDonTable";
import DonHangChuaXuatPage from "../DonHangChuaXuat/DonHangChuaXuatPage";
import HoaDonDetail from "../HoaDon/HoaDonDetail";
import KeHoachGiaoHangTable from "../KeHoachGiaoHang/KeHoachGiaoHangTable";
import HoaDonPrintPreview from "../HoaDon/HoaDonPrintPreview";
import BaoCaoPage from "../BaoCao/BaoCaoPage";
import PhieuThuPage from "../PhieuThu/PhieuThuPage";
import PhieuThuPrintPreview from "../PhieuThu/PhieuThuPrintPreview";
import NhanVienTable from "../NhanVien/NhanVienTable";
import BangLuongPage from "../BangLuong/BangLuongPage";
const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSelector(getAuthSelector);
  const fallbackPath = getDefaultPathForUser(user);

  const renderProtected = (routePath, element) => {
    if (hasRouteAccess(user, routePath)) {
      return element;
    }

    return <Navigate to={fallbackPath} replace />;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Header onToggleSidebar={() => setCollapsed(!collapsed)} />
      <Sidebar collapsed={collapsed} />
      <Box
        component="main"
        className="bg-gray-100 min-h-screen w-full"
        sx={{
          mt: "66px",
          ml: collapsed ? "16px" : "60px",
          transition: "all 0.3s",
        }}
      >
        <Routes>
          <Route path="/" element={renderProtected("/", <DashboardPage />)} />
          <Route path="/don-hang/*" element={renderProtected("/don-hang", <DonHangPage />)} />
          <Route path="/donhang/create" element={renderProtected("/donhang", <DonHangForm />)} />
          <Route path="/donhang/:id/edit" element={renderProtected("/donhang", <DonHangForm />)} />
          <Route path="/donhang/:id/print" element={renderProtected("/donhang", <DonHangPrintPreview />)} />
          <Route
            path="/donhang/:id/delivery-note"
            element={renderProtected("/donhang", <DonHangDeliveryNotePrintPreview />)}
          />
          <Route path="/nha-khoa" element={renderProtected("/nha-khoa", <NhaKhoaPage />)} />
          <Route path="/nguoi-lien-he" element={renderProtected("/nguoi-lien-he", <NguoiLienHePage />)} />
          <Route path="/benh-nhan" element={renderProtected("/benh-nhan", <BenhNhanPage />)} />
          <Route path="/tai-khoan" element={renderProtected("/tai-khoan", <StaffPage />)} />
          <Route path="/nhap-du-lieu" element={renderProtected("/nhap-du-lieu", <NhapDuLieu />)} />
          <Route path="/cong-ty" element={renderProtected("/cong-ty", <CongTy />)} />
          <Route path="/quyen-su-dung" element={renderProtected("/quyen-su-dung", <VaiTro />)} />
          <Route path="/ho-so" element={renderProtected("/ho-so", <StaffProfile />)} />
          <Route path="/san-pham" element={renderProtected("/san-pham", <SanPhamPage />)} />
          <Route path="/cong-doan" element={renderProtected("/cong-doan", <CongDoanPage />)} />
          <Route path="/cho-xuat-hoa-don" element={renderProtected("/cho-xuat-hoa-don", <DonHangChuaXuatPage />)} />
          <Route path="/hoa-don" element={renderProtected("/hoa-don", <HoaDonTable />)} />
          <Route path="/bao-cao" element={renderProtected("/bao-cao", <BaoCaoPage />)} />
          <Route
            path="/ke-hoach-giao-hang"
            element={renderProtected("/ke-hoach-giao-hang", <KeHoachGiaoHangTable />)}
          />
          <Route
            path="/hoa-don/:id/edit"
            element={renderProtected("/hoa-don", <HoaDonDetail></HoaDonDetail>)}
          ></Route>
          <Route path="/hoa-don/:id/print" element={renderProtected("/hoa-don", <HoaDonPrintPreview />)} />
          <Route path="/phieu-thu" element={renderProtected("/phieu-thu", <PhieuThuPage />)} />
          <Route
            path="/phieu-thu/:id/print"
            element={renderProtected("/phieu-thu", <PhieuThuPrintPreview />)}
          />
          <Route
            path="/nhan-vien"
            element={renderProtected("/nhan-vien", <NhanVienTable></NhanVienTable>)}
          ></Route>
          <Route
            path="/bang-luong"
            element={renderProtected("/bang-luong", <BangLuongPage></BangLuongPage>)}
          ></Route>
          <Route path="*" element={<Navigate to={fallbackPath} replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
