import React, { useState } from "react";
import { Modal, Box, TextField, Typography, Button, IconButton } from "@mui/material";
import { Close as CloseIcon, Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { createCongDoan } from "../../redux/slices/congDoanSlice";
import { toast } from "sonner";

export default function CongDoanModal() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [tenCongDoan, setTenCongDoan] = useState("");

  const handleSubmit = async () => {
    if (!tenCongDoan.trim()) return toast.error("Vui lòng nhập tên công đoạn");

    try {
      await dispatch(createCongDoan({ tenCongDoan })).unwrap();
      setOpen(false);
      setTenCongDoan("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        className="bg-blue-600 normal-case w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Thêm Công Đoạn
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box className="bg-white w-[90%] md:w-[400px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl flex flex-col">
          <div className="bg-[#0091ea] px-4 py-2 flex justify-between items-center text-white">
            <Typography variant="h6" className="font-medium text-[16px]">Thêm vào Kho</Typography>
            <IconButton onClick={() => setOpen(false)} color="inherit" size="small"><CloseIcon /></IconButton>
          </div>

          <div className="p-6">
            <TextField
              label="Tên công đoạn mới *"
              variant="standard"
              fullWidth
              autoFocus
              value={tenCongDoan}
              onChange={(e) => setTenCongDoan(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="Ví dụ: Mài sứ, Đắp sứ..."
            />
          </div>

          <div className="p-3 flex justify-end bg-gray-50 border-t gap-2">
            <Button onClick={() => setOpen(false)} className="text-gray-500 w-full md:w-auto">Hủy</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
              className="bg-blue-600 px-6 w-full md:w-auto"
            >
              Lưu lại
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
}