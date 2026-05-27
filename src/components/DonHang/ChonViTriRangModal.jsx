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
const TW = 42;          // tooth width  (px)
const TH = 76;          // tooth height (px)
const GAP = 3;           // gap between teeth
const SEC_GAP = 22;          // center gap between left/right sections
const CELL = TW + GAP;    // 45px per column

// x-position (left edge) for column col (0–15)
const colToX = (col) =>
    col < 8 ? col * CELL : 8 * CELL + SEC_GAP + (col - 8) * CELL;

const ROW_W = colToX(15) + TW;   // total row width in px

// ── Tooth SVG paths ───────────────────────────────────────────────────────────
// Upper orientation: root at top (small y), crown at bottom (large y)
// viewBox "0 0 44 90"
// Lower teeth use transform="scale(1,-1) translate(0,-90)" to flip → y' = 90-y
const PATHS = {
    // 1 – Central incisor: narrow root, slightly flared rectangular crown
    1: `M22 5
      C19 5 17 11 16 25 C15 39 15 54 17 62
      C13 64 10 70 10 79 C10 85 15 90 22 90 C29 90 34 85 34 79
      C34 70 31 64 27 62
      C29 54 29 39 28 25 C27 11 25 5 22 5 Z`,

    // 2 – Lateral incisor: similar but slightly smaller
    2: `M22 6
      C19 6 17 12 16 26 C15 40 16 54 18 62
      C14 64 12 69 12 77 C12 83 16 88 22 88 C28 88 32 83 32 77
      C32 69 30 64 26 62
      C28 54 29 40 28 26 C27 12 25 6 22 6 Z`,

    // 3 – Canine: long root, pointed crown tip
    3: `M22 5
      C19 5 16 13 15 28 C14 44 15 58 16 67
      C15 73 14 79 15 85 L22 90 L29 85
      C30 79 29 73 28 67
      C29 58 30 44 29 28 C28 13 25 5 22 5 Z`,

    // 4 – First premolar: two cusps, slightly wider crown
    4: `M22 5
      C18 5 15 11 14 24 C13 37 14 52 16 62
      C12 64 8 70 8 79 C8 86 13 90 19 90 L22 90 L25 90
      C31 90 36 86 36 79 C36 70 32 64 28 62
      C30 52 31 37 30 24 C29 11 26 5 22 5 Z`,

    // 5 – Second premolar: similar to 4
    5: `M22 5
      C18 5 15 11 14 24 C13 37 14 51 16 61
      C12 63 8 69 8 78 C8 85 13 89 19 89 L22 89 L25 89
      C31 89 36 85 36 78 C36 69 32 63 28 61
      C30 51 31 37 30 24 C29 11 26 5 22 5 Z`,

    // 6 – First molar: wide, dual-root visible, wide crown
    6: `M15 4
      C12 4 10 8  9 17 C8 26  9 36 11 44
      C8 47  5 53  5 63 C5 73  8 80 13 85
      C16 87 19 89 22 89 C25 89 28 87 31 85
      C36 80 39 73 39 63 C39 53 36 47 33 44
      C35 36 36 26 35 17 C34 8 32 4 29 4 L22 3 Z`,

    // 7 – Second molar
    7: `M15 5
      C12 5 10 9  9 18 C8 27  9 37 11 45
      C8 48  5 54  5 64 C5 74  8 81 13 85
      C16 87 19 88 22 88 C25 88 28 87 31 85
      C36 81 39 74 39 64 C39 54 36 48 33 45
      C35 37 36 27 35 18 C34 9 32 5 29 5 L22 4 Z`,

    // 8 – Wisdom tooth (slightly shorter crown)
    8: `M16 6
      C13 6 11 10 10 19 C9 28 10 38 12 46
      C9 49  7 55  7 64 C7 74 10 80 15 84
      C18 86 20 87 22 87 C24 87 26 86 29 84
      C34 80 37 74 37 64 C37 55 35 49 32 46
      C34 38 35 28 34 19 C33 10 31 6 28 6 L22 5 Z`,
};

// ── Tooth icon component ──────────────────────────────────────────────────────
function ToothIcon({ num, isUpper, isRoi, isCau, isDragging: drag }) {
    const type = num % 10 || 8;
    const d = PATHS[type] || PATHS[1];

    // Color scheme
    let fill = '#eef5ff';
    let stroke = '#93c5fd';
    let sw = 1.6;
    if (drag) { fill = '#dbeafe'; stroke = '#60a5fa'; sw = 2; }
    else if (isCau) { fill = '#fff7ed'; stroke = '#f97316'; sw = 2; }
    else if (isRoi) { fill = '#bfdbfe'; stroke = '#2563eb'; sw = 2; }

    // Flip vertically for lower teeth: y' = 90 - y
    const g = isUpper ? undefined : 'scale(1,-1) translate(0,-90)';

    // Cervical line position (separating root from crown)
    const cx = isUpper ? 62 : 90 - 62;   // y-coord after potential flip is irrelevant since we're in pre-transform space
    const cervicalY = 62;

    return (
        <svg
            viewBox="0 0 44 90"
            width={TW}
            height={TH}
            style={{ display: 'block', overflow: 'visible' }}
        >
            <g transform={g}>
                {/* Main silhouette */}
                <path
                    d={d}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                {/* Subtle cervical line (crown–root junction) */}
                <path
                    d={`M14 ${cervicalY} Q22 ${cervicalY + 5} 30 ${cervicalY}`}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="0.8"
                    strokeOpacity="0.45"
                />
                {/* Molar root bifurcation hint */}
                {type >= 6 && (
                    <line
                        x1="22" y1="18" x2="22" y2="42"
                        stroke={stroke}
                        strokeWidth="0.7"
                        strokeOpacity="0.35"
                    />
                )}
            </g>
        </svg>
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
                                    <ToothIcon num={num} isUpper={isUpper} {...s} />
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
                                    <ToothIcon num={num} isUpper={isUpper} {...s} />
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