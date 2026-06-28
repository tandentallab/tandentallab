// Format số thành chuỗi tiền VND, ví dụ: 1234567 -> "1.234.567"
export const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN').format(amount ?? 0);

// Loại bỏ mọi ký tự không phải số trong chuỗi nhập vào, trả về number nguyên
// Dùng cho input số tiền để người dùng có thể gõ và thấy format VND ngay lúc nhập
export const parseVNDInput = (value) => {
    const digitsOnly = String(value ?? '').replace(/\D/g, '');
    return digitsOnly ? Number(digitsOnly) : 0;
};

// Màu Chip theo loại chi phí
export const loaiChiPhiColor = (loai) => {
    switch (loai) {
        case 'Điện nước':
            return { bg: '#dbeafe', text: '#1d4ed8' };
        case 'Sửa chữa':
            return { bg: '#d1fae5', text: '#065f46' };
        default:
            return { bg: '#f3f4f6', text: '#374151' };
    }
};