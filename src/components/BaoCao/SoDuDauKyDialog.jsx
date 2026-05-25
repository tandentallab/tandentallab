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
const SODUDAUKY_THANG = 6;
const SODUDAUKY_NAM = 2026;

export default function SoDuDauKyDialog({ open, onClose }) {
    const [dialogSearch, setDialogSearch] = useState('');
    const [nhaKhoaList, setNhaKhoaList] = useState([]);
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
                const sd = nk.soDuDauKy;
                if (sd?.thang === SODUDAUKY_THANG && sd?.nam === SODUDAUKY_NAM && sd?.soTien) {
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

    // Fetch khi dialog mở
    React.useEffect(() => {
        if (open) handleOpen();
    }, [open, handleOpen]);

    const handleSave = async () => {
        setSaving(true);
        setSaveError('');
        setSaveSuccess(false);
        try {
            const entries = Object.entries(soDuInputs).filter(([, v]) => v !== '');
            await Promise.all(
                entries.map(([id, soTien]) =>
                    api.put(`/nhakhoa/${id}/so-du-dau-ky`, {
                        thang: SODUDAUKY_THANG,
                        nam: SODUDAUKY_NAM,
                        soTien: Number(String(soTien).replace(/\./g, '').replace(/,/g, '')) || 0,
                    })
                )
            );
            setSaveSuccess(true);
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

    const filledCount = Object.values(soDuInputs).filter(v => v !== '').length;

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
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                py: 1.5, px: 2.5,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Nhập số dư đầu kỳ
                    <Chip
                        label="Tháng 6/2026"
                        size="small"
                        sx={{ bgcolor: '#283593', color: '#fff', fontFamily: FONT, fontSize: '0.7rem' }}
                    />
                </Box>
                <IconButton size="small" onClick={onClose} sx={{ color: '#fff' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Search */}
                <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid #e0e4f0' }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Tìm nha khoa..."
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
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONT, mt: 0.5, display: 'block' }}>
                        Đã nhập: {filledCount}/{nhaKhoaList.length} nha khoa
                    </Typography>
                </Box>

                {/* List */}
                <Box sx={{ maxHeight: 420, overflowY: 'auto', px: 2.5, py: 1 }}>
                    {dialogLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} sx={{ color: '#1a237e' }} />
                        </Box>
                    ) : filteredNhaKhoa.length === 0 ? (
                        <Typography color="text.secondary" sx={{ fontFamily: FONT, py: 3, textAlign: 'center', fontSize: '0.85rem' }}>
                            Không tìm thấy nha khoa
                        </Typography>
                    ) : (
                        filteredNhaKhoa.map((nk, i) => (
                            <Box
                                key={nk._id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    py: 1,
                                    borderBottom: i < filteredNhaKhoa.length - 1 ? '1px solid #f0f0f0' : 'none',
                                }}
                            >
                                <Typography sx={{
                                    flex: 1, fontFamily: FONT, fontSize: '0.85rem',
                                    fontWeight: soDuInputs[nk._id] ? 600 : 400,
                                    color: soDuInputs[nk._id] ? '#212121' : '#757575',
                                }}>
                                    {nk.tenGiaoDich || nk.hoVaTen}
                                </Typography>
                                <TextField
                                    size="small"
                                    placeholder="0"
                                    value={soDuInputs[nk._id]
                                        ? Number(soDuInputs[nk._id]).toLocaleString('vi-VN')
                                        : ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setSoDuInputs(prev => ({ ...prev, [nk._id]: val }));
                                    }}
                                    slotProps={{
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <Typography sx={{ fontSize: '0.75rem', color: '#9e9e9e' }}>₫</Typography>
                                                </InputAdornment>
                                            ),
                                            sx: { fontFamily: FONT, fontSize: '0.85rem' },
                                        },
                                    }}
                                    sx={{ width: 160 }}
                                />
                            </Box>
                        ))
                    )}
                </Box>

                {saveError && (
                    <Box px={2.5} pb={1}>
                        <Alert severity="error" sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>{saveError}</Alert>
                    </Box>
                )}
                {saveSuccess && (
                    <Box px={2.5} pb={1}>
                        <Alert severity="success" sx={{ fontFamily: FONT, fontSize: '0.82rem' }}>Lưu thành công!</Alert>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e0e4f0', gap: 1 }}>
                <Button onClick={onClose} sx={{ fontFamily: FONT, color: '#757575' }}>
                    Đóng
                </Button>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon fontSize="small" />}
                    onClick={handleSave}
                    disabled={saving || filledCount === 0}
                    sx={{
                        fontFamily: FONT, fontWeight: 600,
                        bgcolor: '#1a237e', '&:hover': { bgcolor: '#283593' },
                        borderRadius: 1.5,
                    }}
                >
                    {saving ? 'Đang lưu...' : `Lưu (${filledCount})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}