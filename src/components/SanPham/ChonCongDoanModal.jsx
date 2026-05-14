import React, { useState, useEffect, useMemo } from "react";
import { Modal, Box, Typography, IconButton, Button, TextField } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchCongDoan } from "../../redux/slices/congDoanSlice";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const SortableStageItem = ({ id, name, index, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : 1 };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
            className={`flex justify-between items-center bg-white p-2 border-x border-b border-gray-200 first:border-t transition cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg bg-blue-50 relative z-10" : ""}`}
        >
            <Typography className="text-[14px] text-gray-800">
                <span className="mr-2 text-gray-400">{index + 1}.</span>
                <strong className="font-bold">{name}</strong>
            </Typography>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRemove(id); }}>
                <CloseIcon sx={{ fontSize: 18, color: "#333" }} />
            </IconButton>
        </div>
    );
};

export default function ChonCongDoanModal({ open, onClose, onConfirm, currentSteps = [] }) {
    const dispatch = useDispatch();
    const { data: globalStages = [] } = useSelector((state) => state.congDoan || {});
    const [search, setSearch] = useState("");
    const [selectedSteps, setSelectedSteps] = useState([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        if (open) {
            dispatch(fetchCongDoan());
            const initial = (currentSteps || []).map((s, idx) => ({
                id: `step-${idx}-${Date.now()}-${Math.random()}`,
                name: s.tenCongDoan || s,
            }));
            setSelectedSteps(initial);
        }
    }, [open, dispatch, currentSteps]);

    const handleAdd = (name) => {
        setSelectedSteps([...selectedSteps, { id: `${name}-${Date.now()}-${Math.random()}`, name }]);
    };

    const handleRemove = (id) => setSelectedSteps(selectedSteps.filter((s) => s.id !== id));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        // 👉 ĐÃ FIX LỖI: Kiểm tra 'over' có tồn tại trước khi dùng over.id (chống văng app khi kéo ra ngoài)
        if (over && active.id !== over.id) {
            setSelectedSteps((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleConfirm = () => {
        onConfirm(selectedSteps.map((s, idx) => ({ tenCongDoan: s.name, thuTu: idx + 1 })));
        onClose();
    };

    const filtered = useMemo(() => {
        return (globalStages || []).filter(s =>
            s?.tenCongDoan?.toLowerCase().includes(search.toLowerCase())
        );
    }, [globalStages, search]);

    return (
        <Modal open={open} onClose={onClose} disableEnforceFocus>
            <Box className="bg-white w-[95%] md:w-[650px] lg:w-[750px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl flex flex-col h-[85vh] md:h-[650px] overflow-hidden border border-gray-100">
                <div className="bg-[#03a9f4] px-4 py-3 flex justify-between items-center shrink-0 text-white shadow-sm">
                    <Typography className="font-bold text-[18px] md:text-[20px] ml-1">Quy trình sản xuất</Typography>
                    <IconButton onClick={onClose} color="inherit" size="small" className="bg-[#0288d1] p-1">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div className="flex flex-col md:flex-row p-3 md:p-5 gap-4 md:gap-6 flex-1 overflow-hidden">
                    <div className="w-full md:w-[45%] flex flex-col h-1/2 md:h-full overflow-hidden">
                        <TextField variant="standard" placeholder="Tìm kiếm" fullWidth value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2 }} />
                        <div className="flex-1 overflow-y-auto border border-gray-100 rounded">
                            {filtered.map((s, i) => (
                                <div key={i} className="flex justify-between items-center py-2.5 px-3 border-b border-x border-gray-200 first:border-t">
                                    <Typography className="text-[15px] text-gray-800">{s.tenCongDoan}</Typography>
                                    <IconButton size="small" onClick={() => handleAdd(s.tenCongDoan)} className="bg-gray-50 p-0.5 border border-gray-300">
                                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full md:w-[55%] flex flex-col h-1/2 md:h-full overflow-hidden">
                        <Typography className="text-gray-700 mb-2 text-[14px] md:text-[15px] ml-1 font-medium">Sản phẩm</Typography>
                        <div className="flex-1 overflow-y-auto border border-gray-300 rounded-sm bg-gray-50 p-1">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                                <SortableContext items={selectedSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                    <div className="flex flex-col">
                                        {selectedSteps.map((s, i) => <SortableStageItem key={s.id} id={s.id} name={s.name} index={i} onRemove={handleRemove} />)}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                <div className="p-3 md:p-4 flex justify-end bg-white border-t border-gray-50">
                    <Button variant="contained" onClick={handleConfirm} className="bg-[#03a9f4] hover:bg-[#0288d1] w-full md:w-auto text-white rounded-full px-8 py-2 normal-case font-bold shadow-none">
                        Xác nhận
                    </Button>
                </div>
            </Box>
        </Modal>
    );
}