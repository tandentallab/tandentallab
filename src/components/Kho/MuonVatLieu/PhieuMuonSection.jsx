import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";

import { fetchAllPhieuMuonVatLieu } from "../../../redux/slices/phieuMuonVatLieuSlice";

import PhieuMuonModal from "./PhieuMuonModal";
import PhieuMuonDetailPanel from "./PhieuMuonDetailPanel";
import PhieuMuonTable from "./PhieuMuonTable";

import {
    scrollbarStyle,
} from "../NhapXuatKho/NhapXuatTable/constants";

export default function PhieuMuonSection() {
    const dispatch = useDispatch();
    const { list, loading } = useSelector((state) => state.phieuMuonVatLieu);

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedPhieu, setSelectedPhieu] = useState(null);

    useEffect(() => {
        dispatch(fetchAllPhieuMuonVatLieu());
    }, [dispatch]);

    const dsMuon = useMemo(() => list.filter((p) => p.loai === "Mượn"), [list]);
    const dsChoMuon = useMemo(() => list.filter((p) => p.loai === "Cho mượn"), [list]);

    function handleRowClick(row) {
        setSelectedPhieu((prev) => (prev?._id === row._id ? null : row));
    }

    function handleRefresh() {
        dispatch(fetchAllPhieuMuonVatLieu());
    }

    function openCreate() {
        setEditData(null);
        setShowModal(true);
    }

    function handleModalClose() {
        setShowModal(false);
        setEditData(null);
        handleRefresh();
    }

    return (
        <div className="mt-6">
            <style>{scrollbarStyle}</style>

            <div className="mb-3 flex justify-between items-center">
                <div>
                    {/* lọc - tìm kiếm */}
                </div>
                <div className="flex items-center gap-2">
                    <button title="Tải lại" onClick={handleRefresh} disabled={loading}
                        className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition disabled:opacity-50">
                        <div className={loading ? "animate-spin" : ""}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </div>
                    </button>
                    <button title="Tạo phiếu mượn" onClick={openCreate}
                        className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition">
                        <AddIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>

            <div className="flex divide-x-2 divide-gray-200">
                <PhieuMuonTable
                    data={dsMuon}
                    loai="Mượn"
                    loading={loading}
                    selectedId={selectedPhieu?._id}
                    onRowClick={handleRowClick}
                />

                <PhieuMuonTable
                    data={dsChoMuon}
                    loai="Cho mượn"
                    loading={loading}
                    selectedId={selectedPhieu?._id}
                    onRowClick={handleRowClick}
                />
            </div>

            <PhieuMuonModal
                open={showModal}
                onClose={handleModalClose}
                editData={editData}
            />

            <PhieuMuonDetailPanel
                phieu={selectedPhieu}
                onClose={() => setSelectedPhieu(null)}
                onUpdated={handleRefresh}
            />
        </div>
    );
}