import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function StackedBarChart({ rows = [] }) {
  const [animatedValues, setAnimatedValues] = useState({ ordered: 0, inventory: 0, indent: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [fillProgress, setFillProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const sumValues = (rows, keys) =>
    rows.reduce((sum, r) => {
      for (const key of keys) {
        const val = parseFloat(r[key]) || 0;
        if (!isNaN(val)) return sum + val;
      }
      return sum;
    }, 0);

  const totalOrdered = sumValues(rows, ["OrderedLineQuantity", "ORDERED_QTY"]);
  const totalInventory = sumValues(rows, ["InventoryQuantity", "INVENTORY_QTY"]);
  const totalIndent = sumValues(rows, ["IndentQuantity", "INDENT_QTY", "REQUIRED_QTY"]);
  const grandTotal = totalOrdered + totalInventory + totalIndent || 1;

  useEffect(() => {
    const startDelay = setTimeout(() => setHasStarted(true), 3000);
    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    const duration = 2500;
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

  useEffect(() => {
    setAnimatedValues({
      ordered: Math.floor(totalOrdered * fillProgress),
      inventory: Math.floor(totalInventory * fillProgress),
      indent: Math.floor(totalIndent * fillProgress),
    });
  }, [fillProgress, totalOrdered, totalInventory, totalIndent]);

  const stockData = [
    {
      label: "Ordered Line Quantity", value: totalOrdered, animatedValue: animatedValues.ordered,
      color: "#3b82f6", dark: "#1e40af", mid: "#2563eb", light: "#60a5fa", top: "#93c5fd"
    },
    {
      label: "Inventory Quantity", value: totalInventory, animatedValue: animatedValues.inventory,
      color: "#f59e0b", dark: "#b45309", mid: "#d97706", light: "#fbbf24", top: "#fde047"
    },
    {
      label: "Indent Quantity", value: totalIndent, animatedValue: animatedValues.indent,
      color: "#10b981", dark: "#047857", mid: "#059669", light: "#34d399", top: "#6ee7b7"
    }
  ];

  const percentages = stockData.map(item => ({ ...item, percentage: (item.value / grandTotal) * 100 }));

  // Cylinder dimensions - proper tube/can shape
  const width = 100;
  const height = 220;
  const cx = 50;
  const rx = 30; // Horizontal radius of ellipse
  const ry = 12; // Vertical radius of ellipse (creates 3D perspective)
  const topY = 35; // Y position of top ellipse
  const bottomY = 185; // Y position of bottom ellipse
  const bodyHeight = bottomY - topY;

  const getSegments = () => {
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
  };

  const segments = getSegments();
  const liquidTop = segments.length > 0 ? Math.min(...segments.map(s => s.yStart)) : bottomY;

  return (
    <div className="w-full md:w-[80%] lg:w-[90%] bg-[var(--card)] rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="h-5 w-1 bg-[var(--primary)] mr-2 rounded-sm" />
        <h2 className="text-xs md:text-sm font-semibold text-[var(--foreground)]">OVERALL STOCK SUMMARY</h2>
      </div>

      <div className="flex items-center gap-2 xl:gap-4 overflow-hidden">
        <motion.div
          className="flex-shrink-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="w-20 h-32 sm:w-24 sm:h-40 md:w-28 md:h-48 lg:w-24 lg:h-40 xl:w-32 xl:h-56"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))' }}>
            <defs>
              {percentages.map((item, i) => (
                <React.Fragment key={i}>
                  {/* Body gradient for 3D cylinder effect */}
                  <linearGradient id={`body${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={item.dark} />
                    <stop offset="20%" stopColor={item.mid} />
                    <stop offset="40%" stopColor={item.light} />
                    <stop offset="50%" stopColor={item.top} />
                    <stop offset="60%" stopColor={item.light} />
                    <stop offset="80%" stopColor={item.mid} />
                    <stop offset="100%" stopColor={item.dark} />
                  </linearGradient>
                  {/* Top surface gradient */}
                  <radialGradient id={`surface${i}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={item.top} />
                    <stop offset="50%" stopColor={item.light} />
                    <stop offset="100%" stopColor={item.mid} />
                  </radialGradient>
                </React.Fragment>
              ))}

              {/* Empty cylinder gradients */}
              <linearGradient id="emptyBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="20%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#334155" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="60%" stopColor="#334155" />
                <stop offset="80%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Top opening - looking into the cylinder */}
              <radialGradient id="topInner" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>

              {/* Top rim */}
              <radialGradient id="topRim" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </radialGradient>

              {/* Bottom ellipse */}
              <radialGradient id="bottomCap" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>

              {/* Shadow */}
              <radialGradient id="shadow">
                <stop offset="0%" stopColor="#000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Floor shadow */}
            <ellipse cx={cx} cy={height - 10} rx={rx + 15} ry={10} fill="url(#shadow)" />

            {/* Bottom ellipse (visible base) */}
            <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill="url(#bottomCap)" />

            {/* Cylinder body - empty background */}
            <path d={`
              M ${cx - rx} ${topY}
              L ${cx - rx} ${bottomY}
              A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY}
              L ${cx + rx} ${topY}
              A ${rx} ${ry} 0 0 1 ${cx - rx} ${topY}
              Z
            `} fill="url(#emptyBody)" />

            {/* Filled segments */}
            {segments.map(({ idx, item, yStart, yEnd, h }) => {
              const isHovered = hoveredIndex === idx;
              return (
                <g key={idx}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ filter: isHovered ? 'brightness(1.15)' : 'none' }}>

                  {/* Segment body */}
                  <path d={`
                    M ${cx - rx} ${yStart}
                    L ${cx - rx} ${yEnd}
                    A ${rx} ${ry} 0 0 0 ${cx + rx} ${yEnd}
                    L ${cx + rx} ${yStart}
                    A ${rx} ${ry} 0 0 1 ${cx - rx} ${yStart}
                    Z
                  `} fill={`url(#body${idx})`} />

                  {/* Liquid surface (ellipse) */}
                  {h > 2 && (
                    <ellipse cx={cx} cy={yStart} rx={rx} ry={ry} fill={`url(#surface${idx})`} />
                  )}

                  {/* Shine highlight */}
                  <path d={`M ${cx - rx + 6} ${yStart + 5} L ${cx - rx + 6} ${Math.min(yEnd - 5, yStart + h - 5)}`}
                    stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" fill="none" />
                </g>
              );
            })}

            {/* Dark empty space above liquid */}
            {liquidTop > topY + 2 && (
              <path d={`
                M ${cx - rx} ${topY}
                L ${cx - rx} ${liquidTop}
                A ${rx} ${ry} 0 0 0 ${cx + rx} ${liquidTop}
                L ${cx + rx} ${topY}
                A ${rx} ${ry} 0 0 1 ${cx - rx} ${topY}
                Z
              `} fill="url(#emptyBody)" />
            )}

            {/* Top rim (outer edge of opening) */}
            <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill="url(#topRim)" />

            {/* Inner opening (looking into cylinder) */}
            <ellipse cx={cx} cy={topY} rx={rx - 3} ry={ry - 2} fill="url(#topInner)" />

            {/* Rim highlight */}
            <ellipse cx={cx} cy={topY} rx={rx} ry={ry}
              fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {/* Top shine spot - centered */}
            <ellipse cx={cx} cy={topY} rx={6} ry={2} fill="rgba(255,255,255,0.15)" />
          </svg>
        </motion.div>

        {/* Labels */}
        <div className="flex-1 space-y-4 md:space-y-5">
          {percentages.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <motion.div key={idx}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12 + 0.2 }}
                className="flex items-center gap-2.5 md:gap-3 cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ transform: isHovered ? 'translateX(4px)' : 'none' }}>

                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: item.color,
                    transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: isHovered ? `0 0 10px ${item.color}` : 'none'
                  }} />

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] md:text-xs truncate transition-colors duration-200"
                    style={{ color: isHovered ? item.color : 'var(--muted-foreground)' }}>
                    {item.label}
                  </div>
                  <div className="text-sm md:text-base lg:text-lg font-bold text-[var(--foreground)] tabular-nums">
                    {item.animatedValue.toLocaleString()}
                  </div>
                </div>

                <svg width="16" height="16" viewBox="0 0 16 16"
                  className="flex-shrink-0 hidden sm:block transition-all duration-200"
                  style={{ transform: isHovered ? 'translateX(3px)' : 'none', color: isHovered ? item.color : 'var(--muted-foreground)' }}>
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-4 pt-3 border-t border-[var(--border)] text-center">
        <span className="text-xs text-[var(--muted-foreground)]">
          Total: <strong className="text-[var(--foreground)]">{grandTotal.toLocaleString()}</strong>
        </span>
      </motion.div>
    </div>
  );
}
