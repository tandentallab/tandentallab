import React, { useEffect, useState } from "react";
import { tinhLuong } from "../../utils/tinhLuong";
import { useNavigate } from "react-router-dom";

const inputClass =
  "text-center text-sm rounded-md border border-transparent bg-slate-50 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none transition-all";

// Ngày công — số nguyên, giữ nguyên
const NumInput = ({ value, onChange, wide }) => (
  <input
    type="number"
    value={value ?? 0}
    onChange={(e) => onChange(Number(e.target.value))}
    className={inputClass}
    style={{ width: wide ? 100 : 72, padding: "4px 6px", MozAppearance: "textfield" }}
    onWheel={(e) => e.target.blur()}
  />
);

// Input tiền — type text, format dấu chấm ngay khi nhập, không spinner, không đ
const VndInput = ({ value, onChange }) => {
  const fmt = (n) => (n || 0).toLocaleString("vi-VN");
  const [display, setDisplay] = useState(fmt(value));

  useEffect(() => {
    setDisplay(fmt(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const num = Number(raw) || 0;
    setDisplay(num.toLocaleString("vi-VN"));
    onChange(num);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      className={inputClass}
      style={{ width: 108, padding: "4px 6px" }}
    />
  );
};

const BangLuongRow = ({ item, onChange, isEven }) => {
  const { luongNgay, thanhTienCong, tongPhuCap, thucNhan } = tinhLuong({
    luongCoBan: item.luongCanBan,
    ngayCongThang: item.ngayCongThang,
    soNgayCong: item.soNgayCong,
    com: item.com,
    dienThoai: item.dienThoai,
    thuong: item.thuong,
    ungTruoc: item.ungTruoc,
    phat: item.phat,
  });

  const fmt = (n) =>
    (Math.round((n || 0) / 1000) * 1000).toLocaleString("vi-VN") + " đ";
  const navigate = useNavigate();

  const rowBg = isEven ? "#fff" : "#f8fafc";

  return (
    <tr
      style={{ background: rowBg, transition: "background 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
    >
      {/* Tên nhân viên */}
      <td className="px-4 py-2 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <button
          onClick={() => navigate(`/nhan-vien/${item._id}`)}
          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-sm"
        >
          {item.hoVaTen}
        </button>
      </td>

      {/* Lương cơ bản */}
      <td className="px-4 py-2 text-right text-sm text-gray-600 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {fmt(item.luongCanBan)}
      </td>

      {/* Ngày công tháng */}
      <td className="px-4 py-2 text-right text-sm text-gray-600 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {fmt(item.ngayCongThang)}
      </td>

      {/* Lương ngày */}
      <td className="px-4 py-2 text-right text-sm text-gray-600 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {fmt(luongNgay)}
      </td>

      {/* Ngày công */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <NumInput
          value={item.soNgayCong}
          wide
          onChange={(v) => onChange(item._id, "soNgayCong", v)}
        />
      </td>

      {/* Thành tiền công */}
      <td className="px-4 py-2 text-right text-sm font-medium text-slate-700 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {fmt(thanhTienCong)}
      </td>

      {/* Cơm */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <VndInput value={item.com} onChange={(v) => onChange(item._id, "com", v)} />
      </td>

      {/* Điện thoại */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <VndInput value={item.dienThoai} onChange={(v) => onChange(item._id, "dienThoai", v)} />
      </td>

      {/* Thưởng */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <VndInput value={item.thuong} onChange={(v) => onChange(item._id, "thuong", v)} />
      </td>

      {/* Phạt */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <VndInput value={item.phat} onChange={(v) => onChange(item._id, "phat", v)} />
      </td>

      {/* Ứng trước */}
      <td className="px-4 py-2 text-center" style={{ borderBottom: "1px solid #f1f5f9" }}>
        <VndInput value={item.ungTruoc} onChange={(v) => onChange(item._id, "ungTruoc", v)} />
      </td>

      {/* Tổng phụ cấp */}
      <td className="px-4 py-2 text-right text-sm text-slate-600 whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9" }}>
        {fmt(tongPhuCap)}
      </td>

      {/* Thực nhận */}
      <td className="px-4 py-2 text-right text-sm font-extrabold whitespace-nowrap" style={{ borderBottom: "1px solid #f1f5f9", color: "#059669" }}>
        {fmt(thucNhan)}
      </td>
    </tr>
  );
};

export default BangLuongRow;