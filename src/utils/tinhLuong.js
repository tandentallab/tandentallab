export const tinhLuong = ({
  luongCoBan,
  soNgayCong,
  com,
  dienThoai,
  thuong,
  ungTruoc,
}) => {
  const luongNgay = luongCoBan / 28;

  const thanhTienCong = luongNgay * soNgayCong;

  const tongPhuCap =
    Number(com || 0) +
    Number(dienThoai || 0) +
    Number(thuong || 0);

  const thucNhan =
    thanhTienCong + tongPhuCap - Number(ungTruoc || 0);

  return {
    luongNgay,
    thanhTienCong,
    tongPhuCap,
    thucNhan,
  };
};