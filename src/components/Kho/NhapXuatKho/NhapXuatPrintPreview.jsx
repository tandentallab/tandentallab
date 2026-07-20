import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../../config/api";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { monthToDateRange, aggregateVatLieu } from "../NhapXuatKho/NhapXuatTable/constants";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const thStyle = (extra = {}) => ({
    border: "1px solid #aaa",
    padding: "1.5mm 2mm",
    fontWeight: "bold",
    background: "#f2f2f2",
    ...extra,
});

const tdStyle = (extra = {}) => ({
    border: "1px solid #aaa",
    padding: "1.2mm 2mm",
    ...extra,
});

function buildFilterLabel({ thang, ncc, boPhan, trangThai }) {
    const parts = [];
    if (thang) parts.push(`Tháng: ${thang}`);
    if (ncc) parts.push(`NCC: ${ncc}`);
    if (boPhan) parts.push(`Bộ phận: ${boPhan}`);
    if (trangThai) parts.push(`Trạng thái: ${trangThai.split(",").join(", ")}`);
    return parts.length ? parts.join("  |  ") : "Tất cả dữ liệu";
}

function Header({ congTy, title }) {
    return (
        <>
            <div style={{ marginBottom: "2.5mm", display: "flex" }}>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "bold", fontSize: "9pt", textTransform: "uppercase" }}>
                        {congTy?.Ten || ""}
                    </p>
                    <p style={{ margin: "0.5mm 0 0", fontSize: "7.5pt" }}>{congTy?.DiaChi || ""}</p>
                    <p style={{ margin: "0.5mm 0 0", fontSize: "7.5pt" }}>SĐT: {congTy?.DienThoai || ""}</p>
                </div>
            </div>
            <div style={{ textAlign: "center", margin: "2mm 0 3mm" }}>
                <h1 style={{ margin: 0, fontSize: "13pt", fontWeight: "bold", textTransform: "uppercase" }}>
                    {title}
                </h1>
                <div style={{ fontSize: "7.5pt" }}>
                    Ngày xuất: {new Date().toLocaleDateString("vi-VN")}
                </div>
            </div>
        </>
    );
}

function VatLieuTable({ data }) {
    const tongSoLuong = data.reduce((s, r) => s + (r.soLuong || 0), 0);
    return (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
            <thead>
                <tr>
                    <th style={thStyle({ textAlign: "center", width: "8%" })}>STT</th>
                    <th style={thStyle({ width: "52%" })}>Tên vật liệu</th>
                    <th style={thStyle({ width: "20%" })}>ĐVT</th>
                    <th style={thStyle({ textAlign: "right", width: "20%" })}>Số lượng</th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr><td style={tdStyle({ textAlign: "center" })} colSpan={4}>Không có dữ liệu</td></tr>
                ) : data.map((r, i) => (
                    <tr key={r.id || i}>
                        <td style={tdStyle({ textAlign: "center" })}>{i + 1}</td>
                        <td style={tdStyle()}>{r.tenVatLieu}</td>
                        <td style={tdStyle()}>{r.donViTinh}</td>
                        <td style={tdStyle({ textAlign: "right" })}>{r.soLuong}</td>
                    </tr>
                ))}
            </tbody>
            {data.length > 0 && (
                <tfoot>
                    <tr style={{ fontWeight: "bold" }}>
                        <td style={tdStyle({ textAlign: "center" })} colSpan={3}>Tổng</td>
                        <td style={tdStyle({ textAlign: "right" })}>{tongSoLuong}</td>
                    </tr>
                </tfoot>
            )}
        </table>
    );
}

const NhapXuatPrintPreview = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [congTy, setCongTy] = useState(null);
    const [nhapData, setNhapData] = useState([]);
    const [xuatData, setXuatData] = useState([]);

    const thang = searchParams.get("thang") || "";
    const ncc = searchParams.get("ncc") || "";
    const boPhan = searchParams.get("boPhan") || "";
    const trangThai = searchParams.get("trangThai") || "";
    const pagesParam = searchParams.get("pages") || "";
    const pages = pagesParam ? pagesParam.split(",") : [];

    const showPhieuNhap = pages.includes("phieuNhap");
    const showPhieuXuat = pages.includes("phieuXuat");
    const showVatLieuNhap = pages.includes("vatLieuNhap");
    const showVatLieuXuat = pages.includes("vatLieuXuat");

    const filterLabel = buildFilterLabel({ thang, ncc, boPhan, trangThai });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const dateRange = monthToDateRange(thang);
                const trangThaiArr = trangThai ? trangThai.split(",") : [];

                const nhapVals = trangThaiArr.filter((t) => ["Chưa nhận", "Đã nhận"].includes(t));
                const toanVals = trangThaiArr.filter((t) => ["Chưa thanh toán", "Đã thanh toán"].includes(t));
                const xuatVals = trangThaiArr.filter((t) => ["Chưa xuất", "Đã xuất"].includes(t));

                const needNhap = showPhieuNhap || showVatLieuNhap;
                const needXuat = showPhieuXuat || showVatLieuXuat;

                const congTyReq = api.get("/cong-ty");

                const nhapReq = needNhap
                    ? api.get("/phieu-nhap-kho", {
                        params: {
                            page: 1,
                            limit: 10000,
                            ...dateRange,
                            ...(ncc ? { nhaCungCap: ncc } : {}),
                            ...(nhapVals.length ? { trangThaiNhap: nhapVals.join(",") } : {}),
                            ...(toanVals.length ? { trangThaiThanhToan: toanVals.join(",") } : {}),
                        },
                    })
                    : Promise.resolve({ data: { data: [] } });

                const xuatReq = needXuat
                    ? api.get("/phieu-xuat-kho", {
                        params: {
                            page: 1,
                            limit: 10000,
                            ...dateRange,
                            ...(boPhan ? { boPhan } : {}),
                            ...(xuatVals.length ? { trangThai: xuatVals.join(",") } : {}),
                        },
                    })
                    : Promise.resolve({ data: { data: [] } });

                const [resCongTy, resNhap, resXuat] = await Promise.all([congTyReq, nhapReq, xuatReq]);

                setCongTy(resCongTy.data?.data || resCongTy.data);
                setNhapData(resNhap.data?.data || []);
                setXuatData(resXuat.data?.data || []);
            } catch (err) {
                console.error("Lỗi fetch:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [thang, ncc, boPhan, trangThai, pagesParam]);

    if (loading) return <div className="p-4">Đang tải...</div>;

    if (pages.length === 0) {
        return <div className="p-4">Không có nội dung nào được chọn để in.</div>;
    }

    const tongTienNhap = nhapData.reduce((s, p) => s + (p.tongTien || 0), 0);
    const vatLieuNhap = aggregateVatLieu(nhapData).sort((a, b) =>
        (a.tenVatLieu || "").localeCompare(b.tenVatLieu || "", "vi", { sensitivity: "base" })
    );
    const vatLieuXuat = aggregateVatLieu(xuatData).sort((a, b) =>
        (a.tenVatLieu || "").localeCompare(b.tenVatLieu || "", "vi", { sensitivity: "base" })
    );

    // Thứ tự cố định để xác định phần nào là phần cuối (không chèn page-break sau nó)
    const sections = [
        showPhieuNhap && "phieuNhap",
        showPhieuXuat && "phieuXuat",
        showVatLieuNhap && "vatLieuNhap",
        showVatLieuXuat && "vatLieuXuat",
    ].filter(Boolean);
    const lastSection = sections[sections.length - 1];

    return createPortal(
        <div className="print-preview-portal fixed inset-0 z-[9999] min-h-screen w-screen overflow-auto bg-gray-200">
            {/* Toolbar */}
            <div className="h-10 bg-sky-500 flex justify-between items-center px-4 print:hidden">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200 transition">
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </button>
                    <span className="text-white font-medium text-sm">IN DANH SÁCH NHẬP XUẤT</span>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-white hover:text-gray-200 transition text-sm"
                >
                    <LocalPrintshopIcon sx={{ fontSize: 20 }} />
                    In
                </button>
            </div>

            <div className="flex flex-col items-center py-6 px-4 gap-6">
                {/* ── PHIẾU NHẬP ── */}
                {showPhieuNhap && (
                    <div
                        className={`print-area bg-white shadow-lg border border-gray-300 ${lastSection !== "phieuNhap" ? "page-break" : ""}`}
                        style={{ width: "210mm", minHeight: "148mm", padding: "8mm 10mm", boxSizing: "border-box" }}
                    >
                        <Header congTy={congTy} title="DANH SÁCH PHIẾU NHẬP KHO" />
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                            <thead>
                                <tr>
                                    <th style={thStyle({ textAlign: "center", width: "6%" })}>STT</th>
                                    <th style={thStyle({ width: "13%" })}>Số phiếu</th>
                                    <th style={thStyle({ width: "11%" })}>Ngày nhập</th>
                                    <th style={thStyle({ width: "24%" })}>Nhà cung cấp</th>
                                    <th style={thStyle({ textAlign: "right", width: "16%" })}>Tổng tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nhapData.length === 0 ? (
                                    <tr><td style={tdStyle({ textAlign: "center" })} colSpan={7}>Không có dữ liệu</td></tr>
                                ) : nhapData.map((p, i) => (
                                    <tr key={p._id}>
                                        <td style={tdStyle({ textAlign: "center" })}>{i + 1}</td>
                                        <td style={tdStyle()}>{p.soPhieu}</td>
                                        <td style={tdStyle()}>{formatDate(p.ngayTao)}</td>
                                        <td style={tdStyle()}>{p.nhaCungCap?.ten || "—"}</td>
                                        <td style={tdStyle({ textAlign: "right" })}>{formatCurrency(p.tongTien)} ₫</td>
                                    </tr>
                                ))}
                            </tbody>
                            {nhapData.length > 0 && (
                                <tfoot>
                                    <tr style={{ fontWeight: "bold" }}>
                                        <td style={tdStyle({ textAlign: "center" })} colSpan={4}>Tổng</td>
                                        <td style={tdStyle({ textAlign: "right" })}>{formatCurrency(tongTienNhap)} ₫</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}

                {/* ── PHIẾU XUẤT ── */}
                {showPhieuXuat && (
                    <div
                        className={`print-area bg-white shadow-lg border border-gray-300 ${lastSection !== "phieuXuat" ? "page-break" : ""}`}
                        style={{ width: "210mm", minHeight: "148mm", padding: "8mm 10mm", boxSizing: "border-box" }}
                    >
                        <Header congTy={congTy} title="DANH SÁCH PHIẾU XUẤT KHO" />
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "8.5pt" }}>
                            <thead>
                                <tr>
                                    <th style={thStyle({ textAlign: "center", width: "6%" })}>STT</th>
                                    <th style={thStyle({ width: "16%" })}>Số phiếu</th>
                                    <th style={thStyle({ width: "13%" })}>Ngày xuất</th>
                                    <th style={thStyle({ width: "22%" })}>Bộ phận</th>
                                    <th style={thStyle({ width: "22%" })}>Nhân viên</th>
                                </tr>
                            </thead>
                            <tbody>
                                {xuatData.length === 0 ? (
                                    <tr><td style={tdStyle({ textAlign: "center" })} colSpan={5}>Không có dữ liệu</td></tr>
                                ) : xuatData.map((p, i) => (
                                    <tr key={p._id}>
                                        <td style={tdStyle({ textAlign: "center" })}>{i + 1}</td>
                                        <td style={tdStyle()}>{p.soPhieu}</td>
                                        <td style={tdStyle()}>{formatDate(p.ngayTao)}</td>
                                        <td style={tdStyle()}>{p.boPhan}</td>
                                        <td style={tdStyle()}>{p.nhanVien}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── VẬT LIỆU NHẬP ── */}
                {showVatLieuNhap && (
                    <div
                        className={`print-area bg-white shadow-lg border border-gray-300 ${lastSection !== "vatLieuNhap" ? "page-break" : ""}`}
                        style={{ width: "210mm", minHeight: "148mm", padding: "8mm 10mm", boxSizing: "border-box" }}
                    >
                        <Header congTy={congTy} title="TỔNG HỢP VẬT LIỆU NHẬP" />
                        <VatLieuTable data={vatLieuNhap} />
                    </div>
                )}

                {/* ── VẬT LIỆU XUẤT ── */}
                {showVatLieuXuat && (
                    <div
                        className="print-area bg-white shadow-lg border border-gray-300"
                        style={{ width: "210mm", minHeight: "148mm", padding: "8mm 10mm", boxSizing: "border-box" }}
                    >
                        <Header congTy={congTy} title="TỔNG HỢP VẬT LIỆU XUẤT" />
                        <VatLieuTable data={vatLieuXuat} />
                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    /* Ẩn TOÀN BỘ trang (kể cả sidebar/layout bên ngoài),
                       chỉ hiện lại phần print-preview-portal này.
                       Vì portal render thẳng vào <body>, sidebar nằm ở
                       nhánh DOM khác nên .print\\:hidden trong chính nó
                       là không đủ để ẩn sidebar. */
                    /* Ẩn hẳn (display:none) mọi con trực tiếp của <body>
                       ngoại trừ portal in ấn. Dùng display:none (thay vì
                       visibility:hidden) để không chiếm chỗ trong luồng
                       trang in — tránh sinh ra trang trắng đầu tiên do
                       chiều cao của Sidebar/Layout cũ vẫn còn "chiếm đất". */
                    body > *:not(.print-preview-portal) { display: none !important; }
                    /* Phòng trường hợp portal bị lồng sâu hơn 1 cấp trong body */
                    body * { visibility: visible; }
                    /* Bỏ fixed/overflow khi in — chính 2 thứ này tạo ra
                       "viewport" riêng có scrollbar và bị in kèm theo. */
                    html, body {
                        overflow: visible !important;
                        width: auto !important;
                        height: auto !important;
                        margin: 0 !important;
                    }
                    .print-preview-portal {
                        position: static !important;
                        inset: auto !important;
                        width: auto !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        background: white;
                    }
                    .print\\:hidden { display: none !important; }
                    .print-area {
                        box-shadow: none !important;
                        border: none !important;
                        width: 100% !important;
                        min-height: 0 !important;
                        padding: 6mm 8mm !important;
                    }
                    .page-break { page-break-after: always; }
                    @page { size: A5 landscape; margin: 8mm; }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default NhapXuatPrintPreview;