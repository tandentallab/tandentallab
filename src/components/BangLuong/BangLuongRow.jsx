import React from "react";
import { tinhLuong } from "../../utils/tinhLuong";
import { useNavigate } from "react-router-dom";

// Compact number input — pure HTML, no MUI dependency
const NumInput = ({ value, onChange, wide }) => (
  <input
    type="number"
    value={value ?? 0}
    onChange={(e) => onChange(Number(e.target.value))}
    className="text-center text-sm rounded-md border border-transparent bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none transition-all"
    style={{ width: wide ? 100 : 72, padding: "4px 6px" }}
  />
);

const BangLuongRow = ({ item, onChange, isEven }) => {
  const { luongNgay, thanhTienCong, tongPhuCap, thucNhan } = tinhLuong({
    luongCoBan: item.luongCanBan,
    soNgayCong: item.soNgayCong,
    com: item.com,
    dienThoai: item.dienThoai,
    thuong: item.thuong,
    ungTruoc: item.ungTruoc,
  });

  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
  const navigate = useNavigate();

  const rowBg = isEven ? "#fff" : "#f8fafc";

  return (
    <tr
      style={{ background: rowBg, transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
    >
      {/* Tên nhân viên */}
      <td
        className="px-4 py-2 whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <button
          onClick={() => navigate(`/nhan-vien/${item._id}`)}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
        >
          {item.hoVaTen}
        </button>
      </td>

      {/* Lương cơ bản */}
      <td
        className="px-4 py-2 text-right text-sm text-gray-600 whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        {fmt(item.luongCanBan)}
      </td>

      {/* Lương ngày */}
      <td
        className="px-4 py-2 text-right text-sm text-gray-600 whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        {fmt(luongNgay)}
      </td>

      {/* Ngày công */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.soNgayCong}
          wide
          onChange={(v) => onChange(item._id, "soNgayCong", v)}
        />
      </td>

      {/* Thành tiền công */}
      <td
        className="px-4 py-2 text-right text-sm font-medium text-slate-700 whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        {fmt(thanhTienCong)}
      </td>

      {/* Cơm */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.com}
          onChange={(v) => onChange(item._id, "com", v)}
        />
      </td>

      {/* Điện thoại */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.dienThoai}
          onChange={(v) => onChange(item._id, "dienThoai", v)}
        />
      </td>

      {/* Thưởng */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.thuong}
          onChange={(v) => onChange(item._id, "thuong", v)}
        />
      </td>

      {/* Phạt */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.phat}
          onChange={(v) => onChange(item._id, "phat", v)}
        />
      </td>

      {/* Ứng trước */}
      <td
        className="px-4 py-2 text-center"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <NumInput
          value={item.ungTruoc}
          wide
          onChange={(v) => onChange(item._id, "ungTruoc", v)}
        />
      </td>

      {/* Tổng phụ cấp */}
      <td
        className="px-4 py-2 text-right text-sm text-slate-600 whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        {fmt(tongPhuCap)}
      </td>

      {/* Thực nhận */}
      <td
        className="px-4 py-2 text-right text-sm font-extrabold whitespace-nowrap"
        style={{ borderBottom: "1px solid #f1f5f9", color: "#059669" }}
      >
        {fmt(thucNhan)}
      </td>
    </tr>
  );
};

export default BangLuongRow;
