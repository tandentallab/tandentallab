import React, { useState, useEffect } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    TextField,
    Autocomplete,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    FormControl,
    InputLabel
} from "@mui/material";

const HoaDonFilterDrawer = ({
    open,
    onClose,
    filterNgayXuat,
    setFilterNgayXuat,
    filterNhaKhoa,
    setFilterNhaKhoa,
    filterTrangThai,
    setFilterTrangThai,
    nhaKhoaList = [],
    onReset,
}) => {
    const [tempNgayXuat, setTempNgayXuat] = useState("");
    const [tempNhaKhoa, setTempNhaKhoa] = useState("");
    const [tempTrangThai, setTempTrangThai] = useState([]);

    useEffect(() => {
        if (open) {
            setTempNgayXuat(filterNgayXuat || "");
            setTempNhaKhoa(filterNhaKhoa || "");
            setTempTrangThai(
                Array.isArray(filterTrangThai)
                    ? filterTrangThai
                    : filterTrangThai
                        ? filterTrangThai.split(",")
                        : []
            );
        }
    }, [open, filterNgayXuat, filterNhaKhoa, filterTrangThai]);

    if (!open) return null;

    const handleStatusChange = (event) => {
        const { value } = event.target;
        setTempTrangThai(value);
    };

    const handleApply = () => {
        setFilterNgayXuat(tempNgayXuat);
        setFilterNhaKhoa(tempNhaKhoa);
        setFilterTrangThai(tempTrangThai);
        onClose();
    };

    const handleReset = () => {
        onReset();
        onClose();
    };

    const STATUS_OPTIONS = [
        "Chưa thanh toán",
        "Thanh toán một phần",
        "Đã thanh toán"
    ];

    return (
        <div className="absolute left-0 top-full mt-2 z-50 w-[320px] rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
            <div className="flex flex-col gap-5">

                {/* Ngày xuất */}
                <TextField
                    label="Ngày xuất"
                    type="date"
                    variant="standard"
                    fullWidth
                    value={tempNgayXuat}
                    onChange={(e) => setTempNgayXuat(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                        // ĐÃ THÊM: CSS tàng hình chữ mm/dd/yyyy mặc định của trình duyệt khi trống
                        "& input::-webkit-datetime-edit": {
                            color: tempNgayXuat ? "inherit" : "transparent",
                        },
                        "& input:focus::-webkit-datetime-edit": {
                            color: "inherit",
                        },
                    }}
                />

                {/* Nha khoa */}
                <Autocomplete
                    disablePortal
                    options={nhaKhoaList}
                    getOptionLabel={(option) => option.hoVaTen || option.tenGiaoDich || ""}
                    value={nhaKhoaList.find((nk) => nk._id === tempNhaKhoa) || null}
                    onChange={(event, newValue) => {
                        setTempNhaKhoa(newValue ? newValue._id : "");
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Nha khoa"
                            variant="standard"
                            placeholder="Tìm kiếm hoặc chọn nha khoa..."
                        />
                    )}
                    noOptionsText="Không tìm thấy nha khoa"
                    ListboxProps={{ style: { maxHeight: 220, overflow: 'auto' } }}
                />

                {/* Trạng thái */}
                <FormControl variant="standard" fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                        multiple
                        value={tempTrangThai}
                        onChange={handleStatusChange}
                        renderValue={(selected) => selected.join(", ")}
                        MenuProps={{ disablePortal: true }}
                    >
                        {STATUS_OPTIONS.map((status) => (
                            <MenuItem key={status} value={status}>
                                <Checkbox checked={tempTrangThai.indexOf(status) > -1} />
                                <ListItemText primary={status} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <button
                    onClick={handleReset}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-100 text-gray-700"
                >
                    <RefreshIcon fontSize="small" />
                </button>

                <button
                    onClick={handleApply}
                    className="flex items-center gap-1 rounded-full bg-[#4CAF50] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#388E3C]"
                >
                    ✓ Lưu
                </button>
            </div>
        </div>
    );
};

export default HoaDonFilterDrawer;