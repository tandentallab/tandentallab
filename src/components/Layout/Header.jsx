import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import LoginModal from "../Login/LoginModal";
import HeaderUser from "./HeaderUser";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import QuickAddMenu from "./QuickAddMenu";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useSelector(getAuthSelector);
  const navigate = useNavigate();

  // State quản lý mở/đóng thanh tìm kiếm trên mobile
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201, // Lưu ý: Nếu muốn Sidebar đè lên Header, bạn cần set Drawer zIndex > 1201
        background: "#1DA1F2",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          minHeight: {
            xs: 64,
            sm: 70,
          },
          px: {
            xs: 1,
            sm: 2,
          },
          position: "relative", // Cần thiết để Slide phủ lên Toolbar
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: {
              xs: 1,
              sm: 2,
            },
            height: {
              xs: 56,
              sm: 64,
              md: 70,
            },
            minHeight: {
              xs: 56,
              sm: 64,
              md: 70,
            },
            px: {
              xs: 1.5,
              sm: 2,
            },
            flexWrap: "nowrap",
          }}
        >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0.5,
              sm: 1,
            },
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          <IconButton 
            color="inherit" 
            onClick={onToggleSidebar}
            sx={{
              p: {
                xs: 0.75,
                sm: 1,
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              cursor: "pointer",
              ml: {
                xs: 0.5,
                sm: 0.75,
              },
              fontWeight: 600,
              fontSize: {
                xs: "12px",
                sm: "16px",
                md: "20px",
              },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: {
                xs: "80px",
                sm: "200px",
                md: "unset",
              },
            }}
            onClick={() => {
              navigate("/");
            }}
          >
            TẤN DENTAL
          </Typography>
        </Box>

        {/* SEARCH DESKTOP */}
        <Box
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: "999px",
            px: 2,
            py: 0.5,
            width: {
              sm: "30%",
              md: "40%",
            },
            maxWidth: 500,
            flex: {
              sm: 1,
              md: "0 1 auto",
            },
          }}
        >
          <SearchIcon sx={{ color: "#666", fontSize: "20px" }} />

          <InputBase
            placeholder="Tìm kiếm..."
            sx={{
              ml: 1,
              width: "100%",
              fontSize: "14px",
            }}
          />
        </Box>

        {/* RIGHT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0.25,
              sm: 1.5,
            },
            flexShrink: 0,
          }}
        >
          {/* Nút bật/tắt tìm kiếm cho Mobile */}
          <IconButton
            color="inherit"
            onClick={() => setSearchOpen(true)}
            sx={{
              display: { xs: "inline-flex", sm: "none" },
            }}
          >
            <SearchIcon />
          </IconButton>

          {isAuthenticated ? (
            <>
              <QuickAddMenu />

              <IconButton color="inherit" size="small">
                <NotificationsIcon />
              </IconButton>

              <HeaderUser />
            </>
          ) : (
            <LoginModal />
          )}
        </Box>

        {/* MOBILE SEARCH OVERLAY - Trượt ngang */}
        <Slide direction="left" in={searchOpen} unmountOnExit>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#1DA1F2", // Nền xanh đồng bộ header
              display: { xs: "flex", sm: "none" }, // Chỉ hiện ở mobile
              alignItems: "center",
              px: 2,
              boxSizing: "border-box",
              zIndex: 10,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: "999px",
                px: 2,
                py: 0.5,
                width: "100%",
                flexGrow: 1,
              }}
            >
              <SearchIcon sx={{ color: "#666" }} />

              <InputBase
                autoFocus // Tự động trỏ nháy chuột vào khi mở
                placeholder="Tìm kiếm..."
                sx={{
                  ml: 1,
                  width: "100%",
                  fontSize: "14px",
                }}
              />
            </Box>

            {/* Nút đóng */}
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(false)}
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Slide>
      </Toolbar>
      </Toolbar>
    </AppBar>
  );
};

export default Header;