import React, { useState } from "react";
import axios from "axios";
import { FaRegFolderOpen, FaClipboardList, FaTimesCircle, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import "../../../css/ConvertTo.css";

const Merge = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // File selection (additive, not replace)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    const filtered = files.filter((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      return ext === "pdf";
    });

    if (filtered.length !== files.length) {
      const msg = "Only .pdf files are allowed";
      setErrorMsg(msg);
      toast.error(msg);
    } else {
      setErrorMsg("");
      toast.success(`${filtered.length} PDF(s) added successfully`);
    }

    // Additive (merge with old files)
    setSelectedFiles((prev) => [...prev, ...filtered]);
  };

  // Remove file by index
  const handleRemoveFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
    toast.success("File removed");
  };

  // Send files to backend for merging
  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      toast.error("Please select at least 2 PDF files to merge.");
      return;
    }

    setLoading(true);
    setDownloadUrl("");
    setErrorMsg("");
    toast.loading("Merging your PDF files...", { id: "merge" });

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("pdfs[]", file);
    });

    try {
      const res = await axios.post("/api/pdf/merge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "json",
      });

      let data = res.data;

      if (typeof data === "string") {
        const jsonStart = data.indexOf("\n");
        let jsonStr = data;
        if (jsonStart !== -1) {
          jsonStr = data.substring(jsonStart + 1);
        }
        try {
          data = JSON.parse(jsonStr);
        } catch {
          const msg = "Failed to parse server response.";
          setErrorMsg(msg);
          toast.error(msg, { id: "merge" });
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
        toast.success("PDFs merged successfully!", { id: "merge" });
      } else {
        const msg = "No download link found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "merge" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "An error occurred during merge.";
      setErrorMsg(msg);
      toast.error(msg, { id: "merge" });
    } finally {
      setLoading(false);
    }
  };

  // Direct download
  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "merged.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Download started!");
  };

  return (
    <>
      <div className="convert_box">
        <div className="convert_box_container">
          <div className="convert_box_content">
            <div className="convert_box_titles">
              <h1>Merge PDF Files</h1>
              <p>
                Upload multiple PDF files and merge them into a single document instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload files */}
      <div className="convert_box_btn">
        <div className="convert_box_btn_convert">
          {/* Uploaded files list */}
          {selectedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4><FaClipboardList /> Uploaded Files:</h4>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>
                    {file.name}
                    <button
                      className="remove-file-btn"
                      onClick={() => handleRemoveFile(idx)}
                      title="Remove file"
                    >
                      <FaTimesCircle />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <label htmlFor="file-upload" className="custom-file-upload">
            <FaRegFolderOpen /> Upload PDF Files
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileSelect}
          />

          {/* Merge button */}
          {selectedFiles.length >= 2 && (
            <div className="convert_box_btn">
              <button onClick={handleMerge} disabled={loading}>
                {loading ? "Merging..." : "Merge PDFs"}
              </button>
            </div>
          )}

          {/* Direct download button */}
          {downloadUrl && (
            <div className="download-link">
              <button onClick={handleDirectDownload}>
                <FaDownload /> Download Merged File
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && <p className="error-msg"><FaTimesCircle /> {errorMsg}</p>}
    </>
  );
};

export default Merge;
