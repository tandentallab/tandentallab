import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNhanVien,
  deleteNhanVien,
} from "../../redux/slices/nhanVienSlice";
import NhanVienFormModal from "./NhanVienFormModal";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Tooltip, Typography } from "@mui/material";

const NhanVienTable = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);
  const [sortLuong, setSortLuong] = useState("");
  const { data } = useSelector((state) => state.nhanVien);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchNhanVien());
  }, [dispatch]);

  const sortedData = useMemo(() => {
    const arr = [...(data || [])];
    if (sortLuong === "asc")
      arr.sort(
        (a, b) => Number(a.luongCanBan || 0) - Number(b.luongCanBan || 0)
      );
    if (sortLuong === "desc")
      arr.sort(
        (a, b) => Number(b.luongCanBan || 0) - Number(a.luongCanBan || 0)
      );
    return arr;
  }, [data, sortLuong]);

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    dispatch(deleteNhanVien(id));
  };

  // 🔥 Đã thêm tiêu đề "Ngày công tháng" vào mảng COLS
  const COLS = [
    "Họ tên",
    "Chức vụ",
    "CCCD",
    "SĐT",
    "Email",
    "Địa chỉ",
    "Lương cơ bản",
    "Ngày công tháng",
    "Ngày tạo",
    "",
  ];

  const formatDateVN = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Kiểm tra nếu ngày tháng không hợp lệ
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Nhân viên
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {sortedData.length} nhân viên trong hệ thống
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortLuong}
              onChange={(e) => setSortLuong(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Sắp xếp lương</option>
              <option value="asc">Lương tăng dần</option>
              <option value="desc">Lương giảm dần</option>
            </select>

            <button
              onClick={() => {
                setSelectedNhanVien(null);
                setOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-all"
              style={{ background: "linear-gradient(135deg,#2563eb,#3b82f6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <AddIcon sx={{ fontSize: 17 }} />
              Thêm nhân viên
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr style={{ background: "#2563eb" }}>
                  {COLS.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#fff" }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.length > 0 ? (
                  sortedData.map((nv, idx) => (
                    <tr
                      key={nv._id}
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "#f8fafc",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#eff6ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          idx % 2 === 0 ? "#fff" : "#f8fafc")
                      }
                    >
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <button
                          onClick={() => navigate(`/nhan-vien/${nv._id}`)}
                          className="font-semibold text-blue-600 hover:underline text-sm"
                        >
                          {nv.hoVaTen}
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium">
                          {nv.chucVu || "—"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-slate-500 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.cccd}
                      </td>
                      <td
                        className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.soDienThoai || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-slate-500 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.email || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-slate-500 text-sm max-w-[180px] truncate"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.diaChi || "—"}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap font-bold text-emerald-600 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {Number(nv.luongCanBan).toLocaleString("vi-VN")} đ
                      </td>

                      {/* 🔥 Đã thêm ô hiển thị Ngày công tháng (Mặc định hiển thị 28 nếu chưa có dữ liệu cũ) */}
                      <td
                        className="px-4 py-3 whitespace-nowrap font-medium text-slate-600 text-sm text-center"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.ngayCongThang || 28} ngày
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap font-medium text-slate-600 text-sm text-center"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {formatDateVN(nv.ngayTao)}
                      </td>

                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <div className="flex items-center gap-0.5">
                          <Tooltip title="Chỉnh sửa">
                            <button
                              onClick={() => {
                                setSelectedNhanVien(nv);
                                setOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              <EditIcon sx={{ fontSize: 17 }} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Chi tiết">
                            <button
                              onClick={() => navigate(`/nhan-vien/${nv._id}`)}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                            >
                              <AssignmentIcon sx={{ fontSize: 17 }} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <button
                              onClick={() => handleDelete(nv._id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                            >
                              <DeleteIcon sx={{ fontSize: 17 }} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* 🔥 Tăng colSpan từ 8 lên 9 để vừa vặn với số lượng cột mới */}
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={8} align="center">
                    <Typography variant="caption" color="text.secondary">
                      Tổng số {data?.length} người liên hệ
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NhanVienFormModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={selectedNhanVien}
      />
    </div>
  );
};

export default NhanVienTable;
