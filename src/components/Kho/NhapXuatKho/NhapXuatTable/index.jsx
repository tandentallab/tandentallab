import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllPhieuNhapKho,
  appendPhieuNhapKho,
  clearSelected,
  updatePhieuNhapKho
} from "../../../../redux/slices/phieuNhapKhoSlice";
import {
  fetchAllPhieuXuatKho,
  appendPhieuXuatKho,
  clearSelectedXuat,
  fetchXuatKhoOptions,
} from "../../../../redux/slices/phieuXuatKhoSlice";
import {
  fetchNhaCungCap,
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
import { scrollbarStyle, monthToDateRange } from "./constants";
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
    nhanVienList,
  } = useSelector((state) => state.phieuXuatKho);
  const { nhaCungCap: nhaCungCapList, nhapXuatFilters } = useSelector(
    (state) => state.kho
  );

  // Lấy các bộ lọc từ Redux thay vì useState cục bộ
  const {
    selectedMonth,
    selectedNCC,
    selectedBoPhan,
    selectedNhanVien,
    selectedTimKiem,
    selectedTrangThai,
  } = nhapXuatFilters;

  // Các hàm wrapper để set giá trị thông qua Redux
  const setSelectedMonth = (val) =>
    dispatch(setNhapXuatFilters({ selectedMonth: val }));
  const setSelectedNCC = (val) =>
    dispatch(setNhapXuatFilters({ selectedNCC: val }));
  const setSelectedBoPhan = (val) =>
    dispatch(setNhapXuatFilters({ selectedBoPhan: val }));
  const setSelectedNhanVien = (val) =>
    dispatch(setNhapXuatFilters({ selectedNhanVien: val }));
  const setSelectedTimKiem = (val) =>
    dispatch(setNhapXuatFilters({ selectedTimKiem: val }));

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
    if (selectedNhanVien) params.set("nhanVien", selectedNhanVien);
    if (selectedTimKiem) params.set("timKiem", selectedTimKiem);
    if (selectedTrangThai.length) params.set("trangThai", selectedTrangThai.join(","));
    params.set("pages", pages.join(","));

    navigate(`/nhap-xuat/in-danh-sach?${params.toString()}`)
    setPrintMenuOpen(false);
  }

  const isFiltered =
    selectedNCC !== "" ||
    selectedMonth !== "" ||
    selectedBoPhan !== "" ||
    selectedNhanVien !== "" ||
    selectedTimKiem !== "" ||
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
    const vatVals = selectedTrangThai.filter((t) =>
      ["Có VAT", "Không VAT"].includes(t)
    );
    return {
      limit: 20,
      page,
      ...dateRange,
      ...(selectedNCC ? { nhaCungCap: selectedNCC } : {}),
      ...(selectedTimKiem ? { timKiem: selectedTimKiem } : {}),
      ...(nhapVals.length ? { trangThaiNhap: nhapVals.join(",") } : {}),
      ...(toanVals.length ? { trangThaiThanhToan: toanVals.join(",") } : {}),
      ...(vatVals.length === 1
        ? { VAT: vatVals[0] === "Có VAT" }
        : {}),
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
      ...(selectedNhanVien ? { nhanVien: selectedNhanVien } : {}),
      ...(selectedTimKiem ? { timKiem: selectedTimKiem } : {}),
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
  }, [
    selectedMonth,
    selectedNCC,
    selectedBoPhan,
    selectedNhanVien,
    selectedTimKiem,
    selectedTrangThai,
  ]);

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
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportPhieuNhapXuatToExcel(buildNhapParams(), buildXuatParams(), {
        selectedMonth,
        selectedNCC,
        selectedBoPhan,
        selectedNhanVien,
        selectedTimKiem,
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
  }, [pageNhap, selectedMonth, selectedNCC, selectedTimKiem, selectedTrangThai, dispatch]);

  const handleLoadMoreXuat = useCallback(() => {
    const next = pageXuat + 1;
    setPageXuat(next);
    dispatch(appendPhieuXuatKho(buildXuatParams(next)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageXuat, selectedMonth, selectedBoPhan, selectedNhanVien, selectedTimKiem, selectedTrangThai, dispatch]);

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

  const nccOptions = nhaCungCapList.map((n) => n.ten);

  const handleToggleVAT = (row, checked) => {
    dispatch(updatePhieuNhapKho({ id: row._id, VAT: checked }));
  };

  return (
    <div className="mt-6">
      <style>{scrollbarStyle}</style>

      <FilterToolbar
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedNCC={selectedNCC}
        setSelectedNCC={setSelectedNCC}
        selectedBoPhan={selectedBoPhan}
        setSelectedBoPhan={setSelectedBoPhan}
        selectedNhanVien={selectedNhanVien}
        setSelectedNhanVien={setSelectedNhanVien}
        selectedTimKiem={selectedTimKiem}
        setSelectedTimKiem={setSelectedTimKiem}
        selectedTrangThai={selectedTrangThai}
        onToggleTrangThai={handleToggleTrangThai}
        nccOptions={nccOptions}
        boPhanList={boPhanList}
        nhanVienList={nhanVienList}
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
          <PhieuNhapTable
            data={phieuNhapKhos}
            selectedId={selectedNhap?._id}
            onRowClick={handleNhapRowClick}
            hasMore={nhapHasMore}
            loadingMore={loadingMoreNhap}
            onLoadMore={handleLoadMoreNhap}
            onToggleVAT={handleToggleVAT}
          />
        </div>
        <div className="w-px bg-gray-300 self-stretch" />
        <p className="block md:hidden mt-6 py-2 font-medium text-center bg-white border border-gray-200 border-b-0">
          Phiếu xuất
        </p>
        <div className="flex-1 min-w-0">
          <PhieuXuatTable
            data={phieuXuatKhos}
            selectedId={selectedXuat?._id}
            onRowClick={handleXuatRowClick}
            hasMore={xuatHasMore}
            loadingMore={loadingMoreXuat}
            onLoadMore={handleLoadMoreXuat}
          />
        </div>
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