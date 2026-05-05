import React from "react";
import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const KhoPage = () => {
  const navigate = useNavigate();

  return (
    <Box className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý Kho</h1>
      <p className="mb-4">Chọn một mục để quản lý:</p>
      <div className="flex gap-2">
        <Button variant="outlined" onClick={() => navigate("/kho/vat-lieu")}>Vật liệu</Button>
        <Button variant="outlined" onClick={() => navigate("/kho/phieu-nhap-xuat")}>Phiếu nhập xuất</Button>
        <Button variant="outlined" onClick={() => navigate("/kho/nha-cung-cap")}>Nhà cung cấp</Button>
      </div>
    </Box>
  );
};

export default KhoPage;
