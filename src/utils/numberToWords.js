/**
 * Chuyển số tiền thành chữ Việt Nam chuẩn chính tả và kế toán
 * Ví dụ: 8050000 -> "Tám triệu không trăm năm mươi nghìn đồng"
 */

const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const scale = ['', 'nghìn', 'triệu', 'tỷ'];

function readThreeDigits(num, showHundreds) {
  const hundreds = Math.floor(num / 100);
  const tensVal = Math.floor((num % 100) / 10);
  const onesVal = num % 10;
  
  let res = '';
  
  // Đọc hàng trăm
  if (hundreds > 0) {
    res += ones[hundreds] + ' trăm';
  } else if (showHundreds) {
    res += 'không trăm';
  }
  
  // Đọc hàng chục và hàng đơn vị
  if (tensVal > 0) {
    if (res) res += ' ';
    if (tensVal === 1) {
      res += 'mười';
    } else {
      res += ones[tensVal] + ' mươi';
    }
    
    if (onesVal > 0) {
      res += ' ';
      if (onesVal === 1) {
        if (tensVal > 1) {
          res += 'mốt';
        } else {
          res += 'một';
        }
      } else if (onesVal === 5) {
        res += 'lăm';
      } else if (onesVal === 4) {
        if (tensVal > 1) {
          res += 'tư';
        } else {
          res += 'bốn';
        }
      } else {
        res += ones[onesVal];
      }
    }
  } else {
    // tensVal === 0
    if (onesVal > 0) {
      if (res) {
        res += ' lẻ ' + ones[onesVal];
      } else {
        res += ones[onesVal];
      }
    }
  }
  
  return res;
}

export function numberToWords(num) {
  if (num === 0) return 'Không đồng';
  
  if (num < 0) return 'Âm ' + numberToWords(-num).toLowerCase();
  
  let temp = Math.floor(num);
  let groups = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  
  let words = [];
  let hasValueBefore = false;
  
  for (let i = groups.length - 1; i >= 0; i--) {
    const val = groups[i];
    if (val > 0) {
      const showHundreds = hasValueBefore;
      const groupWords = readThreeDigits(val, showHundreds);
      
      let suffix = '';
      if (i > 0) {
        suffix = scale[i];
      }
      
      words.push(groupWords + (suffix ? ' ' + suffix : ''));
      hasValueBefore = true;
    }
  }
  
  let resultStr = words.join(' ');
  resultStr = resultStr.charAt(0).toUpperCase() + resultStr.slice(1);
  return resultStr + ' đồng';
}

export default numberToWords;
