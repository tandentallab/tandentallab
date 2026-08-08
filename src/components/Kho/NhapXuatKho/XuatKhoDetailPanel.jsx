import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchPhieuXuatKhoById,
    updatePhieuXuatKho,
    deletePhieuXuatKho,
    clearSelectedXuat,
} from "../../../redux/slices/phieuXuatKhoSlice";
import { toast } from "sonner";
import XuatKhoModal from "./XuatKhoModal";
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
        <div className="flex items-start gap-2 text-base">
            <span className="text-gray-500 w-28 shrink-0">{label}:</span>
            <span>{value || "—"}</span>
        </div>
    );
}

/**
 * Props:
 *  phieu     – phieuXuatKho row object | null (null/undefined => modal closed)
 *  onClose   – () => void
 *  onUpdated – () => void  (refresh parent list)
 */
export default function XuatKhoDetailModal({ phieu, onClose, onUpdated }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [fullPhieu, setFullPhieu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [confirmingXuat, setConfirmingXuat] = useState(false);

    const { user } = useSelector(state => state.auth);

    // Reset local state when target changes / modal closes
    useEffect(() => {
        if (!phieu) {
            setFullPhieu(null);
            setShowDeleteConfirm(false);
        }
    }, [phieu]);

    // Fetch full detail whenever selected phieu changes
    useEffect(() => {
        if (!phieu?._id) return;
        setLoading(true);
        dispatch(fetchPhieuXuatKhoById(phieu._id))
            .unwrap()
            .then((res) => setFullPhieu(res.data || res))
            .catch(() => setFullPhieu(phieu))
            .finally(() => setLoading(false));
    }, [phieu?._id, dispatch]);

    function handleClose() {
        dispatch(clearSelectedXuat());
        onClose();
    }

    // "Chưa xuất" → "Đã xuất" (triggers stock deduction on backend)
    async function handleConfirmXuat() {
        if (!fullPhieu) return;
        setConfirmingXuat(true);
        try {
            await dispatch(
                updatePhieuXuatKho({ id: fullPhieu._id, trangThai: "Đã xuất" })
            ).unwrap();
            // Re-fetch để lấy dữ liệu đầy đủ (populate vật liệu)
            const res = await dispatch(fetchPhieuXuatKhoById(fullPhieu._id)).unwrap();
            setFullPhieu(res.data || res);
            toast.success("Đã xác nhận xuất kho — tồn kho đã cập nhật");
            onUpdated?.();
        } catch (err) {
            toast.error(err?.message || "Xác nhận xuất thất bại");
        } finally {
            setConfirmingXuat(false);
        }
    }

    async function handleConfirmDelete() {
        try {
            await dispatch(deletePhieuXuatKho(fullPhieu._id)).unwrap();
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
            dispatch(fetchPhieuXuatKhoById(fullPhieu._id))
                .unwrap()
                .then((res) => setFullPhieu(res.data || res))
                .catch(() => { });
        }
        onUpdated?.();
    }

    if (!phieu) return null;

    const isLocked = fullPhieu?.trangThai === "Đã xuất" && user?.quyenSuDung?.ten !== "Admin";

    return (
        <>
            <div
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 sm:p-4"
                onClick={handleClose}
            >
                <div
                    className="w-full sm:max-w-5xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col bg-white rounded-t-lg sm:rounded-lg shadow-xl overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 shrink-0 bg-green-500">
                        <h3 className="font-semibold text-white text-sm sm:text-base pr-2 truncate">
                            {fullPhieu?.soPhieu || phieu?.soPhieu || "Phiếu xuất kho"}
                        </h3>
                        <div className="flex items-center gap-1 text-white shrink-0">
                            <button
                                onClick={() => {
                                    if (isLocked) {
                                        toast.error("Phiếu đã xuất, không thể chỉnh sửa");
                                        return;
                                    }
                                    setShowEditModal(true);
                                }}
                                title={isLocked ? "Phiếu đã xuất kho" : "Sửa phiếu"}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isLocked
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-green-600"
                                    }`}
                            >
                                <EditIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                                onClick={() => {
                                    if (isLocked) {
                                        toast.error("Phiếu đã xuất, không thể xóa");
                                        return;
                                    }
                                    setShowDeleteConfirm(true);
                                }}
                                title={isLocked ? "Không thể xóa phiếu đã xuất" : "Xóa phiếu"}
                                className={`w-8 h-8 flex items-center justify-center rounded-full transition ${isLocked
                                    ? "opacity-40 cursor-not-allowed"
                                    : "hover:bg-green-600"
                                    }`}
                            >
                                <DeleteIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                                onClick={() => navigate(`/kho/phieu-xuat/${fullPhieu?._id || phieu?._id}/print`)}
                                title="In phiếu"
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-green-600 transition"
                            >
                                <LocalPrintshopIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white hover:bg-green-600 rounded-full text-xl leading-none"
                                aria-label="Đóng"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-32 text-base text-gray-400">
                                Đang tải...
                            </div>
                        ) : fullPhieu ? (
                            <div className="p-4 flex flex-col gap-5">
                                {/* Meta info */}
                                <div className="flex flex-col gap-2 bg-gray-100 p-3">
                                    <div className="flex items-center gap-2 text-base">
                                        <span className="text-gray-500 w-28 shrink-0">Trạng thái:</span>
                                        <span
                                            className={`text-base text-white font-medium px-2.5 py-0.5 ${isLocked ? "bg-green-500" : "bg-yellow-500"
                                                }`}
                                        >
                                            {fullPhieu.trangThai}
                                        </span>
                                    </div>
                                    <InfoRow label="Ngày tạo" value={formatNgay(fullPhieu.ngayTao)} />
                                    <InfoRow label="Bộ phận" value={fullPhieu.boPhan} />
                                    <InfoRow label="Nhân viên" value={fullPhieu.nhanVien} />
                                    {fullPhieu.ghiChu && (
                                        <InfoRow label="Ghi chú" value={fullPhieu.ghiChu} />
                                    )}
                                </div>

                                {/* Danh sách vật liệu */}
                                <div>
                                    <h3 className="text-base font-semibold text-gray-600 mb-2">
                                        Danh sách vật liệu ({fullPhieu.danhSachVatLieu?.length || 0})
                                    </h3>
                                    <div className="border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs sm:text-base whitespace-nowrap sm:whitespace-normal">
                                                <thead>
                                                    <tr className="bg-green-100">
                                                        <th className="text-left py-1 px-2 font-normal text-gray-700">Vật liệu</th>
                                                        <th className="text-left py-1 px-2 font-normal text-gray-700">ĐVT</th>
                                                        <th className="text-right py-1 px-2 font-normal text-gray-700">Số lượng</th>
                                                        {fullPhieu.danhSachVatLieu?.some((i) => i.moTa) && (
                                                            <th className="text-left py-1 px-2 font-normal text-gray-700">Ghi chú</th>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(fullPhieu.danhSachVatLieu || []).map((item, i) => (
                                                        <tr
                                                            key={i}
                                                            className={`border-t border-gray-100 ${i % 2 === 1 ? "bg-gray-50" : "bg-white"}`}
                                                        >
                                                            <td
                                                                className="py-1 px-2"
                                                                title={item.vatLieu?.tenVatLieu || "—"}
                                                            >
                                                                {item.vatLieu?.tenVatLieu || "—"}
                                                            </td>
                                                            <td className="py-1 px-2 w-10 md:max-w-36 truncate"
                                                                title={item.vatLieu?.donViTinh || "—"}
                                                            >
                                                                {item.vatLieu?.donViTinh || "—"}
                                                            </td>
                                                            <td className="py-1 px-2 text-right w-10 md:w-32"
                                                                title={item.soLuong}
                                                            >
                                                                {item.soLuong}
                                                            </td>
                                                            {fullPhieu.danhSachVatLieu?.some((i) => i.moTa) && (
                                                                <td className="py-1 px-2"
                                                                    title={item.moTa || ""}
                                                                >
                                                                    {item.moTa || ""}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-green-100 border-t border-gray-200">
                                                        <td className="py-1 px-2 font-normal text-gray-700" colSpan={2}>Tổng</td>
                                                        <td className="py-1 px-2 text-right font-medium">
                                                            {(fullPhieu.danhSachVatLieu || []).reduce(
                                                                (s, i) => s + (i.soLuong || 0),
                                                                0
                                                            )}
                                                        </td>
                                                        {fullPhieu.danhSachVatLieu?.some((i) => i.moTa) && <td />}
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button */}
                                {isLocked ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 border border-green-200 text-base text-green-700">
                                        <LockIcon sx={{ fontSize: 16 }} />
                                        Đã xuất kho
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConfirmXuat}
                                        disabled={confirmingXuat}
                                        className="w-full py-2.5 rounded-lg text-base font-medium bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-60"
                                    >
                                        {confirmingXuat ? "Đang xử lý..." : "Xác nhận xuất kho"}
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
                            <p className="text-base text-gray-500 text-center">
                                Thao tác này không thể hoàn tác.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-5 py-2 rounded-lg border border-gray-300 text-base text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-5 py-2 rounded-lg bg-red-500 text-white text-base font-medium hover:bg-red-600 transition"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit modal (stacked above this modal) */}
            {showEditModal && fullPhieu && (
                <XuatKhoModal
                    open={showEditModal}
                    onClose={handleEditClose}
                    editData={fullPhieu}
                />
            )}
        </>
    );
}