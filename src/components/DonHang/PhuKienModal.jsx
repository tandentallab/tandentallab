import React, { useState, useEffect } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';

const PhuKienModal = ({ isOpen, onClose, initialSelected, onSave }) => {
    const allPhuKien = [
        "Analog", "Cây so màu", "Dấu sơ khởi", "Giá khớp", "Gối sáp",
        "Hàm khung", "Hàm tháo lắp", "Hàm đối diện", "Khay lấy dấu",
        "Răng cũ", "Sáp cắn", "Trụ abutment"
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedList, setSelectedList] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedList([...initialSelected]);
            setSearchTerm('');
        }
    }, [isOpen, initialSelected]);

    if (!isOpen) return null;

    const filteredPhuKien = allPhuKien.filter(pk => pk.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSelect = (pkName) => {
        const exist = selectedList.find(item => item.tenPhuKien === pkName);
        if (!exist) {
            setSelectedList([...selectedList, { tenPhuKien: pkName, soLuong: 1, soHuu: 'Nha khoa' }]);
        }
    };

    const handleRemove = (index) => {
        const newList = [...selectedList];
        newList.splice(index, 1);
        setSelectedList(newList);
    };

    // Hàm cập nhật Radio Button Sở Hữu
    const setSoHuu = (index, value) => {
        const newList = [...selectedList];
        newList[index].soHuu = value;
        setSelectedList(newList);
    };

    const setSoLuong = (index, value) => {
        const newList = [...selectedList];
        newList[index].soLuong = Math.max(0, parseInt(value));
        setSelectedList(newList);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[10000] flex justify-center items-center">
            <div className="bg-white w-[800px] h-[500px] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#00a8ff] text-white px-4 py-3 flex justify-between items-center shrink-0">
                    <h3 className="font-semibold text-lg">Phụ kiện</h3>
                    <button onClick={onClose} className="text-2xl font-bold hover:text-gray-200 leading-none">&times;</button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Cột trái */}
                    <div className="w-[300px] border-r flex flex-col bg-gray-50">
                        <div className="p-3 border-b">
                            <input
                                type="text" placeholder="Tìm kiếm phụ kiện"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-1.5 border rounded outline-none text-sm"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {filteredPhuKien.map((pk, idx) => (
                                <div key={idx} onClick={() => handleSelect(pk)} className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-100 cursor-pointer">
                                    <span className="text-sm font-medium text-gray-700">{pk}</span>
                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="flex-1 flex flex-col p-4 bg-white">
                        <div className="flex text-sm font-semibold text-gray-600 border-b pb-2 mb-2">
                            <div className="w-12 text-center">S.L</div>
                            <div className="flex-1">Phụ kiện</div>
                            <div className="w-40 text-center">Sở hữu</div>
                            <div className="w-8"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {selectedList.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10 text-sm">Vui lòng chọn</div>
                            ) : (
                                selectedList.map((item, idx) => (
                                    <div key={idx} className="flex items-center text-sm py-3 border-b border-gray-50 hover:bg-gray-50">
                                        <div className="w-12 flex justify-center">
                                            <input
                                                type="number"
                                                min={0}
                                                value={item.soLuong}
                                                onChange={(e) => setSoLuong(idx, e.target.value)}
                                                className="w-10 text-center border-b border-gray-300 focus:border-blue-500 outline-none font-medium bg-transparent"
                                            />
                                        </div>
                                        <div className="flex-1 text-gray-800 font-medium">{item.tenPhuKien}</div>

                                        <div className="w-40 flex justify-center gap-4">
                                            <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                                                <input
                                                    type="radio"
                                                    name={`sohuu-${idx}`}
                                                    checked={item.soHuu === 'Lab'}
                                                    onChange={() => setSoHuu(idx, 'Lab')}
                                                    className="w-4 h-4 text-blue-600 cursor-pointer accent-green-600"
                                                /> Lab
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-gray-700">
                                                <input
                                                    type="radio"
                                                    name={`sohuu-${idx}`}
                                                    checked={item.soHuu === 'Nha khoa'}
                                                    onChange={() => setSoHuu(idx, 'Nha khoa')}
                                                    className="w-4 h-4 text-blue-600 cursor-pointer accent-green-600"
                                                /> Nha khoa
                                            </label>
                                        </div>

                                        <div className="w-8 text-center text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleRemove(idx)}>
                                            <DeleteIcon />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex justify-end bg-gray-50 shrink-0">
                    <button onClick={() => { onSave(selectedList); onClose(); }} className="bg-[#00a8ff] hover:bg-blue-500 text-white px-8 py-2 rounded-full shadow-sm text-sm font-bold transition">
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhuKienModal;