import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AddIcon from "@mui/icons-material/Add";
import LoginModal from "../Login/LoginModal";
import HeaderUser from "./HeaderUser";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import QuickAddMenu from "./QuickAddMenu";

const Header = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useSelector(getAuthSelector);

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, background: "#1DA1F2" }}>
      <Toolbar className="flex justify-between">
        <Box className="flex items-center gap-3">
          <IconButton color="inherit" onClick={onToggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">CÔNG TY TNHH TẤN DENTAL</Typography>
        </Box>

        <Box className="flex items-center bg-white rounded-full px-3 w-1/3">
          <SearchIcon />
          <InputBase placeholder="Tìm kiếm..." className="ml-2 w-full" />
        </Box>

        <Box className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <QuickAddMenu></QuickAddMenu>
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
    </AppBar>
  );
};

export default Header;
