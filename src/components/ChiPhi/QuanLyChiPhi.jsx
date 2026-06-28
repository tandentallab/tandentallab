import React, { useState } from 'react';
import { Box } from '@mui/material';
import PrintPreviewModal from './PrintPreviewModal';
import ChiPhiFilterBar from './ChiPhiFilterBar';
import ChiPhiForm from './ChiPhiForm';
import ChiPhiTable from './ChiPhiTable';

// ==========================================
// QUẢN LÝ CHI PHÍ
// ==========================================
const QuanLyChiPhi = ({ danhSachChiPhi, isLoading, filter, setFilter, onAdd, onDelete }) => {
    const [printData, setPrintData] = useState(null);

    return (
        <Box className="space-y-5">
            <ChiPhiFilterBar filter={filter} setFilter={setFilter} />

            <ChiPhiForm isLoading={isLoading} onAdd={onAdd} />

            <ChiPhiTable
                danhSachChiPhi={danhSachChiPhi}
                isLoading={isLoading}
                onPrint={setPrintData}
                onDelete={onDelete}
            />

            <PrintPreviewModal
                isOpen={!!printData}
                data={printData}
                onClose={() => setPrintData(null)}
            />
        </Box>
    );
};

export default QuanLyChiPhi;