import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Checkbox,
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircleOutlined as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Close as CloseIcon,
  Help as HelpIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../config/api";
import GhiChuAddModal from "./GhiChuAddModal";

export default function GhiChuPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Add Note Modal State
  const [openAddModal, setOpenAddModal] = useState(false);

  // Confirm Delete Modal State
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Bulk Delete Completed Notes State
  const [openDeleteCompletedModal, setOpenDeleteCompletedModal] = useState(false);
  const [cleaningCompleted, setCleaningCompleted] = useState(false);

  // Edit Note State
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState(null);

  const handleOpenEdit = (note) => {
    setSelectedNoteForEdit(note);
    setOpenAddModal(true);
  };

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ghi-chu");
      if (res.data?.success) {
        setNotes(res.data.data);
      }
    } catch (err) {
      toast.error("Không thể lấy danh sách ghi chú: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();

    const handleRefresh = () => {
      fetchNotes();
    };
    window.addEventListener("refresh-ghi-chu", handleRefresh);
    return () => {
      window.removeEventListener("refresh-ghi-chu", handleRefresh);
    };
  }, []);

  // Handle opening confirmation dialog for note deletion
  const handleOpenDeleteConfirm = (note) => {
    setSelectedNote(note);
    setOpenConfirmModal(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmModal(false);
    setSelectedNote(null);
  };

  // Perform completion / reopen toggle directly without confirmation
  const handleToggleComplete = async (note) => {
    const newTrangThai = note.trangThai === "Chưa hoàn thành" ? "Đã hoàn thành" : "Chưa hoàn thành";
    try {
      const res = await api.patch(`/ghi-chu/${note._id}/trang-thai`, {
        trangThai: newTrangThai,
      });
      if (res.data?.success) {
        toast.success(newTrangThai === "Đã hoàn thành" ? "Đã hoàn thành ghi chú!" : "Đã mở lại ghi chú!");
        setNotes((prev) =>
          prev.map((item) =>
            item._id === note._id ? { ...item, trangThai: newTrangThai } : item
          )
        );
        window.dispatchEvent(new CustomEvent("refresh-ghi-chu"));
      }
    } catch (err) {
      toast.error(
        "Lỗi khi cập nhật trạng thái ghi chú: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // Perform actual deletion from database
  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/ghi-chu/${selectedNote._id}`);
      if (res.data?.success) {
        toast.success("Đã xóa ghi chú thành công!");
        setNotes((prev) => prev.filter((item) => item._id !== selectedNote._id));
        window.dispatchEvent(new CustomEvent("refresh-ghi-chu"));
      }
      handleCloseConfirm();
    } catch (err) {
      toast.error(
        "Lỗi khi xóa ghi chú: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCompletedNotes = async () => {
    try {
      setCleaningCompleted(true);
      const res = await api.delete("/ghi-chu/completed/clean");
      if (res.data?.success) {
        toast.success(res.data.message || "Đã dọn dẹp các ghi chú đã hoàn thành!");
        fetchNotes();
        window.dispatchEvent(new CustomEvent("refresh-ghi-chu"));
      }
      setOpenDeleteCompletedModal(false);
    } catch (err) {
      toast.error(
        "Lỗi khi dọn dẹp ghi chú: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setCleaningCompleted(false);
    }
  };

  // Handle adding new note
  const handleOpenAdd = () => {
    setOpenAddModal(true);
  };

  const formatDateTime = (value) => {
    if (!value) return "---";
    return new Date(value).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <Paper className="p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        {/* Header Section */}
        <Box className="flex justify-between items-center mb-6">
          <Box className="flex items-center gap-2">
            <Box className="bg-blue-100 text-blue-600 p-2 rounded-lg hidden sm:block">
              <AssignmentIcon />
            </Box>
            <Box>
              <Typography variant="h5" className="font-bold text-gray-800 text-lg sm:text-xl">
                Ghi chú cần xử lý
              </Typography>
            </Box>
          </Box>
          <Box className="flex gap-2">
            {notes.some((note) => note.trangThai === "Đã hoàn thành") && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setOpenDeleteCompletedModal(true)}
                className="border-red-600 text-red-600 hover:bg-red-50 shadow-sm rounded-xl min-w-0 p-2 sm:px-4 sm:py-2 flex items-center justify-center font-semibold text-xs sm:text-sm"
                style={{ textTransform: "none" }}
              >
                <DeleteIcon className="sm:mr-1" fontSize="small" />
                <span className="hidden sm:inline">Xóa ghi chú Đã hoàn thành</span>
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl min-w-0 p-2 sm:px-4 sm:py-2 text-white flex items-center justify-center text-xs sm:text-sm"
              style={{ textTransform: "none" }}
            >
              <AddIcon />
              <span className="hidden sm:inline ml-1 font-semibold">Thêm ghi chú</span>
            </Button>
          </Box>
        </Box>

        {/* Notes Content */}
        {loading ? (
          <Box className="flex justify-center items-center py-20">
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {/* Desktop Table View */}
            <Box className="hidden md:block">
              <TableContainer className="rounded-xl border border-gray-100 overflow-hidden">
                <Table>
                  <TableHead className="bg-gray-50">
                    <TableRow>
                      <TableCell className="font-bold text-gray-700" style={{ width: "60px" }}>STT</TableCell>
                      <TableCell className="font-bold text-gray-700">Đơn hàng liên kết</TableCell>
                      <TableCell className="font-bold text-gray-700" style={{ width: "40%" }}>
                        Nội Dung Lưu Ý
                      </TableCell>
                      <TableCell className="font-bold text-gray-700">Ngày Tạo</TableCell>
                      <TableCell className="font-bold text-gray-700">Trạng Thái</TableCell>
                      <TableCell className="font-bold text-gray-700" align="center">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.length > 0 ? (
                      notes.map((note, idx) => (
                        <TableRow key={note._id} className="hover:bg-gray-50/50 transition">
                          <TableCell className="text-gray-500 font-medium">{idx + 1}</TableCell>
                          <TableCell>
                            {note.donHang ? (
                              <Link
                                to={`/donhang/${note.donHang._id}/edit`}
                                className="text-blue-600 font-bold hover:underline hover:text-blue-800 transition text-sm"
                              >
                                {`${note.donHang.benhNhan?.hoVaTen || "Trống"} - ${note.donHang.nhaKhoa?.tenGiaoDich || note.donHang.nhaKhoa?.hoVaTen || "Trống"}`}
                              </Link>
                            ) : note.maDonHang ? (
                              <span className="text-gray-700 font-semibold text-sm">{note.maDonHang}</span>
                            ) : (
                              <Chip
                                label="Ghi chú chung"
                                size="small"
                                className="bg-gray-100 text-gray-600 font-medium"
                              />
                            )}
                          </TableCell>
                          <TableCell className="text-gray-800 font-medium whitespace-pre-wrap">
                            {note.noiDung}
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm">{formatDateTime(note.createdAt)}</TableCell>
                          <TableCell>
                            <Chip
                              label={note.trangThai}
                              size="small"
                              color={note.trangThai === "Chưa hoàn thành" ? "warning" : "success"}
                              variant="outlined"
                              className="font-semibold"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box className="flex items-center justify-center gap-1.5">
                              <Tooltip title={note.trangThai === "Chưa hoàn thành" ? "Đánh dấu hoàn thành" : "Đánh dấu chưa hoàn thành"}>
                                <span>
                                  <Checkbox
                                    size="small"
                                    checked={note.trangThai === "Đã hoàn thành"}
                                    onChange={() => handleToggleComplete(note)}
                                    color="success"
                                  />
                                </span>
                              </Tooltip>
                              <Tooltip title="Sửa ghi chú">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenEdit(note)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa ghi chú">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenDeleteConfirm(note)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" className="py-12 text-gray-400 italic">
                          Không có lưu ý công việc nào cần xử lý
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Mobile Card View */}
            <Box className="block md:hidden space-y-4">
              {notes.length > 0 ? (
                notes.map((note, idx) => (
                  <Paper key={note._id} className="p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 bg-white">
                    {/* Header card: Mã đơn & Trạng thái */}
                    <div className="flex justify-between items-center">
                      {note.donHang ? (
                        <Link
                          to={`/donhang/${note.donHang._id}/edit`}
                          className="text-blue-600 font-bold hover:underline text-xs"
                        >
                          {`${note.donHang.benhNhan?.hoVaTen || "Trống"} - ${note.donHang.nhaKhoa?.tenGiaoDich || note.donHang.nhaKhoa?.hoVaTen || "Trống"}`}
                        </Link>
                      ) : note.maDonHang ? (
                        <span className="text-gray-700 font-semibold text-sm">{note.maDonHang}</span>
                      ) : (
                        <Chip
                          label="Ghi chú chung"
                          size="small"
                          className="bg-gray-100 text-gray-600 font-medium text-[11px]"
                        />
                      )}
                      <Chip
                        label={note.trangThai}
                        size="small"
                        color={note.trangThai === "Chưa hoàn thành" ? "warning" : "success"}
                        variant="outlined"
                        className="font-semibold text-[11px]"
                      />
                    </div>

                    {/* Nội dung ghi chú */}
                    <div className="text-gray-800 font-medium text-sm whitespace-pre-wrap leading-relaxed">
                      {idx + 1}. {note.noiDung}
                    </div>

                    {/* Footer card: Ngày tạo & Nút hành động */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-gray-400 text-[11px]">{formatDateTime(note.createdAt)}</span>
                      <Box className="flex items-center gap-1">
                        <Checkbox
                          size="small"
                          checked={note.trangThai === "Đã hoàn thành"}
                          onChange={() => handleToggleComplete(note)}
                          color="success"
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(note)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteConfirm(note)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </div>
                  </Paper>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 italic text-sm">
                  Không có lưu ý công việc nào cần xử lý
                </div>
              )}
            </Box>
          </>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmModal}
        onClose={handleCloseConfirm}
        PaperProps={{ className: "rounded-2xl p-2" }}
      >
        <DialogTitle className="font-bold text-gray-800">
          Xác nhận xóa ghi chú?
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-sm text-gray-500">
            Bạn có chắc chắn muốn xóa ghi chú này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <Button onClick={handleCloseConfirm} disabled={deleting} className="text-gray-500 font-semibold">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteNote}
            variant="contained"
            color="error"
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 rounded-xl shadow-sm"
          >
            {deleting ? "Đang xóa..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Completed Notes Confirmation Dialog */}
      <Dialog
        open={openDeleteCompletedModal}
        onClose={() => setOpenDeleteCompletedModal(false)}
        PaperProps={{ className: "rounded-2xl p-2" }}
      >
        <DialogTitle className="font-bold text-gray-800">
          Xác nhận dọn dẹp ghi chú?
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="text-sm text-gray-500">
            Bạn có chắc chắn muốn xóa nhanh tất cả các ghi chú đã hoàn thành? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 gap-2">
          <Button onClick={() => setOpenDeleteCompletedModal(false)} disabled={cleaningCompleted} className="text-gray-500 font-semibold">
            Hủy
          </Button>
          <Button
            onClick={handleDeleteCompletedNotes}
            variant="contained"
            color="error"
            disabled={cleaningCompleted}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 rounded-xl shadow-sm"
          >
            {cleaningCompleted ? "Đang xóa..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Note Dialog */}
      <GhiChuAddModal
        open={openAddModal}
        onClose={() => {
          setOpenAddModal(false);
          setSelectedNoteForEdit(null);
        }}
        noteToEdit={selectedNoteForEdit}
        onSuccess={fetchNotes}
      />
    </Box>
  );
}
