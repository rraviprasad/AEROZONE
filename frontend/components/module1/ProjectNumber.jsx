import React from "react";

const ProjectNumber = ({ values = [], selectedProject, onSelectProject }) => {
  // ✅ Remove duplicates & ignore empty/null/undefined
  const uniqueValues = [...new Set(values.filter(Boolean))];

  return (
    <div className="p-4 bg-[var(--card)] w-full  rounded-lg shadow border  border-[var(--border)]">
      <div className="text-xs font-semibold text-[var(--primary)] mb-1">
        Project Numbers
      </div>

      {uniqueValues.length === 0 ? (
        <div className="text-[var(--muted-foreground)] text-sm">No data found</div>
      ) : (
        <div className="flex flex-row gap-2 py-1 max-h-8 overflow-y-auto scrollbar-hide">
          {uniqueValues.map((item, idx) => {
            const isActive = selectedProject === item;
            return (
              <span
                key={idx}
                onClick={() => onSelectProject(item)}
                className={`
                  px-3 py-1 text-xs border rounded-md cursor-pointer transition-all
                  ${isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent scale-105"
                    : "bg-white/40 border-gray-300 hover:bg-white/60 text-gray-700 dark:text-white dark:bg-gray-500/20  dark:hover:bg-blue-400"
                  }
                `}
              >
                {item}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectNumber;

// projectNumber: <ProjectNumber

//   values={[...new Set(filteredRows.map(row => row.ProjectCode))]} // unique project codes horizontal
//   selectedProject={selectedRef} // you can also create a new state for project filter
//   onSelectProject={(project) => {
//     setSelectedRef(project);
//     setTimeout(() => applyFilters(), 0);
//   }}
// />,
