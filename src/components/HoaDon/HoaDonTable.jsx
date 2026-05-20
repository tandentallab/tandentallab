import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { updateHoaDon } from "../../redux/slices/hoaDonSlice";
import { useNavigate } from "react-router-dom";

const HoaDonTable = ({ danhSachHoaDon, loading }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedHD, setSelectedHD] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");

  const [columnWidths, setColumnWidths] = useState({
    ngayXuat: 120,
    soHoaDon: 140,
    nhaKhoa: 220,
    tongCong: 130,
    giamGia: 110,
    giaTriThanhToan: 160,
    daThanhToan: 140,
    conLai: 120,
    chiPhiKhac: 120,
    trangThai: 140,
    ghiChu: 200,
    ngayDenHan: 130,
  });

  const totalTableWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);

  const handleConfirmUpdate = async () => {
    await dispatch(updateHoaDon({ id: selectedHD._id, data: { trangThai: statusUpdate } }));
    setOpenUpdate(false);
  };

  const handleResize = (columnKey, e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnKey];

    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      setColumnWidths((prev) => ({ ...prev, [columnKey]: Math.max(newWidth, 60) }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const numericKeys = [
    "tongCong",
    "giamGia",
    "giaTriThanhToan",
    "daThanhToan",
    "conLai",
    "chiPhiKhac",
  ];

  const ResizableHeaderCell = ({ label, columnKey }) => {
    const isNumeric = numericKeys.includes(columnKey);

    return (
      <TableCell
        sx={{
          width: columnWidths[columnKey],
          minWidth: columnWidths[columnKey],
          maxWidth: columnWidths[columnKey],
          boxSizing: "border-box",
          position: "relative",
          fontWeight: 600,
          fontSize: "0.85rem",
          userSelect: "none",
          color: "#26a69a",
          py: 1,
          pl: 2,
          pr: isNumeric ? 3 : 2,
          textAlign: isNumeric ? "right" : "left",
          bgcolor: "#fff",
          borderBottom: "2px solid #cbd5e1",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "clip",
        }}
      >
        {label}
        <div
          onMouseDown={(e) => handleResize(columnKey, e)}
          className="absolute top-0 right-0 w-3 h-full cursor-col-resize z-10 flex items-center justify-center transition-all hover:bg-gray-100 after:content-[''] after:absolute after:w-[2px] after:h-3/5 after:bg-gray-300 after:rounded"
        />
      </TableCell>
    );
  };

  const getClipCellStyle = (key) => {
    const isNumeric = numericKeys.includes(key);

    return {
      width: columnWidths[key],
      minWidth: columnWidths[key],
      maxWidth: columnWidths[key],
      boxSizing: "border-box",
      fontSize: "0.85rem",
      color: "#333",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "clip",
      borderBottom: "1px solid #d1d5db",
      py: 0.75,
      pl: 2,
      pr: isNumeric ? 3 : 2,
      textAlign: isNumeric ? "right" : "left",
    };
  };

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 0,
          flex: 1,
          minHeight: 0,
          overflowX: "auto",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": { height: 14, width: 14 },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 10,
            border: "3px solid #ffffff"
          },
          "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#94a3b8" },
        }}
      >
        <Table sx={{ tableLayout: "fixed", width: totalTableWidth, minWidth: totalTableWidth }}>
          <TableHead>
            <TableRow>
              <ResizableHeaderCell label="Ngày xuất" columnKey="ngayXuat" />
              <ResizableHeaderCell label="Số" columnKey="soHoaDon" />
              <ResizableHeaderCell label="Nha khoa" columnKey="nhaKhoa" />
              <ResizableHeaderCell label="Tổng cộng" columnKey="tongCong" />
              <ResizableHeaderCell label="Giảm giá" columnKey="giamGia" />
              <ResizableHeaderCell label="Giá trị thanh toán" columnKey="giaTriThanhToan" />
              <ResizableHeaderCell label="Đã thanh toán" columnKey="daThanhToan" />
              <ResizableHeaderCell label="Còn lại" columnKey="conLai" />
              <ResizableHeaderCell label="Chi phí khác" columnKey="chiPhiKhac" />
              <ResizableHeaderCell label="Trạng thái" columnKey="trangThai" />
              <ResizableHeaderCell label="Ghi chú cho khách hàng" columnKey="ghiChu" />
              <ResizableHeaderCell label="Ngày đến hạn" columnKey="ngayDenHan" />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} align="center">
                  <CircularProgress size={30} className="my-10" />
                </TableCell>
              </TableRow>
            ) : danhSachHoaDon?.length > 0 ? (
              danhSachHoaDon.map((hd) => (
                <TableRow
                  key={hd._id}
                  hover
                  className="cursor-pointer transition-colors duration-200 hover:bg-slate-50"
                  onClick={() => navigate(`/hoa-don/${hd._id}/edit`)}
                >
                  <TableCell sx={getClipCellStyle("ngayXuat")}>
                    {new Date(hd.ngayXuatHoaDon || hd.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("soHoaDon")}>
                    {hd?.soHoaDon}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("nhaKhoa")}>
                    {hd.nhaKhoa?.hoVaTen || hd.nhaKhoa?.tenNhaKhoa || "—"}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("tongCong")}>
                    {hd.tongCong?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("giamGia")}>
                    {hd.chietKhau?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("giaTriThanhToan")}>
                    {hd.giaTriThanhToan?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("daThanhToan")}>
                    {hd.daThanhToan?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("conLai")}>
                    {hd.conLai?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("chiPhiKhac")}>
                    {hd.chiPhiKhac?.toLocaleString("vi-VN") || 0}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("trangThai")}>
                    <span
                      className={`inline-block px-2.5 py-1 text-[13px] font-medium tracking-wide ${hd.trangThai === "Chưa thanh toán" ? "bg-[#f44336] text-white"
                        : hd.trangThai === "Thanh toán một phần" ? "bg-[#ff9800] text-white"
                          : hd.trangThai === "Đã thanh toán" ? "bg-[#4CAF50] text-white"
                            : "bg-gray-500 text-white"
                        }`}
                    >
                      {hd.trangThai || "—"}
                    </span>
                  </TableCell>
                  <TableCell sx={getClipCellStyle("ghiChu")}>
                    {hd.ghiChuChoKhachHang || "—"}
                  </TableCell>
                  <TableCell sx={getClipCellStyle("ngayDenHan")}>
                    {hd.ngayDenHan ? new Date(hd.ngayDenHan).toLocaleDateString("vi-VN") : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" className="py-20 text-gray-500">
                  Không tìm thấy dữ liệu hóa đơn nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL CHI TIẾT */}
      <Modal open={openDetail} onClose={() => setOpenDetail(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] md:w-[90%] max-w-[1000px] max-h-[90vh] overflow-auto bg-white shadow-2xl p-8 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-4 text-blue-700">
            Chi Tiết Hóa Đơn: {selectedHD?.soHoaDon}
          </h3>
          <hr className="mb-4 border-gray-200" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-xs text-gray-400 block">Nha khoa</span>
              <span className="font-medium text-gray-800">{selectedHD?.nhaKhoa?.hoVaTen || selectedHD?.nhaKhoa?.tenNhaKhoa}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Trạng thái</span>
              <Chip label={selectedHD?.trangThai} size="small" color="info" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Tổng tiền chưa CK</span>
              <span className="font-medium">{selectedHD?.tongCong?.toLocaleString()}đ</span>
            </div>
            <div>
              <span className="text-xs text-red-400 block">Thực thu (Sau CK)</span>
              <span className="text-lg font-bold text-red-600">{selectedHD?.giaTriThanhToan?.toLocaleString()}đ</span>
            </div>
          </div>

          <p className="font-semibold mb-2 text-sm uppercase text-gray-500">Danh sách sản phẩm</p>
          <div className="max-h-60 overflow-y-auto bg-gray-50 rounded border p-3 flex flex-col gap-3">
            {selectedHD?.danhSachSanPham?.map((item, idx) => (
              <div key={idx} className="pb-3 border-b border-gray-200 last:border-0 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-blue-700">{item.tenSanPham || item.sanPham?.tenSanPham || "Sản phẩm"}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    SL: {item.soLuong} | Đơn giá: {item.donGia?.toLocaleString()}đ
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-800">{item.tongCongSanPham?.toLocaleString()}đ</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => setOpenDetail(false)} variant="outlined">Đóng</Button>
          </div>
        </div>
      </Modal>

      {/* MODAL CẬP NHẬT TRẠNG THÁI */}
      <Modal open={openUpdate} onClose={() => setOpenUpdate(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96%] max-w-[450px] bg-white shadow-2xl p-6 rounded-lg outline-none">
          <h3 className="text-lg font-bold mb-6 text-center text-gray-800">Cập Nhật Trạng Thái</h3>
          <FormControl fullWidth className="mb-6">
            <InputLabel>Trạng thái</InputLabel>
            <Select value={statusUpdate} label="Trạng thái" onChange={(e) => setStatusUpdate(e.target.value)}>
              <MenuItem value="Chưa thanh toán">Chưa thanh toán</MenuItem>
              <MenuItem value="Đã thanh toán">Đã thanh toán</MenuItem>
            </Select>
          </FormControl>
          <div className="flex justify-end gap-3">
            <Button onClick={() => setOpenUpdate(false)}>Hủy</Button>
            <Button variant="contained" color="primary" onClick={handleConfirmUpdate}>Lưu thay đổi</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HoaDonTable;