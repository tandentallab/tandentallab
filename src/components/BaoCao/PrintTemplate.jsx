import React from 'react';
import dayjs from 'dayjs';

const PrintTemplate = ({ data, startDate, endDate }) => {
    // Tính tổng cộng hệ thống
    const totals = data?.reduce((acc, curr) => ({
        m: acc.m + (curr.t_moi || 0),
        s: acc.s + (curr.t_sua || 0),
        b: acc.b + (curr.t_bh || 0),
        l: acc.l + (curr.t_ll || 0),
        t: acc.t + (curr.t_tong || 0),
    }), { m: 0, s: 0, b: 0, l: 0, t: 0 });

    // Hiển thị dải ngày chi tiết
    const fullDateRange = ` ${dayjs(startDate).format('DD/MM/YYYY')} - ${dayjs(endDate).format('DD/MM/YYYY')}`;

    return (
        <div className="w-full text-black leading-tight">

            {/* THÔNG TIN DOANH NGHIỆP */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24">
                        <img
                            src="/logo_tan_dental.jpg"
                            alt="Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-center text-xl font-bold">Công ty TNHH Tấn Dental</h1>
                        <p className="text-center text-lg">Số 43, đường số 14, KDC Hồng Phát, phường An Bình, TP Cần Thơ</p>
                        <p className="text-center text-lg">Điện thoại: 0842312828</p>
                    </div>
                </div>
            </div>

            {/* TIÊU ĐỀ BÁO CÁO */}
            <div className="mb-6">
                <h2 className="text-center text-xl font-bold uppercase tracking-widest">
                    Sản lượng theo thời gian
                </h2>
            </div>

            <div className="text-right flex justify-between mb-2">
                <p className="text-sm font-medium">Thời gian: {fullDateRange}</p>
                <p className="text-sm italic">Ngày lập: {dayjs().format('DD/MM/YYYY')}</p>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <table className="w-full border-collapse border-2 border-black text-[12px]">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border-2 border-black p-2 text-center uppercase">Sản phẩm</th>
                        <th className="border-2 border-black p-2 w-[12%] text-center">Mới</th>
                        <th className="border-2 border-black p-2 w-[12%] text-center">Sửa</th>
                        <th className="border-2 border-black p-2 w-[12%] text-center">Bảo hành</th>
                        <th className="border-2 border-black p-2 w-[12%] text-center">Làm lại</th>
                        <th className="border-2 border-black p-2 w-[14%] text-center">Tổng cộng</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.map((type, idx) => (
                        <React.Fragment key={idx}>

                            {/* Tầng 1: Loại sản phẩm */}
                            <tr className="font-bold bg-gray-200">
                                <td className="border-2 border-black p-2 uppercase">{type._id || 'KHÁC'}</td>
                                <td className="border-2 border-black p-2 text-center">{type.t_moi}</td>
                                <td className="border-2 border-black p-2 text-center">{type.t_sua}</td>
                                <td className="border-2 border-black p-2 text-center">{type.t_bh}</td>
                                <td className="border-2 border-black p-2 text-center">{type.t_ll}</td>
                                <td className="border-2 border-black p-2 text-center font-black">{type.t_tong}</td>
                            </tr>

                            {type.groups?.map((group, gIdx) => (
                                <React.Fragment key={gIdx}>

                                    {/* Tầng 2: Nhóm sản phẩm */}
                                    <tr className="font-bold italic">
                                        <td className="border-2 border-black p-2 pl-6">{group.tenNhom}</td>
                                        <td className="border-2 border-black p-2 text-center">{group.moi}</td>
                                        <td className="border-2 border-black p-2 text-center">{group.sua}</td>
                                        <td className="border-2 border-black p-2 text-center">{group.baoHanh}</td>
                                        <td className="border-2 border-black p-2 text-center">{group.lamLai}</td>
                                        <td className="border-2 border-black p-2 text-center">{group.tong}</td>
                                    </tr>

                                    {group.products?.map((p, pIdx) => (
                                        // Tầng 3: Sản phẩm chi tiết
                                        <tr key={pIdx}>
                                            <td className="border-2 border-black p-1.5 pl-12">{p.ten}</td>
                                            <td className="border-2 border-black p-1.5 text-center">{p.moi}</td>
                                            <td className="border-2 border-black p-1.5 text-center">{p.sua}</td>
                                            <td className="border-2 border-black p-1.5 text-center">{p.baoHanh}</td>
                                            <td className="border-2 border-black p-1.5 text-center">{p.lamLai}</td>
                                            <td className="border-2 border-black p-1.5 text-center">{p.tong}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* Dòng tổng cộng */}
                    <tr className="font-black bg-gray-100 text-sm">
                        <td className="border-2 border-black p-3 uppercase">Tổng cộng</td>
                        <td className="border-2 border-black p-3 text-center">{totals?.m}</td>
                        <td className="border-2 border-black p-3 text-center">{totals?.s}</td>
                        <td className="border-2 border-black p-3 text-center">{totals?.b}</td>
                        <td className="border-2 border-black p-3 text-center">{totals?.l}</td>
                        <td className="border-2 border-black p-3 text-center">{totals?.t}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PrintTemplate;