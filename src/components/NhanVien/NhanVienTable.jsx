import React, { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchNhanVien,
  deleteNhanVien,
} from "../../redux/slices/nhanVienSlice";

import NhanVienFormModal from "./NhanVienFormModal";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";

const NhanVienTable = () => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const [selectedNhanVien, setSelectedNhanVien] = useState(null);

  const [sortLuong, setSortLuong] = useState("");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { data } = useSelector((state) => state.nhanVien);

  useEffect(() => {
    dispatch(fetchNhanVien());
  }, [dispatch]);

  // ================= SORT =================

  const sortedData = useMemo(() => {
    const arr = [...(data || [])];

    if (sortLuong === "asc") {
      arr.sort(
        (a, b) => Number(a.luongCanBan || 0) - Number(b.luongCanBan || 0)
      );
    }

    if (sortLuong === "desc") {
      arr.sort(
        (a, b) => Number(b.luongCanBan || 0) - Number(a.luongCanBan || 0)
      );
    }

    return arr;
  }, [data, sortLuong]);

  // ================= DELETE =================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa nhân viên này?");

    if (!confirmDelete) return;

    dispatch(deleteNhanVien(id));
  };

  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Danh sách nhân viên</h2>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <FormControl
            size="small"
            sx={{
              minWidth: 220,
              background: "#fff",
            }}
          >
            <InputLabel>Sắp xếp lương</InputLabel>

            <Select
              value={sortLuong}
              label="Sắp xếp lương"
              onChange={(e) => setSortLuong(e.target.value)}
            >
              <MenuItem value="">Mặc định</MenuItem>

              <MenuItem value="asc">Lương tăng dần</MenuItem>

              <MenuItem value="desc">Lương giảm dần</MenuItem>
            </Select>
          </FormControl>

          {/* Add */}
          <Tooltip title="Thêm nhân viên">
            <IconButton
              color="primary"
              onClick={() => {
                setSelectedNhanVien(null);

                handleOpen();
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#1976d2",
              }}
            >
              {[
                "Họ tên",
                "Chức vụ",
                "CCCD",
                "SĐT",
                "Email",
                "Địa chỉ",
                "Lương cơ bản",
                "Thao tác",
              ].map((head) => (
                <TableCell
                  key={head}
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                    backgroundColor: "#1976d2",
                  }}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData?.length > 0 ? (
              sortedData.map((nv) => (
                <TableRow key={nv._id} hover>
                  <TableCell>
                    <Button
                      variant="text"
                      onClick={() => {
                        navigate(`/nhan-vien/${nv._id}`);
                      }}
                    >
                      {nv.hoVaTen}
                    </Button>
                  </TableCell>

                  <TableCell>{nv.chucVu}</TableCell>

                  <TableCell>{nv.cccd}</TableCell>

                  <TableCell>{nv.soDienThoai}</TableCell>

                  <TableCell>{nv.email}</TableCell>

                  <TableCell>{nv.diaChi}</TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "green",
                    }}
                  >
                    {Number(nv.luongCanBan).toLocaleString("vi-VN")}đ
                  </TableCell>

                  <TableCell>
                    {/* Edit */}
                    <Tooltip title="Chỉnh sửa">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedNhanVien(nv);

                          handleOpen();
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Edit */}
                    <Tooltip title="Chi tiết">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          navigate(`/nhan-vien/${nv._id}`);
                        }}
                      >
                        <AssignmentIcon color="success"></AssignmentIcon>
                      </IconButton>
                    </Tooltip>

                    {/* Delete */}
                    <Tooltip title="Xóa">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(nv._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <NhanVienFormModal
        open={open}
        onClose={handleClose}
        initialData={selectedNhanVien}
      />
    </div>
  );
};

export default NhanVienTable;
