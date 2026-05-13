import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../Layout/Sidebar";
import Header from "../Layout/Header";
import { Route, Routes } from "react-router-dom";
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/don-hang/*" element={<DonHangPage />} />
          <Route path="/donhang/create" element={<DonHangForm />} />
          <Route path="/donhang/:id/edit" element={<DonHangForm />} />
          <Route path="/donhang/:id/print" element={<DonHangPrintPreview />} />
          <Route
            path="/donhang/:id/delivery-note"
            element={<DonHangDeliveryNotePrintPreview />}
          />
          <Route path="/nha-khoa" element={<NhaKhoaPage />} />
          <Route path="/nguoi-lien-he" element={<NguoiLienHePage />} />
          <Route path="/benh-nhan" element={<BenhNhanPage />} />
          <Route path="/tai-khoan" element={<StaffPage />} />
          <Route path="/nhap-du-lieu" element={<NhapDuLieu />} />
          <Route path="/cong-ty" element={<CongTy />} />
          <Route path="/quyen-su-dung" element={<VaiTro />} />
          <Route path="/ho-so" element={<StaffProfile />} />
          <Route path="/san-pham" element={<SanPhamPage />} />
          <Route path="/cong-doan" element={<CongDoanPage />} />
          <Route path="/cho-xuat-hoa-don" element={<DonHangChuaXuatPage />} />
          <Route path="/hoa-don" element={<HoaDonTable />} />
          <Route path="/bao-cao" element={<BaoCaoPage />} />
          <Route
            path="/ke-hoach-giao-hang"
            element={<KeHoachGiaoHangTable />}
          />
          <Route
            path="/hoa-don/:id/edit"
            element={<HoaDonDetail></HoaDonDetail>}
          ></Route>
          <Route path="/hoa-don/:id/print" element={<HoaDonPrintPreview />} />
          <Route path="/phieu-thu" element={<PhieuThuPage />} />
          <Route
            path="/phieu-thu/:id/print"
            element={<PhieuThuPrintPreview />}
          />
          <Route
            path="/nhan-vien"
            element={<NhanVienTable></NhanVienTable>}
          ></Route>
          <Route
            path="/bang-luong"
            element={<BangLuongPage></BangLuongPage>}
          ></Route>
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;
