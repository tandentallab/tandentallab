import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchAllPhieuNhapKho } from "../../redux/slices/phieuNhapKhoSlice"

export default function NhapXuatTable() {
    const dispatch = useDispatch();
    const phieuNhapKho = useSelector((state) => state.phieuNhapKho);

    const formatDateTime = (value) => {
        if (!value) return "";
        return new Date(value).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    };

    useEffect(() => {
        dispatch(fetchAllPhieuNhapKho({
            page: 1,
            limit: 10
        }))
            .unwrap()
            .then((data) => {
                console.log('Fetched data:', data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
    }, [dispatch]);

    return (
        <div>
            <h2>Phiếu Nhập Kho</h2>
            {phieuNhapKho.loading && <p>Loading...</p>}
            {phieuNhapKho.error && <p>Error: {phieuNhapKho.error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>Ngày tạo</th>
                        <th>Số</th>
                        <th>Nhà cung cấp</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    {phieuNhapKho.phieuNhapKhos?.map((phieu) => (
                        <tr key={phieu.soPhieu}>
                            <td>{formatDateTime(phieu.ngayTao)}</td>
                            <td>{phieu.soPhieu}</td>
                            <td>{phieu.nhaCungCap.ten}</td>
                            <td>{formatCurrency(phieu.tongTien)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}