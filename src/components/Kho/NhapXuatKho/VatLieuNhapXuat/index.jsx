import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import {
  fetchAllPhieuNhapKho,
} from "../../../../redux/slices/phieuNhapKhoSlice";
import {
  fetchAllPhieuXuatKho,
  fetchXuatKhoOptions,
} from "../../../../redux/slices/phieuXuatKhoSlice";
import {
  fetchNhaCungCap,
  setNhapXuatFilters,
  resetNhapXuatFilters,
} from "../../../../redux/slices/khoSlice";

import VatLieuFilterToolbar from "./VatLieuFilterToolbar";
import VatLieuNhapTable from "./VatLieuNhapTable";
import VatLieuXuatTable from "./VatLieuXuatTable";
import {
  scrollbarStyle,
  monthToDateRange,
  aggregateVatLieu,
} from "./constants";

export default function VatLieuNhapXuat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [printSelection, setPrintSelection] = useState({
    vatLieuNhap: true,
    vatLieuXuat: true,
  });

  function handleTogglePrintSelection(key) {
    setPrintSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handlePrintConfirm() {
    const pages = Object.entries(printSelection)
      .filter(([, checked]) => checked)
      .map(([key]) => key);

    if (pages.length === 0) return;

    const params = new URLSearchParams();
    if (selectedMonth) params.set("thang", selectedMonth);
    if (selectedNCC) params.set("ncc", selectedNCC);
    if (selectedBoPhan) params.set("boPhan", selectedBoPhan);
    if (selectedTrangThai.length) params.set("trangThai", selectedTrangThai.join(","));
    params.set("pages", pages.join(","));

    navigate(`/nhap-xuat/in-danh-sach?${params.toString()}`)

    // reset lựa chọn sau khi điều hướng
    setPrintSelection({ vatLieuNhap: false, vatLieuXuat: false });
  }

  const { phieuNhapKhos } = useSelector((state) => state.phieuNhapKho);
  const { phieuXuatKhos, boPhanList, nhanVienList } = useSelector(
    (state) => state.phieuXuatKho
  );
  const { nhaCungCap: nhaCungCapList, nhapXuatFilters } = useSelector(
    (state) => state.kho
  );

  // Lấy các bộ lọc từ Redux
  const {
    selectedMonth,
    selectedNCC,
    selectedBoPhan,
    selectedNhanVien,
    selectedTenVatLieu,
    selectedTrangThai,
  } = nhapXuatFilters;

  // Wrapper set filter qua Redux
  const setSelectedMonth = (val) =>
    dispatch(setNhapXuatFilters({ selectedMonth: val }));
  const setSelectedNCC = (val) =>
    dispatch(setNhapXuatFilters({ selectedNCC: val }));
  const setSelectedBoPhan = (val) =>
    dispatch(setNhapXuatFilters({ selectedBoPhan: val }));
  const setSelectedNhanVien = (val) =>
    dispatch(setNhapXuatFilters({ selectedNhanVien: val }));
  const setSelectedTenVatLieu = (val) =>
    dispatch(setNhapXuatFilters({ selectedTenVatLieu: val }));
  const toggleSelectedTrangThai = (val) =>
    dispatch(setNhapXuatFilters({
      selectedTrangThai: selectedTrangThai.includes(val)
        ? selectedTrangThai.filter((t) => t !== val)
        : [...selectedTrangThai, val],
    }));

  const [selectedVatLieuNhap, setSelectedVatLieuNhap] = useState(null); // { id, tenVatLieu }
  const [selectedVatLieuXuat, setSelectedVatLieuXuat] = useState(null);

  function handleVatLieuNhapClick(row) {
    setSelectedVatLieuNhap((prev) => (prev?.id === row.id ? null : row));
  }

  function handleVatLieuXuatClick(row) {
    setSelectedVatLieuXuat((prev) => (prev?.id === row.id ? null : row));
  }

  function handleClearFilter() {
    dispatch(resetNhapXuatFilters());
  }

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
      ...(selectedTenVatLieu ? { tenVatLieu: selectedTenVatLieu } : {}),
      ...(nhapVals.length ? { trangThaiNhap: nhapVals.join(",") } : {}),
      ...(toanVals.length ? { trangThaiThanhToan: toanVals.join(",") } : {}),
      ...(vatVals.length === 1 ? { VAT: vatVals[0] === "Có VAT" } : {}),
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
      ...(selectedTenVatLieu ? { tenVatLieu: selectedTenVatLieu } : {}),
      ...(xuatTrangThai.length ? { trangThai: xuatTrangThai.join(",") } : {}),
    };
  }

  // Fetch danh sách NCC & options bộ phận/nhân viên khi mount
  useEffect(() => {
    dispatch(fetchNhaCungCap());
    dispatch(fetchXuatKhoOptions());
  }, [dispatch]);

  // Fetch lại từ đầu khi bộ lọc thay đổi
  useEffect(() => {
    dispatch(fetchAllPhieuNhapKho(buildNhapParams(1)));
    dispatch(fetchAllPhieuXuatKho(buildXuatParams(1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedMonth,
    selectedNCC,
    selectedBoPhan,
    selectedNhanVien,
    selectedTenVatLieu,
    selectedTrangThai,
  ]);

  const vatLieuNhap = useMemo(
    () => aggregateVatLieu(phieuNhapKhos),
    [phieuNhapKhos]
  );

  const vatLieuXuat = useMemo(
    () => aggregateVatLieu(phieuXuatKhos),
    [phieuXuatKhos]
  );

  const nccOptions = useMemo(
    () => nhaCungCapList.map((n) => n.ten),
    [nhaCungCapList]
  );

  return (
    <div className="mt-6">
      <style>{scrollbarStyle}</style>

      <div className="mb-3">
        <VatLieuFilterToolbar
          selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth}
          selectedNCC={selectedNCC} setSelectedNCC={setSelectedNCC}
          selectedBoPhan={selectedBoPhan} setSelectedBoPhan={setSelectedBoPhan}
          selectedNhanVien={selectedNhanVien} setSelectedNhanVien={setSelectedNhanVien}
          selectedTenVatLieu={selectedTenVatLieu} setSelectedTenVatLieu={setSelectedTenVatLieu}
          selectedTrangThai={selectedTrangThai} onToggleTrangThai={toggleSelectedTrangThai}
          nccOptions={nccOptions}
          boPhanList={boPhanList}
          nhanVienList={nhanVienList}
          onClearFilter={handleClearFilter}
          printSelection={printSelection}
          onTogglePrintSelection={handleTogglePrintSelection}
          onPrintConfirm={handlePrintConfirm}
        />
      </div>

      <div className="flex flex-col md:flex-row w-full">
        <div className="flex-1">
          <p className="py-2 font-medium text-center bg-white border border-gray-200">
            Vật liệu nhập
          </p>
          <VatLieuNhapTable
            data={vatLieuNhap}
            selectedId={selectedVatLieuNhap?.id}
            onRowClick={handleVatLieuNhapClick}
          />
        </div>

        <div className="flex-1">
          <p className="py-2 font-medium text-center bg-white border border-gray-200">
            Vật liệu xuất
          </p>
          <VatLieuXuatTable
            data={vatLieuXuat}
            selectedId={selectedVatLieuXuat?.id}
            onRowClick={handleVatLieuXuatClick}
          />
        </div>
      </div>
    </div>
  );
}