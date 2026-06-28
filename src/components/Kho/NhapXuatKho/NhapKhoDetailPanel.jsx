import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchPhieuNhapKhoById,
    updatePhieuNhapKho,
    deletePhieuNhapKho,
    clearSelected,
} from "../../../redux/slices/phieuNhapKhoSlice";
import { toast } from "sonner";
import NhapKhoModal from "./NhapKhoModal";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";

function formatNgay(dateStr) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${hh}:${min} ${dd}/${mm}/${yyyy}`;
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start gap-2 text-sm">
            <span className="text-gray-500 w-28 shrink-0">{label}:</span>
            <span>{value || "—"}</span>
        </div>
    );
}

/**
 * Props:
 *  phieu     – phieuNhapKho row object | null
 *  onClose   – () => void
 *  onUpdated – () => void  (refresh parent list)
 */
export default function NhapKhoDetailPanel({ phieu, onClose, onUpdated }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [fullPhieu, setFullPhieu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Trigger slide animation
    useEffect(() => {
        if (phieu) {
            const raf = requestAnimationFrame(() => setIsOpen(true));
            return () => cancelAnimationFrame(raf);
        } else {
            setIsOpen(false);
            setFullPhieu(null);
        }
    }, [!!phieu]);

    // Fetch full detail whenever selected phieu changes
    useEffect(() => {
        if (!phieu?._id) return;
        setLoading(true);
        dispatch(fetchPhieuNhapKhoById(phieu._id))
            .unwrap()
            .then((res) => setFullPhieu(res.data || res))
            .catch(() => setFullPhieu(phieu))
            .finally(() => setLoading(false));
    }, [phieu?._id, dispatch]);

    function handleClose() {
        setIsOpen(false);
        dispatch(clearSelected());
        setTimeout(onClose, 300);
    }

    async function handleConfirmNhan() {
        if (!fullPhieu) return;
        setUpdatingStatus(true);
        try {
            const res = await dispatch(
                updatePhieuNhapKho({ id: fullPhieu._id, trangThai: "Đã nhận" })
            ).unwrap();
            setFullPhieu((prev) => ({ ...prev, trangThai: "Đã nhận", ...(res.data || {}) }));
            toast.success("Cập nhật: Đã nhận");
            onUpdated?.();
        } catch (err) {
            toast.error(err?.message || "Cập nhật thất bại");
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function handleConfirmDelete() {
        try {
            await dispatch(deletePhieuNhapKho(fullPhieu._id)).unwrap();
            toast.success(`Đã xóa ${fullPhieu.soPhieu}`);
            onUpdated?.();
            handleClose();
        } catch (err) {
            toast.error(err?.message || "Xóa thất bại");
        } finally {
            setShowDeleteConfirm(false);
        }
    }

    function handleEditClose() {
        setShowEditModal(false);
        if (fullPhieu?._id) {
            dispatch(fetchPhieuNhapKhoById(fullPhieu._id))
                .unwrap()
                .then((res) => setFullPhieu(res.data || res))
                .catch(() => { });
        }
        onUpdated?.();
    }

    const panelTop = 70;
    const tongTien = (fullPhieu?.danhSachVatLieu || []).reduce(
        (s, i) => s + (i.thanhTien || 0),
        0
    );

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/20 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
                style={{ zIndex: 999, top: `${panelTop}px` }}
                onClick={handleClose}
            />

            {/* Slide panel */}
            <div
                className={`fixed right-0 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                style={{
                    zIndex: 999,
                    top: `${panelTop}px`,
                    width: "600px",
                    maxWidth: "100vw",
                    height: `calc(100vh - ${panelTop}px)`,
                }}
            >
                {/* Header */}
                <div className="bg-sky-400 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-white">
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-500 transition"
                        >
                            <ArrowForwardIcon sx={{ fontSize: 22 }} />
                        </button>
                        <div>
                            <div className="font-semibold text-base leading-tight">
                                {fullPhieu?.soPhieu || phieu?.soPhieu || "Phiếu nhập kho"}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-white">
                        <button
                            onClick={() => setShowEditModal(true)}
                            title="Sửa phiếu"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-500 transition"
                        >
                            <EditIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            title="Xóa phiếu"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-500 transition"
                        >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                            onClick={() => navigate(`/kho/phieu-nhap/${fullPhieu?._id || phieu?._id}/print`)}
                            title="In phiếu"
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-sky-500 transition"
                        >
                            <LocalPrintshopIcon sx={{ fontSize: 20 }} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                            Đang tải...
                        </div>
                    ) : fullPhieu ? (
                        <div className="p-4 flex flex-col gap-5">
                            {/* Meta info */}
                            <div className="flex flex-col gap-2 bg-gray-100 rounded-lg p-3">
                                <InfoRow label="Ngày tạo" value={formatNgay(fullPhieu.ngayTao)} />
                                <InfoRow label="Người tạo" value={fullPhieu.nguoiTao} />
                                {fullPhieu.ghiChu && (
                                    <InfoRow label="Ghi chú" value={fullPhieu.ghiChu} />
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 w-28 shrink-0">Trạng thái:</span>
                                    <span
                                        className={`text-sm text-white font-medium px-2.5 py-0.5 ${fullPhieu.trangThai === "Đã nhận"
                                            ? "bg-green-500"
                                            : "bg-yellow-500"
                                            }`}
                                    >
                                        {fullPhieu.trangThai}
                                    </span>
                                </div>
                            </div>


                            {/* Danh sách vật liệu */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                                    Danh sách vật liệu ({fullPhieu.danhSachVatLieu?.length || 0})
                                </h3>
                                <div className="border border-gray-200 overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-sky-100">
                                                <th className="text-left py-1 px-2 font-normal text-gray-700">Vật liệu</th>
                                                <th className="text-left py-1 px-2 font-normal text-gray-700">NCC</th>
                                                <th className="text-right py-1 px-2 font-normal text-gray-700">SL</th>
                                                <th className="text-right py-1 px-2 font-normal text-gray-700">Đơn giá</th>
                                                <th className="text-right py-1 px-2 font-normal text-gray-700">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(fullPhieu.danhSachVatLieu || []).map((item, i) => (
                                                <tr
                                                    key={i}
                                                    className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                                >
                                                    <td className="py-1 px-2 max-w-[120px] truncate">
                                                        {item.vatLieu?.tenVatLieu || "—"}
                                                    </td>
                                                    <td className="py-1 px-2 max-w-[120px] truncate">
                                                        {item.nhaCungCap?.ten || "—"}
                                                    </td>
                                                    <td className="py-1 px-2 text-right">{item.soLuong}</td>
                                                    <td className="py-1 px-2 text-right">
                                                        {(item.donGia || 0).toLocaleString("vi-VN")}
                                                    </td>
                                                    <td className="py-1 px-2 text-right font-medium">
                                                        {(item.thanhTien || 0).toLocaleString("vi-VN")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-sky-100 border-t border-gray-200">
                                                <td
                                                    className="py-1 px-2 font-normal text-gray-700"
                                                    colSpan={4}
                                                >
                                                    Tổng cộng
                                                </td>
                                                <td className="py-1 px-2 text-right font-medium">
                                                    {tongTien.toLocaleString("vi-VN")} ₫
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>


                            {/* Xác nhận nhận hàng */}
                            {fullPhieu.trangThai === "Đã nhận" ? (
                                <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                                    <LockIcon sx={{ fontSize: 16 }} />
                                    Đã nhập kho
                                </div>
                            ) : (
                                <button
                                    onClick={handleConfirmNhan}
                                    disabled={updatingStatus}
                                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-60"
                                >
                                    {updatingStatus ? "Đang cập nhật..." : "Đánh dấu Đã nhận"}
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Delete confirm overlay */}
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 p-6">
                        <p className="text-center font-medium text-gray-800">
                            Xóa phiếu{" "}
                            <span className="text-red-600 font-semibold">{fullPhieu?.soPhieu}</span>?
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                            Thao tác này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit modal (z-index above panel) */}
            {showEditModal && fullPhieu && (
                <NhapKhoModal
                    open={showEditModal}
                    onClose={handleEditClose}
                    editData={fullPhieu}
                />
            )}
        </>
    );
}
