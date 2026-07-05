import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../config/api";
import {
  exportBangGiaRiengToExcel,
  exportDanhSachNhaKhoaToExcel,
} from "../../utils/exportToExcel";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Box,
  Tooltip,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
  Delete,
} from "@mui/icons-material";

import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download"; // Thêm icon Download

import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa, deleteNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaModal from "./NhaKhoaModal";
import NhaKhoaUpdateModal from "./NhaKhoaUpdateModal";
import NhaKhoaDetailModal from "./NhaKhoaDetailModal";

// =====================================================
// CẤU HÌNH CỘT — danh sách cột + độ rộng mặc định (px)
// =====================================================
const TABLE_COLUMNS = [
  { key: "fav", width: 56, resizable: false },
  { key: "ten", width: 200, resizable: true },
  { key: "lienHe", width: 170, resizable: true },
  { key: "diaChi", width: 220, resizable: true },
  { key: "website", width: 150, resizable: true },
  { key: "moTa", width: 200, resizable: true },
  { key: "congNo", width: 140, resizable: true },
  { key: "ngayTao", width: 130, resizable: true },
  { key: "hanhDong", width: 110, resizable: false },
];

const MIN_COL_WIDTH = 60;
const COL_WIDTHS_STORAGE_KEY = "nhaKhoaTable_columnWidths_v1";

const getDefaultColumnWidths = () =>
  TABLE_COLUMNS.reduce((acc, col) => {
    acc[col.key] = col.width;
    return acc;
  }, {});

// =====================================================
// ResizableTh — TableCell tiêu đề có thể kéo để đổi độ rộng
// =====================================================
function ResizableTh({
  children,
  resizable = true,
  onResizeMouseDown,
  sx,
  ...rest
}) {
  return (
    <TableCell
      sx={{
        position: "relative",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
        ...sx,
      }}
      {...rest}
    >
      {children}
      {resizable && (
        <Box
          onMouseDown={onResizeMouseDown}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: "8px",
            cursor: "col-resize",
            zIndex: 2,
            "&:hover": { backgroundColor: "#90caf9" },
            "&:active": { backgroundColor: "#42a5f5" },
          }}
        />
      )}
    </TableCell>
  );
}

// =====================================================
// FilterBar — thanh lọc tách riêng khỏi bảng chính.
// Ô nhập/select dùng state CỤC BỘ của component này, nên gõ phím
// chỉ khiến FilterBar re-render, KHÔNG kéo theo re-render toàn bộ
// bảng dữ liệu (vốn có thể rất nặng khi nhiều dòng). Chỉ khi bấm
// "Lọc" / nhấn Enter / xóa chip tỉnh thì mới báo lên component cha
// (qua onApply / onClearProvince) để thực sự lọc lại bảng.
// =====================================================
const FilterBar = React.memo(function FilterBar({
  provinces,
  appliedProvince,
  onApply,
  onClearProvince,
  onExportList,
  onOpenExportPrice,
  onRefresh,
}) {
  const [searchDraft, setSearchDraft] = useState("");
  const [provinceDraft, setProvinceDraft] = useState("");

  const handleApply = () => {
    onApply(searchDraft, provinceDraft);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  const handleClear = () => {
    setProvinceDraft("");
    onClearProvince();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: {
          xs: "stretch",
          md: "center",
        },
        flexDirection: {
          xs: "column",
          md: "row",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {/* LEFT */}
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
          width: {
            xs: "100%",
            md: "auto",
          },
        }}
      >
        {/* CHIP */}
        {appliedProvince && (
          <Chip
            label={`Tỉnh/Thành: ${appliedProvince}`}
            onDelete={handleClear}
          />
        )}

        {/* SELECT */}
        <TextField
          select
          label="Tỉnh/Thành"
          size="small"
          value={provinceDraft}
          onChange={(e) => setProvinceDraft(e.target.value)}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 220,
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        >
          <MenuItem value="">Tất cả</MenuItem>

          {provinces.map((province, index) => (
            <MenuItem key={index} value={province}>
              {province}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* RIGHT */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          width: {
            xs: "100%",
            md: "auto",
          },
        }}
      >
        {/* SEARCH */}
        <TextField
          size="small"
          placeholder="Tìm nha khoa..."
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            flex: 1,
            minWidth: {
              xs: "100%",
              sm: 250,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />

        {/* NÚT LỌC — chỉ bắt đầu tìm khi bấm nút này */}
        <button
          onClick={handleApply}
          title="Lọc theo từ khóa và tỉnh/thành đã chọn"
          className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium flex items-center gap-1 transition"
        >
          <SearchIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Lọc</span>
        </button>

        {/* NÚT XUẤT DANH SÁCH */}
        <button
          onClick={onExportList}
          title="Xuất excel danh sách nha khoa"
          className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
        >
          <DownloadIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Xuất danh sách</span>
        </button>

        {/* NÚT XUẤT BẢNG GIÁ RIÊNG */}
        <button
          onClick={onOpenExportPrice}
          title="Xuất excel bảng giá riêng"
          className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#29b6f6] hover:bg-[#0091ea] text-white text-sm font-medium flex items-center gap-1 transition"
        >
          <DownloadIcon sx={{ fontSize: 17 }} />
          <span className="hidden sm:inline">Xuất bảng giá</span>
        </button>

        <NhaKhoaModal />

        {/* REFRESH */}
        <IconButton onClick={onRefresh}>
          <RefreshIcon />
        </IconButton>

        {/* MORE */}
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>
    </Box>
  );
});

export default function NhaKhoaTable() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.nhaKhoa);

  // ===== STATE =====
  // Giá trị THỰC SỰ dùng để lọc bảng — chỉ được cập nhật khi người dùng
  // bấm nút "Lọc" / nhấn Enter trong FilterBar (component con, xem phía trên).
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedProvince, setAppliedProvince] = useState("");
  const [favorites, setFavorites] = useState([]);

  // State quản lý Modal Xuất Excel
  const [openExport, setOpenExport] = useState(false);
  const [selectedExportNhaKhoa, setSelectedExportNhaKhoa] = useState("");

  // ===== ĐỘ RỘNG CỘT — cho phép kéo giãn, lưu lại trong localStorage =====
  const [columnWidths, setColumnWidths] = useState(() => {
    try {
      const saved = localStorage.getItem(COL_WIDTHS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...getDefaultColumnWidths(), ...parsed };
      }
    } catch (e) {
      // bỏ qua lỗi parse, dùng mặc định
    }
    return getDefaultColumnWidths();
  });

  const resizingKey = useRef(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const handleResizeMouseMove = (e) => {
    if (!resizingKey.current) return;
    const delta = e.clientX - resizeStartX.current;
    const newWidth = Math.max(MIN_COL_WIDTH, resizeStartWidth.current + delta);
    setColumnWidths((prev) => ({ ...prev, [resizingKey.current]: newWidth }));
  };

  const handleResizeMouseUp = () => {
    resizingKey.current = null;
    document.body.style.cursor = "";
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", handleResizeMouseUp);
    // Lưu lại độ rộng cột sau khi kéo xong
    setColumnWidths((prev) => {
      try {
        localStorage.setItem(COL_WIDTHS_STORAGE_KEY, JSON.stringify(prev));
      } catch (e) {
        // bỏ qua lỗi lưu trữ
      }
      return prev;
    });
  };

  const handleResizeMouseDown = (key) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizingKey.current = key;
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = columnWidths[key];
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  };

  // Dọn dẹp listener nếu component unmount giữa lúc đang kéo
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleResizeMouseMove);
      window.removeEventListener("mouseup", handleResizeMouseUp);
      document.body.style.cursor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableTotalWidth = useMemo(
    () =>
      TABLE_COLUMNS.reduce(
        (sum, col) => sum + (columnWidths[col.key] || col.width),
        0
      ),
    [columnWidths]
  );

  const resetColumnWidths = () => {
    const defaults = getDefaultColumnWidths();
    setColumnWidths(defaults);
    try {
      localStorage.removeItem(COL_WIDTHS_STORAGE_KEY);
    } catch (e) {
      // bỏ qua
    }
  };

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // ===== DANH SÁCH TỈNH THÀNH =====
  const provinces = useMemo(() => {
    return [...new Set(data?.map((i) => i.tinh).filter(Boolean))];
  }, [data]);

  // ===== FILTER =====
  // Bỏ dấu tiếng Việt để search không phân biệt có dấu / không dấu
  const chuanHoa = (str) =>
    (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase();

  const filteredData = useMemo(() => {
    const keyword = chuanHoa(appliedSearch.trim());

    return (data || []).filter((item) => {
      // Nếu ô search trống thì luôn khớp
      const matchSearch =
        keyword === "" ||
        [
          item.hoVaTen,
          item.tenGiaoDich,
          item.email,
          item.soDienThoai,
          item.diaChiCuThe,
          item.quanHuyen,
          item.tinh,
          item.website,
        ].some((field) => field && chuanHoa(field).includes(keyword));

      const matchProvince = appliedProvince
        ? item.tinh === appliedProvince
        : true;

      return matchSearch && matchProvince;
    });
  }, [data, appliedSearch, appliedProvince]);

  // Áp dụng bộ lọc — được gọi từ FilterBar khi bấm nút "Lọc" hoặc nhấn Enter
  const handleApplyFilter = (searchValue, provinceValue) => {
    setAppliedSearch(searchValue);
    setAppliedProvince(provinceValue);
  };

  // Xóa điều kiện lọc theo tỉnh/thành đã áp dụng
  const handleClearProvince = () => {
    setAppliedProvince("");
  };

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ===== UPDATE =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // ===== DELETE =====
  const [deleteTarget, setDeleteTarget] = useState(null); // item đang chờ xác nhận xóa
  const [deletingId, setDeletingId] = useState(null); // id đang trong quá trình xóa (hiện loading)

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeletingId(deleteTarget._id);
    try {
      const result = await dispatch(deleteNhaKhoa(deleteTarget._id));
      if (deleteNhaKhoa.fulfilled.match(result)) {
        toast.success("Đã xóa nha khoa thành công");
      } else {
        toast.error(result.payload || "Xóa thất bại");
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi xóa nha khoa");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  // Hàm xử lý khi bấm nút Xuất trong Modal
  const handleExportSubmit = async () => {
    try {
      if (!selectedExportNhaKhoa) return;

      const selectedNhaKhoaInfo = data.find(
        (nk) => nk._id === selectedExportNhaKhoa
      );

      const response = await api.get(
        `/bang-gia/nha-khoa/${selectedExportNhaKhoa}`
      );
      const bangGiaData = response.data; // Mảng chứa [{ tenSanPham, donGia, laGiaRieng... }]

      await exportBangGiaRiengToExcel(selectedNhaKhoaInfo, bangGiaData); // Hoặc truyền chiXuatGiaRieng

      setOpenExport(false);
      setSelectedExportNhaKhoa("");
    } catch (error) {
      console.error("Lỗi khi xuất bảng giá:", error);
      toast.error("Đã xảy ra lỗi khi lấy dữ liệu bảng giá. Vui lòng thử lại!");
    }
  };
  return (
    <Box>
      {/* ===== FILTER BAR ===== */}
      <FilterBar
        provinces={provinces}
        appliedProvince={appliedProvince}
        onApply={handleApplyFilter}
        onClearProvince={handleClearProvince}
        onExportList={() => exportDanhSachNhaKhoaToExcel(filteredData)}
        onOpenExportPrice={() => setOpenExport(true)}
        onRefresh={() => dispatch(fetchNhaKhoa())}
      />

      {/* ===== DESKTOP TABLE ===== */}
      <Box
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
        }}
      >
        <TableContainer
          component={Paper}
          className="rounded-2xl shadow-lg"
          sx={{ overflowX: "auto" }}
        >
          <Table
            sx={{
              tableLayout: "fixed",
              width: tableTotalWidth,
              minWidth: "100%",
            }}
          >
            <colgroup>
              {TABLE_COLUMNS.map((col) => (
                <col key={col.key} style={{ width: columnWidths[col.key] }} />
              ))}
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell colSpan={10} align="left">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Tổng số {data?.length} nha khoa
                    </Typography>
                    <Tooltip title="Khôi phục độ rộng cột mặc định">
                      <Typography
                        variant="caption"
                        onClick={resetColumnWidths}
                        sx={{
                          cursor: "pointer",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Đặt lại độ rộng cột
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow className="bg-gray-100">
                <ResizableTh resizable={false}></ResizableTh>
                <ResizableTh onResizeMouseDown={handleResizeMouseDown("ten")}>
                  <b>Tên</b>
                </ResizableTh>
                <ResizableTh
                  onResizeMouseDown={handleResizeMouseDown("lienHe")}
                >
                  <b>Liên hệ</b>
                </ResizableTh>
                <ResizableTh
                  onResizeMouseDown={handleResizeMouseDown("diaChi")}
                >
                  <b>Địa chỉ</b>
                </ResizableTh>
                <ResizableTh
                  onResizeMouseDown={handleResizeMouseDown("website")}
                >
                  <b>Website</b>
                </ResizableTh>
                <ResizableTh onResizeMouseDown={handleResizeMouseDown("moTa")}>
                  <b>Mô tả</b>
                </ResizableTh>
                <ResizableTh
                  onResizeMouseDown={handleResizeMouseDown("congNo")}
                >
                  <b>Công nợ</b>
                </ResizableTh>
                <ResizableTh
                  onResizeMouseDown={handleResizeMouseDown("ngayTao")}
                >
                  <b>Ngày tạo</b>
                </ResizableTh>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {filteredData.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell align="center" sx={{ overflow: "hidden" }}>
                    <div className="flex flex-col items-center">
                      <NhaKhoaDetailModal nhaKhoaData={item} />
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTarget(item)}
                        >
                          <Delete sx={{ fontSize: 18, color: "#ef4444" }} />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    <div className="font-semibold text-gray-800 truncate">
                      {item.hoVaTen}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      ID: {item._id.slice(-6)}
                    </div>
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    <div className="truncate">{item.soDienThoai}</div>
                    <div className="text-xs text-blue-500 truncate">
                      {item.email}
                    </div>
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    <div className="text-sm truncate">{item.diaChiCuThe}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.tinh}, {item.quocGia}
                    </div>
                  </TableCell>

                  <TableCell sx={{ overflow: "hidden", cursor: "pointer" }}>
                    <a
                      href={`https://${item.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline truncate block"
                    >
                      {item.website}
                    </a>
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    <div className="truncate">{item.moTa}</div>
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    {(item.tongCongNo ?? 0) > 0 ? (
                      <span className="font-semibold text-red-500 whitespace-nowrap">
                        {item.tongCongNo.toLocaleString("vi-VN")}đ
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>

                  <TableCell
                    sx={{ overflow: "hidden", cursor: "pointer" }}
                    onClick={() => {
                      setSelectedRow(item);
                      setOpenEdit(true);
                    }}
                  >
                    <Chip
                      label={new Date(item.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                      color="success"
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={10} align="right">
                  <Typography variant="caption" color="text.secondary">
                    Tổng số {data?.length} nha khoa
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ===== MOBILE CARD ===== */}
      <Box
        sx={{
          display: {
            xs: "flex",
            lg: "none",
          },
          flexDirection: "column",
          gap: 2,
        }}
      >
        {loading && (
          <Box className="flex justify-center py-10">
            <CircularProgress />
          </Box>
        )}

        {!loading && filteredData.length === 0 && (
          <Paper className="p-5 text-center">Không có dữ liệu</Paper>
        )}

        {!loading &&
          filteredData.map((item) => (
            <Card key={item._id} sx={{ borderRadius: "16px", boxShadow: 2 }}>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {/* HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    px: 2,
                    pt: 1.5,
                    pb: 1,
                  }}
                >
                  {/* Avatar chữ cái */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#9e9e9e",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {(item.hoVaTen || item.tenGiaoDich || "?")
                        .split(" ")
                        .slice(-2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </Box>
                  </Box>

                  {/* Tên nha khoa + favorite */}
                  <Box sx={{ flex: 1, textAlign: "right" }}>
                    <Typography fontWeight={700} fontSize={14} lineHeight={1.3}>
                      {item.hoVaTen || item.tenGiaoDich}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(item._id)}
                    sx={{ ml: 0.5, mt: -0.5 }}
                  >
                    {favorites.includes(item._id) ? (
                      <Star sx={{ fontSize: 20, color: "#facc15" }} />
                    ) : (
                      <StarBorder sx={{ fontSize: 20, color: "#9ca3af" }} />
                    )}
                  </IconButton>
                </Box>

                <Divider />

                {/* ROWS */}
                {[
                  { label: "CLINIC", value: item.hoVaTen || item.tenGiaoDich },
                  { label: "Địa chỉ", value: item.diaChiCuThe || "" },
                  { label: "Quận/Huyện", value: item.quanHuyen || "" },
                  { label: "Tỉnh", value: item.tinh || "" },
                  { label: "Điện thoại", value: item.soDienThoai || "" },
                  {
                    label: "Số di động",
                    value: item.soDiDong || item.soDienThoai || "",
                  },
                  {
                    label: "Công nợ",
                    value:
                      (item.tongCongNo ?? 0) > 0
                        ? item.tongCongNo.toLocaleString("vi-VN")
                        : "0",
                    valueColor:
                      (item.tongCongNo ?? 0) > 0 ? "#ef4444" : undefined,
                  },
                  { label: "Tiền tệ", value: item.tienTe || "VND" },
                  { label: "Email", value: item.email || "" },
                ].map((row, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 0.9,
                      borderBottom: "1px solid #f3f4f6",
                      "&:last-of-type": { borderBottom: "none" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minWidth: 100 }}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={row.valueColor ? 600 : 400}
                      sx={{
                        color: row.valueColor || "text.primary",
                        textAlign: "right",
                      }}
                    >
                      {row.value}
                    </Typography>
                  </Box>
                ))}

                {/* FOOTER ACTIONS */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    px: 1,
                    py: 0.5,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <Tooltip title="Chỉnh sửa">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRow(item);
                        setOpenEdit(true);
                      }}
                    >
                      <Edit sx={{ fontSize: 18, color: "#3b82f6" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Delete sx={{ fontSize: 18, color: "#ef4444" }} />
                    </IconButton>
                  </Tooltip>
                  <NhaKhoaDetailModal nhaKhoaData={item} />
                </Box>
              </CardContent>
            </Card>
          ))}
      </Box>

      {/* ===== UPDATE MODAL ===== */}
      <NhaKhoaUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />

      {/* ===== DIALOG XÁC NHẬN XÓA NHA KHOA ===== */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => (deletingId ? null : setDeleteTarget(null))}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa nha khoa{" "}
            <b>{deleteTarget?.hoVaTen || deleteTarget?.tenGiaoDich}</b>? Hành
            động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            color="inherit"
            disabled={!!deletingId}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={!!deletingId}
            startIcon={
              deletingId ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Delete />
              )
            }
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== MODAL CHỌN NHA KHOA ĐỂ XUẤT EXCEL ===== */}
      <Dialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Xuất Bảng Giá Riêng Ra Excel
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Vui lòng chọn Nha khoa để xuất file Bảng giá tương ứng.
            </Typography>
            <TextField
              select
              fullWidth
              label="Chọn Nha Khoa"
              value={selectedExportNhaKhoa}
              onChange={(e) => setSelectedExportNhaKhoa(e.target.value)}
            >
              <MenuItem value="" disabled>
                -- Chọn Nha Khoa --
              </MenuItem>
              {data &&
                data.map((nk) => (
                  <MenuItem key={nk._id} value={nk._id}>
                    {nk.hoVaTen || nk.tenGiaoDich}
                  </MenuItem>
                ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenExport(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="info"
            disabled={!selectedExportNhaKhoa}
            onClick={handleExportSubmit}
            startIcon={<DownloadIcon />}
          >
            Tiến hành xuất
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
