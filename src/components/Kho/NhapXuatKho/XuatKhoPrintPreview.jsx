import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../config/api";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const XuatKhoPrintPreview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [phieu, setPhieu] = useState(null);
    const [congTy, setCongTy] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resPhieu, resCongTy] = await Promise.all([
                    api.get(`/phieu-xuat-kho/${id}`),
                    api.get("/cong-ty"),
                ]);
                setPhieu(resPhieu.data?.data || resPhieu.data);
                setCongTy(resCongTy.data?.data || resCongTy.data);
            } catch (err) {
                console.error("Lỗi fetch:", err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="p-4">Đang tải...</div>;
    if (!phieu) return <div className="p-4">Không tìm thấy phiếu xuất kho</div>;

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    const tongSoLuong = (phieu.danhSachVatLieu || []).reduce(
        (s, i) => s + (i.soLuong || 0),
        0
    );

    return (
        <div className="min-h-screen bg-gray-200">
            {/* Toolbar */}
            <div className="h-10 bg-green-600 flex justify-between items-center px-4 print:hidden">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:text-gray-200 transition"
                    >
                        <ArrowBackIcon sx={{ fontSize: 20 }} />
                    </button>
                    <span className="text-white font-medium text-sm">PHIẾU XUẤT KHO</span>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-white hover:text-gray-200 transition text-sm"
                >
                    <LocalPrintshopIcon sx={{ fontSize: 20 }} />
                    In phiếu
                </button>
            </div>

            {/* Print area */}
            <div className="flex flex-col items-center py-6 px-4">
                <div
                    className="print-area bg-white shadow-lg border border-gray-300"
                    style={{
                        width: "210mm",
                        fontFamily: "Times New Roman, serif",
                        padding: "12mm 15mm",
                    }}
                >
                    {/* Header */}
                    <div style={{ display: "flex" }}>
                        <div style={{ flex: 2 }}>
                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "11pt", textTransform: "uppercase" }}>
                                {congTy?.Ten || ""}
                            </p>
                            <p style={{ margin: "1mm 0 0", fontSize: "9pt" }}>{congTy?.DiaChi || ""}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div style={{ textAlign: "center", margin: "4mm 0 6mm" }}>
                        <h1 style={{ margin: 0, fontSize: "16pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                            PHIẾU XUẤT KHO
                        </h1>
                        <div style={{ fontSize: "9pt", marginTop: "1mm", color: "#444" }}>
                            Số phiếu: <strong>{phieu.soPhieu || "—"}</strong>
                        </div>
                        <div style={{ fontSize: "9pt", color: "#444" }}>
                            Ngày: {formatDate(phieu.ngayTao)}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ fontSize: "10.5pt", lineHeight: "1.9", marginBottom: "4mm" }}>
                        {phieu.boPhan && (
                            <div>
                                <span style={{ minWidth: "110px", display: "inline-block" }}>Bộ phận:</span>
                                <strong>{phieu.boPhan}</strong>
                            </div>
                        )}
                        {phieu.nhanVien && (
                            <div>
                                <span style={{ minWidth: "110px", display: "inline-block" }}>Nhân viên:</span>
                                <strong>{phieu.nhanVien}</strong>
                            </div>
                        )}
                        <div>
                            <span style={{ minWidth: "110px", display: "inline-block" }}>Trạng thái:</span>
                            <strong>{phieu.trangThai || "—"}</strong>
                        </div>
                        {phieu.ghiChu && (
                            <div>
                                <span style={{ minWidth: "110px", display: "inline-block" }}>Ghi chú:</span>
                                <span>{phieu.ghiChu}</span>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "10pt",
                            marginBottom: "4mm",
                        }}
                    >
                        <thead>
                            <tr style={{ backgroundColor: "#d1fae5" }}>
                                <th style={thStyle({ textAlign: "center", width: "8%" })}>STT</th>
                                <th style={thStyle({ textAlign: "left", width: "45%" })}>Tên vật liệu</th>
                                <th style={thStyle({ textAlign: "center", width: "12%" })}>ĐVT</th>
                                <th style={thStyle({ textAlign: "center", width: "12%" })}>Số lượng</th>
                                <th style={thStyle({ textAlign: "left", width: "23%" })}>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(phieu.danhSachVatLieu || []).map((item, i) => (
                                <tr key={i} style={{ backgroundColor: i % 2 === 1 ? "#f9f9f9" : "#fff" }}>
                                    <td style={tdStyle({ textAlign: "center" })}>{i + 1}</td>
                                    <td style={tdStyle()}>{item.vatLieu?.tenVatLieu || "—"}</td>
                                    <td style={tdStyle({ textAlign: "center" })}>
                                        {item.vatLieu?.donViTinh || "—"}
                                    </td>
                                    <td style={tdStyle({ textAlign: "center" })}>{item.soLuong}</td>
                                    <td style={tdStyle()}>{item.moTa || ""}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: "#d1fae5", fontWeight: "bold" }}>
                                <td style={tdStyle({ textAlign: "center" })} colSpan={3}>
                                    Tổng cộng
                                </td>
                                <td style={tdStyle({ textAlign: "center" })}>{tongSoLuong}</td>
                                <td style={tdStyle()} />
                            </tr>
                        </tfoot>
                    </table>

                    {/* Signatures */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8mm",
                            fontSize: "10pt",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ width: "30%" }}>
                            <div style={{ fontWeight: "bold" }}>Người lập phiếu</div>
                            <div style={{ fontSize: "8.5pt", color: "#555", marginBottom: "14mm" }}>(Ký, họ tên)</div>
                            <div style={{ borderTop: "1px solid #333", paddingTop: "1mm" }}>&nbsp;</div>
                        </div>
                        <div style={{ width: "30%" }}>
                            <div style={{ fontWeight: "bold" }}>Thủ kho</div>
                            <div style={{ fontSize: "8.5pt", color: "#555", marginBottom: "14mm" }}>(Ký, họ tên)</div>
                            <div style={{ borderTop: "1px solid #333", paddingTop: "1mm" }}>&nbsp;</div>
                        </div>
                        <div style={{ width: "30%" }}>
                            <div style={{ fontWeight: "bold" }}>Giám đốc</div>
                            <div style={{ fontSize: "8.5pt", color: "#555", marginBottom: "14mm" }}>(Ký, họ tên)</div>
                            <div style={{ borderTop: "1px solid #333", paddingTop: "1mm" }}>&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print-area {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 10mm 12mm !important;
                    }
                    @page { size: A4; margin: 10mm; }
                }
            `}</style>
        </div>
    );
};

const thStyle = (extra = {}) => ({
    border: "1px solid #aaa",
    padding: "3mm 2mm",
    fontWeight: "bold",
    ...extra,
});

const tdStyle = (extra = {}) => ({
    border: "1px solid #aaa",
    padding: "2mm",
    ...extra,
});

export default XuatKhoPrintPreview;
