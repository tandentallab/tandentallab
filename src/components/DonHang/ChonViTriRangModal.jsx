import React, { useEffect, useMemo, useState } from 'react';

// ── FDI Notation ──────────────────────────────────────────────────────────────
const upperLeft = [18, 17, 16, 15, 14, 13, 12, 11];
const upperRight = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerLeft = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerRight = [31, 32, 33, 34, 35, 36, 37, 38];

const allTeeth = [...upperLeft, ...upperRight, ...lowerLeft, ...lowerRight];
const upperRow = [...upperLeft, ...upperRight];
const lowerRow = [...lowerLeft, ...lowerRight];

// ── Layout constants ──────────────────────────────────────────────────────────
const TW = 84;          // tooth width  (px)
const TH = 152;          // tooth height (px)
const GAP = 1;           // gap between teeth
const SEC_GAP = 1;          // center gap between left/right sections
const CELL = TW + GAP;    // 45px per column

// x-position (left edge) for column col (0–15)
const colToX = (col) =>
    col < 8 ? col * CELL : 8 * CELL + SEC_GAP + (col - 8) * CELL;

const ROW_W = colToX(15) + TW;   // total row width in px

// ── Tooth icon component ──────────────────────────────────────────────────────
function ToothIcon({ num, isRoi, isCau, isDragging: drag }) {
    let overlayBg = null;
    let borderColor = 'transparent';
    if (drag) { overlayBg = 'rgba(147,197,253,0.45)'; borderColor = '#60a5fa'; }
    else if (isCau) { overlayBg = 'rgba(249,115,22,0.30)'; borderColor = '#f97316'; }
    else if (isRoi) { overlayBg = 'rgba(37,99,235,0.22)'; borderColor = '#2563eb'; }

    return (
        <div
            style={{
                position: 'relative',
                width: TW,
                height: TH,
                borderRadius: 4,
                border: `2px solid ${borderColor}`,
                boxSizing: 'border-box',
                flexShrink: 0,
            }}
        >
            <img
                src={`/teeth/tooth_${num}.svg`}
                alt={String(num)}
                draggable={false}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            />
            {overlayBg && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlayBg,
                        borderRadius: 2,
                        pointerEvents: 'none',
                    }}
                />
            )}
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

    useEffect(() => {
        if (visible) setSelectedObjects(initialViTri || []);
    }, [visible]);

    // Map: toothNumber → 'Rời' | 'Cầu'
    const selectedMap = useMemo(() => {
        const m = new Map();
        selectedObjects.forEach((obj) => obj.soRang.forEach((t) => m.set(t, obj.kieu)));
        return m;
    }, [selectedObjects]);

    // Drag range check
    const getStatus = (num) => {
        const inDrag = (() => {
            if (!isDragging || dragStart == null || dragCurrent == null) return false;
            const si = allTeeth.indexOf(dragStart);
            const ei = allTeeth.indexOf(dragCurrent);
            const ci = allTeeth.indexOf(num);
            return ci >= Math.min(si, ei) && ci <= Math.max(si, ei);
        })();
        return {
            isRoi: selectedMap.get(num) === 'Rời',
            isCau: selectedMap.get(num) === 'Cầu',
            isDragging: inDrag,
        };
    };

    // Commit a drag selection
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
                // Split upper jaw and lower jaw into separate bridges
                const upperPart = range.filter(t => upperRow.includes(t));
                const lowerPart = range.filter(t => lowerRow.includes(t));

                if (upperPart.length > 0 && lowerPart.length > 0) {
                    // Cross-jaw: add two separate entries
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
                    // Same jaw: single bridge
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

    // Global mouseup listener so dragging works even if mouse leaves modal
    useEffect(() => {
        const up = () => commitDrag();
        window.addEventListener('mouseup', up);
        return () => window.removeEventListener('mouseup', up);
    }, [isDragging, dragStart, dragCurrent]);

    // ── Bridge bar computation ─────────────────────────────────────────────────
    // Returns array of { start, end, isDrag } (column indices 0-15 in the 16-col row)
    const getBridgeBars = (row) => {
        const bars = [];

        // Committed Cầu bridges
        selectedObjects
            .filter((o) => o.kieu === 'Cầu')
            .forEach((bridge) => {
                const cols = row
                    .map((t, i) => (bridge.soRang.includes(t) ? i : -1))
                    .filter((i) => i >= 0);
                if (!cols.length) return;
                let gs = cols[0], ge = cols[0];
                for (let k = 1; k < cols.length; k++) {
                    if (cols[k] === ge + 1) { ge = cols[k]; }
                    else { bars.push({ start: gs, end: ge }); gs = ge = cols[k]; }
                }
                bars.push({ start: gs, end: ge });
            });

        // Live drag preview (multi-tooth)
        if (isDragging && dragStart != null && dragCurrent != null) {
            const si = allTeeth.indexOf(dragStart);
            const ei = allTeeth.indexOf(dragCurrent);
            if (Math.abs(si - ei) >= 1) {
                const mn = Math.min(si, ei), mx = Math.max(si, ei);
                const cols = row
                    .map((t, i) => { const ci = allTeeth.indexOf(t); return ci >= mn && ci <= mx ? i : -1; })
                    .filter((i) => i >= 0);
                if (cols.length > 1)
                    bars.push({ start: cols[0], end: cols[cols.length - 1], isDrag: true });
            }
        }
        return bars;
    };

    // ── Mouse event helpers ────────────────────────────────────────────────────
    const bindCell = (num) => ({
        onMouseDown: () => { setIsDragging(true); setDragStart(num); setDragCurrent(num); },
        onMouseEnter: () => { if (isDragging) setDragCurrent(num); },
        onContextMenu: (e) => {
            e.preventDefault();
            setSelectedObjects((prev) => prev.filter((o) => !o.soRang.includes(num)));
        },
    });

    // ── Render a 16-tooth image row ────────────────────────────────────────────
    const renderImageRow = (row, isUpper) => {
        const bars = getBridgeBars(row);
        return (
            <div style={{ position: 'relative', width: ROW_W }}>
                {/* Orange bridge bars */}
                {bars.map((bar, i) => {
                    const x1 = colToX(bar.start);
                    const x2 = colToX(bar.end) + TW;
                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                left: x1,
                                width: x2 - x1,
                                height: 3,
                                borderRadius: 2,
                                backgroundColor: bar.isDrag ? '#93c5fd' : '#f97316',
                                top: isUpper ? 0 : undefined,
                                bottom: isUpper ? undefined : 0,
                                zIndex: 20,
                            }}
                        />
                    );
                })}

                {/* Tooth cells */}
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', gap: GAP }}>
                        {row.slice(0, 8).map((num) => {
                            const s = getStatus(num);
                            return (
                                <div key={num} style={{ cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                                    <ToothIcon num={num} {...s} />
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ width: SEC_GAP, flexShrink: 0 }} />
                    <div style={{ display: 'flex', gap: GAP }}>
                        {row.slice(8).map((num) => {
                            const s = getStatus(num);
                            return (
                                <div key={num} style={{ cursor: 'pointer', userSelect: 'none' }} {...bindCell(num)}>
                                    <ToothIcon num={num} {...s} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ── Render a 16-tooth number row ───────────────────────────────────────────
    const renderNumberRow = (row) => (
        <div style={{ display: 'flex', width: ROW_W }}>
            <div style={{ display: 'flex', gap: GAP }}>
                {row.slice(0, 8).map((num) => {
                    const s = getStatus(num);
                    const sel = s.isRoi || s.isCau || s.isDragging;
                    return (
                        <div
                            key={num}
                            style={{
                                width: TW, textAlign: 'center',
                                fontSize: 13, padding: '3px 0',
                                fontWeight: sel ? 700 : 500,
                                color: sel ? '#1d4ed8' : '#4b5563',
                                cursor: 'pointer', userSelect: 'none',
                            }}
                            {...bindCell(num)}
                        >
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
                        <div
                            key={num}
                            style={{
                                width: TW, textAlign: 'center',
                                fontSize: 13, padding: '3px 0',
                                fontWeight: sel ? 700 : 500,
                                color: sel ? '#1d4ed8' : '#4b5563',
                                cursor: 'pointer', userSelect: 'none',
                            }}
                            {...bindCell(num)}
                        >
                            {num}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ── Early exit ─────────────────────────────────────────────────────────────
    if (!visible) return null;

    const roiText = selectedObjects
        .filter((s) => s.kieu === 'Rời').map((s) => s.soRang[0]).join(', ');
    const cauText = selectedObjects
        .filter((s) => s.kieu === 'Cầu')
        .map((s) => `${s.soRang[0]}->${s.soRang[s.soRang.length - 1]}`).join(', ');

    // Vertical center divider x-position (midpoint of the section gap)
    const dividerX = colToX(7) + TW + SEC_GAP / 2;

    return (
        <div
            className="fixed inset-0 z-[100000] bg-black/40 flex items-center justify-center p-4"
            onMouseUp={() => commitDrag()}
        >
            <div
                className="bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col select-none"
                style={{ minWidth: ROW_W + 64 }}
            >
                {/* ── Header ─────────────────────────────────────────────────────── */}
                <div className="bg-[#00a8ff] text-white px-6 py-3 flex items-center justify-between">
                    <span className="text-[18px] font-semibold">Vị trí</span>
                    <button
                        onClick={onClose}
                        className="text-2xl font-bold leading-none hover:opacity-80"
                    >
                        &times;
                    </button>
                </div>

                {/* ── Body ───────────────────────────────────────────────────────── */}
                <div className="px-8 py-5">
                    {/* Product name + summary */}
                    <div className="flex gap-10 items-start mb-5">
                        <div
                            className="font-bold text-gray-800 uppercase text-sm shrink-0"
                            style={{ minWidth: 130 }}
                        >
                            {tenSanPham}
                        </div>
                        <div className="text-sm text-gray-700 space-y-0.5">
                            {roiText && <div><b>Rời:</b>  {roiText}</div>}
                            {cauText && <div><b>Cầu:</b>  {cauText}</div>}
                            {!roiText && !cauText && (
                                <div className="text-gray-400 italic">Chưa chọn răng nào</div>
                            )}
                        </div>
                    </div>

                    {/* Tooth chart */}
                    <div style={{ position: 'relative' }}>
                        {/* Vertical center divider */}
                        <div
                            style={{
                                position: 'absolute',
                                left: dividerX,
                                top: 0, bottom: 0,
                                width: 1,
                                backgroundColor: '#d1d5db',
                                zIndex: 5,
                            }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            {/* Upper images (root up, crown down) */}
                            <div style={{ paddingTop: 6 }}>
                                {renderImageRow(upperRow, true)}
                            </div>

                            {/* Upper tooth numbers */}
                            {renderNumberRow(upperRow)}

                            {/* Horizontal divider */}
                            <div
                                style={{
                                    height: 1,
                                    width: ROW_W,
                                    backgroundColor: '#d1d5db',
                                    margin: '3px 0',
                                }}
                            />

                            {/* Lower tooth numbers */}
                            {renderNumberRow(lowerRow)}

                            {/* Lower images (crown up, root down) */}
                            <div style={{ paddingBottom: 6 }}>
                                {renderImageRow(lowerRow, false)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer ─────────────────────────────────────────────────────── */}
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