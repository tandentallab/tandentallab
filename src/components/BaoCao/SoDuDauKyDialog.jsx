import React, { useState, useCallback } from 'react';
import {
    Box, Typography, Button, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, Chip, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '../../config/api';

const FONT = "'Inter', 'Roboto', 'Segoe UI', sans-serif";
const SODUDAUKY_NAM = 2026;
const FIXED_THANG = 6; // 🔥 KHÓA CỨNG: Chỉ cho phép thao tác duy nhất Tháng 5

export default function SoDuDauKyDialog({ open, onClose }) {
    const [dialogSearch, setDialogSearch] = useState('');
    const [nhaKhoaList, setNhaKhoaList] = useState([]);
    // Chỉ quản lý input cho duy nhất tháng 5
    const [soDuInputs, setSoDuInputs] = useState({});
    const [dialogLoading, setDialogLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleOpen = useCallback(async () => {
        setDialogSearch('');
        setSaveError('');
        setSaveSuccess(false);
        setDialogLoading(true);
        try {
            const res = await api.get('/nhakhoa');
            const list = res.data || [];
            setNhaKhoaList(list);

            const initInputs = {};
            list.forEach(nk => {
                const arr = Array.isArray(nk.soDuDauKy) ? nk.soDuDauKy : [];
                // Tìm đúng dữ liệu của Tháng 5 / 2026
                const sd = arr.find(item => item.thang === FIXED_THANG && item.nam === SODUDAUKY_NAM);

                if (sd && sd.soTien !== undefined && sd.soTien !== null) {
                    initInputs[nk._id] = String(sd.soTien);
                } else {
                    initInputs[nk._id] = '';
                }
            });
            setSoDuInputs(initInputs);
        } catch {
            setSaveError('Không tải được danh sách nha khoa.');
        } finally {
            setDialogLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (open) handleOpen();
    }, [open, handleOpen]);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            // So sánh tìm ra những dòng thực sự có thay đổi số liệu để lưu
            const entriesToSave = Object.entries(soDuInputs).filter(([nkId, newVal]) => {
                const nk = nhaKhoaList.find(n => n._id === nkId);
                const arr = Array.isArray(nk?.soDuDauKy) ? nk.soDuDauKy : [];
                const sd = arr.find(item => item.thang === FIXED_THANG && item.nam === SODUDAUKY_NAM);
                const oldVal = (sd && sd.soTien !== undefined && sd.soTien !== null) ? String(sd.soTien) : '';

                return newVal !== oldVal;
            });

            if (entriesToSave.length > 0) {
                await Promise.all(
                    entriesToSave.map(([id, soTien]) => {
                        const numericVal = soTien === '' ? 0 : Number(String(soTien).replace(/\./g, '').replace(/,/g, ''));
                        return api.put(`/nhakhoa/${id}/so-du-dau-ky`, {
                            thang: FIXED_THANG,
                            nam: SODUDAUKY_NAM,
                            soTien: isNaN(numericVal) ? 0 : numericVal,
                        });
                    })
                );
            }

            setSaveSuccess(true);
            setTimeout(() => handleOpen(), 1500); // Reload sau 1.5s để user thấy thông báo
        } catch {
            setSaveError('Lưu thất bại, vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const filteredNhaKhoa = nhaKhoaList.filter(nk => {
        const ten = (nk.tenGiaoDich || nk.hoVaTen || '').toLowerCase();
        return ten.includes(dialogSearch.toLowerCase().trim());
    });

    // Kiểm tra xem nút "Lưu thay đổi" có được phép sáng lên hay không
    const hasChanges = Object.entries(soDuInputs).some(([nkId, newVal]) => {
        const nk = nhaKhoaList.find(n => n._id === nkId);
        const arr = Array.isArray(nk?.soDuDauKy) ? nk.soDuDauKy : [];
        const sd = arr.find(item => item.thang === FIXED_THANG && item.nam === SODUDAUKY_NAM);
        const oldVal = (sd && sd.soTien !== undefined && sd.soTien !== null) ? String(sd.soTien) : '';
        return newVal !== oldVal;
    });

    const handleInputChange = (nkId, val) => {
        const digits = val.replace(/[^0-9]/g, '');
        setSoDuInputs(prev => ({
            ...prev,
            [nkId]: digits,
        }));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: 2, fontFamily: FONT } } }}
        >
            <DialogTitle sx={{
                fontFamily: FONT, fontWeight: 700, fontSize: '1rem',
                bgcolor: '#1a237e', color: '#fff',
                display: 'flex', alignItems: 'center', justifyBetween: 'space-between',
                py: 1.5, px: 2.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Nhập số dư đầu kỳ gốc
                    <Chip
                        label={`Tháng ${FIXED_THANG}/${SODUDAUKY_NAM}`}
                        size="small"
                        sx={{ bgcolor: '#283593', color: '#fff', fontFamily: FONT, fontSize: '0.75rem', fontWeight: 700 }}
                    />
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Khu vực tìm kiếm nha khoa */}
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid #e0e4f0' }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Tìm kiếm nha khoa cần cấu hình..."
                        value={dialogSearch}
                        onChange={e => setDialogSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: '#9e9e9e' }} />
                                    </InputAdornment>
                                ),
                                sx: { fontFamily: FONT, fontSize: '0.85rem' },
                            },
                        }}
                    />
                </Box>

                {/* Danh sách nha khoa điền số dư */}
                <Box sx={{ maxHeight: 380, overflowY: 'auto', px: 2.5, py: 1, bgcolor: '#fafbff' }}>
                    {dialogLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} sx={{ color: '#1a237e' }} />
                        </Box>
                    ) : filteredNhaKhoa.length === 0 ? (
                        <Typography color="text.secondary" sx={{ fontFamily: FONT, py: 3, textAlign: 'center', fontSize: '0.85rem' }}>
                            Không tìm thấy nha khoa khớp với từ khóa
                        </Typography>
                    ) : (
                        filteredNhaKhoa.map((nk, i) => (
                            <Box
                                key={nk._id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    py: 1.2,
                                    borderBottom: i < filteredNhaKhoa.length - 1 ? '1px solid #f0f0f0' : 'none',
                                }}
                            >
                                <Typography sx={{
                                    flex: 1, fontFamily: FONT, fontSize: '0.85rem',
                                    fontWeight: soDuInputs[nk._id] ? 600 : 400,
                                    color: soDuInputs[nk._id] ? '#1a237e' : '#616161',
                                }}>
                                    {nk.tenGiaoDich || nk.hoVaTen}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="0"
                                    value={soDuInputs[nk._id]
                                        ? Number(soDuInputs[nk._id]).toLocaleString('vi-VN')
                                        : ''}
                                    onChange={e => handleInputChange(nk._id, e.target.value)}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#9e9e9e', fontWeight: 600 }}>₫</Typography>
                                                </InputAdornment>
                                            ),
                                            sx: { fontFamily: FONT, fontSize: '0.85rem', bgcolor: '#fff' },
                                        },
                                    }}
                                    sx={{ width: 160 }}
                                />
                            </Box>
                        ))
                    )}
                </Box>

                {saveError && (
                    <Box px={2.5} py={1}>
                        <Alert severity="error" sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{saveError}</Alert>
                    </Box>
                )}
                {saveSuccess && (
                    <Box px={2.5} py={1}>
                        <Alert severity="success" sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>
                            Đã cập nhật số dư công nợ Tháng {FIXED_THANG} thành công!
                        </Alert>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e0e4f0', gap: 1 }}>
                <Button onClick={onClose} sx={{ fontFamily: FONT, color: '#757575', textTransform: 'none' }}>
                    Đóng cửa sổ
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />}
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    sx={{
                        fontFamily: FONT, fontWeight: 600, textTransform: 'none',
                        bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' },
                        borderRadius: 1.5, px: 2.5
                    }}
                >
                    {saving ? 'Đang lưu...' : `Lưu thay đổi`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}