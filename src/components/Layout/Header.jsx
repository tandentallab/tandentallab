import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LoginModal from "../Login/LoginModal";
import HeaderUser from "./HeaderUser";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import QuickAddMenu from "./QuickAddMenu";
import { useNavigate } from "react-router-dom";

const Header = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useSelector(getAuthSelector);

  const navigate = useNavigate();

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          background: "#1DA1F2",
          top: 0,
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

        {/* SEARCH - Desktop */}
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
      </Toolbar>
    </AppBar>

    {/* SEARCH MOBILE - shown when xs - OUTSIDE AppBar */}
    <Box
      sx={{
        display: {
          xs: "flex",
          sm: "none",
        },
        alignItems: "center",
        backgroundColor: "#1DA1F2",
        borderRadius: 0,
        mx: 0,
        mb: 0,
        px: 1,
        py: 1,
        width: "100%",
        position: "fixed",
        top: 56,
        left: 0,
        right: 0,
        zIndex: 1200,
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
        }}
      >
        <SearchIcon sx={{ color: "#666", fontSize: "18px" }} />

        <InputBase
          placeholder="Tìm kiếm..."
          sx={{
            ml: 1,
            width: "100%",
            fontSize: "13px",
          }}
        />
      </Box>
    </Box>
    </>
  );
};

export default Header;
