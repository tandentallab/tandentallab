import React from "react";
import TextField from "@mui/material/TextField";

const MoneyInput = ({ value, onChange, label }) => {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    onChange(Number(raw));
  };

  return (
    <TextField
      fullWidth
      label={label}
      value={Number(value || 0).toLocaleString("vi-VN")}
      onChange={handleChange}
    />
  );
};

export default MoneyInput;
