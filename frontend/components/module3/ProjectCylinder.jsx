import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";

export default function ProjectCylinder({ rows = [] }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [fillProgress, setFillProgress] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    // Group by ProjectCode and get top 5
    const projectData = useMemo(() => {
        const grouped = {};
        rows.forEach(r => {
            const p = r.ProjectCode || "Unknown";
            grouped[p] = (grouped[p] || 0) + (parseFloat(r.OrderedLineQuantity) || 0);
        });

        return Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([label, value], i) => ({
                label,
                value,
                color: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"][i],
                dark: ["#1e40af", "#b45309", "#047857", "#991b1b", "#5b21b6"][i],
                mid: ["#2563eb", "#d97706", "#059669", "#dc2626", "#7c3aed"][i],
                light: ["#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa"][i],
                top: ["#93c5fd", "#fde047", "#6ee7b7", "#fca5a5", "#c4b5fd"][i],
            }));
    }, [rows]);

    const grandTotal = projectData.reduce((sum, d) => sum + d.value, 0) || 1;
    const percentages = projectData.map(d => ({ ...d, percentage: (d.value / grandTotal) * 100 }));

    useEffect(() => {
        const startDelay = setTimeout(() => setHasStarted(true), 500);
        return () => clearTimeout(startDelay);
    }, []);

    useEffect(() => {
        if (!hasStarted) return;
        const duration = 2000;
        const startTime = Date.now();
        let frame;
        const animate = () => {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            setFillProgress(1 - Math.pow(1 - progress, 3));
            if (progress < 1) frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [hasStarted]);

    // Cylinder dimensions
    const width = 100;
    const height = 180;
    const cx = 50;
    const rx = 25;
    const ry = 10;
    const topY = 25;
    const bottomY = 155;
    const bodyHeight = bottomY - topY;

    const segments = useMemo(() => {
        let currentY = bottomY;
        const segs = [];
        [...percentages].reverse().forEach((item, i) => {
            const idx = percentages.length - 1 - i;
            const h = (item.percentage / 100) * bodyHeight * fillProgress;
            const yStart = currentY - h;
            if (h > 0.5) segs.push({ idx, item, yStart, yEnd: currentY, h });
            currentY = yStart;
        });
        return segs;
    }, [percentages, bodyHeight, fillProgress]);

    const liquidTop = segments.length > 0 ? Math.min(...segments.map(s => s.yStart)) : bottomY;

    return (
        <div className="flex items-center gap-6 h-full w-full justify-between ">
            <div className="flex-shrink-0">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-22 h-40" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))' }}>
                    <defs>
                        {percentages.map((item, i) => (
                            <React.Fragment key={i}>
                                <linearGradient id={`projectBody${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={item.dark} />
                                    <stop offset="50%" stopColor={item.top} />
                                    <stop offset="100%" stopColor={item.dark} />
                                </linearGradient>
                                <radialGradient id={`projectSurface${i}`} cx="30%" cy="30%" r="70%">
                                    <stop offset="0%" stopColor={item.top} />
                                    <stop offset="100%" stopColor={item.mid} />
                                </radialGradient>
                            </React.Fragment>
                        ))}
                        <linearGradient id="emptyBody" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0f172a" />
                            <stop offset="50%" stopColor="#475569" />
                            <stop offset="100%" stopColor="#0f172a" />
                        </linearGradient>
                        <radialGradient id="topInner" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#334155" />
                        </radialGradient>
                    </defs>

                    {/* Bottom ellipse */}
                    <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill="#1e293b" />

                    {/* Body background */}
                    <path d={`M ${cx - rx} ${topY} L ${cx - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY} L ${cx + rx} ${topY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${topY} Z`} fill="url(#emptyBody)" />

                    {/* Segments */}
                    {segments.map(({ idx, item, yStart, yEnd, h }) => (
                        <g
                            key={idx}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.3,
                                transition: "opacity 0.2s ease-in-out",
                                cursor: "pointer"
                            }}
                        >
                            <path d={`M ${cx - rx} ${yStart} L ${cx - rx} ${yEnd} A ${rx} ${ry} 0 0 0 ${cx + rx} ${yEnd} L ${cx + rx} ${yStart} A ${rx} ${ry} 0 0 1 ${cx - rx} ${yStart} Z`} fill={`url(#projectBody${idx})`} />
                            {h > 2 && <ellipse cx={cx} cy={yStart} rx={rx} ry={ry} fill={`url(#projectSurface${idx})`} />}
                        </g>
                    ))}

                    {/* Empty space overlay */}
                    {liquidTop > topY + 2 && (
                        <path d={`M ${cx - rx} ${topY} L ${cx - rx} ${liquidTop} A ${rx} ${ry} 0 0 0 ${cx + rx} ${liquidTop} L ${cx + rx} ${topY} A ${rx} ${ry} 0 0 1 ${cx - rx} ${topY} Z`} fill="url(#emptyBody)" />
                    )}

                    {/* Top rim */}
                    <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="#334155" />
                    <ellipse cx={cx} cy={topY} rx={rx - 3} ry={ry - 2} fill="url(#topInner)" />
                </svg>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto max-h-[200px] scrollbar-hide">
                {percentages.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center gap-1 transition-opacity duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            opacity: hoveredIndex === null || hoveredIndex === idx ? 1 : 0.3
                        }}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-gray-400 truncate">{item.label}</div>
                            <div className="text-[11px] font-bold text-white tabular-nums">{Math.round(item.value).toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
