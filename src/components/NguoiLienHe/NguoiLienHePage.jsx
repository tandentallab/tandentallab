import React from "react";
import NguoiLienHeTable from "./NguoiLienHeTable";

export default function NguoiLienHePage() {
  const data = [
    {
      _id: "lh001",
      hoVaTen: "Nguyễn Văn An",
      email: "an.nguyen@gmail.com",
      soDienThoai: "0909123456",
      tieuDe: "Tư vấn dịch vụ tẩy trắng răng",
      moTa: "Tôi muốn tìm hiểu về dịch vụ tẩy trắng răng và chi phí",
      nhaKhoa: {
        _id: "nk001",
        hoVaTen: "Nha Khoa Sài Gòn",
      },
      createdAt: "2026-04-15T10:20:00Z",
      updatedAt: "2026-04-15T10:20:00Z",
    },
    {
      _id: "lh002",
      hoVaTen: "Trần Thị Mai",
      email: "mai.tran@gmail.com",
      soDienThoai: "0988776655",
      tieuDe: "Niềng răng cho trẻ em",
      moTa: "Con tôi 12 tuổi, muốn tư vấn niềng răng",
      nhaKhoa: {
        _id: "nk002",
        hoVaTen: "Nha Khoa Việt Đức",
      },
      createdAt: "2026-04-14T09:00:00Z",
      updatedAt: "2026-04-14T09:00:00Z",
    },
    {
      _id: "lh003",
      hoVaTen: "Lê Hoàng Nam",
      email: "nam.le@gmail.com",
      soDienThoai: "0911222333",
      tieuDe: "Cấy ghép implant",
      moTa: "Tôi cần tư vấn implant răng hàm dưới",
      nhaKhoa: {
        _id: "nk001",
        hoVaTen: "Nha Khoa Sài Gòn",
      },
      createdAt: "2026-04-12T14:30:00Z",
      updatedAt: "2026-04-12T14:30:00Z",
    },
  ];

  const nhaKhoas = [
    {
      _id: "nk001",
      hoVaTen: "Nha Khoa Sài Gòn",
      tenGiaoDich: "SAIGON DENTAL",
      soDienThoai: "02812345678",
      email: "contact@saigondental.vn",
      website: "https://saigondental.vn",
      quocGia: "Việt Nam",
      tinh: "Hồ Chí Minh",
      quanHuyen: "Quận 1",
      diaChiCuThe: "123 Nguyễn Huệ, Quận 1",
      moTa: "Hệ thống nha khoa tiêu chuẩn quốc tế tại TP.HCM",
      createdAt: "2026-04-01T08:00:00Z",
      updatedAt: "2026-04-10T10:00:00Z",
    },
    {
      _id: "nk002",
      hoVaTen: "Nha Khoa Việt Đức",
      tenGiaoDich: "VIET DUC DENTAL",
      soDienThoai: "02488889999",
      email: "info@vietducdental.vn",
      website: "https://vietducdental.vn",
      quocGia: "Việt Nam",
      tinh: "Hà Nội",
      quanHuyen: "Cầu Giấy",
      diaChiCuThe: "45 Trần Thái Tông, Cầu Giấy",
      moTa: "Phòng khám chuyên sâu chỉnh nha và implant",
      createdAt: "2026-03-20T09:00:00Z",
      updatedAt: "2026-04-12T12:30:00Z",
    },
    {
      _id: "nk003",
      hoVaTen: "Nha Khoa Cần Thơ Smile",
      tenGiaoDich: "CT SMILE DENTAL",
      soDienThoai: "02923888888",
      email: "support@ctsmile.vn",
      website: "https://ctsmile.vn",
      quocGia: "Việt Nam",
      tinh: "Cần Thơ",
      quanHuyen: "Ninh Kiều",
      diaChiCuThe: "78 Lý Tự Trọng, Ninh Kiều",
      moTa: "Nha khoa hiện đại tại khu vực miền Tây",
      createdAt: "2026-02-15T07:30:00Z",
      updatedAt: "2026-04-05T14:00:00Z",
    },
    {
      _id: "nk004",
      hoVaTen: "Nha Khoa Đà Nẵng Care",
      tenGiaoDich: "DANANG CARE DENTAL",
      soDienThoai: "02363636363",
      email: "contact@danangcare.vn",
      website: "https://danangcare.vn",
      quocGia: "Việt Nam",
      tinh: "Đà Nẵng",
      quanHuyen: "Hải Châu",
      diaChiCuThe: "12 Bạch Đằng, Hải Châu",
      moTa: "Phòng khám nha khoa công nghệ cao tại Đà Nẵng",
      createdAt: "2026-01-10T10:00:00Z",
      updatedAt: "2026-04-15T09:45:00Z",
    },
    {
      _id: "nk005",
      hoVaTen: "Nha Khoa Sài Gòn Premium",
      tenGiaoDich: "SG PREMIUM DENTAL",
      soDienThoai: "02877778888",
      email: "premium@saigondental.vn",
      website: "https://premium.saigondental.vn",
      quocGia: "Việt Nam",
      tinh: "Hồ Chí Minh",
      quanHuyen: "Quận 7",
      diaChiCuThe: "99 Nguyễn Thị Thập, Quận 7",
      moTa: "Dịch vụ nha khoa cao cấp VIP",
      createdAt: "2026-03-01T11:20:00Z",
      updatedAt: "2026-04-16T16:10:00Z",
    },
  ];

  const handleAdd = () => {};

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Người liên hệ</h2>
      </div>

      <NguoiLienHeTable data={data} />
    </div>
  );
}
