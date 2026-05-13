export const formatMoney = (value) => {
  return Number(value || 0).toLocaleString("vi-VN");
};