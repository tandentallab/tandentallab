import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Paper,
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
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import { hasRouteAccess } from "../../config/permissions";
import { toast } from "sonner";

// Import trang Tìm kiếm nâng cao vào đây
import TimKiemNangCaoPage from "./TimKiemNangCaoPage";

const Header = ({ onToggleSidebar }) => {
  const { isAuthenticated, user } = useSelector(getAuthSelector);
  const navigate = useNavigate();

  // States
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Khởi tạo state chỉ chứa donHang
  const [results, setResults] = useState({
    donHang: [],
  });
  const [isSearching, setIsSearching] = useState(false);

  // State quản lý bật/tắt Tìm kiếm nâng cao
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [openTodoPopover, setOpenTodoPopover] = useState(false);
  const [todoList, setTodoList] = useState([]);
  const [checkedTodoIds, setCheckedTodoIds] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const searchContainerRef = useRef(null);

  // Đóng dropdown khi click ra ngoài vùng tìm kiếm
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        if (window.innerWidth < 600) {
          setSearchOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSearchResults = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults({ donHang: [] });
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        // 🔥 CHIẾN THUẬT: Không ép cứng types. 
        // Thả cho Backend quét mọi ngóc ngách (quét cả tên Khách Hàng, Bệnh nhân) như cũ
        const res = await api.get(`/search?q=${query}`);

        // Nhưng UI thì chỉ hứng đúng mảng donHang để hiển thị
        setResults({
          donHang: res.data?.data?.donHang || []
        });
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
    fetchSearchResults(value);
  };

  const fetchTodos = async () => {
    try {
      const res = await api.get("/ghi-chu");
      if (res.data?.success) {
        setTodoList(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách ghi chú:", error);
    }
  };

  const toastIntervalRef = useRef(null);
  const checkIntervalRef = useRef(null);

  const runTodoToastFlow = async () => {
    try {
      const res = await api.get("/ghi-chu");
      if (res.data?.success && res.data.data?.length > 0) {
        const todos = res.data.data;
        
        // Dọn dẹp hàng đợi cũ nếu đang chạy dở
        if (toastIntervalRef.current) {
          clearInterval(toastIntervalRef.current);
          toastIntervalRef.current = null;
        }

        let currentIndex = 0;
        
        const showNextTodo = () => {
          if (currentIndex >= todos.length) {
            if (toastIntervalRef.current) {
              clearInterval(toastIntervalRef.current);
              toastIntervalRef.current = null;
            }
            return;
          }

          const note = todos[currentIndex];
          const labelText = note.maDonHang 
            ? `[Mã ĐH: ${note.maDonHang}] Ghi chú cần xử lý:`
            : "Ghi chú công việc chung:";

          // Đẩy toast hiển thị với duration: Infinity để tự kiểm soát đóng
          const toastId = toast.info(labelText, {
            description: note.noiDung,
            duration: Infinity,
            action: {
              label: "Xem",
              onClick: () => {
                if (note.donHang) {
                  navigate(`/donhang/${note.donHang._id}/edit`);
                } else {
                  navigate("/ghi-chu");
                }
                toast.dismiss(toastId);
              }
            }
          });

          // Tự động tắt sau đúng 15 giây
          setTimeout(() => {
            toast.dismiss(toastId);
          }, 15000);

          currentIndex++;
        };

        // Hiện ghi chú đầu tiên ngay lập tức
        showNextTodo();

        // Cứ mỗi 5 giây thì hiện ghi chú tiếp theo (staggered display)
        // Với thời gian sống 15s của mỗi toast, trên màn hình sẽ hiển thị tối đa 3 toast cùng lúc
        toastIntervalRef.current = setInterval(() => {
          showNextTodo();
        }, 5000);
      }
    } catch (error) {
      console.error("Lỗi khi chạy luồng toast ghi chú:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem("has_shown_initial_toast");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && hasRouteAccess(user, "/ghi-chu")) {
      fetchTodos();

      // 🔥 Hiển thị thông báo ngay lập tức khi mới đăng nhập hoặc mới mở website lên (lần đầu tiên của session)
      const hasShownInitial = sessionStorage.getItem("has_shown_initial_toast");
      if (!hasShownInitial) {
        runTodoToastFlow();
        sessionStorage.setItem("has_shown_initial_toast", "true");
      }

      // Tính số mili-giây đến phút tròn chục gần nhất (xx:00, xx:10, xx:20, xx:30, xx:40, xx:50)
      const now = new Date();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentMs = now.getMilliseconds();
      const minutesPastRound = currentMinutes % 10;
      const minutesToNextRound = minutesPastRound === 0 ? 10 : (10 - minutesPastRound);
      const msUntilNextRound = (minutesToNextRound * 60 - currentSeconds) * 1000 - currentMs;

      // Đợi đến phút tròn chục gần nhất rồi mới bắt đầu đẩy thông báo
      const initialTimeout = setTimeout(() => {
        runTodoToastFlow();

        // Sau đó cứ đúng mỗi 10 phút thì đẩy tiếp (đã căn chỉnh theo đồng hồ)
        checkIntervalRef.current = setInterval(() => {
          runTodoToastFlow();
        }, 10 * 60 * 1000);
      }, msUntilNextRound);

      return () => {
        clearTimeout(initialTimeout);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        if (toastIntervalRef.current) {
          clearInterval(toastIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, user]);

  const handleToggleTodoPopover = () => {
    if (!openTodoPopover) {
      fetchTodos();
    }
    setOpenTodoPopover(!openTodoPopover);
  };

  const handleToggleCheckTodo = (id) => {
    setCheckedTodoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmComplete = async () => {
    if (checkedTodoIds.length === 0) return;
    setIsCompleting(true);
    try {
      await Promise.all(
        checkedTodoIds.map((id) => api.delete(`/ghi-chu/${id}`))
      );
      toast.success("Đã hoàn thành và xóa các ghi chú được chọn!");
      setCheckedTodoIds([]);
      fetchTodos();
    } catch (error) {
      toast.error("Lỗi khi hoàn thành ghi chú: " + error.message);
    } finally {
      setIsCompleting(false);
    }
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

          {/* 👉 THANH TÌM KIẾM CHO CẢ PC & MOBILE */}
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
              display: { xs: searchOpen ? "flex" : "none", sm: "flex" },
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
                placeholder="Tìm kiếm đơn hàng nhanh..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                autoFocus={searchOpen}
                sx={{ ml: 1, width: "100%", fontSize: "14px" }}
              />
              {isSearching && (
                <CircularProgress size={20} sx={{ color: "#1DA1F2" }} />
              )}
            </Box>

            {/* DROPDOWN KẾT QUẢ TÌM KIẾM */}
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
                {/* THANH CÔNG CỤ */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    p: 1,
                    bgcolor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: "bold", color: "#64748b", pl: 1 }}>
                    KẾT QUẢ ĐƠN HÀNG
                  </Typography>

                  <Button
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setSearchOpen(false);
                      setShowAdvancedSearch(true);
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

                {/* DANH SÁCH HIỂN THỊ */}
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
                      {results?.donHang?.length > 0 && (
                        <Box mb={1}>
                          <List dense disablePadding>
                            {results.donHang.map((dh) => (
                              <ListItem
                                button
                                key={dh._id}
                                sx={{ borderRadius: 1, mb: 0.5, "&:hover": { bgcolor: "#f1f5f9" } }}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setSearchOpen(false);
                                  navigate(`/donhang/${dh._id}/edit`);
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "#0f172a" }}>
                                      Mã ĐH: {dh.maDonHang}
                                    </Typography>
                                  }
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

                      {!isSearching &&
                        (!results.donHang || results.donHang.length === 0) && (
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
            <IconButton
              color="inherit"
              onClick={() => setSearchOpen(true)}
              sx={{ display: { xs: "inline-flex", sm: "none" } }}
            >
              <SearchIcon />
            </IconButton>

            {isAuthenticated ? (
              <>
                {hasRouteAccess(user, "/ghi-chu") && (
                  <div className="relative">
                    <button
                      onClick={handleToggleTodoPopover}
                      title="Lưu ý cần xử lý"
                      className="flex items-center justify-center w-10 h-10 bg-white text-blue-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition shadow-sm relative shrink-0"
                    >
                      <NoteAddIcon className="!w-6 !h-6" />
                      {todoList.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold animate-pulse shadow-sm">
                          {todoList.length}
                        </span>
                      )}
                    </button>

                    {/* Popover overlay click to close */}
                    {openTodoPopover && (
                      <div
                        className="fixed inset-0 z-[1190]"
                        onClick={() => setOpenTodoPopover(false)}
                      />
                    )}

                    {/* Todo Popover */}
                    {openTodoPopover && (
                      <Paper
                        className="absolute right-[-100px] sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-80 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 z-[1200] flex flex-col overflow-hidden text-gray-800"
                        style={{
                          top: "45px",
                          maxHeight: "450px",
                        }}
                      >
                        {/* Header */}
                        <div className="bg-blue-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
                          <span className="font-bold text-blue-900 text-sm">
                            Ghi chú cần xử lý ({todoList.length})
                          </span>
                        </div>

                        {/* List */}
                        <div className="flex-grow overflow-y-auto divide-y divide-gray-100 p-2 max-h-[300px]">
                          {todoList.length > 0 ? (
                            todoList.map((todo) => (
                              <div
                                key={todo._id}
                                className="p-2 flex items-start gap-2.5 hover:bg-gray-50 transition rounded-lg"
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedTodoIds.includes(todo._id)}
                                  onChange={() => handleToggleCheckTodo(todo._id)}
                                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0 text-left">
                                  <p className="text-gray-800 font-medium text-xs whitespace-pre-wrap leading-relaxed">
                                    {todo.noiDung}
                                  </p>
                                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400">
                                    <span>Người tạo: {todo.nguoiGhiChu}</span>
                                    {todo.donHang ? (
                                      <span
                                        onClick={() => {
                                          setOpenTodoPopover(false);
                                          navigate(`/donhang/${todo.donHang._id}/edit`);
                                        }}
                                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                                      >
                                        {todo.maDonHang}
                                      </span>
                                    ) : (
                                      todo.maDonHang && (
                                        <span className="font-bold text-gray-500">
                                          {todo.maDonHang}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-10 text-center text-gray-400 italic text-xs">
                              Không có ghi chú nào cần xử lý
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end shrink-0">
                          <Button
                            size="small"
                            onClick={() => {
                              setOpenTodoPopover(false);
                              navigate("/ghi-chu");
                            }}
                            variant="outlined"
                            className="text-gray-600 border-gray-300 hover:bg-gray-100 font-bold text-[11px] px-3 py-1 rounded-lg lowercase first-letter:uppercase"
                            style={{ textTransform: "none" }}
                          >
                            Mở rộng
                          </Button>
                          <Button
                            size="small"
                            disabled={checkedTodoIds.length === 0 || isCompleting}
                            onClick={handleConfirmComplete}
                            variant="contained"
                            color="success"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-[11px] px-3 py-1 rounded-lg disabled:opacity-50"
                            style={{ textTransform: "none" }}
                          >
                            {isCompleting ? "Đang xử lý..." : "Hoàn thành"}
                          </Button>
                        </div>
                      </Paper>
                    )}
                  </div>
                )}
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

      {/* HIỂN THỊ MÀN HÌNH TÌM KIẾM NÂNG CAO */}
      {showAdvancedSearch && (
        <TimKiemNangCaoPage onClose={() => setShowAdvancedSearch(false)} />
      )}

    </>
  );
};

export default Header;