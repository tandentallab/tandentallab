import React, { useState, useEffect } from "react";
import { toast } from "sonner";
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { api } from "../../config/api";
import { ALL_MENUS } from "../../config/menuConfig";

export default function QuyenSuDung() {
  const [quyens, setQuyens] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ten: "", moTa: "", permissions: [] });
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
    setFormData({ ten: "", moTa: "", permissions: [] });
    setOpenModal(true);
  };

  // 📌 Mở modal sửa
  const handleOpenEdit = (quyen) => {
    setEditingId(quyen._id);
    setFormData({ ten: quyen.ten, moTa: quyen.moTa, permissions: quyen.permissions || [] });
    setOpenModal(true);
  };

  // 📌 Đóng modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingId(null);
    setFormData({ ten: "", moTa: "", permissions: [] });
  };

  const handleTogglePermission = (path) => {
    setFormData((prev) => {
      const perms = prev.permissions;
      if (perms.includes(path)) {
        return { ...prev, permissions: perms.filter((p) => p !== path) };
      } else {
        return { ...prev, permissions: [...perms, path] };
      }
    });
  };

  // 📌 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 📌 Lưu (thêm hoặc sửa)
  const handleSave = async () => {
    if (!formData.ten.trim()) {
      toast.error("Tên quyền sử dụng không được để trống");
      return;
    }

    try {
      if (editingId) {
        // Sửa
        await api.put(`/quyen-su-dung/${editingId}`, formData);
        toast.success("Cập nhật thành công");
      } else {
        // Thêm mới
        await api.post("/quyen-su-dung", formData);
        toast.success("Thêm thành công");
      }
      handleCloseModal();
      fetchQuyens();
      // Reload lại trang để cập nhật permissions mới cho user hiện tại (nếu có thay đổi chính họ)
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error("Lỗi: " + error.response?.data?.message || error.message);
    }
  };

  // 📌 Xoá
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá?")) {
      try {
        await api.delete(`/quyen-su-dung/${id}`);
        toast.success("Xoá thành công");
        fetchQuyens();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error("Lỗi: " + error.response?.data?.message || error.message);
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
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingId ? "Sửa Quyền Sử Dụng" : "Thêm Quyền Sử Dụng"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-4 mt-2">
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

          <Box mt={3}>
            <Typography variant="subtitle1" className="font-bold mb-2">
              Quyền truy cập Menu
            </Typography>
            <Paper variant="outlined" className="p-4 max-h-[300px] overflow-y-auto">
              {ALL_MENUS.map((group, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" className="font-bold text-gray-600 mb-1">
                    {group.title}
                  </Typography>
                  <FormGroup row>
                    {group.items.map((menu) => (
                      <FormControlLabel
                        key={menu.router}
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(menu.router)}
                            onChange={() => handleTogglePermission(menu.router)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{menu.name}</Typography>}
                        sx={{ width: "45%", mb: 0.5 }}
                      />
                    ))}
                  </FormGroup>
                  {index < ALL_MENUS.length - 1 && <Divider className="my-2" />}
                </Box>
              ))}
            </Paper>
          </Box>
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
