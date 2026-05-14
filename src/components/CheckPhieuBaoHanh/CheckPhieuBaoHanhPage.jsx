import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../config/api';
import { toast } from 'sonner';
import { Container, Paper, TextField, Button, CircularProgress, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Tooth position grid - FDI notation
const TEETH_GRID = {
  upper: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28],
  lower: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38],
};

// Parse viTriRang to extract tooth numbers
const parseToothPositions = (viTriRang) => {
  if (!viTriRang) return [];
  
  const positions = new Set();
  
  // Split by semicolon for multiple entries (Rời and Cầu)
  const entries = viTriRang.split(';').map(e => e.trim());
  
  entries.forEach(entry => {
    // Match patterns like "Rời: 18, 17, 16" or "Cầu: 14-12"
    const numberMatches = entry.match(/\d+/g);
    if (numberMatches) {
      numberMatches.forEach(num => {
        positions.add(parseInt(num));
      });
    }
    
    // Handle range notation like 14-12
    const rangeMatch = entry.match(/(\d+)\s*-\s*(\d+)/g);
    if (rangeMatch) {
      rangeMatch.forEach(range => {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          positions.add(i);
        }
      });
    }
  });
  
  return Array.from(positions);
};

const ToothPositionGrid = ({ positions }) => {
  return (
    <div className="space-y-3">
      {/* Upper teeth */}
      <div>
        <div className="text-xs font-bold text-gray-600 mb-2">Hàm trên</div>
        <div className="flex flex-wrap gap-1">
          {TEETH_GRID.upper.map((tooth) => (
            <div
              key={`upper-${tooth}`}
              className={`
                w-8 h-8 flex items-center justify-center text-xs font-semibold rounded
                border border-gray-300
                ${positions.includes(tooth) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              {tooth}
            </div>
          ))}
        </div>
      </div>

      {/* Lower teeth */}
      <div>
        <div className="text-xs font-bold text-gray-600 mb-2">Hàm dưới</div>
        <div className="flex flex-wrap gap-1">
          {TEETH_GRID.lower.map((tooth) => (
            <div
              key={`lower-${tooth}`}
              className={`
                w-8 h-8 flex items-center justify-center text-xs font-semibold rounded
                border border-gray-300
                ${positions.includes(tooth) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}
            >
              {tooth}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckPhieuBaoHanhPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [warranty, setWarranty] = useState(null);
  const [searched, setSearched] = useState(false);

  // Auto-search if qrcode parameter exists
  useEffect(() => {
    const qrcode = searchParams.get('qrcode');
    if (qrcode && qrcode.trim()) {
      setCode(qrcode.trim());
      searchWarranty(qrcode.trim());
    }
  }, [searchParams]);

  const searchWarranty = async (searchCode) => {
    if (!searchCode || searchCode.trim() === '') {
      toast.error('Vui lòng nhập mã bảo hành hoặc mã QR');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await api.get(`/public/check-warranty/${searchCode.trim()}`);
      if (res.data?.success) {
        setWarranty(res.data.data);
        toast.success('Tìm thấy thông tin bảo hành');
      } else {
        setWarranty(null);
        toast.error(res.data?.message || 'Không tìm thấy thông tin');
      }
    } catch (err) {
      setWarranty(null);
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy phiếu bảo hành. Vui lòng kiểm tra lại mã.');
      } else {
        toast.error(err.response?.data?.message || 'Lỗi khi tra cứu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchWarranty(code);
  };

  const handleCodeChange = (e) => {
    // Allow alphanumeric warranty codes and QR codes
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setCode(value);
  };

  const handleClear = () => {
    setCode('');
    setWarranty(null);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Container maxWidth="md">
        {/* Header */}
        <Box className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">PHIẾU BẢO HÀNH RĂNG SỨ</h1>
          <p className="text-gray-600 text-lg">Dental Warranty Certificate</p>
        </Box>

        {/* Search Card */}
        <Paper elevation={3} className="p-6 mb-8 bg-white">
          <form onSubmit={handleSearch} className="space-y-4">
            <TextField
              fullWidth
              label="Mã bảo hành"
              value={code}
              onChange={handleCodeChange}
              disabled={loading}
              variant="outlined"
              size="medium"
              inputProps={{ 
                maxLength: 20,
                inputMode: 'text'
              }}
              InputProps={{
                startAdornment: (
                  <SearchIcon style={{ marginRight: 8, color: '#0066cc' }} />
                ),
              }}
            />

            <Box className="flex gap-3">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !code.trim()}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : 'Tra cứu'}
              </Button>
              {warranty && (
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  size="large"
                >
                  Xóa
                </Button>
              )}
            </Box>
          </form>
        </Paper>

        {/* Loading */}
        {searched && loading && (
          <Box className="flex justify-center py-12">
            <CircularProgress />
          </Box>
        )}

        {/* Results - Certificate Format */}
        {searched && !loading && warranty && (
          <Paper elevation={3} className="bg-white">
            {/* Certificate Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <h2 className="text-2xl font-bold text-center">PHIẾU BẢO HÀNH RĂNG SỨ</h2>
              <p className="text-center text-sm mt-1">Dental Warranty Certificate</p>
            </div>

            {/* Certificate Content */}
            <div className="p-8 space-y-6">
              {/* Warranty Status */}
              <div className={`p-4 rounded-lg ${warranty.isValid ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Trạng thái:</span>
                  <span className={`text-xl font-bold ${warranty.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {warranty.isValid ? '✓ Còn hiệu lực' : '✗ Hết hiệu lực'}
                  </span>
                </div>
                {warranty.status && (
                  <div className="text-sm text-gray-700 mt-2">{warranty.status}</div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Khách hàng */}
                  <div className="border-b-2 pb-4">
                    <div className="text-sm text-gray-600 mb-2">👤 Khách hàng</div>
                    <div className="font-bold text-lg">
                      {warranty.benhNhan?.ten || '---'}
                    </div>
                    {warranty.benhNhan?.soDienThoai && (
                      <div className="text-sm text-gray-600 mt-1">
                        ☎ {warranty.benhNhan.soDienThoai}
                      </div>
                    )}
                  </div>

                  {/* Nha khoa */}
                  <div className="border-b-2 pb-4">
                    <div className="text-sm text-gray-600 mb-2">🏥 Nha khoa</div>
                    <div className="font-bold text-lg">
                      {warranty.nhaKhoa?.ten || '---'}
                    </div>
                    {warranty.nhaKhoa?.soDienThoai && (
                      <div className="text-sm text-gray-600 mt-1">
                        {warranty.nhaKhoa.soDienThoai}
                      </div>
                    )}
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div className="border-b-2 pb-4">
                    <div className="text-sm text-gray-600 mb-2">🦷 Sản phẩm trong phiếu</div>
                    <div className="space-y-3">
                      {(warranty.danhSachSanPham || []).map((item, index) => (
                        <div key={index} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                          <div className="font-bold text-base text-blue-700 mb-1">
                            {item.tenSanPham || '---'}
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <div>Vị trí: {item.viTriRang || '---'}</div>
                            <div>Số lượng: {item.soLuong || 1}</div>
                            <div>Màu: {item.mau || '---'}</div>
                            <div>Hiệu lực: {new Date(item.baoHanhTu).toLocaleDateString('vi-VN')} - {new Date(item.baoHanhDen).toLocaleDateString('vi-VN')}</div>
                            <div className={`font-medium ${item.isValid ? 'text-green-600' : 'text-red-600'}`}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Mã bảo hành */}
                  <div className="border-b-2 pb-4">
                    <div className="text-sm text-gray-600 mb-2">📋 Mã bảo hành</div>
                    <div className="font-bold text-lg font-mono bg-gray-100 p-2 rounded">
                      {warranty.maBaoHanh}
                    </div>
                  </div>

                  {/* Mã QR */}
                  <div className="border-b-2 pb-4">
                    <div className="text-sm text-gray-600 mb-2">📱 Mã QR</div>
                    <div className="font-bold text-3xl text-orange-600 text-center py-2">
                      {warranty.maQR}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vị trí răng - Grid theo từng sản phẩm */}
              {(warranty.danhSachSanPham || []).map((item, index) => (
                <div key={index} className="border-t-2 pt-6">
                  <div className="text-sm text-gray-600 mb-3 font-bold"> VỊ TRÍ RĂNG - {item.tenSanPham || `Sản phẩm ${index + 1}`}</div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ToothPositionGrid positions={parseToothPositions(item.viTriRang)} />
                  </div>
                  <div className="text-xs text-gray-500 mt-3 italic">
                    <strong>Ghi chú:</strong> {item.viTriRang || 'Không có thông tin vị trí'}
                  </div>
                </div>
              ))}

              {/* Mẫu thẻ */}
              {warranty.mauTheTi && (
                <div className="border-t-2 pt-4">
                  <div className="text-sm text-gray-600 mb-2">Mẫu thẻ</div>
                  <div className="font-medium">{warranty.mauTheTi}</div>
                </div>
              )}

              {/* Ghi chú */}
              {warranty.ghiChu && (
                <div className="border-t-2 pt-4">
                  <div className="text-sm text-gray-600 mb-2">Ghi chú</div>
                  <div className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">
                    {warranty.ghiChu}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-100 px-8 py-4 rounded-b-lg border-t text-center">
              <p className="text-xs text-gray-600">
                © TanDental - Giải pháp quản lý nha khoa
              </p>
            </div>

            {/* Action Button */}
            <Box className="p-4 text-center">
              <Button
                variant="contained"
                color="primary"
                onClick={handleClear}
                size="large"
              >
                Tra cứu khác
              </Button>
            </Box>
          </Paper>
        )}

        {/* No Results */}
        {searched && !loading && !warranty && (
          <Paper elevation={2} className="p-8 text-center bg-yellow-50">
            <p className="text-lg text-gray-700 mb-4">
              ❌ Không tìm thấy thông tin bảo hành
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng kiểm tra lại mã (chỉ nhập phần số)
            </p>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClear}
            >
              Tra cứu lại
            </Button>
          </Paper>
        )}
      </Container>
    </div>
  );
};

export default CheckPhieuBaoHanhPage;
