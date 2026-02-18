import React from "react";

const ProjectNumber = ({ values = [], selectedProject, onSelectProject, bare = false }) => {
    // ✅ Remove duplicates & ignore empty/null/undefined
    const uniqueValues = [...new Set(values.filter(Boolean))];

    const content = (
        <div className={`w-90  flex flex-col max-h-17 ${bare ? "" : "bg-black clip-angled p-3"}`}>
            <div className="text-xs font-semibold text-orange-400 mb-1 shrink-0">
                Project Numbers
                <span className="text-orange-300 text-xs ml-2">
                    {` (${uniqueValues.length})`}
                </span>
            </div>

            {uniqueValues.length === 0 ? (
                <div className="text-orange-500 text-xs flex-1 flex items-center justify-center">No data found</div>
            ) : (
                <div className="flex-1 overflow-y-auto gap-2  scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {uniqueValues.map((item, idx) => {
                            const isActive = selectedProject === item;
                            return (
                               
                                <span
                                    key={idx}
                                    onClick={() => onSelectProject(item)}
                                    className={`w-full px-2 py-1 text-xs border cursor-pointer transition-all text-center  clip-angled ${isActive ? "bg-orange-600 text-white border-orange-500  scale-105 shadow-md shadow-orange-500/30 "
                                            : "bg-orange-900/60  border-orange-500/50 hover:bg-orange-900 text-white hover:text-orange-200"
                                        } 
                        `}
                                >
                                    {item}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    if (bare) return content;

    return (
        <div className="relative w-full h-fit group transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                {content}
            </div>
        </div>
    );
};

export default ProjectNumber;
