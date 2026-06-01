import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThongKeCongNoHoaDon } from "../../redux/slices/hoaDonSlice";

const formatSoTien = (value = 0) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const ThongKeCongNo = ({ nhaKhoaId, onCardClick }) => {
  const dispatch = useDispatch();
  const { thongKeCongNo, loading } = useSelector((state) => state.hoaDon);

  useEffect(() => {
    dispatch(fetchThongKeCongNoHoaDon(nhaKhoaId));
  }, [dispatch, nhaKhoaId]);

  const cards = [
    {
      id: "conNo",
      amount: thongKeCongNo?.conNo?.tongTien || 0,
      subtitle: `${thongKeCongNo?.conNo?.soHoaDon || 0} Hoá đơn còn nợ`,
      bgcolor: "bg-green-600",
    },
    {
      id: "treHan",
      amount: thongKeCongNo?.treHan?.tongTien || 0,
      subtitle: `Quá hạn: ${thongKeCongNo?.treHan?.soHoaDon || 0}`,
      bgcolor: "bg-red-500",
    },
    {
      id: "chuaDenHan",
      amount: thongKeCongNo?.chuaDenHan?.tongTien || 0,
      subtitle: `Chưa đến hạn: ${thongKeCongNo?.chuaDenHan?.soHoaDon || 0}`,
      bgcolor: "bg-emerald-500",
    },
  ];

  return (
    // 🔥 ĐÃ FIX: Giữ nguyên margin-top (mt-2) và gài thêm h-[52px] để ĐÓNG BĂNG CHIỀU CAO
    <div className="flex w-full mt-2 h-[52px]">
      {cards.map((card, i) => (
        <div
          key={i}
          onClick={() => !loading && onCardClick && onCardClick(card.id)}
          // 🔥 ĐÃ FIX: Giữ nguyên padding (px-3), dùng Flexbox để canh giữa.
          // Tắt hiệu ứng hover/scale khi đang loading để tránh click nhầm
          className={`w-1/3 ${card.bgcolor} px-3 flex flex-col justify-center border-r border-white/20 last:border-0 h-full
            ${!loading ? "cursor-pointer hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]" : "opacity-80"}`}
        >
          {loading ? (
            // 💀 KHUNG XƯƠNG (SKELETON) - Kích thước khớp 100% với chữ thật
            <div className="animate-pulse">
              <div className="h-[18px] w-2/3 rounded bg-white/40 mb-1" />
              <div className="h-[14px] w-1/2 rounded bg-white/20" />
            </div>
          ) : (
            // 📦 DỮ LIỆU THẬT
            <>
              <div className="text-white font-bold text-base leading-tight">
                {formatSoTien(card.amount)}
              </div>
              <div className="text-white/90 text-[11px] mt-0.5">
                {card.subtitle}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ThongKeCongNo;