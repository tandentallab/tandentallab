import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllPhieuNhapKho,
  appendPhieuNhapKho,
  clearSelected,
} from "../../../../redux/slices/phieuNhapKhoSlice";
import {
  fetchAllPhieuXuatKho,
  appendPhieuXuatKho,
  clearSelectedXuat,
  fetchXuatKhoOptions,
} from "../../../../redux/slices/phieuXuatKhoSlice";
import {
  fetchNhaCungCap,
  fetchVatLieu,
  setNhapXuatFilters,
  resetNhapXuatFilters,
} from "../../../../redux/slices/khoSlice";

import NhapKhoModal from "../NhapKhoModal";
import XuatKhoModal from "../XuatKhoModal";
import NhapKhoDetailPanel from "../NhapKhoDetailPanel";
import XuatKhoDetailPanel from "../XuatKhoDetailPanel";

import FilterToolbar from "./FilterToolbar";
import PhieuNhapTable from "./PhieuNhapTable";
import PhieuXuatTable from "./PhieuXuatTable";
import VatLieuNhapTable from "./VatLieuNhapTable";
import VatLieuXuatTable from "./VatLieuXuatTable";
import {
  scrollbarStyle,
  monthToDateRange,
  aggregateVatLieu,
} from "./constants";
import { exportPhieuNhapXuatToExcel } from "./exportPhieuNhapXuatToExcel";

export default function NhapXuatTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    phieuNhapKhos,
    loading: loadingNhap,
    loadingMore: loadingMoreNhap,
    hasMore: nhapHasMore,
  } = useSelector((state) => state.phieuNhapKho);
  const {
    phieuXuatKhos,
    loading: loadingXuat,
    loadingMore: loadingMoreXuat,
    hasMore: xuatHasMore,
    boPhanList,
  } = useSelector((state) => state.phieuXuatKho);
  const { nhaCungCap: nhaCungCapList, nhapXuatFilters } = useSelector(
    (state) => state.kho
  );

  // Lấy các bộ lọc từ Redux thay vì useState cục bộ
  const { selectedMonth, selectedNCC, selectedBoPhan, selectedTrangThai } =
    nhapXuatFilters;

  // Các hàm wrapper để set giá trị thông qua Redux
  const setSelectedMonth = (val) =>
    dispatch(setNhapXuatFilters({ selectedMonth: val }));
  const setSelectedNCC = (val) =>
    dispatch(setNhapXuatFilters({ selectedNCC: val }));
  const setSelectedBoPhan = (val) =>
    dispatch(setNhapXuatFilters({ selectedBoPhan: val }));

  // ── Pagination pages ──
  const [pageNhap, setPageNhap] = useState(1);
  const [pageXuat, setPageXuat] = useState(1);

  // ── Modal & panel ──
  const [showNhapModal, setShowNhapModal] = useState(false);
  const [showXuatModal, setShowXuatModal] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [printSelection, setPrintSelection] = useState({
    phieuNhap: true,
    phieuXuat: true,
    vatLieuNhap: false,
    vatLieuXuat: false,
  });
  const [selectedNhap, setSelectedNhap] = useState(null);
  const [selectedXuat, setSelectedXuat] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedVatLieuNhap, setSelectedVatLieuNhap] = useState(null); // { id, tenVatLieu }
  const [selectedVatLieuXuat, setSelectedVatLieuXuat] = useState(null);

  function handleVatLieuNhapClick(row) {
    setSelectedVatLieuNhap((prev) => (prev?.id === row.id ? null : row));
  }

  function handleVatLieuXuatClick(row) {
    setSelectedVatLieuXuat((prev) => (prev?.id === row.id ? null : row));
  }

  function togglePrintSelection(key) {
    setPrintSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePrintList() {
    const pages = Object.entries(printSelection)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    if (pages.length === 0) return; // chưa chọn gì thì không làm gì

    const params = new URLSearchParams();
    if (selectedMonth) params.set("thang", selectedMonth);
    if (selectedNCC) params.set("ncc", selectedNCC);
    if (selectedBoPhan) params.set("boPhan", selectedBoPhan);
    if (selectedTrangThai.length) params.set("trangThai", selectedTrangThai.join(","));
    params.set("pages", pages.join(","));

    navigate(`/nhap-xuat/in-danh-sach?${params.toString()}`)
    setPrintMenuOpen(false);
  }

  const isFiltered =
    selectedNCC !== "" ||
    selectedMonth !== "" ||
    selectedBoPhan !== "" ||
    selectedTrangThai.length > 0;
  const isLoading = loadingNhap || loadingXuat;

  // Helpers — xây dựng params cho từng API
  function buildNhapParams(page = 1) {
    const dateRange = monthToDateRange(selectedMonth);
    const nhapVals = selectedTrangThai.filter((t) =>
      ["Chưa nhận", "Đã nhận"].includes(t)
    );
    const toanVals = selectedTrangThai.filter((t) =>
      ["Chưa thanh toán", "Đã thanh toán"].includes(t)
    );
    return {
      limit: 20,
      page,
      ...dateRange,
      ...(selectedNCC ? { nhaCungCap: selectedNCC } : {}),
      ...(nhapVals.length ? { trangThaiNhap: nhapVals.join(",") } : {}),
      ...(toanVals.length ? { trangThaiThanhToan: toanVals.join(",") } : {}),
    };
  }

  function buildXuatParams(page = 1) {
    const dateRange = monthToDateRange(selectedMonth);
    const xuatTrangThai = selectedTrangThai.filter((t) =>
      ["Chưa xuất", "Đã xuất"].includes(t)
    );
    return {
      limit: 20,
      page,
      ...dateRange,
      ...(selectedBoPhan ? { boPhan: selectedBoPhan } : {}),
      ...(xuatTrangThai.length ? { trangThai: xuatTrangThai.join(",") } : {}),
    };
  }

  // Fetch danh sách NCC & options xuất kho khi mount
  useEffect(() => {
    dispatch(fetchNhaCungCap());
    dispatch(fetchXuatKhoOptions());
  }, [dispatch]);

  // Fetch lại từ đầu khi bộ lọc thay đổi
  useEffect(() => {
    setPageNhap(1);
    setPageXuat(1);
    dispatch(fetchAllPhieuNhapKho(buildNhapParams(1)));
    dispatch(fetchAllPhieuXuatKho(buildXuatParams(1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedNCC, selectedBoPhan, selectedTrangThai]);

  function handleToggleTrangThai(value) {
    const nextTrangThai = selectedTrangThai.includes(value)
      ? selectedTrangThai.filter((v) => v !== value)
      : [...selectedTrangThai, value];
    dispatch(setNhapXuatFilters({ selectedTrangThai: nextTrangThai }));
  }

  function handleClearFilter() {
    dispatch(resetNhapXuatFilters());
  }

  function handleRefresh() {
    setPageNhap(1);
    setPageXuat(1);
    dispatch(fetchAllPhieuNhapKho(buildNhapParams(1)));
    dispatch(fetchAllPhieuXuatKho(buildXuatParams(1)));
    dispatch(fetchVatLieu());
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportPhieuNhapXuatToExcel(buildNhapParams(), buildXuatParams(), {
        selectedMonth,
        selectedNCC,
        selectedBoPhan,
        selectedTrangThai,
      });
    } catch (err) {
      console.error("Export lỗi:", err);
    } finally {
      setIsExporting(false);
    }
  }

  const handleLoadMoreNhap = useCallback(() => {
    const next = pageNhap + 1;
    setPageNhap(next);
    dispatch(appendPhieuNhapKho(buildNhapParams(next)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNhap, selectedMonth, selectedNCC, selectedTrangThai, dispatch]);

  const handleLoadMoreXuat = useCallback(() => {
    const next = pageXuat + 1;
    setPageXuat(next);
    dispatch(appendPhieuXuatKho(buildXuatParams(next)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageXuat, selectedMonth, selectedBoPhan, selectedTrangThai, dispatch]);

  function handleNhapModalClose() {
    setShowNhapModal(false);
    dispatch(clearSelected());
    handleRefresh();
  }

  function handleXuatModalClose() {
    setShowXuatModal(false);
    dispatch(clearSelectedXuat());
    dispatch(fetchXuatKhoOptions());
    handleRefresh();
  }

  function handleNhapRowClick(row) {
    setSelectedXuat(null);
    setSelectedNhap((prev) => (prev?._id === row._id ? null : row));
  }

  function handleXuatRowClick(row) {
    setSelectedNhap(null);
    setSelectedXuat((prev) => (prev?._id === row._id ? null : row));
  }

  const vatLieuNhap = useMemo(
    () => aggregateVatLieu(phieuNhapKhos),
    [phieuNhapKhos]
  );

  const vatLieuXuat = useMemo(
    () => aggregateVatLieu(phieuXuatKhos),
    [phieuXuatKhos]
  );

  const filteredPhieuNhapKhos = useMemo(() => {
    if (!selectedVatLieuNhap) return phieuNhapKhos;
    return phieuNhapKhos.filter((p) =>
      (p.danhSachVatLieu || []).some(
        (item) => (item.vatLieu?._id || item.vatLieu?.tenVatLieu) === selectedVatLieuNhap.id
      )
    );
  }, [phieuNhapKhos, selectedVatLieuNhap]);

  const filteredPhieuXuatKhos = useMemo(() => {
    if (!selectedVatLieuXuat) return phieuXuatKhos;
    return phieuXuatKhos.filter((p) =>
      (p.danhSachVatLieu || []).some(
        (item) => (item.vatLieu?._id || item.vatLieu?.tenVatLieu) === selectedVatLieuXuat.id
      )
    );
  }, [phieuXuatKhos, selectedVatLieuXuat]);

  const nccOptions = useMemo(
    () => nhaCungCapList.map((n) => n.ten),
    [nhaCungCapList]
  );

  return (
    <div>
      <style>{scrollbarStyle}</style>

      <FilterToolbar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedNCC={selectedNCC}
        setSelectedNCC={setSelectedNCC}
        selectedBoPhan={selectedBoPhan}
        setSelectedBoPhan={setSelectedBoPhan}
        selectedTrangThai={selectedTrangThai}
        onToggleTrangThai={handleToggleTrangThai}
        nccOptions={nccOptions}
        boPhanList={boPhanList}
        isFiltered={isFiltered}
        onClearFilter={handleClearFilter}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        isExporting={isExporting}
        printMenuOpen={printMenuOpen}
        setPrintMenuOpen={setPrintMenuOpen}
        printSelection={printSelection}
        onTogglePrintSelection={togglePrintSelection}
        onPrintConfirm={handlePrintList}
        onOpenNhapModal={() => setShowNhapModal(true)}
        onOpenXuatModal={() => setShowXuatModal(true)}
        addMenuOpen={addMenuOpen}
        setAddMenuOpen={setAddMenuOpen}
      />

      <p className="hidden md:block mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
        Phiếu nhập/xuất
      </p>
      <p className="block md:hidden mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
        Phiếu nhập
      </p>
      <div className="flex flex-col md:flex-row w-full">
        <div className="flex-1 min-w-0">
          {selectedVatLieuNhap && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs px-3 py-1.5">
              Đang lọc theo vật liệu: <span className="font-medium">{selectedVatLieuNhap.tenVatLieu}</span>
              <button
                onClick={() => setSelectedVatLieuNhap(null)}
                className="ml-auto text-sky-500 hover:text-sky-700"
              >
                ✕
              </button>
            </div>
          )}
          <PhieuNhapTable
            data={filteredPhieuNhapKhos}
            selectedId={selectedNhap?._id}
            onRowClick={handleNhapRowClick}
            hasMore={!selectedVatLieuNhap && nhapHasMore}
            loadingMore={loadingMoreNhap}
            onLoadMore={handleLoadMoreNhap}
          />
        </div>
        <div className="w-px bg-gray-300 self-stretch" />
        <p className="block md:hidden mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
          Phiếu xuất
        </p>
        <div className="flex-1 min-w-0">
          {selectedVatLieuXuat && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5">
              Đang lọc theo vật liệu: <span className="font-medium">{selectedVatLieuXuat.tenVatLieu}</span>
              <button
                onClick={() => setSelectedVatLieuXuat(null)}
                className="ml-auto text-green-500 hover:text-green-700"
              >
                ✕
              </button>
            </div>
          )}
          <PhieuXuatTable
            data={filteredPhieuXuatKhos}
            selectedId={selectedXuat?._id}
            onRowClick={handleXuatRowClick}
            hasMore={!selectedVatLieuXuat && xuatHasMore}
            loadingMore={loadingMoreXuat}
            onLoadMore={handleLoadMoreXuat}
          />
        </div>
      </div>

      <p className="hidden md:block mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
        Vật liệu
      </p>
      <p className="block md:hidden mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
        Vật liệu nhập
      </p>
      <div className="flex flex-col md:flex-row w-full">
        <VatLieuNhapTable
          data={vatLieuNhap}
          selectedId={selectedVatLieuNhap?.id}
          onRowClick={handleVatLieuNhapClick}
        />
        <div className="w-px bg-gray-300 self-stretch" />
        <p className="block md:hidden mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
          Vật liệu xuất
        </p>
        <VatLieuXuatTable
          data={vatLieuXuat}
          selectedId={selectedVatLieuXuat?.id}
          onRowClick={handleVatLieuXuatClick}
        />
      </div>

      {/* Modals tạo mới */}
      <NhapKhoModal
        open={showNhapModal}
        onClose={handleNhapModalClose}
        editData={null}
      />
      <XuatKhoModal
        open={showXuatModal}
        onClose={handleXuatModalClose}
        editData={null}
      />

      {/* Detail panels */}
      <NhapKhoDetailPanel
        phieu={selectedNhap}
        onClose={() => setSelectedNhap(null)}
        onUpdated={handleRefresh}
      />
      <XuatKhoDetailPanel
        phieu={selectedXuat}
        onClose={() => setSelectedXuat(null)}
        onUpdated={handleRefresh}
      />
    </div>
  );
}
