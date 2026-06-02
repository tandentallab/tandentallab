import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Slide,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LoginModal from "../Login/LoginModal";
import HeaderUser from "./HeaderUser";
import QuickAddMenu from "./QuickAddMenu";
import { useSelector } from "react-redux";
import { getAuthSelector } from "../../redux/selector";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import debounce from "lodash/debounce";

// Import trang Tìm kiếm nâng cao vào đây
import TimKiemNangCaoPage from "./TimKiemNangCaoPage";

const SEARCH_OPTIONS = [
  { id: "nhakhoa", label: "Khách hàng" },
  { id: "benhnhan", label: "Bệnh nhân" },
  { id: "donhang", label: "Đơn hàng" },
];

const Header = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useSelector(getAuthSelector);
  const navigate = useNavigate();

  // States
  const [searchOpen, setSearchOpen] = useState(false); // Trạng thái đóng/mở tìm kiếm trên Mobile
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [results, setResults] = useState({
    nhaKhoa: [],
    benhNhan: [],
    donHang: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  // State quản lý bật/tắt Tìm kiếm nâng cao
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const searchContainerRef = useRef(null);

  // Đóng dropdown khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        // Nếu đang ở mobile thì thu nhỏ thanh tìm kiếm lại luôn khi click ra ngoài
        if (window.innerWidth < 600) {
          setSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = useCallback(
    debounce(async (query, types) => {
      if (!query.trim()) {
        setResults({ nhaKhoa: [], benhNhan: [], donHang: [] });
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const typesParam = types.length > 0 ? types.join(",") : "";
        const res = await api.get(`/search?q=${query}&types=${typesParam}`);
        setResults(res.data.data);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    fetchSearchResults(value, selectedTypes);
  };

  const handleTypeToggle = (typeId) => {
    const newTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter((t) => t !== typeId)
      : [...selectedTypes, typeId];

    setSelectedTypes(newTypes);
    if (searchQuery) fetchSearchResults(searchQuery, newTypes);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: "#1DA1F2" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            minHeight: { xs: 64, sm: 70 },
            px: { xs: 1, sm: 2 },
            position: "relative",
          }}
        >
          {/* LEFT BRANDING */}
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

            <div className="w-10 h-10 p-1 rounded-full shadow-md bg-white flex items-center justify-center">
              <img className="w-full" src="/logo3.png" alt="Tấn Dental" />
            </div>

            <p className="hidden sm:block font-medium text-xl tracking-wide">CÔNG TY TNHH TẤN DENTAL</p>
          </Box>

          {/* 👉 THANH TÌM KIẾM ĐÃ ĐƯỢC TỐI ƯU CHO CẢ PC & MOBILE */}
          <Box
            ref={searchContainerRef}
            sx={{
              position: {
                xs: searchOpen ? "absolute" : "relative",
                sm: "relative",
              },
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: { xs: searchOpen ? "flex" : "none", sm: "flex" }, // Bật lên khi searchOpen = true ở Mobile
              width: { xs: "100%", sm: "40%", md: "45%" },
              maxWidth: { xs: "100%", sm: 600 },
              height: { xs: searchOpen ? "100%" : "auto", sm: "auto" },
              backgroundColor: {
                xs: searchOpen ? "#1DA1F2" : "transparent",
                sm: "transparent",
              },
              px: { xs: searchOpen ? 2 : 0, sm: 0 },
              alignItems: "center",
              zIndex: { xs: 1202, sm: "auto" },
            }}
          >
            {/* Nút đóng (X) tìm kiếm nhanh - Chỉ xuất hiện trên Mobile */}
            {searchOpen && (
              <IconButton
                color="inherit"
                onClick={() => {
                  setSearchOpen(false);
                  setIsDropdownOpen(false);
                }}
                sx={{ display: { xs: "inline-flex", sm: "none" }, mr: 1 }}
              >
                <CloseIcon />
              </IconButton>
            )}

            {/* Input chính */}
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
              <SearchIcon sx={{ color: "#666" }} />
              <InputBase
                placeholder="Tìm kiếm khách hàng, bệnh nhân, đơn hàng..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                autoFocus={searchOpen} // Tự động focus bàn phím khi bấm icon kính lúp trên mobile
                sx={{ ml: 1, width: "100%", fontSize: "14px" }}
              />
              {isSearching && (
                <CircularProgress size={20} sx={{ color: "#1DA1F2" }} />
              )}
            </Box>

            {/* DROPDOWN KẾT QUẢ TÌM KIẾM (Tự động thích ứng giao diện Mobile/PC) */}
            {isDropdownOpen && (
              <Paper
                sx={{
                  position: "absolute",
                  top: { xs: "100%", sm: "45px" },
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  borderRadius: { xs: 0, sm: 2 },
                  boxShadow: 3,
                  overflow: "hidden",
                  zIndex: 999,
                  maxHeight: { xs: "calc(100vh - 70px)", sm: 400 },
                  overflowY: "auto",
                }}
              >
                {/* Vùng chọn Bộ lọc dữ liệu */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    p: 1,
                    bgcolor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    alignItems: "center",
                  }}
                >
                  {SEARCH_OPTIONS.map((opt) => (
                    <FormControlLabel
                      key={opt.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedTypes.includes(opt.id)}
                          onChange={() => handleTypeToggle(opt.id)}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontSize: "13px" }}>
                          {opt.label}
                        </Typography>
                      }
                      sx={{ mr: 1.5, mb: 0 }}
                    />
                  ))}
                  <Box sx={{ flexGrow: 1 }} />

                  {/* Nút Tìm nâng cao */}
                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setSearchOpen(false); // Đóng thanh mobile tìm nhanh
                      setShowAdvancedSearch(true); // Bật giao diện full-screen nâng cao lên
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    Tìm nâng cao
                  </Button>
                </Box>

                {/* Vùng hiển thị danh sách kết quả */}
                <Box sx={{ p: 1 }}>
                  {!searchQuery ? (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ p: 2, textAlign: "center" }}
                    >
                      Gõ để bắt đầu tìm kiếm...
                    </Typography>
                  ) : (
                    <>
                      {/* 1. ĐƠN HÀNG */}
                      {results.donHang.length > 0 && (
                        <Box mb={2}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: "#fef3c7",
                              color: "#d97706",
                              borderRadius: 1,
                              fontWeight: "bold",
                            }}
                          >
                            ĐƠN HÀNG
                          </Typography>
                          <List dense>
                            {results.donHang.map((dh) => (
                              <ListItem
                                button
                                key={dh._id}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setSearchOpen(false);
                                  // 🔥 ĐÃ FIX: Thêm /edit vào đường dẫn điều hướng
                                  navigate(`/donhang/${dh._id}/edit`);
                                }}
                              >
                                <ListItemText
                                  primary={`Mã: ${dh.maDonHang}`}
                                  secondary={
                                    <Box
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        mt: 0.5,
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                      >
                                        Nha khoa:{" "}
                                        {dh.nhaKhoa?.hoVaTen ||
                                          dh.nhaKhoa?.tenGiaoDich ||
                                          "Trống"}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                      >
                                        Bệnh nhân:{" "}
                                        {dh.benhNhan?.hoVaTen || "Trống"}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* 2. BỆNH NHÂN */}
                      {results.benhNhan.length > 0 && (
                        <Box mb={2}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: "#fce7f3",
                              color: "#db2777",
                              borderRadius: 1,
                              fontWeight: "bold",
                            }}
                          >
                            BỆNH NHÂN
                          </Typography>
                          <List dense>
                            {results.benhNhan.map((bn) => (
                              <ListItem
                                button
                                key={bn._id}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setSearchOpen(false);
                                  navigate(`/benhnhan/${bn._id}`);
                                }}
                              >
                                <ListItemText
                                  primary={bn.hoVaTen}
                                  secondary={bn.namSinh || ""}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* 3. KHÁCH HÀNG / NHA KHOA */}
                      {results.nhaKhoa.length > 0 && (
                        <Box mb={2}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              px: 2,
                              py: 1,
                              bgcolor: "#e0f2fe",
                              color: "#0284c7",
                              borderRadius: 1,
                              fontWeight: "bold",
                            }}
                          >
                            KHÁCH HÀNG (NHA KHOA)
                          </Typography>
                          <List dense>
                            {results.nhaKhoa.map((nk) => (
                              <ListItem
                                button
                                key={nk._id}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setSearchOpen(false);
                                  navigate(`/nhakhoa/${nk._id}`);
                                }}
                              >
                                <ListItemText
                                  primary={nk.hoVaTen || nk.tenGiaoDich}
                                  secondary={nk.soDienThoai}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Không tìm thấy kết quả */}
                      {!isSearching &&
                        results.nhaKhoa.length === 0 &&
                        results.benhNhan.length === 0 &&
                        results.donHang.length === 0 && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ p: 2, textAlign: "center" }}
                          >
                            Không tìm thấy kết quả nào.
                          </Typography>
                        )}
                    </>
                  )}
                </Box>
              </Paper>
            )}
          </Box>

          {/* RIGHT CONTROL PANEL */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5 },
              flexShrink: 0,
            }}
          >
            {/* Nút kính lúp kích hoạt tìm kiếm nhanh - Chỉ xuất hiện ở Mobile */}
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(true)}
              sx={{ display: { xs: "inline-flex", sm: "none" } }}
            >
              <SearchIcon />
            </IconButton>

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
      </AppBar>

      {/* Hiển thị màn hình Tìm kiếm nâng cao đè lên tất cả khi state bằng true */}
      {showAdvancedSearch && (
        <TimKiemNangCaoPage onClose={() => setShowAdvancedSearch(false)} />
      )}
    </>
  );
};

export default Header;