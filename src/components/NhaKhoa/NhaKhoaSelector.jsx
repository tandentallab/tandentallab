import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Button,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import {
  applyBangGiaTemplate,
  fetchBangGiaByNhaKhoa,
} from "../../redux/slices/bangGiaSlice";

const ACCENT = "#0f766e";

const NhaKhoaSelector = ({ nhaKhoaData }) => {
  const [selectedNhaKhoa, setSelectedNhaKhoa] = useState(null);
  const handleChange = (newValue) => {
    setSelectedNhaKhoa(newValue);
  };
  const dispatch = useDispatch();

  const { data, loading } = useSelector((state) => state.nhaKhoa);

  const bangGia = useSelector((state) => state.bangGia);

  useEffect(() => {
    if (selectedNhaKhoa?._id) {
      dispatch(fetchBangGiaByNhaKhoa(selectedNhaKhoa._id));
    }
  }, [dispatch, selectedNhaKhoa]);
  useEffect(() => {
    if (!data.length) {
      dispatch(fetchNhaKhoa());
    }
  }, [dispatch, data.length]);

  const handleApply = () => {
    if (
      selectedNhaKhoa?._id &&
      window.confirm(
        `Bạn có chắc muốn áp dụng bảng giá của ${selectedNhaKhoa.hoVaTen} cho ${nhaKhoaData.hoVaTen} `
      )
    ) {
    }
    dispatch(
      applyBangGiaTemplate({
        sourceNhaKhoaId: selectedNhaKhoa?._id,

        targetNhaKhoaId: nhaKhoaData._id,
      })
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        p: 2,
        borderRadius: "14px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <Autocomplete
        options={data || []}
        value={selectedNhaKhoa || null}
        loading={loading}
        fullWidth
        getOptionLabel={(option) => option?.hoVaTen || ""}
        isOptionEqualToValue={(option, value) => option?._id === value?._id}
        onChange={(event, newValue) => {
          handleChange(newValue);
        }}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box>
              <Typography fontWeight={600}>{option.hoVaTen}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.tinh}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.diaChiCuThe}
              </Typography>
            </Box>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Áp dụng theo bảng giá của nha khoa"
            size="small"
            sx={{ backgroundColor: "#fff", borderRadius: "8px" }}
            InputProps={{
              ...(params.InputProps || {}),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress size={18} sx={{ color: ACCENT }} />
                  ) : null}
                  {params.InputProps?.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
      {selectedNhaKhoa?._id && (
        <Button
          onClick={handleApply}
          variant="contained"
          startIcon={<ContentCopyIcon />}
          sx={{
            backgroundColor: ACCENT,
            whiteSpace: "nowrap",
            "&:hover": { backgroundColor: "#0d6560" },
          }}
        >
          Lưu
        </Button>
      )}
    </Box>
  );
};

export default NhaKhoaSelector;
