import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast } from "sonner";
import { api } from "../../config/api";

export default function GhiChuAddModal({
  open,
  onClose,
  initialMaDonHang = "",
  initialDonHangId = "",
  noteToEdit = null,
  onSuccess,
}) {
  const [maDonHang, setMaDonHang] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (noteToEdit) {
        setMaDonHang(noteToEdit.maDonHang || "");
        setNoiDung(noteToEdit.noiDung || "");
      } else {
        setMaDonHang(initialMaDonHang);
        setNoiDung("");
      }
    }
  }, [open, initialMaDonHang, noteToEdit]);

  const handleSave = async () => {
    if (!noiDung.trim()) {
      toast.error("Vui lòng nhập nội dung ghi chú!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        maDonHang: maDonHang.trim(),
        noiDung: noiDung.trim(),
      };

      let res;
      if (noteToEdit) {
        res = await api.put(`/ghi-chu/${noteToEdit._id}`, payload);
      } else {
        res = await api.post("/ghi-chu", payload);
      }

      if (res.data?.success) {
        toast.success(noteToEdit ? "Cập nhật ghi chú thành công!" : "Thêm ghi chú thành công!");
        if (onSuccess) onSuccess(res.data.data);
        onClose();
      }
    } catch (err) {
      toast.error(
        (noteToEdit ? "Lỗi khi cập nhật ghi chú: " : "Lỗi khi thêm ghi chú: ") +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: "rounded-2xl p-2", style: { zIndex: 10000 } }}
      sx={{ zIndex: 10000 }}
    >
      <DialogTitle className="font-bold text-gray-800 flex justify-between items-center">
        <span>{noteToEdit ? "Cập nhật Ghi Chú" : "Tạo Ghi Chú Mới"}</span>
        <IconButton onClick={onClose} size="small" className="text-gray-400 hover:text-gray-600">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="space-y-4 pt-4 mt-2">
        <TextField
          fullWidth
          disabled={!!initialMaDonHang || !!noteToEdit}
          label="Mã đơn hàng (nếu có)"
          value={maDonHang}
          onChange={(e) => setMaDonHang(e.target.value)}
          helperText={initialMaDonHang || noteToEdit ? "" : "Để trống nếu đây là ghi chú công việc chung"}
          size="small"
          InputProps={{ className: "rounded-xl" }}
          sx={{ mt: 1.5 }}
        />
        <TextField
          fullWidth
          required
          label="Nội dung cần xử lý"
          value={noiDung}
          onChange={(e) => setNoiDung(e.target.value)}
          placeholder="Nhập chi tiết yêu cầu, ghi chú cần admin thực hiện..."
          multiline
          rows={4}
          InputProps={{ className: "rounded-xl" }}
        />
      </DialogContent>
      <DialogActions className="p-4 gap-2">
        <Button onClick={onClose} disabled={submitting} className="text-gray-500 font-semibold">
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={submitting || !noiDung.trim()}
          className="bg-blue-600 hover:bg-blue-700 font-semibold px-4 rounded-xl shadow-sm"
        >
          {submitting ? "Đang lưu..." : noteToEdit ? "Cập nhật" : "Lưu ghi chú"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
