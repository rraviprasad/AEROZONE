import React from "react";

const materials = ["SS", "AL", "IN", "TI", "COBALT", "OTHER"];
const types = ["SHEET", "BAR", "PLATE", "TUBE", "BLOCK", "OTHERS"];

const CELL = "w-15 h-7"; // square cell
const CELLL = "w-9 h-9"
const MaterialTypeMatrix = ({ rows = [] }) => {
  const boiRows = rows.filter(r => r.Category === "BOI");
  const rmRows = rows.filter(r => r.Category !== "BOI");

  const hasMatch = (type, material) => {
    return rmRows.some(item => {
      const tm = (item.Type || item.TypeMaterial || "")
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase();

      return (
        tm.includes(type.toUpperCase()) &&
        tm.includes(material.toUpperCase())
      );
    });
  };

  const hasBOI = boiRows.length > 0;

  return (
    <div className="relative w-[400px] clip-angled bg-gradient-to-br from-orange-600 to-orange-800 p-[1px]">
      <div className="clip-angled bg-black p-3">

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-[auto_1fr] gap-2">

        

          {/* 🟦 MATRIX TABLE */}
          <div className="overflow-auto scrollbar-hide">
            <table className="border-collapse text-[12px] text-white">
              <thead className="sticky top-0 bg-black z-10">
                <tr>
                  {/* material header */}
                  <th className={`border border-orange-500 ${CELL}`} />

                  {types.map(type => (
                    <th
                      key={type}
                      className={`border  border-orange-500 ${CELL} text-[12px] text-center`}
                    >
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {materials.map(material => (
                  <tr key={material}>
                    {/* material name */}
                    <td
                      className={`border border-orange-500 ${CELL} text-center font-semibold`}
                    >
                      {material}
                    </td>

                    {types.map(type => (
                      <td
                        key={type}
                        className={`border border-orange-500 ${CELL}`}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {hasMatch(type, material) && (
                            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-inner" />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MaterialTypeMatrix;
