import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThongKeCongNoHoaDon } from "../../redux/slices/hoaDonSlice";

const formatSoTien = (value = 0) => {
  return new Intl.NumberFormat("vi-VN").format(value);
};

const ThongKeCongNo = ({ nhaKhoaId }) => {
  const dispatch = useDispatch();
  const { thongKeCongNo, loading } = useSelector(
    (state) => state.hoaDon
  );

  useEffect(() => {
    dispatch(fetchThongKeCongNoHoaDon(nhaKhoaId));
  }, [dispatch, nhaKhoaId]);

  const cards = [
    {
      amount: thongKeCongNo?.conNo?.tongTien || 0,
      subtitle: `${thongKeCongNo?.conNo?.soHoaDon || 0} Hoá đơn còn nợ`,
      bgcolor: "bg-green-600",
    },
    {
      amount: thongKeCongNo?.treHan?.tongTien || 0,
      subtitle: `Quá hạn: ${thongKeCongNo?.treHan?.soHoaDon || 0
        }`,
      bgcolor: "bg-red-500",
    },
    {
      amount: thongKeCongNo?.chuaDenHan?.tongTien || 0,
      subtitle: `Chưa đến hạn: ${thongKeCongNo?.chuaDenHan?.soHoaDon || 0
        }`,
      bgcolor: "bg-emerald-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex w-full mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-1/3  px-3 py-2 animate-pulse ${i === 1
              ? "bg-red-500"
              : i === 0
                ? "bg-green-600"
                : "bg-emerald-500"
              }`}
          >
            <div className="h-4 w-2/3 rounded bg-white/30 mb-1" />
            <div className="h-2 w-1/2 rounded bg-white/20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-full mt-2">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`w-1/3 ${card.bgcolor}  px-3 py-2`}
        >
          <div className="text-white font-bold text-base leading-tight">
            {formatSoTien(card.amount)}
          </div>

          <div className="text-white/90 text-[11px] mt-1">
            {card.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThongKeCongNo;