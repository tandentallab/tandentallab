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
  IconButton,
  Chip,
  Box,
  InputAdornment,
  MenuItem,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";

import { useDispatch, useSelector } from "react-redux";
import { fetchBenhNhan } from "../../redux/slices/benhNhanSlice";
import BenhNhanModal from "./BenhNhanModal";
import BenhNhanUpdateModal from "./BenhNhanUpdateModal";
import { exportDanhSachBenhNhanToExcel } from "../../utils/exportToExcel";

export default function BenhNhanTable() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.benhNhan);

  // ===== STATE =====
  const [search, setSearch] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    dispatch(fetchBenhNhan());
  }, [dispatch]);

  // ===== DANH SÁCH NHA KHOA =====
  const clinicList = useMemo(() => {
    return [...new Set(data?.map((i) => i.nhaKhoa?.hoVaTen).filter(Boolean))];
  }, [data]);

  // ===== FILTER =====
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.hoVaTen?.toLowerCase().includes(search.toLowerCase()) ||
        item.soHoSo?.toLowerCase().includes(search.toLowerCase());

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

  // ===== EDIT =====
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEdit = (item) => {
    setSelectedRow(item);
    setOpenEdit(true);
  };

  return (
    <Box>
      {/* ===== HEADER ===== */}
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
          {selectedClinic && (
            <Chip
              label={`Khách hàng: ${selectedClinic}`}
              onDelete={() => setSelectedClinic("")}
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
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <TextField
            size="small"
            placeholder="Tìm kiếm liên hệ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

          <BenhNhanModal />

          <Tooltip title="Xuất excel danh sách">
            <IconButton
              onClick={() => exportDanhSachBenhNhanToExcel(filteredData)}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>

          <IconButton onClick={() => dispatch(fetchBenhNhan())}>
            <RefreshIcon />
          </IconButton>

          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ===== DESKTOP TABLE ===== */}
      <Box
        sx={{
          display: {
            xs: "none",
            lg: "block",
          },
        }}
      >
        <TableContainer component={Paper} className="rounded-2xl shadow-lg">
          <Table>
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell width={50}></TableCell>

                <TableCell>
                  <b>Tên</b>
                </TableCell>

                <TableCell>
                  <b>Số hồ sơ</b>
                </TableCell>

                <TableCell>
                  <b>Giới tính</b>
                </TableCell>

                <TableCell>
                  <b>Nha khoa</b>
                </TableCell>

                <TableCell width={80}></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* LOADING */}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}

              {/* ERROR */}
              {error && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}

              {/* DATA */}
              {!loading &&
                filteredData.map((item) => {
                  const isFav = favorites.includes(item._id);

                  return (
                    <TableRow
                      key={item._id}
                      hover
                      className={isFav ? "bg-yellow-50" : ""}
                    >
                      {/* FAVORITE */}
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(item._id)}
                        >
                          {isFav ? (
                            <StarIcon className="text-yellow-400" />
                          ) : (
                            <StarBorderIcon />
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

                      {/* SỐ HỒ SƠ */}
                      <TableCell>{item.soHoSo}</TableCell>

                      {/* GIỚI TÍNH */}
                      <TableCell>{item.gioiTinh}</TableCell>

                      {/* NHA KHOA */}
                      <TableCell>{item.nhaKhoa?.hoVaTen || "-"}</TableCell>

                      {/* EDIT */}
                      <TableCell>
                        <Tooltip title="Chỉnh sửa">
                          <IconButton onClick={() => handleEdit(item)}>
                            <EditIcon className="text-blue-500 hover:text-blue-700" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="caption" color="text.secondary">
                    Tổng số {data?.length} bệnh nhân
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
        {/* LOADING */}
        {loading && (
          <Box className="flex justify-center py-10">
            <CircularProgress />
          </Box>
        )}

        {/* ERROR */}
        {error && (
          <Paper className="p-5 text-center text-red-500">{error}</Paper>
        )}

        {/* EMPTY */}
        {!loading && filteredData.length === 0 && (
          <Paper className="p-5 text-center">Không có dữ liệu</Paper>
        )}

        {/* DATA */}
        {!loading &&
          filteredData.map((item) => {
            const isFav = favorites.includes(item._id);

            return (
              <Card
                key={item._id}
                sx={{
                  borderRadius: "18px",
                  boxShadow: 3,
                  backgroundColor: isFav ? "#FEFCE8" : "#fff",
                }}
              >
                <CardContent>
                  {/* HEADER */}
                  <Box className="flex justify-between items-start">
                    <Box>
                      <Typography fontWeight={700}>{item.hoVaTen}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        ID: {item._id.slice(-6)}
                      </Typography>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(item._id)}
                    >
                      {isFav ? (
                        <StarIcon className="text-yellow-400" />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* SỐ HỒ SƠ */}
                  <Box mb={1.5}>
                    <Typography variant="body2" fontWeight={600}>
                      Số hồ sơ
                    </Typography>

                    <Typography variant="body2">
                      {item.soHoSo || "-"}
                    </Typography>
                  </Box>

                  {/* GIỚI TÍNH */}
                  <Box mb={1.5}>
                    <Typography variant="body2" fontWeight={600}>
                      Giới tính
                    </Typography>

                    <Typography variant="body2">
                      {item.gioiTinh || "-"}
                    </Typography>
                  </Box>

                  {/* NHA KHOA */}
                  <Box mb={2}>
                    <Typography variant="body2" fontWeight={600}>
                      Nha khoa
                    </Typography>

                    <Typography variant="body2">
                      {item.nhaKhoa?.hoVaTen || "-"}
                    </Typography>
                  </Box>

                  {/* ACTION */}
                  <Box className="flex justify-end">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => handleEdit(item)}>
                        <EditIcon className="text-blue-500 hover:text-blue-700" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
      </Box>

      {/* ===== UPDATE MODAL ===== */}
      <BenhNhanUpdateModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={selectedRow}
      />
    </Box>
  );
}
