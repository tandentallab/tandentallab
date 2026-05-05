import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Drawer,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
} from "@mui/material";
import { api } from "../../config/api";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const emptyForm = {
  ten_nha_cung_cap: "",
  ten_giao_dich: "",
  so_di_dong: "",
  dien_thoai: "",
  website: "",
  quoc_gia: "",
  tinh: "",
  quan_huyen: "",
  dia_chi: "",
  mo_ta: "",
};

const NhaCungCapPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.get("/nha-cung-cap");
      setList(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openDrawer = (item) => {
    setSelected(item);
    setForm({
      ten_nha_cung_cap: item.ten_nha_cung_cap || "",
      ten_giao_dich: item.ten_giao_dich || "",
      so_di_dong: item.so_di_dong || "",
      dien_thoai: item.dien_thoai || "",
      website: item.website || "",
      quoc_gia: item.quoc_gia || "",
      tinh: item.tinh || "",
      quan_huyen: item.quan_huyen || "",
      dia_chi: item.dia_chi || "",
      mo_ta: item.mo_ta || "",
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await api.put(`/nha-cung-cap/${selected._id}`, form);
      setDrawerOpen(false);
      setSelected(null);
      fetchList();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    if (!createForm.ten_nha_cung_cap) return;
    setCreating(true);
    try {
      await api.post(`/nha-cung-cap`, createForm);
      setCreateOpen(false);
      setCreateForm(emptyForm);
      fetchList();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Nhà cung cấp</h1>
        <div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setCreateForm(emptyForm);
              setCreateOpen(true);
            }}
          >
            Thêm
          </Button>
        </div>
      </div>

      {loading ? (
        <Box className="flex items-center justify-center p-6">
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nhà cung cấp</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Quận/Huyện</TableCell>
              <TableCell>Tỉnh</TableCell>
              <TableCell>Điện thoại</TableCell>
              <TableCell>Số di động</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Ngày tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((item) => (
              <TableRow
                key={item._id}
                hover
                onClick={() => openDrawer(item)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{item.ten_nha_cung_cap}</TableCell>
                <TableCell>{item.dia_chi}</TableCell>
                <TableCell>{item.quan_huyen}</TableCell>
                <TableCell>{item.tinh}</TableCell>
                <TableCell>{item.dien_thoai}</TableCell>
                <TableCell>{item.so_di_dong}</TableCell>
                <TableCell>{item.website}</TableCell>
                <TableCell>
                  {item.ngay_tao ? new Date(item.ngay_tao).toLocaleDateString() : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          "& .MuiDrawer-paper": {
            width: 520,
            top: "66px",
            height: "calc(100% - 66px)",
            overflow: "hidden",
          },
        }}
      >
        <Box className="h-full flex flex-col bg-white">
          <div className="bg-[#0091ea] px-4 py-3 text-white flex items-center gap-3 shrink-0">
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(false)}
              className="text-white hover:bg-blue-600"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" className="font-medium text-[16px]">
              Chỉnh sửa Nhà cung cấp
            </Typography>
          </div>

          <Box className="space-y-4 flex-1 overflow-y-auto px-4 py-4">
            <TextField
              fullWidth
              label="Tên nhà cung cấp"
              value={form.ten_nha_cung_cap}
              onChange={(e) => setForm({ ...form, ten_nha_cung_cap: e.target.value })}
            />
            <TextField
              fullWidth
              label="Tên giao dịch"
              value={form.ten_giao_dich}
              onChange={(e) => setForm({ ...form, ten_giao_dich: e.target.value })}
            />
            <div className="flex gap-2">
              <TextField
                label="Số di động"
                value={form.so_di_dong}
                onChange={(e) => setForm({ ...form, so_di_dong: e.target.value })}
                fullWidth
              />
              <TextField
                label="Điện thoại"
                value={form.dien_thoai}
                onChange={(e) => setForm({ ...form, dien_thoai: e.target.value })}
                fullWidth
              />
            </div>
            <TextField
              fullWidth
              label="Website"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
            <div className="flex gap-2">
              <TextField
                label="Quốc gia"
                value={form.quoc_gia}
                onChange={(e) => setForm({ ...form, quoc_gia: e.target.value })}
                fullWidth
              />
              <TextField
                label="Tỉnh"
                value={form.tinh}
                onChange={(e) => setForm({ ...form, tinh: e.target.value })}
                fullWidth
              />
            </div>
            <TextField
              fullWidth
              label="Quận/Huyện"
              value={form.quan_huyen}
              onChange={(e) => setForm({ ...form, quan_huyen: e.target.value })}
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              value={form.dia_chi}
              onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mô tả"
              value={form.mo_ta}
              onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}
            />
          </Box>

          <Box className="border-t px-4 py-3 flex justify-end shrink-0 bg-gray-50">
            <Button variant="contained" onClick={handleSave}>
              Lưu
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm Nhà cung cấp</DialogTitle>
        <DialogContent>
          <Box className="space-y-4 mt-2">
            <TextField
              fullWidth
              required
              label="Tên nhà cung cấp"
              value={createForm.ten_nha_cung_cap}
              onChange={(e) => setCreateForm({ ...createForm, ten_nha_cung_cap: e.target.value })}
            />
            <TextField
              fullWidth
              label="Tên giao dịch"
              value={createForm.ten_giao_dich}
              onChange={(e) => setCreateForm({ ...createForm, ten_giao_dich: e.target.value })}
            />
            <div className="flex gap-2">
              <TextField
                label="Số di động"
                value={createForm.so_di_dong}
                onChange={(e) => setCreateForm({ ...createForm, so_di_dong: e.target.value })}
                fullWidth
              />
              <TextField
                label="Điện thoại"
                value={createForm.dien_thoai}
                onChange={(e) => setCreateForm({ ...createForm, dien_thoai: e.target.value })}
                fullWidth
              />
            </div>
            <TextField
              fullWidth
              label="Website"
              value={createForm.website}
              onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
            />
            <div className="flex gap-2">
              <TextField
                label="Quốc gia"
                value={createForm.quoc_gia}
                onChange={(e) => setCreateForm({ ...createForm, quoc_gia: e.target.value })}
                fullWidth
              />
              <TextField
                label="Tỉnh"
                value={createForm.tinh}
                onChange={(e) => setCreateForm({ ...createForm, tinh: e.target.value })}
                fullWidth
              />
            </div>
            <TextField
              fullWidth
              label="Quận/Huyện"
              value={createForm.quan_huyen}
              onChange={(e) => setCreateForm({ ...createForm, quan_huyen: e.target.value })}
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              value={createForm.dia_chi}
              onChange={(e) => setCreateForm({ ...createForm, dia_chi: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Mô tả"
              value={createForm.mo_ta}
              onChange={(e) => setCreateForm({ ...createForm, mo_ta: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Hủy</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? <CircularProgress size={18} /> : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NhaCungCapPage;
