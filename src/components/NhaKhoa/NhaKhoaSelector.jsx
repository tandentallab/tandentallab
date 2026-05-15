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

import { fetchNhaKhoa } from "../../redux/slices/nhaKhoaSlice";
import {
  applyBangGiaTemplate,
  fetchBangGiaByNhaKhoa,
} from "../../redux/slices/bangGiaSlice";

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
    <>
      <div className="flex p-2 items-center justify-between">
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

                <Typography variant="body2">{option.tinh}</Typography>

                <Typography variant="caption">{option.diaChiCuThe}</Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={"Áp dụng theo bảng giá của nha khoa: "}
              size="small"
              InputProps={{
                ...(params.InputProps || {}),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={20} /> : null}

                    {params.InputProps?.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        {selectedNhaKhoa?._id && <Button onClick={handleApply}>Lưu</Button>}
      </div>
    </>
  );
};

export default NhaKhoaSelector;
