import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Checkbox,
  AppBar,
  Toolbar,
  Typography,
  Slide,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import TitleIcon from "@mui/icons-material/Title";
import PrintIcon from "@mui/icons-material/Print"; // Bổ sung Icon In
import { api } from "../../config/api";
import { toast } from "sonner";
import FullScreenLoader from "../Loader/FullScreenLoader";
import { QRCodeSVG } from "qrcode.react";

// Hiệu ứng trượt cho Dialog Fullscreen
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Danh sách CỐ ĐỊNH tất cả các trường có thể in trên thẻ
const AVAILABLE_FIELDS = [
  { key: "maThe", label: "Mã thẻ", isQR: false },
  { key: "nhaKhoa", label: "Nha khoa", isQR: false },
  { key: "bacSi", label: "Bác sĩ", isQR: false },
  { key: "benhNhan", label: "Bệnh nhân", isQR: false },
  { key: "sanPham", label: "Sản phẩm", isQR: false },
  { key: "viTriRang", label: "Vị trí răng", isQR: false },
  { key: "baoHanhTu", label: "Bảo hành từ", isQR: false },
  { key: "baoHanhDen", label: "Bảo hành đến", isQR: false },
  { key: "maQR", label: "Mã QR", isQR: true },
];

// 👉 ĐÂY CHÍNH LÀ DỮ LIỆU MẪU ĐỂ ƯỚM THỬ (MOCK DATA)
const PREVIEW_MOCK_DATA = {
  maThe: "TAN26050036",
  nhaKhoa: "NHA KHOA Á CHÂU",
  bacSi: "BS. Nguyễn Hùng Thịnh",
  benhNhan: "Nguyễn Văn A",
  sanPham: "Răng Sứ Zirconia",
  viTriRang: "11, 12, 21, 22",
  baoHanhTu: "19/05/2026",
  baoHanhDen: "19/05/2036",
};

const getInitialFieldConfigs = () => {
  const configs = {};
  AVAILABLE_FIELDS.forEach((field) => {
    configs[field.key] = {
      enabled: false,
      leTren: 10,
      leTrai: 10,
      coChu: 12,
      doDam: false,
      nghieng: false,
      gachChan: false,
      inHoa: false,
    };
  });
  return configs;
};

const MauTheBaoHanhPage = () => {
  const [mauTheList, setMauTheList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMauTheId, setEditingMauTheId] = useState(null);
  const [nhaKhoaId, setNhaKhoaId] = useState("");

  const [tenMau, setTenMau] = useState("");
  const [moTa, setMoTa] = useState("");
  const [fieldConfigs, setFieldConfigs] = useState(getInitialFieldConfigs());

  // 👉 THÊM REF ĐỂ LẤY KHUNG THẺ MANG ĐI IN
  const printRef = useRef();

  const loadMauTheList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mau-the-bao-hanh", {
        params: nhaKhoaId ? { nhaKhoaId } : {},
      });
      if (res.data?.success) {
        setMauTheList(res.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMauTheList();
  }, [nhaKhoaId]);

  const filteredMauThe = mauTheList.filter((mau) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      mau.tenMau?.toLowerCase().includes(searchLower) ||
      mau.moTa?.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenCreate = () => {
    setTenMau("");
    setMoTa("");
    setFieldConfigs(getInitialFieldConfigs());
    setIsEditMode(false);
    setEditingMauTheId(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (mauThe) => {
    setTenMau(mauThe.tenMau);
    setMoTa(mauThe.moTa || "");
    setEditingMauTheId(mauThe._id);
    setIsEditMode(true);

    const newConfigs = getInitialFieldConfigs();
    (mauThe.cacTruong || []).forEach((field) => {
      if (newConfigs[field.loaiTruong]) {
        newConfigs[field.loaiTruong] = {
          enabled: true,
          leTren: field.leTren || 10,
          leTrai: field.leTrai || field.leTraI || 10,
          coChu: field.coChu || 12,
          doDam: field.doDam || false,
          nghieng: field.nghieng || false,
          gachChan: field.gachChan || false,
          inHoa: field.inHoa || false,
        };
      }
    });
    setFieldConfigs(newConfigs);
    setIsEditorOpen(true);
  };

  const handleConfigChange = (fieldKey, prop, value) => {
    setFieldConfigs((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        [prop]: value,
      },
    }));
  };

  const handleFormatToggle = (fieldKey, format) => {
    setFieldConfigs((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        [format]: !prev[fieldKey][format],
      },
    }));
  };

  const handleSave = async () => {
    if (!tenMau.trim()) {
      toast.error("Tên mẫu là bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const cacTruongToSave = Object.keys(fieldConfigs)
        .filter((key) => fieldConfigs[key].enabled)
        .map((key) => {
          const conf = fieldConfigs[key];
          return {
            loaiTruong: key,
            leTren: Number(conf.leTren),
            leTrai: Number(conf.leTrai),
            coChu: Number(conf.coChu),
            doDam: conf.doDam,
            nghieng: conf.nghieng,
            gachChan: conf.gachChan,
            inHoa: conf.inHoa,
          };
        });

      const payload = {
        tenMau,
        moTa,
        cacTruong: cacTruongToSave,
        nhaKhoa: nhaKhoaId || undefined,
      };

      let res;
      if (isEditMode) {
        res = await api.put(`/mau-the-bao-hanh/${editingMauTheId}`, payload);
      } else {
        res = await api.post("/mau-the-bao-hanh", payload);
      }

      if (res.data?.success) {
        toast.success(
          isEditMode ? "Cập nhật thành công" : "Tạo mẫu thành công"
        );
        setIsEditorOpen(false);
        loadMauTheList();
      } else {
        toast.error(res.data?.message || "Lỗi khi lưu");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Chắc chắn xóa mẫu thẻ này?")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/mau-the-bao-hanh/${id}`);
      if (res.data?.success) {
        toast.success("Đã xóa");
        loadMauTheList();
      }
    } catch (error) {
      toast.error("Lỗi khi xóa");
    } finally {
      setLoading(false);
    }
  };

  // 👉 HÀM MỞ CỬA SỔ IN THỬ
  const handlePrintTest = () => {
    if (!printRef.current) return;

    // Lấy nội dung HTML của thẻ (phải lấy innerHTML chứa các div con bên trong)
    const printContent = printRef.current.innerHTML;

    // Mở popup ẩn
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Thử Mẫu Thẻ</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fff;
              font-family: sans-serif;
            }
            .card-container {
              width: 86mm;
              height: 54mm;
              position: relative;
              /* Border đứt khúc để dễ nhìn viền lúc cắt thẻ */
              border: 1px dashed #ccc; 
            }
            /* Định dạng cực chuẩn khi nạp vào máy in */
            @media print {
              @page { size: auto; margin: 0; }
              body { padding: 10mm; display: block; }
              .card-container { border: none; } /* Xóa viền khi in thật */
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            ${printContent}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Đợi 300ms cho QR Code (SVG) render xong rồi mới kích hoạt hộp thoại in
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (loading && mauTheList.length === 0) return <FullScreenLoader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Mẫu Thẻ Bảo Hành</h1>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            onClick={loadMauTheList}
            disabled={loading}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenCreate}
          >
            + Tạo Mẫu Mới
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <TextField
          placeholder="Tìm kiếm mẫu thẻ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
        />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead className="bg-gray-100">
            <TableRow>
              <TableCell className="font-bold">Tên Mẫu</TableCell>
              <TableCell>Mô Tả</TableCell>
              <TableCell>Số Trường Dữ Liệu</TableCell>
              <TableCell align="center">Thao Tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMauThe.map((mau) => (
              <TableRow key={mau._id} hover>
                <TableCell className="font-medium text-blue-700">
                  {mau.tenMau}
                </TableCell>
                <TableCell>{mau.moTa}</TableCell>
                <TableCell>{mau.cacTruong?.length || 0}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenEdit(mau)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(mau._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* VISUAL EDITOR DIALOG */}
      <Dialog
        fullScreen
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative", backgroundColor: "#0284c7" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setIsEditorOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {isEditMode
                ? `Cập nhật mẫu: ${tenMau}`
                : "Thiết kế Mẫu thẻ bảo hành mới"}
            </Typography>

            {/* 👉 BỔ SUNG NÚT IN THỬ TẠI ĐÂY */}
            <div className="flex gap-3">
              <Button
                color="inherit"
                onClick={handlePrintTest}
                startIcon={<PrintIcon />}
                sx={{
                  fontWeight: "bold",
                  border: "1px solid rgba(255,255,255,0.5)",
                  bgcolor: "rgba(255,255,255,0.1)",
                }}
              >
                IN THỬ
              </Button>

              <Button
                autoFocus
                color="inherit"
                onClick={handleSave}
                disabled={loading}
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  border: "1px solid white",
                }}
              >
                {loading ? "ĐANG LƯU..." : "LƯU CẤU HÌNH"}
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <div className="flex flex-col md:flex-row h-full bg-gray-100 overflow-hidden">
          {/* CỘT TRÁI: LIVE PREVIEW */}
          <div className="w-full md:w-[45%] lg:w-[40%] p-6 flex flex-col gap-6 bg-white border-r border-gray-300 overflow-y-auto shadow-lg z-10">
            <div>
              <TextField
                label="Tên mẫu thẻ *"
                value={tenMau}
                onChange={(e) => setTenMau(e.target.value)}
                fullWidth
                variant="standard"
                className="mb-4"
              />
              <TextField
                label="Mô tả"
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="standard"
              />
            </div>

            <div className="mt-4 flex-1">
              <div className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
                Hiển thị trực tiếp (Kích thước thực: 86x54mm)
              </div>

              <div className="flex justify-center items-center bg-gray-200 p-8 rounded-lg border-2 border-dashed border-gray-300">
                {/* THẺ PREVIEW (GẮN REF ĐỂ BÊ ĐI IN) */}
                <div
                  ref={printRef}
                  style={{
                    width: "86mm",
                    height: "54mm",
                    backgroundColor: "white",
                    position: "relative",
                    borderRadius: "4px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    overflow: "hidden",
                  }}
                >
                  {AVAILABLE_FIELDS.map((field) => {
                    const conf = fieldConfigs[field.key];
                    if (!conf.enabled) return null;

                    if (field.isQR) {
                      return (
                        <div
                          key={field.key}
                          style={{
                            position: "absolute",
                            top: `${conf.leTren}mm`,
                            left: `${conf.leTrai}mm`,
                          }}
                        >
                          <QRCodeSVG
                            value="https://tandental.com/qr/DEMO"
                            size={conf.coChu * 4 || 60}
                            level="M"
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={field.key}
                        style={{
                          position: "absolute",
                          top: `${conf.leTren}mm`,
                          left: `${conf.leTrai}mm`,
                          fontSize: `${conf.coChu}pt`,
                          fontWeight: conf.doDam ? "bold" : "normal",
                          fontStyle: conf.nghieng ? "italic" : "normal",
                          textDecoration: conf.gachChan ? "underline" : "none",
                          textTransform: conf.inHoa ? "uppercase" : "none",
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {PREVIEW_MOCK_DATA[field.key]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: BẢNG SETTINGS */}
          <div className="w-full md:w-[55%] lg:w-[60%] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">
                Thiết lập tọa độ và định dạng (Đơn vị: mm, pt)
              </h3>

              <table className="w-full text-sm text-left">
                <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                  <tr>
                    <th className="p-2 w-12 text-center">Bật</th>
                    <th className="p-2 w-32">Dữ liệu</th>
                    <th className="p-2 w-20 text-center">Lề Trên</th>
                    <th className="p-2 w-20 text-center">Lề Trái</th>
                    <th className="p-2 w-20 text-center">Cỡ Chữ</th>
                    <th className="p-2 min-w-[150px] text-center">Định dạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {AVAILABLE_FIELDS.map((field) => {
                    const conf = fieldConfigs[field.key];
                    const isEnabled = conf.enabled;

                    return (
                      <tr
                        key={field.key}
                        className={`hover:bg-gray-50 transition-colors ${
                          isEnabled ? "bg-white" : "bg-gray-50 opacity-60"
                        }`}
                      >
                        <td className="p-1 text-center">
                          <Checkbox
                            color="success"
                            checked={isEnabled}
                            onChange={(e) =>
                              handleConfigChange(
                                field.key,
                                "enabled",
                                e.target.checked
                              )
                            }
                          />
                        </td>

                        <td className="p-2 font-medium text-gray-700">
                          {field.label}
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            disabled={!isEnabled}
                            value={conf.leTren}
                            onChange={(e) =>
                              handleConfigChange(
                                field.key,
                                "leTren",
                                e.target.value
                              )
                            }
                            className="w-full text-center border border-gray-300 rounded p-1 outline-none focus:border-blue-500 disabled:bg-gray-200"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            disabled={!isEnabled}
                            value={conf.leTrai}
                            onChange={(e) =>
                              handleConfigChange(
                                field.key,
                                "leTrai",
                                e.target.value
                              )
                            }
                            className="w-full text-center border border-gray-300 rounded p-1 outline-none focus:border-blue-500 disabled:bg-gray-200"
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            disabled={!isEnabled}
                            value={conf.coChu}
                            onChange={(e) =>
                              handleConfigChange(
                                field.key,
                                "coChu",
                                e.target.value
                              )
                            }
                            className="w-full text-center border border-gray-300 rounded p-1 outline-none focus:border-blue-500 disabled:bg-gray-200"
                            title={field.isQR ? "Kích thước QR" : "Cỡ chữ"}
                          />
                        </td>

                        <td className="p-2 text-center">
                          {!field.isQR && (
                            <ToggleButtonGroup
                              size="small"
                              disabled={!isEnabled}
                              className="bg-white"
                            >
                              <ToggleButton
                                value="bold"
                                selected={conf.doDam}
                                onClick={() =>
                                  handleFormatToggle(field.key, "doDam")
                                }
                                color="primary"
                              >
                                <FormatBoldIcon fontSize="small" />
                              </ToggleButton>

                              <ToggleButton
                                value="italic"
                                selected={conf.nghieng}
                                onClick={() =>
                                  handleFormatToggle(field.key, "nghieng")
                                }
                                color="primary"
                              >
                                <FormatItalicIcon fontSize="small" />
                              </ToggleButton>

                              <ToggleButton
                                value="underline"
                                selected={conf.gachChan}
                                onClick={() =>
                                  handleFormatToggle(field.key, "gachChan")
                                }
                                color="primary"
                              >
                                <FormatUnderlinedIcon fontSize="small" />
                              </ToggleButton>

                              <ToggleButton
                                value="uppercase"
                                selected={conf.inHoa}
                                onClick={() =>
                                  handleFormatToggle(field.key, "inHoa")
                                }
                                color="primary"
                                title="In Hoa toàn bộ"
                              >
                                <TitleIcon fontSize="small" />
                              </ToggleButton>
                            </ToggleButtonGroup>
                          )}
                          {field.isQR && (
                            <span className="text-xs text-gray-500 italic">
                              Áp dụng cho QR Code
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MauTheBaoHanhPage;
