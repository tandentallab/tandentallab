import React from "react";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

/**
 * 1. CommonButton - Nút bấm đa năng với hiệu ứng loading và bo góc tròn hiện đại
 */
export const CommonButton = ({
  variant = "contained",
  color = "primary",
  onClick,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  className = "",
  children,
  style = {},
  size = "medium",
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled || loading}
      size={size}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      className={`rounded-xl shadow-sm hover:shadow transition-all duration-200 ${className}`}
      style={{ textTransform: "none", fontWeight: 600, ...style }}
      {...props}
    >
      {children}
    </Button>
  );
};

/**
 * 2. CommonSearchBar - Thanh tìm kiếm tinh tế, bo góc, tích hợp nút xóa nhanh
 */
export const CommonSearchBar = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  width = "100%",
  className = "",
  style = {},
  ...props
}) => {
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      className={`bg-white rounded-xl ${className}`}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="text-gray-400" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small" edge="end">
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
          className: "rounded-xl",
        }
      }}
      style={{ width, ...style }}
      {...props}
    />
  );
};

/**
 * 3. CommonAddButton - Nút Thêm mới tiêu chuẩn (nền xanh, có responsive ẩn chữ trên mobile)
 */
export const CommonAddButton = ({
  onClick,
  label = "Thêm mới",
  disabled = false,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      disabled={disabled}
      startIcon={<AddIcon />}
      className={`bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl min-w-0 p-2 sm:px-4 sm:py-2 text-white flex items-center justify-center font-semibold text-sm transition-all duration-200 ${className}`}
      style={{ textTransform: "none", ...style }}
      {...props}
    >
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};

/**
 * 4. CommonIconButton - Nút Icon đa năng được bọc sẵn Tooltip
 */
export const CommonIconButton = ({
  title,
  onClick,
  icon,
  color = "default",
  disabled = false,
  className = "",
  style = {},
  placement = "bottom",
  ...props
}) => {
  return (
    <Tooltip title={title} placement={placement} arrow>
      <span>
        <IconButton
          onClick={onClick}
          disabled={disabled}
          color={color}
          className={`hover:bg-gray-100 transition-all duration-200 ${className}`}
          style={style}
          {...props}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

/**
 * 5. CommonRefreshButton - Nút Làm mới dữ liệu (tự động xoay tròn 360 độ khi loading)
 */
export const CommonRefreshButton = ({
  onClick,
  loading = false,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <CommonIconButton
      title="Tải lại dữ liệu"
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      icon={
        <RefreshIcon
          fontSize="small"
          sx={{
            animation: loading ? "spin 1s linear infinite" : "none",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      }
      {...props}
    />
  );
};

/**
 * 6. CommonPrintButton - Nút In ấn tiêu chuẩn (màu xanh dương nhạt / info)
 */
export const CommonPrintButton = ({
  onClick,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <CommonIconButton
      title="In ấn"
      onClick={onClick}
      disabled={disabled}
      color="primary"
      className={className}
      icon={<PrintIcon fontSize="small" />}
      {...props}
    />
  );
};

/**
 * 7. CommonExcelButton - Nút xuất Excel (màu xanh lá cây / success, dạng button chữ nhật có chữ và icon)
 */
export const CommonExcelButton = ({
  onClick,
  label = "Xuất Excel",
  disabled = false,
  className = "",
  style = {},
  ...props
}) => {
  return (
    <Button
      variant="contained"
      color="success"
      onClick={onClick}
      disabled={disabled}
      startIcon={<FileDownloadIcon fontSize="small" />}
      className={`bg-green-600 hover:bg-green-700 text-white shadow-sm rounded-xl min-w-0 p-2 sm:px-3 sm:py-1.5 flex items-center justify-center font-semibold text-sm transition-all duration-200 ${className}`}
      style={{ textTransform: "none", ...style }}
      {...props}
    >
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
};
