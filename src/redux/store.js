import { configureStore } from "@reduxjs/toolkit";
import nhaKhoaReducer from "./slices/nhaKhoaSlice";
import authReducer from "./slices/authSlice";
import nguoiLienHeReducer from "./slices/nguoiLienHeSlice";
import benhNhanReducer from "./slices/benhNhanSlice";
import staffReducer from "./slices/staffSlice";
import sanPhamReducer from "./slices/sanPhamSlice";
import congDoanReducer from "./slices/congDoanSlice";
import chamSocKhachHangReducer from "./slices/chamSocKhachHangSlice";
import bangGiaReducer from "./slices/bangGiaSlice";
import donHangReducer from "./slices/donHangSlice";
import hoaDonReducer from "./slices/hoaDonSlice";
import phieuBaoHanhReducer from "./slices/phieuBaoHanhSlice";
import baoCaoReducer from "./slices/baoCaoSlice";
import phieuThuReducer from "./slices/phieuThuSlice"
import dashboardReducer from "./slices/dashboardSlice"
import nhanVienReducer from "./slices/nhanVienSlice";
import bangLuongReducer from "./slices/bangLuongSlice";
import khoReducer from "./slices/khoSlice"
import phieuNhapKhoReducer from "./slices/phieuNhapKhoSlice"
import chiPhiReducer from "./slices/chiPhiSlice";
import phieuXuatKhoReducer from "./slices/phieuXuatKhoSlice"
import phieuMuonVatLieuReducer from "./slices/phieuMuonVatLieuSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    nhaKhoa: nhaKhoaReducer,
    nguoiLienHe: nguoiLienHeReducer,
    benhNhan: benhNhanReducer,
    staff: staffReducer,
    sanPham: sanPhamReducer,
    congDoan: congDoanReducer,
    chamSocKhachHang: chamSocKhachHangReducer,
    bangGia: bangGiaReducer,
    donHang: donHangReducer,
    hoaDon: hoaDonReducer,
    phieuBaoHanh: phieuBaoHanhReducer,
    baoCao: baoCaoReducer,
    phieuThu: phieuThuReducer,
    dashboard: dashboardReducer,
    nhanVien: nhanVienReducer,
    bangLuong: bangLuongReducer,
    kho: khoReducer,
    phieuNhapKho: phieuNhapKhoReducer,
    chiPhi: chiPhiReducer,
    phieuXuatKho: phieuXuatKhoReducer,
    phieuMuonVatLieu: phieuMuonVatLieuReducer
  },
});