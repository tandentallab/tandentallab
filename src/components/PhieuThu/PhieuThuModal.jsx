﻿import React, { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createPhieuThu,
  fetchHoaDonChuaThanhToan,
} from "../../redux/slices/phieuThuSlice";
import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

const toLocalDatetimeInput = (d) => {
  const dt = d ? new Date(d) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
    dt.getDate()
  )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const fmt = (v) => new Intl.NumberFormat("vi-VN").format(v || 0);
const formatSoHoaDon = (hd) => hd?.soHoaDon || "-";
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PhieuThuModal({ open, onClose, onSuccess, initialNhaKhoaId, initialHoaDonId }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nhaKhoaList = useSelector((s) => s.nhaKhoa.data);
  const { hoaDonChuaThanhToan, loadingHoaDon, loading } = useSelector(
    (s) => s.phieuThu
  );

  const [selectedNhaKhoa, setSelectedNhaKhoa] = useState("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedHDs, setSelectedHDs] = useState({});
  const [soTienThuInput, setSoTienThuInput] = useState("");
  const [ngayThu, setNgayThu] = useState(toLocalDatetimeInput(new Date()));
  const [phuongThuc, setPhuongThuc] = useState("Tiền mặt");
  const [noiDung, setNoiDung] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    dispatch(fetchNhaKhoa());
  }, [dispatch]);

  // ĐƯỜNG TẮT: Tự động chọn Nha Khoa nếu có truyền ID qua
  useEffect(() => {
    if (open && initialNhaKhoaId) {
      setSelectedNhaKhoa(initialNhaKhoaId);
    }
  }, [open, initialNhaKhoaId]);

  // ĐƯỜNG TẮT: Tự động điền text hiển thị cho ô tìm kiếm
  useEffect(() => {
    if (open && initialNhaKhoaId && nhaKhoaList.length > 0) {
      const nk = nhaKhoaList.find(n => n._id === initialNhaKhoaId);
      if (nk) setSearch(nk.hoVaTen || nk.tenGiaoDich || "");
    }
  }, [open, initialNhaKhoaId, nhaKhoaList]);

  // Logic gọi API lấy danh sách hóa đơn theo nha khoa đã chọn
  useEffect(() => {
    if (selectedNhaKhoa) {
      dispatch(fetchHoaDonChuaThanhToan(selectedNhaKhoa));
      setSelectedHDs({});
      setSoTienThuInput("");
    }
  }, [selectedNhaKhoa, dispatch]);

  // ĐƯỜNG TẮT: Khi đã có danh sách hóa đơn, tự động check chọn hóa đơn đó
  useEffect(() => {
    if (open && initialHoaDonId && hoaDonChuaThanhToan.length > 0 && !autoSelected) {
      const hd = hoaDonChuaThanhToan.find(h => h._id === initialHoaDonId);
      if (hd) {
        setSelectedHDs({ [initialHoaDonId]: { soTienThanhToan: hd.conLai || 0 } });
        setSoTienThuInput(String(hd.conLai || 0));
        setAutoSelected(true);
      }
    }
  }, [open, initialHoaDonId, hoaDonChuaThanhToan, autoSelected]);

  const selectedNhaKhoaObj = useMemo(
    () => nhaKhoaList.find((nk) => nk._id === selectedNhaKhoa) || null,
    [nhaKhoaList, selectedNhaKhoa]
  );

  const filteredNhaKhoa = useMemo(() => {
    if (!search.trim()) return nhaKhoaList;
    const s = search.toLowerCase();
    return nhaKhoaList.filter(
      (nk) =>
        (nk.hoVaTen || "").toLowerCase().includes(s) ||
        (nk.tenGiaoDich || "").toLowerCase().includes(s)
    );
  }, [nhaKhoaList, search]);

  const handleSelectNhaKhoa = (nk) => {
    setSelectedNhaKhoa(nk._id);
    setSearch(nk.hoVaTen || nk.tenGiaoDich || "");
    setShowDropdown(false);
  };

  const handleClearNhaKhoa = () => {
    setSelectedNhaKhoa("");
    setSearch("");
    setSelectedHDs({});
    setSoTienThuInput("");
  };

  const handleToggleHD = (hdId) => {
    let next;
    if (selectedHDs[hdId]) {
      next = { ...selectedHDs };
      delete next[hdId];
    } else {
      const hd = hoaDonChuaThanhToan.find((h) => h._id === hdId);
      next = { ...selectedHDs, [hdId]: { soTienThanhToan: hd?.conLai || 0 } };
    }
    const total = Object.values(next).reduce(
      (s, v) => s + (v.soTienThanhToan || 0),
      0
    );
    setSelectedHDs(next);
    setSoTienThuInput(total > 0 ? String(total) : "");
  };

  // 🔥 SỬA: Xử lý nhập giá trị TỪNG DÒNG HÓA ĐƠN (Format VNĐ)
  const handleAmountChange = (hdId, rawValue, maxVal) => {
    const digits = rawValue.replace(/[^\d]/g, ""); // Chỉ lấy số
    const num = Number(digits) || 0;

    let next;
    if (num > 0) {
      next = {
        ...selectedHDs,
        [hdId]: { soTienThanhToan: Math.min(num, maxVal) }, // Không cho nhập lố số nợ
      };
    } else {
      next = { ...selectedHDs };
      delete next[hdId];
    }

    // Cộng dồn lại để hiển thị lên ô Tổng (tôn trọng 100% số vừa gõ)
    const total = Object.values(next).reduce(
      (s, v) => s + (v.soTienThanhToan || 0),
      0
    );
    setSelectedHDs(next);
    setSoTienThuInput(total > 0 ? String(total) : "");
  };

  const allChecked =
    hoaDonChuaThanhToan.length > 0 &&
    hoaDonChuaThanhToan.every((hd) => !!selectedHDs[hd._id]);
  const someChecked =
    hoaDonChuaThanhToan.some((hd) => !!selectedHDs[hd._id]) && !allChecked;

  const handleToggleAll = () => {
    if (allChecked) {
      setSelectedHDs({});
      setSoTienThuInput("");
    } else {
      const next = {};
      hoaDonChuaThanhToan.forEach((hd) => {
        next[hd._id] = { soTienThanhToan: hd.conLai || 0 };
      });
      const total = Object.values(next).reduce(
        (s, v) => s + (v.soTienThanhToan || 0),
        0
      );
      setSelectedHDs(next);
      setSoTienThuInput(total > 0 ? String(total) : "");
    }
  };

  // 🔥 SỬA: Auto-phân bổ ưu tiên gánh nợ cho hóa đơn cũ trước
  const handleSoTienThuInput = (raw) => {
    const digits = raw.replace(/[^\d]/g, "");
    const total = Number(digits) || 0;
    setSoTienThuInput(digits);

    // Sắp xếp: Ưu tiên ngày xuất hóa đơn cũ nhất, nếu bằng nhau thì ưu tiên theo thời gian tạo.
    const sorted = [...hoaDonChuaThanhToan].sort((a, b) => {
      const timeA = new Date(a.ngayXuatHoaDon || a.createdAt || 0).getTime();
      const timeB = new Date(b.ngayXuatHoaDon || b.createdAt || 0).getTime();
      return timeA - timeB;
    });

    let remaining = total;
    const next = {};

    for (const hd of sorted) {
      if (remaining <= 0) break;
      const pay = Math.min(remaining, hd.conLai || 0);
      if (pay > 0) {
        next[hd._id] = { soTienThanhToan: pay };
        remaining -= pay;
      }
    }
    setSelectedHDs(next);
  };

  const tongThuTien = useMemo(
    () =>
      Object.values(selectedHDs).reduce(
        (s, v) => s + (v.soTienThanhToan || 0),
        0
      ),
    [selectedHDs]
  );

  const tongConNo = useMemo(() => {
    if (!hoaDonChuaThanhToan.length) return 0;
    return (
      hoaDonChuaThanhToan.reduce((s, hd) => s + (hd.conLai || 0), 0) -
      tongThuTien
    );
  }, [hoaDonChuaThanhToan, tongThuTien]);

  const handleSubmit = async () => {
    setSubmitError("");
    if (!selectedNhaKhoa) {
      setSubmitError("Vui lòng chọn khách hàng.");
      return;
    }

    // Gửi data gốc dựa trên các số đã nhập
    const entries = Object.entries(selectedHDs);
    if (!entries.length) {
      setSubmitError("Vui lòng chọn ít nhất một hóa đơn.");
      return;
    }

    for (const [, { soTienThanhToan }] of entries) {
      if (!soTienThanhToan || soTienThanhToan <= 0) {
        setSubmitError("Số tiền thanh toán phải lớn hơn 0.");
        return;
      }
    }

    try {
      await dispatch(
        createPhieuThu({
          nhaKhoaId: selectedNhaKhoa,
          soTienThu: tongThuTien,

          danhSachHoaDon: entries.map(([hdId, { soTienThanhToan }]) => ({
            hoaDon: hdId,
            soTienThanhToan,
          })),
          ngayThu: new Date(ngayThu).toISOString(),
          noiDung,
          phuongThucThanhToan: phuongThuc,
        })
      ).unwrap();

      setSubmitSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSubmitSuccess(false);
        handleClose();
      }, 800);
    } catch (err) {
      setSubmitError(
        typeof err === "string" ? err : "Có lỗi xảy ra khi tạo phiếu thu."
      );
    }
  };

  const handleClose = () => {
    setSelectedNhaKhoa("");
    setSearch("");
    setSelectedHDs({});
    setSoTienThuInput("");
    setNgayThu(toLocalDatetimeInput(new Date()));
    setPhuongThuc("Tiền mặt");
    setNoiDung("");
    setSubmitError("");
    setSubmitSuccess(false);
    setAutoSelected(false);
    onClose();
  };

  const handleSubmitRef = useRef(null);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "F3") {
        e.preventDefault();
        handleSubmitRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const tenKhach =
    selectedNhaKhoaObj?.hoVaTen || selectedNhaKhoaObj?.tenGiaoDich || "";
  const address = selectedNhaKhoaObj
    ? [
      selectedNhaKhoaObj.diaChiCuThe,
      selectedNhaKhoaObj.quanHuyen,
      selectedNhaKhoaObj.tinh,
    ]
      .filter(Boolean)
      .join(", ")
    : "";

  return (
    <div className="fixed inset-0 z-[1400] flex items-start justify-center pt-4 pb-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col"
        style={{ maxHeight: "calc(100vh - 32px)" }}
      >
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#29b6f6] rounded-t-2xl shrink-0">
          <h2 className="text-white font-semibold text-base tracking-wide">
            Lập phiếu thu
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm">
              Tạo phiếu thu thành công!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <p className="text-xs text-gray-400 mb-1">Công ty</p>
              <div className="relative" ref={searchRef}>
                <div className="flex items-center border-b-2 border-gray-300 focus-within:border-[#29b6f6] pb-1 gap-2">
                  {tenKhach && (
                    <div className="w-8 h-8 rounded-full bg-[#29b6f6] flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">
                        {getInitials(tenKhach)}
                      </span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={search}
                    placeholder="-- Chọn khách hàng --"
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) handleClearNhaKhoa();
                    }}
                    className="flex-1 text-sm font-semibold text-gray-800 bg-transparent outline-none placeholder-gray-400"
                  />
                  {selectedNhaKhoa && (
                    <button
                      onClick={handleClearNhaKhoa}
                      className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0"
                    >
                      &times;
                    </button>
                  )}
                </div>
                {showDropdown && filteredNhaKhoa.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                    {filteredNhaKhoa.map((nk) => (
                      <div
                        key={nk._id}
                        onMouseDown={() => handleSelectNhaKhoa(nk)}
                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {nk.hoVaTen || nk.tenGiaoDich}
                        </p>
                        {nk.moTa && (
                          <p className="text-xs text-gray-400 truncate">
                            {nk.moTa}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedNhaKhoaObj && (
                <div className="mt-3 bg-[#e3f2fd] rounded-xl px-4 py-3 space-y-1 text-sm">
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-20 shrink-0">Địa chỉ:</span>
                    <span className="text-gray-700">{address || "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-20 shrink-0">Điện thoại:</span>
                    <span className="text-gray-500">
                      {selectedNhaKhoaObj.soDienThoai || ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-500 w-20 shrink-0">Mô tả:</span>
                    <span className="text-gray-700">
                      {selectedNhaKhoaObj.moTa || ""}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Số tiền thu</p>
                <input
                  type="text"
                  inputMode="numeric"
                  value={soTienThuInput ? fmt(soTienThuInput) : ""}
                  onChange={(e) => handleSoTienThuInput(e.target.value)}
                  placeholder="Nhập để tự phân bổ..."
                  className="w-full text-2xl font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent pb-1 outline-none placeholder:text-gray-300 placeholder:text-base placeholder:font-normal"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Ngày thu</p>
                <input
                  type="datetime-local"
                  value={ngayThu}
                  onChange={(e) => setNgayThu(e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  Phương thức thanh toán
                </p>
                <select
                  value={phuongThuc}
                  onChange={(e) => setPhuongThuc(e.target.value)}
                  className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none appearance-none cursor-pointer"
                >
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
            {loadingHoaDon ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Đang tải...
              </div>
            ) : !selectedNhaKhoa ? (
              <div className="text-center py-8 text-gray-300 text-sm">
                Chọn khách hàng để xem hóa đơn
              </div>
            ) : hoaDonChuaThanhToan.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Không có hóa đơn chưa thanh toán
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="border-b border-gray-100">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = someChecked;
                          }}
                          onChange={handleToggleAll}
                          className="w-4 h-4 accent-[#29b6f6] cursor-pointer rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium">STT</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Hóa đơn
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Ngày xuất
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Giá trị
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Đã thanh toán
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Còn lại
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Thanh toán
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...hoaDonChuaThanhToan]
                      .sort((a, b) => {
                        // So sánh ngày xuất hóa đơn (hoặc ngày tạo nếu chưa có ngày xuất)
                        const timeA = new Date(a.ngayXuatHoaDon || a.createdAt || 0).getTime();
                        const timeB = new Date(b.ngayXuatHoaDon || b.createdAt || 0).getTime();
                        // Trả về timeB - timeA để sắp xếp giảm dần (mới nhất ở trên)
                        return timeB - timeA;
                      })
                      .map((hd, idx) => {
                        const checked = !!selectedHDs[hd._id];
                        return (
                          <tr
                            key={hd._id}
                            className={`border-b border-gray-50 last:border-0 transition-colors ${checked ? "bg-blue-50/60" : "hover:bg-gray-50"
                              }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleToggleHD(hd._id)}
                                className="w-4 h-4 accent-[#29b6f6] cursor-pointer rounded"
                              />
                            </td>
                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-[#29b6f6]">
                              <span
                                className="cursor-pointer hover:underline"
                                onClick={() => {
                                  handleClose();
                                  navigate(`/hoa-don/${hd._id}/edit`);
                                }}
                              >
                                {hd.soHoaDon || formatSoHoaDon(hd._id)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {hd.ngayXuatHoaDon
                                ? new Date(hd.ngayXuatHoaDon).toLocaleDateString(
                                  "vi-VN"
                                )
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {fmt(hd.giaTriThanhToan)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-500">
                              {fmt(hd.daThanhToan)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700">
                              {fmt(hd.conLai)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {/* 🔥 SỬA: Đổi input từ dạng số sang dạng chữ để format VNĐ */}
                              <input
                                type="text"
                                inputMode="numeric"
                                value={
                                  selectedHDs[hd._id]?.soTienThanhToan
                                    ? fmt(selectedHDs[hd._id].soTienThanhToan)
                                    : ""
                                }
                                placeholder="0"
                                onChange={(e) =>
                                  handleAmountChange(
                                    hd._id,
                                    e.target.value,
                                    hd.conLai
                                  )
                                }
                                className="w-28 border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-right text-sm text-gray-800 outline-none py-0.5"
                              />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-start">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Nội dung thu</p>
                <input
                  type="text"
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  placeholder=""
                  className="w-full border-b-2 border-gray-200 focus:border-[#29b6f6] bg-transparent text-sm text-gray-800 py-1 outline-none"
                />
              </div>
              <div className="bg-[#e3f2fd] rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-3">Tài liệu</p>
                <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                  <CloudUploadOutlinedIcon
                    sx={{ fontSize: 32, color: "#9ca3af", marginBottom: "4px" }}
                  />
                  <p className="text-xs">Thả file vào đây để upload</p>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-end pt-1">
              <div className="text-right">
                <span className="text-sm text-gray-500 mr-4">Còn nợ</span>
                <span className="text-xl font-bold text-gray-900">
                  {fmt(Math.max(0, tongConNo))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-white rounded-b-2xl flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-[#29b6f6] hover:bg-[#0091ea] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-sm"
          >
            {loading && (
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            )}
            <SaveOutlinedIcon sx={{ fontSize: 17 }} />
            Lưu (F3)
          </button>
        </div>
      </div>
    </div>
  );
}