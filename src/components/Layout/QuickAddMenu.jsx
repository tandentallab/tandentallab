import React, { useCallback, useState } from "react";
import {
  Group,
  Assignment,
  Description,
  Download,
  Upload,
  Business,
  Add,
} from "@mui/icons-material";
import NguoiLienHeModal from "../NguoiLienHe/NguoiLienHeModal";
import NhaKhoaModal from "../NhaKhoa/NhaKhoaModal";
import BenhNhanModal from "../BenhNhan/BenhNhanModal";
import { useNavigate } from "react-router-dom";
import PhieuThuModal from "../PhieuThu/PhieuThuModal";
import { useDispatch } from "react-redux";
import { fetchAllPhieuThu } from "../../redux/slices/phieuThuSlice";
import StaffModal from "../Staff/StaffModal";

const QuickAddMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const ROWS_PER_PAGE = 20;

  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const dispatch = useDispatch();

  const loadData = useCallback(() => {
    dispatch(
      fetchAllPhieuThu({ page, limit: ROWS_PER_PAGE, search: debouncedSearch })
    );
  }, [dispatch, page, debouncedSearch]);

  return (
    <div className="relative inline-block text-left">
      {/* Nút + */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white text-green-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm"
      >
        <Add className="!w-6 !h-6" />
      </button>

      {isOpen && (
        <>
          {/* overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border z-20 overflow-hidden">
            <NhaKhoaModal isQuickMenu={true}></NhaKhoaModal>
            <button
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
              onClick={() => {
                navigate("/donhang/create");
              }}
            >
              <span className="mr-3 text-gray-500">
                <Assignment fontSize="small" />
              </span>
              <span className="font-medium">Thêm Đơn Hàng</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
              onClick={() => {
                navigate("/cho-xuat-hoa-don");
              }}
            >
              <span className="mr-3 text-gray-500">
                <Description fontSize="small" />{" "}
              </span>
              <span className="font-medium">Thêm Hóa Đơn</span>
            </button>
            <button
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
              onClick={() => setOpenModal(true)}
            >
              <span className="mr-3 text-gray-500">
                <Download fontSize="small" />,
              </span>
              <span className="font-medium">Thêm Phiếu Thu</span>
            </button>
            <NguoiLienHeModal isQuickMenu={true}></NguoiLienHeModal>
            <BenhNhanModal isQuickMenu={true}></BenhNhanModal>
            <StaffModal isQuickMenu={true}></StaffModal>
            {/* {menuItems.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b last:border-0"
                onClick={() => {
                  console.log("Thêm:", item.label);
                  setIsOpen(false);
                }}
              >
                <span className="mr-3 text-gray-500">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))} */}
            <PhieuThuModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              onSuccess={loadData}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default QuickAddMenu;
