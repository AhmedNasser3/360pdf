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

const Watermark = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [formValues, setFormValues] = useState({
    font_color: "#000000",
    font_name: "Arial",
    font_align: "center",
    position_vertical: "middle",
    position_horizontal: "center",
    opacity: 50,
    rotation: 0,
  });
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Send file + watermark options to backend
  const handleAddWatermark = async () => {
    if (!selectedFile) {
      toast.error("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setDownloadUrl("");
    setErrorMsg("");
    toast.loading("Adding watermark to your PDF...", { id: "watermark" });

    const formData = new FormData();
    formData.append("pdf", selectedFile);
    Object.keys(formValues).forEach((key) => {
      formData.append(key, formValues[key]);
    });

    try {
      const res = await axios.post("/api/watermark", formData, {
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
          toast.error(msg, { id: "watermark" });
          setLoading(false);
          return;
        }
      }

      if (data && data.download_url) {
        setDownloadUrl(data.download_url);
        toast.success("Watermark added successfully!", { id: "watermark" });
      } else {
        const msg = "No download link found.";
        setErrorMsg(msg);
        toast.error(msg, { id: "watermark" });
      }
    } catch (err) {
      const msg =
        err.response?.data?.error || "An error occurred while adding watermark.";
      setErrorMsg(msg);
      toast.error(msg, { id: "watermark" });
    } finally {
      setLoading(false);
    }
  };

  // Direct download
  const handleDirectDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", "watermarked.pdf");
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
              <h1>Add Watermark to PDF</h1>
              <p>
                Upload a PDF file and customize watermark settings before
                applying.
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
              <h4>
                <FaClipboardList /> Uploaded File:
              </h4>
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

          {/* Watermark options */}
          {selectedFile && (
            <div className="watermark-options">
              <h4>Watermark Settings:</h4>
              <label>
                Font Color:
                <input
                  type="color"
                  name="font_color"
                  value={formValues.font_color}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Font Name:
                <input
                  type="text"
                  name="font_name"
                  value={formValues.font_name}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Font Align:
                <select
                  name="font_align"
                  value={formValues.font_align}
                  onChange={handleInputChange}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
              <label>
                Vertical Position:
                <select
                  name="position_vertical"
                  value={formValues.position_vertical}
                  onChange={handleInputChange}
                >
                  <option value="top">Top</option>
                  <option value="middle">Middle</option>
                  <option value="bottom">Bottom</option>
                </select>
              </label>
              <label>
                Horizontal Position:
                <select
                  name="position_horizontal"
                  value={formValues.position_horizontal}
                  onChange={handleInputChange}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
              <label>
                Opacity (0-100):
                <input
                  type="number"
                  name="opacity"
                  value={formValues.opacity}
                  min="0"
                  max="100"
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Rotation (degrees):
                <input
                  type="number"
                  name="rotation"
                  value={formValues.rotation}
                  onChange={handleInputChange}
                />
              </label>
            </div>
          )}

          {/* Add watermark button */}
          {selectedFile && (
            <div className="convert_box_btn">
              <button onClick={handleAddWatermark} disabled={loading}>
                {loading ? "Processing..." : "Add Watermark"}
              </button>
            </div>
          )}

          {/* Direct download button */}
          {downloadUrl && (
            <div className="download-link">
              <button onClick={handleDirectDownload}>
                <FaDownload /> Download Watermarked File
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

export default Watermark;
