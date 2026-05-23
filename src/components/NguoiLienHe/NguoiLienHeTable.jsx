import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Box,
  Tooltip,
  Card,
  CardContent,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  Search as SearchIcon,
  Star,
  StarBorder,
  Edit,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { fetchNguoiLienHe } from "../../redux/slices/nguoiLienHeSlice";
import NguoiLienHeModal from "./NguoiLienHeModal";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import NguoiLienHeUpdateModal from "./NguoiLienHeUpdateModal";
import { exportDanhSachNguoiLienHeToExcel } from "../../utils/exportToExcel";

export default function NguoiLienHeTable() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.nguoiLienHe);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [favorites, setFavorites] = useState([]);

  const clinicList = useMemo(() => {
    return [...new Set(data?.map((i) => i.nhaKhoa?.hoVaTen).filter(Boolean))];
  }, [data]);

  useEffect(() => {
    dispatch(fetchNguoiLienHe());
  }, [dispatch]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(keyword) ||
        item.email?.toLowerCase().includes(keyword) ||
        item.soDienThoai?.includes(search);

      const matchClinic = selectedClinic
        ? item.nhaKhoa?.hoVaTen === selectedClinic
        : true;

      return matchSearch && matchClinic;
    });
  }, [data, search, selectedClinic]);

  // ===== FAVORITE =====
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // ===== UPDATE =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <Box>
      {/* ===== HEADER ===== */}
      <Box
        className="mb-4"
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          justifyContent: "space-between",
          alignItems: {
            xs: "stretch",
            md: "center",
          },
          gap: 2,
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {/* CHIP */}
          {selectedClinic && (
            <Chip
              label={`Khách hàng: ${selectedClinic}`}
              onDelete={() => setSelectedClinic("")}
              className="bg-gray-200"
            />
          )}

          {/* SELECT */}
          <TextField
            select
            label="Nha khoa"
            size="small"
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            sx={{
              minWidth: {
                xs: "100%",
                sm: 220,
              },
            }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Tất cả</MenuItem>

            {clinicList.map((c, index) => (
              <MenuItem key={index} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm liên hệ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={isMobile}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
            }}
          />

          <NguoiLienHeModal />

          <Tooltip title="Xuất excel danh sách">
            <IconButton onClick={() => exportDanhSachNguoiLienHeToExcel(filteredData)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <IconButton onClick={() => dispatch(fetchNguoiLienHe())}>
            <RefreshIcon />
          </IconButton>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ===== MOBILE VIEW ===== */}
      {isMobile ? (
        <Box className="flex flex-col gap-3">
          {loading && (
            <Box className="flex justify-center py-10">
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Card>
              <CardContent>
                <Typography color="error">{error}</Typography>
              </CardContent>
            </Card>
          )}

          {!loading && filteredData.length === 0 && (
            <Card>
              <CardContent>
                <Typography align="center">Không có dữ liệu</Typography>
              </CardContent>
            </Card>
          )}

          {!loading &&
            filteredData.map((item) => (
              <Card key={item._id} className="rounded-2xl shadow-md">
                <CardContent>
                  <Box className="flex justify-between items-start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {item.hoVaTen}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        ID: {item._id.slice(-6)}
                      </Typography>
                    </Box>

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
                  </Box>

                  <Box className="mt-3 space-y-1">
                    <Typography variant="body2">
                      <b>Email:</b> {item.email || "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>SĐT:</b> {item.soDienThoai || "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Nha khoa:</b> {item.nhaKhoa?.hoVaTen || "-"}
                    </Typography>

                    <Typography variant="body2">
                      <b>Mô tả:</b> {item.moTa || "-"}
                    </Typography>
                  </Box>

                  <Box className="flex justify-end mt-3">
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
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      ) : (
        /* ===== DESKTOP TABLE ===== */
        <TableContainer
          component={Paper}
          className="rounded-2xl shadow-lg"
          sx={{
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell></TableCell>

                <TableCell>
                  <b>Họ tên</b>
                </TableCell>

                <TableCell>
                  <b>Email</b>
                </TableCell>

                <TableCell>
                  <b>SĐT</b>
                </TableCell>

                <TableCell>
                  <b>Nha khoa</b>
                </TableCell>

                <TableCell>
                  <b>Mô tả</b>
                </TableCell>

                <TableCell align="center">
                  <b>Hành động</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* LOADING */}
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {/* ERROR */}
              {error && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    className="text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {/* EMPTY */}
              {!loading && filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {/* DATA */}
              {!loading &&
                filteredData.map((item) => (
                  <TableRow key={item._id} hover>
                    {/* FAVORITE */}
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

                    <TableCell>
                      <div className="font-semibold text-gray-800">
                        {item.hoVaTen}
                      </div>

                      <div className="text-xs text-gray-500">
                        ID: {item._id.slice(-6)}
                      </div>
                    </TableCell>

                    <TableCell>{item.email}</TableCell>

                    <TableCell>{item.soDienThoai}</TableCell>

                    <TableCell>
                      <div className="font-semibold text-gray-800">
                        {item.nhaKhoa?.hoVaTen || "-"}
                      </div>
                    </TableCell>

                    <TableCell>{item.moTa}</TableCell>

                    {/* ACTION */}
                    <TableCell align="center">
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
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ===== MODAL UPDATE ===== */}
      <NguoiLienHeUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />
    </Box>
  );
}
