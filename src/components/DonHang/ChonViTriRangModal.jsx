import React, { useEffect, useMemo, useRef, useState } from 'react';

// ── FDI Notation ──────────────────────────────────────────────────────────────
const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];

const allTeeth = [...upperLeft, ...upperRight, ...lowerLeft, ...lowerRight];
const upperRow = [...upperLeft, ...upperRight];
const lowerRow = [...lowerLeft, ...lowerRight];

// ── Desktop Layout constants ───────────────────────────────────────────────────
const TW = 84;
const TH = 152;
const GAP = 4;
const SEC_GAP = 1;
const CELL = TW + GAP;

const colToX = (col) =>
    col < 8 ? col * CELL : 8 * CELL + SEC_GAP + (col - 8) * CELL;

const ROW_W = colToX(15) + TW;

// ── Tooth icon ────────────────────────────────────────────────────────────────
function ToothIcon({ num, width, height }) {
    return (
        <div style={{ position: 'relative', width, height, flexShrink: 0 }}>
            <img
                src={`/teeth/tooth_${num}.svg`}
                alt={String(num)}
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
            />
        </div>
    );
}

// Mobile gap between teeth (px) — must match the flex gap below
const M_ROW_GAP = 3;
const M_N = 8; // teeth per section

// ── Mobile horizontal row of 8 teeth ─────────────────────────────────────────
// isUpper: border bar on bottom edge; !isUpper: on top edge
function MobileSection({ teeth, label, isUpper, selectedMap, currentDragRange, isDragging, bindCell, bindTouchCell }) {
    const rowRef = useRef(null);
    const [rowWidth, setRowWidth] = useState(0);

    useEffect(() => {
        if (!rowRef.current) return;
        const obs = new ResizeObserver(([e]) => setRowWidth(e.contentRect.width));
        obs.observe(rowRef.current);
        return () => obs.disconnect();
    }, []);

    const getStatus = (num) => ({
        isRoi: selectedMap.get(num) === 'Rời',
        isCau: selectedMap.get(num) === 'Cầu',
        isDragging: currentDragRange.includes(num),
    });

    // Compute contiguous horizontal segments for the border bar
    const getSegments = (isOrange) => {
        const indices = teeth
            .map((t, i) => ({ t, i }))
            .filter(({ t }) => isOrange ? currentDragRange.includes(t) : selectedMap.has(t))
            .map(({ i }) => i);

        const segs = [];
        if (!indices.length) return segs;
        let start = indices[0], end = indices[0];
        for (let k = 1; k < indices.length; k++) {
            if (indices[k] === end + 1) { end = indices[k]; }
            else { segs.push({ start, end }); start = end = indices[k]; }
        }
        segs.push({ start, end });
        return segs;
    };

    // Pixel-accurate position: each cell = (rowWidth - gaps) / N
    // left  = col * (cellW + gap)
    // width = count * cellW + (count-1) * gap
    const cellW = rowWidth > 0 ? (rowWidth - M_ROW_GAP * (M_N - 1)) / M_N : 0;
    const segStyle = (seg) => ({
        left: seg.start * (cellW + M_ROW_GAP),
        width: (seg.end - seg.start + 1) * cellW + (seg.end - seg.start) * M_ROW_GAP,
    });

    const renderBorders = (segs, color) =>
        segs.map((seg, i) => (
            <div key={i} style={{
                position: 'absolute',
                ...segStyle(seg),
                height: 3, borderRadius: 2,
                backgroundColor: color, zIndex: 50,
                ...(isUpper ? { bottom: 0 } : { top: 0 }),
            }} />
        ));

    return (
        <div style={{ width: '100%' }}>
            {/* Section label */}
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4, marginBottom: 2 }}>
                {label}
            </div>

            {/* Number row */}
            <div style={{ display: 'flex', width: '100%', gap: M_ROW_GAP }}>
                {teeth.map((num) => {
                    const s = getStatus(num);
                    const sel = s.isRoi || s.isCau || s.isDragging;
                    return (
                        <div
                            key={num}
                            style={{
                                flex: 1, textAlign: 'center', fontSize: 10,
                                padding: '1px 0',
                                fontWeight: sel ? 700 : 500,
                                color: s.isDragging ? 'orange' : (sel ? 'blue' : '#9ca3af'),
                                cursor: 'pointer', userSelect: 'none',
                            }}
                            {...bindCell(num)}
                            {...bindTouchCell(num)}
                        >
                            {num}
                        </div>
                    );
                })}
            </div>

            {/* Image row with border overlay */}
            <div
                ref={rowRef}
                style={{ position: 'relative', width: '100%', paddingTop: isUpper ? 0 : 3, paddingBottom: isUpper ? 3 : 0 }}
            >
                {renderBorders(getSegments(false), 'blue')}
                {isDragging && renderBorders(getSegments(true), 'orange')}

                <div style={{ display: 'flex', width: '100%', gap: M_ROW_GAP }}>
                    {teeth.map((num) => (
                        <div
                            key={num}
                            style={{ flex: 1, cursor: 'pointer', userSelect: 'none', minWidth: 0 }}
                            {...bindCell(num)}
                            {...bindTouchCell(num)}
                        >
                            <ToothIcon num={num} width="100%" height={56} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ChonViTriRangModal({
    isOpen, open, onClose, onSave, onConfirm,
    initialViTri = [], tenSanPham = 'Sản phẩm',
}) {
    const visible = isOpen || open;

    const [selectedObjects, setSelectedObjects] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragCurrent, setDragCurrent] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (visible) setSelectedObjects(initialViTri || []);
    }, [visible]);

    const selectedMap = useMemo(() => {
        const m = new Map();
        selectedObjects.forEach((obj) => obj.soRang.forEach((t) => m.set(t, obj.kieu)));
        return m;
    }, [selectedObjects]);

    const currentDragRange = useMemo(() => {
        if (!isDragging || dragStart == null || dragCurrent == null) return [];
        const si = allTeeth.indexOf(dragStart);
        const ei = allTeeth.indexOf(dragCurrent);
        if (si === -1 || ei === -1) return [];
        return allTeeth.slice(Math.min(si, ei), Math.max(si, ei) + 1);
    }, [isDragging, dragStart, dragCurrent]);

    const getStatus = (num) => ({
        isRoi: selectedMap.get(num) === 'Rời',
        isCau: selectedMap.get(num) === 'Cầu',
        isDragging: currentDragRange.includes(num),
    });

    const commitDrag = () => {
        if (!isDragging) return;
        setIsDragging(false);
        const si = allTeeth.indexOf(dragStart);
        const ei = allTeeth.indexOf(dragCurrent);
        if (si === -1 || ei === -1) { setDragStart(null); setDragCurrent(null); return; }
        const range = allTeeth.slice(Math.min(si, ei), Math.max(si, ei) + 1);

        setSelectedObjects((prev) => {
            let next = [...prev];
            if (range.length === 1) {
                const t = range[0];
                next = next.some((o) => o.soRang.includes(t))
                    ? next.filter((o) => !o.soRang.includes(t))
                    : [...next, { kieu: 'Rời', soRang: [t] }];
            } else {
                const upperPart = range.filter(t => upperRow.includes(t));
                const lowerPart = range.filter(t => lowerRow.includes(t));
                if (upperPart.length > 0 && lowerPart.length > 0) {
                    if (upperPart.length === 1) {
                        if (!next.some(o => o.soRang.includes(upperPart[0])))
                            next = [...next, { kieu: 'Rời', soRang: upperPart }];
                    } else {
                        const dup = next.some(o => JSON.stringify(o.soRang) === JSON.stringify(upperPart));
                        if (!dup) next = [...next, { kieu: 'Cầu', soRang: upperPart }];
                    }
                    if (lowerPart.length === 1) {
                        if (!next.some(o => o.soRang.includes(lowerPart[0])))
                            next = [...next, { kieu: 'Rời', soRang: lowerPart }];
                    } else {
                        const dup = next.some(o => JSON.stringify(o.soRang) === JSON.stringify(lowerPart));
                        if (!dup) next = [...next, { kieu: 'Cầu', soRang: lowerPart }];
                    }
                } else {
                    const dup = next.some((o) => JSON.stringify(o.soRang) === JSON.stringify(range));
                    if (!dup) next = [...next, { kieu: 'Cầu', soRang: range }];
                }
            }
            const used = new Set();
            return next
                .filter((o) => {
                    if (o.soRang.some((t) => used.has(t))) return false;
                    o.soRang.forEach((t) => used.add(t));
                    return true;
                })
                .slice(0, 32);
        });
        setDragStart(null);
        setDragCurrent(null);
    };

    // Mouse events (desktop)
    useEffect(() => {
        const up = () => commitDrag();
        window.addEventListener('mouseup', up);
        return () => window.removeEventListener('mouseup', up);
    }, [isDragging, dragStart, dragCurrent]);

    const bindCell = (num) => ({
        onMouseDown: (e) => {
            if (e.button !== 0) return;
            setIsDragging(true);
            setDragStart(num);
            setDragCurrent(num);
        },
        onMouseEnter: () => { if (isDragging) setDragCurrent(num); },
        onContextMenu: (e) => {
            e.preventDefault();
            setSelectedObjects((prev) => prev.filter((o) => !o.soRang.includes(num)));
        },
    });

    const bindTouchCell = (num) => ({
        onTouchStart: (e) => {
            e.preventDefault();
            setIsDragging(true);
            setDragStart(num);
            setDragCurrent(num);
        },
        onTouchMove: (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!el) return;
            let node = el;
            while (node) {
                const n = parseInt(node.dataset?.tooth);
                if (!isNaN(n) && allTeeth.includes(n)) {
                    setDragCurrent(n);
                    break;
                }
                node = node.parentElement;
            }
        },
        onTouchEnd: (e) => {
            e.preventDefault();
            commitDrag();
        },
        'data-tooth': num,
    });

    // ── Desktop border layers ──────────────────────────────────────────────────
    const getBorderLayers = (row) => {
        const layers = [];
        selectedObjects.forEach((obj) => {
            const cols = row.map((t, i) => (obj.soRang.includes(t) ? i : -1)).filter((i) => i >= 0);
            if (cols.length === 0) return;
            let start = cols[0], end = cols[0];
            for (let k = 1; k < cols.length; k++) {
                if (cols[k] === end + 1) { end = cols[k]; }
                else { layers.push({ start, end, color: 'blue' }); start = end = cols[k]; }
            }
            layers.push({ start, end, color: 'blue' });
        });
        if (isDragging && currentDragRange.length > 0) {
            const dragCols = row.map((t, i) => (currentDragRange.includes(t) ? i : -1)).filter((i) => i >= 0);
            if (dragCols.length > 0) {
                let start = dragCols[0], end = dragCols[0];
                for (let k = 1; k < dragCols.length; k++) {
                    if (dragCols[k] === end + 1) { end = dragCols[k]; }
                    else { layers.push({ start, end, color: 'orange' }); start = end = dragCols[k]; }
                }
                layers.push({ start, end, color: 'orange' });
            }
        }
        return layers;
    };

    // ── Desktop render helpers ────────────────────────────────────────────────
    const renderImageRow = (row, isUpper) => {
        const borders = getBorderLayers(row);
        return (
            <div style={{ position: 'relative', width: ROW_W, overflow: 'visible', paddingTop: isUpper ? 0 : 12, paddingBottom: isUpper ? 12 : 0 }}>
                {borders.map((b, i) => {
                    const x1 = colToX(b.start);
                    const x2 = colToX(b.end) + TW;
                    const positionStyle = isUpper ? { top: 0 } : { bottom: 0 };
                    return (
                        <div key={i} style={{ position: 'absolute', left: x1, width: x2 - x1, height: 4, borderRadius: 2, backgroundColor: b.color, zIndex: 50, ...positionStyle }} />
                    );
                })}
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', gap: GAP }}>
                        {row.slice(0, 8).map((num) => (
                            <div key={num} style={{ cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                                <ToothIcon num={num} width={TW} height={TH} />
                            </div>
                        ))}
                    </div>
                    <div style={{ width: SEC_GAP, flexShrink: 0 }} />
                    <div style={{ display: 'flex', gap: GAP }}>
                        {row.slice(8).map((num) => (
                            <div key={num} style={{ cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                                <ToothIcon num={num} width={TW} height={TH} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderNumberRow = (row) => (
        <div style={{ display: 'flex', width: ROW_W }}>
            <div style={{ display: 'flex', gap: GAP }}>
                {row.slice(0, 8).map((num) => {
                    const s = getStatus(num);
                    const sel = s.isRoi || s.isCau || s.isDragging;
                    return (
                        <div key={num} style={{ width: TW, textAlign: 'center', fontSize: 13, padding: '3px 0', fontWeight: sel ? 700 : 500, color: s.isDragging ? 'orange' : (sel ? 'blue' : '#4b5563'), cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                            {num}
                        </div>
                    );
                })}
            </div>
            <div style={{ width: SEC_GAP }} />
            <div style={{ display: 'flex', gap: GAP }}>
                {row.slice(8).map((num) => {
                    const s = getStatus(num);
                    const sel = s.isRoi || s.isCau || s.isDragging;
                    return (
                        <div key={num} style={{ width: TW, textAlign: 'center', fontSize: 13, padding: '3px 0', fontWeight: sel ? 700 : 500, color: s.isDragging ? 'orange' : (sel ? 'blue' : '#4b5563'), cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                            {num}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    if (!visible) return null;

    const roiText = selectedObjects.filter((s) => s.kieu === 'Rời').map((s) => s.soRang[0]).join(', ');
    const cauText = selectedObjects.filter((s) => s.kieu === 'Cầu').map((s) => `${s.soRang[0]}->${s.soRang[s.soRang.length - 1]}`).join(', ');
    const dividerX = colToX(7) + TW + SEC_GAP / 2;

    // ── Mobile layout: 4 sections stacked vertically, each with 8 teeth in a row ─
    if (isMobile) {
        const sections = [
            { teeth: upperLeft, label: 'Hàm trên – Bên trái', isUpper: true },
            { teeth: upperRight, label: 'Hàm trên – Bên phải', isUpper: true },
            { teeth: lowerLeft, label: 'Hàm dưới – Bên trái', isUpper: false },
            { teeth: lowerRight, label: 'Hàm dưới – Bên phải', isUpper: false },
        ];

        return (
            <div
                className="fixed inset-0 z-[100000] bg-black/40 flex items-end justify-center"
                onMouseUp={() => commitDrag()}
            >
                <div
                    className="bg-white rounded-t-2xl shadow-2xl flex flex-col select-none w-full"
                    style={{ maxHeight: '94vh' }}
                >
                    {/* Header */}
                    <div className="bg-[#00a8ff] text-white px-5 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
                        <span className="text-base font-semibold">Vị trí răng</span>
                        <button onClick={onClose} className="text-2xl font-bold leading-none hover:opacity-80">&times;</button>
                    </div>

                    {/* Product + summary */}
                    <div className="px-4 pt-3 pb-2 shrink-0 border-b border-gray-100">
                        <div className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-0.5">{tenSanPham}</div>
                        <div className="text-xs text-gray-600 space-y-0.5 min-h-[14px]">
                            {roiText && <div><b>Rời:</b> {roiText}</div>}
                            {cauText && <div><b>Cầu:</b> {cauText}</div>}
                            {!roiText && !cauText && <div className="text-gray-400 italic">Chưa chọn răng nào</div>}
                        </div>
                    </div>

                    {/* 4 sections stacked */}
                    <div className="overflow-y-auto" style={{ flex: 1, minHeight: 0 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 12px 16px' }}>
                            {sections.map((sec, idx) => (
                                <div
                                    key={sec.label}
                                    style={{
                                        borderBottom: idx < 3 ? '1px solid #e5e7eb' : 'none',
                                        paddingTop: 8,
                                        paddingBottom: 8,
                                    }}
                                >
                                    <MobileSection
                                        {...sec}
                                        selectedMap={selectedMap}
                                        currentDragRange={currentDragRange}
                                        isDragging={isDragging}
                                        bindCell={bindCell}
                                        bindTouchCell={bindTouchCell}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-5 py-3 border-t bg-gray-50 shrink-0">
                        <button
                            onClick={() => {
                                if (onSave) onSave(selectedObjects);
                                if (onConfirm) onConfirm(selectedObjects);
                                onClose?.();
                            }}
                            className="bg-[#00a8ff] hover:bg-blue-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-md transition"
                        >
                            Đồng ý
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Desktop layout (unchanged) ────────────────────────────────────────────
    return (
        <div
            className="fixed inset-0 z-[100000] bg-black/40 flex items-center justify-center p-4"
            onMouseUp={() => commitDrag()}
        >
            <div
                className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col select-none"
                style={{ minWidth: ROW_W + 64 }}
            >
                <div className="bg-[#00a8ff] text-white px-6 py-3 flex items-center justify-between">
                    <span className="text-[18px] font-semibold">Vị trí</span>
                    <button onClick={onClose} className="text-2xl font-bold leading-none hover:opacity-80">&times;</button>
                </div>

                <div className="px-8 py-5">
                    <div className="flex gap-10 items-start mb-5">
                        <div className="font-bold text-gray-800 uppercase text-sm shrink-0" style={{ minWidth: 130 }}>
                            {tenSanPham}
                        </div>
                        <div className="text-sm text-gray-700 space-y-0.5">
                            {roiText && <div><b>Rời:</b>  {roiText}</div>}
                            {cauText && <div><b>Cầu:</b>  {cauText}</div>}
                            {!roiText && !cauText && <div className="text-gray-400 italic">Chưa chọn răng nào</div>}
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: dividerX, top: 0, bottom: 0, width: 1, backgroundColor: '#d1d5db', zIndex: 5 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ paddingTop: 6 }}>
                                {renderImageRow(upperRow, true)}
                            </div>
                            {renderNumberRow(upperRow)}
                            <div style={{ height: 1, width: ROW_W, backgroundColor: '#d1d5db', margin: '6px 0' }} />
                            {renderNumberRow(lowerRow)}
                            <div style={{ paddingBottom: 6 }}>
                                {renderImageRow(lowerRow, false)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end px-8 py-4 border-t bg-gray-50">
                    <button
                        onClick={() => {
                            if (onSave) onSave(selectedObjects);
                            if (onConfirm) onConfirm(selectedObjects);
                            onClose?.();
                        }}
                        className="bg-[#00a8ff] hover:bg-blue-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-md transition"
                    >
                        Đồng ý
                    </button>
                </div>
            </div>
        </div>
    );
}