import { differenceInCalendarDays } from "date-fns";

export const EXPORT_DATE_PRESETS = [
  { key: "custom", label: "Chọn trên Lịch" },
  { key: "today", label: "Hôm nay" },
  { key: "yesterday", label: "Hôm qua" },
  { key: "this_week", label: "Tuần này" },
  { key: "last_week", label: "Tuần trước" },
  { key: "this_month", label: "Tháng này" },
  { key: "last_month", label: "Tháng trước" },
  { key: "last_7", label: "Trong vòng 7 ngày" },
  { key: "last_10", label: "Trong vòng 10 ngày" },
  { key: "last_30", label: "Trong vòng 30 ngày" },
];

export const EMPTY_EXPORT_DATE_FILTER = {
  preset: "",
  startDate: null,
  endDate: null,
};

export const getDateRangeFromPreset = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  switch (preset) {
    case "today":
      return { from: today, to: tomorrow };
    case "yesterday": {
      const from = new Date(today);
      from.setDate(from.getDate() - 1);
      return { from, to: today };
    }
    case "this_week": {
      const day = today.getDay();
      const from = new Date(today);
      from.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
      return { from, to: tomorrow };
    }
    case "last_week": {
      const day = today.getDay();
      const from = new Date(today);
      from.setDate(today.getDate() - (day === 0 ? 6 : day - 1) - 7);
      const to = new Date(from);
      to.setDate(from.getDate() + 7);
      return { from, to };
    }
    case "this_month":
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: tomorrow };
    case "last_month":
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 1),
      };
    case "last_7": {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { from, to: tomorrow };
    }
    case "last_10": {
      const from = new Date(today);
      from.setDate(from.getDate() - 10);
      return { from, to: tomorrow };
    }
    case "last_30": {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      return { from, to: tomorrow };
    }
    default:
      return { from: null, to: null };
  }
};

export const toISODateRange = (dateFilter) => {
  if (!dateFilter?.preset) return { fromISO: "", toISO: "" };

  if (dateFilter.preset === "custom") {
    const fromISO = dateFilter.startDate ? new Date(dateFilter.startDate).toISOString() : "";
    const toISO = dateFilter.endDate
      ? new Date(
          dateFilter.endDate.getFullYear(),
          dateFilter.endDate.getMonth(),
          dateFilter.endDate.getDate(),
          23,
          59,
          59,
          999
        ).toISOString()
      : "";
    return { fromISO, toISO };
  }

  const { from, to } = getDateRangeFromPreset(dateFilter.preset);
  return {
    fromISO: from ? from.toISOString() : "",
    toISO: to ? to.toISOString() : "",
  };
};

export const isValidExportDateFilter = (dateFilter) => {
  if (!dateFilter?.preset) return false;
  if (dateFilter.preset !== "custom") return true;
  return Boolean(dateFilter.startDate && dateFilter.endDate);
};

export const isCustomRangeTooLong = (startDate, endDate, maxDays = 30) => {
  if (!startDate || !endDate) return false;
  return differenceInCalendarDays(endDate, startDate) > maxDays;
};
