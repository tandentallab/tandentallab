import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Box, FormControl, IconButton, MenuItem, Select, Typography } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import {
  EXPORT_DATE_PRESETS,
  isCustomRangeTooLong,
} from "../../utils/exportDatePresets";
import "./exportDateSelector.css";

registerLocale("vi", vi);

const viWeekdayLocale = {
  ...vi,
  localize: {
    ...vi.localize,
    day: (dayIndex) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][dayIndex],
  },
};

registerLocale("vi-weekday", viWeekdayLocale);

const formatDateLabel = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("vi-VN");
};

const ExportDateSelector = ({
  title,
  value,
  onChange,
  maxRangeDays = 30,
}) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const wrapperRef = useRef(null);
  const calendarRef = useRef(null);
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (value?.preset !== "custom") {
      setOpenCalendar(false);
    }
  }, [value?.preset]);

  useEffect(() => {
    if (!openCalendar || !wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    setCalendarPos({
      top: rect.bottom + 8,
      left: rect.left,
    });
  }, [openCalendar]);

  useEffect(() => {
    if (!openCalendar) return undefined;

    const handleClickOutside = (event) => {
      const clickedInsideWrapper = wrapperRef.current?.contains(event.target);
      const clickedInsideCalendar = calendarRef.current?.contains(event.target);
      if (!clickedInsideWrapper && !clickedInsideCalendar) {
        setOpenCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openCalendar]);

  const handlePresetChange = (preset) => {
    onChange({
      preset,
      startDate: null,
      endDate: null,
    });

    if (preset === "custom") {
      setOpenCalendar(true);
    } else {
      setOpenCalendar(false);
    }
  };

  const handleCustomRangeChange = (dates) => {
    const [startDate, endDate] = dates;
    if (isCustomRangeTooLong(startDate, endDate, maxRangeDays)) {
      alert(`Khoảng ngày không được vượt quá ${maxRangeDays} ngày.`);
      onChange({
        ...value,
        startDate,
        endDate: null,
      });
      return;
    }

    onChange({
      ...value,
      startDate,
      endDate,
    });

    if (startDate && endDate) {
      setOpenCalendar(false);
    }
  };

  const clearSelectedRange = () => {
    onChange({
      ...value,
      startDate: null,
      endDate: null,
    });
    setOpenCalendar(false);
  };

  const selectedRangeLabel = useMemo(() => {
    if (!value?.startDate && !value?.endDate) return "Chọn trên Lịch";
    if (value?.startDate && value?.endDate) {
      return `${formatDateLabel(value.startDate)} - ${formatDateLabel(value.endDate)}`;
    }
    if (value?.startDate) {
      return `${formatDateLabel(value.startDate)} - ...`;
    }
    return "Chọn trên Lịch";
  }, [value?.startDate, value?.endDate]);

  const monthLabel = (date) => `THG ${String(date.getMonth() + 1).padStart(2, "0")} ${date.getFullYear()}`;

  return (
    <Box className="export-date-selector" ref={wrapperRef}>
      <Typography variant="subtitle2" className="font-semibold text-gray-700 mb-1">
        {title}
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: value?.preset === "custom" ? 1.5 : 0.5 }}>
        <Select
          displayEmpty
          value={value?.preset || ""}
          onChange={(e) => handlePresetChange(e.target.value)}
          renderValue={(selected) => {
            if (!selected) return <span className="text-gray-500">Chọn khoảng ngày</span>;
            const label = EXPORT_DATE_PRESETS.find((item) => item.key === selected)?.label || selected;
            return <span>{label}</span>;
          }}
        >
          <MenuItem value="">
            <span className="text-gray-500">Không chọn</span>
          </MenuItem>
          {EXPORT_DATE_PRESETS.map((preset) => (
            <MenuItem key={preset.key} value={preset.key}>
              {preset.key === "custom" ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarTodayIcon sx={{ fontSize: 16 }} />
                  {preset.label}
                </Box>
              ) : (
                preset.label
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {value?.preset === "custom" && (
        <Box className="relative">
          <Box className="flex items-center gap-1 border-b border-gray-300 pb-1">
            <IconButton size="small" onClick={() => setOpenCalendar((prev) => !prev)}>
              <CalendarTodayIcon sx={{ fontSize: 18, color: "#4b5563" }} />
            </IconButton>
            <button
              type="button"
              onClick={() => setOpenCalendar((prev) => !prev)}
              className="flex-1 text-left text-gray-700 text-base"
            >
              {selectedRangeLabel}
            </button>
            {(value?.startDate || value?.endDate) && (
              <IconButton size="small" onClick={clearSelectedRange}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Box>

          {openCalendar && ReactDOM.createPortal(
            <Box 
              className="export-date-calendar-popover" 
              ref={calendarRef}
              sx={{
                position: "fixed",
                top: `${calendarPos.top}px`,
                left: `${calendarPos.left}px`,
                zIndex: 9999,
              }}
            >
              <DatePicker
                selected={value?.startDate}
                onChange={handleCustomRangeChange}
                startDate={value?.startDate}
                endDate={value?.endDate}
                selectsRange
                inline
                locale="vi-weekday"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                  <div className="export-date-header">
                    <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                      <ChevronLeftIcon sx={{ fontSize: 18 }} />
                    </button>
                    <span>{monthLabel(date)}</span>
                    <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                      <ChevronRightIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                )}
              />
              <Typography variant="caption" className="text-gray-500 block px-3 pb-2">
                Khoảng chọn tối đa {maxRangeDays} ngày.
              </Typography>
            </Box>,
            document.body
          )}
        </Box>
      )}
    </Box>
  );
};

export default ExportDateSelector;
