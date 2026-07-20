import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo, useCallback } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";

import { fetchAllPhieuMuonVatLieu, resetLoai } from "../../../redux/slices/phieuMuonVatLieuSlice";

import PhieuMuonModal from "./PhieuMuonModal";
import PhieuMuonDetailPanel from "./PhieuMuonDetailPanel";
import PhieuMuonTable from "./PhieuMuonTable";
import PhieuMuonFilterToolbar from "./PhieuMuonFilterToolbar";

import { scrollbarStyle } from "../NhapXuatKho/NhapXuatTable/constants";

const PAGE_LIMIT = 20;

function getRecentMonths(count = 12) {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        months.push({
            value: `${year}-${String(month).padStart(2, "0")}`,
            label: `Tháng ${month}/${year}`,
            year,
            month,
        });
    }
    return months;
}

function getMonthRange(year, month) {
    const tuNgay = new Date(year, month - 1, 1);
    const denNgay = new Date(year, month, 0);
    const fmt = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };
    return { tuNgay: fmt(tuNgay), denNgay: fmt(denNgay) };
}

const NHAN_TRA_STATUSES = ["Chưa nhận", "Đã nhận", "Chưa trả", "Đã trả"];

export default function PhieuMuonSection() {
    const dispatch = useDispatch();
    const { byLoai } = useSelector((state) => state.phieuMuonVatLieu);
    const muon = byLoai["Mượn"];
    const choMuon = byLoai["Cho mượn"];

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [selectedPhieu, setSelectedPhieu] = useState(null);

    const monthOptions = useMemo(() => getRecentMonths(12), []);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedTrangThai, setSelectedTrangThai] = useState([]);
    const [selectedTimKiem, setSelectedTimKiem] = useState("");

    function toggleTrangThai(s) {
        setSelectedTrangThai((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    }

    function handleClearFilter() {
        setSelectedMonth("");
        setSelectedTrangThai([]);
        setSelectedTimKiem("");
    }

    const buildDateParams = useCallback(() => {
        if (!selectedMonth) return {};
        const opt = monthOptions.find((m) => m.value === selectedMonth);
        if (!opt) return {};
        return getMonthRange(opt.year, opt.month);
    }, [selectedMonth, monthOptions]);

    const buildStatusParams = useCallback(() => {
        const nhanVals = selectedTrangThai.filter((t) =>
            ["Chưa nhận", "Đã nhận"].includes(t)
        );
        const traVals = selectedTrangThai.filter((t) =>
            ["Chưa trả", "Đã trả"].includes(t)
        );
        return {
            ...(nhanVals.length ? { trangThaiNhan: nhanVals.join(",") } : {}),
            ...(traVals.length ? { trangThaiTra: traVals.join(",") } : {}),
        };
    }, [selectedTrangThai]);

    const fetchPage = useCallback((loai, page) => {
        dispatch(fetchAllPhieuMuonVatLieu({
            loai,
            page,
            limit: PAGE_LIMIT,
            ...buildDateParams(),
            ...buildStatusParams(),
            ...(selectedTimKiem ? { timKiem: selectedTimKiem } : {}),
        }));
    }, [dispatch, buildDateParams, buildStatusParams, selectedTimKiem]);

    // Đổi bộ lọc → reset cả 2 bucket, tải lại trang 1
    useEffect(() => {
        dispatch(resetLoai("Mượn"));
        dispatch(resetLoai("Cho mượn"));
        fetchPage("Mượn", 1);
        fetchPage("Cho mượn", 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMonth, selectedTrangThai, selectedTimKiem]);

    function handleRowClick(row) {
        setSelectedPhieu((prev) => (prev?._id === row._id ? null : row));
    }

    function handleRefresh() {
        dispatch(resetLoai("Mượn"));
        dispatch(resetLoai("Cho mượn"));
        fetchPage("Mượn", 1);
        fetchPage("Cho mượn", 1);
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

    const isLoading = muon.loading || choMuon.loading;

    return (
        <div className="mt-6">
            <style>{scrollbarStyle}</style>

            <div className="mb-3 flex justify-between items-center">
                <PhieuMuonFilterToolbar
                    selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
                    selectedTrangThai={selectedTrangThai} onToggleTrangThai={toggleTrangThai}
                    selectedTimKiem={selectedTimKiem} setSelectedTimKiem={setSelectedTimKiem}
                    monthOptions={monthOptions}
                    onClearFilter={handleClearFilter}
                />
                <div className="flex items-center gap-2">
                    <button title="Tạo phiếu mượn" onClick={openCreate}
                        className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition">
                        <AddIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button title="Tải lại" onClick={() => { handleClearFilter(); handleRefresh(); }} disabled={isLoading}
                        className="text-white rounded-full h-9 w-9 flex items-center justify-center bg-sky-500 shadow hover:bg-sky-600 transition disabled:opacity-50">
                        <div className={isLoading ? "animate-spin" : ""}>
                            <RefreshIcon sx={{ fontSize: 18 }} />
                        </div>
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-0 divide-x-2 divide-gray-200">
                <PhieuMuonTable
                    data={muon.list}
                    loai="Mượn"
                    loading={muon.loading}
                    hasMore={muon.hasMore}
                    loadingMore={muon.loadingMore}
                    onLoadMore={() => fetchPage("Mượn", muon.page + 1)}
                    selectedId={selectedPhieu?._id}
                    onRowClick={handleRowClick}
                />

                <PhieuMuonTable
                    data={choMuon.list}
                    loai="Cho mượn"
                    loading={choMuon.loading}
                    hasMore={choMuon.hasMore}
                    loadingMore={choMuon.loadingMore}
                    onLoadMore={() => fetchPage("Cho mượn", choMuon.page + 1)}
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