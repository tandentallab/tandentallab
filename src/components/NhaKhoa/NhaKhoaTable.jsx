import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
  Close,
} from "@mui/icons-material";

import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useDispatch, useSelector } from "react-redux";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import NhaKhoaModal from "./NhaKhoaModal";
import NhaKhoaUpdateModal from "./NhaKhoaUpdateModal";
import NhaKhoaDetailModal from "./NhaKhoaDetailModal";

export default function NhaKhoaTable() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.nhaKhoa);

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // ===== DANH SÁCH TỈNH THÀNH  =====
  const provinces = useMemo(() => {
    return [...new Set(data?.map((i) => i.tinh).filter(Boolean))];
  }, [data]);
  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.soDienThoai?.includes(keyword) ||
        item.diaChiCuThe?.toLowerCase().includes(keyword);

      const matchProvince = selectedProvince
        ? item.tinh === selectedProvince
        : true;

      return matchSearch && matchProvince;
    });
  }, [data, search, selectedProvince]);

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  //UPDATE
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <Box>
      {/* ===== FILTER BAR (GIỐNG NGƯỜI LIÊN HỆ) ===== */}
      <Box className="flex justify-between items-center mb-4">
        {/* LEFT */}
        <Box className="flex items-center gap-3">
          {/* CHIP */}
          {selectedProvince && (
            <Chip
              label={`Tỉnh/Thành: ${selectedProvince}`}
              onDelete={() => setSelectedProvince("")}
              className="bg-gray-200"
            />
          )}

          {/* SELECT */}
          <TextField
            select
            label="Tỉnh/Thành"
            size="small"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="w-52"
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
        <Box className="flex items-center gap-2">
          {/* SEARCH */}
          <TextField
            size="small"
            placeholder="Tìm nha khoa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          <NhaKhoaModal></NhaKhoaModal>

          {/* REFRESH */}
          <IconButton onClick={() => dispatch(fetchNhaKhoa())}>
            <RefreshIcon />
          </IconButton>

          {/* MORE */}
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ===== TABLE ===== */}
      <TableContainer component={Paper} className="rounded-2xl shadow-lg">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              <TableCell></TableCell>
              <TableCell>
                <b>Tên</b>
              </TableCell>
              <TableCell>
                <b>Liên hệ</b>
              </TableCell>
              <TableCell>
                <b>Địa chỉ</b>
              </TableCell>
              <TableCell>
                <b>Website</b>
              </TableCell>
              <TableCell>
                <b>Mô tả</b>
              </TableCell>
              <TableCell>
                <b>Ngày tạo</b>
              </TableCell>
              <TableCell align="center">
                <b>Hành động</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* 🔥 LOADING */}
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}

            {filteredData.map((item) => (
              <TableRow key={item._id} hover>
                {/* ⭐ FAVORITE */}
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(item._id)}
                  >
                    {favorites.includes(item._id) ? (
                      <Star className="text-yellow-400" />
                    ) : (
                      <StarBorder className="text-gray-400" />
                    )}
                  </IconButton>
                </TableCell>

                {/* TÊN */}
                <TableCell>
                  <div className="font-semibold text-gray-800">
                    {item.hoVaTen}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {item._id.slice(-6)}
                  </div>
                </TableCell>

                {/* LIÊN HỆ */}
                <TableCell>
                  <div>{item.soDienThoai}</div>
                  <div className="text-xs text-blue-500">{item.email}</div>
                </TableCell>

                {/* ĐỊA CHỈ */}
                <TableCell>
                  <div className="text-sm">{item.diaChiCuThe}</div>
                  <div className="text-xs text-gray-500">
                    {item.tinh}, {item.quocGia}
                  </div>
                </TableCell>

                {/* WEBSITE */}
                <TableCell>
                  <a
                    href={`https://${item.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {item.website}
                  </a>
                </TableCell>

                {/* MÔ TẢ */}
                <TableCell>
                  <div className="max-w-[200px] truncate">{item.moTa}</div>
                </TableCell>

                {/* NGÀY */}
                <TableCell>
                  <Chip
                    label={new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    color="success"
                    size="small"
                  />
                </TableCell>

                {/* ACTION */}
                <TableCell align="center">
                  <div className="flex items-center">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRow(item);
                          setOpenEdit(true);
                        }}
                      >
                        <Edit className="text-blue-500" />
                      </IconButton>
                    </Tooltip>
                    <NhaKhoaDetailModal nhaKhoaData={item}></NhaKhoaDetailModal>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <NhaKhoaUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />
    </Box>
  );
}
