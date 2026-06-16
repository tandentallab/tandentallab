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
} from "@mui/material";
import {
  Add as AddIcon,
  CheckCircleOutlined as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Close as CloseIcon,
  Help as HelpIcon,
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

  // Confirm Complete Modal State
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
  }, []);

  // Handle opening confirmation dialog for note completion
  const handleOpenConfirm = (note) => {
    setSelectedNote(note);
    setOpenConfirmModal(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirmModal(false);
    setSelectedNote(null);
  };

  // Perform deletion (marking as completed and deleting)
  const handleCompleteNote = async () => {
    if (!selectedNote) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/ghi-chu/${selectedNote._id}`);
      if (res.data?.success) {
        toast.success("Đã hoàn thành và xóa ghi chú khỏi cơ sở dữ liệu!");
        setNotes((prev) => prev.filter((item) => item._id !== selectedNote._id));
      }
      handleCloseConfirm();
    } catch (err) {
      toast.error("Lỗi khi hoàn thành ghi chú: " + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm rounded-xl min-w-0 p-2 sm:px-4 sm:py-2 text-white flex items-center justify-center"
          >
            <AddIcon />
            <span className="hidden sm:inline ml-1 font-semibold">Thêm ghi chú</span>
          </Button>
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
                      <TableCell className="font-bold text-gray-700">Mã Đơn Hàng</TableCell>
                      <TableCell className="font-bold text-gray-700" style={{ width: "40%" }}>
                        Nội Dung Lưu Ý
                      </TableCell>
                      <TableCell className="font-bold text-gray-700">Người Ghi Chú</TableCell>
                      <TableCell className="font-bold text-gray-700">Ngày Tạo</TableCell>
                      <TableCell className="font-bold text-gray-700">Trạng Thái</TableCell>
                      <TableCell className="font-bold text-gray-700" align="center">
                        Hành Động
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <TableRow key={note._id} className="hover:bg-gray-50/50 transition">
                          <TableCell>
                            {note.donHang ? (
                              <Link
                                to={`/donhang/${note.donHang._id}/edit`}
                                className="text-blue-600 font-bold hover:underline hover:text-blue-800 transition"
                              >
                                {note.maDonHang}
                              </Link>
                            ) : note.maDonHang ? (
                              <span className="text-gray-700 font-semibold">{note.maDonHang}</span>
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
                          <TableCell className="text-gray-600 font-medium">{note.nguoiGhiChu}</TableCell>
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
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleOpenConfirm(note)}
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs px-3 py-1.5 shadow-sm"
                              style={{ textTransform: "none" }}
                            >
                              Hoàn thành
                            </Button>
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
                notes.map((note) => (
                  <Paper key={note._id} className="p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 bg-white">
                    {/* Header card: Mã đơn & Trạng thái */}
                    <div className="flex justify-between items-center">
                      {note.donHang ? (
                        <Link
                          to={`/donhang/${note.donHang._id}/edit`}
                          className="text-blue-600 font-bold hover:underline text-sm"
                        >
                          {note.maDonHang}
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
                      {note.noiDung}
                    </div>

                    {/* Footer card: Người tạo, Ngày tạo & Nút hành động */}
                    <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-gray-500 text-xs">
                          Người tạo: <span className="font-semibold text-gray-700">{note.nguoiGhiChu || "Ẩn danh"}</span>
                        </span>
                        <span className="text-gray-400 text-[11px]">{formatDateTime(note.createdAt)}</span>
                      </div>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleOpenConfirm(note)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-xs px-3 py-1.5 shadow-sm"
                        style={{ textTransform: "none" }}
                      >
                        Hoàn thành
                      </Button>
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
          Xác nhận xóa?
        </DialogTitle>
        <DialogActions className="p-4 gap-2">
          <Button onClick={handleCloseConfirm} disabled={deleting} className="text-gray-500 font-semibold">
            Hủy
          </Button>
          <Button
            onClick={handleCompleteNote}
            variant="contained"
            color="error"
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 font-semibold px-4 rounded-xl shadow-sm"
          >
            {deleting ? "Đang xóa..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Note Dialog */}
      <GhiChuAddModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onSuccess={fetchNotes}
      />
    </Box>
  );
}
