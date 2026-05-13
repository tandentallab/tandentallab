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
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1201,
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
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            flexShrink: 0,
          }}
        >
          <IconButton color="inherit" onClick={onToggleSidebar}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: {
                xs: "14px",
                sm: "16px",
                md: "20px",
              },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: {
                xs: "140px",
                sm: "250px",
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

        {/* SEARCH */}
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
              sm: "35%",
              md: "40%",
            },
            maxWidth: 500,
          }}
        >
          <SearchIcon sx={{ color: "#666" }} />

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
              xs: 0.5,
              sm: 1.5,
            },
            flexShrink: 0,
          }}
        >
          {isAuthenticated ? (
            <>
              <QuickAddMenu />

              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>

              <HeaderUser />
            </>
          ) : (
            <LoginModal />
          )}
        </Box>
      </Toolbar>

      {/* SEARCH MOBILE */}
      <Box
        sx={{
          display: {
            xs: "flex",
            sm: "none",
          },
          alignItems: "center",
          backgroundColor: "white",
          borderRadius: "999px",
          mx: 2,
          mb: 1.5,
          px: 2,
          py: 0.5,
        }}
      >
        <SearchIcon sx={{ color: "#666" }} />

        <InputBase
          placeholder="Tìm kiếm..."
          sx={{
            ml: 1,
            width: "100%",
            fontSize: "14px",
          }}
        />
      </Box>
    </AppBar>
  );
};

export default Header;
