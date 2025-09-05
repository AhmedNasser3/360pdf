import React, { useState } from "react";
import axios from "axios";
import {
  FaRegFolderOpen,
  FaClipboardList,
  FaTimesCircle,
  FaDownload,
} from "react-icons/fa";
import toast from "react-hot-toast";
import "../../../css/ConvertTo.css";

const Archive = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // File selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const invalid = files.filter(
      (file) => file.name.split(".").pop().toLowerCase() !== "pdf"
    );

    if (invalid.length > 0) {
      const msg = "Only .pdf files are allowed";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSelectedFiles(files);
    setErrorMsg("");
    toast.success(`${files.length} PDF file(s) added successfully`);
  };

  // Remove all files
  const handleRemoveFiles = () => {
    setSelectedFiles([]);
    toast.success("Files removed");
  };

  // Send files to backend for Archive
  const handleArchive = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select PDF files to archive.");
      return;
    }

    setLoading(true);
    setDownloadUrl("");
    setErrorMsg("");
    toast.loading("Creating archive...", { id: "archive" });

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files[]", file);
    });

    try {
      const res = await axios.post("/api/create-archive", formData, {
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
          toast.error(msg, { id: "archive" });
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
        toast.success("Archive created successfully!", { id: "archive" });
      } else {
        const msg = "No download link found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "archive" });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || "An error occurred while creating archive.";
      setErrorMsg(msg);
      toast.error(msg, { id: "archive" });
    } finally {
      setLoading(false);
    }
  };

  // Direct download
  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "archive.zip");
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
              <h1>Create Archive (ZIP)</h1>
              <p>
                Upload multiple PDF files and bundle them into a single archive.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload files */}
      <div className="convert_box_btn">
        <div className="convert_box_btn_convert">
          {/* Uploaded files */}
          {selectedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4>
                <FaClipboardList /> Uploaded Files:
              </h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
              <button
                className="remove-file-btn"
                onClick={handleRemoveFiles}
                title="Remove all files"
              >
                <FaTimesCircle /> Remove All
              </button>
            </div>
          )}

          <label htmlFor="file-upload" className="custom-file-upload">
            <FaRegFolderOpen /> Upload PDF Files
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileSelect}
          />

          {/* Archive button */}
          {selectedFiles.length > 0 && (
            <div className="convert_box_btn">
              <button onClick={handleArchive} disabled={loading}>
                {loading ? "Processing..." : "Create Archive"}
              </button>
            </div>
          )}

          {/* Direct download button */}
          {downloadUrl && (
            <div className="download-link">
              <button onClick={handleDirectDownload}>
                <FaDownload /> Download Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <p className="error-msg">
          <FaTimesCircle /> {errorMsg}
        </p>
      )}
    </>
  );
};

export default Archive;
