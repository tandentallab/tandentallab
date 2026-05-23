export const tinhLuong = ({
  luongCoBan,
  ngayCongThang,
  soNgayCong,
  com,
  dienThoai,
  thuong,
  phat,      // ✅ thêm vào
  ungTruoc,
}) => {
  const luongNgay = luongCoBan / ngayCongThang;
  const thanhTienCong = luongNgay * soNgayCong;

  const tongPhuCap =
    Number(com || 0) +
    Number(dienThoai || 0) +
    Number(thuong || 0);

  const thucNhan =
    thanhTienCong +
    tongPhuCap -
    Number(phat || 0) -    // ✅ trừ phat
    Number(ungTruoc || 0);

  return { luongNgay, thanhTienCong, tongPhuCap, thucNhan };
};