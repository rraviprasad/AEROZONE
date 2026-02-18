// src/components/module1/ReceiptBarChart.tsx
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";

const ReceiptBarChart = ({ rows }) => {
    const [hoveredDay, setHoveredDay] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const tooltipTimeoutRef = useRef(null);
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);
    const isHoveringTooltip = useRef(false);

    const parseDate = useCallback((value) => {
        if (!value) return null;
        const d = new Date(value);
        if (isNaN(d)) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }, []);

    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    // Memoize the data processing
    const { monthlyData } = useMemo(() => {
        if (!rows || rows.length === 0) {
            return { monthlyData: [] };
        }

        const monthlyGroups = {};

        rows.forEach((row) => {
            const date = parseDate(row["PlannedReceiptDate"]);
            const qty = Number(row["OrderedLineQuantity"]);
            if (!date || isNaN(qty)) return;

            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const monthName = date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });

            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = {
                    monthName,
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    days: new Map(),
                    isCurrentMonth: date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear(),
                };
            }

            const dayOfMonth = date.getDate();
            if (monthlyGroups[monthKey].days.has(dayOfMonth)) {
                monthlyGroups[monthKey].days.get(dayOfMonth).qty += qty;
            } else {
                monthlyGroups[monthKey].days.set(dayOfMonth, {
                    date,
                    qty,
                    fullDate: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                    isPast: date < today,
                    isToday: date.toDateString() === today.toDateString(),
                });
            }
        });

        // Generate complete month grids
const processedMonthlyData = Object.entries(monthlyGroups)
  .sort(([, a], [, b]) => {
    // Current month comes first
    if (a.isCurrentMonth && !b.isCurrentMonth) return -1;
    if (!a.isCurrentMonth && b.isCurrentMonth) return 1;

    // Otherwise sort by date
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  })
  .map(([key, month]) => {

                const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
                const daysGrid = [];

                for (let day = 1; day <= daysInMonth; day++) {
                    const dayData = month.days.get(day);
                    daysGrid.push({
                        day,
                        hasOrder: !!dayData,
                        qty: dayData?.qty || 0,
                        fullDate: dayData?.fullDate || `${day} ${month.monthName}`,
                        isPast: dayData?.isPast || new Date(month.year, month.month, day) < today,
                        isToday: dayData?.isToday || false,
                        monthKey: key,
                    });
                }

                return {
                    ...month,
                    daysGrid,
                };
            });

        return {
            monthlyData: processedMonthlyData,
        };
    }, [rows, today, parseDate]);

    // Calculate tooltip position based on cursor position
    const updateTooltipPosition = useCallback((clientX, clientY) => {
        const tooltipWidth = 220;
        const tooltipHeight = 90;
        const offset = 15; // distance from cursor

        let x = clientX + offset;
        let y = clientY + offset;

        // Keep tooltip inside viewport
        if (x + tooltipWidth > window.innerWidth - 10) {
            x = clientX - tooltipWidth - offset;
        }
        if (x < 10) x = 10;

        if (y + tooltipHeight > window.innerHeight - 10) {
            y = clientY - tooltipHeight - offset;
        }
        if (y < 10) y = 10;

        // Smooth animation — tooltip follows cursor smoothly
        setTooltipPosition(prev => ({
            x: prev.x + (x - prev.x) * 0.35,
            y: prev.y + (y - prev.y) * 0.35,
        }));
    }, []);



    // --- Tooltip Hover Handlers (Fixed) ---

    const handleMouseEnter = useCallback((day, event) => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);

        setHoveredDay(day);
        updateTooltipPosition(event.clientX, event.clientY);
    }, [updateTooltipPosition]);

    const handleMouseMove = useCallback((event) => {
        if (!hoveredDay) return;
        updateTooltipPosition(event.clientX, event.clientY);
    }, [hoveredDay, updateTooltipPosition]);

    const handleMouseLeave = useCallback(() => {
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);

        // Slight delay to allow smooth transition when hovering to tooltip
        tooltipTimeoutRef.current = setTimeout(() => {
            if (!isHoveringTooltip.current) {
                setHoveredDay(null);
            }
        }, 200);
    }, []);

    const handleTooltipMouseEnter = useCallback(() => {
        isHoveringTooltip.current = true;
        if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    }, []);

    const handleTooltipMouseLeave = useCallback(() => {
        isHoveringTooltip.current = false;

        // Small delay so user can move back to a nearby cell smoothly
        tooltipTimeoutRef.current = setTimeout(() => {
            if (!isHoveringTooltip.current) {
                setHoveredDay(null);
            }
        }, 200);
    }, []);


    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
        };
    }, []);

    // Add global mouse move listener
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            handleMouseMove(e);
        };

        if (hoveredDay) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
        };
    }, [hoveredDay, handleMouseMove]);

    // Group months into rows of 4
    const monthRows = useMemo(() => {
        const rows = [];
        for (let i = 0; i < monthlyData.length; i += 4) {
            rows.push(monthlyData.slice(i, i + 4));
        }
        return rows;
    }, [monthlyData]);

    if (!monthlyData.length) {
        return <div className="text-center p-4 text-[var(--color-muted-foreground)]">No data available to display</div>;
    }

    return (
        <div className="max-w-full bg-[var(--color-card)] rounded-[var(--radius)] shadow-md p-4 transition-all duration-300">
            <div className="flex flex-row justify-between items-center mb-1">
                <h2 className="text-xs text-wrap font-semibold  text-[var(--color-foreground)]">
                    Planned Receipts
                </h2>
                <div className="flex flex-row items-center gap-2  text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500  rounded"></div>
                        <span className="text-[var(--color-foreground)]">Order </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500  rounded"></div>
                        <span className="text-[var(--color-foreground)]">Today</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600  rounded"></div>
                        <span className="text-[var(--color-foreground)]">No Order</span>
                    </div>
                </div>
            </div>

            {/* Scroll Container */}
            <div
                ref={containerRef}
                className="relative overflow-y-auto scrollbar-hide rounded-sm pb-2 "
                style={{ maxHeight: '180px' }}
            >
                <div className="flex flex-col space-y-6">
                    {monthRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex flex-col align-middle mb-1">
                            {row.map((month) => (
                                <div key={month.monthName} className="flex-shrink-0">
                                    <h3 className={`text-center text-md font-semibold mt-1 -mb-1  ${month.isCurrentMonth ? 'text-red-500' : 'text-[var(--color-foreground)]'}`}>
                                        {month.monthName}
                                    </h3>
                                    <div className="grid grid-cols-7 gap-1">
                                        {/* Day headers */}
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                            <div key={i} className="text-center text-xs font-semibold text-[var(--color-muted-foreground)] p-1">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Empty cells for first week alignment */}
                                        {Array.from({ length: new Date(month.year, month.month, 1).getDay() }).map((_, i) => (
                                            <div key={`empty-${i}`} className="p-2"></div>
                                        ))}

                                        {/* Day boxes with enhanced hover effects */}
                                        {month.daysGrid.map((day) => {
                                            const isHovered = hoveredDay?.monthKey === day.monthKey && hoveredDay?.day === day.day;

                                            return (
                                                <div
                                                    key={`${day.monthKey}-${day.day}`}
                                                    data-day={`${day.monthKey}-${day.day}`}
                                                    className={`
                                                        relative p-1 text-center text-xs rounded cursor-pointer transition-all duration-300 ease-out
                                                        transform hover:scale-105 hover:z-10
                                                        ${day.isToday ?
                                                            `bg-red-500 text-white font-bold shadow-md
                                                             ${isHovered ? 'bg-red-600 shadow-xl ring-2 ring-red-300 ring-opacity-50' : ''}` :
                                                            day.hasOrder ?
                                                                `bg-blue-500 text-white shadow-sm
                                                             ${isHovered ? 'bg-blue-600 shadow-xl ring-2 ring-blue-300 ring-opacity-50' : ''}` :
                                                                day.isPast ?
                                                                    `bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                                                             ${isHovered ? 'bg-gray-300 dark:bg-gray-600 shadow-lg ring-2 ring-gray-400 ring-opacity-30' : ''}` :
                                                                    `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                                                             ${isHovered ? 'bg-gray-200 dark:bg-gray-700 shadow-lg ring-2 ring-gray-400 ring-opacity-30' : ''}`
                                                        }
                                                    `}
                                                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                                                    onMouseLeave={handleMouseLeave}
                                                    style={{
                                                        transform: isHovered ? 'scale(1)' : 'scale(1)',
                                                    }}
                                                >
                                                    <span className="relative z-10 select-none">{day.day}</span>

                                                    {/* Enhanced indicator for orders */}
                                                    {day.hasOrder && (
                                                        <div className={`
                                                            absolute bottom-0 left-0 right-0 h-1 rounded-b transition-all duration-300
                                                            ${isHovered ? 'h-2 bg-blue-300' : 'h-1 bg-blue-700'}
                                                        `}></div>
                                                    )}

                                                    {/* Hover glow effect */}
                                                    {isHovered && (
                                                        <div className="absolute inset-0 rounded animate-pulse opacity-30">
                                                            <div className={`w-full h-full rounded ${day.isToday ? 'bg-red-400' :
                                                                day.hasOrder ? 'bg-blue-400' :
                                                                    'bg-gray-400'
                                                                }`}></div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Cursor-following Tooltip */}
            {hoveredDay && (
                <div
                    ref={tooltipRef}
                    className="fixed z-[99] bg-[var(--color-popover)] border border-[var(--color-border)] rounded-lg shadow-2xl p-3 min-w-[180px] pointer-events-auto transition-opacity duration-150"
                    style={{
                        transform: "translate(-50%, -650%)", // keeps it near cursor
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        opacity: 1,
                    }}

                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                >
                    {/* Tooltip arrow pointing to cursor */}
                    <div
                        className="absolute w-3 h-3 bg-[var(--color-popover)] border-r border-b border-[var(--color-border)] transform rotate-45"
                        style={{
                            bottom: '-6px',
                            left: '10px',
                        }}
                    ></div>

                    {/* Tooltip content */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-xs text-[var(--color-foreground)]">
                                {hoveredDay.fullDate}
                            </p>
                            {hoveredDay.isToday && (
                                <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-full">
                                    Today
                                </span>
                            )}
                        </div>

                        {hoveredDay.hasOrder ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                                    Quantity: <span className="font-bold">{hoveredDay.qty.toLocaleString()}</span>
                                </p>
                            </div>
                        ) : (
                            <p className="text-[var(--color-muted-foreground)] text-xs italic">
                                No orders scheduled
                            </p>
                        )}

                        {hoveredDay.isPast && !hoveredDay.isToday && (
                            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                                Past date
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptBarChart;
