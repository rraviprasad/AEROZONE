import React, { useMemo, useState, useRef } from "react";

const ReceiptBarChart = ({ rows = [] }) => {
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });

    const [hoveredDay, setHoveredDay] = useState(null);
    const hideTimeout = useRef(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /* ---------- Month Navigation ---------- */

    const goPrevMonth = () => {
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
        );
    };

    const goNextMonth = () => {
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
        );
    };

    /* ---------- Build calendar data ---------- */

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const dayQtyMap = {};

        rows.forEach((row) => {
            const d = new Date(row.PlannedReceiptDate);
            if (isNaN(d)) return;

            if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                dayQtyMap[day] =
                    (dayQtyMap[day] || 0) + Number(row.OrderedLineQuantity || 0);
            }
        });

        return {
            year,
            month,
            firstDay: new Date(year, month, 1).getDay(), // 0=Sun, 1=Mon...
            daysInMonth: new Date(year, month + 1, 0).getDate(),
            dayQtyMap,
        };
    }, [rows, currentDate]);

    const monthLabel = currentDate.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    });

    // Determine row/col stats for smart positioning
    const totalSlots = calendarData.firstDay + calendarData.daysInMonth;
    const totalRows = Math.ceil(totalSlots / 7);

    return (
        <div className="bg-black border border-purple-700/80 rounded-xl shadow-md p-2 w-full h-56 flex flex-col will-change-transform">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={goPrevMonth}
                    className="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                >
                    ◀
                </button>

                <h2 className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    {monthLabel}
                </h2>

                <button
                    onClick={goNextMonth}
                    className="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors"
                >
                    ▶
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 text-center text-[10px] uppercase font-bold text-gray-500 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-sm ">
                {Array.from({ length: calendarData.firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const qty = calendarData.dayQtyMap[day] || 0;

                    const isToday =
                        day === today.getDate() &&
                        calendarData.month === today.getMonth() &&
                        calendarData.year === today.getFullYear();

                    const fullDate = new Date(
                        calendarData.year,
                        calendarData.month,
                        day
                    ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    });

                    // Calculate positioning info
                    const slotIndex = calendarData.firstDay + i;
                    const colIndex = slotIndex % 7; // 0..6
                    const rowIndex = Math.floor(slotIndex / 7);

                    // Logic: If on the last 2 rows, show tooltip ABOVE. Else BELOW.
                    const showAbove = rowIndex >= totalRows - 2;

                    // Logic: If far left (0,1), align left. If far right (5,6), align right. Else center.
                    let alignClass = "left-1/2 -translate-x-1/2";
                    if (colIndex <= 1) alignClass = "left-0";
                    if (colIndex >= 5) alignClass = "right-0";

                    return (
                        <div
                            key={day}
                            onMouseEnter={() => {
                                clearTimeout(hideTimeout.current);
                                setHoveredDay({ day, qty, fullDate });
                            }}
                            onMouseLeave={() => {
                                hideTimeout.current = setTimeout(() => {
                                    setHoveredDay(null);
                                }, 50);
                            }}
                            className={`group relative h-[25px] w-full border rounded flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.15] hover:z-20 hover:shadow-lg hover:shadow-purple-500/20
                                ${isToday
                                    ? "border-red-500 bg-red-900/40 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                    : qty > 0
                                        ? "border-purple-500/50 bg-purple-900/30 text-white shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                                        : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                                }
                            `}
                        >
                            <span
                                className={`text-[10px] leading-none ${isToday
                                        ? "font-bold text-red-500"
                                        : qty > 0 ? "font-bold" : ""
                                    }`}
                            >
                                {day}
                            </span>

                            {/* Dot indicator for quantity */}
                            <div className="h-1 w-1 rounded-full mt-0.5" style={{
                                backgroundColor: qty > 0 ? (isToday ? '#ef4444' : '#a855f7') : 'transparent'
                            }} />

                            {/* Tooltip */}
                            {hoveredDay?.day === day && (
                                <div
                                    className={`absolute z-50 min-w-[120px] px-3 py-2 rounded-lg bg-black border border-purple-500/50 shadow-xl pointer-events-none 
                                        ${showAbove ? "bottom-full mb-2" : "top-full mt-2"}
                                        ${alignClass}
                                    `}
                                >
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 whitespace-nowrap">
                                        {fullDate}
                                    </div>
                                    <div className="text-xs font-bold text-white whitespace-nowrap">
                                        {qty > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                                <span>Qty: {qty.toLocaleString()}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">No Orders</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReceiptBarChart;
