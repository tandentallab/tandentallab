/**
 * Chuyển số tiền thành chữ Việt Nam
 * Ví dụ: 8050000 -> "Tám triệu không trăm năm mươi nghìn đồng"
 */

const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười năm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín'];
const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
const scale = ['', 'nghìn', 'triệu', 'tỷ'];

function convertHundreds(num) {
  let result = '';
  
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  
  if (hundreds > 0) {
    result += ones[hundreds] + ' trăm';
  }
  
  if (remainder > 0) {
    if (hundreds > 0) result += ' ';
    
    if (remainder < 10) {
      if (hundreds > 0 && remainder > 0) result += 'lẻ ';
      result += ones[remainder];
    } else if (remainder < 20) {
      result += teens[remainder - 10];
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      result += tens[ten];
      if (one > 0) {
        result += ' ' + ones[one];
      }
    }
  }
  
  return result.trim();
}

export function numberToWords(num) {
  if (num === 0) return 'không đồng';
  
  if (num < 0) return 'âm ' + numberToWords(-num);
  
  let words = '';
  let groupIndex = 0;
  
  while (num > 0 && groupIndex < scale.length) {
    const group = num % 1000;
    
    if (group !== 0) {
      let groupWords = convertHundreds(group);
      
      if (groupIndex > 0 && scale[groupIndex]) {
        groupWords += ' ' + scale[groupIndex];
      }
      
      if (words) {
        words = groupWords + ' ' + words;
      } else {
        words = groupWords;
      }
    }
    
    num = Math.floor(num / 1000);
    groupIndex++;
  }
  
  // Capitalize first letter
  words = words.charAt(0).toUpperCase() + words.slice(1);
  
  return words + ' đồng';
}

export default numberToWords;
