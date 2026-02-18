import { PinIcon } from "lucide-react";
import React, { useState, useRef } from "react";

export default function Uploadfrom2({ onUpload }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const selectFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProceed = () => {
    if (!file) {
      setMessage("⚠️ Please select a file first!");
      return;
    }

    onUpload(file);
    setMessage(`✅ ${file.name} uploaded successfully!`);
  };

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--primary)]/20 shadow p-6 max-w-lg">

      <div className="flex items-center mb-4">
        <div className="h-6 w-1 bg-[var(--primary)] mr-3"></div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Upload Excel File
        </h2>
      </div>

      <p className="text-[var(--muted-foreground)] mb-6">
        Select and process your Excel file.
      </p>

      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={selectFileInput}
        className="w-full bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] py-3 px-6 rounded-lg mb-4 transition shadow"
      >
        Select File
      </button>

      {file && (
        <div className="text-sm text-[var(--primary)] mb-4 font-mono text-center">
          {file.name}
        </div>
      )}

      <button
        onClick={handleProceed}
        disabled={!file}
        className="w-full bg-[var(--success)] hover:opacity-90 text-[var(--success-foreground)] py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
      >
        Process Data
      </button>

      {message && (
        <p className="mt-4 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] p-3 rounded-lg text-center">
          {message}
        </p>
      )}
    </div>
  );
}
