import React, { useState } from "react";
import axios from "axios";
import { FaRegFolderOpen, FaClipboardList, FaTimesCircle, FaDownload } from "react-icons/fa";
import toast from "react-hot-toast";
import "../../../css/ConvertTo.css";

const OCR = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // File selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];

    if (file) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf") {
        const msg = "Only .pdf files are allowed";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
      toast.success(`PDF "${file.name}" added successfully`);
    }
  };

  // Remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    toast.success("File removed");
  };

  // Send file to backend for OCR
  const handleOCR = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file for OCR.");
      return;
    }

    setLoading(true);
    setDownloadUrl("");
    setErrorMsg("");
    toast.loading("Processing OCR on your PDF...", { id: "ocr" });

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const res = await axios.post("/api/ocr-pdf", formData, {
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
          toast.error(msg, { id: "ocr" });
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
        toast.success("OCR completed successfully!", { id: "ocr" });
      } else {
        const msg = "No download link found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "ocr" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || "An error occurred during OCR.";
      setErrorMsg(msg);
      toast.error(msg, { id: "ocr" });
    } finally {
      setLoading(false);
    }
  };

  // Direct download
  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "ocr.pdf");
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
              <h1>OCR PDF File</h1>
              <p>
                Upload a PDF file and extract text from it instantly using OCR.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload files */}
      <div className="convert_box_btn">
        <div className="convert_box_btn_convert">
          {/* Uploaded file */}
          {selectedFile && (
            <div className="uploaded-files">
              <h4><FaClipboardList /> Uploaded File:</h4>
              <ul>
                <li>
                  {selectedFile.name}
                  <button
                    className="remove-file-btn"
                    onClick={handleRemoveFile}
                    title="Remove file"
                  >
                    <FaTimesCircle />
                  </button>
                </li>
              </ul>
            </div>
          )}

          <label htmlFor="file-upload" className="custom-file-upload">
            <FaRegFolderOpen /> Upload PDF File
          </label>
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
          />

          {/* OCR button */}
          {selectedFile && (
            <div className="convert_box_btn">
              <button onClick={handleOCR} disabled={loading}>
                {loading ? "Processing OCR..." : "Run OCR"}
              </button>
            </div>
          )}

          {/* Direct download button */}
          {downloadUrl && (
            <div className="download-link">
              <button onClick={handleDirectDownload}>
                <FaDownload /> Download OCR File
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

export default OCR;
