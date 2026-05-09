import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchThongKeCongNoHoaDon } from "../../redux/slices/hoaDonSlice";
import { FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";

const formatCurrency = (value = 0) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const CardThongKe = ({ title, value, subTitle, color, icon: Icon }) => {
  return (
    <div
      style={{
        flex: "1 1 240px", // Thu hẹp độ rộng tối thiểu
        background: "#fff",
        padding: "16px", // Giảm padding từ 24px xuống 16px
        borderRadius: "8px", // Bo góc nhỏ hơn một chút cho cân đối
        boxShadow:
          "0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        borderLeft: `4px solid ${color}`, // Border mỏng hơn
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.05)";
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            color: "#6B7280",
            fontSize: "12px", // Thu nhỏ tiêu đề
            fontWeight: "600",
            marginBottom: "4px",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {title.toUpperCase()}
        </div>
        <div
          style={{
            color: "#111827",
            fontSize: "20px", // Thu nhỏ số tiền từ 28px xuống 20px
            fontWeight: "700",
            letterSpacing: "-0.3px",
          }}
        >
          {formatCurrency(value)}
        </div>
        <div
          style={{
            color: color,
            fontSize: "12px", // Thu nhỏ phụ đề
            marginTop: "4px",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: "8px" }}>●</span> {subTitle}
        </div>
      </div>

      <div
        style={{
          backgroundColor: `${color}12`,
          padding: "8px", // Giảm size vùng chứa icon
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "12px",
        }}
      >
        <Icon size={22} color={color} /> {/* Thu nhỏ icon từ 32 xuống 22 */}
      </div>
    </div>
  );
};

const ThongKeCongNo = ({ nhaKhoaId }) => {
  const dispatch = useDispatch();
  const { thongKeCongNo, loading } = useSelector((state) => state.hoaDon);

  useEffect(() => {
    dispatch(fetchThongKeCongNoHoaDon(nhaKhoaId));
  }, [dispatch, nhaKhoaId]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "15px",
          color: "#9CA3AF",
          fontSize: "14px",
        }}
      >
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px", // Giảm khoảng cách giữa các card
        width: "100%",
        flexWrap: "wrap",
        padding: "8px 0",
      }}
    >
      <CardThongKe
        title="Tổng nợ"
        value={thongKeCongNo?.conNo?.tongTien || 0}
        subTitle={`${thongKeCongNo?.conNo?.soHoaDon || 0} hóa đơn`}
        color="#059669"
        icon={FiCheckCircle}
      />

      <CardThongKe
        title="Quá hạn"
        value={thongKeCongNo?.treHan?.tongTien || 0}
        subTitle={`${thongKeCongNo?.treHan?.soHoaDon || 0} hóa đơn`}
        color="#DC2626"
        icon={FiAlertCircle}
      />

      <CardThongKe
        title="Sắp đến hạn"
        value={thongKeCongNo?.chuaDenHan?.tongTien || 0}
        subTitle={`${thongKeCongNo?.chuaDenHan?.soHoaDon || 0} hóa đơn`}
        color="#2563EB"
        icon={FiClock}
      />
    </div>
  );
};

export default ThongKeCongNo;
