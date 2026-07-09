import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";

import {
    fetchAllPhieuMuonVatLieu,
    updatePhieuMuonVatLieu,
    deletePhieuMuonVatLieu,
} from "../../../redux/slices/phieuMuonVatLieuSlice";

import PhieuMuonModal from "./PhieuMuonModal";
import PhieuMuonDetailPanel from "./PhieuMuonDetailPanel";
import PhieuMuonTable from "./PhieuMuonTable";

export default function PhieuMuonSection() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { list, loading } = useSelector((state) => state.phieuMuonVatLieu);

    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalLoai, setModalLoai] = useState("Mượn");
    const [editData, setEditData] = useState(null);
    const [selectedPhieu, setSelectedPhieu] = useState(null);
    const addMenuRef = useRef(null);

    useEffect(() => {
        dispatch(fetchAllPhieuMuonVatLieu());
    }, [dispatch]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (addMenuRef.current && !addMenuRef.current.contains(e.target)) setAddMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dsMuon = useMemo(() => list.filter((p) => p.loai === "Mượn"), [list]);
    const dsChoMuon = useMemo(() => list.filter((p) => p.loai === "Cho mượn"), [list]);

    function handleRowClick(row) {
        setSelectedPhieu((prev) => (prev?._id === row._id ? null : row));
    }

    function handleRefresh() {
        dispatch(fetchAllPhieuMuonVatLieu());
    }

    function openCreate(loai) {
        setModalLoai(loai);
        setEditData(null);
        setShowModal(true);
        setAddMenuOpen(false);
    }

    function openEdit(row) {
        setModalLoai(row.loai);
        setEditData(row);
        setShowModal(true);
    }

    function handleModalClose() {
        setShowModal(false);
        setEditData(null);
        handleRefresh();
    }

    async function handleXacNhanNhan(row) {
        const msg = row.loai === "Mượn"
            ? "Xác nhận đã nhận vật liệu về kho?"
            : "Xác nhận đã giao vật liệu cho đối tác?";
        if (!window.confirm(msg)) return;
        try {
            await dispatch(updatePhieuMuonVatLieu({
                id: row._id,
                trangThaiNhan: "Đã nhận",
                currentRole: user?.quyenSuDung?.ten,
            })).unwrap();
            toast.success("Đã cập nhật trạng thái");
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    }

    async function handleXacNhanTra(row) {
        const msg = row.loai === "Mượn"
            ? "Xác nhận đã trả vật liệu lại cho đối tác?"
            : "Xác nhận đối tác đã trả vật liệu?";
        if (!window.confirm(msg)) return;
        try {
            await dispatch(updatePhieuMuonVatLieu({
                id: row._id,
                trangThaiTra: "Đã trả",
                currentRole: user?.quyenSuDung?.ten,
            })).unwrap();
            toast.success("Đã cập nhật trạng thái");
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    }

    async function handleDelete(row) {
        if (!window.confirm("Xóa phiếu này? Hành động không thể hoàn tác.")) return;
        try {
            await dispatch(deletePhieuMuonVatLieu(row._id)).unwrap();
            if (selectedPhieu?._id === row._id) setSelectedPhieu(null);
            toast.success("Đã xóa phiếu");
        } catch (err) {
            alert("Lỗi: " + (err?.message || err));
        }
    }

    return (
        <div className="mt-6">
            <div className="mb-3 flex justify-between items-center">
                <h2 className="font-medium text-gray-700">Mượn / Cho mượn vật liệu</h2>
                <div className="flex items-center gap-2">
                    <button title="Tải lại" onClick={handleRefresh} disabled={loading}
                        className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition disabled:opacity-50">
                        <div className={loading ? "animate-spin" : ""}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </div>
                    </button>
                    <div ref={addMenuRef} className="relative">
                        <button title="Tạo phiếu mượn" onClick={() => setAddMenuOpen((o) => !o)}
                            className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition">
                            <AddIcon sx={{ fontSize: 18 }} />
                        </button>
                        {addMenuOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                                <button onClick={() => openCreate("Mượn")}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition">
                                    Phiếu mượn
                                </button>
                                <button onClick={() => openCreate("Cho mượn")}
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition">
                                    Phiếu cho mượn
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="mb-2 text-sm font-medium text-sky-700">Phiếu mượn (mượn của đối tác)</p>
            <PhieuMuonTable
                data={dsMuon}
                loai="Mượn"
                loading={loading}
                selectedId={selectedPhieu?._id}
                onRowClick={handleRowClick}
                onXacNhanNhan={handleXacNhanNhan}
                onXacNhanTra={handleXacNhanTra}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            <p className="mt-6 mb-2 text-sm font-medium text-green-700">Phiếu cho mượn (đối tác mượn của mình)</p>
            <PhieuMuonTable
                data={dsChoMuon}
                loai="Cho mượn"
                loading={loading}
                selectedId={selectedPhieu?._id}
                onRowClick={handleRowClick}
                onXacNhanNhan={handleXacNhanNhan}
                onXacNhanTra={handleXacNhanTra}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            <PhieuMuonModal
                open={showModal}
                onClose={handleModalClose}
                editData={editData}
                loai={modalLoai}
            />

            <PhieuMuonDetailPanel
                phieu={selectedPhieu}
                onClose={() => setSelectedPhieu(null)}
                onUpdated={handleRefresh}
            />
        </div>
    );
}