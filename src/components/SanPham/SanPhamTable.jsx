import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Tooltip,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Refresh, Search } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchSanPham, deleteSanPham } from "../../redux/slices/sanPhamSlice";
import SanPhamModal from "./SanPhamModal";
import AddIcon from "@mui/icons-material/Add";

// 👉 IMPORT FILE CONFIG ĐỂ LẤY DANH SÁCH LỰA CHỌN
import {
  LOAI_TINH_OPTIONS,
  NHOM_SAN_PHAM_OPTIONS,
} from "../../data/sanPhamConfig";

export default function SanPhamTable() {
  const dispatch = useDispatch();
  const { data = [], loading } = useSelector((state) => state.sanPham || {});

  const formatWarranty = (years) => {
    if (years === null || years === undefined || years === 0) return "Không";
    return `${years} năm`;
  };

  // State quản lý Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 👉 STATE QUẢN LÝ TÌM KIẾM VÀ LỌC
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoaiTinh, setFilterLoaiTinh] = useState("Tất cả");
  const [filterNhom, setFilterNhom] = useState("Tất cả");

  useEffect(() => {
    dispatch(fetchSanPham());
  }, [dispatch]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setOpenModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      dispatch(deleteSanPham(id));
    }
  };

  // 👉 LOGIC LỌC DỮ LIỆU THÔNG MINH
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item) => {
      // Lọc theo tên (không phân biệt hoa thường)
      const matchSearch = item.tenSanPham
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      // Lọc theo loại tính
      const matchLoaiTinh =
        filterLoaiTinh === "Tất cả" || item.loaiTinh === filterLoaiTinh;
      // Lọc theo nhóm
      const matchNhom =
        filterNhom === "Tất cả" || item.nhomSanPham === filterNhom;

      return matchSearch && matchLoaiTinh && matchNhom;
    });
  }, [data, searchTerm, filterLoaiTinh, filterNhom]);

  return (
    <Box className="p-0 sm:p-2">
      {/* THANH CÔNG CỤ TÌM KIẾM VÀ LỌC */}
      <Box className="flex flex-col md:flex-row flex-wrap gap-4 mb-5 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <TextField
          size="small"
          placeholder="Tìm kiếm theo tên sản phẩm..."
          variant="outlined"
          className="flex-1 w-full md:w-auto bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ "& fieldset": { border: "none" } }}
        />

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <TextField
            select
            size="small"
            label="Loại tính"
            value={filterLoaiTinh}
            onChange={(e) => setFilterLoaiTinh(e.target.value)}
            className="w-full sm:w-[200px]"
          >
            <MenuItem value="Tất cả" className="font-medium text-blue-600">
              Tất cả
            </MenuItem>
            {LOAI_TINH_OPTIONS.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Nhóm sản phẩm"
            value={filterNhom}
            onChange={(e) => setFilterNhom(e.target.value)}
            className="w-full sm:w-[250px]"
          >
            <MenuItem value="Tất cả" className="font-medium text-blue-600">
              Tất cả
            </MenuItem>
            {NHOM_SAN_PHAM_OPTIONS.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="flex justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Tooltip title="Thêm sản phẩm">
            <IconButton
              onClick={handleAdd}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => dispatch(fetchSanPham())}
            disabled={loading}
            className="bg-white shadow-sm border border-gray-200"
          >
            <Refresh
              className={
                loading ? "animate-spin text-blue-500" : "text-gray-600"
              }
            />
          </IconButton>
        </div>
      </Box>

      <TableContainer
        component={Paper}
        className="rounded-xl shadow-md border border-gray-100 overflow-x-auto"
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead className="bg-gray-50">
            <TableRow>
              <TableCell>
                <b>Tên sản phẩm</b>
              </TableCell>
              <TableCell>
                <b>Loại tính</b>
              </TableCell>
              <TableCell>
                <b>Nhóm</b>
              </TableCell>
              <TableCell>
                <b>Bảo hành</b>
              </TableCell>
              <TableCell>
                <b>Đơn giá</b>
              </TableCell>
              <TableCell align="center">
                <b>Thao tác</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell className="font-medium text-gray-800">
                  {item.tenSanPham}
                </TableCell>
                <TableCell>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                    {item.loaiTinh}
                  </span>
                </TableCell>
                <TableCell>{item.nhomSanPham}</TableCell>
                <TableCell>{formatWarranty(item.baoHanhMacDinh)}</TableCell>
                <TableCell className="text-[#f57c00] font-bold">
                  {item.donGiaChung?.toLocaleString("vi-VN")} đ
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Sửa">
                    <IconButton size="small" onClick={() => handleEdit(item)}>
                      <Edit className="text-blue-500" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item._id)}
                    >
                      <Delete className="text-red-500" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {/* HIỂN THỊ KHI KHÔNG CÓ KẾT QUẢ TÌM KIẾM */}
            {filteredData.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  className="text-gray-400 py-10"
                >
                  <div className="flex flex-col items-center">
                    <Search
                      style={{ fontSize: 40 }}
                      className="text-gray-300 mb-2"
                    />
                    <Typography>
                      Không tìm thấy sản phẩm nào phù hợp!
                    </Typography>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SanPhamModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        isEdit={!!selectedProduct}
        editData={selectedProduct}
      />
    </Box>
  );
}
