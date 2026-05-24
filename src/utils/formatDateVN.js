export const formatDateVN = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
};