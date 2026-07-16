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
import SearchIcon from "@mui/icons-material/Search";
import { Tooltip, Typography } from "@mui/material";

const NhanVienTable = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedNhanVien, setSelectedNhanVien] = useState(null);
  const [sortLuong, setSortLuong] = useState("");
  const [sortChucVu, setSortChucVu] = useState("asc");
  const [searchTen, setSearchTen] = useState("");
  const [filterChucVu, setFilterChucVu] = useState("");
  const { data } = useSelector((state) => state.nhanVien);

  const chucVuOptions = useMemo(() => {
    const set = new Set((data || []).map((nv) => nv.chucVu).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [data]);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchNhanVien());
  }, [dispatch]);

  const sortedData = useMemo(() => {
    let arr = [...(data || [])];

    // Filter by name
    if (searchTen.trim()) {
      const keyword = searchTen.trim().toLowerCase();
      arr = arr.filter((nv) =>
        (nv.hoVaTen || "").toLowerCase().includes(keyword)
      );
    }

    // Filter by position
    if (filterChucVu) {
      arr = arr.filter((nv) => nv.chucVu === filterChucVu);
    }

    // Sort by salary
    if (sortLuong === "asc")
      arr.sort(
        (a, b) => Number(a.luongCanBan || 0) - Number(b.luongCanBan || 0)
      );
    if (sortLuong === "desc")
      arr.sort(
        (a, b) => Number(b.luongCanBan || 0) - Number(a.luongCanBan || 0)
      );

    // Sort by position (A→Z / Z→A), applied after salary sort
    if (sortChucVu === "asc")
      arr.sort((a, b) => (a.chucVu || "").localeCompare(b.chucVu || "", "vi"));
    if (sortChucVu === "desc")
      arr.sort((a, b) => (b.chucVu || "").localeCompare(a.chucVu || "", "vi"));

    return arr;
  }, [data, sortLuong, sortChucVu, searchTen, filterChucVu]);

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
    dispatch(deleteNhanVien(id));
  };

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
    if (isNaN(date.getTime())) return "Ngày không hợp lệ";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* ─── Shared sticky styles ─── */
  const stickyNameCol = {
    position: "sticky",
    left: 0,
    zIndex: 2,
  };

  const stickyNameColHeader = {
    ...stickyNameCol,
    zIndex: 3,
    background: "#2563eb",
  };

  return (
    <>
      {/* ─── Inline responsive styles ─── */}
      <style>{`
        .nv-scroll-wrapper {
          overflow: auto;
          max-height: calc(100vh - 220px);
          border-radius: 0.75rem;
          box-shadow: 0 1px 6px 0 rgba(0,0,0,.08);
        }

        .nv-table thead tr th {
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .nv-table tbody tr td:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          background: inherit;
        }

        .nv-table tbody tr:hover td:first-child {
          background: #eff6ff;
        }

        /* Search input icon wrapper */
        .nv-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nv-search-wrap svg {
          position: absolute;
          left: 8px;
          color: #94a3b8;
          pointer-events: none;
          font-size: 16px !important;
        }
        .nv-search-input {
          padding: 0.45rem 0.75rem 0.45rem 2rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 1rem;
          color: #334155;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          width: 160px;
        }
        .nv-search-input:focus {
          border-color: #93c5fd;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.3);
        }
        .nv-search-input::placeholder {
          color: #94a3b8;
        }

        @media (max-width: 767px) {
          .nv-scroll-wrapper {
            overflow: visible;
            max-height: none;
            box-shadow: none;
            border-radius: 0;
          }

          .nv-table {
            display: block;
          }
          .nv-table thead {
            display: none;
          }
          .nv-table tbody,
          .nv-table tr {
            display: block;
          }
          .nv-table tbody tr {
            background: #fff !important;
            border-radius: 0.875rem;
            box-shadow: 0 1px 4px 0 rgba(0,0,0,.08);
            margin-bottom: 0.875rem;
            padding: 0.75rem 1rem;
          }
          .nv-table td {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.5rem;
            padding: 0.35rem 0 !important;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 0.8rem;
          }
          .nv-table td:last-child {
            border-bottom: none !important;
            justify-content: flex-end;
            padding-top: 0.5rem !important;
          }
          .nv-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            min-width: 110px;
            flex-shrink: 0;
            font-size: 0.72rem;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .nv-table tbody tr td:first-child {
            position: static;
          }
          .nv-footer-row {
            display: block;
            text-align: center;
            padding: 0.5rem 0;
          }
          .nv-toolbar {
            flex-wrap: wrap;
            gap: 0.5rem !important;
          }
          .nv-search-input {
            width: 130px;
          }
        }
      `}</style>

      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                Nhân viên
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {sortedData.length} / {data?.length || 0} nhân viên
              </p>
            </div>

            {/* ── Toolbar ── */}
            <div className="nv-toolbar flex items-center gap-2">
              {/* Search by name */}
              <div className="nv-search-wrap">
                <SearchIcon />
                <input
                  className="nv-search-input"
                  placeholder="Tìm theo tên..."
                  value={searchTen}
                  onChange={(e) => setSearchTen(e.target.value)}
                />
              </div>

              {/* Filter by position */}
              <select
                value={filterChucVu}
                onChange={(e) => setFilterChucVu(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Tất cả chức vụ</option>
                {chucVuOptions.map((cv) => (
                  <option key={cv} value={cv}>
                    {cv}
                  </option>
                ))}
              </select>

              {/* Sort by position */}
              <select
                value={sortChucVu}
                onChange={(e) => setSortChucVu(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Sắp xếp chức vụ</option>
                <option value="asc">Chức vụ A → Z</option>
                <option value="desc">Chức vụ Z → A</option>
              </select>

              <button
                onClick={() => {
                  setSelectedNhanVien(null);
                  setOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-all"
                style={{
                  background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <AddIcon sx={{ fontSize: 17 }} />
                Thêm nhân viên
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="nv-scroll-wrapper bg-white">
            <table
              className="nv-table w-full text-sm"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr>
                  {COLS.map((col, i) => (
                    <th
                      key={col || `col-${i}`}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{
                        color: "#fff",
                        background: "#2563eb",
                        ...(i === 0 ? stickyNameColHeader : {}),
                      }}
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
                      {/* ── Sticky: Họ tên ── */}
                      <td
                        data-label="Họ tên"
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
                        data-label="Chức vụ"
                        className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs font-medium">
                          {nv.chucVu || "—"}
                        </span>
                      </td>

                      <td
                        data-label="CCCD"
                        className="px-4 py-3 text-slate-500 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.cccd}
                      </td>

                      <td
                        data-label="SĐT"
                        className="px-4 py-3 text-slate-600 text-sm whitespace-nowrap"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.soDienThoai || "—"}
                      </td>

                      <td
                        data-label="Email"
                        className="px-4 py-3 text-slate-500 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.email || "—"}
                      </td>

                      <td
                        data-label="Địa chỉ"
                        className="px-4 py-3 text-slate-500 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.diaChi || "—"}
                      </td>

                      <td
                        data-label="Lương cơ bản"
                        className="px-4 py-3 whitespace-nowrap font-bold text-emerald-600 text-sm"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {Number(nv.luongCanBan).toLocaleString("vi-VN")} đ
                      </td>

                      <td
                        data-label="Ngày công tháng"
                        className="px-4 py-3 whitespace-nowrap font-medium text-slate-600 text-sm text-center"
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        {nv.ngayCongThang || 28} ngày
                      </td>

                      <td
                        data-label="Ngày tạo"
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
                    <td
                      colSpan={9}
                      className="text-center py-12 text-slate-400 text-sm"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
                <tr className="nv-footer-row">
                  <td colSpan={10} align="center">
                    <Typography variant="caption" color="text.secondary">
                      Tổng số {data?.length} người liên hệ
                    </Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <NhanVienFormModal
          open={open}
          onClose={() => setOpen(false)}
          initialData={selectedNhanVien}
        />
      </div>
    </>
  );
};

export default NhanVienTable;
