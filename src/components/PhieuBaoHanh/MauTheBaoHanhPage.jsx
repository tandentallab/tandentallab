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
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import TitleIcon from "@mui/icons-material/Title";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import StyleIcon from "@mui/icons-material/Style";
import SettingsIcon from "@mui/icons-material/Settings";
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
  maThe: "26050036",
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
          leTren: field.leTren ?? 10,
          leTrai: (field.leTrai ?? field.leTraI) ?? 10,
          coChu: field.coChu ?? 12,
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

    const printContent = printRef.current.innerHTML;
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
              width: 85mm;
              height: 53mm;
              position: relative;
              border: 1px dashed #ccc; 
            }
            @media print {
              @page { size: auto; margin: 0; }
              body { padding: 10mm; display: block; }
              .card-container { border: none; }
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

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (loading && mauTheList.length === 0) return <FullScreenLoader />;

  return (
    <div className="p-4 bg-gray-100">
      {/* TOOLBAR SECTION */}
      <div className="mb-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-row gap-3 items-center justify-between">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 max-w-md">
          <TextField
            placeholder="Tìm kiếm mẫu thẻ theo tên hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400" />
                </InputAdornment>
              ),
              className: "bg-transparent border-none rounded-lg text-slate-800",
            }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" } }}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <IconButton
            onClick={loadMauTheList}
            disabled={loading}
            title="Làm mới"
            className="text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
            sx={{ width: 48, height: 48, borderRadius: "12px" }}
          >
            <RefreshIcon />
          </IconButton>

          <IconButton
            onClick={handleOpenCreate}
            title="Tạo mẫu mới"
            className="bg-sky-600 text-white hover:bg-sky-700 transition-all shadow-md"
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              backgroundColor: "#0284c7",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: "#0369a1",
              }
            }}
          >
            <AddIcon />
          </IconButton>
        </div>
      </div>

      {/* DESKTOP: TABLE LAYOUT */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
        <div
          style={{ WebkitOverflowScrolling: "touch" }}
          className="overflow-x-auto"
        >
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ minWidth: 700, borderRadius: 0 }}
          >
            <Table size="medium">
              <TableHead className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Tên Mẫu
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 py-4">
                    Mô Tả
                  </TableCell>
                  <TableCell
                    className="font-semibold text-slate-700 py-4"
                    align="center"
                  >
                    Số Trường Dữ Liệu
                  </TableCell>
                  <TableCell
                    className="font-semibold text-slate-700 py-4"
                    align="center"
                  >
                    Thao Tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-slate-100">
                {filteredMauThe.map((mau) => (
                  <TableRow key={mau._id} hover className="transition-all">
                    <TableCell className="font-semibold text-sky-700 py-4 text-base">
                      {mau.tenMau}
                    </TableCell>
                    <TableCell className="text-slate-600 py-4 max-w-xs truncate">
                      {mau.moTa || (
                        <span className="text-slate-400 italic text-xs">
                          Không có mô tả
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="center" className="py-4">
                      <span className="inline-flex items-center justify-center bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full border border-sky-100">
                        {mau.cacTruong?.length || 0} trường
                      </span>
                    </TableCell>
                    <TableCell align="center" className="py-4">
                      <div className="flex justify-center gap-1">
                        <IconButton
                          size="small"
                          className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg"
                          onClick={() => handleOpenEdit(mau)}
                          title="Sửa cấu hình"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg"
                          onClick={() => handleDelete(mau._id)}
                          title="Xóa mẫu"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMauThe.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      className="py-12 text-slate-400 italic"
                    >
                      Không tìm thấy dữ liệu mẫu thẻ nào thích hợp.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>

      {/* MOBILE: CARD LAYOUT */}
      <div className="md:hidden space-y-4">
        {filteredMauThe.length > 0 ? (
          filteredMauThe.map((mau) => (
            <Paper
              key={mau._id}
              className="p-5 rounded-2xl border border-slate-200 shadow-sm bg-white relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 h-full w-1.5 bg-sky-500"></div>
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                      Tên Mẫu
                    </div>
                    <div className="font-bold text-lg text-slate-800">
                      {mau.tenMau}
                    </div>
                  </div>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <IconButton
                      size="small"
                      className="text-sky-600 p-1.5 rounded-lg"
                      onClick={() => handleOpenEdit(mau)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      className="text-rose-600 p-1.5 rounded-lg"
                      onClick={() => handleDelete(mau._id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>

                {mau.moTa && (
                  <div>
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                      Mô Tả
                    </div>
                    <div className="text-slate-600 text-sm line-clamp-2">
                      {mau.moTa}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Số trường đang kích hoạt
                  </span>
                  <span className="text-sm font-extrabold text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                    {mau.cacTruong?.length || 0}
                  </span>
                </div>
              </div>
            </Paper>
          ))
        ) : (
          <Paper className="p-12 text-center text-slate-400 italic rounded-2xl border border-slate-200">
            Không tìm thấy mẫu thẻ nào
          </Paper>
        )}
      </div>

      {/* VISUAL EDITOR DIALOG */}
      <Dialog
        fullScreen
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{ className: "bg-slate-100" }}
      >
        <AppBar
          sx={{
            position: "relative",
            backgroundColor: "#0f172a",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
        >
          <Toolbar className="bg-blue-500 px-4 md:px-6 py-2 flex justify-between gap-4">
            <div className="flex items-center  gap-2">
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setIsEditorOpen(false)}
                aria-label="close"
                className="hover:bg-slate-800 p-2 rounded-lg"
              >
                <CloseIcon />
              </IconButton>
              <Typography
                sx={{
                  ml: 1,
                  fontWeight: 700,
                  fontSize: { xs: "16px", md: "20px" },
                  tracking: "-0.025em",
                }}
                variant="h6"
                component="div"
              >
                {isEditMode
                  ? `Cập nhật: ${tenMau}`
                  : "Thiết kế Mẫu thẻ bảo hành mới"}
              </Typography>
            </div>

            <div className="flex gap-2 md:gap-3 shrink-0">
              <Button
                color="inherit"
                onClick={handlePrintTest}
                startIcon={<PrintIcon />}
                className="font-semibold text-slate-200 border border-slate-700 bg-slate-800/50 hover:bg-white hover:text-blue-500 px-3 md:px-4 py-1.5 rounded-xl normal-case text-sm transition-all"
              >
                In Thử
              </Button>
              <Button
                autoFocus
                color="inherit"
                onClick={handleSave}
                disabled={loading}
                startIcon={<SaveIcon />}
                className="font-semibold text-slate-200 border border-slate-700 bg-slate-800/50 hover:bg-white hover:text-blue-500 px-3 md:px-4 py-1.5 rounded-xl normal-case text-sm transition-all"
              >
                {loading ? "Đang lưu..." : "Lưu Cấu Hình"}
              </Button>
            </div>
          </Toolbar>
        </AppBar>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
          {/* LEFT CONTAINER: INFO INPUTS & REALTIME CANVAS WORKBENCH */}
          <div className="w-full lg:w-[45%] xl:w-[40%] p-4 md:p-6 flex flex-col gap-6 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto shadow-sm z-10">
            {/* Template Information */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase tracking-wider mb-2">
                <SettingsIcon className="text-slate-500 text-sm" /> Thông tin
                mẫu phôi
              </div>
              <TextField
                label="Tên mẫu thẻ *"
                value={tenMau}
                onChange={(e) => setTenMau(e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{ className: "text-slate-500" }}
                className="bg-white rounded-lg"
              />
              <TextField
                label="Mô tả mẫu"
                value={moTa}
                onChange={(e) => setMoTa(e.target.value)}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
                size="small"
                InputLabelProps={{ className: "text-slate-500" }}
                className="bg-white rounded-lg"
              />
            </div>

            {/* Visual Studio Card Preview */}
            <div className="flex-1 flex flex-col min-h-[350px]">
              <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center justify-between">
                <span>Khung hiển thị trực quan</span>
                <span className="text-sky-600 bg-sky-50 font-semibold px-2 py-0.5 rounded-md border border-sky-100">
                  Kích thước chuẩn: 85x53mm
                </span>
              </div>

              {/* The Studio Workbench Background Grid */}
              <div
                className="flex-1 flex justify-center items-center bg-slate-900 rounded-2xl p-6 md:p-8 shadow-inner border border-slate-800 relative overflow-hidden"
                style={{
                  backgroundImage:
                    "radial-gradient(#1e293b 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              >
                <div className="absolute top-3 left-3 text-[10px] text-slate-500 uppercase tracking-widest pointer-events-none select-none">
                  Studio Preview Workbench
                </div>

                {/* THÈ PREVIEW (GẮN REF ĐỂ BÊ ĐI IN) */}
                <div
                  ref={printRef}
                  style={{
                    width: "85mm",
                    height: "53mm",
                    backgroundColor: "white",
                    position: "relative",
                    borderRadius: "4px",
                    boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
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
                            value={`${window.location.origin}/tra-cuu-bao-hanh/?qrcode=12345`}
                            size={conf.coChu * 4 || 60}
                            level="L"
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

          {/* RIGHT CONTAINER: SETTINGS CONTROL CONTROLLER PANEL */}
          <div className="w-full lg:w-[55%] xl:w-[60%] p-4 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">
                  Thiết lập tọa độ & định dạng văn bản
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tinh chỉnh khoảng cách lề (đơn vị: mm) và kích cỡ chữ hiển thị
                  (đơn vị: pt).
                </p>
              </div>

              <div
                style={{ WebkitOverflowScrolling: "touch" }}
                className="overflow-x-auto"
              >
                <table className="w-full min-w-[680px] text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3 w-14 text-center">Bật</th>
                      <th className="p-3 w-32">Tên Trường</th>
                      <th className="p-3 w-24 text-center">Lề Trên (mm)</th>
                      <th className="p-3 w-24 text-center">Lề Trái (mm)</th>
                      <th className="p-3 w-24 text-center">Cỡ Chữ (pt)</th>
                      <th className="p-3 min-w-[160px] text-center">
                        Định Dạng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {AVAILABLE_FIELDS.map((field) => {
                      const conf = fieldConfigs[field.key];
                      const isEnabled = conf.enabled;

                      return (
                        <tr
                          key={field.key}
                          className={`transition-colors duration-150 ${isEnabled ? "bg-white" : "bg-slate-50/50 opacity-60"
                            }`}
                        >
                          <td className="p-3 text-center">
                            <Checkbox
                              color="primary"
                              checked={isEnabled}
                              onChange={(e) =>
                                handleConfigChange(
                                  field.key,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                              size="small"
                              sx={{
                                color: "#cbd5e1",
                                "&.Mui-checked": { color: "#0284c7" },
                              }}
                            />
                          </td>

                          <td className="p-3 font-semibold text-slate-700">
                            {field.label}
                          </td>

                          <td className="p-3">
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
                              className="w-full text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium transition-all focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </td>

                          <td className="p-3">
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
                              className="w-full text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium transition-all focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </td>

                          <td className="p-3">
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
                              className="w-full text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium transition-all focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                              title={
                                field.isQR
                                  ? "Kích thước ô QR Code"
                                  : "Kích cỡ phông chữ"
                              }
                            />
                          </td>

                          <td className="p-3 text-center">
                            {!field.isQR ? (
                              <ToggleButtonGroup
                                size="small"
                                disabled={!isEnabled}
                                className="bg-slate-50 border border-slate-200 rounded-lg p-0.5 shadow-sm"
                              >
                                <ToggleButton
                                  value="bold"
                                  selected={conf.doDam}
                                  onClick={() =>
                                    handleFormatToggle(field.key, "doDam")
                                  }
                                  classes={{
                                    root: "border-none rounded-md px-2 py-1 mx-0.5 text-slate-500 &.Mui-selected:bg-sky-100 &.Mui-selected:text-sky-700",
                                  }}
                                >
                                  <FormatBoldIcon fontSize="small" />
                                </ToggleButton>

                                <ToggleButton
                                  value="italic"
                                  selected={conf.nghieng}
                                  onClick={() =>
                                    handleFormatToggle(field.key, "nghieng")
                                  }
                                  classes={{
                                    root: "border-none rounded-md px-2 py-1 mx-0.5 text-slate-500 &.Mui-selected:bg-sky-100 &.Mui-selected:text-sky-700",
                                  }}
                                >
                                  <FormatItalicIcon fontSize="small" />
                                </ToggleButton>

                                <ToggleButton
                                  value="underline"
                                  selected={conf.gachChan}
                                  onClick={() =>
                                    handleFormatToggle(field.key, "gachChan")
                                  }
                                  classes={{
                                    root: "border-none rounded-md px-2 py-1 mx-0.5 text-slate-500 &.Mui-selected:bg-sky-100 &.Mui-selected:text-sky-700",
                                  }}
                                >
                                  <FormatUnderlinedIcon fontSize="small" />
                                </ToggleButton>

                                <ToggleButton
                                  value="uppercase"
                                  selected={conf.inHoa}
                                  onClick={() =>
                                    handleFormatToggle(field.key, "inHoa")
                                  }
                                  title="In Hoa toàn bộ chữ"
                                  classes={{
                                    root: "border-none rounded-md px-2 py-1 mx-0.5 text-slate-500 &.Mui-selected:bg-sky-100 &.Mui-selected:text-sky-700",
                                  }}
                                >
                                  <TitleIcon fontSize="small" />
                                </ToggleButton>
                              </ToggleButtonGroup>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium italic bg-slate-50 px-2.5 py-1.5 border border-slate-100 rounded-lg inline-block">
                                Chỉ áp dụng cho QR Code
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
        </div>
      </Dialog>
    </div>
  );
};

export default MauTheBaoHanhPage;
