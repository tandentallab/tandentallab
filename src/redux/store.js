import { configureStore } from "@reduxjs/toolkit";
import nhaKhoaReducer from "./slices/nhaKhoaSlice";
import authReducer from "./slices/authSlice";
import nguoiLienHeReducer from "./slices/nguoiLienHeSlice";
import benhNhanReducer from "./slices/benhNhanSlice";
import staffReducer from "./slices/staffSlice";
import sanPhamReducer from "./slices/sanPhamSlice"; // Thêm dòng này
import congDoanReducer from "./slices/congDoanSlice"; // Thêm dòng này
import chamSocKhachHangReducer from "./slices/chamSocKhachHangSlice"
import bangGiaReducer from "./slices/bangGiaSlice"
import donHangReducer from "./slices/donHangSlice"; // Thêm dòng này
import hoaDonReducer from "./slices/hoaDonSlice"
import phieuThuReducer from "./slices/phieuThuSlice"
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
    phieuThu: phieuThuReducer,
  },
});