import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { api } from "../../config/api";

export default function QuyenSuDung() {
  const [quyens, setQuyens] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ten: "", moTa: "" });
  const [loading, setLoading] = useState(false);

  // 📌 Fetch data
  const fetchQuyens = async () => {
    try {
      setLoading(true);
      const response = await api.get("/quyen-su-dung");
      setQuyens(response.data.data || []);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuyens();
  }, []);

  // 📌 Mở modal thêm mới
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ ten: "", moTa: "" });
    setOpenModal(true);
  };

  // 📌 Mở modal sửa
  const handleOpenEdit = (quyen) => {
    setEditingId(quyen._id);
    setFormData({ ten: quyen.ten, moTa: quyen.moTa });
    setOpenModal(true);
  };

  // 📌 Đóng modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    setFormData({ ten: "", moTa: "" });
  };

  // 📌 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 📌 Lưu (thêm hoặc sửa)
  const handleSave = async () => {
    if (!formData.ten.trim()) {
      alert("Tên quyền sử dụng không được để trống");
      return;
    }

    try {
      if (editingId) {
        // Sửa
        await api.put(`/quyen-su-dung/${editingId}`, formData);
        alert("Cập nhật thành công");
      } else {
        // Thêm mới
        await api.post("/quyen-su-dung", formData);
        alert("Thêm thành công");
      }
      handleCloseModal();
      fetchQuyens();
    } catch (error) {
      alert("Lỗi: " + error.response?.data?.message || error.message);
    }
  };

  // 📌 Xoá
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá?")) {
      try {
        await api.delete(`/quyen-su-dung/${id}`);
        alert("Xoá thành công");
        fetchQuyens();
      } catch (error) {
        alert("Lỗi: " + error.response?.data?.message || error.message);
      }
    }
  };

  return (
    <Box className="p-6">
      <Paper className="p-6">
        {/* Header */}
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h5" className="font-bold">
            Quyền Sử Dụng
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenAdd}
          >
            Thêm Quyền
          </Button>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableCell className="font-bold">Tên</TableCell>
                <TableCell className="font-bold">Mô Tả</TableCell>
                <TableCell className="font-bold" align="center">
                  Hành Động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quyens.length > 0 ? (
                quyens.map((quyen) => (
                  <TableRow key={quyen._id}>
                    <TableCell>{quyen.ten}</TableCell>
                    <TableCell>{quyen.moTa}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(quyen)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xoá">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(quyen._id)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal Thêm/Sửa */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Sửa Quyền Sử Dụng" : "Thêm Quyền Sử Dụng"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4">
          <TextField
            fullWidth
            label="Tên Quyền Sử Dụng"
            name="ten"
            value={formData.ten}
            onChange={handleChange}
            placeholder="VD: Admin, Nhân viên, ..."
          />
          <TextField
            fullWidth
            label="Mô Tả"
            name="moTa"
            value={formData.moTa}
            onChange={handleChange}
            placeholder="Mô tả quyền sử dụng (tuỳ chọn)"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Huỷ</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingId ? "Cập Nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

