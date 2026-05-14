import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Modal,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";

// Redux Actions (Đảm bảo đường dẫn đúng với cấu trúc dự án của bạn)
import {
  fetchChamSocByNhaKhoa,
  clearChamSoc,
} from "../../redux/slices/chamSocKhachHangSlice";

import TabThongTinNhaKhoa from "./TabThongTinNhaKhoa";
import TabChamSocKhachHang from "./TabChamSocKhachHang";
import TabBangGiaRieng from "./TabBangGiaRieng";
import { fetchBangGiaByNhaKhoa } from "../../redux/slices/bangGiaSlice";
import { Info } from "lucide-react";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { fetchSanPham } from "../../redux/slices/sanPhamSlice";

const NhaKhoaDetailModal = ({ nhaKhoaData }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    type: "CALL",
    content: "",
    result: "",
    nextCareDate: "",
  });

  const dispatch = useDispatch();
  // 3. Xử lý đóng/mở Modal
  const handleOpen = () => {
    setOpen(true);
    if (nhaKhoaData?._id) {
      dispatch(fetchChamSocByNhaKhoa(nhaKhoaData._id));
      dispatch(fetchBangGiaByNhaKhoa(nhaKhoaData._id));
      dispatch(fetchSanPham);
    }
  };

  const handleClose = () => {
    setOpen(false);
    dispatch(clearChamSoc()); // Xóa dữ liệu cũ khi đóng modal
    setTab(0);
  };

  return (
    <>
      <Tooltip title="Chi tiết & Chăm sóc">
        <IconButton
          onClick={handleOpen}
          sx={{
            color: "#10b981",
          }}
        >
          <AssignmentIcon />
        </IconButton>
      </Tooltip>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Box
          sx={{
            width: "950px",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "24px",
            boxShadow: 24,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              color: "white",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {nhaKhoaData?.hoVaTen}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ID: {nhaKhoaData?._id}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
            <Tabs value={tab} onChange={(e, v) => setTab(v)}>
              <Tab
                label="Thông tin tổng quan"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                label="Lịch sử chăm sóc"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
              <Tab
                label="Bảng giá riêng"
                sx={{ textTransform: "none", fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          <Box
            sx={{ p: 4, overflowY: "auto", bgcolor: "#f8fafc", flexGrow: 1 }}
          >
            {tab === 0 && (
              <TabThongTinNhaKhoa
                nhaKhoaData={nhaKhoaData}
              ></TabThongTinNhaKhoa>
            )}
            {tab === 1 && (
              <TabChamSocKhachHang
                nhaKhoaData={nhaKhoaData}
              ></TabChamSocKhachHang>
            )}
            {tab === 2 && (
              <TabBangGiaRieng
                nhaKhoaData={nhaKhoaData}
                handleClose={handleClose}
              ></TabBangGiaRieng>
            )}
          </Box>
          <Box sx={{ p: 2, textAlign: "right", bgcolor: "#f1f5f9" }}>
            <Button onClick={handleClose} variant="text" color="inherit">
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default NhaKhoaDetailModal;
