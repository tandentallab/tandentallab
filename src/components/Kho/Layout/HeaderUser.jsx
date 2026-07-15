import React, { useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { getAuthSelector } from "../../redux/selector";
import { useNavigate } from "react-router-dom";

export default function HeaderUser() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector(getAuthSelector);

  const [anchorEl, setAnchorEl] = useState(null);

  if (!isAuthenticated) return null;

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  return (
    <div className="flex items-center gap-2">
      {/* NAME */}
      <Typography className="text-sm font-medium hidden md:block">
        {user?.HoTenNV}
      </Typography>

      {/* AVATAR */}
      <IconButton onClick={handleOpen}>
        <Avatar className="bg-blue-500">
          {user?.HoTenNV?.charAt(0) || "U"}
        </Avatar>
      </IconButton>

      {/* DROPDOWN MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <div className="px-4 py-2">
          <Typography className="font-semibold">{user?.HoTenNV}</Typography>
          <Typography className="text-sm text-gray-500">
            {user?.MSNV}
          </Typography>
        </div>

        <Divider />

        <MenuItem
          onClick={() => {
            navigate("/ho-so");
          }}
        >
          Hồ sơ
        </MenuItem>

        <MenuItem onClick={handleLogout} className="text-red-500">
          Đăng xuất
        </MenuItem>
      </Menu>
    </div>
  );
}
