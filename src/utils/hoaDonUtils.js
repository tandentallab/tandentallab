// utils/hoaDonUtils.js

/* ================= BUILD MAP ================= */

export const buildPriceMap = (bangGia = []) => {
  const map = {};

  bangGia.forEach((item) => {
    map[item.sanPhamId?.toString()] = item.donGia || 0;
  });

  return map;
};

export const buildProductNameMap = (bangGia = []) => {
  const map = {};

  bangGia.forEach((item) => {
    map[item.sanPhamId?.toString()] =
      item.tenSanPham || "SP";
  });

  return map;
};

/* ================= HELPER ================= */

export const getSanPhamId = (sp) => {
  if (!sp?.sanPham) return null;

  // populate object
  if (typeof sp.sanPham === "object") {
    return sp.sanPham._id?.toString();
  }

  // string id
  return sp.sanPham.toString();
};

/* ================= TÍNH TIỀN ================= */

export const calcOrderTongTien = (
  order,
  mapGia = {},
  discount = null
) => {
  if (!order?.danhSachSanPham) return 0;

  let tongTien = order.danhSachSanPham.reduce(
    (sum, sp) => {
      const sanPhamId = getSanPhamId(sp);

      const donGia = mapGia[sanPhamId] || 0;

      return sum + donGia * (sp.soLuong || 0);
    },
    0
  );

  if (discount?.loaiChiecKhau === "phanTram") {
    tongTien -=
      (tongTien * (discount.chiecKhau || 0)) / 100;
  }

  if (discount?.loaiChiecKhau === "tienMat") {
    tongTien -= discount.chiecKhau || 0;
  }

  return tongTien < 0 ? 0 : tongTien;
};

/* ================= BUILD ITEM HÓA ĐƠN ================= */

export const buildOrderInvoiceItem = (
  order,
  mapGia = {},
  discounts = {}
) => {
  const tongTien = order.danhSachSanPham.reduce(
    (sum, sp) => {
      const sanPhamId = getSanPhamId(sp);

      const donGia = mapGia[sanPhamId] || 0;

      return sum + donGia * (sp.soLuong || 0);
    },
    0
  );

  const discount = discounts?.[order._id];

  let thanhTienSauCK = tongTien;

  if (discount?.loaiChiecKhau === "phanTram") {
    thanhTienSauCK =
      tongTien -
      (tongTien * (discount.chiecKhau || 0)) / 100;
  }

  if (discount?.loaiChiecKhau === "tienMat") {
    thanhTienSauCK =
      tongTien - (discount.chiecKhau || 0);
  }

  return {
    donHang: order,
    tongTien,
    chietKhau: discount?.chiecKhau || 0,
    loaiChietKhau:
      discount?.loaiChiecKhau === "tienMat"
        ? "tienMat"
        : "phanTram",
    thanhTienSauCK: Math.max(thanhTienSauCK, 0),
  };
};