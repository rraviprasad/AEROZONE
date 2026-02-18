import { useState } from "react";
// Navbar is now global in App.jsx
import "../src/styles/globals.css"; // Import the theme from index.css

export default function App() {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);


  // Dynamically load the xlsx library for Excel file generation
  const loadXlsxScript = () => {
    if (document.getElementById('xlsx-script')) return;
    const script = document.createElement('script');
    script.id = 'xlsx-script';
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
    document.body.appendChild(script);
  };

  // Call the function to load the script when the component mounts
  // This is a workaround for the single-file environment.
  loadXlsxScript();

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-card p-6 rounded-lg shadow-xl text-center">
          <p class="text-foreground">Please select PDF files first!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-ring">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      return;
    }
    setLoading(true);
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    try {
      const res = await fetch("https://pdf-git.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-card p-6 rounded-lg shadow-xl text-center">
          <p class="text-foreground">Error uploading files!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-ring">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    try {
      const res = await fetch("https://pdf-git.onrender.com/download");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "indent_data.json";
      a.click();
    } catch (err) {
      // Use a custom modal or message box instead of alert()
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-card p-6 rounded-lg shadow-xl text-center">
          <p class="text-foreground">Error downloading JSON!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-ring">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
    }
  };

  const handleDownloadExcel = () => {
    if (!result || !result.indent_data || result.indent_data.length === 0) {
      // Use a custom modal or message box for no data
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
      messageBox.innerHTML = `
        <div class="bg-card p-6 rounded-lg shadow-xl text-center">
          <p class="text-foreground">No data to export!</p>
          <button onclick="this.parentElement.parentElement.remove()" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-ring">OK</button>
        </div>
      `;
      document.body.appendChild(messageBox);
      return;
    }

    const ws = window.XLSX.utils.json_to_sheet(result.indent_data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Extracted Data");
    window.XLSX.writeFile(wb, "indent_data.xlsx");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex flex-col items-center justify-center font-sans p-4 pt-20">
      {/* Navbar is now global in App.jsx */}



      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 w-full max-w-6xl mx-auto">

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative h-48 mb-4 pointer-events-auto flex items-center justify-center">
                <h1 className="text-6xl font-extrabold text-foreground">Indent PDF Extractor</h1>
              </div>

              {/* Single line content */}
              <div className="flex flex-wrap justify-center items-center gap-2 text-muted-foreground text-sm mb-6">
                <span>Extract and analyze data from your PDF documents with our space-powered tool</span>
              </div>
            </div>

            {/* Centered Upload Card */}
            <div className="flex justify-center mb-12">
              <div className="bg-card p-8 rounded-lg border border-border shadow-lg pointer-events-none w-full max-w-2xl">
                <div className="flex flex-col items-center">
                  <div className="mb-6 p-4 bg-accent rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>

                  <div className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-card-foreground mb-2">Upload PDF Documents</h2>
                    <p className="text-muted-foreground text-sm">Select one or more PDF files to extract data</p>
                  </div>

                  <div className="w-full max-w-md pointer-events-auto">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary rounded-lg cursor-pointer bg-muted hover:bg-secondary transition-all duration-300 hover:border-ring">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-secondary-foreground">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PDF files only</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {files.length > 0 && (
                      <div className="mt-4 text-sm text-secondary-foreground text-center">
                        {files.length} file(s) selected
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="mt-8 px-8 py-3 bg-primary rounded-lg font-medium text-primary-foreground shadow-lg hover:bg-ring transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none pointer-events-auto"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : "Extract Data"}
                  </button>
                </div>
              </div>
            </div>

            {/* Centered Extraction Summary */}
            {result && (
              <div className="flex justify-center mb-12">
                <div className="bg-card p-8 rounded-lg border border-border shadow-lg pointer-events-none w-full max-w-4xl">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-card-foreground">Extraction Results</h2>
                    <div className="px-3 py-1 bg-chart-2 text-primary-foreground rounded-full text-sm">
                      Completed
                    </div>
                  </div>

                  <div className="flex justify-center mb-8 space-x-4">
                    <button
                      onClick={handleDownload}
                      className="px-6 py-3 bg-primary rounded-lg font-medium text-primary-foreground shadow-md hover:bg-ring transition-all duration-300 hover:scale-105 flex items-center pointer-events-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download JSON
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-6 py-3 bg-primary rounded-lg font-medium text-primary-foreground shadow-md hover:bg-ring transition-all duration-300 hover:scale-105 flex items-center pointer-events-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Excel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-secondary p-6 rounded-lg border border-border">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-input mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Files Processed</p>
                          <p className="text-2xl font-bold text-card-foreground">{result.total_files_processed}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary p-6 rounded-lg border border-border">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-input mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Total Items</p>
                          <p className="text-2xl font-bold text-card-foreground">{result.total_items}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary p-6 rounded-lg border border-border">
                      <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-input mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Unique Codes</p>
                          <p className="text-2xl font-bold text-card-foreground">{result.unique_item_codes}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table of Extracted Data */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-card-foreground">Extracted Data</h3>
                    <div className="overflow-x-auto rounded-lg border border-border pointer-events-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-secondary text-secondary-foreground">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Project No.</th>
                            <th className="px-4 py-3 text-left font-medium">Item Code</th>
                            <th className="px-4 py-3 text-left font-medium">Description</th>
                            <th className="px-4 py-3 text-center font-medium">Qty</th>
                            <th className="px-4 py-3 text-center font-medium">UOM</th>
                            <th className="px-4 py-3 text-center font-medium">Order</th>
                            <th className="px-4 py-3 text-center font-medium">Start Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.indent_data.map((row, idx) => (
                            <tr key={idx} className="hover:bg-accent transition-colors">
                              <td className="px-4 py-3 text-foreground">{row.PROJECT_NO || "-"}</td>
                              <td className="px-4 py-3 font-medium text-chart-1">{row.ITEM_CODE || "-"}</td>
                              <td className="px-4 py-3 text-foreground max-w-xs truncate">{row.ITEM_DESCRIPTION || "-"}</td>
                              <td className="px-4 py-3 text-center text-foreground">{row.REQUIRED_QTY || "-"}</td>
                              <td className="px-4 py-3 text-center text-foreground">{row.UOM || "-"}</td>
                              <td className="px-4 py-3 text-center text-foreground">{row.PLANNED_ORDER || "-"}</td>
                              <td className="px-4 py-3 text-center text-foreground">{row.PLANNED_START_DATE || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}